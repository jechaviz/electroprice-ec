<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class SortCompiler
{
    public function compile(string $sort, CollectionSchema $schema): string
    {
        $sort = trim($sort);
        if ($sort === '') {
            return ' ORDER BY `id` ASC';
        }

        $parts = [];
        foreach (explode(',', $sort) as $rawPart) {
            $rawPart = trim($rawPart);
            if ($rawPart === '') {
                continue;
            }
            $direction = 'ASC';
            if (str_starts_with($rawPart, '-')) {
                $direction = 'DESC';
                $rawPart = substr($rawPart, 1);
            } elseif (str_starts_with($rawPart, '+')) {
                $rawPart = substr($rawPart, 1);
            }
            if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/', $rawPart)) {
                continue;
            }
            $parts[] = $schema->fieldExpression($rawPart, 'string') . " {$direction}";
        }

        return $parts === [] ? ' ORDER BY `id` ASC' : ' ORDER BY ' . implode(', ', $parts);
    }
}
