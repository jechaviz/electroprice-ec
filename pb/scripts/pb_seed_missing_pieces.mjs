/**
 * Seeds canonical product-content profiles for Missing Pieces.
 *
 * Prices, stock, availability, and provider runtime inventory are intentionally
 * omitted. Existing live stock is preserved when a product already exists.
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';

const readDotEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) return acc;
    acc[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});
};

const dotEnv = readDotEnv();
const PB_URL = process.env.PB_URL || process.env.VITE_POCKETBASE_URL || dotEnv.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || process.env.PB_ADMIN_EMAIL || 'admin@electroprice.com';
const SUPERUSER_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || process.env.PB_ADMIN_PASSWORD || 'test1234';
const dataPath = path.resolve(process.cwd(), 'config/missing-pieces/electroprice-canonical-products.json');
const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const REQUIRED_SPECS = {
  smartphones: ['display', 'processor', 'memory', 'storage', 'camera', 'battery', 'os'],
  laptops: ['display', 'processor', 'memory', 'storage', 'graphics', 'battery', 'weight'],
  headphones: ['type', 'connectivity', 'battery', 'noise_cancelling', 'weight'],
  cameras: ['sensor', 'resolution', 'video', 'mount', 'stabilization'],
  tvs: ['size', 'panel', 'resolution', 'refresh_rate', 'hdr', 'ports'],
  gaming: ['platform', 'processor', 'storage', 'display', 'connectivity'],
};

const getFirstRecord = async (collection, filter) => {
  try {
    return await pb.collection(collection).getFirstListItem(filter);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
};

const assess = (product) => {
  const required = REQUIRED_SPECS[product.category] || [];
  const specKeys = new Set(Object.keys(product.specs || {}));
  const missingSpecs = required.filter((key) => !specKeys.has(key));
  const missingPieces = [
    ...missingSpecs.map((key) => `spec:${key}`),
    ...(!product.manufacturer_url ? ['manufacturer_url'] : []),
    ...(!product.documents?.length ? ['documents'] : []),
    ...(!product.software_links?.length ? ['software_links'] : []),
    ...(!product.provider_aliases?.length ? ['provider_aliases'] : []),
    ...(!product.canonical_ids || Object.keys(product.canonical_ids).length === 0 ? ['canonical_ids'] : []),
  ];
  const contentScore = required.length
    ? Math.round(((required.length - missingSpecs.length) / required.length) * 100)
    : 100;
  const identityConfidence = [
    product.canonical_key,
    product.model_number,
    product.brand,
    product.canonical_ids?.mpn || product.canonical_ids?.gtin,
    product.provider_aliases?.length,
  ].filter(Boolean).length * 20;

  return { missingPieces, contentScore, identityConfidence };
};

const toRecordPayload = (product) => {
  const assessment = assess(product);
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    image_url: product.image_url,
    description: product.description,
    specs: product.specs,
    avg_rating: 0,
    review_count: 0,
    feature_score: assessment.contentScore,
    canonical_key: product.canonical_key,
    model_number: product.model_number,
    manufacturer_url: product.manufacturer_url,
    gallery: product.gallery || [product.image_url],
    documents: product.documents || [],
    software_links: product.software_links || [],
    canonical_ids: product.canonical_ids || {},
    provider_aliases: product.provider_aliases || [],
    missing_pieces: assessment.missingPieces,
    content_score: assessment.contentScore,
    identity_confidence: assessment.identityConfidence,
    enrichment_status: assessment.missingPieces.length ? 'enriched' : 'verified',
    last_enriched_at: new Date().toISOString(),
  };
};

await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASSWORD);

let created = 0;
let updated = 0;

for (const product of dataset.products) {
  const existing = await getFirstRecord('products', pb.filter('canonical_key = {:key}', { key: product.canonical_key }));
  const payload = toRecordPayload(product);

  if (existing) {
    await pb.collection('products').update(existing.id, payload);
    updated += 1;
    continue;
  }

  await pb.collection('products').create({
    ...payload,
    wholesaler_stock: [],
    price_history: [],
    business_notes: '',
  });
  created += 1;
}

console.log(`[missing-pieces-seed] created=${created} updated=${updated} total=${dataset.products.length}`);
