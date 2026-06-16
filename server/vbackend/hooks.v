module main

import os
import x.json2
import encoding.base64
import pocketbase_mysql as pbm

// ElectroPrice custom routes (ported from pb/pb_hooks/*.pb.js). Dispatched
// before the standard PocketBase surface; returns none when the path is not a
// custom route so main() falls back to pbm.handle().
fn route_hook(cfg pbm.Config, req pbm.Request) ?pbm.Response {
	path := pbm.normalize_path(req.path)
	if path == '/api/electroprice/rates/usd-mxn' && req.method == 'GET' {
		return hook_rates(cfg, req)
	}
	if path == '/api/electroprice/ai/generate-text' && req.method == 'POST' {
		return hook_ai(cfg, req)
	}
	if path == '/api/electroprice/auth/google' && req.method == 'POST' {
		return hook_google_auth(cfg, req)
	}
	rstock_prefix := '/api/electroprice/retailer/products/'
	if req.method == 'PATCH' && path.starts_with(rstock_prefix) && path.ends_with('/stock') {
		id := path[rstock_prefix.len..path.len - '/stock'.len]
		return hook_retailer_stock(cfg, req, pbm.url_decode(id))
	}
	commit_prefix := '/api/electroprice/checkout/orders/'
	if req.method == 'POST' && path.starts_with(commit_prefix) && path.ends_with('/commit') {
		id := path[commit_prefix.len..path.len - '/commit'.len]
		return hook_checkout_commit(cfg, req, pbm.url_decode(id))
	}
	return none
}

// ---- json helpers --------------------------------------------------------

fn mf64(m map[string]json2.Any, key string) f64 {
	return (m[key] or { return 0 }).f64()
}

fn load_record(db pbm.Db, table string, predicate string, id string) ?map[string]json2.Any {
	mut wheres := '`id`=${pbm.sql_quote(id)}'
	if predicate != '' {
		wheres += ' AND `collection`=${pbm.sql_quote(predicate)}'
	}
	rows := db.query('SELECT ${pbm.data_b64_expr} FROM `${table}` WHERE ${wheres} LIMIT 1') or { return none }
	if rows.len == 0 || rows[0].len == 0 {
		return none
	}
	obj := json2.decode[json2.Any](base64.decode_str(rows[0][0])) or { return none }
	return obj.as_map()
}

// ---- stock index (port of computeStockIndex) -----------------------------

struct StockIndex {
	best_price  f64
	has_best    bool
	total_stock int
	is_deal     bool
}

fn compute_stock_index(rows []json2.Any, product map[string]json2.Any) StockIndex {
	mut total := 0
	mut avail := []f64{}
	mut all := []f64{}
	for r in rows {
		rm := r.as_map()
		stock := int(mf64(rm, 'stock'))
		if stock > 0 {
			total += stock
		}
		price := mf64(rm, 'price')
		if price > 0 {
			all << price
			if stock > 0 {
				avail << price
			}
		}
	}
	prices := if avail.len > 0 || total > 0 { avail } else { all }
	mut best := 0.0
	mut has := false
	for p in prices {
		if !has || p < best {
			best = p
			has = true
		}
	}
	old_price := mf64(product, 'old_price')
	is_deal := (product['is_deal'] or { json2.Any(false) }).bool() || pbm.any_str(product, 'deal_tag') != ''
		|| old_price > 0
	return StockIndex{
		best_price:  best
		has_best:    has
		total_stock: total
		is_deal:     is_deal
	}
}

fn save_product(db pbm.Db, id string, mut pm map[string]json2.Any, rows []json2.Any, idx StockIndex) ! {
	pm['wholesaler_stock'] = json2.Any(rows)
	pm['best_price'] = if idx.has_best { json2.Any(idx.best_price) } else { json2.Any(json2.null) }
	pm['total_stock'] = json2.Any(idx.total_stock)
	pm['is_deal'] = json2.Any(idx.is_deal)
	pm['indexed_at'] = json2.Any(pbm.pb_now())
	data := json2.Any(pm).json_str()
	best_sql := if idx.has_best { idx.best_price.str() } else { 'NULL' }
	deal_sql := if idx.is_deal { '1' } else { '0' }
	db.exec('UPDATE `pbm_products` SET `data`=${pbm.sql_quote(data)}, `best_price`=${best_sql}, `total_stock`=${idx.total_stock}, `is_deal`=${deal_sql}, `updated`=${pbm.sql_quote(pbm.mysql_dt())} WHERE `id`=${pbm.sql_quote(id)}')!
}

// ---- retailer stock (PATCH .../retailer/products/{id}/stock) --------------

fn hook_retailer_stock(cfg pbm.Config, req pbm.Request, product_id string) pbm.Response {
	db := pbm.new_db(cfg)
	ctx := pbm.resolve_auth(cfg, db, req)
	if !ctx.is_authenticated() {
		return pbm.error_response(401, 'Authentication required.')
	}
	user := load_record(db, 'app_records', 'users', ctx.user_id) or {
		return pbm.error_response(401, 'Unauthorized.')
	}
	obj := json2.decode[json2.Any](req.body) or { return pbm.error_response(400, 'Invalid body.') }
	body := obj.as_map()

	is_admin := ctx.is_admin()
	mut retailer_id := pbm.any_str(user, 'retailer_id')
	if is_admin {
		mut rid := pbm.any_str(body, 'wholesalerId')
		if rid == '' {
			rid = pbm.any_str(body, 'retailerId')
		}
		if rid == '' {
			rid = pbm.any_str(user, 'retailer_id')
		}
		retailer_id = rid.trim_space()
	}
	if !is_admin && ctx.role != 'retailer' {
		return pbm.error_response(403, 'Only retailers can update retailer stock.')
	}
	if retailer_id == '' {
		return pbm.error_response(403, 'Retailer profile is missing retailer_id.')
	}

	price := mf64(body, 'price')
	if price < 0.01 || price > 100000000 {
		return pbm.error_response(400, 'price is outside the allowed range.')
	}
	stock := int(mf64(body, 'stock'))
	if stock < 0 || stock > 1000000 {
		return pbm.error_response(400, 'stock is outside the allowed range.')
	}

	mut product := load_record(db, 'pbm_products', '', product_id) or {
		return pbm.error_response(404, "The requested resource wasn't found.")
	}
	mut rows := (product['wholesaler_stock'] or { json2.Any([]json2.Any{}) }).arr()
	mut found := -1
	for i, r in rows {
		if pbm.any_str(r.as_map(), 'wholesalerId') == retailer_id {
			found = i
			break
		}
	}
	if found == -1 {
		return pbm.error_response(403, 'Retailer cannot update this product listing.')
	}
	mut rm := rows[found].as_map()
	rm['wholesalerId'] = json2.Any(retailer_id)
	rm['price'] = json2.Any(price)
	rm['stock'] = json2.Any(stock)
	rows[found] = json2.Any(rm)

	idx := compute_stock_index(rows, product)
	save_product(db, product_id, mut product, rows, idx) or {
		return pbm.error_response(500, 'Failed to update stock.')
	}
	best := if idx.has_best { idx.best_price.str() } else { 'null' }
	return pbm.json_response(200, '{"id":${pbm.json_string(product_id)},"bestPrice":${best},"totalStock":${idx.total_stock},"isDeal":${idx.is_deal}}')
}

// ---- checkout commit (POST .../checkout/orders/{id}/commit) ---------------

fn hook_checkout_commit(cfg pbm.Config, req pbm.Request, order_id string) pbm.Response {
	db := pbm.new_db(cfg)
	ctx := pbm.resolve_auth(cfg, db, req)
	if !ctx.is_authenticated() {
		return pbm.error_response(401, 'Authentication required.')
	}
	mut order := load_record(db, 'app_records', 'orders', order_id) or {
		return pbm.error_response(404, 'Order not found.')
	}
	order_user_id := pbm.any_str(order, 'user_id')
	if !ctx.is_admin() && order_user_id != ctx.user_id {
		return pbm.error_response(403, 'Cannot commit checkout for another user.')
	}
	mut user := load_record(db, 'app_records', 'users', order_user_id) or {
		return pbm.error_response(404, 'User not found.')
	}

	mut order_ids := (user['order_ids'] or { json2.Any([]json2.Any{}) }).arr()
	mut has_order := false
	for oid in order_ids {
		if oid.str() == order_id {
			has_order = true
			break
		}
	}
	if !has_order {
		order_ids << json2.Any(order_id)
	}

	// Already committed: just clear the cart and record the order id.
	if pbm.any_str(order, 'subshopping_status') != '' {
		user['cart'] = json2.Any([]json2.Any{})
		user['order_ids'] = json2.Any(order_ids)
		save_app_record(db, 'users', order_user_id, mut user) or {
			return pbm.error_response(500, 'Failed to update user.')
		}
		return pbm.json_response(200, '{"orderId":${pbm.json_string(order_id)},"alreadyCommitted":true,"products":[],"orderIds":${json2.Any(order_ids).json_str()}}')
	}

	items := (order['items'] or { json2.Any([]json2.Any{}) }).arr()
	if items.len == 0 {
		return pbm.error_response(400, 'Order has no checkout items.')
	}
	// Group reservations by product, then by wholesaler.
	mut by_product := map[string][]json2.Any{}
	for it in items {
		im := it.as_map()
		pid := pbm.any_str(im, 'productId').trim_space()
		wid := pbm.any_str(im, 'wholesalerId').trim_space()
		qty := int(mf64(im, 'quantity'))
		if pid == '' || wid == '' || qty < 1 {
			return pbm.error_response(400, 'Order contains an invalid checkout item.')
		}
		by_product[pid] << json2.Any({
			'wholesalerId': json2.Any(wid)
			'quantity':     json2.Any(qty)
		})
	}

	for pid, reservations in by_product {
		mut product := load_record(db, 'pbm_products', '', pid) or {
			return pbm.error_response(400, 'Product not found for checkout.')
		}
		mut rows := (product['wholesaler_stock'] or { json2.Any([]json2.Any{}) }).arr()
		for res in reservations {
			rmap := res.as_map()
			wid := pbm.any_str(rmap, 'wholesalerId')
			qty := int(mf64(rmap, 'quantity'))
			mut ri := -1
			for i, r in rows {
				if pbm.any_str(r.as_map(), 'wholesalerId') == wid {
					ri = i
					break
				}
			}
			if ri == -1 {
				return pbm.error_response(400, 'Requested wholesaler stock is no longer available.')
			}
			mut rm := rows[ri].as_map()
			avail := int(mf64(rm, 'stock'))
			if avail < qty {
				return pbm.error_response(400, 'Insufficient stock for checkout.')
			}
			rm['stock'] = json2.Any(avail - qty)
			rows[ri] = json2.Any(rm)
		}
		idx := compute_stock_index(rows, product)
		save_product(db, pid, mut product, rows, idx) or {
			return pbm.error_response(500, 'Failed to commit product stock.')
		}
	}

	user['cart'] = json2.Any([]json2.Any{})
	user['order_ids'] = json2.Any(order_ids)
	save_app_record(db, 'users', order_user_id, mut user) or {
		return pbm.error_response(500, 'Failed to update user.')
	}
	order['subshopping_status'] = json2.Any('Planning')
	save_app_record(db, 'orders', order_id, mut order) or {
		return pbm.error_response(500, 'Failed to update order.')
	}

	return pbm.json_response(200, '{"orderId":${pbm.json_string(order_id)},"alreadyCommitted":false,"orderIds":${json2.Any(order_ids).json_str()}}')
}

fn save_app_record(db pbm.Db, coll string, id string, mut m map[string]json2.Any) ! {
	m['updated'] = json2.Any(pbm.pb_now())
	data := json2.Any(m).json_str()
	db.exec('UPDATE `app_records` SET `data`=${pbm.sql_quote(data)}, `updated`=${pbm.sql_quote(pbm.mysql_dt())} WHERE `collection`=${pbm.sql_quote(coll)} AND `id`=${pbm.sql_quote(id)}')!
}

// ---- Banxico USD/MXN rate (GET .../rates/usd-mxn) ------------------------

fn rates_json(series string, source string, value f64, observed_at string, fetched_at string) pbm.Response {
	return pbm.json_response(200, '{"base":"USD","quote":"MXN","source":${pbm.json_string(source)},"series":${pbm.json_string(series)},"value":${value},"observedAt":${pbm.json_string(observed_at)},"fetchedAt":${pbm.json_string(fetched_at)}}')
}

fn hook_rates(cfg pbm.Config, req pbm.Request) pbm.Response {
	series := 'SF43718'
	fetched := pbm.pb_now()
	token := os.getenv('BANXICO_API_TOKEN')
	if token != '' {
		code, body := http_get('https://www.banxico.org.mx/SieAPIRest/service/v1/series/${series}/datos/oportuno',
			['Accept: application/json', 'Bmx-Token: ${token}'])
		if code >= 200 && code < 300 {
			obj := json2.decode[json2.Any](body) or { return pbm.error_response(502, 'Banxico parse error.') }
			bmx := (obj.as_map()['bmx'] or { json2.Any(map[string]json2.Any{}) }).as_map()
			ser := (bmx['series'] or { json2.Any([]json2.Any{}) }).arr()
			if ser.len > 0 {
				datos := (ser[0].as_map()['datos'] or { json2.Any([]json2.Any{}) }).arr()
				if datos.len > 0 {
					dm := datos[0].as_map()
					value := pbm.any_str(dm, 'dato').replace(',', '').trim_space().f64()
					if value > 0 {
						return rates_json(series, 'banxico_sie', value, pbm.any_str(dm, 'fecha'), fetched)
					}
				}
			}
		}
	}
	return pbm.error_response(502, 'USD/MXN rate unavailable (set BANXICO_API_TOKEN).')
}

// ---- Gemini text generation (POST .../ai/generate-text) ------------------

fn hook_ai(cfg pbm.Config, req pbm.Request) pbm.Response {
	db := pbm.new_db(cfg)
	ctx := pbm.resolve_auth(cfg, db, req)
	if !ctx.is_authenticated() {
		return pbm.error_response(401, 'Authentication required.')
	}
	mut api_key := os.getenv('GEMINI_API_KEY')
	if api_key == '' {
		api_key = os.getenv('GOOGLE_API_KEY')
	}
	if api_key == '' {
		return pbm.error_response(500, 'Server AI key is not configured.')
	}
	obj := json2.decode[json2.Any](req.body) or { return pbm.error_response(400, 'Invalid body.') }
	bm := obj.as_map()

	mut contents_json := ''
	if arr := bm['contents'] {
		a := arr.arr()
		if a.len > 0 {
			contents_json = json2.Any(a).json_str()
		}
	}
	if contents_json == '' {
		prompt := pbm.any_str(bm, 'prompt').trim_space()
		if prompt == '' {
			return pbm.error_response(400, 'AI request requires prompt or contents.')
		}
		contents_json = '[{"role":"user","parts":[{"text":${pbm.json_string(prompt)}}]}]'
	}
	mut payload := '{"contents":${contents_json}'
	sysi := pbm.any_str(bm, 'systemInstruction').trim_space()
	if sysi != '' {
		payload += ',"systemInstruction":{"parts":[{"text":${pbm.json_string(sysi)}}]}'
	}
	payload += '}'
	if payload.len > 20000 {
		return pbm.error_response(400, 'AI request is too large.')
	}

	mut model := os.getenv('GEMINI_MODEL')
	if model == '' {
		model = 'gemini-2.5-flash'
	}
	url := 'https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}'
	code, respbody := http_post_json(url, [], payload)
	if code < 200 || code >= 300 {
		return pbm.error_response(500, 'Gemini request failed with ${code}.')
	}
	robj := json2.decode[json2.Any](respbody) or { return pbm.json_response(200, '{"text":""}') }
	cands := (robj.as_map()['candidates'] or { json2.Any([]json2.Any{}) }).arr()
	mut text := ''
	if cands.len > 0 {
		content := (cands[0].as_map()['content'] or { json2.Any(map[string]json2.Any{}) }).as_map()
		parts := (content['parts'] or { json2.Any([]json2.Any{}) }).arr()
		for p in parts {
			text += pbm.any_str(p.as_map(), 'text')
		}
	}
	return pbm.json_response(200, '{"text":${pbm.json_string(text.trim_space())}}')
}
