module main

// electroprice subshopping runtime worker (vhub/vimport binary).
//
// Compiles via C to a native binary and is invoked by server/subshopping-cron.php
// (flock-guarded cron). It drains a directory queue of purchase orders and, in
// the default NO-SUBMIT mode, writes a dry-run acknowledgement WITHOUT contacting
// any distributor or moving money. LIVE mode is intentionally refused in this
// build: real provider submission + payment is a per-provider, authorized step.
//
// Uses x.json2 (pure-V JSON) for decoding so the generated C has no cJSON
// thirdparty dependency and compiles standalone with the host's gcc.

import os
import time
import rand
import x.json2

fn last6(s string) string {
	return if s.len > 6 { s[s.len - 6..] } else { s }
}

// Sanitize to a safe JSON-string token (the only field derived from input).
fn safe_token(s string) string {
	mut out := []u8{}
	for c in s.to_upper() {
		if (c >= `A` && c <= `Z`) || (c >= `0` && c <= `9`) {
			out << c
		}
	}
	return if out.len > 0 { out.bytestr() } else { 'PROV' }
}

fn main() {
	mut mode := 'no-submit'
	for a in os.args[1..] {
		if a.starts_with('--mode=') {
			mode = a.all_after('--mode=')
		}
	}

	base := os.getenv_opt('PBM_SUBSHOP_DIR') or { '/home/agingriouh/apps/electroprice/shared/subshopping' }
	queue_dir := os.join_path(base, 'queue')
	acked_dir := os.join_path(base, 'acked')
	os.mkdir_all(acked_dir) or {}

	if !os.exists(queue_dir) {
		println('no queue dir: ${queue_dir}')
		return
	}

	files := os.ls(queue_dir) or { []string{} }
	mut processed := 0
	for f in files {
		if !f.ends_with('.json') {
			continue
		}
		path := os.join_path(queue_dir, f)
		content := os.read_file(path) or { continue }
		decoded := json2.decode[json2.Any](content) or {
			eprintln('skip ${f}: bad json')
			continue
		}
		m := decoded.as_map()
		provider_id := if v := m['providerId'] { v.str() } else { '' }
		po_id := if v := m['purchaseOrderId'] { v.str() } else { '' }

		if mode != 'no-submit' {
			// Real provider submission + payment is not enabled in this build.
			eprintln('refusing live submit for ${provider_id}: not authorized')
			continue
		}

		provider_order_id := 'DRYRUN-${safe_token(provider_id)}-${last6(po_id)}'
		trace_id := 'vhub_dryrun_${rand.ulid()}'
		acked_at := time.utc().format_rfc3339()
		ack := '{"ok":true,"providerOrderId":"${provider_order_id}","traceId":"${trace_id}",' +
			'"nextAction":"DRY-RUN (no-submit): orden validada; sin pedido ni pago real.",' +
			'"mode":"${mode}","ackedAt":"${acked_at}"}'

		os.write_file(os.join_path(acked_dir, f), ack) or {}
		os.rm(path) or {}
		processed++
		println('acked ${f} -> ${provider_order_id}')
	}

	println('processed ${processed} purchase order(s) mode=${mode}')
}
