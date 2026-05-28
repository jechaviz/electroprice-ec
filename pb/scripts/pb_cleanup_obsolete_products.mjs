/**
 * Cleans products staged as obsolete candidates.
 *
 * Default mode is a dry-run snapshot. Use --apply with --mode archive or
 * --mode delete after reviewing the generated receipt.
 */
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';
import { argEnabled, getPocketBaseConfig, parseArgs } from '../lib/env.mjs';

const args = parseArgs();
const apply = argEnabled(args.apply);
const batchSize = Math.min(Math.max(Number(args.batchSize || 100), 1), 100);
const olderThanDays = Math.max(Number(args.olderThanDays || 30), 0);
const mode = ['archive', 'delete'].includes(String(args.mode)) ? String(args.mode) : 'archive';
const outDir = path.resolve(process.cwd(), String(args.out || 'out/product-obsolete-cleanup'));
const config = getPocketBaseConfig();
const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const nowIso = () => new Date().toISOString();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cutoffDate = () => new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
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
      console.warn(`[obsolete-cleanup] retry ${label} delay=${delay}`);
    }
  }
  throw lastError;
};

const writeReceipt = (receipt) => {
  ensureDir(outDir);
  const file = path.join(outDir, `obsolete-cleanup-${nowIso().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
  return file;
};

const fetchCandidates = async (page) => {
  const cutoff = cutoffDate();
  return withRetry(`fetch-page=${page}`, () => pb.collection('products').getList(page, batchSize, {
    filter: pb.filter(
      'availability_status = "obsolete_candidate" && obsolete_at != "" && obsolete_at <= {:cutoff}',
      { cutoff },
    ),
    sort: 'obsolete_at,id',
    skipTotal: false,
  }));
};

const applyCandidate = async (product) => {
  if (!apply) return 'dry_run';
  if (mode === 'delete') {
    await withRetry(`delete=${product.id}`, () => pb.collection('products').delete(product.id));
    return 'deleted';
  }

  await withRetry(`archive=${product.id}`, () => pb.collection('products').update(product.id, {
    availability_status: 'obsolete',
    curation_sources: [
      ...(Array.isArray(product.curation_sources) ? product.curation_sources : []),
      { type: 'obsolete_cleanup', mode, applied_at: nowIso() },
    ],
  }));
  return 'archived';
};

const main = async () => {
  await withRetry('auth', () => pb.collection('_superusers').authWithPassword(config.email, config.password));

  const receipt = {
    schema_version: 'electroprice.obsolete_cleanup.v1',
    apply,
    mode,
    older_than_days: olderThanDays,
    cutoff: cutoffDate(),
    started_at: nowIso(),
    products: [],
  };

  let page = 1;
  while (true) {
    const result = await fetchCandidates(page);
    if (result.items.length === 0) break;

    for (const product of result.items) {
      const action = await applyCandidate(product);
      receipt.products.push({
        id: product.id,
        name: product.name,
        obsolete_at: product.obsolete_at,
        action,
      });
    }

    if (page >= result.totalPages) break;
    page += 1;
  }

  receipt.finished_at = nowIso();
  receipt.count = receipt.products.length;
  const outPath = writeReceipt(receipt);
  console.log(`[obsolete-cleanup] complete count=${receipt.count} apply=${apply} mode=${mode} out=${outPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
