/**
 * Enriches product identity/content in batches while preserving live price/stock.
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';
import { argEnabled, getPocketBaseConfig, parseArgs } from '../lib/env.mjs';
import { getIndexPayload } from '../lib/catalogIndex.mjs';
import { buildDeterministicPatch, buildPatchReceipt, sanitizePatchFields, sha256 } from '../lib/enrichmentPatch.mjs';
import { enrichWithGemini } from '../lib/geminiEnrichment.mjs';
import { loadTaxonomy } from '../lib/taxonomy.mjs';

const args = parseArgs();
const limit = Math.min(Number(args.limit || process.env.PB_ENRICH_BATCH_SIZE || 100), 100);
const apply = argEnabled(args.apply);
const outDir = path.resolve(process.cwd(), String(args.out || 'out/enrichment'));
const inputPath = args.input ? path.resolve(process.cwd(), String(args.input)) : '';
const config = getPocketBaseConfig();
const taxonomy = loadTaxonomy();

const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const readInputProducts = () => JSON.parse(fs.readFileSync(inputPath, 'utf8')).products || [];

const needsEnrichmentFilter = [
  'enrichment_status = ""',
  'enrichment_status = "raw"',
  'enrichment_status = "needs_enrichment"',
  'content_score < 80',
  'description = ""',
  'image_url = ""',
  'category = ""',
].join(' || ');

const getProducts = async () => {
  if (inputPath) return readInputProducts().slice(0, limit);
  await pb.collection('_superusers').authWithPassword(config.email, config.password);
  const result = await pb.collection('products').getList(1, limit, {
    filter: `(${needsEnrichmentFilter})`,
    sort: 'id',
    skipTotal: true,
  });
  return result.items;
};

const getMergedFields = (product, deterministicFields, aiPatch) => {
  const merged = {
    ...deterministicFields,
    ...(aiPatch?.fields || {}),
  };
  const textIndex = getIndexPayload({ ...product, ...merged });
  return sanitizePatchFields({
    ...merged,
    search_text: textIndex.search_text,
    indexed_at: textIndex.indexed_at,
    last_enriched_at: new Date().toISOString(),
  });
};

const upsertPatchReceipt = async (receipt) => {
  try {
    const existing = await pb.collection('ai_enrichment_patches').getFirstListItem(
      pb.filter('patch_id = {:patchId}', { patchId: receipt.patch_id })
    );
    await pb.collection('ai_enrichment_patches').update(existing.id, {
      status: receipt.status,
      confidence: receipt.confidence,
      fields: receipt.fields,
      source_refs: receipt.source_refs,
      patch_hash: receipt.patch_hash,
    });
  } catch (error) {
    if (error?.status !== 404) throw error;
    await pb.collection('ai_enrichment_patches').create(receipt);
  }
};

const applyReceipt = async (receipt) => {
  await upsertPatchReceipt(receipt);
  await pb.collection('products').update(receipt.product_id, receipt.fields);
  await upsertPatchReceipt({
    ...receipt,
    status: 'applied',
    applied_at: new Date().toISOString(),
  });
};

const writeReceipt = (batch) => {
  ensureDir(outDir);
  const outPath = path.join(outDir, `${batch.batch_id.replace(':', '-')}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(batch, null, 2)}\n`);
  return outPath;
};

const main = async () => {
  const products = await getProducts();
  const aiPatches = await enrichWithGemini({ apiKey: config.geminiKey, products, taxonomy }).catch((error) => {
    console.warn(`[ai-enrichment] Gemini unavailable; deterministic fallback used: ${error.message}`);
    return new Map();
  });
  const receipts = products.map((product) => {
    const deterministic = buildDeterministicPatch(product, taxonomy);
    const aiPatch = aiPatches.get(product.id);
    const fields = getMergedFields(product, deterministic, aiPatch);
    return buildPatchReceipt({
      product,
      fields,
      sourceRefs: aiPatch?.sourceRefs || [],
      model: aiPatch?.model || 'deterministic-taxonomy',
    });
  });
  const batch = {
    schema_version: 'electroprice.ai_enrichment_batch.v1',
    batch_size: products.length,
    batch_id: sha256({
      schema: 'electroprice.ai_enrichment_batch.v1',
      products: receipts.map((receipt) => receipt.input_hash).sort(),
    }),
    apply,
    items: receipts,
  };
  const outPath = writeReceipt(batch);

  if (apply && !inputPath) {
    for (const receipt of receipts) {
      await applyReceipt(receipt);
    }
  }

  console.log(`[ai-enrichment] products=${products.length} apply=${apply} out=${outPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
