<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class QueryPlan
{
    /**
     * @param ?list<string> $fields
     */
    public function __construct(
        public readonly SqlStatement $rows,
        public readonly ?SqlStatement $count,
        public readonly int $page,
        public readonly int $perPage,
        public readonly ?array $fields,
        public readonly string $collection,
    ) {
    }
}
