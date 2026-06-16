<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

interface Middleware
{
    /**
     * @param callable(HttpRequest): JsonResponse $next
     */
    public function handle(HttpRequest $request, callable $next): JsonResponse;
}
