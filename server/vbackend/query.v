module main

import x.json2

// ---- PocketBase filter expression -> SQL WHERE ---------------------------
// Supports the subset the storefront emits: comparisons (= != > >= < <= ~ !~),
// && / ||, parentheses, string and number literals. Values are parameter-safe
// via sql_quote(); identifiers are validated before use.

struct Token {
	kind string // 'ident' 'string' 'number' 'op' '&&' '||' '(' ')' 'eof'
	val  string
}

fn lex_filter(s string) ![]Token {
	mut toks := []Token{}
	mut i := 0
	for i < s.len {
		c := s[i]
		if c == ` ` || c == `\t` || c == `\n` || c == `\r` {
			i++
			continue
		}
		if c == `(` {
			toks << Token{'(', ''}
			i++
			continue
		}
		if c == `)` {
			toks << Token{')', ''}
			i++
			continue
		}
		if c == `&` && i + 1 < s.len && s[i + 1] == `&` {
			toks << Token{'&&', ''}
			i += 2
			continue
		}
		if c == `|` && i + 1 < s.len && s[i + 1] == `|` {
			toks << Token{'||', ''}
			i += 2
			continue
		}
		if c == `>` {
			if i + 1 < s.len && s[i + 1] == `=` {
				toks << Token{'op', '>='}
				i += 2
			} else {
				toks << Token{'op', '>'}
				i++
			}
			continue
		}
		if c == `<` {
			if i + 1 < s.len && s[i + 1] == `=` {
				toks << Token{'op', '<='}
				i += 2
			} else {
				toks << Token{'op', '<'}
				i++
			}
			continue
		}
		if c == `=` {
			toks << Token{'op', '='}
			i++
			continue
		}
		if c == `!` {
			if i + 1 < s.len && s[i + 1] == `=` {
				toks << Token{'op', '!='}
				i += 2
			} else if i + 1 < s.len && s[i + 1] == `~` {
				toks << Token{'op', '!~'}
				i += 2
			} else {
				return error('unexpected !')
			}
			continue
		}
		if c == `~` {
			toks << Token{'op', '~'}
			i++
			continue
		}
		if c == `"` {
			mut sb := []u8{}
			i++
			for i < s.len {
				ch := s[i]
				if ch == `\\` && i + 1 < s.len {
					nxt := s[i + 1]
					if nxt == `"` {
						sb << `"`
						i += 2
						continue
					}
					if nxt == `\\` {
						sb << `\\`
						i += 2
						continue
					}
					sb << ch
					i++
					continue
				}
				if ch == `"` {
					i++
					break
				}
				sb << ch
				i++
			}
			toks << Token{'string', sb.bytestr()}
			continue
		}
		if c == `-` || (c >= `0` && c <= `9`) {
			mut j := i + 1
			for j < s.len && ((s[j] >= `0` && s[j] <= `9`) || s[j] == `.`) {
				j++
			}
			toks << Token{'number', s[i..j]}
			i = j
			continue
		}
		if (c >= `A` && c <= `Z`) || (c >= `a` && c <= `z`) || c == `_` {
			mut j := i + 1
			for j < s.len {
				d := s[j]
				if (d >= `A` && d <= `Z`) || (d >= `a` && d <= `z`) || (d >= `0` && d <= `9`)
					|| d == `_` || d == `.` {
					j++
				} else {
					break
				}
			}
			toks << Token{'ident', s[i..j]}
			i = j
			continue
		}
		return error('unexpected character in filter')
	}
	toks << Token{'eof', ''}
	return toks
}

struct FilterParser {
	schema CollectionSchema
	toks   []Token
mut:
	pos int
}

fn (mut p FilterParser) peek() Token {
	return p.toks[p.pos]
}

fn (mut p FilterParser) next() Token {
	t := p.toks[p.pos]
	p.pos++
	return t
}

fn (mut p FilterParser) parse_or() !string {
	mut left := p.parse_and()!
	for p.peek().kind == '||' {
		p.next()
		right := p.parse_and()!
		left = '(${left} OR ${right})'
	}
	return left
}

fn (mut p FilterParser) parse_and() !string {
	mut left := p.parse_unary()!
	for p.peek().kind == '&&' {
		p.next()
		right := p.parse_unary()!
		left = '(${left} AND ${right})'
	}
	return left
}

fn (mut p FilterParser) parse_unary() !string {
	if p.peek().kind == '(' {
		p.next()
		inner := p.parse_or()!
		if p.peek().kind != ')' {
			return error('expected )')
		}
		p.next()
		return '(${inner})'
	}
	return p.parse_comparison()
}

fn (mut p FilterParser) parse_comparison() !string {
	field_tok := p.next()
	if field_tok.kind != 'ident' {
		return error('expected field')
	}
	op_tok := p.next()
	if op_tok.kind != 'op' {
		return error('expected operator')
	}
	val_tok := p.next()
	value_type := if val_tok.kind == 'number' { 'number' } else { 'string' }
	field_sql := p.schema.field_expr(field_tok.val, value_type)!

	if op_tok.val == '~' {
		return '${field_sql} LIKE ${like_value(val_tok)!}'
	}
	if op_tok.val == '!~' {
		return '${field_sql} NOT LIKE ${like_value(val_tok)!}'
	}
	return '${field_sql} ${op_tok.val} ${scalar_value(val_tok)!}'
}

fn scalar_value(tok Token) !string {
	if tok.kind == 'number' {
		return tok.val // lexer guarantees digits/./- only
	}
	if tok.kind == 'string' {
		return sql_quote(tok.val)
	}
	return error('expected literal value')
}

fn like_value(tok Token) !string {
	if tok.kind != 'string' && tok.kind != 'number' {
		return error('expected literal value')
	}
	return sql_quote('%${tok.val}%')
}

fn compile_filter(s CollectionSchema, filter string) !string {
	toks := lex_filter(filter)!
	mut p := FilterParser{
		schema: s
		toks:   toks
	}
	result := p.parse_or()!
	if p.peek().kind != 'eof' {
		return error('unexpected trailing tokens')
	}
	return result
}

// ---- sort ----------------------------------------------------------------

fn compile_sort(s CollectionSchema, sort string) string {
	if sort.trim_space() == '' {
		return ' ORDER BY `id`'
	}
	mut parts := []string{}
	for raw in sort.split(',') {
		mut f := raw.trim_space()
		if f == '' {
			continue
		}
		mut dir := 'ASC'
		if f.starts_with('-') {
			dir = 'DESC'
			f = f[1..]
		} else if f.starts_with('+') {
			f = f[1..]
		}
		expr := s.field_expr(f, 'string') or { continue }
		parts << '${expr} ${dir}'
	}
	if parts.len == 0 {
		return ' ORDER BY `id`'
	}
	return ' ORDER BY ' + parts.join(', ')
}

// ---- fields projection ---------------------------------------------------

fn parse_fields(s string) []string {
	mut out := []string{}
	if s.trim_space() == '' {
		return out
	}
	for part in s.split(',') {
		f := part.trim_space()
		if f != '' {
			out << f
		}
	}
	return out
}

// Return the record JSON, projected to the requested fields if any.
fn project_record(raw string, coll string, fields []string) string {
	if fields.len == 0 {
		return raw
	}
	decoded := json2.decode[json2.Any](raw) or { return raw }
	m := decoded.as_map()
	mut out := map[string]json2.Any{}
	for f in fields {
		out[f] = m[f] or { continue }
	}
	return json2.Any(out).json_str()
}
