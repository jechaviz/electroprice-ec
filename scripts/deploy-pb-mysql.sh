#!/usr/bin/env bash
#
# Deploy the vendored PocketBase->MySQL translator (server/pb-mysql) to the
# spaceship host. Code deploy is safe and idempotent; the .htaccess route
# cutover (which removes the PocketBase proxy) only happens with --cutover.
#
# Usage:
#   scripts/deploy-pb-mysql.sh            # deploy translator code + endpoint + sync
#   scripts/deploy-pb-mysql.sh --cutover  # also flip docroot .htaccess to MySQL-only
#
set -euo pipefail

SSH_ALIAS="${SPACESHIP_SSH_ALIAS:-spaceship}"
APP_ROOT="/home/agingriouh/apps/electroprice"
LIB_ROOT="$APP_ROOT/shared/lib/pocketbase-mysql-translator"
DOCROOT="/home/agingriouh/electroprice.appniverse.com"
PB_HEALTH="http://127.0.0.1:18191/api/health"

CUTOVER=0
[ "${1:-}" = "--cutover" ] && CUTOVER=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$(cd "$SCRIPT_DIR/../server/pb-mysql" && pwd)"

echo "[deploy] packaging $PKG_DIR"
STAGE_TAR="$(mktemp -t pbmysql-XXXXXX).tar.gz"
trap 'rm -f "$STAGE_TAR"' EXIT
tar -czf "$STAGE_TAR" -C "$PKG_DIR" src bin public deploy composer.json

REMOTE_TAR="/home/agingriouh/apps/electroprice/incoming/pbmysql-deploy.tar.gz"
echo "[deploy] uploading to $SSH_ALIAS"
scp -q "$STAGE_TAR" "$SSH_ALIAS:$REMOTE_TAR"

echo "[deploy] installing on server (cutover=$CUTOVER)"
ssh -o BatchMode=yes "$SSH_ALIAS" \
  "APP_ROOT='$APP_ROOT' LIB_ROOT='$LIB_ROOT' DOCROOT='$DOCROOT' REMOTE_TAR='$REMOTE_TAR' CUTOVER='$CUTOVER' PB_HEALTH='$PB_HEALTH' bash -s" <<'REMOTE'
set -euo pipefail
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
tar -xzf "$REMOTE_TAR" -C "$STAGE"

# Translator library (src + bin) -> shared/lib (durable across releases).
mkdir -p "$LIB_ROOT"
cp -r "$STAGE/src" "$STAGE/bin" "$LIB_ROOT/"
mkdir -p "$LIB_ROOT/examples"
cp "$STAGE/deploy/electroprice-pbm-sync.sh" "$LIB_ROOT/examples/electroprice-pbm-sync.sh"
chmod +x "$LIB_ROOT/examples/electroprice-pbm-sync.sh" "$LIB_ROOT/bin/pbm-sync.php" 2>/dev/null || true

# Front controller into the public docroot.
cp "$STAGE/deploy/electroprice-docroot-endpoint.php" "$DOCROOT/pb-mysql-endpoint.php"

# Syntax-check the deployed PHP.
/usr/local/bin/php -l "$LIB_ROOT/src/PocketbaseMysqlTranslator.php"
/usr/local/bin/php -l "$DOCROOT/pb-mysql-endpoint.php"

if [ "$CUTOVER" = "1" ]; then
  ts="$(date +%Y%m%d%H%M%S)"
  cp "$DOCROOT/.htaccess" "$DOCROOT/.htaccess.bak-$ts"
  cp "$STAGE/deploy/electroprice.htaccess" "$DOCROOT/.htaccess"
  echo "[remote] htaccess cutover applied (backup .htaccess.bak-$ts)"
fi

echo "[remote] endpoint health:"
curl -fsS --max-time 8 "http://127.0.0.1/pb/api/health" -H "Host: electroprice.appniverse.com" 2>/dev/null || \
  echo "(local vhost probe skipped; verify via public URL)"
echo "[remote] done"
REMOTE

echo "[deploy] complete"
