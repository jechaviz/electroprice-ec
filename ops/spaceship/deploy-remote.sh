#!/usr/bin/env bash
set -euo pipefail

TS="${1:?release timestamp is required}"
APP="/home/agingriouh/apps/electroprice"
DOC="/home/agingriouh/electroprice.appniverse.com"
RELEASE="$APP/releases/$TS"
RELEASE_ARCHIVE="${2:-$APP/incoming/release-$TS.tar.gz}"
DATA_ARCHIVE="${3:-$APP/incoming/pbdata-$TS.tar.gz}"

mkdir -p "$APP/incoming" "$APP/releases" "$APP/shared/logs" "$APP/shared/run" "$APP/shared/env"

rm -rf "$RELEASE"
mkdir -p "$RELEASE"
tar -xzf "$RELEASE_ARCHIVE" -C "$RELEASE" --strip-components=1
chmod +x "$RELEASE/bin/pocketbase" "$RELEASE/ops/"*.sh

if [[ -x "$APP/current/ops/stop-pb.sh" ]]; then
  bash "$APP/current/ops/stop-pb.sh" || true
fi

if [[ ! -f "$APP/shared/pb_data/data.db" ]]; then
  tar -xzf "$DATA_ARCHIVE" -C "$APP/shared"
  chmod -R go-rwx "$APP/shared/pb_data"
fi

pb_password="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
"$RELEASE/bin/pocketbase" superuser upsert admin@electroprice.com "$pb_password" \
  --dir "$APP/shared/pb_data" \
  --migrationsDir "$RELEASE/pb_migrations" >/dev/null
printf 'PB_SUPERUSER_EMAIL=admin@electroprice.com\nPB_SUPERUSER_PASSWORD=%s\n' "$pb_password" > "$APP/shared/env/pb-superuser.env"
chmod 600 "$APP/shared/env/pb-superuser.env"

ln -sfn "$RELEASE" "$APP/current"

find "$DOC" -mindepth 1 -maxdepth 1 ! -name .well-known -exec rm -rf {} +
cp -a "$RELEASE/public/." "$DOC/"
cp -a "$RELEASE/edge/.htaccess" "$DOC/.htaccess"
cp -a "$RELEASE/edge/health.html" "$DOC/health.html"
find "$DOC" -type d -exec chmod 755 {} +
find "$DOC" -type f -exec chmod 644 {} +

bash "$APP/current/ops/start-pb.sh"

( crontab -l 2>/dev/null | sed '/# electroprice-watchdog-start/,/# electroprice-watchdog-end/d'
  echo '# electroprice-watchdog-start'
  echo '* * * * * /usr/bin/flock -n /home/agingriouh/apps/electroprice/shared/run/watchdog.lock /home/agingriouh/apps/electroprice/current/ops/watchdog.sh >/dev/null 2>&1'
  echo '# electroprice-watchdog-end'
) | crontab -

sleep 3
curl -fsS http://127.0.0.1:18191/api/health >/dev/null

printf 'DEPLOYED %s\n' "$TS"
printf 'CURRENT=%s\n' "$(readlink -f "$APP/current")"
printf 'DOCROOT=%s\n' "$DOC"
printf 'PB_HEALTH=ok\n'
