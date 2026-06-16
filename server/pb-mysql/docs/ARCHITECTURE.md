# Architecture Notes

This library is organized as a small hexagonal HTTP adapter:

- The HTTP edge depends on abstractions and value objects.
- Query translation is independent from HTTP.
- Database execution is behind `MysqlExecutor`.
- Collection-specific SQL knowledge lives in `SchemaRegistry`.
- Mirror feeding is independent from both HTTP and PocketBase process liveness.

## SOLID Mapping

- Single Responsibility: each class owns one concern: parsing, compiling, sorting, hydration, execution, routing, or middleware.
- Open/Closed: new collections and optimized tables are added through `SchemaRegistry`; new cross-cutting behavior is added through `Middleware`.
- Liskov Substitution: `MysqlExecutor` implementations are interchangeable.
- Interface Segregation: the database port has only `fetchAll` and `fetchValue`; middleware has only `handle`.
- Dependency Inversion: high-level HTTP/query code depends on `MysqlExecutor` and `SchemaRegistry`, not concrete MySQL clients.

## DRY and SoC

Environment parsing is centralized in `Env`. Pagination limits are centralized in `EndpointOptions`. Field-to-SQL mapping is centralized in `CollectionSchema`; filters and sorts reuse that schema instead of duplicating SQL field logic.

## DI

`PocketBaseMysqlEndpoint` accepts the translator, executor, options, middleware list, and hydrator. `PocketBaseQueryTranslator` accepts a schema registry, compilers, field parser, and options.

## AOP

The middleware pipeline handles cross-cutting concerns:

- `ErrorHandlerMiddleware`
- `CorsMiddleware`
- `RequestIdMiddleware`
- `MethodGuardMiddleware`

These are orthogonal to route handling and query compilation.

## Scalability

The translator always applies bounded pagination. `pbm_products` can use indexed physical columns for common catalog filters and sorts, while generic collections fall back to JSON extraction from `pbm_records`. Production deployments should add optimized mirror tables and schemas for high-traffic collections instead of relying on JSON extraction for hot paths.

The mirror feeder uses a full snapshot strategy:

1. Read source counts from PocketBase SQLite.
2. Write rows into staging tables.
3. Validate stage counts.
4. Atomically swap staging tables into hot tables.
5. Update freshness metadata.

This avoids readers observing partial refreshes and removes pruning complexity from the hot path.
