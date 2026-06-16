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

Recommended (compile the C on the host, so glibc matches):

```bash
# locally: emit portable C from the V runtime program
/c/git/v/v -os linux -o subshopping_vhub.c <path-to-subshopping-runtime-main.v>
scp subshopping_vhub.c spaceship:~/build/
# on the host:
ssh spaceship 'gcc -O2 -o ~/apps/electroprice/current/bin/electroprice-subshopping-vhub ~/build/subshopping_vhub.c -lpthread -lm'
```

(Or cross-compile to an x86_64 ELF locally if a Linux cross toolchain is
available, then upload the binary directly.)

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
