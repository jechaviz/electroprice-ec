/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    "deleteRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1579384326",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "email1281549880",
        "name": "contact",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "email"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number3632866850",
        "max": 5,
        "min": 0,
        "name": "rating",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select892448190",
        "maxSelect": 1,
        "name": "stock_sync",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Real-time",
          "Daily",
          "Manual"
        ]
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "url156371623",
        "name": "logo_url",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Pending",
          "Approved",
          "Disabled"
        ]
      }
    ],
    "id": "pbc_2437042879",
    "indexes": [],
    "listRule": "",
    "name": "wholesalers",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2437042879");

  return app.delete(collection);
})
