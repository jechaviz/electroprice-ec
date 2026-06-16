module main

import os

#include <unistd.h>

fn C.read(fd int, buf voidptr, count usize) int

struct Request {
	method string
	path   string
	body   string
mut:
	query map[string]string
}

// Read the entire request body from stdin (the PHP shim pipes it in).
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

fn hex_val(c u8) int {
	if c >= `0` && c <= `9` {
		return int(c - `0`)
	}
	if c >= `a` && c <= `f` {
		return int(c - `a`) + 10
	}
	if c >= `A` && c <= `F` {
		return int(c - `A`) + 10
	}
	return -1
}

fn url_decode(s string) string {
	mut out := []u8{}
	mut i := 0
	for i < s.len {
		c := s[i]
		if c == `+` {
			out << ` `
			i++
		} else if c == `%` && i + 2 < s.len {
			hi := hex_val(s[i + 1])
			lo := hex_val(s[i + 2])
			if hi >= 0 && lo >= 0 {
				out << u8(hi * 16 + lo)
				i += 3
			} else {
				out << c
				i++
			}
		} else {
			out << c
			i++
		}
	}
	return out.bytestr()
}

fn parse_query(qs string) map[string]string {
	mut q := map[string]string{}
	if qs == '' {
		return q
	}
	for pair in qs.split('&') {
		if pair == '' {
			continue
		}
		kv := pair.split_nth('=', 2)
		key := url_decode(kv[0])
		val := if kv.len == 2 { url_decode(kv[1]) } else { '' }
		q[key] = val
	}
	return q
}

fn parse_request() Request {
	method := env_or('REQUEST_METHOD', 'GET')
	uri := env_or('REQUEST_URI', '')
	mut path := uri
	if path.contains('?') {
		path = path.all_before('?')
	}
	qs := env_or('QUERY_STRING', '')
	mut body := ''
	if method == 'POST' || method == 'PATCH' || method == 'PUT' || method == 'DELETE' {
		body = read_stdin()
	}
	return Request{
		method: method
		path:   path
		body:   body
		query:  parse_query(qs)
	}
}

// Bearer/raw token from the Authorization header (surfaced via CGI env). Apache
// must be told to forward it (E=HTTP_AUTHORIZATION) — handled in the htaccess.
fn request_token() string {
	mut auth := os.getenv('HTTP_AUTHORIZATION')
	if auth == '' {
		auth = os.getenv('REDIRECT_HTTP_AUTHORIZATION')
	}
	if auth == '' {
		return ''
	}
	if auth.to_lower().starts_with('bearer ') {
		return auth[7..].trim_space()
	}
	return auth.trim_space()
}
