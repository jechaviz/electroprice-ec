/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "number2179120000",
    "max": null,
    "min": 0,
    "name": "total_cost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "select2179120001",
    "maxSelect": 1,
    "name": "subshopping_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Planning",
      "Purchasing",
      "Awaiting Provider",
      "Tracking",
      "Completed",
      "Exception"
    ]
  }))

  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "json2179120002",
    "maxSize": 0,
    "name": "purchase_orders",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "json2179120003",
    "maxSize": 0,
    "name": "fulfillment_timeline",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  collection.fields.removeById("number2179120000")
  collection.fields.removeById("select2179120001")
  collection.fields.removeById("json2179120002")
  collection.fields.removeById("json2179120003")

  return app.save(collection)
})
