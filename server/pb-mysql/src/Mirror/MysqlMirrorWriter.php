<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use RuntimeException;

final class MysqlMirrorWriter
{
    private const PRODUCTS_TABLE = 'pbm_products';
    private const RECORDS_TABLE = 'pbm_records';
    private const METADATA_TABLE = 'pbm_metadata';
    private const PRODUCTS_STAGE = 'pbm_products_stage';
    private const RECORDS_STAGE = 'pbm_records_stage';

    public function __construct(private readonly MysqlExecutor $executor)
    {
    }

    public function ensureSchema(): void
    {
        $this->executor->execute(new SqlStatement(
            "CREATE TABLE IF NOT EXISTS `pbm_metadata` (
                `name` varchar(128) NOT NULL,
                `value_text` text NULL,
                `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (`name`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        ));
        $this->executor->execute(new SqlStatement(
            "CREATE TABLE IF NOT EXISTS `pbm_records` (
                `collection` varchar(128) NOT NULL,
                `id` varchar(191) NOT NULL,
                `created` datetime(3) NULL,
                `updated` datetime(3) NULL,
                `data` longtext NOT NULL,
                PRIMARY KEY (`collection`, `id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        ));
        $this->executor->execute(new SqlStatement(
            "CREATE TABLE IF NOT EXISTS `pbm_products` (
                `id` varchar(191) NOT NULL,
                `created` datetime(3) NULL,
                `updated` datetime(3) NULL,
                `name` text NOT NULL,
                `brand` varchar(191) NULL,
                `category` varchar(191) NULL,
                `image_url` text NULL,
                `search_text` text NULL,
                `best_price` decimal(18,6) NULL,
                `total_stock` int NOT NULL DEFAULT 0,
                `is_deal` tinyint(1) NOT NULL DEFAULT 0,
                `avg_rating` decimal(8,4) NULL,
                `review_count` int NOT NULL DEFAULT 0,
                `data` longtext NOT NULL,
                PRIMARY KEY (`id`),
                KEY `idx_pbm_products_name` (`name`(191)),
                KEY `idx_pbm_products_category` (`category`),
                KEY `idx_pbm_products_total_stock` (`total_stock`),
                KEY `idx_pbm_products_best_price` (`best_price`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        ));
    }

    public function beginSnapshot(): void
    {
        foreach ([self::PRODUCTS_STAGE, self::RECORDS_STAGE] as $stage) {
            $this->executor->execute(new SqlStatement('DROP TABLE IF EXISTS `' . $stage . '`'));
        }
        $this->executor->execute(new SqlStatement('CREATE TABLE `' . self::PRODUCTS_STAGE . '` LIKE `' . self::PRODUCTS_TABLE . '`'));
        $this->executor->execute(new SqlStatement('CREATE TABLE `' . self::RECORDS_STAGE . '` LIKE `' . self::RECORDS_TABLE . '`'));
    }

    /**
     * @param list<MirrorRecord> $records
     */
    public function writeRecords(array $records): void
    {
        if ($records === []) {
            return;
        }
        $this->insertRecordsStage($records);
        $products = array_values(array_filter($records, fn (MirrorRecord $record) => $record->collection === 'products'));
        if ($products !== []) {
            $this->insertProductsStage($products);
        }
    }

    /**
     * @param array<string, int> $sourceCounts
     */
    public function validateStageCounts(array $sourceCounts): void
    {
        $recordTotal = array_sum($sourceCounts);
        $stageRecords = (int) $this->executor->fetchValue(new SqlStatement('SELECT COUNT(*) AS `total` FROM `' . self::RECORDS_STAGE . '`', [], ['total']));
        if ($stageRecords !== $recordTotal) {
            throw new RuntimeException("Stage records count mismatch: expected {$recordTotal}, got {$stageRecords}.");
        }
        if (isset($sourceCounts['products'])) {
            $stageProducts = (int) $this->executor->fetchValue(new SqlStatement('SELECT COUNT(*) AS `total` FROM `' . self::PRODUCTS_STAGE . '`', [], ['total']));
            if ($stageProducts !== $sourceCounts['products']) {
                throw new RuntimeException("Stage products count mismatch: expected {$sourceCounts['products']}, got {$stageProducts}.");
            }
        }
    }

    public function swapSnapshot(): void
    {
        $this->executor->execute(new SqlStatement('DROP TABLE IF EXISTS `pbm_products_old`, `pbm_records_old`'));
        $this->executor->execute(new SqlStatement(
            'RENAME TABLE `pbm_products` TO `pbm_products_old`, `pbm_products_stage` TO `pbm_products`, `pbm_records` TO `pbm_records_old`, `pbm_records_stage` TO `pbm_records`'
        ));
        $this->executor->execute(new SqlStatement('DROP TABLE IF EXISTS `pbm_products_old`, `pbm_records_old`'));
    }

    /**
     * @param array<string, string|int|bool> $metadata
     */
    public function updateMetadata(array $metadata): void
    {
        foreach ($metadata as $name => $value) {
            $this->executor->execute(new SqlStatement(
                'INSERT INTO `' . self::METADATA_TABLE . '` (`name`, `value_text`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value_text` = VALUES(`value_text`)',
                [$name, (string) $value],
            ));
        }
    }

    /**
     * @return array<string, string>
     */
    public function metadata(): array
    {
        $rows = $this->executor->fetchAll(new SqlStatement(
            'SELECT `name`, `value_text` FROM `' . self::METADATA_TABLE . '`',
            [],
            ['name', 'value_text'],
        ));
        $metadata = [];
        foreach ($rows as $row) {
            $metadata[(string) $row['name']] = (string) ($row['value_text'] ?? '');
        }
        return $metadata;
    }

    /**
     * @return array<string, int>
     */
    public function hotCounts(): array
    {
        return [
            'pbm_products' => (int) $this->executor->fetchValue(new SqlStatement('SELECT COUNT(*) AS `total` FROM `pbm_products`', [], ['total'])),
            'pbm_records' => (int) $this->executor->fetchValue(new SqlStatement('SELECT COUNT(*) AS `total` FROM `pbm_records`', [], ['total'])),
        ];
    }

    /**
     * @param list<MirrorRecord> $records
     */
    private function insertRecordsStage(array $records): void
    {
        $params = [];
        $values = [];
        foreach ($records as $record) {
            $values[] = '(?, ?, ?, ?, ?)';
            array_push($params, $record->collection, $record->id, $record->created, $record->updated, $record->dataJson);
        }
        $this->executor->execute(new SqlStatement(
            'INSERT INTO `' . self::RECORDS_STAGE . '` (`collection`, `id`, `created`, `updated`, `data`) VALUES '
            . implode(', ', $values)
            . ' ON DUPLICATE KEY UPDATE `created` = VALUES(`created`), `updated` = VALUES(`updated`), `data` = VALUES(`data`)',
            $params,
        ));
    }

    /**
     * @param list<MirrorRecord> $records
     */
    private function insertProductsStage(array $records): void
    {
        $params = [];
        $values = [];
        foreach ($records as $record) {
            $fields = $record->fields;
            $values[] = '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            array_push(
                $params,
                $record->id,
                $record->created,
                $record->updated,
                (string) ($fields['name'] ?? ''),
                $this->truncateNullable($fields['brand'] ?? null, 191),
                $this->truncateNullable($fields['category'] ?? null, 191),
                $fields['image_url'] ?? null,
                $fields['search_text'] ?? null,
                $this->numericOrNull($fields['best_price'] ?? null),
                (int) ($fields['total_stock'] ?? 0),
                !empty($fields['is_deal']) ? 1 : 0,
                $this->numericOrNull($fields['avg_rating'] ?? null),
                (int) ($fields['review_count'] ?? 0),
                $record->dataJson,
            );
        }

        $this->executor->execute(new SqlStatement(
            'INSERT INTO `' . self::PRODUCTS_STAGE . '` (`id`, `created`, `updated`, `name`, `brand`, `category`, `image_url`, `search_text`, `best_price`, `total_stock`, `is_deal`, `avg_rating`, `review_count`, `data`) VALUES '
            . implode(', ', $values)
            . ' ON DUPLICATE KEY UPDATE `data` = VALUES(`data`)',
            $params,
        ));
    }

    private function truncateNullable(mixed $value, int $length): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        return substr((string) $value, 0, $length);
    }

    private function numericOrNull(mixed $value): int|float|null
    {
        return is_numeric($value) ? $value + 0 : null;
    }
}
