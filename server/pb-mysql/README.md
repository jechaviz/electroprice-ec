# PocketBase MySQL Translator

PocketBase-compatible read endpoint backed by MySQL mirror tables.

The goal is to let apps that already speak PocketBase REST keep serving catalog reads even when the PocketBase process is not alive. It is a query translator, not a full PocketBase runtime.

## Production Posture

- Read-only by design: only `GET`, `HEAD`, and `OPTIONS` are handled.
- Deny-by-default collection policy: `products` is the only allowed collection unless `PBM_ALLOWED_COLLECTIONS` is set.
- MySQL-backed health: `/api/health` runs `SELECT 1`; database failure returns `503`.
- Safe errors by default: internal SQL, config, or database errors are not returned to clients unless `PBM_EXPOSE_ERRORS=true`.
- Shared-hosting friendly: uses `pdo_mysql` when available and falls back to the `mariadb` CLI client.
- Layered architecture: HTTP, middleware, schema, query compilation, hydration, and database execution are separate components.
- Dependency injection: endpoint composition accepts custom executors, schema registries, options, middleware, and hydrators.
- AOP-style middleware: CORS, method guarding, request IDs, and error handling are cross-cutting concerns outside the query core.
- Offline mirror feeder: `pbm-sync.php` reads PocketBase SQLite directly and refreshes MySQL without requiring PocketBase to be running.
- Atomic freshness: sync writes staging tables, validates counts, then swaps hot tables with `RENAME TABLE`.

## Architecture

Main layers:

- `Config`: `EndpointOptions`, `MysqlConfig`, and environment parsing.
- `Database`: `MysqlExecutor` interface with `PdoMysqlExecutor`, `CliMysqlExecutor`, and `MysqlExecutorFactory`.
- `Schema`: `SchemaRegistry` and `CollectionSchema` map PocketBase fields to SQL tables/columns.
- `Query`: lexer, parser, filter compiler, sort compiler, query plans, and record hydration.
- `Http`: request/response objects, middleware pipeline, route handler, and endpoint facade.
- `Mirror`: SQLite source reader, MySQL snapshot writer, sync service, freshness checker, and CLI.

Extension points:

- Add optimized tables by implementing `SchemaRegistry` and returning a custom `CollectionSchema`.
- Swap database access by implementing `MysqlExecutor`.
- Add observability, auth, rate limiting, or caching by implementing `Middleware`.
- Change projection/hydration by injecting `RecordHydrator`.

The public API is intentionally small:

```php
$options = EndpointOptions::fromEnv();
$config = MysqlConfig::fromEnvFile('/path/mysql.env');
$executor = (new MysqlExecutorFactory())->create($config);
$translator = new PocketBaseQueryTranslator(options: $options);
$endpoint = new PocketBaseMysqlEndpoint($translator, $executor, $options);
$endpoint->handle();
```

## Supported Routes

- `GET /api/health`
- `GET /api/collections/{collection}/records`
- `GET /api/collections/{collection}/records/{id}`

Supported query parameters:

- `page`
- `perPage`
- `sort`
- `filter`
- `fields`
- `skipTotal`

The filter subset covers the PocketBase query shapes used by Electroprice catalog reads:

- `&&`, `||`, parentheses
- `=`, `!=`, `>`, `>=`, `<`, `<=`
- `~`, `!~`
- double-quoted and single-quoted strings
- numbers, booleans, `null`

Unsupported writes, auth operations, file APIs, realtime APIs, and admin routes should continue to route to PocketBase or another service.

## Expected MySQL Mirror

Generic records:

```sql
pbm_records(collection, id, created, updated, data)
```

Optimized products:

```sql
pbm_products(id, created, updated, name, brand, category, image_url, search_text,
             best_price, total_stock, is_deal, avg_rating, review_count, data)
```

The `data` column must contain the original PocketBase record JSON.

## Configuration

Set `PBM_MYSQL_ENV` to a file with:

```env
MYSQL_HOST=localhost
MYSQL_DATABASE=example_db
MYSQL_USER=example_user
MYSQL_PASSWORD=example_password
MYSQL_BINARY=/usr/bin/mariadb
```

Optional environment variables:

```env
PBM_ALLOWED_COLLECTIONS=products,reviews
PBM_EXPOSE_ERRORS=false
PBM_HEALTH_CHECK_DB=true
PBM_SOURCE=mysql-translator
PBM_DEFAULT_PER_PAGE=30
PBM_MAX_PER_PAGE=500
PBM_MAX_PAGE=1000000
PBM_MAX_MIRROR_AGE_SECONDS=3600
```

Use `PBM_ALLOWED_COLLECTIONS=*` only behind another authorization layer.

## Endpoint Install

Copy `public/pb-mysql-endpoint.php` and `src/PocketbaseMysqlTranslator.php` to the site, or copy `examples/electroprice-docroot-endpoint.php` for the Electroprice shared-hosting layout.

Apache/LiteSpeed rewrite example for a safe products-only install:

```apache
RewriteEngine On
RewriteRule ^pb/api/health$ pb-mysql-endpoint.php [L,QSA]
RewriteRule ^pb/api/collections/products/records/?$ pb-mysql-endpoint.php [L,QSA]
RewriteRule ^pb/api/collections/products/records/[^/]+/?$ pb-mysql-endpoint.php [L,QSA]
RewriteRule ^pb/(.*)$ http://127.0.0.1:18191/$1 [P,L,QSA]
```

This keeps product reads independent from PocketBase while allowing auth, writes, and custom endpoints to continue through PocketBase.

## Verification

Run the repository test suite:

```bash
php tests/run.php
```

Expected output:

```text
ok pocketbase-mysql-translator tests
```

Operational smoke test:

```bash
curl -fsS 'https://example.com/pb/api/health'
curl -fsS 'https://example.com/pb/api/collections/products/records?page=1&perPage=1&fields=id,name,total_stock'
```

## Mirror Feeder

The feeder is intentionally independent from PocketBase HTTP. It reads the PocketBase SQLite file and writes MySQL mirror tables:

```bash
php bin/pbm-sync.php sync \
  --sqlite=/home/agingriouh/apps/electroprice/shared/pb_data/data.db \
  --mysql-env=/home/agingriouh/apps/electroprice/shared/env/mysql.env \
  --collections=products \
  --batch-size=50 \
  --lock-file=/home/agingriouh/apps/electroprice/shared/run/pbm-sync.lock
```

Status/freshness check:

```bash
php bin/pbm-sync.php status \
  --sqlite=/home/agingriouh/apps/electroprice/shared/pb_data/data.db \
  --mysql-env=/home/agingriouh/apps/electroprice/shared/env/mysql.env \
  --max-age-seconds=3600
```

Production behavior:

- `sync` writes `pbm_products_stage` and `pbm_records_stage`.
- It validates source and stage counts.
- It atomically swaps stage tables into `pbm_products` and `pbm_records`.
- It updates `pbm_metadata` with sync id, timestamp, source, collections, and counts.
- `status` exits `0` when fresh and `2` when stale.

Electroprice shared-hosting script:

```bash
bash /home/agingriouh/apps/electroprice/shared/lib/pocketbase-mysql-translator/examples/electroprice-pbm-sync.sh
```
