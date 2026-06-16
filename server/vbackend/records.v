module main

import encoding.base64

// TO_BASE64() wraps its output with a newline every 76 chars; strip those so
// each record's encoded `data` stays on a single TSV line.
const data_b64_expr = "REPLACE(REPLACE(TO_BASE64(`data`), CHAR(10), ''), CHAR(13), '')"

fn int_or(s string, def int) int {
	if s == '' {
		return def
	}
	return s.int()
}

fn list_records(cfg Config, db Db, req Request, coll string) Response {
	if !is_known_collection(coll) {
		return error_response(404, "The requested resource wasn't found.")
	}
	s := schema_for(coll)

	mut wheres := []string{}
	if s.requires_collection {
		wheres << '`collection` = ${sql_quote(coll)}'
	}
	filter_str := req.query['filter'] or { '' }
	if filter_str.trim_space() != '' {
		where_clause := compile_filter(s, filter_str) or { return error_response(400, 'Invalid filter.') }
		wheres << '(${where_clause})'
	}
	where_sql := if wheres.len > 0 { ' WHERE ' + wheres.join(' AND ') } else { '' }

	order_sql := compile_sort(s, req.query['sort'] or { '' })

	page := int_or(req.query['page'] or { '1' }, 1)
	mut per := int_or(req.query['perPage'] or { '30' }, 30)
	if per < 1 {
		per = 1
	}
	if per > 500 {
		per = 500
	}
	offset := (page - 1) * per

	total := (db.scalar('SELECT COUNT(*) FROM ${s.table_sql()}${where_sql}') or {
		return error_response(500, 'Query failed.')
	}).int()

	rows := db.query('SELECT ${data_b64_expr} FROM ${s.table_sql()}${where_sql}${order_sql} LIMIT ${per} OFFSET ${offset}') or {
		return error_response(500, 'Query failed.')
	}

	fields := parse_fields(req.query['fields'] or { '' })
	mut items := []string{}
	for r in rows {
		if r.len == 0 {
			continue
		}
		raw := base64.decode_str(r[0])
		items << project_record(raw, coll, fields)
	}

	total_pages := if per > 0 { (total + per - 1) / per } else { 0 }
	body := '{"page":${page},"perPage":${per},"totalItems":${total},"totalPages":${total_pages},"items":[${items.join(',')}]}'
	return json_response(200, body)
}

fn get_record(cfg Config, db Db, req Request, coll string, id string) Response {
	if !is_known_collection(coll) {
		return error_response(404, "The requested resource wasn't found.")
	}
	s := schema_for(coll)
	mut wheres := ['`id` = ${sql_quote(id)}']
	if s.requires_collection {
		wheres << '`collection` = ${sql_quote(coll)}'
	}
	rows := db.query('SELECT ${data_b64_expr} FROM ${s.table_sql()} WHERE ${wheres.join(' AND ')} LIMIT 1') or {
		return error_response(500, 'Query failed.')
	}
	if rows.len == 0 || rows[0].len == 0 {
		return error_response(404, "The requested resource wasn't found.")
	}
	raw := base64.decode_str(rows[0][0])
	fields := parse_fields(req.query['fields'] or { '' })
	return json_response(200, project_record(raw, coll, fields))
}
