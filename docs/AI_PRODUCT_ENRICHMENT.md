# AI Product Enrichment

ElectroPrice enriches imported products in server-side batches of up to 100
items. The lane fixes taxonomy, titles, descriptions, images, specs, canonical
identity, and content scores without touching live price or stock.

## Batch Worker

Dry run:

```bash
node pb/scripts/pb_enrich_products_ai.mjs --limit 100
```

Apply:

```bash
node pb/scripts/pb_enrich_products_ai.mjs --limit 100 --apply
```

The worker uses `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or `VITE_GEMINI_API_KEY`
when available. Without a key it still produces deterministic taxonomy patches
and receipts so the pipeline is testable.

## Price And Stock Refresh

Provider runtimes should write normalized rows into `provider_offers`. The
reducer applies fresh offers to `products.wholesaler_stock`, appends compact
price history, and rebuilds derived catalog indexes:

```bash
node pb/scripts/pb_refresh_provider_offers.mjs --limit 100 --apply
```

Run this from cron every 1-5 minutes. Keep provider API calls in VHub/VImport;
this reducer only materializes already-normalized provider offers.

## Safety

Forbidden enrichment fields: `price`, `stock`, `availability`,
`wholesaler_stock`, `price_history`, `best_price`, `total_stock`, and `is_deal`.
Those belong to the price/stock refresh lane.

Every AI patch includes `patch_id`, input hash, patch hash, source refs, model,
prompt version, confidence, and status in `ai_enrichment_patches`.
