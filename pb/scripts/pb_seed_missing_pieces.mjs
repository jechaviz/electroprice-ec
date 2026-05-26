/**
 * Seeds canonical product-content profiles for Missing Pieces.
 *
 * Prices, stock, availability, and provider runtime inventory are intentionally
 * omitted. Existing live stock is preserved when a product already exists.
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';
import { getIndexPayload } from '../lib/catalogIndex.mjs';
import { getPocketBaseConfig } from '../lib/env.mjs';
import { assessProductContent } from '../lib/enrichmentPatch.mjs';
import { loadTaxonomy } from '../lib/taxonomy.mjs';

const config = getPocketBaseConfig();
const taxonomy = loadTaxonomy();
const dataPath = path.resolve(process.cwd(), 'config/missing-pieces/electroprice-canonical-products.json');
const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const getFirstRecord = async (collection, filter) => {
  try {
    return await pb.collection(collection).getFirstListItem(filter);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
};

const toRecordPayload = (product, existing = {}) => {
  const contentPayload = {
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
    business_notes: existing.business_notes || '',
  };
  const mergedForIndex = {
    ...existing,
    ...contentPayload,
    wholesaler_stock: existing.wholesaler_stock || [],
    price_history: existing.price_history || [],
  };
  const assessment = assessProductContent(mergedForIndex, taxonomy);

  return {
    ...contentPayload,
    avg_rating: existing.avg_rating || 0,
    review_count: existing.review_count || 0,
    feature_score: assessment.contentScore,
    missing_pieces: assessment.missingPieces,
    content_score: assessment.contentScore,
    identity_confidence: assessment.identityConfidence,
    enrichment_status: assessment.missingPieces.length ? 'enriched' : 'verified',
    last_enriched_at: new Date().toISOString(),
    ...getIndexPayload(mergedForIndex),
  };
};

await pb.collection('_superusers').authWithPassword(config.email, config.password);

let created = 0;
let updated = 0;

for (const product of dataset.products) {
  const existing = await getFirstRecord('products', pb.filter('canonical_key = {:key}', { key: product.canonical_key }));
  const payload = toRecordPayload(product, existing || {});

  if (existing) {
    await pb.collection('products').update(existing.id, payload);
    updated += 1;
    continue;
  }

  await pb.collection('products').create({
    ...payload,
    wholesaler_stock: [],
    price_history: [],
  });
  created += 1;
}

console.log(`[missing-pieces-seed] created=${created} updated=${updated} total=${dataset.products.length}`);
