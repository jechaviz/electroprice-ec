<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class SqlStatement
{
    /**
     * @param list<mixed> $params
     * @param list<string> $columns
     */
    public function __construct(
        public readonly string $sql,
        public readonly array $params = [],
        public readonly array $columns = [],
    ) {
    }
}
