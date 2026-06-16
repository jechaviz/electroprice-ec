<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use RuntimeException;

final class MysqlConfig
{
    public function __construct(
        public readonly string $host,
        public readonly string $database,
        public readonly string $user,
        public readonly string $password,
        public readonly string $binary = '/usr/bin/mariadb',
    ) {
    }

    public static function fromEnvFile(string $path): self
    {
        $values = Env::readEnvFile($path);
        foreach (['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_BINARY'] as $key) {
            $envValue = Env::get($key);
            if ($envValue !== null) {
                $values[$key] = $envValue;
            }
        }

        foreach (['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD'] as $key) {
            if (!isset($values[$key]) || $values[$key] === '') {
                throw new RuntimeException("Missing {$key} for PocketBase MySQL translator.");
            }
        }

        return new self(
            $values['MYSQL_HOST'],
            $values['MYSQL_DATABASE'],
            $values['MYSQL_USER'],
            $values['MYSQL_PASSWORD'],
            $values['MYSQL_BINARY'] ?? '/usr/bin/mariadb',
        );
    }
}
