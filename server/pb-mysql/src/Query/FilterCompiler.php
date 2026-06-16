<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class FilterCompiler
{
    /**
     * @param array<string, mixed> $node
     * @return array{sql: string, params: list<mixed>}
     */
    public function compile(array $node, CollectionSchema $schema): array
    {
        if ($node['type'] === 'logical') {
            $left = $this->compile($node['left'], $schema);
            $right = $this->compile($node['right'], $schema);
            $op = $node['op'] === 'AND' ? 'AND' : 'OR';
            return [
                'sql' => "({$left['sql']} {$op} {$right['sql']})",
                'params' => array_merge($left['params'], $right['params']),
            ];
        }

        if ($node['type'] !== 'comparison') {
            throw new QueryTranslationException('Unsupported filter node.');
        }

        return $this->compileComparison($node['field'], $node['op'], $node['value'], $schema);
    }

    /**
     * @param array{type: string, value: mixed} $value
     * @return array{sql: string, params: list<mixed>}
     */
    private function compileComparison(string $field, string $op, array $value, CollectionSchema $schema): array
    {
        $expression = $schema->fieldExpression($field, $value['type']);
        $raw = $value['value'];

        if ($value['type'] === 'null') {
            if ($op === '=') {
                return ['sql' => "{$expression} IS NULL", 'params' => []];
            }
            if ($op === '!=') {
                return ['sql' => "{$expression} IS NOT NULL", 'params' => []];
            }
            throw new QueryTranslationException('Null can only be compared with = or !=.');
        }

        if ($op === '~' || $op === '!~') {
            $sql = "LOWER(COALESCE(CAST({$expression} AS CHAR), '')) " . ($op === '!~' ? 'NOT LIKE' : 'LIKE') . ' ?';
            return ['sql' => $sql, 'params' => ['%' . strtolower((string) $raw) . '%']];
        }

        $sqlOp = match ($op) {
            '=' => '=',
            '!=' => '<>',
            '>' => '>',
            '>=' => '>=',
            '<' => '<',
            '<=' => '<=',
            default => throw new QueryTranslationException("Unsupported filter operator {$op}."),
        };

        if ($value['type'] === 'bool') {
            return ['sql' => "({$expression}) {$sqlOp} ?", 'params' => [$raw ? 1 : 0]];
        }
        if ($value['type'] === 'number') {
            return ['sql' => "CAST(({$expression}) AS DECIMAL(18,6)) {$sqlOp} ?", 'params' => [$raw + 0]];
        }

        return ['sql' => "COALESCE(CAST({$expression} AS CHAR), '') {$sqlOp} ?", 'params' => [(string) $raw]];
    }
}
