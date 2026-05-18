# Subshopping Transaction Dry-Run

This is the first promoted path from catalog extraction into provider checkout
automation without making irreversible purchases.

## Product Shape

`transaction_dryrun` is a vimport provider skill that uses the client's authorized
portal session to reach the checkout review surface and capture the provider's
real operational data:

- cart reference and grouped line items;
- wholesale subtotal, tax, freight, currency, and quote expiration;
- delivery options, pickup branches, ETAs, and shipping-guide requirements;
- available payment methods without submitting payment;
- network endpoints required to graduate into vhub/vimport live execution.

The dry-run explicitly denies `order_confirm` and `payment_submit`. It is therefore
fit for readiness, QA, and client approval before a separate submit-enabled
spec exists.

## Current Provider Coverage

| Provider | Maturity | Use |
|---|---|---|
| `cva` | `dryrun_ready` | Validate cart quote, freight, payment review, and guide metadata. |
| `ingram_mexico` | `dryrun_ready` | Validate quote/cart/order-review parity against Ingram API scopes. |
| `ctonline` | `dryrun_ready` | Validate CT Connect order flow plus portal WAF/session behavior. |
| `syscom` | `transaction_discovery` | Discover whether portal checkout can become a subshopping spec. |
| `tecnosinergia` | `transaction_discovery` | Discover whether portal checkout can become a subshopping spec. |

## Gate Model

1. Retail customer pays ElectroPrice in sandbox or production gateway.
2. ElectroPrice generates provider purchase orders grouped by wholesaler.
3. vhub is preferred when an official order API exists.
4. vimport dry-run is used when a credentialed portal must be understood first.
5. The run stops before provider submit/payment and emits a sanitized dry-run
   packet for review.

## Acceptance Criteria

- Every dry-run spec declares `mode: transaction_dryrun`.
- Every dry-run spec keeps `submit_enabled: false`.
- Every dry-run spec denies `order_confirm` and `payment_submit`.
- The manifest is indexed by `npm run audit:providers`.
- Readiness is surfaced by `npm run audit:subshopping`.
