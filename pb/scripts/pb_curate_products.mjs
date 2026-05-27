/**
 * Curates product catalog batches: manual taxonomy, title cleanup, stock locations,
 * content research receipts, and obsolescence candidates.
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';
import { argEnabled, getPocketBaseConfig, parseArgs } from '../lib/env.mjs';
import { getManualCategorySeeds } from '../lib/manualTaxonomy.mjs';
import { buildCurationReceipt, buildProductCurationPatch } from '../lib/productCuration.mjs';
import { researchProductsWithGemini } from '../lib/geminiProductResearch.mjs';

const args = parseArgs();
const batchSize = Math.min(Math.max(Number(args.batchSize || 100), 1), 100);
const microBatchSize = Math.min(Math.max(Number(args.microBatchSize || 10), 1), 10);
const workers = Math.min(Math.max(Number(args.workers || 10), 1), 10);
const maxProducts = Math.max(Number(args.maxProducts || 0), 0);
const apply = argEnabled(args.apply);
const research = argEnabled(args.research);
const onlyUncurated = argEnabled(args.onlyUncurated);
const onlyNeedsManualReview = argEnabled(args.onlyNeedsManualReview);
const skipReceipts = argEnabled(args.skipReceipts);
const obsoleteAfterDays = Math.max(Number(args.obsoleteAfterDays || 30), 1);
const batchRecordEvery = Math.max(Number(args.batchRecordEvery || 500), batchSize);
const outDir = path.resolve(process.cwd(), String(args.out || 'out/product-curation'));
const config = getPocketBaseConfig();
const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const nowIso = () => new Date().toISOString();
const batchId = () => `curation:${nowIso().replace(/[:.]/g, '-')}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const retryDelays = [0, 1000, 3000, 7000, 15000, 30000, 60000];

const writeJson = (name, value) => {
  ensureDir(outDir);
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, `${JSON.stringify(value, null, 2)}\n`);
  return outPath;
};

const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const withRetry = async (label, action) => {
  let lastError;
  for (const delay of retryDelays) {
    if (delay) await wait(delay);
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (![0, 408, 429, 500, 502, 503, 504].includes(Number(error?.status || 0))) break;
      console.warn(`[product-curation] retry ${label} delay=${delay}`);
    }
  }
  throw lastError;
};

const createBatchRecord = async (id) => {
  if (!apply) return null;
  return pb.collection('product_curation_batches').create({
    batch_id: id,
    status: 'running',
    batch_size: batchSize,
    worker_count: workers,
    processed_count: 0,
    updated_count: 0,
    obsolete_candidate_count: 0,
    started_at: nowIso(),
  });
};

const finishBatchRecord = async (recordId, patch) => {
  if (!apply || !recordId) return;
  try {
    await withRetry(`batch=${recordId}`, () => pb.collection('product_curation_batches').update(recordId, patch));
  } catch (error) {
    console.warn(`[product-curation] batch record update skipped: ${error.message}`);
  }
};

const upsertCategory = async (category) => {
  try {
    const existing = await pb.collection('catalog_categories').getFirstListItem(pb.filter('path = {:path}', { path: category.path }));
    await pb.collection('catalog_categories').update(existing.id, category);
  } catch (error) {
    if (error?.status !== 404) throw error;
    await pb.collection('catalog_categories').create(category);
  }
};

const ensureManualTaxonomy = async () => {
  if (!apply) return;
  await Promise.all(getManualCategorySeeds().map(upsertCategory));
};

const fetchProductBatch = async (lastId) => {
  const filters = [];
  if (lastId) filters.push(pb.filter('id > {:lastId}', { lastId }));
  if (onlyUncurated) filters.push('(last_curated_at = "" || availability_status = "")');
  if (onlyNeedsManualReview) filters.push('(category_review_status = "needs_manual_review" || manual_category_path = "")');
  const filter = filters.join(' && ');
  const result = await withRetry(`fetch>${lastId || 'start'}`, () => pb.collection('products').getList(1, batchSize, {
    filter,
    sort: 'id',
    skipTotal: false,
  }));
  return result;
};

const applyReceipt = async (receipt) => {
  await withRetry(`product=${receipt.product_id}`, () => pb.collection('products').update(receipt.product_id, receipt.fields));
  if (skipReceipts) return;
  try {
    await withRetry(`receipt=${receipt.product_id}`, () => pb.collection('product_curation_receipts').create({
      batch_id: receipt.batch_id,
      product_id: receipt.product_id,
      status: receipt.status,
      fields: receipt.fields,
      source_refs: receipt.source_refs,
      research_status: receipt.research_status,
    }));
  } catch (error) {
    console.warn(`[product-curation] receipt skipped product=${receipt.product_id}: ${error.message}`);
  }
};

const processMicroBatch = async ({ id, products }) => {
  const researchMap = await researchProductsWithGemini({
    apiKey: config.geminiKey,
    products,
    enabled: research,
  }).catch((error) => {
    console.warn(`[product-curation] research unavailable: ${error.message}`);
    return new Map();
  });

  const receipts = products.map((product) => {
    const researchPatch = researchMap.get(product.id);
    const fields = buildProductCurationPatch(product, {
      research: researchPatch,
      obsoleteAfterDays,
    });
    return buildCurationReceipt({
      product,
      fields,
      batchId: id,
      researchStatus: research ? (researchPatch ? 'grounded' : 'unavailable') : 'not_requested',
    });
  });

  if (apply) {
    for (const receipt of receipts) {
      await applyReceipt(receipt);
    }
  }
  return receipts;
};

const processBatch = async ({ id, products }) => {
  const queue = chunk(products, microBatchSize);
  const receipts = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < queue.length) {
      const index = cursor;
      cursor += 1;
      receipts.push(...await processMicroBatch({ id, products: queue[index] }));
    }
  };

  await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, worker));
  return receipts;
};

const main = async () => {
  await withRetry('auth', () => pb.collection('_superusers').authWithPassword(config.email, config.password));
  await ensureManualTaxonomy();

  const id = String(args.batchId || batchId());
  const batchRecord = await createBatchRecord(id);
  const allReceipts = [];
  let lastId = String(args.afterId || '');
  let processed = 0;

  try {
    while (true) {
      const result = await fetchProductBatch(lastId);
      const products = result.items;
      if (products.length === 0) break;

      const remaining = maxProducts ? Math.max(maxProducts - processed, 0) : products.length;
      const batchProducts = products.slice(0, remaining);
      if (batchProducts.length === 0) break;

      const receipts = await processBatch({ id, products: batchProducts });
      allReceipts.push(...receipts);
      processed += batchProducts.length;
      lastId = products.at(-1).id;
      const obsoleteCount = allReceipts.filter((item) => item.status === 'obsolete_candidate').length;
      console.log(`[product-curation] batch=${id} processed=${processed} lastId=${lastId} obsoleteCandidates=${obsoleteCount} apply=${apply}`);

      if (apply && batchRecord?.id && (processed % batchRecordEvery === 0 || (maxProducts && processed >= maxProducts))) {
        await finishBatchRecord(batchRecord.id, {
          processed_count: processed,
          updated_count: allReceipts.length,
          obsolete_candidate_count: obsoleteCount,
        });
      }
      if (maxProducts && processed >= maxProducts) break;
      if (products.length < batchSize) break;
    }

    const outPath = writeJson(`${id.replace(/[:]/g, '-')}.json`, {
      schema_version: 'electroprice.product_curation_batch.v1',
      batch_id: id,
      apply,
      research,
      processed,
      receipts: allReceipts,
    });
    await finishBatchRecord(batchRecord?.id, { status: 'complete', finished_at: nowIso() });
    console.log(`[product-curation] complete processed=${processed} apply=${apply} out=${outPath}`);
  } catch (error) {
    await finishBatchRecord(batchRecord?.id, { status: 'failed', finished_at: nowIso(), last_error: error.message });
    throw error;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
