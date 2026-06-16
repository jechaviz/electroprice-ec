#!/usr/bin/env bash
#
# Transpile the vhub subshopping runtime to Linux C. Unlike the dep-free
# pocketbase backend, vhub uses V's `json` (cJSON) and `net.http` (TLS), so:
#   -d use_openssl : link the host's OpenSSL instead of bundling mbedtls
#   + ship V's thirdparty/cJSON/cJSON.{c,h} alongside the C
# On the host:
#   gcc -w -O2 vhub-runtime.c cJSON.c -I. -o vhub-runtime -lpthread -lm -lssl -lcrypto
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
V_BIN="${V_BIN:-/c/git/v/v.exe}"
V_ROOT="${V_ROOT:-/c/git/v}"

"$V_BIN" -os linux -gc none -d use_openssl -o "$SCRIPT_DIR/vhub-runtime.c" "$SCRIPT_DIR"
cp "$V_ROOT/thirdparty/cJSON/cJSON.c" "$V_ROOT/thirdparty/cJSON/cJSON.h" "$SCRIPT_DIR/"
echo "[build] transpiled vhub-runtime.c + bundled cJSON"
echo "[build] host: gcc -w -O2 vhub-runtime.c cJSON.c -I. -o vhub-runtime -lpthread -lm -lssl -lcrypto"
