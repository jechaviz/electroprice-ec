/**
 * Rebuilds derived product catalog fields used by paginated search/filtering.
 */
import PocketBase from 'pocketbase';
import { getIndexPayload } from '../lib/catalogIndex.mjs';
import { getPocketBaseConfig } from '../lib/env.mjs';

const config = getPocketBaseConfig();
const PAGE_SIZE = Number(process.env.PB_REINDEX_PAGE_SIZE || 100);

const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const main = async () => {
  console.log(`connecting to ${config.url}`);
  await pb.collection('_superusers').authWithPassword(config.email, config.password);

  let page = 1;
  let updated = 0;
  while (true) {
    const result = await pb.collection('products').getList(page, PAGE_SIZE, {
      sort: 'id',
      skipTotal: true,
    });

    if (result.items.length === 0) break;

    for (const product of result.items) {
      await pb.collection('products').update(product.id, getIndexPayload(product));
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
