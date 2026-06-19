module main

import os
import x.json2
import pocketbase_mysql as pbm

// Independent Google sign-in (replaces PocketBase's authWithOAuth2 flow). The
// frontend obtains a Google ID token via Google Identity Services and POSTs it
// here as {credential}; we verify it against Google's tokeninfo endpoint (via
// the host curl), upsert the user, and mint our own JWT.
//
// Route: POST /pb/api/electroprice/auth/google
fn hook_google_auth(cfg pbm.Config, req pbm.Request) pbm.Response {
	client_id := os.getenv('PBM_GOOGLE_CLIENT_ID')
	if client_id == '' {
		return pbm.error_response(503, 'Google sign-in is not configured.')
	}
	obj := json2.decode[json2.Any](req.body) or { return pbm.error_response(400, 'Invalid body.') }
	bm := obj.as_map()
	credential := pbm.any_str(bm, 'credential')
	if credential == '' {
		return pbm.error_response(400, 'Missing Google credential.')
	}

	code, body := http_get('https://oauth2.googleapis.com/tokeninfo?id_token=${credential}',
		['Accept: application/json'])
	if code < 200 || code >= 300 {
		return pbm.error_response(401, 'Invalid Google credential.')
	}
	info := (json2.decode[json2.Any](body) or { return pbm.error_response(401, 'Invalid Google credential.') }).as_map()

	if pbm.any_str(info, 'aud') != client_id {
		return pbm.error_response(401, 'Google token audience mismatch.')
	}
	email := pbm.any_str(info, 'email')
	verified := pbm.any_str(info, 'email_verified')
	if email == '' || (verified != 'true' && verified != '1') {
		return pbm.error_response(401, 'Google email not verified.')
	}

	db := pbm.new_db(cfg)
	// `picture` is the standard OIDC avatar claim from Google; persist it so the
	// frontend (mappers.ts reads `avatar_url`) shows the real Google photo instead
	// of the pravatar placeholder.
	user_id := upsert_google_user(db, email, pbm.any_str(info, 'name'), pbm.any_str(info,
		'picture')) or {
		return pbm.error_response(500, 'Failed to provision user.')
	}
	rec := load_record(db, 'app_records', 'users', user_id) or {
		return pbm.error_response(500, 'User lookup failed.')
	}
	token := pbm.jwt_mint(cfg, user_id)
	record := pbm.sanitize_record(json2.Any(rec).json_str())
	return pbm.json_response(200, '{"token":${pbm.json_string(token)},"record":${record}}')
}

fn upsert_google_user(db pbm.Db, email string, name string, avatar string) ?string {
	path := '\$."email"'
	rows := db.query('SELECT `id` FROM `app_records` WHERE `collection`=${pbm.sql_quote('users')} AND JSON_UNQUOTE(JSON_EXTRACT(`data`, ${pbm.sql_quote(path)}))=${pbm.sql_quote(email)} LIMIT 1') or {
		return none
	}
	if rows.len > 0 && rows[0].len > 0 {
		existing_id := rows[0][0]
		// Returning user: refresh the Google profile in place. The avatar URL can
		// change, and accounts created before avatar capture have none — patch the
		// fields inside the JSON `data` column with JSON_SET. Only overwrite the
		// avatar when Google actually returned one, so we never blank an existing.
		now := pbm.pb_now()
		mut pairs := []string{}
		if avatar != '' {
			pairs << "${pbm.sql_quote('\$."avatar_url"')}, ${pbm.sql_quote(avatar)}"
		}
		if name != '' {
			pairs << "${pbm.sql_quote('\$."name"')}, ${pbm.sql_quote(name)}"
		}
		pairs << "${pbm.sql_quote('\$."updated"')}, ${pbm.sql_quote(now)}"
		db.exec('UPDATE `app_records` SET `data` = JSON_SET(`data`, ${pairs.join(', ')}), `updated`=${pbm.sql_quote(pbm.mysql_dt())} WHERE `collection`=${pbm.sql_quote('users')} AND `id`=${pbm.sql_quote(existing_id)}') or {
			return none
		}
		return existing_id
	}
	id := pbm.gen_id()
	now := pbm.pb_now()
	mut m := map[string]json2.Any{}
	m['id'] = json2.Any(id)
	m['email'] = json2.Any(email)
	m['name'] = json2.Any(name)
	m['avatar_url'] = json2.Any(avatar)
	m['role'] = json2.Any('user')
	m['verified'] = json2.Any(true)
	m['created'] = json2.Any(now)
	m['updated'] = json2.Any(now)
	m['collectionName'] = json2.Any('users')
	m['tokenKey'] = json2.Any(pbm.gen_id() + pbm.gen_id())
	data := json2.Any(m).json_str()
	db.exec('INSERT INTO `app_records` (`collection`,`id`,`created`,`updated`,`data`) VALUES (${pbm.sql_quote('users')}, ${pbm.sql_quote(id)}, ${pbm.sql_quote(pbm.mysql_dt())}, ${pbm.sql_quote(pbm.mysql_dt())}, ${pbm.sql_quote(data)})') or {
		return none
	}
	return id
}
