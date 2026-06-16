<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use RuntimeException;
use SQLite3;

final class PocketBaseSqliteSource
{
    private SQLite3 $db;

    public function __construct(private readonly string $path)
    {
        if (!is_file($path)) {
            throw new RuntimeException("PocketBase SQLite database not found: {$path}");
        }
        $this->db = new SQLite3($path, SQLITE3_OPEN_READONLY);
        $this->db->busyTimeout(5000);
    }

    public function collectionId(string $collection): string
    {
        $stmt = $this->db->prepare('SELECT id FROM `_collections` WHERE name = :name LIMIT 1');
        $stmt->bindValue(':name', $collection, SQLITE3_TEXT);
        $row = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        return is_array($row) && isset($row['id']) ? (string) $row['id'] : '';
    }

    public function count(string $collection): int
    {
        $this->assertIdentifier($collection);
        $row = $this->db->querySingle('SELECT COUNT(*) AS total FROM `' . $collection . '`', true);
        return (int) ($row['total'] ?? 0);
    }

    /**
     * @return list<array{name: string, type: string}>
     */
    public function columns(string $collection): array
    {
        $this->assertIdentifier($collection);
        $result = $this->db->query('PRAGMA table_info(`' . $collection . '`)');
        $columns = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $columns[] = ['name' => (string) $row['name'], 'type' => strtoupper((string) $row['type'])];
        }
        if ($columns === []) {
            throw new RuntimeException("Collection table not found in SQLite: {$collection}");
        }
        return $columns;
    }

    /**
     * @return iterable<MirrorRecord>
     */
    public function records(string $collection, int $batchSize): iterable
    {
        $this->assertIdentifier($collection);
        $columns = $this->columns($collection);
        $collectionId = $this->collectionId($collection);
        $lastId = '';

        while (true) {
            $stmt = $this->db->prepare('SELECT * FROM `' . $collection . '` WHERE id > :last ORDER BY id LIMIT :limit');
            $stmt->bindValue(':last', $lastId, SQLITE3_TEXT);
            $stmt->bindValue(':limit', $batchSize, SQLITE3_INTEGER);
            $result = $stmt->execute();
            $batchCount = 0;
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $batchCount++;
                $lastId = (string) $row['id'];
                yield $this->toMirrorRecord($collection, $collectionId, $columns, $row);
            }
            if ($batchCount === 0) {
                return;
            }
        }
    }

    /**
     * @param list<array{name: string, type: string}> $columns
     * @param array<string, mixed> $row
     */
    private function toMirrorRecord(string $collection, string $collectionId, array $columns, array $row): MirrorRecord
    {
        $record = [
            'collectionId' => $collectionId,
            'collectionName' => $collection,
        ];

        foreach ($columns as $column) {
            $name = $column['name'];
            $record[$name] = $this->normalizeValue($row[$name] ?? null, $column['type']);
        }

        $dataJson = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (!is_string($dataJson)) {
            throw new RuntimeException("Unable to encode record {$collection}/{$row['id']} as JSON.");
        }

        return new MirrorRecord(
            $collection,
            (string) $row['id'],
            $this->normalizeDateTime($row['created'] ?? null),
            $this->normalizeDateTime($row['updated'] ?? null),
            $dataJson,
            $record,
        );
    }

    private function normalizeValue(mixed $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }
        if (str_contains($type, 'JSON')) {
            if ($value === '') {
                return null;
            }
            $decoded = json_decode((string) $value, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
        }
        if (str_contains($type, 'BOOL')) {
            return (bool) $value;
        }
        if (str_contains($type, 'NUMERIC') || str_contains($type, 'REAL') || str_contains($type, 'INT')) {
            if (is_numeric($value)) {
                return ((string) (int) $value === (string) $value) ? (int) $value : (float) $value;
            }
        }
        return $value;
    }

    private function normalizeDateTime(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }
        $value = str_replace('T', ' ', trim($value));
        return rtrim($value, 'Z');
    }

    private function assertIdentifier(string $identifier): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $identifier)) {
            throw new RuntimeException("Unsafe SQLite identifier {$identifier}.");
        }
    }
}
