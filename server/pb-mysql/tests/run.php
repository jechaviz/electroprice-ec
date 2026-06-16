<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/PocketbaseMysqlTranslator.php';

use PocketBaseMysqlTranslator\EndpointOptions;
use PocketBaseMysqlTranslator\HttpRequest;
use PocketBaseMysqlTranslator\MysqlExecutor;
use PocketBaseMysqlTranslator\PocketBaseMysqlEndpoint;
use PocketBaseMysqlTranslator\PocketBaseQueryTranslator;
use PocketBaseMysqlTranslator\RecordHydrator;
use PocketBaseMysqlTranslator\SchemaRegistry;
use PocketBaseMysqlTranslator\CollectionSchema;
use PocketBaseMysqlTranslator\MysqlMirrorWriter;
use PocketBaseMysqlTranslator\PocketBaseSqliteSource;
use PocketBaseMysqlTranslator\SqlStatement;

final class ScriptedExecutor implements MysqlExecutor
{
    /** @var list<SqlStatement> */
    public array $allCalls = [];

    /** @var list<SqlStatement> */
    public array $valueCalls = [];

    /** @var list<SqlStatement> */
    public array $executeCalls = [];

    /**
     * @param list<array<string, mixed>> $rows
     */
    public function __construct(
        private array $rows = [],
        private mixed $value = 1,
    ) {
    }

    public function fetchAll(SqlStatement $statement): array
    {
        $this->allCalls[] = $statement;
        return $this->rows;
    }

    public function fetchValue(SqlStatement $statement): mixed
    {
        $this->valueCalls[] = $statement;
        return $this->value;
    }

    public function execute(SqlStatement $statement): void
    {
        $this->executeCalls[] = $statement;
    }
}

final class FailingExecutor implements MysqlExecutor
{
    public function fetchAll(SqlStatement $statement): array
    {
        throw new RuntimeException('database down with secret detail');
    }

    public function fetchValue(SqlStatement $statement): mixed
    {
        throw new RuntimeException('database down with secret detail');
    }

    public function execute(SqlStatement $statement): void
    {
        throw new RuntimeException('database down with secret detail');
    }
}

function assertSameValue(mixed $expected, mixed $actual, string $label): void
{
    if ($expected !== $actual) {
        throw new RuntimeException($label . ' expected ' . var_export($expected, true) . ' got ' . var_export($actual, true));
    }
}

function assertContainsText(string $needle, string $haystack, string $label): void
{
    if (!str_contains($haystack, $needle)) {
        throw new RuntimeException($label . " expected to contain {$needle}");
    }
}

/**
 * @param array<string, mixed> $query
 * @return array{status: int, body: mixed}
 */
function runEndpoint(string $uri, array $query, MysqlExecutor $executor, ?EndpointOptions $options = null): array
{
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = $uri;
    $_GET = $query;
    $resolvedOptions = $options ?? new EndpointOptions();
    $endpoint = new PocketBaseMysqlEndpoint(
        new PocketBaseQueryTranslator(options: $resolvedOptions),
        $executor,
        $resolvedOptions,
    );
    $response = $endpoint->dispatch(new HttpRequest('GET', $uri, $query));

    return [
        'status' => $response->status,
        'body' => $response->payload,
    ];
}

final class CustomSchemaRegistry implements SchemaRegistry
{
    public function forCollection(string $collection): CollectionSchema
    {
        if ($collection === 'public_reviews') {
            return new CollectionSchema('public_reviews', 'pbm_public_reviews', false, ['rating' => 'rating']);
        }
        return (new PocketBaseMysqlTranslator\DefaultSchemaRegistry())->forCollection($collection);
    }
}

$translator = new PocketBaseQueryTranslator();

$compiled = $translator->compileList('products', [
    'page' => '2',
    'perPage' => '24',
    'filter' => 'category = "laptops" && total_stock > 0 && search_text ~ "apc"',
    'sort' => '-best_price,id',
    'fields' => 'id,name,total_stock',
]);
assertContainsText('FROM `pbm_products`', $compiled->rows->sql, 'optimized product table');
assertContainsText('ORDER BY `best_price` DESC, `id` ASC', $compiled->rows->sql, 'product sort');
assertSameValue(['laptops', 0, '%apc%', 24, 24], $compiled->rows->params, 'product params');

$generic = $translator->compileList('reviews', [
    'filter' => "author_id != null && status = 'approved'",
]);
assertContainsText('FROM `pbm_records`', $generic->rows->sql, 'generic table');
assertContainsText('IS NOT NULL', $generic->rows->sql, 'null comparison');
assertSameValue(['reviews', 'approved', 30, 0], $generic->rows->params, 'generic params');

$bounded = (new PocketBaseQueryTranslator(options: new EndpointOptions(maxPerPage: 25)))->compileList('products', [
    'page' => '2',
    'perPage' => '200',
]);
assertSameValue(25, $bounded->perPage, 'max perPage bound');
assertSameValue([25, 25], $bounded->rows->params, 'bounded pagination params');

$custom = (new PocketBaseQueryTranslator(new CustomSchemaRegistry()))->compileList('public_reviews', [
    'filter' => 'rating >= 4',
]);
assertContainsText('FROM `pbm_public_reviews`', $custom->rows->sql, 'custom schema table');
assertSameValue([4, 30, 0], $custom->rows->params, 'custom schema params');

$record = ['id' => 'p1', 'collectionName' => 'products', 'name' => 'Camera', 'total_stock' => 3];
$row = [
    'id' => 'p1',
    'created' => '2026-01-01 00:00:00',
    'updated' => '2026-01-02 00:00:00',
    'data_b64' => base64_encode(json_encode($record)),
];
$response = runEndpoint(
    '/pb/api/collections/products/records',
    ['page' => '1', 'perPage' => '1', 'fields' => 'id,name'],
    new ScriptedExecutor([$row], 1),
    new EndpointOptions(['products'], exposeErrors: false),
);
assertSameValue(200, $response['status'], 'list status');
assertSameValue(1, $response['body']['totalItems'], 'list total');
assertSameValue([['id' => 'p1', 'name' => 'Camera']], $response['body']['items'], 'projected fields');

$forbidden = runEndpoint(
    '/pb/api/collections/users/records',
    [],
    new ScriptedExecutor([], 0),
    new EndpointOptions(['products'], exposeErrors: false),
);
assertSameValue(404, $forbidden['status'], 'forbidden collection status');

$invalid = runEndpoint(
    '/pb/api/collections/products/records',
    ['filter' => 'name = '],
    new ScriptedExecutor([], 0),
    new EndpointOptions(['products'], exposeErrors: false),
);
assertSameValue(400, $invalid['status'], 'invalid query status');
assertSameValue('Invalid query.', $invalid['body']['message'], 'safe invalid query message');

$healthy = runEndpoint(
    '/pb/api/health',
    [],
    new ScriptedExecutor([], 1),
    new EndpointOptions(['products'], exposeErrors: false, source: 'test-source'),
);
assertSameValue(200, $healthy['status'], 'healthy status');
assertSameValue('test-source', $healthy['body']['data']['source'], 'health source');

$unhealthy = runEndpoint(
    '/pb/api/health',
    [],
    new FailingExecutor(),
    new EndpointOptions(['products'], exposeErrors: false, source: 'test-source'),
);
assertSameValue(503, $unhealthy['status'], 'unhealthy status');
assertSameValue('API is unhealthy.', $unhealthy['body']['message'], 'unhealthy message');

$endpoint = new PocketBaseMysqlEndpoint(
    new PocketBaseQueryTranslator(options: new EndpointOptions(['products'])),
    new ScriptedExecutor([$row], 1),
    new EndpointOptions(['products']),
    hydrator: new RecordHydrator(),
);
$withHeaders = $endpoint->dispatch(new HttpRequest('GET', '/pb/api/collections/products/records', ['perPage' => '1']));
assertSameValue(200, $withHeaders->status, 'middleware status');
assertContainsText('GET', $withHeaders->headers['Access-Control-Allow-Methods'], 'cors middleware');
if (!isset($withHeaders->headers['X-PBM-Request-Id'])) {
    throw new RuntimeException('request id middleware did not set X-PBM-Request-Id');
}

$sqlitePath = sys_get_temp_dir() . '/pbm-test-' . bin2hex(random_bytes(4)) . '.db';
$sqlite = new SQLite3($sqlitePath);
$sqlite->exec("CREATE TABLE `_collections` (`id` TEXT PRIMARY KEY, `name` TEXT UNIQUE NOT NULL)");
$sqlite->exec("INSERT INTO `_collections` (`id`, `name`) VALUES ('pbc_products', 'products')");
$sqlite->exec("CREATE TABLE `products` (`id` TEXT PRIMARY KEY, `name` TEXT, `brand` TEXT, `category` TEXT, `image_url` TEXT, `search_text` TEXT, `best_price` NUMERIC, `total_stock` NUMERIC, `is_deal` BOOLEAN, `avg_rating` NUMERIC, `review_count` NUMERIC, `specs` JSON)");
$sqlite->exec("INSERT INTO `products` (`id`, `name`, `brand`, `category`, `image_url`, `search_text`, `best_price`, `total_stock`, `is_deal`, `avg_rating`, `review_count`, `specs`) VALUES ('p1', 'Camera', 'Dahua', 'cameras', 'https://x.test/a.jpg', 'camera dahua', 10.25, 7, 1, 4.5, 3, '{\"mp\":\"8\"}')");
$sqlite->close();

$source = new PocketBaseSqliteSource($sqlitePath);
assertSameValue(1, $source->count('products'), 'sqlite source count');
$sourceRecords = iterator_to_array($source->records('products', 10));
assertSameValue(1, count($sourceRecords), 'sqlite source records');
assertSameValue('p1', $sourceRecords[0]->id, 'sqlite mirror record id');
assertSameValue(true, $sourceRecords[0]->fields['is_deal'], 'sqlite boolean normalization');
assertSameValue(['mp' => '8'], $sourceRecords[0]->fields['specs'], 'sqlite json normalization');

$writerExecutor = new ScriptedExecutor([], 1);
$writer = new MysqlMirrorWriter($writerExecutor);
$writer->ensureSchema();
$writer->beginSnapshot();
$writer->writeRecords($sourceRecords);
if (count($writerExecutor->executeCalls) < 5) {
    throw new RuntimeException('mirror writer did not execute expected schema/stage/insert statements');
}
assertContainsText('pbm_products_stage', $writerExecutor->executeCalls[count($writerExecutor->executeCalls) - 1]->sql, 'products stage insert');

@unlink($sqlitePath);

echo "ok pocketbase-mysql-translator tests\n";
