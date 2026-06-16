<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class PocketBaseQueryTranslator
{
    public const VERSION = '0.4.0';
    private const ROW_COLUMNS = ['id', 'created', 'updated', 'data_b64'];
    private const COUNT_COLUMNS = ['total'];

    public function __construct(
        private readonly SchemaRegistry $schemas = new DefaultSchemaRegistry(),
        private readonly FilterCompiler $filterCompiler = new FilterCompiler(),
        private readonly SortCompiler $sortCompiler = new SortCompiler(),
        private readonly FieldListParser $fieldListParser = new FieldListParser(),
        private readonly EndpointOptions $options = new EndpointOptions(),
    ) {
    }

    /**
     * @param array<string, mixed> $query
     */
    public function compileList(string $collection, array $query): QueryPlan
    {
        $page = $this->positiveInt($query['page'] ?? 1, 1, 1, $this->options->maxPage);
        $perPage = $this->positiveInt($query['perPage'] ?? $this->options->defaultPerPage, $this->options->defaultPerPage, 1, $this->options->maxPerPage);
        $skipTotal = Env::truthy($query['skipTotal'] ?? false);
        $offset = ($page - 1) * $perPage;
        $fields = $this->fieldListParser->parse($query['fields'] ?? null);
        $schema = $this->schemas->forCollection($collection);

        $where = [];
        $params = [];
        if ($schema->requiresCollectionPredicate) {
            $where[] = '`collection` = ?';
            $params[] = $collection;
        }

        $filter = trim((string) ($query['filter'] ?? ''));
        if ($filter !== '') {
            $compiled = $this->filterCompiler->compile((new FilterParser($filter))->parse(), $schema);
            if ($compiled['sql'] !== '') {
                $where[] = $compiled['sql'];
                $params = array_merge($params, $compiled['params']);
            }
        }

        $whereSql = $where === [] ? '' : (' WHERE ' . implode(' AND ', array_map(fn ($item) => "({$item})", $where)));
        $orderSql = $this->sortCompiler->compile((string) ($query['sort'] ?? ''), $schema);
        $rowParams = array_merge($params, [$perPage, $offset]);

        return new QueryPlan(
            new SqlStatement(
                "SELECT `id`, `created`, `updated`, REPLACE(REPLACE(TO_BASE64(`data`), CHAR(10), ''), CHAR(13), '') AS `data_b64` FROM {$schema->tableSql()}{$whereSql}{$orderSql} LIMIT ? OFFSET ?",
                $rowParams,
                self::ROW_COLUMNS,
            ),
            $skipTotal ? null : new SqlStatement(
                "SELECT COUNT(*) AS `total` FROM {$schema->tableSql()}{$whereSql}",
                $params,
                self::COUNT_COLUMNS,
            ),
            $page,
            $perPage,
            $fields,
            $collection,
        );
    }

    /**
     * @param array<string, mixed> $query
     */
    public function compileOne(string $collection, string $id, array $query = []): OneQueryPlan
    {
        $schema = $this->schemas->forCollection($collection);
        $where = ['`id` = ?'];
        $params = [$id];
        if ($schema->requiresCollectionPredicate) {
            array_unshift($where, '`collection` = ?');
            array_unshift($params, $collection);
        }

        return new OneQueryPlan(
            new SqlStatement(
                "SELECT `id`, `created`, `updated`, REPLACE(REPLACE(TO_BASE64(`data`), CHAR(10), ''), CHAR(13), '') AS `data_b64` FROM {$schema->tableSql()} WHERE "
                . implode(' AND ', array_map(fn ($item) => "({$item})", $where))
                . ' LIMIT 1',
                $params,
                self::ROW_COLUMNS,
            ),
            $this->fieldListParser->parse($query['fields'] ?? null),
            $collection,
        );
    }

    /**
     * Backward-compatible record hydration facade.
     *
     * @param array<string, mixed> $row
     * @param ?list<string> $fields
     * @return array<string, mixed>
     */
    public function hydrateRow(array $row, string $collection, ?array $fields): array
    {
        return (new RecordHydrator())->hydrate($row, $collection, $fields);
    }

    private function positiveInt(mixed $value, int $default, int $min, int $max): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT);
        if ($int === false) {
            return $default;
        }
        return max($min, min($max, $int));
    }
}
