/**
 * Applies Codex/manual web research receipts to products.
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';
import { argEnabled, getPocketBaseConfig, parseArgs } from '../lib/env.mjs';
import { getManualCategorySeeds } from '../lib/manualTaxonomy.mjs';
import { buildCurationReceipt, buildProductCurationPatch } from '../lib/productCuration.mjs';

const args = parseArgs();
const apply = argEnabled(args.apply);
const inputPath = path.resolve(process.cwd(), String(args.file || ''));
const outDir = path.resolve(process.cwd(), String(args.out || 'out/manual-product-research'));
const config = getPocketBaseConfig();
const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const nowIso = () => new Date().toISOString();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const retryDelays = [0, 1000, 3000, 7000, 15000, 30000, 60000];

const withRetry = async (label, action) => {
  let lastError;
  for (const delay of retryDelays) {
    if (delay) await wait(delay);
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (![0, 408, 429, 500, 502, 503, 504].includes(Number(error?.status || 0))) break;
      console.warn(`[manual-research] retry ${label} delay=${delay}`);
    }
  }
  throw lastError;
};

const readInput = () => {
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error(`Manual research file not found: ${inputPath}`);
  }
  return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
};

const writeJson = (name, value) => {
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, `${JSON.stringify(value, null, 2)}\n`);
  return outPath;
};

const upsertCategory = async (category) => {
  try {
    const existing = await withRetry(`category-fetch=${category.path}`, () => (
      pb.collection('catalog_categories').getFirstListItem(pb.filter('path = {:path}', { path: category.path }))
    ));
    await withRetry(`category=${category.path}`, () => pb.collection('catalog_categories').update(existing.id, category));
  } catch (error) {
    if (error?.status !== 404) throw error;
    await withRetry(`category=${category.path}`, () => pb.collection('catalog_categories').create(category));
  }
};

const taxonomySeedsForItems = (items) => {
  if (!argEnabled(args.batchTaxonomy)) return getManualCategorySeeds();

  const requiredPaths = new Set();
  for (const item of items) {
    const pathValue = String(item.research?.manualCategoryPath || '').trim();
    const parts = pathValue.split('/').filter(Boolean);
    for (let index = 1; index <= parts.length; index += 1) {
      requiredPaths.add(parts.slice(0, index).join('/'));
    }
  }
  return getManualCategorySeeds().filter((category) => requiredPaths.has(category.path));
};

const ensureManualTaxonomy = async (items) => {
  if (!apply) return;
  for (const category of taxonomySeedsForItems(items)) {
    await upsertCategory(category);
  }
};

const receiptRecord = (receipt) => ({
  batch_id: receipt.batch_id,
  product_id: receipt.product_id,
  status: receipt.status,
  fields: receipt.fields,
  source_refs: receipt.source_refs,
  research_status: receipt.research_status,
});

const upsertReceipt = async (receipt) => {
  const record = receiptRecord(receipt);
  try {
    const existing = await pb.collection('product_curation_receipts').getFirstListItem(pb.filter(
      'batch_id = {:batchId} && product_id = {:productId}',
      { batchId: receipt.batch_id, productId: receipt.product_id },
    ));
    return await pb.collection('product_curation_receipts').update(existing.id, record);
  } catch (error) {
    if (error?.status !== 404) throw error;
    return await pb.collection('product_curation_receipts').create(record);
  }
};

const applyItem = async ({ batchId, item }) => {
  const product = await withRetry(`fetch=${item.product_id}`, () => pb.collection('products').getOne(item.product_id));
  const fields = buildProductCurationPatch(product, {
    research: item.research || {},
    obsoleteAfterDays: Number(item.obsoleteAfterDays || 30),
  });
  const receipt = buildCurationReceipt({
    product,
    fields,
    batchId,
    researchStatus: 'manual_web',
  });

  if (apply) {
    await withRetry(`product=${item.product_id}`, () => pb.collection('products').update(item.product_id, fields));
    await withRetry(`receipt=${item.product_id}`, () => upsertReceipt(receipt));
  }

  return receipt;
};

const main = async () => {
  const input = readInput();
  const batchId = String(args.batchId || input.batch_id || `manual-web:${nowIso().replace(/[:.]/g, '-')}`);
  const items = input.products || input.items || [];
  if (!items.length) throw new Error('Manual research file has no products.');

  await withRetry('auth', () => pb.collection('_superusers').authWithPassword(config.email, config.password));
  await ensureManualTaxonomy(items);

  const receipts = [];
  for (const item of items) {
    receipts.push(await applyItem({ batchId, item }));
  }

  const outPath = writeJson(`${batchId.replace(/[:]/g, '-')}.json`, {
    schema_version: 'electroprice.manual_web_research_receipts.v1',
    batch_id: batchId,
    apply,
    processed: receipts.length,
    receipts,
  });
  console.log(`[manual-research] complete batch=${batchId} processed=${receipts.length} apply=${apply} out=${outPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
