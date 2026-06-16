<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use RuntimeException;
use Throwable;

final class PocketBaseMysqlHandler
{
    public function __construct(
        private readonly PocketBaseQueryTranslator $translator,
        private readonly MysqlExecutor $executor,
        private readonly RecordHydrator $hydrator,
        private readonly EndpointOptions $options,
    ) {
    }

    public function __invoke(HttpRequest $request): JsonResponse
    {
        if (preg_match('#/(?:pb/)?api/health$#', $request->path)) {
            return $this->health();
        }

        if (!preg_match('#/(?:pb/)?api/collections/([^/]+)/records(?:/([^/]+))?/?$#', $request->path, $match)) {
            return new JsonResponse(['data' => [], 'message' => "The requested resource wasn't found.", 'status' => 404], 404);
        }

        $collection = rawurldecode($match[1]);
        $id = isset($match[2]) ? rawurldecode($match[2]) : null;
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $collection)) {
            return new JsonResponse(['data' => [], 'message' => 'Invalid collection.', 'status' => 400], 400);
        }
        if (!$this->options->allowsCollection($collection)) {
            return new JsonResponse(['data' => [], 'message' => "The requested resource wasn't found.", 'status' => 404], 404);
        }

        return $id === null
            ? $this->list($collection, $request->query)
            : $this->one($collection, $id, $request->query);
    }

    private function health(): JsonResponse
    {
        if ($this->options->healthChecksDatabase) {
            try {
                $ok = $this->executor->fetchValue(new SqlStatement('SELECT 1 AS `ok`', [], ['ok']));
                if ((int) $ok !== 1) {
                    throw new RuntimeException('Unexpected database health response.');
                }
            } catch (Throwable $error) {
                $data = ['source' => $this->options->source, 'version' => PocketBaseQueryTranslator::VERSION];
                if ($this->options->exposeErrors) {
                    $data['error'] = $error->getMessage();
                }
                return new JsonResponse(['message' => 'API is unhealthy.', 'code' => 503, 'data' => $data], 503);
            }
        }

        $mirror = null;
        if ($this->options->mirrorMaxAgeSeconds > 0) {
            $mirror = (new MirrorFreshnessChecker(new MysqlMirrorWriter($this->executor)))->status($this->options->mirrorMaxAgeSeconds);
            if (!$mirror['fresh']) {
                return new JsonResponse([
                    'message' => 'API mirror is stale.',
                    'code' => 503,
                    'data' => [
                        'source' => $this->options->source,
                        'version' => PocketBaseQueryTranslator::VERSION,
                        'mirror' => $mirror,
                    ],
                ], 503);
            }
        }

        return new JsonResponse([
            'message' => 'API is healthy.',
            'code' => 200,
            'data' => array_filter([
                'source' => $this->options->source,
                'version' => PocketBaseQueryTranslator::VERSION,
                'mirror' => $mirror,
            ], fn ($value) => $value !== null),
        ]);
    }

    /**
     * @param array<string, mixed> $query
     */
    private function list(string $collection, array $query): JsonResponse
    {
        $plan = $this->translator->compileList($collection, $query);
        $rows = $this->executor->fetchAll($plan->rows);
        $items = array_map(
            fn ($row) => $this->hydrator->hydrate($row, $collection, $plan->fields),
            $rows,
        );

        if ($plan->count === null) {
            $totalItems = -1;
            $totalPages = -1;
        } else {
            $totalItems = (int) $this->executor->fetchValue($plan->count);
            $totalPages = (int) ceil($totalItems / max(1, $plan->perPage));
        }

        return new JsonResponse([
            'page' => $plan->page,
            'perPage' => $plan->perPage,
            'totalItems' => $totalItems,
            'totalPages' => $totalPages,
            'items' => $items,
        ]);
    }

    /**
     * @param array<string, mixed> $query
     */
    private function one(string $collection, string $id, array $query): JsonResponse
    {
        $plan = $this->translator->compileOne($collection, $id, $query);
        $rows = $this->executor->fetchAll($plan->row);
        if ($rows === []) {
            return new JsonResponse(['data' => [], 'message' => "The requested resource wasn't found.", 'status' => 404], 404);
        }
        return new JsonResponse($this->hydrator->hydrate($rows[0], $collection, $plan->fields));
    }
}
