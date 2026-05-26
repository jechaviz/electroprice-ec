/**
 * Idempotent PocketBase schema setup for ElectroPrice.
 *
 * Environment overrides:
 * - PB_URL or VITE_POCKETBASE_URL
 * - PB_SUPERUSER_EMAIL or PB_ADMIN_EMAIL
 * - PB_SUPERUSER_PASSWORD or PB_ADMIN_PASSWORD
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || process.env.PB_ADMIN_EMAIL || 'admin@electroprice.com';
const SUPERUSER_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || process.env.PB_ADMIN_PASSWORD || 'test1234';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const FALLBACK_CATEGORY_VALUES = ['gaming', 'tvs', 'smartphones', 'laptops', 'headphones', 'cameras'];
const loadCategoryValues = () => {
  try {
    const taxonomyPath = path.resolve(process.cwd(), 'config/catalog/product_taxonomy.json');
    const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
    const values = taxonomy.categories?.map((category) => category.id).filter(Boolean);
    return values?.length ? values : FALLBACK_CATEGORY_VALUES;
  } catch {
    return FALLBACK_CATEGORY_VALUES;
  }
};
const CATEGORY_VALUES = loadCategoryValues();
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
const ENRICHMENT_STATUS_VALUES = ['raw', 'needs_enrichment', 'enriched', 'verified'];
const PROVIDER_REFRESH_TYPES = ['visible_price_watchlist', 'product_content_media', 'semantic_enrichment'];
const PROVIDER_REFRESH_PRIORITIES = ['low', 'normal', 'high'];
const PROVIDER_REFRESH_STATUSES = ['pending', 'running', 'ready', 'failed'];
const PROVIDER_OFFER_STATUSES = ['ready', 'stale', 'failed'];
const WATCHLIST_PRIORITIES = ['low', 'normal', 'visible'];
const ADMIN_RULE = '@request.auth.collectionName = "_superusers" || @request.auth.role = "admin"';
const WATCHLIST_RULE = `${ADMIN_RULE} || (user_id != "" && user_id = @request.auth.id)`;

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
      { name: 'canonical_key', type: 'text' },
      { name: 'model_number', type: 'text' },
      { name: 'manufacturer_url', type: 'url' },
      { name: 'gallery', type: 'json' },
      { name: 'documents', type: 'json' },
      { name: 'software_links', type: 'json' },
      { name: 'canonical_ids', type: 'json' },
      { name: 'provider_aliases', type: 'json' },
      { name: 'missing_pieces', type: 'json' },
      { name: 'content_score', type: 'number', min: 0, max: 100 },
      { name: 'identity_confidence', type: 'number', min: 0, max: 100 },
      { name: 'enrichment_status', type: 'select', maxSelect: 1, values: ENRICHMENT_STATUS_VALUES },
      { name: 'last_enriched_at', type: 'date' },
      { name: 'business_notes', type: 'text' },
      { name: 'search_text', type: 'text' },
      { name: 'best_price', type: 'number', min: 0 },
      { name: 'total_stock', type: 'number', min: 0 },
      { name: 'is_deal', type: 'bool' },
      { name: 'indexed_at', type: 'date' },
    ],
    indexes: [
      'CREATE INDEX idx_products_category ON products (category)',
      'CREATE INDEX idx_products_search_text ON products (search_text)',
      'CREATE INDEX idx_products_best_price ON products (best_price)',
      'CREATE INDEX idx_products_total_stock ON products (total_stock)',
      'CREATE INDEX idx_products_avg_rating ON products (avg_rating)',
      'CREATE INDEX idx_products_review_count ON products (review_count)',
      'CREATE INDEX idx_products_is_deal ON products (is_deal)',
      'CREATE INDEX idx_products_content_score ON products (content_score)',
      'CREATE INDEX idx_products_enrichment_status ON products (enrichment_status)',
    ],
  });

  await upsertCollection({
    name: 'ai_enrichment_runs',
    type: 'base',
    listRule: ADMIN_RULE,
    viewRule: ADMIN_RULE,
    createRule: ADMIN_RULE,
    updateRule: ADMIN_RULE,
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'batch_id', type: 'text', required: true },
      { name: 'status', type: 'text' },
      { name: 'item_count', type: 'number', min: 0 },
      { name: 'applied_count', type: 'number', min: 0 },
      { name: 'rejected_count', type: 'number', min: 0 },
      { name: 'model', type: 'text' },
      { name: 'prompt_version', type: 'text' },
      { name: 'input_hash', type: 'text' },
      { name: 'started_at', type: 'date' },
      { name: 'finished_at', type: 'date' },
      { name: 'notes', type: 'text' },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_ai_enrichment_runs_batch ON ai_enrichment_runs (batch_id)'],
  });

  await upsertCollection({
    name: 'ai_enrichment_patches',
    type: 'base',
    listRule: ADMIN_RULE,
    viewRule: ADMIN_RULE,
    createRule: ADMIN_RULE,
    updateRule: ADMIN_RULE,
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'patch_id', type: 'text', required: true },
      { name: 'product_id', type: 'text' },
      { name: 'canonical_key', type: 'text' },
      { name: 'status', type: 'text' },
      { name: 'confidence', type: 'number', min: 0, max: 1 },
      { name: 'fields', type: 'json' },
      { name: 'source_refs', type: 'json' },
      { name: 'input_hash', type: 'text' },
      { name: 'patch_hash', type: 'text' },
      { name: 'model', type: 'text' },
      { name: 'prompt_version', type: 'text' },
      { name: 'applied_at', type: 'date' },
      { name: 'error', type: 'text' },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_ai_enrichment_patches_patch ON ai_enrichment_patches (patch_id)'],
  });

  await upsertCollection({
    name: 'provider_refresh_queue',
    type: 'base',
    listRule: ADMIN_RULE,
    viewRule: ADMIN_RULE,
    createRule: ADMIN_RULE,
    updateRule: ADMIN_RULE,
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'provider', type: 'text' },
      { name: 'sku', type: 'text' },
      { name: 'refresh_type', type: 'select', maxSelect: 1, values: PROVIDER_REFRESH_TYPES },
      { name: 'priority', type: 'select', maxSelect: 1, values: PROVIDER_REFRESH_PRIORITIES },
      { name: 'status', type: 'select', maxSelect: 1, values: PROVIDER_REFRESH_STATUSES },
      { name: 'attempts', type: 'number', min: 0 },
      { name: 'not_before', type: 'date' },
      { name: 'payload', type: 'json' },
      { name: 'last_error', type: 'text' },
    ],
    indexes: ['CREATE INDEX idx_provider_refresh_queue_status ON provider_refresh_queue (status, priority, not_before)'],
  });

  await upsertCollection({
    name: 'provider_offers',
    type: 'base',
    listRule: ADMIN_RULE,
    viewRule: ADMIN_RULE,
    createRule: ADMIN_RULE,
    updateRule: ADMIN_RULE,
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'provider', type: 'text', required: true },
      { name: 'sku', type: 'text', required: true },
      { name: 'product_id', type: 'text' },
      { name: 'price', type: 'number', min: 0 },
      { name: 'stock', type: 'number', min: 0 },
      { name: 'currency', type: 'text' },
      { name: 'warehouse', type: 'text' },
      { name: 'expires_at', type: 'date' },
      { name: 'status', type: 'select', maxSelect: 1, values: PROVIDER_OFFER_STATUSES },
      { name: 'raw_payload', type: 'json' },
    ],
    indexes: ['CREATE INDEX idx_provider_offers_lookup ON provider_offers (provider, sku, status)'],
  });

  await upsertCollection({
    name: 'product_price_watchlist',
    type: 'base',
    listRule: WATCHLIST_RULE,
    viewRule: WATCHLIST_RULE,
    createRule: '@request.auth.id != "" || @request.auth.collectionName = "_superusers"',
    updateRule: ADMIN_RULE,
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'provider', type: 'text' },
      { name: 'sku', type: 'text' },
      { name: 'product_id', type: 'text' },
      { name: 'user_id', type: 'text' },
      { name: 'session_id', type: 'text' },
      { name: 'last_viewed_at', type: 'date' },
      { name: 'offer_expires_at', type: 'date' },
      { name: 'priority', type: 'select', maxSelect: 1, values: WATCHLIST_PRIORITIES },
      { name: 'context', type: 'json' },
    ],
    indexes: ['CREATE INDEX idx_product_price_watchlist_visible ON product_price_watchlist (last_viewed_at, offer_expires_at)'],
  });

  await upsertCollection({
    name: 'provider_product_content',
    type: 'base',
    listRule: ADMIN_RULE,
    viewRule: ADMIN_RULE,
    createRule: ADMIN_RULE,
    updateRule: ADMIN_RULE,
    deleteRule: '@request.auth.collectionName = "_superusers"',
    fields: [
      { name: 'provider', type: 'text' },
      { name: 'sku', type: 'text' },
      { name: 'product_id', type: 'text' },
      { name: 'payload', type: 'json' },
      { name: 'source_refs', type: 'json' },
      { name: 'fetched_at', type: 'date' },
    ],
    indexes: ['CREATE INDEX idx_provider_product_content_product ON provider_product_content (product_id, fetched_at)'],
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
