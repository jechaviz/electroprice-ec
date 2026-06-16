<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use RuntimeException;

final class MirrorOptions
{
    /**
     * @param list<string> $collections
     */
    public function __construct(
        public readonly string $sqlitePath,
        public readonly string $mysqlEnvPath,
        public readonly array $collections = ['products'],
        public readonly int $batchSize = 50,
        public readonly bool $dryRun = false,
        public readonly string $source = 'pb-sqlite',
        public readonly ?string $lockFile = null,
        public readonly int $maxAgeSeconds = 3600,
    ) {
    }

    /**
     * @param list<string> $argv
     */
    public static function fromArgv(array $argv): self
    {
        $args = self::parseArgs($argv);
        $sqlite = $args['sqlite'] ?? Env::get('PBM_SQLITE_DB');
        $mysqlEnv = $args['mysql-env'] ?? Env::get('PBM_MYSQL_ENV');
        if (!$sqlite) {
            throw new RuntimeException('Missing --sqlite or PBM_SQLITE_DB.');
        }
        if (!$mysqlEnv) {
            throw new RuntimeException('Missing --mysql-env or PBM_MYSQL_ENV.');
        }

        $collections = Env::parseIdentifierList((string) ($args['collections'] ?? Env::get('PBM_SYNC_COLLECTIONS', 'products')));
        if ($collections === []) {
            $collections = ['products'];
        }

        return new self(
            $sqlite,
            $mysqlEnv,
            $collections,
            self::boundedInt($args['batch-size'] ?? Env::get('PBM_SYNC_BATCH_SIZE', '50'), 50, 1, 500),
            array_key_exists('dry-run', $args) || Env::truthy(Env::get('PBM_SYNC_DRY_RUN', 'false')),
            (string) ($args['source'] ?? Env::get('PBM_SYNC_SOURCE', 'pb-sqlite')),
            $args['lock-file'] ?? Env::get('PBM_SYNC_LOCK_FILE'),
            self::boundedInt($args['max-age-seconds'] ?? Env::get('PBM_MAX_MIRROR_AGE_SECONDS', '3600'), 3600, 1, 31536000),
        );
    }

    /**
     * @param list<string> $argv
     * @return array<string, string|bool>
     */
    public static function parseArgs(array $argv): array
    {
        $args = [];
        foreach (array_slice($argv, 1) as $arg) {
            if (!str_starts_with($arg, '--')) {
                continue;
            }
            $arg = substr($arg, 2);
            if (str_contains($arg, '=')) {
                [$key, $value] = explode('=', $arg, 2);
                $args[$key] = $value;
            } else {
                $args[$arg] = true;
            }
        }
        return $args;
    }

    private static function boundedInt(mixed $value, int $default, int $min, int $max): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT);
        if ($int === false) {
            return $default;
        }
        return max($min, min($max, $int));
    }
}
