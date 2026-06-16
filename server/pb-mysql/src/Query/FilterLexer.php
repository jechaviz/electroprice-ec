<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class FilterLexer
{
    private int $offset = 0;

    public function __construct(private readonly string $input)
    {
    }

    /**
     * @return array{type: string, value?: mixed}
     */
    public function next(): array
    {
        $length = strlen($this->input);
        while ($this->offset < $length && ctype_space($this->input[$this->offset])) {
            $this->offset++;
        }
        if ($this->offset >= $length) {
            return ['type' => 'EOF'];
        }

        $rest = substr($this->input, $this->offset);
        foreach ([['&&', 'AND'], ['||', 'OR'], ['>=', 'OP'], ['<=', 'OP'], ['!=', 'OP'], ['!~', 'OP']] as [$prefix, $type]) {
            if (str_starts_with($rest, $prefix)) {
                $this->offset += strlen($prefix);
                return $type === 'OP' ? ['type' => 'OP', 'value' => $prefix] : ['type' => $type];
            }
        }

        $char = $this->input[$this->offset];
        if ($char === '(') {
            $this->offset++;
            return ['type' => 'LPAREN'];
        }
        if ($char === ')') {
            $this->offset++;
            return ['type' => 'RPAREN'];
        }
        if (in_array($char, ['=', '>', '<', '~'], true)) {
            $this->offset++;
            return ['type' => 'OP', 'value' => $char];
        }
        if ($char === '"' || $char === "'") {
            return ['type' => 'STRING', 'value' => $this->readString($char)];
        }
        if (preg_match('/^-?\d+(\.\d+)?/', $rest, $match)) {
            $this->offset += strlen($match[0]);
            return ['type' => 'NUMBER', 'value' => str_contains($match[0], '.') ? (float) $match[0] : (int) $match[0]];
        }
        if (preg_match('/^[A-Za-z_][A-Za-z0-9_.]*/', $rest, $match)) {
            $this->offset += strlen($match[0]);
            $lower = strtolower($match[0]);
            if ($lower === 'true' || $lower === 'false') {
                return ['type' => 'BOOL', 'value' => $lower === 'true'];
            }
            if ($lower === 'null') {
                return ['type' => 'NULL', 'value' => null];
            }
            return ['type' => 'IDENT', 'value' => $match[0]];
        }

        throw new QueryTranslationException('Unexpected filter token near: ' . substr($rest, 0, 20));
    }

    private function readString(string $quote): string
    {
        $this->offset++;
        $value = '';
        $length = strlen($this->input);
        while ($this->offset < $length) {
            $char = $this->input[$this->offset++];
            if ($char === $quote) {
                return $value;
            }
            if ($char === '\\' && $this->offset < $length) {
                $next = $this->input[$this->offset++];
                $value .= match ($next) {
                    'n' => "\n",
                    'r' => "\r",
                    't' => "\t",
                    default => $next,
                };
                continue;
            }
            $value .= $char;
        }
        throw new QueryTranslationException('Unterminated filter string.');
    }
}
