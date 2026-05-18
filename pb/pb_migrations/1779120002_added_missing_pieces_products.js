/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  const fields = [
    new Field({ "id": "text2179120200", "name": "canonical_key", "type": "text", "system": false, "required": false, "presentable": false, "hidden": false, "autogeneratePattern": "", "max": 0, "min": 0, "pattern": "", "primaryKey": false }),
    new Field({ "id": "text2179120201", "name": "model_number", "type": "text", "system": false, "required": false, "presentable": false, "hidden": false, "autogeneratePattern": "", "max": 0, "min": 0, "pattern": "", "primaryKey": false }),
    new Field({ "id": "url2179120202", "name": "manufacturer_url", "type": "url", "system": false, "required": false, "presentable": false, "hidden": false, "exceptDomains": null, "onlyDomains": null }),
    new Field({ "id": "json2179120203", "name": "gallery", "type": "json", "system": false, "required": false, "presentable": false, "hidden": false, "maxSize": 0 }),
    new Field({ "id": "json2179120204", "name": "documents", "type": "json", "system": false, "required": false, "presentable": false, "hidden": false, "maxSize": 0 }),
    new Field({ "id": "json2179120205", "name": "software_links", "type": "json", "system": false, "required": false, "presentable": false, "hidden": false, "maxSize": 0 }),
    new Field({ "id": "json2179120206", "name": "canonical_ids", "type": "json", "system": false, "required": false, "presentable": false, "hidden": false, "maxSize": 0 }),
    new Field({ "id": "json2179120207", "name": "provider_aliases", "type": "json", "system": false, "required": false, "presentable": false, "hidden": false, "maxSize": 0 }),
    new Field({ "id": "json2179120208", "name": "missing_pieces", "type": "json", "system": false, "required": false, "presentable": false, "hidden": false, "maxSize": 0 }),
    new Field({ "id": "number2179120209", "name": "content_score", "type": "number", "system": false, "required": false, "presentable": false, "hidden": false, "min": 0, "max": 100, "onlyInt": false }),
    new Field({ "id": "number2179120210", "name": "identity_confidence", "type": "number", "system": false, "required": false, "presentable": false, "hidden": false, "min": 0, "max": 100, "onlyInt": false }),
    new Field({ "id": "select2179120211", "name": "enrichment_status", "type": "select", "system": false, "required": false, "presentable": false, "hidden": false, "maxSelect": 1, "values": ["raw", "needs_enrichment", "enriched", "verified"] }),
    new Field({ "id": "date2179120212", "name": "last_enriched_at", "type": "date", "system": false, "required": false, "presentable": false, "hidden": false, "max": "", "min": "" }),
    new Field({ "id": "text2179120213", "name": "business_notes", "type": "text", "system": false, "required": false, "presentable": false, "hidden": false, "autogeneratePattern": "", "max": 0, "min": 0, "pattern": "", "primaryKey": false })
  ]

  for (const field of fields) {
    collection.fields.add(field)
  }

  collection.indexes = Array.from(new Set([
    ...collection.indexes,
    "CREATE UNIQUE INDEX idx_products_canonical_key ON products (canonical_key) WHERE canonical_key != ''",
    "CREATE INDEX idx_products_enrichment_status ON products (enrichment_status)"
  ]))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")
  for (const id of [
    "text2179120200", "text2179120201", "url2179120202", "json2179120203",
    "json2179120204", "json2179120205", "json2179120206", "json2179120207",
    "json2179120208", "number2179120209", "number2179120210", "select2179120211",
    "date2179120212", "text2179120213"
  ]) {
    collection.fields.removeById(id)
  }

  collection.indexes = collection.indexes.filter((index) =>
    !index.includes("idx_products_canonical_key") && !index.includes("idx_products_enrichment_status")
  )

  return app.save(collection)
})
