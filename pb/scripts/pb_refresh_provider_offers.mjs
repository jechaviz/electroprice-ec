/**
 * Reduces provider_offers into products.wholesaler_stock and derived indexes.
 */
import PocketBase from 'pocketbase';
import { argEnabled, getPocketBaseConfig, parseArgs } from '../lib/env.mjs';
import { getIndexPayload, toArray } from '../lib/catalogIndex.mjs';

const args = parseArgs();
const limit = Math.min(Number(args.limit || process.env.PB_OFFER_REFRESH_BATCH_SIZE || 100), 100);
const apply = argEnabled(args.apply);
const config = getPocketBaseConfig();
const pb = new PocketBase(config.url);
pb.autoCancellation(false);

const offerIsFresh = (offer) => !offer.expires_at || new Date(offer.expires_at) > new Date();

const getProductId = async (offer) => {
  if (offer.product_id) return offer.product_id;
  const sku = String(offer.sku || '').trim();
  const provider = String(offer.provider || '').trim();
  if (!sku || !provider) return '';
  try {
    return (await pb.collection('products').getFirstListItem(
      pb.filter('provider_aliases ~ {:provider} && provider_aliases ~ {:sku}', { provider, sku })
    )).id;
  } catch {
    return '';
  }
};

const mergeOffers = (product, offers) => {
  const providers = new Set(offers.map((offer) => offer.provider));
  const nextStock = toArray(product.wholesaler_stock).filter((item) => !providers.has(item.wholesalerId));
  const priceHistory = toArray(product.price_history);

  for (const offer of offers) {
    const price = Number(offer.price) || 0;
    nextStock.push({
      wholesalerId: offer.provider,
      price,
      stock: Math.max(0, Number(offer.stock) || 0),
    });

    if (price <= 0) continue;
    priceHistory.push({
      date: new Date().toISOString().slice(0, 10),
      price,
    });
  }

  return {
    wholesaler_stock: nextStock,
    price_history: priceHistory.slice(-120),
    ...getIndexPayload({ ...product, wholesaler_stock: nextStock, price_history: priceHistory }),
  };
};

const main = async () => {
  await pb.collection('_superusers').authWithPassword(config.email, config.password);
  const offers = await pb.collection('provider_offers').getList(1, limit, {
    filter: 'status = "ready"',
    sort: 'id',
    skipTotal: true,
  }).then((result) => result.items.filter(offerIsFresh));
  const offersByProduct = new Map();
  let mapped = 0;

  for (const offer of offers) {
    const productId = await getProductId(offer);
    if (!productId) continue;
    if (!offersByProduct.has(productId)) offersByProduct.set(productId, []);
    offersByProduct.get(productId).push(offer);
    mapped += 1;
  }

  let updatedProducts = 0;
  for (const [productId, productOffers] of offersByProduct.entries()) {
    const product = await pb.collection('products').getOne(productId);
    if (apply) {
      await pb.collection('products').update(productId, mergeOffers(product, productOffers));
      await Promise.all(productOffers.map((offer) =>
        pb.collection('provider_offers').update(offer.id, { status: 'stale' })
      ));
    }
    updatedProducts += 1;
  }

  console.log(`[provider-offers] offers=${offers.length} mapped=${mapped} products=${updatedProducts} apply=${apply}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
