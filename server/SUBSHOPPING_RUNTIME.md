# Subshopping runtime — deploy notes

Two layers, both **no-submit** until per-provider go-live:

1. **Synchronous ack (live now):** `subshopping-runtime.php` in the docroot,
   routed by `.htaccess` (`^runtime/ → subshopping-runtime.php`). The storefront
   POSTs each purchase order here at checkout and gets an immediate DRYRUN ack.
   No distributor contact, no payment.

2. **Cron worker (this file):** `subshopping-cron.php` runs the compiled
   vhub/vimport binary to drain the queued POs. This is where real provider
   submission happens at go-live; in `no-submit` mode it only validates/acks.

## Why this shape

The Spaceship shared host has `gcc`, `cron`, `nohup/setsid/flock` but **no V
toolchain** and **no systemd/root**. V compiles via C to a native binary, so we
build the binary and run it as a flock-guarded cron job — the same pattern the
existing `electroprice-vhub-sync` binary already uses on this host.

## Build (V → C → binary)

Local V toolchain: `C:\git\v\v`. The host runs CloudLinux x86_64 with `gcc`.

The worker source is `server/subshopping_runtime/main.v` (uses `x.json2`, not the
`json` module, so the generated C has no cJSON thirdparty dependency). Compile the
C on the host so glibc matches. `-gc none` is required — the host has no boehm
`gc.h`, and the short-lived worker frees on exit.

```bash
# locally: emit portable C from the V runtime program
/c/git/v/v -os linux -gc none -o subshopping_vhub.c server/subshopping_runtime/main.v
# upload + compile on the host:
cat subshopping_vhub.c | ssh spaceship 'cat > ~/build/subshopping_vhub.c'
ssh spaceship 'gcc -O2 -w -o ~/apps/electroprice/current/bin/electroprice-subshopping-vhub ~/build/subshopping_vhub.c -lpthread -lm -ldl && chmod 755 ~/apps/electroprice/current/bin/electroprice-subshopping-vhub'
```

Status (2026-06-16): the `electroprice-subshopping-vhub` binary is built and
deployed, `subshopping-cron.php` is installed at
`shared/lib/subshopping-cron.php`, and the cron entry runs it every minute in
`no-submit` mode (verified end-to-end: queue PO -> DRYRUN ack).

## Install the cron

```bash
ssh spaceship "crontab -l > /tmp/ct; cat >> /tmp/ct <<'CRON'
# electroprice-subshopping-start
* * * * * /usr/bin/flock -n /home/agingriouh/apps/electroprice/shared/run/subshopping.lock /usr/local/bin/php /home/agingriouh/apps/electroprice/current/server/subshopping-cron.php >/dev/null 2>&1
# electroprice-subshopping-end
CRON
crontab /tmp/ct"
```

## Go live (per provider — requires explicit authorization)

1. Implement the real provider submission in the V runtime, driven by the AIS
   spec at `config/providers/api_integrator/<provider>_ai.yaml` and the creds in
   the host env (`shared/env/provider.env`).
2. Validate against that provider's **sandbox** first.
3. Wire **real B2B payment** (PaymentService is still mocked).
4. Flip `PBM_SUBSHOP_MODE=live` for that provider only.

Real orders / payments to distributors must not be enabled without sandbox
sign-off and explicit per-provider authorization.
