<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use RuntimeException;

final class CliMysqlExecutor implements MysqlExecutor
{
    public function __construct(private readonly MysqlConfig $config)
    {
    }

    public function fetchAll(SqlStatement $statement): array
    {
        $output = $this->run($statement);
        if (trim($output) === '') {
            return [];
        }

        $rows = [];
        foreach (preg_split('/\r?\n/', rtrim($output)) ?: [] as $line) {
            $values = explode("\t", $line);
            $row = [];
            foreach ($statement->columns as $index => $column) {
                $value = $values[$index] ?? null;
                $row[$column] = $value === '\\N' ? null : $value;
            }
            $rows[] = $row;
        }
        return $rows;
    }

    public function fetchValue(SqlStatement $statement): mixed
    {
        $rows = $this->fetchAll($statement);
        if ($rows === []) {
            return null;
        }
        return reset($rows[0]);
    }

    public function execute(SqlStatement $statement): void
    {
        $this->run($statement);
    }

    private function run(SqlStatement $statement): string
    {
        $sql = $this->inlineParams($statement->sql, $statement->params);
        $command = implode(' ', [
            escapeshellarg($this->config->binary),
            '--batch',
            '--raw',
            '--silent',
            '--skip-column-names',
            '--default-character-set=utf8mb4',
            '--host=' . escapeshellarg($this->config->host),
            '--user=' . escapeshellarg($this->config->user),
            '--database=' . escapeshellarg($this->config->database),
        ]);

        $process = proc_open($command, [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ], $pipes, null, ['MYSQL_PWD' => $this->config->password]);

        if (!is_resource($process)) {
            throw new RuntimeException('Unable to start mariadb client.');
        }

        fwrite($pipes[0], $sql);
        fwrite($pipes[0], "\n");
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]) ?: '';
        $stderr = stream_get_contents($pipes[2]) ?: '';
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        if ($status !== 0) {
            throw new RuntimeException(trim($stderr) ?: 'mariadb client failed.');
        }

        return $stdout;
    }

    /**
     * @param list<mixed> $params
     */
    private function inlineParams(string $sql, array $params): string
    {
        $index = 0;
        $result = '';
        $length = strlen($sql);
        for ($i = 0; $i < $length; $i++) {
            if ($sql[$i] !== '?') {
                $result .= $sql[$i];
                continue;
            }
            if (!array_key_exists($index, $params)) {
                throw new RuntimeException('SQL placeholder count exceeds provided parameters.');
            }
            $result .= $this->quote($params[$index]);
            $index++;
        }
        if ($index !== count($params)) {
            throw new RuntimeException('SQL parameter count exceeds placeholders.');
        }
        return $result;
    }

    private function quote(mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }
        $string = str_replace(
            ["\\", "\0", "\n", "\r", "'", "\x1a"],
            ["\\\\", "\\0", "\\n", "\\r", "\\'", "\\Z"],
            (string) $value,
        );
        return "'{$string}'";
    }
}
