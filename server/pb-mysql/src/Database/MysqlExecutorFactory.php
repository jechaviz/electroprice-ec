<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class MysqlExecutorFactory
{
    public function create(MysqlConfig $config): MysqlExecutor
    {
        return PdoMysqlExecutor::isAvailable()
            ? new PdoMysqlExecutor($config)
            : new CliMysqlExecutor($config);
    }
}
