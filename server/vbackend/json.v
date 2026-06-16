module main

// Encode a Go/JS-style JSON string literal (quotes + escapes) for a raw string.
fn json_string(s string) string {
	mut out := []u8{}
	out << `"`
	for i := 0; i < s.len; i++ {
		c := s[i]
		match c {
			`"` { out << `\\`; out << `"` }
			`\\` { out << `\\`; out << `\\` }
			`\n` { out << `\\`; out << `n` }
			`\r` { out << `\\`; out << `r` }
			`\t` { out << `\\`; out << `t` }
			else {
				if c < 0x20 {
					out << '\\u00${c:02x}'.bytes()
				} else {
					out << c
				}
			}
		}
	}
	out << `"`
	return out.bytestr()
}
