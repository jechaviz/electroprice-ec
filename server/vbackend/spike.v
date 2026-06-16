module main

// Feasibility spike for the V backend: a CGI program (exec'd by a minimal PHP
// shim) that reads MySQL credentials from the host env file, queries MySQL via
// the mariadb CLI client already present on the host (no compile-time DB deps),
// and emits a CGI JSON response. Proves the V -> C -> gcc -> PHP-shim -> mariadb
// chain end to end before building the full PocketBase-compatible surface.

import os

const mariadb_bin = '/usr/bin/mariadb'

struct DbCreds {
mut:
	host string = 'localhost'
	db   string
	user string
	pass string
}

fn env_or(key string, def string) string {
	v := os.getenv(key)
	return if v == '' { def } else { v }
}

fn read_creds(path string) DbCreds {
	mut c := DbCreds{}
	content := os.read_file(path) or { return c }
	for line in content.split_into_lines() {
		l := line.trim_space()
		if l == '' || l.starts_with('#') {
			continue
		}
		parts := l.split_nth('=', 2)
		if parts.len != 2 {
			continue
		}
		key := parts[0].trim_space()
		val := parts[1].trim_space().trim('"\'')
		match key {
			'MYSQL_HOST' { c.host = val }
			'MYSQL_DATABASE' { c.db = val }
			'MYSQL_USER' { c.user = val }
			'MYSQL_PASSWORD' { c.pass = val }
			else {}
		}
	}
	return c
}

fn mysql_scalar(c DbCreds, query string) string {
	os.setenv('MYSQL_PWD', c.pass, true)
	cmd := '${mariadb_bin} -N --batch --raw --silent -h${c.host} -u${c.user} ${c.db} -e "${query}"'
	res := os.execute(cmd)
	if res.exit_code != 0 {
		return 'ERR'
	}
	return res.output.trim_space()
}

fn main() {
	method := env_or('REQUEST_METHOD', 'GET')
	env_path := env_or('PBM_MYSQL_ENV', '/home/agingriouh/apps/electroprice/shared/env/mysql.env')
	creds := read_creds(env_path)
	products := mysql_scalar(creds, 'SELECT COUNT(*) FROM pbm_products')
	apprecords := mysql_scalar(creds, 'SELECT COUNT(*) FROM app_records')
	print('Content-Type: application/json\r\n\r\n')
	print('{"ok":true,"engine":"v-cgi","method":"${method}","products":${products},"app_records":${apprecords}}')
}
