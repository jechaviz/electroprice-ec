module main

// Collection -> MySQL table mapping (port of the PHP DefaultSchemaRegistry).
//   products    -> pbm_products  (typed columns + data json; mirror-owned)
//   wholesalers -> pbm_records   (generic json; mirror-owned)
//   users/orders/reviews/telemetry -> app_records (generic json; app-owned)
struct CollectionSchema {
	collection          string
	table               string
	requires_collection bool
	columns             map[string]string // pb field -> sql column
}

fn schema_for(coll string) CollectionSchema {
	if coll == 'products' {
		return CollectionSchema{
			collection:          'products'
			table:               'pbm_products'
			requires_collection: false
			columns:             {
				'id':           'id'
				'created':      'created'
				'updated':      'updated'
				'name':         'name'
				'brand':        'brand'
				'category':     'category'
				'image_url':    'image_url'
				'search_text':  'search_text'
				'best_price':   'best_price'
				'total_stock':  'total_stock'
				'is_deal':      'is_deal'
				'avg_rating':   'avg_rating'
				'review_count': 'review_count'
			}
		}
	}
	if coll == 'wholesalers' {
		return CollectionSchema{
			collection:          'wholesalers'
			table:               'pbm_records'
			requires_collection: true
		}
	}
	if is_app_owned(coll) {
		return CollectionSchema{
			collection:          coll
			table:               'app_records'
			requires_collection: true
		}
	}
	return CollectionSchema{
		collection:          coll
		table:               'pbm_records'
		requires_collection: true
	}
}

fn is_app_owned(coll string) bool {
	return coll == 'users' || coll == 'orders' || coll == 'reviews' || coll == 'telemetry'
}

fn is_known_collection(coll string) bool {
	return coll == 'products' || coll == 'wholesalers' || is_app_owned(coll)
}

fn valid_ident(name string) bool {
	if name.len == 0 {
		return false
	}
	for i := 0; i < name.len; i++ {
		c := name[i]
		ok := (c >= `A` && c <= `Z`) || (c >= `a` && c <= `z`) || (c >= `0` && c <= `9`) || c == `_`
		if !ok {
			return false
		}
	}
	first := name[0]
	return (first >= `A` && first <= `Z`) || (first >= `a` && first <= `z`) || first == `_`
}

fn quote_ident(name string) !string {
	if !valid_ident(name) {
		return error('unsafe identifier ${name}')
	}
	return '`${name}`'
}

fn (s CollectionSchema) table_sql() string {
	return '`${s.table}`'
}

// SQL expression to read a pb field for filtering/sorting.
fn (s CollectionSchema) field_expr(field string, value_type string) !string {
	if field in s.columns {
		return quote_ident(s.columns[field])!
	}
	if field == 'id' || field == 'created' || field == 'updated' {
		return quote_ident(field)!
	}
	if !valid_ident(field) {
		return error('unsafe field ${field}')
	}
	json_expr := 'JSON_UNQUOTE(JSON_EXTRACT(`data`, ${sql_quote('\$."${field}"')}))'
	if value_type == 'bool' {
		return 'CASE WHEN ${json_expr} IN (${sql_quote('true')}, ${sql_quote('1')}) THEN 1 ELSE 0 END'
	}
	return json_expr
}
