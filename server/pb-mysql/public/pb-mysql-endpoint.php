<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/PocketbaseMysqlTranslator.php';

use PocketBaseMysqlTranslator\EndpointOptions;
use PocketBaseMysqlTranslator\MysqlConfig;
use PocketBaseMysqlTranslator\MysqlExecutorFactory;
use PocketBaseMysqlTranslator\PocketBaseMysqlEndpoint;
use PocketBaseMysqlTranslator\PocketBaseQueryTranslator;

$envFile = getenv('PBM_MYSQL_ENV') ?: (__DIR__ . '/../mysql.env');
$options = EndpointOptions::fromEnv();
$config = MysqlConfig::fromEnvFile($envFile);
$translator = new PocketBaseQueryTranslator(options: $options);
$executor = (new MysqlExecutorFactory())->create($config);

$endpoint = new PocketBaseMysqlEndpoint($translator, $executor, $options);
$endpoint->handle();
