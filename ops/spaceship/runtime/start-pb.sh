#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/agingriouh/apps/electroprice"
CURRENT="$APP_ROOT/current"
SHARED="$APP_ROOT/shared"
PORT="${ELECTROPRICE_PB_PORT:-18191}"
DATA_DIR="$SHARED/pb_data"
LOG_DIR="$SHARED/logs"
RUN_DIR="$SHARED/run"
PID_FILE="$RUN_DIR/pocketbase.pid"
PB_BIN="$CURRENT/bin/pocketbase"

mkdir -p "$DATA_DIR" "$LOG_DIR" "$RUN_DIR"

if [[ -s "$PID_FILE" ]]; then
  pid="$(cat "$PID_FILE")"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    if [[ "$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)" == "$(readlink -f "$CURRENT" 2>/dev/null)" ]]; then
      exit 0
    fi
  fi
fi

chmod 700 "$DATA_DIR" "$LOG_DIR" "$RUN_DIR"
chmod +x "$PB_BIN"

cd "$CURRENT"
nohup "$PB_BIN" serve \
  --http "127.0.0.1:$PORT" \
  --dir "$DATA_DIR" \
  --migrationsDir "$CURRENT/pb_migrations" \
  >> "$LOG_DIR/pocketbase.log" 2>&1 &

echo "$!" > "$PID_FILE"
