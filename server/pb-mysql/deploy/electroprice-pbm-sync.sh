#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/home/agingriouh/apps/electroprice}"
LIB_ROOT="${PBM_LIB_ROOT:-$APP_ROOT/shared/lib/pocketbase-mysql-translator}"
SQLITE_DB="${PBM_SQLITE_DB:-$APP_ROOT/shared/pb_data/data.db}"
MYSQL_ENV="${PBM_MYSQL_ENV:-$APP_ROOT/shared/env/mysql.env}"
LOCK_FILE="${PBM_SYNC_LOCK_FILE:-$APP_ROOT/shared/run/pbm-sync.lock}"
LOG_FILE="${PBM_SYNC_LOG_FILE:-$APP_ROOT/shared/logs/pbm-sync.log}"
BATCH_SIZE="${PBM_SYNC_BATCH_SIZE:-50}"
# Invoke the PHP CLI binary explicitly: cron runs with a minimal PATH where bare
# `php` resolves to the CGI SAPI, in which $argv is not populated and the sync
# fatals (emitting an HTTP 500 into the log) instead of running.
PHP_BIN="${PBM_PHP:-/usr/local/bin/php}"

mkdir -p "$(dirname "$LOCK_FILE")" "$(dirname "$LOG_FILE")"

if [ -f "$LOG_FILE" ] && [ "$(wc -c < "$LOG_FILE")" -gt "${PBM_SYNC_LOG_MAX_BYTES:-5242880}" ]; then
  mv "$LOG_FILE" "$LOG_FILE.$(date +%Y%m%d%H%M%S).bak"
fi

printf '[%s] pbm-sync start\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG_FILE"
"$PHP_BIN" "$LIB_ROOT/bin/pbm-sync.php" sync \
  --sqlite="$SQLITE_DB" \
  --mysql-env="$MYSQL_ENV" \
  --collections=products \
  --batch-size="$BATCH_SIZE" \
  --source=electroprice-pb-sqlite \
  --lock-file="$LOCK_FILE" >> "$LOG_FILE" 2>&1
printf '[%s] pbm-sync complete\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG_FILE"
