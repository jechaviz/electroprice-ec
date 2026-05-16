/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\"",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX idx_users_phone ON users (phone) WHERE phone != \"\""
    ],
    "listRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")",
    "passwordAuth": {
      "identityFields": [
        "email",
        "phone"
      ]
    },
    "updateRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.role = \"admin\" || @request.auth.collectionName = \"_superusers\")"
  }, collection)

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1146066909",
    "max": 0,
    "min": 0,
    "name": "phone",
    "pattern": "^\\+?\\d{10,15}$",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "select1466534506",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "user",
      "admin",
      "retailer"
    ]
  }))

  // add field
  collection.fields.addAt(12, new Field({
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
      "active",
      "suspended"
    ]
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "help": "",
    "hidden": false,
    "id": "json3832111349",
    "maxSize": 0,
    "name": "favorites",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "json1769007887",
    "maxSize": 0,
    "name": "reviews",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "json195266743",
    "maxSize": 0,
    "name": "cart",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "help": "",
    "hidden": false,
    "id": "json864151800",
    "maxSize": 0,
    "name": "order_ids",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "url2190673250",
    "name": "avatar_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text603319561",
    "max": 0,
    "min": 0,
    "name": "retailer_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text943156969",
    "max": 0,
    "min": 0,
    "name": "retailer_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3451156273",
    "max": 0,
    "min": 0,
    "name": "phone_secondary_1",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1421682315",
    "max": 0,
    "min": 0,
    "name": "phone_secondary_2",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(22, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "email1530488715",
    "name": "email_secondary_1",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(23, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "email3257939505",
    "name": "email_secondary_2",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(24, new Field({
    "help": "",
    "hidden": false,
    "id": "json1875539222",
    "maxSize": 0,
    "name": "addresses",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(25, new Field({
    "help": "",
    "hidden": false,
    "id": "json1336670595",
    "maxSize": 0,
    "name": "payment_methods",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''"
    ],
    "listRule": "id = @request.auth.id",
    "passwordAuth": {
      "identityFields": [
        "email"
      ]
    },
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  // remove field
  collection.fields.removeById("text1146066909")

  // remove field
  collection.fields.removeById("select1466534506")

  // remove field
  collection.fields.removeById("select2063623452")

  // remove field
  collection.fields.removeById("json3832111349")

  // remove field
  collection.fields.removeById("json1769007887")

  // remove field
  collection.fields.removeById("json195266743")

  // remove field
  collection.fields.removeById("json864151800")

  // remove field
  collection.fields.removeById("url2190673250")

  // remove field
  collection.fields.removeById("text603319561")

  // remove field
  collection.fields.removeById("text943156969")

  // remove field
  collection.fields.removeById("text3451156273")

  // remove field
  collection.fields.removeById("text1421682315")

  // remove field
  collection.fields.removeById("email1530488715")

  // remove field
  collection.fields.removeById("email3257939505")

  // remove field
  collection.fields.removeById("json1875539222")

  // remove field
  collection.fields.removeById("json1336670595")

  return app.save(collection)
})
