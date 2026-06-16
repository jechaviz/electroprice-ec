module main

fn main() {
	cfg := load_config()
	db := new_db(cfg)
	req := parse_request()
	resp := route(cfg, db, req)
	resp.send()
}

// Strip the public `/pb` prefix and any trailing slash so both `/pb/api/...`
// (the storefront SDK base) and `/api/...` resolve the same.
fn normalize_path(p string) string {
	mut path := p
	if path.starts_with('/pb/') {
		path = path[3..]
	} else if path == '/pb' {
		path = '/'
	}
	if path.len > 1 && path.ends_with('/') {
		path = path[..path.len - 1]
	}
	return path
}

fn route(cfg Config, db Db, req Request) Response {
	path := normalize_path(req.path)

	if path == '/api/health' {
		return health(cfg, db)
	}

	if path == '/api/collections/users/auth-with-password' {
		if req.method == 'POST' {
			return auth_with_password(cfg, db, req)
		}
		return error_response(405, 'Method not allowed.')
	}
	if path == '/api/collections/users/auth-refresh' {
		if req.method == 'POST' {
			return auth_refresh(cfg, db, req)
		}
		return error_response(405, 'Method not allowed.')
	}

	if path.starts_with('/api/collections/') {
		rest := path['/api/collections/'.len..]
		parts := rest.split('/')
		if parts.len >= 2 && parts[1] == 'records' {
			coll := parts[0]
			if parts.len == 2 {
				match req.method {
					'GET' { return list_records(cfg, db, req, coll) }
					'POST' { return create_record(cfg, db, req, coll) }
					else { return error_response(405, 'Method not allowed.') }
				}
			} else if parts.len == 3 {
				id := url_decode(parts[2])
				match req.method {
					'GET' { return get_record(cfg, db, req, coll, id) }
					'PATCH' { return update_record(cfg, db, req, coll, id) }
					'DELETE' { return delete_record(cfg, db, req, coll, id) }
					else { return error_response(405, 'Method not allowed.') }
				}
			}
		}
	}

	return error_response(404, "The requested resource wasn't found.")
}

fn health(cfg Config, db Db) Response {
	db.scalar('SELECT 1') or { return error_response(503, 'API is unhealthy.') }
	return json_response(200, '{"code":200,"message":"API is healthy.","data":{"source":${json_string(cfg.source)},"engine":"v"}}')
}
