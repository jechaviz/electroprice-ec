/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  app.db().newQuery(`
    UPDATE products
    SET
      search_text = substr(lower(trim(
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
      )), 1, 4800),
      best_price = coalesce(
        (
          SELECT min(CAST(json_extract(stock.value, '$.price') AS REAL))
          FROM json_each(products.wholesaler_stock) AS stock
          WHERE CAST(json_extract(stock.value, '$.stock') AS REAL) > 0
            AND CAST(json_extract(stock.value, '$.price') AS REAL) > 0
        ),
        CASE
          WHEN coalesce((
            SELECT sum(
              CASE
                WHEN CAST(json_extract(stock.value, '$.stock') AS REAL) > 0
                  THEN CAST(json_extract(stock.value, '$.stock') AS REAL)
                ELSE 0
              END
            )
            FROM json_each(products.wholesaler_stock) AS stock
          ), 0) > 0 THEN 0
          ELSE coalesce((
            SELECT min(CAST(json_extract(stock.value, '$.price') AS REAL))
            FROM json_each(products.wholesaler_stock) AS stock
            WHERE CAST(json_extract(stock.value, '$.price') AS REAL) > 0
          ), 0)
        END
      ),
      total_stock = coalesce((
        SELECT sum(
          CASE
            WHEN CAST(json_extract(stock.value, '$.stock') AS REAL) > 0
              THEN CAST(json_extract(stock.value, '$.stock') AS REAL)
            ELSE 0
          END
        )
        FROM json_each(products.wholesaler_stock) AS stock
      ), 0),
      is_deal = CASE
        WHEN coalesce(deal_tag, '') != '' OR coalesce(old_price, 0) > 0 THEN TRUE
        ELSE FALSE
      END,
      indexed_at = strftime('%Y-%m-%d %H:%M:%fZ', 'now')
  `).execute()
}, () => {})
