/**
 * Broken image audit + primary-image normalization for the products catalog.
 *
 * What it does (per the ElectroPrice image policy):
 *  1. Reads `image_url` and `gallery` from every PocketBase product record.
 *  2. Probes each URL with HEAD (GET fallback when HEAD is not allowed) and
 *     marks each as valid or broken WITHOUT rewriting any path.
 *  3. Builds the new image layout from the valid images, in original order:
 *       - if there are no valid images, the record is left untouched;
 *       - otherwise the *second* valid image is promoted to `image_url`
 *         (the first listed image is usually a low-quality pixelated thumbnail)
 *         and the remaining valid images become `gallery`, preserving order.
 *     A record with a broken leading image is therefore repaired automatically,
 *     because broken URLs are dropped before the primary is chosen.
 *  4. Writes brokenimg.csv (header `productId,productUrl,brokenImageUrls`, broken
 *     URLs joined by `;`) for every product that had at least one broken image.
 *
 * Safety: dry-run by default. Pass --apply to persist the image_url/gallery
 * changes (requires PocketBase superuser credentials; reads are public).
 *
 * Usage:
 *   node scripts/broken-image-audit.mjs            # dry-run + CSV
 *   node scripts/broken-image-audit.mjs --apply    # persist mutations
 *   node scripts/broken-image-audit.mjs --limit 50 # probe only first 50 (testing)
 *   node scripts/broken-image-audit.mjs --csv /path/brokenimg.csv
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PocketBase from 'pocketbase';
import { getPocketBaseConfig, parseArgs, argEnabled } from '../pb/lib/env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const args = parseArgs();
const APPLY = argEnabled(args.apply);
const PAGE_SIZE = Math.max(1, Number(args.pageSize || 200));
const LIMIT = Math.max(0, Number(args.limit || 0));
const CONCURRENCY = Math.max(1, Number(args.concurrency || 24));
const HEAD_TIMEOUT_MS = Math.max(1000, Number(args.timeoutMs || 10000));
const CSV_PATH = path.resolve(args.csv || process.env.BROKEN_IMAGE_CSV || path.join(PROJECT_ROOT, 'brokenimg.csv'));

const SITE_ORIGIN = 'https://electroprice.appniverse.com';
const PRODUCT_PATH = (id) => `${SITE_ORIGIN}/product/${id}`;
const HEADERS = ['productId', 'productUrl', 'brokenImageUrls'];
const IMAGE_EXT_RE = /\.(png|jpg|jpeg|gif|webp|bmp|avif|svg)(\?.*)?$/i;
// Mirror how the browser <img> loads the asset (browser UA) so hosts that
// gate on User-Agent are not flagged as false-broken. Deliberately send NO
// Referer: the storefront loads images with a no-referrer policy and key hosts
// (e.g. static.ctonline.mx) return 403 for a foreign Referer but 200 without.
const PROBE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

const config = getPocketBaseConfig(PROJECT_ROOT);
const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const arraysEqual = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TRANSIENT_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);
// The production PocketBase is in a watchdog-managed restart cycle (~5 min
// granularity), so the retry budget must outlast a full down window.
const RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000, 45000, 60000, 60000, 60000, 60000, 60000, 60000];

// The production PocketBase runs behind a 5-minute watchdog and can briefly
// flap during restarts/sync; retry transient failures instead of aborting.
async function withRetry(label, action) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      const status = Number(error?.status ?? 0);
      if (!TRANSIENT_STATUSES.has(status) || attempt === RETRY_DELAYS_MS.length) break;
      const delay = RETRY_DELAYS_MS[attempt];
      console.warn(`[retry] ${label} attempt=${attempt + 1} status=${status} delay=${delay}`);
      await wait(delay);
    }
  }
  throw lastError;
}

async function probeUrl(url) {
  const fetchWith = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
    try {
      return await fetch(url, { method, redirect: 'follow', signal: controller.signal, headers: PROBE_HEADERS });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let response = await fetchWith('HEAD');
    // Some hosts reject HEAD (405/501) but serve the image fine over GET.
    if (response.status === 405 || response.status === 501) {
      response = await fetchWith('GET');
    }
    const contentType = response.headers.get('content-type') || '';
    const isImageLike = IMAGE_EXT_RE.test(url) || contentType.toLowerCase().startsWith('image');
    return response.ok && isImageLike;
  } catch {
    return false;
  }
}

async function computeImageVerdicts(imageUrl, gallery) {
  const seen = new Set();
  const candidates = [];
  const push = (value) => {
    if (typeof value === 'string' && value.trim() !== '' && !seen.has(value)) {
      seen.add(value);
      candidates.push(value);
    }
  };

  push(imageUrl);
  if (Array.isArray(gallery)) gallery.forEach(push);

  const results = await Promise.all(
    candidates.map(async (url) => ({ url, ok: await probeUrl(url) })),
  );

  const ok = results.filter((entry) => entry.ok).map((entry) => entry.url);
  const broken = results.filter((entry) => !entry.ok).map((entry) => entry.url);
  return { candidates, ok, broken };
}

/**
 * Decide the new image layout from the valid images (original order preserved).
 * Returns null when nothing should change (no valid images, or already optimal).
 */
function planUpdate(record, ok) {
  if (ok.length === 0) return null;

  // The original `image_url` (position 0) is usually a low-quality pixelated
  // thumbnail, so when it is still the valid leading image prefer the second.
  // When the leading image was broken and dropped, the first surviving valid
  // image is a real gallery photo, so promote it directly (broken-image repair).
  const leadingWasValid = ok[0] === record.image_url;
  const primaryIndex = leadingWasValid && ok.length >= 2 ? 1 : 0;
  const nextImageUrl = ok[primaryIndex];
  const nextGallery = ok.filter((_, index) => index !== primaryIndex);

  const currentImageUrl = typeof record.image_url === 'string' ? record.image_url : '';
  const currentGallery = Array.isArray(record.gallery) ? record.gallery : [];

  if (nextImageUrl === currentImageUrl && arraysEqual(nextGallery, currentGallery)) {
    return null;
  }

  return { image_url: nextImageUrl, gallery: nextGallery };
}

async function collectAllProducts() {
  const products = [];
  let page = 1;
  while (true) {
    const result = await withRetry(`getList page=${page}`, () => pb.collection('products').getList(page, PAGE_SIZE, {
      fields: 'id,image_url,gallery',
      sort: 'id',
    }));

    for (const item of result.items) {
      products.push(item);
      if (LIMIT > 0 && products.length >= LIMIT) return products;
    }

    if (result.items.length < PAGE_SIZE) break;
    if (page * PAGE_SIZE >= result.totalItems) break;
    page += 1;
  }
  return products;
}

/** Runs `worker` over `items` with a bounded number of concurrent tasks. */
async function runPool(items, concurrency, worker) {
  let cursor = 0;
  const runNext = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runNext));
}

function writeCsv(rows) {
  fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
  const escape = (value) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [HEADERS.join(',')];
  for (const row of rows) {
    lines.push([escape(row.productId), escape(row.productUrl), escape(row.brokenImageUrls)].join(','));
  }
  fs.writeFileSync(CSV_PATH, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[csv] wrote ${rows.length} rows to ${CSV_PATH}`);
}

async function main() {
  console.log(`[start] PocketBase=${config.url} mode=${APPLY ? 'APPLY' : 'dry-run'}`);

  const products = await collectAllProducts();
  console.log(`[scan] loaded ${products.length} products; probing images (concurrency=${CONCURRENCY})`);

  const brokenByIndex = new Array(products.length).fill(null);
  const updateByIndex = new Array(products.length).fill(null);
  let scanned = 0;

  await runPool(products, CONCURRENCY, async (record, index) => {
    const { ok, broken } = await computeImageVerdicts(record.image_url, record.gallery);

    if (broken.length > 0) {
      brokenByIndex[index] = {
        productId: record.id,
        productUrl: PRODUCT_PATH(record.id),
        brokenImageUrls: broken.join(';'),
      };
    }

    const plan = planUpdate(record, ok);
    if (plan) {
      updateByIndex[index] = {
        id: record.id,
        ...plan,
        prev_image_url: typeof record.image_url === 'string' ? record.image_url : '',
        prev_gallery: Array.isArray(record.gallery) ? record.gallery : [],
      };
    }

    scanned += 1;
    if (scanned % 500 === 0) {
      console.log(`[progress] scanned=${scanned}/${products.length}`);
    }
  });

  // Preserve catalog (id-sorted) order for deterministic output.
  const brokenRows = brokenByIndex.filter(Boolean);
  const updates = updateByIndex.filter(Boolean);

  console.log(`[scan] products=${products.length} with-broken=${brokenRows.length} planned-updates=${updates.length}`);
  writeCsv(brokenRows);

  if (updates.length === 0) {
    console.log('[mutations] nothing to update');
    return;
  }

  if (!APPLY) {
    const preview = updates.slice(0, 10).map((u) => `  ${u.id} -> image_url=${u.image_url} gallery=${u.gallery.length}`);
    console.log(`[dry-run] ${updates.length} products would change. Re-run with --apply to persist.`);
    console.log(preview.join('\n'));
    return;
  }

  // Write a targeted rollback file (prior values) before mutating anything.
  const restorePath = path.join(PROJECT_ROOT, `image-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(restorePath, JSON.stringify({
    generated_at: new Date().toISOString(),
    pocketbase: config.url,
    count: updates.length,
    items: updates.map((u) => ({ id: u.id, image_url: u.prev_image_url, gallery: u.prev_gallery })),
  }, null, 2), 'utf8');
  console.log(`[backup] wrote rollback snapshot for ${updates.length} records to ${restorePath}`);

  console.log(`[mutations] authenticating as superuser to apply ${updates.length} updates`);
  await withRetry('auth', () => pb.collection('_superusers').authWithPassword(config.email, config.password));

  let applied = 0;
  for (const update of updates) {
    await withRetry(`update ${update.id}`, () => pb.collection('products').update(update.id, {
      image_url: update.image_url,
      gallery: update.gallery,
    }));
    applied += 1;
    if (applied % 50 === 0) console.log(`[mutations] applied=${applied}/${updates.length}`);
    await wait(20); // gentle pacing for the shared-host PocketBase
  }

  console.log(`[mutations] applied=${applied}/${updates.length}`);
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exitCode = 1;
});
