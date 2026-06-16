<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class FilterParser
{
    private FilterLexer $lexer;
    private array $token;

    public function __construct(string $input)
    {
        $this->lexer = new FilterLexer($input);
        $this->token = $this->lexer->next();
    }

    /**
     * @return array<string, mixed>
     */
    public function parse(): array
    {
        $node = $this->parseOr();
        $this->expect('EOF');
        return $node;
    }

    private function parseOr(): array
    {
        $node = $this->parseAnd();
        while ($this->token['type'] === 'OR') {
            $this->advance();
            $node = ['type' => 'logical', 'op' => 'OR', 'left' => $node, 'right' => $this->parseAnd()];
        }
        return $node;
    }

    private function parseAnd(): array
    {
        $node = $this->parseFactor();
        while ($this->token['type'] === 'AND') {
            $this->advance();
            $node = ['type' => 'logical', 'op' => 'AND', 'left' => $node, 'right' => $this->parseFactor()];
        }
        return $node;
    }

    private function parseFactor(): array
    {
        if ($this->token['type'] === 'LPAREN') {
            $this->advance();
            $node = $this->parseOr();
            $this->expect('RPAREN');
            return $node;
        }
        return $this->parseComparison();
    }

    private function parseComparison(): array
    {
        $field = $this->expect('IDENT')['value'];
        $op = $this->expect('OP')['value'];
        $valueToken = $this->token;
        if (!in_array($valueToken['type'], ['STRING', 'NUMBER', 'BOOL', 'NULL'], true)) {
            throw new QueryTranslationException('Expected string, number, boolean, or null in filter.');
        }
        $this->advance();
        return [
            'type' => 'comparison',
            'field' => $field,
            'op' => $op,
            'value' => [
                'type' => strtolower($valueToken['type']),
                'value' => $valueToken['value'],
            ],
        ];
    }

    private function advance(): void
    {
        $this->token = $this->lexer->next();
    }

    private function expect(string $type): array
    {
        if ($this->token['type'] !== $type) {
            throw new QueryTranslationException("Expected {$type}, got {$this->token['type']}.");
        }
        $token = $this->token;
        $this->advance();
        return $token;
    }
}
