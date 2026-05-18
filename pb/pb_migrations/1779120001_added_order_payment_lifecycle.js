/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2179120100",
    "max": 0,
    "min": 0,
    "name": "payment_intent_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "select2179120101",
    "maxSelect": 1,
    "name": "payment_provider",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["stripe", "paypal"]
  }))

  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "select2179120102",
    "maxSelect": 1,
    "name": "refund_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["Not Requested", "Requested", "Approved", "Refunded", "Rejected"]
  }))

  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2179120103",
    "max": 0,
    "min": 0,
    "name": "refund_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  collection.fields.removeById("text2179120100")
  collection.fields.removeById("select2179120101")
  collection.fields.removeById("select2179120102")
  collection.fields.removeById("text2179120103")

  return app.save(collection)
})
