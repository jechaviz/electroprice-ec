<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class Env
{
    /**
     * @return array<string, string>
     */
    public static function readEnvFile(string $path): array
    {
        $values = [];
        if (!is_file($path)) {
            return $values;
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
            $line = trim(preg_replace('/^\xEF\xBB\xBF/', '', $line) ?? $line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            if (str_starts_with($line, 'export ')) {
                $line = substr($line, 7);
            }
            if (!str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if ($key === '' || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $key)) {
                continue;
            }
            if ((str_starts_with($value, '"') && str_ends_with($value, '"'))
                || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                $value = substr($value, 1, -1);
            }
            $values[$key] = $value;
        }

        return $values;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = getenv($key);
        return $value === false || $value === '' ? $default : $value;
    }

    public static function truthy(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_int($value)) {
            return $value !== 0;
        }
        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    public static function falsey(mixed $value): bool
    {
        if (is_bool($value)) {
            return !$value;
        }
        return in_array(strtolower((string) $value), ['0', 'false', 'no', 'off'], true);
    }

    /**
     * @return list<string>
     */
    public static function parseIdentifierList(string $value, bool $allowWildcard = false): array
    {
        $items = [];
        foreach (explode(',', $value) as $item) {
            $item = trim($item);
            if ($allowWildcard && $item === '*') {
                return ['*'];
            }
            if ($item !== '' && preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $item)) {
                $items[] = $item;
            }
        }
        return array_values(array_unique($items));
    }
}
