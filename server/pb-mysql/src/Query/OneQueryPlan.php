<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class OneQueryPlan
{
    /**
     * @param ?list<string> $fields
     */
    public function __construct(
        public readonly SqlStatement $row,
        public readonly ?array $fields,
        public readonly string $collection,
    ) {
    }
}
