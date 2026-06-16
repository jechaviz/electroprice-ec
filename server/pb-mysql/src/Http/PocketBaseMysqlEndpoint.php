<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class PocketBaseMysqlEndpoint
{
    /** @var list<Middleware> */
    private array $middleware;

    /**
     * @param list<Middleware>|null $middleware
     */
    public function __construct(
        private readonly PocketBaseQueryTranslator $translator,
        private readonly MysqlExecutor $executor,
        private readonly ?EndpointOptions $options = null,
        ?array $middleware = null,
        private readonly ?RecordHydrator $hydrator = null,
    ) {
        $resolvedOptions = $this->options();
        $this->middleware = $middleware ?? [
            new ErrorHandlerMiddleware($resolvedOptions),
            new CorsMiddleware(),
            new RequestIdMiddleware(),
            new MethodGuardMiddleware($resolvedOptions),
        ];
    }

    public function handle(?HttpRequest $request = null): void
    {
        $request ??= HttpRequest::fromGlobals();
        $response = $this->dispatch($request);
        $response->send($request->method);
    }

    public function dispatch(HttpRequest $request): JsonResponse
    {
        $handler = new PocketBaseMysqlHandler(
            $this->translator,
            $this->executor,
            $this->hydrator ?? new RecordHydrator(),
            $this->options(),
        );
        return (new MiddlewareStack($this->middleware, $handler(...)))->handle($request);
    }

    private function options(): EndpointOptions
    {
        return $this->options ?? EndpointOptions::fromEnv();
    }
}
