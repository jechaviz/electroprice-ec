module main

import os

// MySQL access via the host's mariadb CLI client (already present), so the
// compiled C binary needs no MySQL client library at gcc time. Arguments are
// passed directly to the process (no shell), so the only injection surface is
// the SQL itself, which is built with sql_quote() for all string values.

const mariadb_bin = '/usr/bin/mariadb'

struct DbCreds {
mut:
	host string = 'localhost'
	db   string
	user string
	pass string
}

struct Db {
	creds DbCreds
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

fn new_db(cfg Config) Db {
	return Db{
		creds: read_creds(cfg.mysql_env_path)
	}
}

// Quote a string value for safe inlining into SQL (mirrors the PHP CLI executor).
fn sql_quote(value string) string {
	mut s := value.replace('\\', '\\\\')
	s = s.replace("'", "\\'")
	s = s.replace('\n', '\\n')
	s = s.replace('\r', '\\r')
	s = s.replace('\0', '\\0')
	return "'${s}'"
}

// query runs SQL and returns rows of columns split on TAB. Columns that may
// contain arbitrary bytes (JSON) must be wrapped in TO_BASE64() by the caller.
fn (d Db) query(statement string) ![][]string {
	os.setenv('MYSQL_PWD', d.creds.pass, true)
	mut p := os.new_process(mariadb_bin)
	p.set_args(['-N', '--batch', '--raw', '--silent', '--default-character-set=utf8mb4',
		'-h${d.creds.host}', '-u${d.creds.user}', d.creds.db, '-e', statement])
	p.set_redirect_stdio()
	p.run()
	p.wait()
	out := p.stdout_slurp()
	errout := p.stderr_slurp()
	code := p.code
	p.close()
	if code != 0 {
		return error(errout.trim_space())
	}
	mut rows := [][]string{}
	trimmed := out.trim_right('\n')
	if trimmed == '' {
		return rows
	}
	for line in trimmed.split('\n') {
		rows << line.split('\t')
	}
	return rows
}

// exec runs a statement that returns no rows.
fn (d Db) exec(statement string) ! {
	d.query(statement) or { return err }
}

// scalar returns the first column of the first row, or '' .
fn (d Db) scalar(statement string) !string {
	rows := d.query(statement)!
	if rows.len == 0 || rows[0].len == 0 {
		return ''
	}
	return rows[0][0]
}
