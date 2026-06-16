<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

interface MysqlExecutor
{
    /**
     * @return list<array<string, mixed>>
     */
    public function fetchAll(SqlStatement $statement): array;

    public function fetchValue(SqlStatement $statement): mixed;

    public function execute(SqlStatement $statement): void;
}
