# Subshopping Full Life Cycle Audit

Generated audit scope: ElectroPrice provider catalog, local `.env` readiness,
portal reachability, current vhub/vimport capability declarations, sandbox
full-cycle tests, and no-submit transaction gates.

No secrets are stored in this report.

## Current Result

| Bucket | Count | Meaning |
|---|---:|---|
| Full-cycle portal transaction ready | 0 | No portal spec currently allows `add_to_cart`, `order_create`, or `order_confirm`. |
| Full-cycle credentialed read-only gate | 3 | Provider has `orders`, portal credentials, portal spec, and reachable login surface, but current vimport spec is read-only. |
| Full-cycle sandbox/spec ready | 4 | Provider has `orders` in the catalog and passes PoC sandbox lifecycle, but no credentialed portal profile is configured locally. |
| Credentialed transaction discovery | 2 | Credentials are present and portal is reachable, but provider has no `orders` capability yet. |
| Catalog-only provider gate | 15 | Provider remains useful for catalog/price/stock but cannot be promoted to subshopping transactions yet. |

## Credentialed Providers

| Provider | Disposition | Portal | Notes |
|---|---|---:|---|
| `cva` | `full_cycle_credentialed_readonly_gate` | 200 | Orders and tracking surface exist; vimport spec remains no-submit/read-only. |
| `ingram_mexico` | `full_cycle_credentialed_readonly_gate` | 200 | Orders/quotes/invoices/returns surface exists; vimport spec remains no-submit/read-only. |
| `ctonline` | `full_cycle_credentialed_readonly_gate` | 403 | CT Connect has orders/shipping guides; portal is reachable but blocked to generic probe, likely WAF/session policy. |
| `syscom` | `credentialed_transaction_discovery` | 200 | Credentials now unlock discovery work, but catalog currently lacks `orders`. |
| `tecnosinergia` | `credentialed_transaction_discovery` | 200 | Credentials now unlock discovery work, but catalog currently lacks `orders`. |

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
provider layer is intentionally gated:

- No live portal automation currently performs cart/order submission.
- Existing credentialed portal specs are network-first and read-only.
- The next product-hardening step is to create transaction-discovery playbooks for
  SYSCOM and Tecnosinergia, and separate no-submit dry-run specs from explicit
  submit-enabled specs for CVA, Ingram, and CTOnline.

## Reproduce

```bash
npm run audit:subshopping
npm run test:run -- src/services/ProviderCycleMatrix.test.ts src/services/SubshoppingPipeline.test.ts
```

The audit reads local `.env` only to check key presence and portal URLs. It does
not print credentials and does not submit orders.
