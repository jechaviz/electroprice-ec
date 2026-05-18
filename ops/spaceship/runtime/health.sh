#!/usr/bin/env bash
set -euo pipefail

PORT="${ELECTROPRICE_PB_PORT:-18191}"
curl -fsS "http://127.0.0.1:$PORT/api/health"
