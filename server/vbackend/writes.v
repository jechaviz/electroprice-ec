module main

import x.json2
import time
import encoding.base64

// Columns are datetime(3); store without the ISO 'T'/'Z' the JSON keeps.
fn mysql_dt() string {
	return time.utc().format_ss() + '.000'
}

// ---- access policy (mirrors the PocketBase collection rules) -------------

fn can_create(coll string, ctx AuthContext) bool {
	match coll {
		'users', 'telemetry' { return true } // signup / analytics are public
		'orders', 'reviews' { return ctx.is_authenticated() }
		else { return false } // products/wholesalers are catalog (read-only)
	}
}

fn can_mutate_existing(coll string, ctx AuthContext, existing map[string]json2.Any) bool {
	if ctx.is_admin() {
		return true
	}
	match coll {
		'users' { return ctx.owns(any_str(existing, 'id')) }
		'orders' { return ctx.owns(any_str(existing, 'user_id')) }
		'reviews' { return ctx.owns(any_str(existing, 'author_id')) }
		else { return false }
	}
}

// ---- create --------------------------------------------------------------

fn create_record(cfg Config, db Db, req Request, coll string) Response {
	if !is_app_owned(coll) {
		return error_response(404, "The requested resource wasn't found.")
	}
	ctx := resolve_auth(cfg, db, req)
	if !can_create(coll, ctx) {
		return error_response(403, "You are not allowed to perform this request.")
	}
	obj := json2.decode[json2.Any](req.body) or { return error_response(400, 'Invalid body.') }
	mut m := obj.as_map()

	if coll == 'users' {
		return create_user(cfg, db, mut m)
	}

	id := gen_id()
	now := pb_now()
	m['id'] = json2.Any(id)
	m['created'] = json2.Any(now)
	m['updated'] = json2.Any(now)
	m['collectionName'] = json2.Any(coll)

	// Bind ownership to the authenticated user, never trust the client.
	if coll == 'orders' {
		m['user_id'] = json2.Any(ctx.user_id)
	}
	if coll == 'reviews' {
		m['author_id'] = json2.Any(ctx.user_id)
	}

	record_json := json2.Any(m).json_str()
	db.exec('INSERT INTO `app_records` (`collection`,`id`,`created`,`updated`,`data`) VALUES (${sql_quote(coll)}, ${sql_quote(id)}, ${sql_quote(mysql_dt())}, ${sql_quote(mysql_dt())}, ${sql_quote(record_json)})') or {
		return error_response(500, 'Failed to create record.')
	}
	return json_response(200, record_json)
}

fn create_user(cfg Config, db Db, mut m map[string]json2.Any) Response {
	email := any_str(m, 'email')
	password := any_str(m, 'password')
	if email == '' || password == '' {
		return error_response(400, 'Missing email or password.')
	}
	if password.len < 8 {
		return error_response(400, 'Password must be at least 8 characters.')
	}
	if _ := load_user_by_email(db, email) {
		return error_response(400, 'Email already in use.')
	}
	hash := hash_password(password) or { return error_response(500, 'Hashing failed.') }

	id := gen_id()
	now := pb_now()
	m.delete('password')
	m.delete('passwordConfirm')
	m['id'] = json2.Any(id)
	m['created'] = json2.Any(now)
	m['updated'] = json2.Any(now)
	m['collectionName'] = json2.Any('users')
	m['passwordHash'] = json2.Any(hash)
	m['tokenKey'] = json2.Any(gen_id() + gen_id())
	if any_str(m, 'role') == '' {
		m['role'] = json2.Any('user')
	}
	if 'verified' !in m {
		m['verified'] = json2.Any(false)
	}

	record_json := json2.Any(m).json_str()
	db.exec('INSERT INTO `app_records` (`collection`,`id`,`created`,`updated`,`data`) VALUES (${sql_quote('users')}, ${sql_quote(id)}, ${sql_quote(mysql_dt())}, ${sql_quote(mysql_dt())}, ${sql_quote(record_json)})') or {
		return error_response(500, 'Failed to create user.')
	}
	return json_response(200, sanitize_user_json(record_json))
}

// ---- update --------------------------------------------------------------

fn update_record(cfg Config, db Db, req Request, coll string, id string) Response {
	if !is_app_owned(coll) {
		return error_response(404, "The requested resource wasn't found.")
	}
	ctx := resolve_auth(cfg, db, req)
	existing := load_app_record(db, coll, id) or {
		return error_response(404, "The requested resource wasn't found.")
	}
	mut em := existing.as_map()
	if !can_mutate_existing(coll, ctx, em) {
		return error_response(403, 'You are not allowed to perform this request.')
	}
	obj := json2.decode[json2.Any](req.body) or { return error_response(400, 'Invalid body.') }
	patch := obj.as_map()
	for k, v in patch {
		if k in ['id', 'created', 'collectionName', 'passwordHash', 'tokenKey'] {
			continue
		}
		if coll == 'users' && k == 'password' {
			hash := hash_password(v.str()) or { continue }
			em['passwordHash'] = json2.Any(hash)
			continue
		}
		if coll == 'orders' && k == 'user_id' {
			continue // ownership is immutable
		}
		if coll == 'reviews' && k == 'author_id' {
			continue
		}
		em[k] = v
	}
	em['updated'] = json2.Any(pb_now())
	record_json := json2.Any(em).json_str()
	db.exec('UPDATE `app_records` SET `updated` = ${sql_quote(mysql_dt())}, `data` = ${sql_quote(record_json)} WHERE `collection` = ${sql_quote(coll)} AND `id` = ${sql_quote(id)}') or {
		return error_response(500, 'Failed to update record.')
	}
	if coll == 'users' {
		return json_response(200, sanitize_user_json(record_json))
	}
	return json_response(200, record_json)
}

// ---- delete --------------------------------------------------------------

fn delete_record(cfg Config, db Db, req Request, coll string, id string) Response {
	if !is_app_owned(coll) {
		return error_response(404, "The requested resource wasn't found.")
	}
	ctx := resolve_auth(cfg, db, req)
	existing := load_app_record(db, coll, id) or {
		return error_response(404, "The requested resource wasn't found.")
	}
	if !can_mutate_existing(coll, ctx, existing.as_map()) {
		return error_response(403, 'You are not allowed to perform this request.')
	}
	db.exec('DELETE FROM `app_records` WHERE `collection` = ${sql_quote(coll)} AND `id` = ${sql_quote(id)}') or {
		return error_response(500, 'Failed to delete record.')
	}
	return Response{
		status: 204
		body:   ''
	}
}

fn load_app_record(db Db, coll string, id string) !json2.Any {
	rows := db.query('SELECT ${data_b64_expr} FROM `app_records` WHERE `collection` = ${sql_quote(coll)} AND `id` = ${sql_quote(id)} LIMIT 1')!
	if rows.len == 0 || rows[0].len == 0 {
		return error('not found')
	}
	return json2.decode[json2.Any](base64.decode_str(rows[0][0]))!
}
