
import type { Product, Category, SmartFilterConfig, Supplier, Wholesaler, Order, User } from './types';

export const CATEGORIES: Omit<Category, 'name'>[] = [
  { id: 'smartphones', imageUrl: 'https://picsum.photos/seed/smartphone/300/200' },
  { id: 'laptops', imageUrl: 'https://picsum.photos/seed/laptop/300/200' },
  { id: 'headphones', imageUrl: 'https://picsum.photos/seed/headphone/300/200' },
  { id: 'cameras', imageUrl: 'https://picsum.photos/seed/camera/300/200' },
  { id: 'tvs', imageUrl: 'https://picsum.photos/seed/tv/300/200' },
  { id: 'gaming', imageUrl: 'https://picsum.photos/seed/console/300/200' },
];

const generatePriceHistory = (basePrice: number, hasRecentDrop: boolean = true): { date: string, price: number }[] => {
  const history = [];
  let currentPrice = basePrice * (1 + (Math.random() - 0.2) * 0.4); // Start +/- 20%
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    currentPrice *= (1 + (Math.random() - 0.5) * 0.05); // Fluctuate +/- 2.5%
    if (i === 7 && hasRecentDrop) { // Recent price drop for "deal" items
      currentPrice *= 0.85;
    }
    history.push({ date: date.toISOString().split('T')[0], price: parseFloat(currentPrice.toFixed(2)) });
  }
  history[history.length - 1].price = basePrice; // Ensure last price is the current price
  return history;
};

export const MOCK_WHOLESALERS: Wholesaler[] = [
    // FIX: Added status to wholesalers
    { id: 'wh-ingram', name: 'Ingram Micro', contact: 'ventas@ingrammicro.com.mx', rating: 4.8, stockSync: 'Real-time', logoUrl: 'https://picsum.photos/seed/ingram/100/30', status: 'Approved' },
    { id: 'wh-cva', name: 'CVA', contact: 'contacto@grupocva.com', rating: 4.6, stockSync: 'Daily', logoUrl: 'https://picsum.photos/seed/cva/100/30', status: 'Approved' },
    { id: 'wh-ctoneline', name: 'CTOnline', contact: 'info@ctoneline.com', rating: 4.7, stockSync: 'Real-time', logoUrl: 'https://picsum.photos/seed/ctonline/100/30', status: 'Pending' },
    { id: 'wh-techdata', name: 'TechData', contact: 'sales@techdata.com', rating: 4.5, stockSync: 'Daily', logoUrl: 'https://picsum.photos/seed/techdata/100/30', status: 'Disabled' },
];

// FIX: Added missing MOCK_SHOPS constant
export const MOCK_SHOPS: { id: string, name: string, promoImageUrl: string, logoUrl: string }[] = [
    { id: 'wh-ingram', name: 'Ingram Micro', promoImageUrl: 'https://picsum.photos/seed/ingram-promo/400/300', logoUrl: 'https://picsum.photos/seed/ingram/100/30' },
    { id: 'wh-cva', name: 'CVA', promoImageUrl: 'https://picsum.photos/seed/cva-promo/400/300', logoUrl: 'https://picsum.photos/seed/cva/100/30' },
    { id: 'wh-ctoneline', name: 'CTOnline', promoImageUrl: 'https://picsum.photos/seed/ctonline-promo/400/300', logoUrl: 'https://picsum.photos/seed/ctonline/100/30' },
    { id: 'wh-techdata', name: 'TechData', promoImageUrl: 'https://picsum.photos/seed/techdata-promo/400/300', logoUrl: 'https://picsum.photos/seed/techdata/100/30' },
];

export const MOCK_PRODUCTS: Product[] = [
  // New Laptops for variety
  {
    id: 'prod-021',
    name: 'HP Spectre x360 14',
    brand: 'HP',
    category: 'laptops',
    imageUrl: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'A versatile 2-in-1 laptop with a stunning OLED display and powerful performance.',
    specs: { 'CPU': 'Intel Core Ultra 7', 'RAM': '16', 'Storage': '1024' },
    avgRating: 4.6,
    reviewCount: 450,
    featureScore: 88,
    smartTag: 'Premium Performance',
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 1399.99, stock: 15 },
        { wholesalerId: 'wh-techdata', price: 1405.50, stock: 10 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(1399.99, false)
  },
  {
    id: 'prod-022',
    name: 'Lenovo ThinkPad X1 Carbon',
    brand: 'Lenovo',
    category: 'laptops',
    imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Ultralight, ultrapowerful, and ultra-durable business laptop.',
    specs: { 'CPU': 'Intel Core i7', 'RAM': '32', 'Storage': '1024' },
    avgRating: 4.9, // Triggers "Highly Rated"
    reviewCount: 980,
    featureScore: 92,
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 1899.00, stock: 8 },
        { wholesalerId: 'wh-cva', price: 1889.90, stock: 12 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(1889.90)
  },
  // New Smartphones for variety
  {
    id: 'prod-023',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'smartphones',
    imageUrl: 'https://images.pexels.com/photos/1036841/pexels-photo-1036841.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Experience the new era of mobile AI with Galaxy S24 Ultra.',
    specs: { 'Storage': '512', 'Color': 'Titanium Gray', 'Camera': '200' },
    avgRating: 4.8, // Triggers "Highly Rated"
    reviewCount: 1500,
    featureScore: 98,
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 1299.00, stock: 30 },
        { wholesalerId: 'wh-cva', price: 1305.00, stock: 25 },
        { wholesalerId: 'wh-ctoneline', price: 1295.99, stock: 40 },
    ],
    reviews: [
        { id: 'rev-s1', author: 'AndroidFan', rating: 5, comment: 'The AI features are a game changer. Camera zoom is insane!', date: '2024-05-22', productId: 'prod-023'},
        { id: 'rev-s2', author: 'PowerUser', rating: 4, comment: 'Battery life is good, but not mind-blowing. The flat screen is a welcome change.', date: '2024-05-21', productId: 'prod-023'},
    ],
    priceHistory: generatePriceHistory(1295.99, false),
    options: [
        { name: 'Color', values: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'] },
        { name: 'Capacidad', values: ['256GB', '512GB', '1TB'] }
    ]
  },
  {
    id: 'prod-024',
    name: 'OnePlus 12',
    brand: 'OnePlus',
    category: 'smartphones',
    imageUrl: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Smooth beyond belief, with a powerful Hasselblad camera system.',
    specs: { 'Storage': '256', 'Color': 'Emerald Green', 'Camera': '50' },
    avgRating: 4.7,
    reviewCount: 750,
    featureScore: 90,
    wholesalerStock: [
        { wholesalerId: 'wh-techdata', price: 799.00, stock: 50 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(799.00),
    options: [
        { name: 'Color', values: ['Emerald Green', 'Silky Black'] },
        { name: 'Combo', values: ['Solo equipo', '+ Buds Pro 2 (Ahorra $50)', '+ Watch 2 (Ahorra $80)'] }
    ]
  },
  // New Camera & TV
  {
    id: 'prod-025',
    name: 'Canon EOS R5',
    brand: 'Canon',
    category: 'cameras',
    imageUrl: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'A professional full-frame mirrorless camera with groundbreaking 8K video.',
    specs: { 'Megapixels': '45', 'Sensor': 'Full-Frame CMOS', 'Video': '8K' },
    avgRating: 4.9,
    reviewCount: 880,
    featureScore: 99,
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 3899.00, stock: 5 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(3899.00, false)
  },
  {
    id: 'prod-026',
    name: 'Samsung 65" QN90C Neo QLED TV',
    brand: 'Samsung',
    category: 'tvs',
    imageUrl: 'https://images.pexels.com/photos/333984/pexels-photo-333984.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Experience brilliant details and cinematic sound with Quantum Matrix Technology.',
    specs: { 'Size': '65"', 'Panel': 'Neo QLED', 'Resolution': '4K' },
    avgRating: 4.8,
    reviewCount: 1120,
    featureScore: 96,
    wholesalerStock: [
        { wholesalerId: 'wh-cva', price: 1599.00, stock: 12 },
        { wholesalerId: 'wh-ctoneline', price: 1610.00, stock: 10 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(1599.00)
  },
   {
    id: 'prod-027',
    name: 'LG C3 55" OLED evo TV',
    brand: 'LG',
    category: 'tvs',
    imageUrl: 'https://images.pexels.com/photos/1682519/pexels-photo-1682519.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Incredible picture quality with self-lit pixels, perfect for movies and gaming.',
    specs: { 'Size': '55"', 'Panel': 'OLED', 'Resolution': '4K' },
    avgRating: 4.9,
    reviewCount: 1850,
    featureScore: 97,
    smartTag: 'Premium Performance',
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 1499.00, stock: 20 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(1499.00, false)
  },
  {
    id: 'prod-028',
    name: 'Bose QuietComfort Ultra',
    brand: 'Bose',
    category: 'headphones',
    imageUrl: 'https://images.pexels.com/photos/1037999/pexels-photo-1037999.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'World-class noise cancellation and high-fidelity audio in a comfortable design.',
    specs: { 'Type': 'Over-ear', 'Color': 'White Smoke' },
    avgRating: 4.7,
    reviewCount: 1600,
    featureScore: 91,
    wholesalerStock: [
        { wholesalerId: 'wh-techdata', price: 379.00, stock: 100 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(379.00),
    options: [
        { name: 'Color', values: ['White Smoke', 'Black', 'Sandstone'] },
        { name: 'Extras', values: ['Estuche Estándar', 'Cargador Rápido (+ $29)', 'Cable Largo (+ $15)'] }
    ]
  },
  // Original products
  {
    id: 'prod-019',
    name: 'Dell XPS 15 Laptop',
    brand: 'Dell',
    category: 'laptops',
    imageUrl: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Stunning display, immersive sound and a sophisticated design.',
    specs: { 'CPU': 'Intel Core i7', 'RAM': '16', 'Storage': '512' },
    avgRating: 4.7,
    reviewCount: 640,
    featureScore: 85,
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 1499.99, stock: 20 },
        { wholesalerId: 'wh-cva', price: 1510.00, stock: 5 },
    ],
    reviews: [
        { id: 'rev-d1', author: 'TechGuru', rating: 5, comment: 'Absolute powerhouse. The screen is gorgeous and it handles everything I throw at it.', date: '2024-05-20', productId: 'prod-019'},
        { id: 'rev-d2', author: 'DesignerDeb', rating: 4, comment: 'Great for creative work, but it can get a bit hot under heavy load.', date: '2024-05-18', productId: 'prod-019'},
    ],
    priceHistory: generatePriceHistory(1499.99)
  },
  {
    id: 'prod-010',
    name: 'Apple MacBook Air M3 13"',
    brand: 'Apple',
    category: 'laptops',
    watching: 500,
    imageUrl: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'The new MacBook Air is more capable, more intuitive, and even more fun.',
    specs: { 'Chip': 'M3', 'RAM': '8', 'Storage': '256' },
    avgRating: 4.8,
    reviewCount: 1980,
    featureScore: 78,
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 999.00, stock: 0 },
        { wholesalerId: 'wh-techdata', price: 1019.00, stock: 50 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(999.00, false)
  },
  {
    id: 'prod-011',
    name: 'Apple iPhone 17 Pro Max',
    brand: 'Apple',
    category: 'smartphones',
    imageUrl: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'The ultimate iPhone, with the powerful A18 Pro chip and a pro camera system.',
    specs: { 'Storage': '256', 'Color': 'Natural Titanium', 'Camera': '48' },
    avgRating: 4.9,
    reviewCount: 2045,
    featureScore: 95,
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 1099.00, stock: 40 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(1099.00)
  },
  {
    id: 'prod-014',
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    category: 'smartphones',
    dealTag: 'Black Friday -20%',
    smartTag: 'Best Value',
    imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'The helpful phone, with an amazing camera and all-day battery.',
    specs: { 'Storage': '128', 'Color': 'Rose', 'Camera': '50' },
    avgRating: 4.6,
    reviewCount: 889,
    oldPrice: 699.00,
    featureScore: 88,
    wholesalerStock: [
        { wholesalerId: 'wh-ctoneline', price: 550.00, stock: 30 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(550.00)
  },
  {
    id: 'prod-013',
    name: 'Motorola Moto G75 5G',
    brand: 'Motorola',
    category: 'smartphones',
    dealTag: 'Black Friday -43%',
    imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Incredible 5G speed, a stunning display, and a powerful camera system.',
    specs: { 'Storage': '128', 'Color': 'Carbon', 'Camera': '50' },
    avgRating: 4.5,
    reviewCount: 432,
    oldPrice: 261.07,
    featureScore: 65,
    wholesalerStock: [
        { wholesalerId: 'wh-cva', price: 149.00, stock: 0 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(149.00)
  },
  {
    id: 'prod-004',
    name: 'Battlefield 6 (PS5)',
    brand: 'EA',
    category: 'gaming',
    imageUrl: 'https://images.pexels.com/photos/200232/pexels-photo-200232.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: "Experience the next generation of all-out war in Battlefield 6.",
    specs: { 'Platform': 'PlayStation 5', 'Genre': 'First-Person Shooter' },
    avgRating: 4.7,
    reviewCount: 1205,
    oldPrice: 56.99,
    featureScore: 70,
    dealTag: 'Black Friday -12%',
    wholesalerStock: [
        { wholesalerId: 'wh-ingram', price: 49.99, stock: 100 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(49.99, false)
  },
  {
    id: 'prod-009',
    name: 'Meta Quest 3 512 GB',
    brand: 'Meta',
    category: 'gaming',
    watching: 500,
    imageUrl: 'https://images.pexels.com/photos/8433434/pexels-photo-8433434.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Dive into stunning mixed reality experiences with the most powerful Quest yet.',
    specs: { 'Storage': '512 GB', 'Type': 'VR Headset' },
    avgRating: 4.2,
    reviewCount: 350,
    featureScore: 82,
    wholesalerStock: [
        { wholesalerId: 'wh-techdata', price: 381.04, stock: 15 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(381.04)
  },
  {
    id: 'prod-016',
    name: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    category: 'headphones',
    imageUrl: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Industry-leading noise cancellation and breathtaking high-resolution audio.',
    specs: { 'Type': 'Over-ear', 'Color': 'Black' },
    avgRating: 4.8,
    reviewCount: 2150,
    oldPrice: 380.00,
    featureScore: 92,
    dealTag: 'Black Friday -25%',
    smartTag: 'Premium Performance',
    wholesalerStock: [
        { wholesalerId: 'wh-cva', price: 285.00, stock: 75 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(285.00)
  },
  {
    id: 'prod-020',
    name: 'Samsung Odyssey G9 Curved Monitor',
    brand: 'Samsung',
    category: 'gaming',
    imageUrl: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '49-inch super ultrawide monitor with a 1000R curve to immerse you in the game.',
    specs: { 'Size': '49"', 'Resolution': 'Dual QHD', 'Refresh Rate': '240Hz' },
    avgRating: 4.8,
    reviewCount: 950,
    oldPrice: 1399.99,
    featureScore: 98,
    dealTag: 'Buen Fin -15%',
    wholesalerStock: [
        { wholesalerId: 'wh-ctoneline', price: 1189.99, stock: 15 },
    ],
    reviews: [],
    priceHistory: generatePriceHistory(1189.99)
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-123',
    name: 'Customer Carla',
    email: 'carla@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=carla',
    role: 'user',
    favorites: ['prod-019', 'prod-011'],
    reviews: ['rev-d1'],
    status: 'active',
    cart: [
        { productId: 'prod-023', quantity: 1, price: 1295.99 },
        { productId: 'prod-028', quantity: 2, price: 379.00 },
    ],
    orderIds: ['ORD-001', 'ORD-002'],
    addresses: [],
    paymentMethods: [],
  },
  {
    id: 'admin-456',
    name: 'Admin Adam',
    email: 'adam@electroprice.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=adam',
    role: 'admin',
    favorites: [],
    reviews: [],
    status: 'active',
    cart: [],
    orderIds: [],
    addresses: [],
    paymentMethods: [],
  },
];

export const SMART_FILTER_CONFIG: SmartFilterConfig = {
  laptops: [
    { type: 'slider', key: 'RAM', labelKey: 'smartFilters.ram', min: 4, max: 32, step: 4, unit: 'GB' },
    { type: 'slider', key: 'Storage', labelKey: 'smartFilters.storage', min: 128, max: 1024, step: 128, unit: 'GB' },
    { type: 'checkbox', key: 'brand', labelKey: 'list.filters.brand', options: ['Apple', 'Dell', 'HP', 'Lenovo'] },
  ],
  smartphones: [
    { type: 'slider', key: 'Storage', labelKey: 'smartFilters.storage', min: 64, max: 512, step: 64, unit: 'GB' },
    { type: 'slider', key: 'Camera', labelKey: 'smartFilters.camera', min: 12, max: 200, step: 4, unit: 'MP' },
    { type: 'checkbox', key: 'brand', labelKey: 'list.filters.brand', options: ['Apple', 'Google', 'Motorola', 'Samsung', 'OnePlus'] },
  ],
};

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Ingram Micro API', type: 'API', status: 'Active', lastSync: '2024-05-23T10:00:00Z' },
    { id: 'sup-2', name: 'CVA Price Scraper', type: 'Scraping', status: 'Active', lastSync: '2024-05-23T11:30:00Z' },
    { id: 'sup-3', name: 'CTOnline Feed', type: 'API', status: 'Inactive', lastSync: '2024-05-21T08:00:00Z' },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-001',
        userId: 'user-123',
        date: '2024-05-20T14:48:00Z',
        items: [
            { productId: 'prod-019', name: MOCK_PRODUCTS.find(p => p.id === 'prod-019')?.name || '', imageUrl: MOCK_PRODUCTS.find(p => p.id === 'prod-019')?.imageUrl || '', quantity: 1, price: 1499.99, cost: 1300.00, wholesalerId: 'wh-ingram' },
        ],
        total: 1499.99,
        totalCost: 1300.00,
        status: 'Delivered',
        shippingAddress: '123 Tech Lane, Silicon Valley, CA 94043',
        trackingNumber: '1Z999AA10123456784',
    },
    {
        id: 'ORD-002',
        userId: 'user-123',
        date: '2024-05-22T09:15:00Z',
        items: [
            { productId: 'prod-011', name: MOCK_PRODUCTS.find(p => p.id === 'prod-011')?.name || '', imageUrl: MOCK_PRODUCTS.find(p => p.id === 'prod-011')?.imageUrl || '', quantity: 1, price: 1099.00, cost: 950.00, wholesalerId: 'wh-ingram' },
            { productId: 'prod-016', name: MOCK_PRODUCTS.find(p => p.id === 'prod-016')?.name || '', imageUrl: MOCK_PRODUCTS.find(p => p.id === 'prod-016')?.imageUrl || '', quantity: 1, price: 285.00, cost: 240.00, wholesalerId: 'wh-cva' },
        ],
        total: 1384.00,
        totalCost: 1190.00,
        status: 'Shipped to You',
        shippingAddress: '123 Tech Lane, Silicon Valley, CA 94043',
        wholesalerTrackingNumber: 'WHTN556677',
        trackingNumber: '1Z999AA10198765432'
    },
];