/**
 * Idempotent PocketBase schema setup for ElectroPrice.
 *
 * Environment overrides:
 * - PB_URL or VITE_POCKETBASE_URL
 * - PB_SUPERUSER_EMAIL or PB_ADMIN_EMAIL
 * - PB_SUPERUSER_PASSWORD or PB_ADMIN_PASSWORD
 */
import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || process.env.PB_ADMIN_EMAIL || 'admin@electroprice.com';
const SUPERUSER_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || process.env.PB_ADMIN_PASSWORD || 'test1234';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const CATEGORY_VALUES = ['gaming', 'tvs', 'smartphones', 'laptops', 'headphones', 'cameras'];
const ORDER_STATUS_VALUES = [
  'Processing',
  'Awaiting Shipment from Wholesaler',
  'Shipped to Hub',
  'Shipped to You',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
];
const SUBSHOPPING_STATUS_VALUES = [
  'Planning',
  'Purchasing',
  'Awaiting Provider',
  'Tracking',
  'Completed',
  'Exception',
];
const PAYMENT_PROVIDER_VALUES = ['stripe', 'paypal'];
const REFUND_STATUS_VALUES = ['Not Requested', 'Requested', 'Approved', 'Refunded', 'Rejected'];
const REVIEW_STATUS_VALUES = ['pending', 'approved', 'rejected'];
const USER_ROLE_VALUES = ['user', 'admin', 'retailer'];
const USER_STATUS_VALUES = ['active', 'suspended'];
const WHOLESALER_STATUS_VALUES = ['Pending', 'Approved', 'Disabled'];
const STOCK_SYNC_VALUES = ['Real-time', 'Daily', 'Manual'];

const isNotFound = (error) => error?.status === 404;

const mergeFields = (existingFields = [], requiredFields = []) => {
  const nextFields = [...existingFields];

  for (const requiredField of requiredFields) {
    const index = nextFields.findIndex((field) => field.name === requiredField.name);
    if (index === -1) {
      nextFields.push(requiredField);
      continue;
    }

    const existingField = nextFields[index];
    nextFields[index] = {
      ...existingField,
      ...requiredField,
      id: existingField.id,
      system: existingField.system,
      primaryKey: existingField.primaryKey,
    };
  }

  return nextFields;
};

const mergeIndexes = (existingIndexes = [], requiredIndexes = []) => {
  const merged = new Set(existingIndexes);
  for (const index of requiredIndexes) {
    merged.add(index);
  }
  return [...merged];
};

const getCollection = async (name) => {
  try {
    return await pb.collections.getOne(name);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
};

const upsertCollection = async ({ fields, indexes = [], ...definition }) => {
  const existing = await getCollection(definition.name);

  if (!existing) {
    await pb.collections.create({
      ...definition,
      fields,
      indexes,
    });
    console.log(`created ${definition.name}`);
    return;
  }

  await pb.collections.update(existing.id, {
    ...definition,
    fields: mergeFields(existing.fields, fields),
    indexes: mergeIndexes(existing.indexes, indexes),
  });
  console.log(`updated ${definition.name}`);
};

const patchUsersCollection = async () => {
  const users = await pb.collections.getOne('users');
  const fields = [
    { name: 'name', type: 'text', max: 255 },
    { name: 'phone', type: 'text', pattern: '^\\+?\\d{10,15}$' },
    { name: 'role', type: 'select', maxSelect: 1, values: USER_ROLE_VALUES },
    { name: 'status', type: 'select', maxSelect: 1, values: USER_STATUS_VALUES },
    { name: 'favorites', type: 'json' },
    { name: 'reviews', type: 'json' },
    { name: 'cart', type: 'json' },
    { name: 'order_ids', type: 'json' },
    { name: 'avatar_url', type: 'url' },
    { name: 'retailer_id', type: 'text' },
    { name: 'retailer_name', type: 'text' },
    { name: 'phone_secondary_1', type: 'text' },
    { name: 'phone_secondary_2', type: 'text' },
    { name: 'email_secondary_1', type: 'email' },
    { name: 'email_secondary_2', type: 'email' },
    { name: 'addresses', type: 'json' },
    { name: 'payment_methods', type: 'json' },
  ];

  await pb.collections.update(users.id, {
    fields: mergeFields(users.fields, fields),
    indexes: mergeIndexes(users.indexes, [
      'CREATE UNIQUE INDEX idx_users_phone ON users (phone) WHERE phone != ""',
    ]),
    listRule: '@request.auth.id != "" && (@request.auth.id = id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    viewRule: '@request.auth.id != "" && (@request.auth.id = id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    createRule: '',
    updateRule: '@request.auth.id != "" && (@request.auth.id = id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    deleteRule: '@request.auth.role = "admin" || @request.auth.collectionName = "_superusers"',
    passwordAuth: {
      ...(users.passwordAuth || {}),
      enabled: true,
      identityFields: ['email', 'phone'],
    },
  });
  console.log('updated users');

  return pb.collections.getOne('users');
};

const main = async () => {
  console.log(`connecting to ${PB_URL}`);
  await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASSWORD);
  console.log('authenticated as superuser');

  const users = await patchUsersCollection();

  await upsertCollection({
    name: 'system_settings',
    type: 'base',
    listRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    viewRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    createRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    updateRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'test_mode', type: 'bool' },
      { name: 'maintenance', type: 'bool' },
    ],
  });

  await upsertCollection({
    name: 'wholesalers',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    updateRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    deleteRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'contact', type: 'email' },
      { name: 'rating', type: 'number', min: 0, max: 5 },
      { name: 'stock_sync', type: 'select', maxSelect: 1, values: STOCK_SYNC_VALUES },
      { name: 'logo_url', type: 'url' },
      { name: 'status', type: 'select', maxSelect: 1, values: WHOLESALER_STATUS_VALUES },
    ],
  });

  await upsertCollection({
    name: 'products',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    updateRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin" || @request.auth.role = "retailer"',
    deleteRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'brand', type: 'text' },
      { name: 'category', type: 'select', maxSelect: 1, values: CATEGORY_VALUES },
      { name: 'image_url', type: 'url' },
      { name: 'description', type: 'text' },
      { name: 'specs', type: 'json' },
      { name: 'avg_rating', type: 'number', min: 0, max: 5 },
      { name: 'review_count', type: 'number', min: 0 },
      { name: 'wholesaler_stock', type: 'json' },
      { name: 'price_history', type: 'json' },
      { name: 'feature_score', type: 'number', min: 0 },
      { name: 'old_price', type: 'number', min: 0 },
      { name: 'watching', type: 'number', min: 0 },
      { name: 'deal_tag', type: 'text' },
      { name: 'smart_tag', type: 'text' },
      { name: 'options', type: 'json' },
    ],
  });

  await upsertCollection({
    name: 'reviews',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != "" && author_id = @request.auth.id',
    updateRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    deleteRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    fields: [
      { name: 'author', type: 'text', required: true },
      { name: 'author_id', type: 'relation', collectionId: users.id, maxSelect: 1, cascadeDelete: true },
      { name: 'product_id', type: 'text', required: true },
      { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
      { name: 'comment', type: 'text', required: true },
      { name: 'date', type: 'date' },
      { name: 'status', type: 'select', maxSelect: 1, values: REVIEW_STATUS_VALUES },
    ],
  });

  await upsertCollection({
    name: 'orders',
    type: 'base',
    listRule: '@request.auth.id != "" && (user_id = @request.auth.id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    viewRule: '@request.auth.id != "" && (user_id = @request.auth.id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    createRule: '@request.auth.id != "" && (user_id = @request.auth.id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    updateRule: '@request.auth.id != "" && (user_id = @request.auth.id || @request.auth.role = "admin" || @request.auth.collectionName = "_superusers")',
    deleteRule: '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"',
    fields: [
      { name: 'user_id', type: 'relation', collectionId: users.id, maxSelect: 1, cascadeDelete: true },
      { name: 'date', type: 'date' },
      { name: 'items', type: 'json', required: true },
      { name: 'total', type: 'number', required: true, min: 0 },
      { name: 'total_cost', type: 'number', min: 0 },
      { name: 'status', type: 'select', maxSelect: 1, values: ORDER_STATUS_VALUES },
      { name: 'payment_intent_id', type: 'text' },
      { name: 'payment_provider', type: 'select', maxSelect: 1, values: PAYMENT_PROVIDER_VALUES },
      { name: 'refund_status', type: 'select', maxSelect: 1, values: REFUND_STATUS_VALUES },
      { name: 'refund_id', type: 'text' },
      { name: 'subshopping_status', type: 'select', maxSelect: 1, values: SUBSHOPPING_STATUS_VALUES },
      { name: 'purchase_orders', type: 'json' },
      { name: 'fulfillment_timeline', type: 'json' },
      { name: 'shipping_address', type: 'text', required: true },
      { name: 'tracking_number', type: 'text' },
      { name: 'wholesaler_tracking_number', type: 'text' },
    ],
  });

  console.log('PocketBase schema setup complete.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
