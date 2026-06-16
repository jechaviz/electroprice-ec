module main

import os
import pocketbase_mysql as pbm

// Outbound HTTPS via the host curl binary, so the compiled C needs no TLS libs
// (consistent with the mariadb-CLI approach). Returns (status_code, body).

const curl_bin = '/usr/bin/curl'

fn curl_request(method string, url string, headers []string, body string) (int, string) {
	mut args := ['-s', '-m', '30', '-w', '\n%{http_code}', '-X', method]
	for h in headers {
		args << '-H'
		args << h
	}
	mut tmp := ''
	if body != '' {
		tmp = os.join_path(os.temp_dir(), 'pbmcurl_${pbm.gen_id()}.tmp')
		os.write_file(tmp, body) or {}
		args << '--data-binary'
		args << '@${tmp}'
	}
	args << url

	mut p := os.new_process(curl_bin)
	p.set_args(args)
	p.set_redirect_stdio()
	p.run()
	p.wait()
	out := p.stdout_slurp()
	p.close()
	if tmp != '' {
		os.rm(tmp) or {}
	}

	trimmed := out.trim_right('\n')
	idx := trimmed.last_index('\n') or { return 0, trimmed }
	code := trimmed[idx + 1..].trim_space().int()
	return code, trimmed[..idx]
}

fn http_get(url string, headers []string) (int, string) {
	return curl_request('GET', url, headers, '')
}

fn http_post_json(url string, headers []string, body string) (int, string) {
	mut h := ['Content-Type: application/json', 'Accept: application/json']
	h << headers
	return curl_request('POST', url, h, body)
}
