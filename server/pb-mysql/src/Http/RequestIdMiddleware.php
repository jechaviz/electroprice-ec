<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class RequestIdMiddleware implements Middleware
{
    public function handle(HttpRequest $request, callable $next): JsonResponse
    {
        $requestId = bin2hex(random_bytes(8));
        $response = $next($request->withAttribute('request_id', $requestId));
        return $response->withHeaders(['X-PBM-Request-Id' => $requestId]);
    }
}
