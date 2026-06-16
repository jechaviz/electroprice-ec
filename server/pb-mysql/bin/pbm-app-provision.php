#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * Provision the app-owned (MySQL-authoritative) storage used by the endpoint
 * for collections that are NOT mirrored from PocketBase (users, orders,
 * reviews, telemetry). This table is deliberately separate from `pbm_records`
 * so the catalog mirror's full-replace swap can never wipe user-generated data.
 *
 * Usage: pbm-app-provision.php <mysql-env-file>   (or set PBM_MYSQL_ENV)
 */

require_once __DIR__ . '/../src/PocketbaseMysqlTranslator.php';

use PocketBaseMysqlTranslator\MysqlConfig;
use PocketBaseMysqlTranslator\MysqlExecutorFactory;
use PocketBaseMysqlTranslator\SqlStatement;

$argvList = $GLOBALS['argv'] ?? ($_SERVER['argv'] ?? []);
$envPath = getenv('PBM_MYSQL_ENV') ?: ($argvList[1] ?? '');
if ($envPath === '') {
    fwrite(STDERR, "pbm-app-provision: provide a mysql env file (arg or PBM_MYSQL_ENV)\n");
    exit(1);
}

$config = MysqlConfig::fromEnvFile($envPath);
$executor = (new MysqlExecutorFactory())->create($config);

$executor->execute(new SqlStatement(
    "CREATE TABLE IF NOT EXISTS `app_records` (
        `collection` varchar(128) NOT NULL,
        `id` varchar(191) NOT NULL,
        `created` datetime(3) NULL,
        `updated` datetime(3) NULL,
        `data` longtext NOT NULL,
        PRIMARY KEY (`collection`, `id`),
        KEY `idx_app_records_collection` (`collection`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
));

fwrite(STDOUT, "app_records ensured\n");
