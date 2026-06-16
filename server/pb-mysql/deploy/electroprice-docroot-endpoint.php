<?php
declare(strict_types=1);

putenv('PBM_MYSQL_ENV=/home/agingriouh/apps/electroprice/shared/env/mysql.env');
putenv('PBM_ALLOWED_COLLECTIONS=products');
putenv('PBM_SOURCE=electroprice-mysql-catalog');
putenv('PBM_MAX_MIRROR_AGE_SECONDS=3600');

require_once '/home/agingriouh/apps/electroprice/shared/lib/pocketbase-mysql-translator/src/PocketbaseMysqlTranslator.php';

use PocketBaseMysqlTranslator\EndpointOptions;
use PocketBaseMysqlTranslator\MysqlConfig;
use PocketBaseMysqlTranslator\MysqlExecutorFactory;
use PocketBaseMysqlTranslator\PocketBaseMysqlEndpoint;
use PocketBaseMysqlTranslator\PocketBaseQueryTranslator;

$options = EndpointOptions::fromEnv();
$config = MysqlConfig::fromEnvFile(getenv('PBM_MYSQL_ENV'));
$executor = (new MysqlExecutorFactory())->create($config);
$endpoint = new PocketBaseMysqlEndpoint(new PocketBaseQueryTranslator(options: $options), $executor, $options);
$endpoint->handle();
