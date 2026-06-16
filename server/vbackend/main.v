module main

// ElectroPrice's PocketBase-independent backend: a thin consumer of the generic
// `pocketbase_mysql` V library. This file holds only the app-specific wiring —
// which collections exist and how they map to MySQL tables. All request
// handling, query translation, CRUD, and auth live in the library.

import pocketbase_mysql as pbm
import os

fn env_or(key string, def string) string {
	v := os.getenv(key)
	return if v == '' { def } else { v }
}

// The ElectroPrice collection layout:
//   products / wholesalers -> catalog, read-only, mirrored from PB SQLite
//   users / orders / reviews / telemetry -> app-owned, authoritative in MySQL
fn registry() pbm.Registry {
	product_columns := {
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
	return pbm.Registry{
		collections: {
			'products':    pbm.Collection{
				name:    'products'
				table:   'pbm_products'
				columns: product_columns
			}
			'wholesalers': pbm.Collection{
				name:               'wholesalers'
				table:              'pbm_records'
				requires_predicate: true
			}
			'users':       pbm.Collection{
				name:               'users'
				table:              'app_records'
				app_owned:          true
				requires_predicate: true
				auth_collection:    true
				public_create:      true
			}
			'orders':      pbm.Collection{
				name:               'orders'
				table:              'app_records'
				app_owned:          true
				requires_predicate: true
				owner_field:        'user_id'
			}
			'reviews':     pbm.Collection{
				name:               'reviews'
				table:              'app_records'
				app_owned:          true
				requires_predicate: true
				owner_field:        'author_id'
			}
			'telemetry':   pbm.Collection{
				name:               'telemetry'
				table:              'app_records'
				app_owned:          true
				requires_predicate: true
				public_create:      true
			}
		}
	}
}

fn app_config() pbm.Config {
	return pbm.Config{
		mysql_env_path: env_or('PBM_MYSQL_ENV', '/home/agingriouh/apps/electroprice/shared/env/mysql.env')
		auth_secret:    env_or('PBM_AUTH_SECRET', '')
		source:         'electroprice-v'
		registry:       registry()
	}
}

fn main() {
	cfg := app_config()
	req := pbm.parse_request()
	// TODO (custom hooks): dispatch /api/electroprice/* here first, then fall
	// back to the standard PocketBase surface below.
	resp := pbm.handle(cfg, req)
	resp.send()
}
