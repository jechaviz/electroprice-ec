# Spaceship Deployment Receipt

Date: 2026-05-18

Target:

- `https://electroprice.appniverse.com`
- cPanel docroot: `/home/agingriouh/electroprice.appniverse.com`
- Release: `/home/agingriouh/apps/electroprice/releases/20260518112615`
- Current symlink: `/home/agingriouh/apps/electroprice/current`
- PocketBase: `127.0.0.1:18191`
- Public PocketBase route: `/pb`

Implemented hosting capabilities:

- Created the `electroprice.appniverse.com` subdomain in cPanel.
- Added authoritative Launchpad DNS A records for `electroprice` and `www.electroprice`.
- Deployed the static SPA compiled with `VITE_POCKETBASE_URL=https://electroprice.appniverse.com/pb`.
- Deployed a project-scoped PocketBase Linux binary and isolated data directory.
- Kept PocketBase private to loopback and exposed it through `.htaccess` reverse routing.
- Installed a cron watchdog guarded by `flock`.
- Rotated the PocketBase superuser password during deployment and stored it only in the server-side private env area.
- Triggered AutoSSL after DNS was authoritative.

Validation evidence:

```text
https://electroprice.appniverse.com/healthz
ok electroprice spaceship edge

https://electroprice.appniverse.com/pb/api/health
{"message":"API is healthy.","code":200,"data":{}}

https://electroprice.appniverse.com/pb/api/collections/products/records?perPage=1&fields=id,name,canonical_key
totalItems=35
```

Runtime supervision:

```cron
* * * * * /usr/bin/flock -n /home/agingriouh/apps/electroprice/shared/run/watchdog.lock /home/agingriouh/apps/electroprice/current/ops/watchdog.sh >/dev/null 2>&1
```

Server private files verified with mode `600`:

- `/home/agingriouh/apps/electroprice/shared/env/pb-superuser.env`
- `/home/agingriouh/apps/electroprice/shared/pb_data/data.db`
