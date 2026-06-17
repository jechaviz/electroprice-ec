#!/usr/bin/env bash
# Read-only Ingram sandbox path probe. Determines which catalog path the app's
# subscribed API products actually match (to resolve InvalidAPICallAsNoApiProduct
# MatchFound). Prints ONLY HTTP codes + Apigee fault codes — never secrets.
# Catalog GET only; no orders. Run from repo root.
set -u
ENVF="${1:-.env}"
val() { grep -E "^$1=" "$ENVF" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r'; }

CID="$(val INGRAM_CLIENT_ID)"
CSEC="$(val INGRAM_CLIENT_SECRET)"
CUST="$(val INGRAM_CUSTOMER_NUMBER)"
SENDER="$(val INGRAM_SENDER_ID)"
APIENV="$(val INGRAM_API_ENV)"
BASE="https://api.ingrammicro.com"

echo "creds present: client_id=$([ -n "$CID" ] && echo yes) secret=$([ -n "$CSEC" ] && echo yes) customer=$([ -n "$CUST" ] && echo yes) sender=$([ -n "$SENDER" ] && echo yes) api_env=$APIENV"

echo "== OAuth client_credentials =="
TOK="$(curl -s -m 30 -X POST "$BASE/oauth/oauth20/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: application/json' \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode "client_id=$CID" \
  --data-urlencode "client_secret=$CSEC" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).access_token||"")}catch(e){}})')"
if [ -z "$TOK" ]; then echo "  OAuth FAILED (no token)"; exit 1; fi
echo "  OAuth OK (token acquired, ${#TOK} chars)"

probe() {
  local path="$1"
  local url="$BASE$path?pageNumber=1&pageSize=1&keyword=cable"
  local body
  body="$(curl -s -m 30 -w $'\n%{http_code}' "$url" \
    -H "Authorization: Bearer $TOK" -H 'Accept: application/json' \
    -H "IM-CustomerNumber: $CUST" -H 'IM-CountryCode: MX' \
    -H "IM-SenderID: $SENDER" -H 'IM-CorrelationID: ep-probe-0001')"
  local code; code="$(printf '%s' "$body" | tail -1)"
  local json; json="$(printf '%s' "$body" | sed '$d')"
  local fault; fault="$(printf '%s' "$json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.fault&&(j.fault.faultstring||(j.fault.detail&&j.fault.detail.errorcode)))||(j.errors&&j.errors[0]&&j.errors[0].message)||(j.catalog?("catalog["+(j.catalog.length||0)+"]"):"")||JSON.stringify(j).slice(0,90))}catch(e){process.stdout.write("(non-json "+s.slice(0,60)+")")}})')"
  printf '  %-40s -> HTTP %s | %s\n' "$path" "$code" "$fault"
}

echo "== catalog path candidates =="
probe "/resellers/v6/catalog"
probe "/sandbox/resellers/v6/catalog"
probe "/sandbox/resellers/v6/catalog/"
probe "/sandbox/catalog/v6"
