# Product curation batches

ElectroPrice curates product data in production batches without mixing live
offer synchronization with content enrichment.

## Manual taxonomy

Nested category paths live in `catalog_categories` and are applied to products
through `manual_category_path`. The legacy flat `category` field remains as the
frontend compatibility bucket.

Manual category examples:

- `seguridad/cctv/camaras`
- `redes/access-points`
- `computo/componentes/memoria-ram`
- `software/licencias`

Products that do not match a manual rule are marked
`category_review_status = needs_manual_review`.

Taxonomy changes are deliberate/manual. When a provider feed exposes a product
family that does not fit the current tree, add the nested category path first,
then add the matching rule and reseed `catalog_categories` through the runner.

## Batch runner

Dry run:

```bash
node pb/scripts/pb_curate_products.mjs --batchSize 100 --microBatchSize 10 --workers 10
```

Apply:

```bash
node pb/scripts/pb_curate_products.mjs --batchSize 100 --microBatchSize 10 --workers 10 --apply
```

Resume only rows missing lifecycle fields:

```bash
node pb/scripts/pb_curate_products.mjs --batchSize 100 --microBatchSize 10 --workers 6 --apply --onlyUncurated
```

Reapply taxonomy only to rows still needing manual categorization:

```bash
node pb/scripts/pb_curate_products.mjs --batchSize 100 --microBatchSize 10 --workers 6 --apply --onlyNeedsManualReview
```

For taxonomy-only remediation on a stressed PocketBase instance, skip audit
receipt writes and rely on product fields plus the batch log:

```bash
node pb/scripts/pb_curate_products.mjs --batchSize 100 --microBatchSize 10 --workers 1 --apply --onlyNeedsManualReview --skipReceipts
```

Grounded content research can be enabled with `--research` when a Gemini API
key is configured. The research layer may add descriptions, official links,
additional images, documents, measurements, and specifications, but it is not
allowed to write price, stock, or availability.

## Availability cleanup

The runner writes `availability_status`:

- `active`: at least one provider stock line has stock.
- `provider_unavailable`: provider stock exists but no stock is available.
- `obsolete_candidate`: no provider listing exists or the unavailable age is
  past the configured threshold.

Obsolescence is intentionally staged instead of deleting rows immediately.
Deletion or archival can be done later from `obsolete_candidate` records after
manual review.

Dry-run obsolete cleanup:

```bash
node pb/scripts/pb_cleanup_obsolete_products.mjs --olderThanDays 30
```

Archive reviewed obsolete candidates:

```bash
node pb/scripts/pb_cleanup_obsolete_products.mjs --olderThanDays 30 --mode archive --apply
```

## Shared policy module

The reusable deterministic policy package lives at
`C:\git\websites\lib\electroprice-catalog-curation`. Product runners keep local
PocketBase adapters thin and portable while the shared package evolves for
other storefront/importer projects.
