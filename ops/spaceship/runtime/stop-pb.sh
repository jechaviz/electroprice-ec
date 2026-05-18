#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/agingriouh/apps/electroprice"
PID_FILE="$APP_ROOT/shared/run/pocketbase.pid"

if [[ ! -s "$PID_FILE" ]]; then
  exit 0
fi

pid="$(cat "$PID_FILE")"
if [[ -z "$pid" ]] || ! kill -0 "$pid" 2>/dev/null; then
  rm -f "$PID_FILE"
  exit 0
fi

cwd="$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)"
case "$cwd" in
  "$APP_ROOT"/releases/*)
    kill "$pid" 2>/dev/null || true
    ;;
  *)
    echo "Refusing to stop pid outside $APP_ROOT: $pid ($cwd)" >&2
    exit 1
    ;;
esac

rm -f "$PID_FILE"
