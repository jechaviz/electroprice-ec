/**
 * Seeds reusable PocketBase demo accounts and ecommerce activity.
 *
 * Environment overrides:
 * - PB_URL or VITE_POCKETBASE_URL
 * - PB_SUPERUSER_EMAIL or PB_ADMIN_EMAIL
 * - PB_SUPERUSER_PASSWORD or PB_ADMIN_PASSWORD
 * - PB_DEMO_PASSWORD
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
const DEMO_PASSWORD = process.env.PB_DEMO_PASSWORD || 'test1234';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const DEMO_USERS = [
  {
    email: 'admin.user@electroprice.com',
    name: 'Admin Operaciones',
    phone: '+525500000001',
    role: 'admin',
    status: 'active',
    avatar_url: 'https://i.pravatar.cc/150?u=electroprice-admin',
    favorites: [],
    cart: [],
    addresses: [],
    payment_methods: [],
  },
  {
    email: 'user@electroprice.com',
    name: 'Mariana Cliente',
    phone: '+525500000002',
    role: 'user',
    status: 'active',
    avatar_url: 'https://i.pravatar.cc/150?u=electroprice-user',
    email_secondary_1: 'mariana.backup@example.com',
    phone_secondary_1: '+525500000012',
    addresses: [
      { id: 'addr-home', line1: 'Av. Reforma 120, Depto 804', line2: 'Cuauhtemoc, CDMX 06600', isPrimary: true },
    ],
    payment_methods: [
      { id: 'pay-visa-4242', card: '**** 4242', expires: '12/28', isPrimary: true, type: 'visa' },
    ],
  },
  {
    email: 'retailer@electroprice.com',
    name: 'Luis Retailer',
    phone: '+525500000003',
    role: 'retailer',
    status: 'active',
    avatar_url: 'https://i.pravatar.cc/150?u=electroprice-retailer',
    retailer_id: 'demo-retailer-luis',
    retailer_name: 'Tech Outlet Demo',
    favorites: [],
    cart: [],
    addresses: [],
    payment_methods: [],
  },
  {
    email: 'suspended@electroprice.com',
    name: 'Cuenta Suspendida Demo',
    phone: '+525500000004',
    role: 'user',
    status: 'suspended',
    avatar_url: 'https://i.pravatar.cc/150?u=electroprice-suspended',
    favorites: [],
    cart: [],
    addresses: [],
    payment_methods: [],
  },
];

const DEMO_WHOLESALERS = [
  {
    name: 'Ingram Demo',
    contact: 'ventas@ingramdemo.mx',
    rating: 4.8,
    stock_sync: 'Real-time',
    logo_url: 'https://i.pravatar.cc/100?u=ingram-demo',
    status: 'Approved',
  },
  {
    name: 'CVA Demo',
    contact: 'ventas@cvademo.mx',
    rating: 4.5,
    stock_sync: 'Daily',
    logo_url: 'https://i.pravatar.cc/100?u=cva-demo',
    status: 'Approved',
  },
];

const DEMO_PRODUCTS = [
  {
    name: 'Dell XPS 15 Demo',
    brand: 'Dell',
    category: 'laptops',
    image_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
    description: 'Laptop demo para flujos de cliente y admin.',
    specs: { pantalla: '15.6"', ram: '16 GB', storage: '1 TB SSD' },
    avg_rating: 4.7,
    review_count: 12,
    feature_score: 91,
    old_price: 1699.99,
    watching: 64,
    deal_tag: 'Demo',
    smart_tag: 'PremiumPerformance',
    options: [{ name: 'Memoria', values: ['16 GB', '32 GB'] }],
  },
  {
    name: 'Sony WH-1000XM Demo',
    brand: 'Sony',
    category: 'headphones',
    image_url: 'https://images.pexels.com/photos/3394656/pexels-photo-3394656.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Audifonos demo con cancelacion de ruido.',
    specs: { bateria: '30 h', conectividad: 'Bluetooth', peso: '250 g' },
    avg_rating: 4.8,
    review_count: 27,
    feature_score: 88,
    old_price: 399.99,
    watching: 41,
    deal_tag: 'Demo',
    smart_tag: 'BestValue',
    options: [{ name: 'Color', values: ['Negro', 'Plata'] }],
  },
  {
    name: 'LG OLED C3 Demo',
    brand: 'LG',
    category: 'tvs',
    image_url: 'https://images.pexels.com/photos/5721908/pexels-photo-5721908.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Television demo para validar pedidos y stock.',
    specs: { tamano: '55"', panel: 'OLED', refresh: '120 Hz' },
    avg_rating: 4.6,
    review_count: 18,
    feature_score: 86,
    old_price: 1399.99,
    watching: 28,
    deal_tag: 'Demo',
    smart_tag: 'BestValue',
    options: [{ name: 'Tamano', values: ['55"', '65"'] }],
  },
];

const getFirstRecord = async (collection, filter) => {
  try {
    return await pb.collection(collection).getFirstListItem(filter);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
};

const upsertUser = async (payload) => {
  const existing = await getFirstRecord('users', pb.filter('email = {:email}', { email: payload.email }));
  const basePayload = {
    ...payload,
    emailVisibility: true,
    verified: true,
    reviews: payload.reviews || [],
    favorites: payload.favorites || [],
    cart: payload.cart || [],
    order_ids: payload.order_ids || [],
    addresses: payload.addresses || [],
    payment_methods: payload.payment_methods || [],
    password: DEMO_PASSWORD,
    passwordConfirm: DEMO_PASSWORD,
  };

  if (existing) {
    const updated = await pb.collection('users').update(existing.id, basePayload);
    console.log(`updated user ${payload.email}`);
    return updated;
  }

  const created = await pb.collection('users').create(basePayload);
  console.log(`created user ${payload.email}`);
  return created;
};

const ensureSystemSettings = async () => {
  const page = await pb.collection('system_settings').getList(1, 1).catch(() => ({ items: [] }));
  const existing = page.items[0];
  if (existing) {
    await pb.collection('system_settings').update(existing.id, { test_mode: true, maintenance: false });
    return;
  }

  await pb.collection('system_settings').create({ test_mode: true, maintenance: false });
};

const ensureWholesalers = async () => {
  const existing = await pb.collection('wholesalers').getFullList();
  if (existing.length > 0) return existing;

  const created = [];
  for (const wholesaler of DEMO_WHOLESALERS) {
    created.push(await pb.collection('wholesalers').create(wholesaler));
  }
  console.log(`created ${created.length} demo wholesalers`);
  return created;
};

const ensureProducts = async (wholesalers) => {
  const existing = await pb.collection('products').getFullList();
  if (existing.length > 0) return existing;

  const created = [];
  for (const [index, product] of DEMO_PRODUCTS.entries()) {
    const stock = wholesalers.map((wholesaler, wholesalerIndex) => ({
      wholesalerId: wholesaler.id,
      price: [1499.99, 329.99, 1099.99][index] + wholesalerIndex * 18,
      stock: index === 0 ? 3 + wholesalerIndex : 12 + wholesalerIndex * 4,
    }));
    const today = Date.now();
    const price_history = Array.from({ length: 30 }, (_, dayIndex) => ({
      date: new Date(today - (29 - dayIndex) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      price: Math.round((stock[0].price + Math.sin(dayIndex / 4) * 25 - dayIndex * 1.5) * 100) / 100,
    }));

    created.push(await pb.collection('products').create({
      ...product,
      wholesaler_stock: stock,
      price_history,
    }));
  }

  console.log(`created ${created.length} demo products`);
  return created;
};

const deleteRecordsForUsers = async (collection, field, users) => {
  for (const user of users) {
    const records = await pb.collection(collection).getFullList({
      filter: pb.filter(`${field} = {:userId}`, { userId: user.id }),
    });
    for (const record of records) {
      await pb.collection(collection).delete(record.id);
    }
  }
};

const getProductPrice = (product) => {
  const prices = (product.wholesaler_stock || []).map(item => item.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : 999;
};

const buildOrderItem = (product, quantity = 1) => {
  const stock = product.wholesaler_stock?.[0];
  return {
    productId: product.id,
    name: product.name,
    imageUrl: product.image_url,
    quantity,
    price: getProductPrice(product),
    cost: stock?.price || getProductPrice(product),
    wholesalerId: stock?.wholesalerId || '',
  };
};

const createOrder = async ({ user, products, status, daysAgo, trackingNumber, wholesalerTrackingNumber }) => {
  const items = products.map((product, index) => buildOrderItem(product, index === 0 ? 1 : 2));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const purchaseOrders = items.map((item, index) => ({
    id: `po_demo_${daysAgo}_${index + 1}`,
    providerId: item.wholesalerId,
    providerName: index === 0 ? 'Ingram Demo' : 'CVA Demo',
    channel: 'api',
    runtime: 'vhub',
    status: status === 'Delivered' ? 'Delivered' : 'Paid',
    paymentStatus: 'Paid',
    items: [item],
    subtotalCost: item.cost * item.quantity,
    shippingAddress: 'DEMO - Av. Reforma 120, Cuauhtemoc, CDMX 06600',
    providerOrderId: `B2B-DEMO-${daysAgo}${index}`,
    providerTrackingNumber: wholesalerTrackingNumber,
    runtimeTraceId: `vhub_demo_${daysAgo}${index}`,
    paidAt: date,
    submittedAt: date,
  }));

  return pb.collection('orders').create({
    user_id: user.id,
    date,
    items,
    total,
    total_cost: totalCost,
    status,
    subshopping_status: status === 'Delivered' ? 'Completed' : 'Tracking',
    purchase_orders: purchaseOrders,
    fulfillment_timeline: [
      {
        id: `evt_demo_${daysAgo}_paid`,
        at: date,
        actor: 'retail',
        title: 'Pago retail capturado',
        detail: 'Orden demo pagada y convertida en compras mayoristas.',
        status: 'ok',
      },
      {
        id: `evt_demo_${daysAgo}_b2b`,
        at: date,
        actor: 'vhub',
        title: 'Subshopping ejecutado',
        detail: `${purchaseOrders.length} orden(es) de compra B2B enviadas.`,
        status: 'ok',
      },
    ],
    shipping_address: 'DEMO - Av. Reforma 120, Cuauhtemoc, CDMX 06600',
    tracking_number: trackingNumber,
    wholesaler_tracking_number: wholesalerTrackingNumber,
  });
};

const createReview = async ({ user, product, rating, comment, status, daysAgo }) => (
  pb.collection('reviews').create({
    author: user.name,
    author_id: user.id,
    product_id: product.id,
    rating,
    comment,
    date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    status,
  })
);

const main = async () => {
  console.log(`connecting to ${PB_URL}`);
  await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASSWORD);
  console.log('authenticated as superuser');

  await pb.settings.update({ meta: { passwordMinLength: Math.max(8, DEMO_PASSWORD.length) } }).catch((error) => {
    console.warn('could not update password policy:', error.message);
  });

  await ensureSystemSettings();
  const wholesalers = await ensureWholesalers();
  const products = await ensureProducts(wholesalers);

  if (products.length === 0) {
    throw new Error('No products are available. Run pb_setup and seed products before creating demo activity.');
  }

  const seededUsers = [];
  for (const demoUser of DEMO_USERS) {
    seededUsers.push(await upsertUser(demoUser));
  }

  const buyer = seededUsers.find(item => item.email === 'user@electroprice.com');
  await deleteRecordsForUsers('orders', 'user_id', seededUsers);
  await deleteRecordsForUsers('reviews', 'author_id', seededUsers);

  const firstProduct = products[0];
  const secondProduct = products[1] || products[0];
  const thirdProduct = products[2] || products[0];

  const cart = [
    { productId: firstProduct.id, quantity: 1, price: getProductPrice(firstProduct) },
    { productId: secondProduct.id, quantity: 2, price: getProductPrice(secondProduct) },
  ];

  const orders = [
    await createOrder({
      user: buyer,
      products: [firstProduct, secondProduct],
      status: 'Shipped to You',
      daysAgo: 2,
      trackingNumber: 'EP-DEMO-1001',
      wholesalerTrackingNumber: 'WH-DEMO-7711',
    }),
    await createOrder({
      user: buyer,
      products: [thirdProduct],
      status: 'Delivered',
      daysAgo: 18,
      trackingNumber: 'EP-DEMO-0994',
      wholesalerTrackingNumber: 'WH-DEMO-7655',
    }),
  ];

  const reviewRecords = [
    await createReview({
      user: buyer,
      product: firstProduct,
      rating: 5,
      comment: 'Excelente rendimiento y la comparacion de precios ayudo a comprar sin dudas.',
      status: 'approved',
      daysAgo: 12,
    }),
    await createReview({
      user: buyer,
      product: secondProduct,
      rating: 4,
      comment: 'Buen precio, pero quiero validar la garantia antes de recomendarlo.',
      status: 'pending',
      daysAgo: 1,
    }),
  ];

  await pb.collection('users').update(buyer.id, {
    cart,
    favorites: [firstProduct.id, secondProduct.id, thirdProduct.id],
    order_ids: orders.map(order => order.id),
    reviews: reviewRecords.map(review => review.id),
    password: DEMO_PASSWORD,
    passwordConfirm: DEMO_PASSWORD,
  });

  console.log('\nDemo users ready:');
  console.log(`- admin.user@electroprice.com / ${DEMO_PASSWORD} (app admin)`);
  console.log(`- user@electroprice.com / ${DEMO_PASSWORD} (buyer with cart, favorites, orders, reviews)`);
  console.log(`- retailer@electroprice.com / ${DEMO_PASSWORD} (retailer)`);
  console.log(`- suspended@electroprice.com / ${DEMO_PASSWORD} (suspended user)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
