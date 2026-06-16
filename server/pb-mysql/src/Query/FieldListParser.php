<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class FieldListParser
{
    /**
     * @return ?list<string>
     */
    public function parse(mixed $value): ?array
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $fields = [];
        foreach (explode(',', $value) as $field) {
            $field = trim($field);
            if ($field !== '' && preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $field)) {
                $fields[] = $field;
            }
        }
        return $fields === [] ? null : array_values(array_unique($fields));
    }
}
