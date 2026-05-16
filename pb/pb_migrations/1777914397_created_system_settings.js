/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    "deleteRule": "@request.auth.collectionName = \"_superusers\"",
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
        "help": "",
        "hidden": false,
        "id": "bool2461232484",
        "name": "test_mode",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool797243625",
        "name": "maintenance",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_3806592213",
    "indexes": [],
    "listRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    "name": "system_settings",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\"",
    "viewRule": "@request.auth.collectionName = \"_superusers\" || @request.auth.role = \"admin\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3806592213");

  return app.delete(collection);
})
