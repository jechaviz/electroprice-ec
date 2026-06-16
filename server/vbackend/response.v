module main

// A CGI response. send() writes a "Status:" line + headers + blank line + body;
// the PHP shim parses these and re-emits them to the client.
struct Response {
	status  int = 200
	headers map[string]string
	body    string
}

fn json_response(status int, body string) Response {
	return Response{
		status:  status
		headers: {
			'Content-Type': 'application/json'
		}
		body:    body
	}
}

fn error_response(status int, message string) Response {
	return json_response(status, '{"code":${status},"message":${json_string(message)},"data":{}}')
}

fn (r Response) send() {
	print('Status: ${r.status}\r\n')
	mut has_ct := false
	for k, v in r.headers {
		print('${k}: ${v}\r\n')
		if k.to_lower() == 'content-type' {
			has_ct = true
		}
	}
	if !has_ct {
		print('Content-Type: application/json\r\n')
	}
	print('\r\n')
	print(r.body)
}
