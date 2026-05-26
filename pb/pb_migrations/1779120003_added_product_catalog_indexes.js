/// <reference path="../pb_data/types.d.ts" />
const normalizeCatalogText = (value) => (
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
)

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []

  try {
    const serialized = JSON.stringify(value)
    return serialized ? JSON.parse(serialized) : []
  } catch {
    return []
  }
}

const getValue = (value, key) => {
  if (!value) return undefined
  if (typeof value.get === "function") return value.get(key)
  return value[key]
}

const getProductIndexPayload = (record) => {
  const stock = toArray(record.get("wholesaler_stock"))
  const priceHistory = toArray(record.get("price_history"))
  const prices = stock
    .map((item) => Number(getValue(item, "price")))
    .filter((price) => Number.isFinite(price) && price > 0)
  const bestPrice = prices.length > 0 ? Math.min(...prices) : null
  const recentPrices = priceHistory
    .slice(-30)
    .map((item) => Number(getValue(item, "price")))
    .filter((price) => Number.isFinite(price) && price > 0)
  const isRecentDrop = bestPrice && recentPrices.length > 1
    ? bestPrice < Math.max(...recentPrices) * 0.9
    : false

  return {
    searchText: normalizeCatalogText([
      record.get("name"),
      record.get("brand"),
      record.get("category"),
      record.get("model_number"),
      record.get("canonical_key")
    ].filter(Boolean).join(" ")),
    bestPrice,
    totalStock: stock.reduce((sum, item) => sum + Math.max(0, Number(getValue(item, "stock")) || 0), 0),
    isDeal: Boolean(record.get("deal_tag") || record.get("old_price") || isRecentDrop),
    indexedAt: new Date().toISOString()
  }
}

const reindexExistingProducts = (app) => {
  const limit = 200
  let offset = 0

  while (true) {
    const records = app.findRecordsByFilter("products", "", "id", limit, offset)
    if (!records.length) return

    for (const record of records) {
      const index = getProductIndexPayload(record)
      record.set("search_text", index.searchText)
      record.set("best_price", index.bestPrice)
      record.set("total_stock", index.totalStock)
      record.set("is_deal", index.isDeal)
      record.set("indexed_at", index.indexedAt)
      app.save(record)
    }

    if (records.length < limit) return
    offset += records.length
  }
}

migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  const fields = [
    new Field({ "id": "text2179120300", "name": "search_text", "type": "text", "system": false, "required": false, "presentable": false, "hidden": false, "autogeneratePattern": "", "max": 0, "min": 0, "pattern": "", "primaryKey": false }),
    new Field({ "id": "number2179120301", "name": "best_price", "type": "number", "system": false, "required": false, "presentable": false, "hidden": false, "min": 0, "max": null, "onlyInt": false }),
    new Field({ "id": "number2179120302", "name": "total_stock", "type": "number", "system": false, "required": false, "presentable": false, "hidden": false, "min": 0, "max": null, "onlyInt": false }),
    new Field({ "id": "bool2179120303", "name": "is_deal", "type": "bool", "system": false, "required": false, "presentable": false, "hidden": false }),
    new Field({ "id": "date2179120304", "name": "indexed_at", "type": "date", "system": false, "required": false, "presentable": false, "hidden": false, "max": "", "min": "" })
  ]

  for (const field of fields) {
    collection.fields.add(field)
  }

  collection.indexes = Array.from(new Set([
    ...collection.indexes,
    "CREATE INDEX idx_products_category ON products (category)",
    "CREATE INDEX idx_products_search_text ON products (search_text)",
    "CREATE INDEX idx_products_best_price ON products (best_price)",
    "CREATE INDEX idx_products_total_stock ON products (total_stock)",
    "CREATE INDEX idx_products_avg_rating ON products (avg_rating)",
    "CREATE INDEX idx_products_review_count ON products (review_count)",
    "CREATE INDEX idx_products_is_deal ON products (is_deal)"
  ]))

  app.save(collection)
  reindexExistingProducts(app)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")
  for (const id of [
    "text2179120300",
    "number2179120301",
    "number2179120302",
    "bool2179120303",
    "date2179120304"
  ]) {
    collection.fields.removeById(id)
  }

  collection.indexes = collection.indexes.filter((index) =>
    !index.includes("idx_products_category") &&
    !index.includes("idx_products_search_text") &&
    !index.includes("idx_products_best_price") &&
    !index.includes("idx_products_total_stock") &&
    !index.includes("idx_products_avg_rating") &&
    !index.includes("idx_products_review_count") &&
    !index.includes("idx_products_is_deal")
  )

  return app.save(collection)
})
