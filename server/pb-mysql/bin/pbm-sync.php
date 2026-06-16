#!/usr/bin/env php
<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/PocketbaseMysqlTranslator.php';

use PocketBaseMysqlTranslator\MirrorCli;

// Resolve argv defensively: under a non-CLI SAPI the top-level $argv is not
// auto-populated, which previously caused a TypeError (null given) and a 500.
$cliArgv = $GLOBALS['argv'] ?? ($_SERVER['argv'] ?? []);

exit((new MirrorCli())->run($cliArgv));
