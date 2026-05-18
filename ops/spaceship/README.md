# ElectroPrice Spaceship Deployment

Target host:

- Domain: `electroprice.appniverse.com`
- cPanel docroot: `/home/agingriouh/electroprice.appniverse.com`
- App root: `/home/agingriouh/apps/electroprice`
- PocketBase: `127.0.0.1:18191`
- Public backend route: `/pb`

The shared-hosting product contract is:

1. Build the SPA locally with `VITE_POCKETBASE_URL=https://electroprice.appniverse.com/pb`.
2. Upload static files to the subdomain docroot.
3. Run PocketBase from a project-scoped Linux binary.
4. Keep `pb_data` in `/home/agingriouh/apps/electroprice/shared/pb_data`.
5. Keep PocketBase private to loopback and expose it only through the docroot reverse route.
6. Install one cron watchdog, guarded by `flock`, to restart the private service.

Cron line:

```cron
* * * * * /usr/bin/flock -n /home/agingriouh/apps/electroprice/shared/run/watchdog.lock /home/agingriouh/apps/electroprice/current/ops/watchdog.sh >/dev/null 2>&1
```

Validation gates:

- `curl http://127.0.0.1:18191/api/health` over SSH.
- `curl https://electroprice.appniverse.com/healthz`.
- `curl https://electroprice.appniverse.com/pb/api/health`.
- `curl https://electroprice.appniverse.com/`.

No provider credentials, PocketBase data, logs, runtime pids, or generated secrets belong in git.
