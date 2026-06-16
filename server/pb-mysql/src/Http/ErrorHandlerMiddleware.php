<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use Throwable;

final class ErrorHandlerMiddleware implements Middleware
{
    public function __construct(private readonly EndpointOptions $options)
    {
    }

    public function handle(HttpRequest $request, callable $next): JsonResponse
    {
        try {
            return $next($request);
        } catch (Throwable $error) {
            $status = $error instanceof QueryTranslationException ? 400 : 500;
            $message = $this->options->exposeErrors
                ? $error->getMessage()
                : ($status === 400 ? 'Invalid query.' : 'Translator unavailable.');

            if ($status >= 500) {
                error_log(sprintf(
                    'PocketBase MySQL translator error request_id=%s path=%s error=%s',
                    (string) $request->attribute('request_id', '-'),
                    $request->path,
                    $error->getMessage(),
                ));
            }

            return new JsonResponse([
                'data' => [],
                'message' => $message,
                'status' => $status,
            ], $status);
        }
    }
}
