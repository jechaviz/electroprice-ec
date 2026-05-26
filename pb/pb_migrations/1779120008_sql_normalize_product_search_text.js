/// <reference path="../pb_data/types.d.ts" />
const quoteSql = (value) => `'${String(value).replace(/'/g, "''")}'`

const normalizeSqlText = (expression) => {
  const replacements = [
    ['á', 'a'],
    ['é', 'e'],
    ['í', 'i'],
    ['ó', 'o'],
    ['ú', 'u'],
    ['ü', 'u'],
    ['ñ', 'n'],
    ['"', ' '],
    ["'", ' '],
    ['{', ' '],
    ['}', ' '],
    ['[', ' '],
    [']', ' '],
    [':', ' '],
    [',', ' '],
    ['.', ' '],
    ['/', ' '],
    ['\\', ' '],
    ['(', ' '],
    [')', ' '],
    ['|', ' '],
    [';', ' '],
    ['*', ' '],
    ['¿', ' '],
    ['?', ' '],
    ['¡', ' '],
    ['!', ' '],
    ['_', ' '],
    ['+', ' '],
    ['&', ' '],
  ]

  return replacements.reduce((sql, [from, to]) => `replace(${sql}, ${quoteSql(from)}, ${quoteSql(to)})`, expression)
}

const searchCorpusSql = `lower(trim(
  coalesce(name, '') || ' ' ||
  coalesce(brand, '') || ' ' ||
  coalesce(category, '') || ' ' ||
  coalesce(model_number, '') || ' ' ||
  coalesce(canonical_key, '') || ' ' ||
  coalesce(deal_tag, '') || ' ' ||
  coalesce(smart_tag, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(specs, '') || ' ' ||
  coalesce(canonical_ids, '') || ' ' ||
  coalesce(provider_aliases, '')
))`

migrate((app) => {
  app.db().newQuery(`
    UPDATE products
    SET
      search_text = substr(${normalizeSqlText(searchCorpusSql)}, 1, 4800),
      indexed_at = strftime('%Y-%m-%d %H:%M:%fZ', 'now')
  `).execute()
}, () => {})
