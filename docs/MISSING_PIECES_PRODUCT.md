# Missing Pieces Product

Missing Pieces is the vimport/vhub product-content completion layer for
ElectroPrice. It does not own live price, stock, or availability. Its job is to
turn messy provider catalogs into canonical product records that can be compared
fairly across wholesalers.

## What It Completes

- Canonical identity: brand, model, canonical key, MPN/GTIN when available.
- Technical sheet: normalized specs by category.
- Media: official primary image plus gallery links.
- External sources: manufacturer page, manuals, support, drivers, firmware, and
  software links.
- Provider aliases: provider SKU/name matches with confidence.
- Business notes: ElectroPrice-only notes for margin, sales positioning, bundles,
  provider preference, or exceptions.

## What It Excludes

The canonical dataset intentionally excludes:

- live price;
- stock;
- availability;
- provider checkout state.

Those values must come from vhub/vimport provider surfaces at runtime so the
store can always show the best current offer.

## ElectroPrice Admin View

Admin > Product Intel shows, per product:

- all provider costs currently known in `wholesaler_stock`;
- selected best provider and retail price with the current 15% margin;
- competitive advantage versus the next cheapest provider;
- source counts for specs, images, documents, software, and aliases;
- Missing Pieces still needed;
- editable ElectroPrice business notes.

## Acceptance

```bash
npm run audit:missing-pieces
npm run pb:setup
npm run pb:seed-missing-pieces
```

The seed loads canonical records into PocketBase while leaving price/stock fields
empty for new products and preserving existing live provider stock for existing
products.

## Bundle Budget

The admin intelligence UI adds a dedicated operational surface, so the total JS
budget is recalibrated from 850KB to 875KB while the per-asset JS limit stays at
300KB. That keeps the new capability explicit and still prevents a single chunk
from becoming too large.
