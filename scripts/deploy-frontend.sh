#!/usr/bin/env bash
#
# Idempotent, safe frontend deploy for ElectroPrice (Spaceship cPanel static
# docroot). Designed so a flaky SSH connection can never leave the live site
# half-swapped (the failure mode that briefly took the catalog down once):
#
#   1. build                  -> dist/
#   2. bundle integrity guard  (Google client id present, /pb wired, NO localhost)
#   3. tar + upload with retry AND remote-size verification (no swap unless the
#      upload is byte-for-byte complete)
#   4. remote swap via STAGING: extract into a temp dir, verify it has index.html
#      + assets, back up the current docroot, then mv the new files into place.
#      The live assets are only removed AFTER the new ones are validated, so a
#      failed extract leaves the site untouched. On any step failure, roll back
#      from the backup taken this run.
#   5. post-deploy HTTP check from the client; auto-rollback if the live site is
#      not serving the new bundle.
#
# Server-only files (.htaccess, *.php shims, health.html, .well-known, pb_data,
# the V backend, ...) are never touched — only the static artifacts below.
#
# Usage:  bash scripts/deploy-frontend.sh [--skip-build]
# Env:    SSH_HOST (default: spaceship), DOCROOT, SITE_URL
set -uo pipefail

SSH_HOST="${SSH_HOST:-spaceship}"
DOCROOT="${DOCROOT:-/home/agingriouh/electroprice.appniverse.com}"
SITE_URL="${SITE_URL:-https://electroprice.appniverse.com}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS=(index.html assets i18n robots.txt sitemap.xml)
REMOTE_TGZ="/home/agingriouh/ep-fe.tgz"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=30 -o ServerAliveInterval=10)

log() { printf '\n\033[1;36m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31m[deploy] FATAL:\033[0m %s\n' "$*" >&2; exit 1; }

# Retry an SSH command up to 4 times (the host connection is intermittent).
ssh_retry() {
  local i out
  for i in 1 2 3 4; do
    if out="$(ssh "${SSH_OPTS[@]}" "$SSH_HOST" "$@" 2>&1)"; then
      printf '%s\n' "$out" | grep -vE "WARNING|post-quantum|decrypt|openssh\.com"
      return 0
    fi
    sleep $((i * 4))
  done
  printf '%s\n' "$out" | grep -vE "WARNING|post-quantum|decrypt|openssh\.com" >&2
  return 1
}

ssh_stdin_retry() {
  # pipe stdin file ($1) into a remote command ($2) with retry
  local file="$1" cmd="$2" i
  for i in 1 2 3 4; do
    if cat "$file" | ssh "${SSH_OPTS[@]}" "$SSH_HOST" "$cmd" 2>/dev/null; then
      return 0
    fi
    sleep $((i * 4))
  done
  return 1
}

cd "$REPO_ROOT"

# ---- 1. build -------------------------------------------------------------
if [[ "${1:-}" != "--skip-build" ]]; then
  log "building (npm run build)"
  npm run build >/dev/null 2>&1 || die "build failed (run 'npm run build' to see errors)"
fi
[[ -f dist/index.html ]] || die "dist/index.html missing — build did not produce output"

# ---- 2. integrity guard ---------------------------------------------------
log "verifying bundle integrity"
loc_count() { grep -rhoE "127\.0\.0\.1:[0-9]+|localhost:[0-9]+" dist 2>/dev/null | wc -l | tr -d ' '; }
[[ "$(loc_count)" == "0" ]] || die "bundle contains localhost URLs (wrong env baked in)"
grep -rqho 'apps.googleusercontent.com' dist/assets/*.js 2>/dev/null || die "Google client id missing from bundle (VITE_GOOGLE_CLIENT_ID not set)"
grep -rqho '/pb' dist/assets/*.js 2>/dev/null || die "/pb endpoint reference missing from bundle"
NEW_INDEX="$(grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' dist/index.html | head -1)"
log "bundle ok — $NEW_INDEX"

# ---- 3. tar + upload (verified) -------------------------------------------
TGZ="$(mktemp -t ep-fe.XXXXXX.tgz)"
trap 'rm -f "$TGZ"' EXIT
( cd dist && tar -czf "$TGZ" "${ARTIFACTS[@]}" 2>/dev/null ) || die "tar failed"
LOCAL_SIZE="$(wc -c < "$TGZ" | tr -d ' ')"
log "uploading ${LOCAL_SIZE}B (verified)"
UPLOADED=0
for attempt in 1 2 3 4; do
  if ssh_stdin_retry "$TGZ" "cat > $REMOTE_TGZ"; then
    REMOTE_SIZE="$(ssh_retry "wc -c < $REMOTE_TGZ" | tr -d ' \r')"
    [[ "$REMOTE_SIZE" == "$LOCAL_SIZE" ]] && { UPLOADED=1; break; }
    log "size mismatch (remote=$REMOTE_SIZE local=$LOCAL_SIZE), retrying"
  fi
  sleep $((attempt * 4))
done
[[ "$UPLOADED" == "1" ]] || die "upload could not be verified — live site untouched"

# ---- 4. remote swap via staging (self-rolling-back) -----------------------
log "swapping (staging -> live, with backup + rollback)"
ssh_retry "DOCROOT='$DOCROOT' REMOTE_TGZ='$REMOTE_TGZ' bash -s" <<'REMOTE' || die "remote swap failed"
set -uo pipefail
cd "$DOCROOT" || exit 1
[ -s "$REMOTE_TGZ" ] && gzip -t "$REMOTE_TGZ" 2>/dev/null || { echo "TARBALL_INVALID"; exit 1; }

STAGE="$DOCROOT/.deploy-stage-$$"
rm -rf "$STAGE"; mkdir -p "$STAGE"
tar -xzf "$REMOTE_TGZ" -C "$STAGE" || { echo "EXTRACT_FAIL"; rm -rf "$STAGE"; exit 1; }
# validate staging before touching anything live
[ -f "$STAGE/index.html" ] && [ -d "$STAGE/assets" ] && ls "$STAGE/assets"/*.js >/dev/null 2>&1 \
  || { echo "STAGE_INVALID"; rm -rf "$STAGE"; exit 1; }

TS="$(date +%Y%m%d%H%M%S)"
BACKUP="$HOME/electroprice-docroot-backup-$TS.tgz"
tar -czf "$BACKUP" index.html assets i18n robots.txt sitemap.xml 2>/dev/null
echo "BACKUP=$BACKUP"

rollback() {
  echo "ROLLING_BACK"
  tar -xzf "$BACKUP" -C "$DOCROOT" 2>/dev/null
  rm -rf "$STAGE"
}

# swap directories (assets, i18n) then files; mv is near-atomic on the same fs
for d in assets i18n; do
  [ -d "$STAGE/$d" ] || continue
  rm -rf "$DOCROOT/$d.old" 2>/dev/null
  [ -d "$DOCROOT/$d" ] && mv "$DOCROOT/$d" "$DOCROOT/$d.old"
  if ! mv "$STAGE/$d" "$DOCROOT/$d"; then rollback; exit 1; fi
  rm -rf "$DOCROOT/$d.old" 2>/dev/null
done
for f in index.html robots.txt sitemap.xml; do
  [ -f "$STAGE/$f" ] && mv -f "$STAGE/$f" "$DOCROOT/$f"
done
rm -rf "$STAGE"

find "$DOCROOT/assets" "$DOCROOT/i18n" -type d -exec chmod 755 {} \; 2>/dev/null
find "$DOCROOT/assets" "$DOCROOT/i18n" -type f -exec chmod 644 {} \; 2>/dev/null
chmod 644 "$DOCROOT/index.html" "$DOCROOT/robots.txt" "$DOCROOT/sitemap.xml" 2>/dev/null

# prune old backups (keep newest 8)
ls -t "$HOME"/electroprice-docroot-backup-*.tgz 2>/dev/null | tail -n +9 | xargs -r rm -f
rm -f "$REMOTE_TGZ"
echo "LIVE_INDEX=$(grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' "$DOCROOT/index.html" | head -1)"
echo "SWAP_OK"
REMOTE

# ---- 5. post-deploy HTTP verification (auto-rollback) ---------------------
log "verifying live site serves $NEW_INDEX"
sleep 2
LIVE_HTML="$(curl -s -m 20 "$SITE_URL/" 2>/dev/null)"
if printf '%s' "$LIVE_HTML" | grep -q "$NEW_INDEX"; then
  log "OK — live site is serving the new bundle ($NEW_INDEX)"
else
  log "live site is NOT serving $NEW_INDEX — rolling back to the last backup"
  ssh_retry "DOCROOT='$DOCROOT' bash -s" <<'REMOTE'
cd "$DOCROOT" || exit 1
LATEST="$(ls -t "$HOME"/electroprice-docroot-backup-*.tgz 2>/dev/null | head -1)"
[ -n "$LATEST" ] && tar -xzf "$LATEST" -C "$DOCROOT" && echo "ROLLED_BACK_TO=$LATEST"
REMOTE
  die "post-deploy check failed; rolled back. Investigate before retrying."
fi

# sanity: catalog API still answering
HTTP="$(curl -s -m 20 -o /dev/null -w '%{http_code}' "$SITE_URL/pb/api/collections/products/records?perPage=1" 2>/dev/null)"
log "catalog API: HTTP $HTTP"
log "done."
