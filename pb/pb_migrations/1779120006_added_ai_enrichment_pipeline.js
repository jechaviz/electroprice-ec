/// <reference path="../pb_data/types.d.ts" />
const categoryValues = [
  "laptops", "desktops", "monitors", "smartphones", "tablets", "tvs", "headphones", "audio",
  "cameras", "gaming", "networking", "printers_scanners", "components", "storage",
  "security", "power", "software", "accessories"
]
const adminRule = "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\""
const watchlistRule = `${adminRule} || (user_id != "" && user_id = @request.auth.id)`

const collectionExists = (app, name) => {
  try {
    app.findCollectionByNameOrId(name)
    return true
  } catch {
    return false
  }
}

const getFieldByName = (collection, name) => {
  try {
    return collection.fields.getByName(name)
  } catch {
    return null
  }
}

const saveCollection = (app, definition) => {
  const fields = definition.fields || []
  const indexes = definition.indexes || []
  const collection = collectionExists(app, definition.name)
    ? app.findCollectionByNameOrId(definition.name)
    : new Collection({
      name: definition.name,
      type: definition.type,
      listRule: definition.listRule,
      viewRule: definition.viewRule,
      createRule: definition.createRule,
      updateRule: definition.updateRule,
      deleteRule: definition.deleteRule
    })

  for (const key of ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"]) {
    collection[key] = definition[key]
  }
  for (const field of fields) {
    if (!getFieldByName(collection, field.name)) collection.fields.add(field)
  }
  collection.indexes = Array.from(new Set([...(collection.indexes || []), ...indexes]))
  app.save(collection)
}

const textField = (id, name, required = false) => new Field({
  id, name, type: "text", required, system: false, hidden: false, presentable: false,
  autogeneratePattern: "", max: 0, min: 0, pattern: "", primaryKey: false
})
const numberField = (id, name) => new Field({
  id, name, type: "number", system: false, hidden: false, presentable: false,
  min: 0, max: null, onlyInt: false
})
const dateField = (id, name) => new Field({
  id, name, type: "date", system: false, hidden: false, presentable: false, max: "", min: ""
})
const jsonField = (id, name) => new Field({
  id, name, type: "json", system: false, hidden: false, presentable: false, maxSize: 0
})
const selectField = (id, name, values) => new Field({
  id, name, type: "select", system: false, hidden: false, presentable: false,
  required: false, maxSelect: 1, values
})

const updateProductCategories = (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")
  const category = collection.fields.getByName("category")
  if (category) category.values = categoryValues
  collection.indexes = Array.from(new Set([
    ...collection.indexes,
    "CREATE INDEX idx_products_content_score ON products (content_score)",
    "CREATE INDEX idx_products_enrichment_status ON products (enrichment_status)"
  ]))
  app.save(collection)
}

migrate((app) => {
  updateProductCategories(app)
  saveCollection(app, {
    name: "ai_enrichment_runs",
    type: "base",
    listRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    viewRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    createRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    updateRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120601", "batch_id", true), textField("text1779120602", "status"),
      numberField("number1779120603", "item_count"), numberField("number1779120604", "applied_count"),
      numberField("number1779120605", "rejected_count"), textField("text1779120606", "model"),
      textField("text1779120607", "prompt_version"), textField("text1779120608", "input_hash"),
      dateField("date1779120609", "started_at"), dateField("date1779120610", "finished_at"),
      textField("text1779120611", "notes")
    ],
    indexes: ["CREATE UNIQUE INDEX idx_ai_enrichment_runs_batch ON ai_enrichment_runs (batch_id)"]
  })
  saveCollection(app, {
    name: "ai_enrichment_patches",
    type: "base",
    listRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    viewRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    createRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    updateRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120612", "patch_id", true), textField("text1779120613", "product_id"),
      textField("text1779120614", "canonical_key"), textField("text1779120615", "status"),
      numberField("number1779120616", "confidence"), jsonField("json1779120617", "fields"),
      jsonField("json1779120618", "source_refs"), textField("text1779120619", "input_hash"),
      textField("text1779120620", "patch_hash"), textField("text1779120621", "model"),
      textField("text1779120622", "prompt_version"), dateField("date1779120623", "applied_at"),
      textField("text1779120624", "error")
    ],
    indexes: ["CREATE UNIQUE INDEX idx_ai_enrichment_patches_patch ON ai_enrichment_patches (patch_id)"]
  })
  saveCollection(app, {
    name: "provider_refresh_queue",
    type: "base",
    listRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    viewRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    createRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    updateRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120625", "provider"), textField("text1779120626", "sku"),
      selectField("select1779120627", "refresh_type", ["visible_price_watchlist", "product_content_media", "semantic_enrichment"]),
      selectField("select1779120628", "priority", ["low", "normal", "high"]),
      selectField("select1779120629", "status", ["pending", "running", "ready", "failed"]),
      numberField("number1779120630", "attempts"), dateField("date1779120631", "not_before"),
      jsonField("json1779120632", "payload"), textField("text1779120633", "last_error")
    ],
    indexes: ["CREATE INDEX idx_provider_refresh_queue_status ON provider_refresh_queue (status, priority, not_before)"]
  })
  saveCollection(app, {
    name: "provider_offers",
    type: "base",
    listRule: adminRule, viewRule: adminRule,
    createRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    updateRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120634", "provider", true), textField("text1779120635", "sku", true),
      textField("text1779120636", "product_id"), numberField("number1779120637", "price"),
      numberField("number1779120638", "stock"), textField("text1779120639", "currency"),
      textField("text1779120640", "warehouse"), dateField("date1779120641", "expires_at"),
      selectField("select1779120642", "status", ["ready", "stale", "failed"]), jsonField("json1779120643", "raw_payload")
    ],
    indexes: ["CREATE INDEX idx_provider_offers_lookup ON provider_offers (provider, sku, status)"]
  })
  saveCollection(app, {
    name: "product_price_watchlist",
    type: "base",
    listRule: watchlistRule, viewRule: watchlistRule,
    createRule: "@request.auth.id != \"\" || @request.auth.collectionName = \"_superusers\"",
    updateRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120644", "provider"), textField("text1779120645", "sku"),
      textField("text1779120646", "product_id"), textField("text1779120647", "user_id"),
      textField("text1779120648", "session_id"), dateField("date1779120649", "last_viewed_at"),
      dateField("date1779120650", "offer_expires_at"), selectField("select1779120651", "priority", ["low", "normal", "visible"]),
      jsonField("json1779120652", "context")
    ],
    indexes: ["CREATE INDEX idx_product_price_watchlist_visible ON product_price_watchlist (last_viewed_at, offer_expires_at)"]
  })
  saveCollection(app, {
    name: "provider_product_content",
    type: "base",
    listRule: adminRule, viewRule: adminRule,
    createRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    updateRule: "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120653", "provider"), textField("text1779120654", "sku"),
      textField("text1779120655", "product_id"), jsonField("json1779120656", "payload"),
      jsonField("json1779120657", "source_refs"), dateField("date1779120658", "fetched_at")
    ],
    indexes: ["CREATE INDEX idx_provider_product_content_product ON provider_product_content (product_id, fetched_at)"]
  })
}, (app) => {
  for (const name of ["ai_enrichment_runs", "ai_enrichment_patches", "provider_refresh_queue", "provider_offers", "product_price_watchlist", "provider_product_content"]) {
    if (collectionExists(app, name)) app.delete(app.findCollectionByNameOrId(name))
  }
})
