# ElectroPrice Provider Configuration

This directory is the customer-owned provider configuration layer for ElectroPrice.
The frontend keeps only safe metadata and file references here. Real credentials,
cookies, tokens, screenshots, HAR files, and account identifiers must stay in
server-side secret storage or local gitignored files.

## Layout

- `catalog.json` is the frontend-safe index used by ElectroPrice and vhub.
- `api_integrator/*.yaml` contains vhub provider specs copied from the AIS spec.
- `vimport/*.yml` contains read-only browser fallback pipelines for providers that
  need portal extraction or API parity checks.
- `vimport/mexico_provider_credentials.env.example` lists environment variable
  names only. Copy it to a gitignored secret store before running probes.

## Ownership

- vhub owns HTTP, SOAP, Redis, WebSocket, PocketBase, scheduler, and provider API
  execution.
- vimport owns authorized read-only portal fallbacks when a provider does not expose
  enough API surface yet.
- ElectroPrice consumes sanitized provider state through PocketBase or vhub APIs.
  Browser code must never receive provider credentials.

## Activation Notes

The validated live portal providers are CVA, CTOnline, Ingram Mexico, SYSCOM, and
Tecnosinergia. CT Connect still requires provider-side enablement and IP allowlist
before token calls can be treated as production-ready.
