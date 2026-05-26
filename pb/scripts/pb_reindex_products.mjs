/**
 * Rebuilds derived product catalog fields used by paginated search/filtering.
 */
import PocketBase from 'pocketbase';
import { getIndexPayload } from '../lib/catalogIndex.mjs';
import { getPocketBaseConfig } from '../lib/env.mjs';

const config = getPocketBaseConfig();

const parseArgs = () => {
  const args = {};
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (!arg.startsWith('--')) continue;

    const [key, inlineValue] = arg.slice(2).split('=', 2);
    const nextValue = process.argv[index + 1];
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    if (nextValue && !nextValue.startsWith('--')) {
      args[key] = nextValue;
      index += 1;
      continue;
    }

    args[key] = true;
  }

  return args;
};

const args = parseArgs();
const PAGE_SIZE = Number(args.pageSize || process.env.PB_REINDEX_PAGE_SIZE || 100);
const START_PAGE = Math.max(1, Number(args.startPage || 1));
const TRANSIENT_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [750, 1500, 3000, 6000, 10000];

const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const isTransientError = (error) => {
  const status = Number(error?.status || error?.response?.status || 0);
  return TRANSIENT_STATUSES.has(status);
};

const updateProductWithRetry = async (product) => {
  const payload = getIndexPayload(product);
  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await pb.collection('products').update(product.id, payload);
      return;
    } catch (error) {
      lastError = error;
      if (!isTransientError(error) || attempt === RETRY_DELAYS_MS.length) break;

      const delay = RETRY_DELAYS_MS[attempt];
      console.warn(`[product-reindex] retry product=${product.id} attempt=${attempt + 1} delay=${delay}`);
      await wait(delay);
    }
  }

  throw lastError;
};

const main = async () => {
  console.log(`connecting to ${config.url}`);
  await pb.collection('_superusers').authWithPassword(config.email, config.password);

  let page = START_PAGE;
  let updated = 0;
  while (true) {
    const result = await pb.collection('products').getList(page, PAGE_SIZE, {
      sort: 'id',
      skipTotal: true,
    });

    if (result.items.length === 0) break;

    for (const product of result.items) {
      await updateProductWithRetry(product);
      updated += 1;
    }

    console.log(`[product-reindex] page=${page} updated=${updated}`);
    if (result.items.length < PAGE_SIZE) break;
    page += 1;
  }

  console.log(`[product-reindex] complete updated=${updated}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
