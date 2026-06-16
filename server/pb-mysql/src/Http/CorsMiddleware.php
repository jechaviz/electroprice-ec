<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class CorsMiddleware implements Middleware
{
    public function handle(HttpRequest $request, callable $next): JsonResponse
    {
        return $next($request)->withHeaders([
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers' => 'Authorization, Content-Type',
        ]);
    }
}
