#!/usr/bin/env bash
#
# Transpile the V backend to a single self-contained Linux C file. Only the C is
# shipped to the host (compiled there with gcc); the host needs no V toolchain
# and no language runtime beyond the C binary and the minimal PHP shim.
#
#   -os linux : cross-target Linux from any dev OS (we build on Windows)
#   -gc none  : no Boehm GC dependency; safe for a short-lived per-request CGI
#
# Usage: build.sh [v-source] [c-output]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
V_BIN="${V_BIN:-/c/git/v/v.exe}"
# Default: transpile this consumer dir (main.v), which imports the
# pocketbase_mysql library from ~/.vmodules; the C bundles the library code.
SRC="${1:-$SCRIPT_DIR}"
OUT="${2:-$SCRIPT_DIR/pbm-vbackend.c}"

"$V_BIN" -os linux -gc none -o "$OUT" "$SRC"
echo "[build] $SRC -> $OUT ($(wc -l < "$OUT") lines)"
echo "[build] on server: gcc -w -O2 \"$(basename "$OUT")\" -o pbm-vbackend -lpthread -lm"
