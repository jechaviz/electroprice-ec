/// <reference path="../pb_data/types.d.ts" />
const adminRule = "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\""

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

const saveCollection = (app, definition) => {
  const collection = collectionExists(app, definition.name)
    ? app.findCollectionByNameOrId(definition.name)
    : new Collection({
      name: definition.name,
      type: "base",
      listRule: definition.listRule,
      viewRule: definition.viewRule,
      createRule: definition.createRule,
      updateRule: definition.updateRule,
      deleteRule: definition.deleteRule
    })

  for (const key of ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"]) {
    collection[key] = definition[key]
  }
  for (const field of definition.fields || []) {
    if (!getFieldByName(collection, field.name)) collection.fields.add(field)
  }
  collection.indexes = Array.from(new Set([...(collection.indexes || []), ...(definition.indexes || [])]))
  app.save(collection)
}

const addProductCurationFields = (app) => {
  const collection = app.findCollectionByNameOrId("products")
  const fields = [
    textField("text1779120901", "manual_category_path"),
    textField("text1779120902", "semantic_category_path"),
    selectField("select1779120903", "category_review_status", ["needs_manual_review", "manual_rule_applied", "manual_verified", "rejected"]),
    jsonField("json1779120904", "stock_locations"),
    selectField("select1779120905", "availability_status", ["active", "provider_unavailable", "obsolete_candidate", "obsolete", "manual_hold"]),
    dateField("date1779120906", "last_offer_seen_at"),
    dateField("date1779120907", "unavailable_since"),
    dateField("date1779120908", "obsolete_at"),
    dateField("date1779120909", "last_curated_at"),
    textField("text1779120910", "curation_version"),
    jsonField("json1779120911", "curation_sources"),
  ]

  for (const field of fields) {
    if (!getFieldByName(collection, field.name)) collection.fields.add(field)
  }
  collection.indexes = Array.from(new Set([
    ...(collection.indexes || []),
    "CREATE INDEX idx_products_manual_category_path ON products (manual_category_path)",
    "CREATE INDEX idx_products_availability_status ON products (availability_status)",
    "CREATE INDEX idx_products_last_curated_at ON products (last_curated_at)"
  ]))
  app.save(collection)
}

migrate((app) => {
  addProductCurationFields(app)
  saveCollection(app, {
    name: "catalog_categories",
    listRule: adminRule, viewRule: adminRule, createRule: adminRule, updateRule: adminRule,
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120912", "slug", true),
      textField("text1779120913", "path", true),
      textField("text1779120914", "parent_slug"),
      textField("text1779120915", "name", true),
      textField("text1779120916", "legacy_category"),
      selectField("select1779120917", "status", ["manual_verified", "proposed", "deprecated"]),
      textField("text1779120918", "version"),
      jsonField("json1779120919", "synonyms"),
      textField("text1779120920", "notes")
    ],
    indexes: ["CREATE UNIQUE INDEX idx_catalog_categories_path ON catalog_categories (path)"]
  })
  saveCollection(app, {
    name: "product_curation_batches",
    listRule: adminRule, viewRule: adminRule, createRule: adminRule, updateRule: adminRule,
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120921", "batch_id", true),
      selectField("select1779120922", "status", ["running", "complete", "failed"]),
      numberField("number1779120923", "batch_size"),
      numberField("number1779120924", "worker_count"),
      numberField("number1779120925", "processed_count"),
      numberField("number1779120926", "updated_count"),
      numberField("number1779120927", "obsolete_candidate_count"),
      dateField("date1779120928", "started_at"),
      dateField("date1779120929", "finished_at"),
      textField("text1779120930", "last_error")
    ],
    indexes: ["CREATE UNIQUE INDEX idx_product_curation_batches_batch ON product_curation_batches (batch_id)"]
  })
  saveCollection(app, {
    name: "product_curation_receipts",
    listRule: adminRule, viewRule: adminRule, createRule: adminRule, updateRule: adminRule,
    deleteRule: "@request.auth.collectionName = \"_superusers\"",
    fields: [
      textField("text1779120931", "batch_id", true),
      textField("text1779120932", "product_id", true),
      selectField("select1779120933", "status", ["curated", "obsolete_candidate", "failed"]),
      jsonField("json1779120934", "fields"),
      jsonField("json1779120935", "source_refs"),
      textField("text1779120936", "research_status"),
      textField("text1779120937", "error")
    ],
    indexes: ["CREATE INDEX idx_product_curation_receipts_batch ON product_curation_receipts (batch_id, status)"]
  })
}, (app) => {
  for (const name of ["product_curation_receipts", "product_curation_batches", "catalog_categories"]) {
    if (collectionExists(app, name)) app.delete(app.findCollectionByNameOrId(name))
  }
})
