#!/usr/bin/env bash
set -euo pipefail

PORT="${ELECTROPRICE_PB_PORT:-18191}"
if curl -fsS --max-time 5 "http://127.0.0.1:$PORT/api/health" >/dev/null; then
  exit 0
fi

exec /home/agingriouh/apps/electroprice/current/ops/start-pb.sh
