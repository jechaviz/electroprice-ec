<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class MiddlewareStack
{
    /**
     * @param list<Middleware> $middleware
     * @param callable(HttpRequest): JsonResponse $handler
     */
    public function __construct(
        private readonly array $middleware,
        private readonly mixed $handler,
    ) {
    }

    public function handle(HttpRequest $request): JsonResponse
    {
        $next = $this->handler;
        for ($index = count($this->middleware) - 1; $index >= 0; $index--) {
            $middleware = $this->middleware[$index];
            $previous = $next;
            $next = fn (HttpRequest $request): JsonResponse => $middleware->handle($request, $previous);
        }
        return $next($request);
    }
}
