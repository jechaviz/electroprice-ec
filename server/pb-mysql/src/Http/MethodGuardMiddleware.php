<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class MethodGuardMiddleware implements Middleware
{
    public function __construct(private readonly EndpointOptions $options)
    {
    }

    public function handle(HttpRequest $request, callable $next): JsonResponse
    {
        if ($request->method === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }
        if (!$this->options->allowsMethod($request->method)) {
            return new JsonResponse(['data' => [], 'message' => 'MySQL translator supports read queries only.', 'status' => 405], 405);
        }
        return $next($request);
    }
}
