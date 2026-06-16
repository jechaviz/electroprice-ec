module main

import os

// Runtime configuration, sourced from the environment the PHP shim / docroot
// endpoint exports. No application secret ever lives in the V source.
struct Config {
	mysql_env_path   string
	auth_secret      string
	google_client_id string
	source           string
	token_ttl        i64
}

fn env_or(key string, def string) string {
	v := os.getenv(key)
	return if v == '' { def } else { v }
}

fn load_config() Config {
	mut ttl := env_or('PBM_TOKEN_TTL', '1209600').i64() // 14 days
	if ttl <= 0 {
		ttl = 1209600
	}
	return Config{
		mysql_env_path:   env_or('PBM_MYSQL_ENV', '/home/agingriouh/apps/electroprice/shared/env/mysql.env')
		auth_secret:      env_or('PBM_AUTH_SECRET', '')
		google_client_id: env_or('PBM_GOOGLE_CLIENT_ID', '')
		source:           env_or('PBM_SOURCE', 'v-backend')
		token_ttl:        ttl
	}
}
