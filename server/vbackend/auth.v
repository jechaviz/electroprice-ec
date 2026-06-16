module main

import crypto.hmac
import crypto.sha256
import crypto.bcrypt
import crypto.rand as crand
import encoding.base64
import x.json2
import time

// ---- identifiers, time, json helpers ------------------------------------

const id_alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'

fn gen_id() string {
	b := crand.bytes(15) or { return time.now().unix_milli().str() }
	mut s := []u8{}
	for x in b {
		s << id_alphabet[int(x) % id_alphabet.len]
	}
	return s.bytestr()
}

fn pb_now() string {
	return time.utc().format_ss() + '.000Z'
}

fn any_str(m map[string]json2.Any, key string) string {
	v := m[key] or { return '' }
	if v is string {
		return v
	}
	return v.str()
}

// ---- password hashing (bcrypt, like PocketBase) --------------------------

fn hash_password(plain string) !string {
	return bcrypt.generate_from_password(plain.bytes(), bcrypt.default_cost)
}

fn verify_password(plain string, hash string) bool {
	bcrypt.compare_hash_and_password(plain.bytes(), hash.bytes()) or { return false }
	return true
}

// ---- JWT (HS256), payload carries `exp` for the PB SDK's authStore --------

fn b64url(data []u8) string {
	return base64.url_encode(data).trim_right('=')
}

fn jwt_mint(cfg Config, user_id string) string {
	header := b64url('{"alg":"HS256","typ":"JWT"}'.bytes())
	exp := time.now().unix() + cfg.token_ttl
	payload_json := '{"id":${json_string(user_id)},"type":"authRecord","collectionName":"users","exp":${exp}}'
	payload := b64url(payload_json.bytes())
	signing_input := '${header}.${payload}'
	sig := hmac.new(cfg.auth_secret.bytes(), signing_input.bytes(), sha256.sum, sha256.block_size)
	return '${signing_input}.${b64url(sig)}'
}

// Verify signature + expiry and return the subject id, or '' if invalid.
fn jwt_subject(cfg Config, token string) string {
	parts := token.split('.')
	if parts.len != 3 {
		return ''
	}
	signing_input := '${parts[0]}.${parts[1]}'
	expected := b64url(hmac.new(cfg.auth_secret.bytes(), signing_input.bytes(), sha256.sum,
		sha256.block_size))
	if !hmac.equal(expected.bytes(), parts[2].bytes()) {
		return ''
	}
	payload_raw := base64.url_decode_str(pad_b64(parts[1]))
	obj := json2.decode[json2.Any](payload_raw) or { return '' }
	m := obj.as_map()
	exp := (m['exp'] or { json2.Any(0) }).int()
	if exp != 0 && time.now().unix() >= exp {
		return ''
	}
	return any_str(m, 'id')
}

fn pad_b64(s string) string {
	rem := s.len % 4
	if rem == 0 {
		return s
	}
	return s + '='.repeat(4 - rem)
}

// ---- auth context --------------------------------------------------------

struct AuthContext {
	user_id string
	role    string
}

fn (a AuthContext) is_authenticated() bool {
	return a.user_id != ''
}

fn (a AuthContext) is_admin() bool {
	return a.role == 'admin'
}

fn (a AuthContext) owns(uid string) bool {
	return a.user_id != '' && a.user_id == uid
}

// Resolve the principal from the request bearer token.
fn resolve_auth(cfg Config, db Db, req Request) AuthContext {
	if cfg.auth_secret == '' {
		return AuthContext{}
	}
	token := request_token()
	if token == '' {
		return AuthContext{}
	}
	uid := jwt_subject(cfg, token)
	if uid == '' {
		return AuthContext{}
	}
	rec := load_user_by_id(db, uid) or { return AuthContext{} }
	m := rec.as_map()
	return AuthContext{
		user_id: uid
		role:    any_str(m, 'role')
	}
}

// ---- user lookups (app_records, collection=users) ------------------------

fn load_user_by_id(db Db, id string) !json2.Any {
	rows := db.query('SELECT ${data_b64_expr} FROM `app_records` WHERE `collection` = ${sql_quote('users')} AND `id` = ${sql_quote(id)} LIMIT 1')!
	if rows.len == 0 || rows[0].len == 0 {
		return error('not found')
	}
	return json2.decode[json2.Any](base64.decode_str(rows[0][0]))!
}

fn load_user_by_email(db Db, email string) !json2.Any {
	path := '\$."email"'
	rows := db.query('SELECT ${data_b64_expr} FROM `app_records` WHERE `collection` = ${sql_quote('users')} AND JSON_UNQUOTE(JSON_EXTRACT(`data`, ${sql_quote(path)})) = ${sql_quote(email)} LIMIT 1')!
	if rows.len == 0 || rows[0].len == 0 {
		return error('not found')
	}
	return json2.decode[json2.Any](base64.decode_str(rows[0][0]))!
}

// ---- sanitize: never expose auth secrets ---------------------------------

const user_secret_fields = ['password', 'passwordHash', 'tokenKey', 'passwordConfirm', 'oldPassword']

fn sanitize_user_json(raw string) string {
	obj := json2.decode[json2.Any](raw) or { return raw }
	mut m := obj.as_map()
	for f in user_secret_fields {
		m.delete(f)
	}
	return json2.Any(m).json_str()
}

// ---- auth endpoints ------------------------------------------------------

fn auth_with_password(cfg Config, db Db, req Request) Response {
	if cfg.auth_secret == '' {
		return error_response(500, 'Auth not configured.')
	}
	obj := json2.decode[json2.Any](req.body) or { return error_response(400, 'Invalid body.') }
	m := obj.as_map()
	identity := any_str(m, 'identity')
	password := any_str(m, 'password')
	if identity == '' || password == '' {
		return error_response(400, 'Missing credentials.')
	}
	rec := load_user_by_email(db, identity) or {
		return error_response(400, 'Failed to authenticate.')
	}
	um := rec.as_map()
	stored := any_str(um, 'passwordHash')
	if stored == '' || !verify_password(password, stored) {
		return error_response(400, 'Failed to authenticate.')
	}
	token := jwt_mint(cfg, any_str(um, 'id'))
	record := sanitize_user_json(rec.json_str())
	return json_response(200, '{"token":${json_string(token)},"record":${record}}')
}

fn auth_refresh(cfg Config, db Db, req Request) Response {
	ctx := resolve_auth(cfg, db, req)
	if !ctx.is_authenticated() {
		return error_response(401, 'The request requires valid record authorization token.')
	}
	rec := load_user_by_id(db, ctx.user_id) or { return error_response(401, 'Unauthorized.') }
	token := jwt_mint(cfg, ctx.user_id)
	record := sanitize_user_json(rec.json_str())
	return json_response(200, '{"token":${json_string(token)},"record":${record}}')
}
