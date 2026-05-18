# Subshopping Full Life Cycle Audit

Generated audit scope: ElectroPrice provider catalog, local `.env` readiness,
portal reachability, current vhub/vimport capability declarations, sandbox
full-cycle tests, and no-submit transaction gates.

No secrets are stored in this report.

## Current Result

| Bucket | Count | Meaning |
|---|---:|---|
| Full-cycle portal transaction ready | 0 | No portal spec currently allows `add_to_cart`, `order_create`, or `order_confirm`. |
| Full-cycle portal dry-run ready | 3 | Provider has `orders`, credentials, portal spec, and no-submit checkout dry-run coverage. |
| Full-cycle credentialed read-only gate | 0 | No order-capable credentialed provider remains limited to read-only after dry-run promotion. |
| Full-cycle sandbox/spec ready | 4 | Provider has `orders` in the catalog and passes PoC sandbox lifecycle, but no credentialed portal profile is configured locally. |
| Credentialed transaction dry-run discovery | 2 | Credentials are present and portal is reachable, but provider has no `orders` capability yet. |
| Credentialed transaction discovery | 0 | No credentialed portal remains without a transaction dry-run/discovery spec. |
| Catalog-only provider gate | 15 | Provider remains useful for catalog/price/stock but cannot be promoted to subshopping transactions yet. |

## Credentialed Providers

| Provider | Disposition | Portal | Notes |
|---|---|---:|---|
| `cva` | `full_cycle_portal_dryrun_ready` | 200 | Orders and tracking surface exist; vimport now has no-submit cart/quote/payment-review dry-run. |
| `ingram_mexico` | `full_cycle_portal_dryrun_ready` | 200 | Orders/quotes/invoices/returns surface exists; vimport now has no-submit cart/quote/payment-review dry-run. |
| `ctonline` | `full_cycle_portal_dryrun_ready` | 403 | CT Connect has orders/shipping guides; portal is reachable but blocked to generic probe, likely WAF/session policy. |
| `syscom` | `credentialed_transaction_dryrun_discovery` | 200 | Credentials now unlock checkout discovery, but catalog currently lacks `orders`. |
| `tecnosinergia` | `credentialed_transaction_dryrun_discovery` | 200 | Credentials now unlock checkout discovery, but catalog currently lacks `orders`. |

## Full-Cycle Sandbox Providers

These providers are covered by automated PoC lifecycle tests:

- `commerceup_b2b`
- `ctonline`
- `cva`
- `dropi_mexico`
- `ingram_mexico`
- `intcomex_iws`
- `riqra_b2b`

The tested lifecycle is: sandbox retail payment, provider PO, wholesale payment,
provider shipment, customer delivery, return request, and refund.

## Functional Audit Verdict

The product-level subshopping lifecycle is complete in PoC/sandbox mode. The live
provider layer now has an explicit no-submit dry-run promotion path:

- No live portal automation currently performs cart/order submission.
- Existing credentialed portal specs remain network-first/read-only for catalog
  extraction, while separate dry-run specs model checkout review without submit.
- The next product-hardening step is to execute dry-runs with a user-authorized
  session and promote only verified endpoints into vhub/vimport submit specs.

## Reproduce

```bash
npm run audit:subshopping
npm run test:run -- src/services/ProviderCycleMatrix.test.ts src/services/SubshoppingPipeline.test.ts
```

The audit reads local `.env` only to check key presence and portal URLs. It does
not print credentials and does not submit orders.
