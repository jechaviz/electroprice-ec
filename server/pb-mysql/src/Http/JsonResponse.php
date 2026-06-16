<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class JsonResponse
{
    /**
     * @param array<string, string> $headers
     */
    public function __construct(
        public readonly mixed $payload,
        public readonly int $status = 200,
        public readonly array $headers = [],
    ) {
    }

    /**
     * @param array<string, string> $headers
     */
    public function withHeaders(array $headers): self
    {
        return new self($this->payload, $this->status, array_merge($this->headers, $headers));
    }

    public function send(string $method = 'GET'): void
    {
        http_response_code($this->status);
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            foreach ($this->headers as $name => $value) {
                header($name . ': ' . $value);
            }
        }
        if ($this->status !== 204 && strtoupper($method) !== 'HEAD') {
            echo json_encode($this->payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
    }
}
