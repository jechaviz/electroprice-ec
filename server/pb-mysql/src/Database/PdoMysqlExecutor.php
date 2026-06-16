<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class PdoMysqlExecutor implements MysqlExecutor
{
    private \PDO $pdo;

    public static function isAvailable(): bool
    {
        return class_exists(\PDO::class) && in_array('mysql', \PDO::getAvailableDrivers(), true);
    }

    public function __construct(MysqlConfig $config)
    {
        $dsn = "mysql:host={$config->host};dbname={$config->database};charset=utf8mb4";
        $this->pdo = new \PDO($dsn, $config->user, $config->password, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);
    }

    public function fetchAll(SqlStatement $statement): array
    {
        $query = $this->pdo->prepare($statement->sql);
        $query->execute($statement->params);
        return $query->fetchAll();
    }

    public function fetchValue(SqlStatement $statement): mixed
    {
        $query = $this->pdo->prepare($statement->sql);
        $query->execute($statement->params);
        return $query->fetchColumn();
    }

    public function execute(SqlStatement $statement): void
    {
        $query = $this->pdo->prepare($statement->sql);
        $query->execute($statement->params);
    }
}
