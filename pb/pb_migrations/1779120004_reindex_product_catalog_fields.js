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
  reindexExistingProducts(app)
}, () => {})
