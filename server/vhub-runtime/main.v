module main

// ElectroPrice subshopping runtime backed by the real `vhub` integration
// framework, deployed as a native CGI binary (V -> C -> host gcc) behind a
// minimal PHP shim at /runtime/vhub.
//
// It receives a purchase order from the storefront, loads the provider's real
// AIS spec through vhub (proving the framework + provider specs work), validates
// the provider is API/order capable, and returns a structured RuntimeSubmission.
// It is a NO-SUBMIT runtime by design: it registers/acknowledges the order and
// never places an irreversible wholesale order against a provider.

import os
import x.json2
import vhub

#include <unistd.h>

fn C.read(fd int, buf voidptr, count usize) int

const spec_root = '/home/agingriouh/apps/electroprice/shared/providers/api_integrator'

// Providers that are API + order capable (route to vhub). Mirrors catalog.json.
const order_capable = ['cva', 'ingram_mexico', 'ctonline']

fn env_or(key string, def string) string {
	v := os.getenv(key)
	return if v == '' { def } else { v }
}

fn read_stdin() string {
	mut data := []u8{}
	mut buf := []u8{len: 8192}
	for {
		n := C.read(0, buf.data, usize(8192))
		if n <= 0 {
			break
		}
		data << buf[..n]
	}
	return data.bytestr()
}

fn respond(status int, body string) {
	print('Status: ${status}\r\nContent-Type: application/json\r\n\r\n')
	print(body)
}

fn json_str(s string) string {
	mut out := []u8{}
	out << `"`
	for i := 0; i < s.len; i++ {
		c := s[i]
		if c == `"` || c == `\\` {
			out << `\\`
			out << c
		} else if c == `\n` {
			out << `\\`
			out << `n`
		} else if c >= 0x20 {
			out << c
		}
	}
	out << `"`
	return out.bytestr()
}

fn any_str(m map[string]json2.Any, key string) string {
	v := m[key] or { return '' }
	if v is string {
		return v
	}
	return v.str()
}

fn trace_id(prefix string) string {
	return '${prefix}_${os.getenv('UNIQUE_ID')}${time_suffix()}'
}

fn time_suffix() string {
	return os.getenv('REQUEST_TIME') + '${os.getpid()}'
}

fn submission(ok bool, order_id string, trace string, next string) string {
	mut parts := ['"ok":${ok}', '"traceId":${json_str(trace)}']
	if order_id != '' {
		parts << '"providerOrderId":${json_str(order_id)}'
	}
	if next != '' {
		parts << '"nextAction":${json_str(next)}'
	}
	return '{' + parts.join(',') + '}'
}

fn normalize_path(uri string) string {
	mut p := uri
	if p.contains('?') {
		p = p.all_before('?')
	}
	if p.starts_with('/runtime/vhub') {
		p = p['/runtime/vhub'.len..]
	}
	if p == '' {
		p = '/'
	}
	return p
}

fn main() {
	method := env_or('REQUEST_METHOD', 'GET')
	path := normalize_path(env_or('REQUEST_URI', '/'))

	if path == '/healthz' || path == '/health' || path == '/' {
		respond(200, '{"ok":true,"runtime":"vhub","mode":"no-submit"}')
		return
	}
	if method == 'POST' && path == '/subshopping/purchase-orders' {
		handle_purchase_order(read_stdin())
		return
	}
	respond(404, '{"ok":false,"error":"not found"}')
}

fn handle_purchase_order(body string) {
	obj := json2.decode[json2.Any](body) or {
		respond(400, submission(false, '', trace_id('vhub'), 'Invalid request body.'))
		return
	}
	m := obj.as_map()
	po_id := any_str(m, 'purchaseOrderId')
	provider := any_str(m, 'providerId')
	trace := trace_id('vhub')

	if provider == '' || po_id == '' {
		respond(400, submission(false, '', trace, 'Missing purchaseOrderId or providerId.'))
		return
	}
	if provider !in order_capable {
		respond(200, submission(false, '', trace, 'Proveedor sin spec de orden API; registrar onboarding.'))
		return
	}

	// Real vhub usage: load the provider's AIS spec.
	spec_path := '${spec_root}/${provider}_ai.yaml'
	spec := vhub.load_spec(spec_path) or {
		respond(200, submission(false, '', trace, 'No se pudo cargar la spec del proveedor (${provider}).'))
		return
	}
	actions := spec.action_names()
	policy := spec.security_policy()

	order_ref := 'VHUB-${provider.to_upper()}-${po_id}'
	next := 'Orden registrada vía vhub (no-submit, ${actions.len} acciones, TLS=${policy.require_tls}). Confirmar envío en la consola del proveedor.'
	respond(200, submission(true, order_ref, trace, next))
}
