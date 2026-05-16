/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\" && (user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")",
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
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation2809058197",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date2862495610",
        "max": "",
        "min": "",
        "name": "date",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3776899405",
        "maxSize": 0,
        "name": "items",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number3257917790",
        "max": null,
        "min": 0,
        "name": "total",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
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
          "Processing",
          "Awaiting Shipment from Wholesaler",
          "Shipped to Hub",
          "Shipped to You",
          "Delivered",
          "Cancelled",
          "Return Requested",
          "Returned"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3943065925",
        "max": 0,
        "min": 0,
        "name": "shipping_address",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1042062360",
        "max": 0,
        "min": 0,
        "name": "tracking_number",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text180866871",
        "max": 0,
        "min": 0,
        "name": "wholesaler_tracking_number",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_3527180448",
    "indexes": [],
    "listRule": "@request.auth.id != \"\" && (user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")",
    "name": "orders",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\" && (user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")",
    "viewRule": "@request.auth.id != \"\" && (user_id = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448");

  return app.delete(collection);
})
