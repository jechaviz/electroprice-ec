<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use Throwable;

final class MirrorCli
{
    /**
     * @param list<string> $argv
     */
    public function run(array $argv): int
    {
        try {
            $rawCommand = $argv[1] ?? 'sync';
            $command = str_starts_with($rawCommand, '--') ? 'sync' : $rawCommand;
            $argvForOptions = ($argv[1] ?? null) === $command && ($command === 'sync' || $command === 'status')
                ? array_merge([$argv[0]], array_slice($argv, 2))
                : $argv;
            $options = MirrorOptions::fromArgv($argvForOptions);
            $config = MysqlConfig::fromEnvFile($options->mysqlEnvPath);
            $executor = (new MysqlExecutorFactory())->create($config);
            $writer = new MysqlMirrorWriter($executor);

            if ($command === 'status') {
                $writer->ensureSchema();
                $status = (new MirrorFreshnessChecker($writer))->status($options->maxAgeSeconds);
                echo json_encode($status, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
                return $status['fresh'] ? 0 : 2;
            }

            if ($command !== 'sync') {
                fwrite(STDERR, "Usage: php bin/pbm-sync.php [sync|status] --sqlite=/path/data.db --mysql-env=/path/mysql.env [--collections=products] [--batch-size=50] [--dry-run]\n");
                return 64;
            }

            $source = new PocketBaseSqliteSource($options->sqlitePath);
            $result = (new MirrorSyncService($source, $writer))->sync($options);
            echo json_encode($result->toArray(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
            return 0;
        } catch (Throwable $error) {
            fwrite(STDERR, 'pbm-sync error: ' . $error->getMessage() . "\n");
            return 1;
        }
    }
}
