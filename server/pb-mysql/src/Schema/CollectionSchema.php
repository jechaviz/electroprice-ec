<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class CollectionSchema
{
    /**
     * @param array<string, string> $columns
     */
    public function __construct(
        public readonly string $collection,
        public readonly string $table,
        public readonly bool $requiresCollectionPredicate,
        private readonly array $columns = [],
    ) {
    }

    public function tableSql(): string
    {
        return self::quoteIdentifier($this->table);
    }

    public function fieldExpression(string $field, string $valueType): string
    {
        if (isset($this->columns[$field])) {
            return self::quoteIdentifier($this->columns[$field]);
        }
        if (in_array($field, ['id', 'created', 'updated'], true)) {
            return self::quoteIdentifier($field);
        }
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/', $field)) {
            throw new QueryTranslationException("Unsafe JSON field path {$field}.");
        }

        $path = '$.' . implode('.', array_map(fn ($part) => '"' . $part . '"', explode('.', $field)));
        $json = "JSON_UNQUOTE(JSON_EXTRACT(`data`, '{$path}'))";
        if ($valueType === 'bool') {
            return "CASE WHEN {$json} IN ('true', '1') THEN 1 ELSE 0 END";
        }
        return $json;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $identifier)) {
            throw new QueryTranslationException("Unsafe SQL identifier {$identifier}.");
        }
        return "`{$identifier}`";
    }
}
