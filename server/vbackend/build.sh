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

# The V fork at $V_BIN ships a panic-recovery builtin whose codegen emits an
# ABSOLUTE Windows include path for v_recover.h (e.g. "C:\git\v/vlib/builtin/
# v_recover.h"). That path does not exist on the Linux host, so gcc there fails.
# Make the bundle host-portable: vendor the header next to the generated C and
# rewrite every include of it to a relative path. v_recover.h only needs
# <setjmp.h>, so it is self-contained.
OUT_DIR="$(dirname "$OUT")"
RECOVER_H="$(dirname "$V_BIN")/vlib/builtin/v_recover.h"
if grep -q 'v_recover\.h' "$OUT"; then
	if [[ -f "$RECOVER_H" ]]; then
		cp "$RECOVER_H" "$OUT_DIR/v_recover.h"
	fi
	# slash-agnostic: any "...v_recover.h" include -> bare "v_recover.h"
	sed -i 's#"[^"]*v_recover\.h"#"v_recover.h"#g' "$OUT"
	echo "[build] vendored v_recover.h + rewrote include to relative (host-portable)"
fi

echo "[build] $SRC -> $OUT ($(wc -l < "$OUT") lines)"
echo "[build] ship $(basename "$OUT") + v_recover.h ; on server: gcc -w -O2 \"$(basename "$OUT")\" -o pbm-vbackend -lpthread -lm"
