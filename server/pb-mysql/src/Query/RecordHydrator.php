<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class RecordHydrator
{
    /**
     * @param array<string, mixed> $row
     * @param ?list<string> $fields
     * @return array<string, mixed>
     */
    public function hydrate(array $row, string $collection, ?array $fields): array
    {
        $json = base64_decode((string) ($row['data_b64'] ?? ''), true);
        $record = $json === false || $json === '' ? [] : (json_decode($json, true) ?: []);
        if (!is_array($record)) {
            $record = [];
        }

        $record['id'] = $record['id'] ?? (string) ($row['id'] ?? '');
        if (!isset($record['created']) && ($row['created'] ?? null)) {
            $record['created'] = $row['created'];
        }
        if (!isset($record['updated']) && ($row['updated'] ?? null)) {
            $record['updated'] = $row['updated'];
        }
        $record['collectionName'] = $record['collectionName'] ?? $collection;

        if ($fields === null) {
            return $record;
        }

        $projected = [];
        foreach ($fields as $field) {
            if (array_key_exists($field, $record)) {
                $projected[$field] = $record[$field];
            }
        }
        return $projected;
    }
}
