// ============================================
// paint_n_meraki — UNIFIED DATABASE SERVICE
// Resilient Data Access with Prisma + Active Runtime Store
// ============================================

import { prisma } from '@/lib/prisma';
import {
  Product,
  Category,
  Order,
  OrderItem,
  CustomOrderRequest,
  Review,
  BusinessSettings,
  Coupon,
  Banner,
  HomepageConfig,
  ActivityLog,
  User,
  ProductSize,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  CustomOrderStatus,
  DiscountType,
} from '@/types';
import {
  products as seedProducts,
  categories as seedCategories,
  demoReviews as seedReviews,
} from '@/lib/data/products';

// Default Business Settings
const defaultSettings: BusinessSettings = {
  businessName: 'paint_n_meraki',
  logo: '/logo.png',
  whatsappNumber: '919878541310',
  instagramUrl: 'https://www.instagram.com/paint.meraki',
  email: 'hello@paintmeraki.com',
  upiId: 'paintmeraki@upi',
  upiQrCode: '',
  codEnabled: true,
  codMinOrder: 0,
  codMaxOrder: 10000,
  codFee: 0,
  shippingCharge: 99,
  freeShippingThreshold: 2000,
  processingTime: '5-7 business days',
  deliveryTime: '3-5 business days',
  announcementText: '♡ Handmade with Love | ✦ Custom Orders Available | Free Shipping Above ₹2,000 ♡',
  announcementEnabled: true,
  businessAddress: 'Gujarat, India',
};

// Default Homepage Config
const defaultHomepageConfig: HomepageConfig = {
  id: 'default',
  heroHeading: 'Art That Speaks to Your Soul',
  heroSubtitle: 'Handcrafted Resin Masterpieces & Custom Decor',
  heroDescription: 'Every piece at paint_n_meraki is meticulously handcrafted with love, precision, and artistic passion by Astha Patel.',
  heroButtonText: 'Explore Collection',
  heroButtonLink: '/shop',
  heroImage: '/images/categories/clock-2.jpg',
  heroEnabled: true,
  featuredCategories: ['resin-clocks', 'pooja-thalis', 'decorative-frames', 'resin-hanging-decor'],
  featuredProducts: ['classic-geode-resin-clock-10-inch', 'handcrafted-resin-pooja-thali-8-inch', 'decorative-photo-frame-10-inch'],
  bestSellers: ['classic-geode-resin-clock-10-inch', '3-piece-geode-resin-clock-16-20-inch', 'custom-resin-krishna-magnets-hanging'],
  newArrivals: ['handcrafted-resin-ganesh-wall-hanging', 'ocean-wave-resin-clock-12-inch'],
  updatedAt: new Date().toISOString(),
};

// Initial Banners
const defaultBanners: Banner[] = [
  {
    id: 'ban-1',
    title: 'New Festive Resin Clocks Collection',
    subtitle: 'Limited Edition Geode & Marble Resin Art',
    imageUrl: '/images/categories/clock-2.jpg',
    buttonText: 'Shop Clocks',
    buttonLink: '/shop/resin-clocks',
    position: 'hero',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ban-2',
    title: 'Custom Creations for Special Moments',
    subtitle: 'Personalized Names, Dates, Flowers & Colors',
    imageUrl: '/images/categories/custom.jpg',
    buttonText: 'Order Custom Art',
    buttonLink: '/custom-order',
    position: 'promo',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Coupons
const defaultCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'MERAKI10',
    description: '10% off on all handcrafted orders',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 999,
    maxDiscount: 500,
    isActive: true,
    usedCount: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coup-2',
    code: 'FESTIVE250',
    description: 'Flat ₹250 off on orders above ₹2,500',
    discountType: 'FIXED',
    discountValue: 250,
    minOrderAmount: 2500,
    isActive: true,
    usedCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Users
const defaultUsers: User[] = [
  {
    id: 'admin-1',
    fullName: 'Astha Patel (Superadmin)',
    email: 'admin@paintmeraki.com',
    mobile: '9878541310',
    passwordHash: '$2b$10$wejTAV2az3YWLGQ3ym.JN.Iy130B5uhc3/BxSoPAVTTz7picLBM6e', // Asthapatel@#9990
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-2',
    fullName: 'Super Admin (Website Manager)',
    email: 'superadmin@paintmeraki.com',
    mobile: '9878541312',
    passwordHash: '$2b$10$7U.U6GZgiqtK.8PVTKvPT.mQA/cQgImyWyae.pgcdeIHW9UBzGk8G', // Soham@335323#
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-1',
    fullName: 'Support Team',
    email: 'staff@paintmeraki.com',
    mobile: '9878541311',
    passwordHash: '$2b$10$L7jd/4ElIo9XMorRY.FgNOr0gGnM3xauQ3F9ibC4WSAMxsq81lNZi', // admin123
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

// Initial Orders
const defaultOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'PM1001',
    customer: {
      fullName: 'Radhika Sharma',
      email: 'radhika@gmail.com',
      mobile: '9876543210',
    },
    items: [
      {
        id: 'item-1',
        product: seedProducts[0],
        quantity: 1,
        price: 2499,
        selectedSize: '10 inch',
      },
    ],
    shippingAddress: {
      address: '402, Shivalik Highstreet, Satellite',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      landmark: 'Near Iscon Cross Road',
    },
    subtotal: 2499,
    shippingCharge: 0,
    codFee: 0,
    total: 2499,
    paymentMethod: 'UPI',
    paymentStatus: 'CONFIRMED',
    orderStatus: 'PROCESSING',
    utrNumber: 'UTR389472918291',
    trackingNumber: 'DTDC982374612',
    courierName: 'DTDC Express',
    notes: 'Urgent anniversary gift',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-2',
    orderNumber: 'PM1002',
    customer: {
      fullName: 'Pooja Varma',
      email: 'pooja.v@outlook.com',
      mobile: '9823456789',
    },
    items: [
      {
        id: 'item-2',
        product: seedProducts[6],
        quantity: 1,
        price: 1599,
        selectedSize: '8 inch',
      },
    ],
    shippingAddress: {
      address: 'Flat 101, Green Heights, Vasant Kunj',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110070',
    },
    subtotal: 1599,
    shippingCharge: 99,
    codFee: 0,
    total: 1698,
    paymentMethod: 'UPI',
    paymentStatus: 'VERIFICATION',
    orderStatus: 'PAYMENT_VERIFICATION',
    utrNumber: 'UPI984729184019',
    notes: 'Awaiting payment check',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Custom Orders
const defaultCustomOrders: CustomOrderRequest[] = [
  {
    id: 'co-1',
    customerName: 'Kavita Mehta',
    whatsappNumber: '9876501234',
    email: 'kavita@yahoo.com',
    productType: 'Resin Wall Clock',
    preferredSize: '16 inch',
    preferredColors: 'Royal Emerald Green & Gold Foil',
    budget: '₹4,000 - ₹5,000',
    quotationAmount: 4500,
    referenceImageUrl: '/images/categories/clock-2.jpg',
    description: 'Looking for a royal green geode wall clock with crushed quartz crystals in the center and silent sweeping gold needles for living room wall.',
    specialInstructions: 'Need delivered before October 15th for housewarming.',
    adminNotes: 'Contacted customer on WhatsApp. Color sample approved.',
    status: 'IN_PRODUCTION',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'co-2',
    customerName: 'Amit Soni',
    whatsappNumber: '9123456780',
    email: 'amit.soni@gmail.com',
    productType: 'Preserved Flower Frame',
    preferredSize: '12x12 inch',
    preferredColors: 'Rose Gold & Pearlescent White',
    budget: '₹3,000 - ₹4,000',
    description: 'We want to preserve our wedding varmala flowers in a deep resin block frame with our names and wedding date (24-11-2025).',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-Memory Global Store to preserve runtime modifications across API calls
const globalRuntime = globalThis as unknown as {
  _products?: Product[];
  _categories?: Category[];
  _orders?: Order[];
  _customOrders?: CustomOrderRequest[];
  _reviews?: Review[];
  _settings?: BusinessSettings;
  _homepageConfig?: HomepageConfig;
  _banners?: Banner[];
  _coupons?: Coupon[];
  _users?: User[];
  _activityLogs?: ActivityLog[];
  _passwordResetTokens?: Array<{
    email: string;
    tokenHash: string;
    expiresAt: number;
    userId?: string;
    usedAt?: number;
  }>;
};

if (!globalRuntime._products || globalRuntime._products.length === 0) {
  globalRuntime._products = [...seedProducts];
}
if (!globalRuntime._categories || globalRuntime._categories.length === 0) {
  globalRuntime._categories = [...seedCategories];
}
if (!globalRuntime._orders || globalRuntime._orders.length === 0) {
  globalRuntime._orders = [...defaultOrders];
}
if (!globalRuntime._customOrders || globalRuntime._customOrders.length === 0) {
  globalRuntime._customOrders = [...defaultCustomOrders];
}
if (!globalRuntime._reviews || globalRuntime._reviews.length === 0) {
  globalRuntime._reviews = [...seedReviews];
}
if (!globalRuntime._settings) {
  globalRuntime._settings = { ...defaultSettings };
}
if (!globalRuntime._homepageConfig) {
  globalRuntime._homepageConfig = { ...defaultHomepageConfig };
}
if (!globalRuntime._banners || globalRuntime._banners.length === 0) {
  globalRuntime._banners = [...defaultBanners];
}
if (!globalRuntime._coupons || globalRuntime._coupons.length === 0) {
  globalRuntime._coupons = [...defaultCoupons];
}
if (!globalRuntime._users || globalRuntime._users.length === 0) {
  globalRuntime._users = [...defaultUsers];
}
if (!globalRuntime._activityLogs || globalRuntime._activityLogs.length === 0) {
  globalRuntime._activityLogs = [
    {
      id: 'log-1',
      adminEmail: 'admin@paintmeraki.com',
      adminName: 'Astha Patel',
      action: 'SYSTEM_INITIALIZED',
      entity: 'System',
      details: 'paint_n_meraki Admin Panel initialized with 16 catalog products & active collections',
      createdAt: new Date().toISOString(),
    },
  ];
}

// Log an activity
export async function logActivity(
  adminEmail: string,
  adminName: string,
  action: string,
  entity: string,
  details?: string,
  entityId?: string
) {
  const log: ActivityLog = {
    id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    adminEmail,
    adminName,
    action,
    entity,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };

  globalRuntime._activityLogs = [log, ...(globalRuntime._activityLogs || [])];

  try {
    if (process.env.DATABASE_URL) {
      await prisma.activityLog.create({
        data: {
          adminEmail,
          adminName,
          action,
          entity,
          entityId,
          details,
        },
      });
    }
  } catch {}
}

// ============================================
// PRODUCT SERVICE
// ============================================
export async function getAllProducts(): Promise<Product[]> {
  if (!globalRuntime._products || globalRuntime._products.length === 0) {
    globalRuntime._products = [...seedProducts];
  }
  return globalRuntime._products;
}

export async function getProductByIdOrSlug(identifier: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === identifier || p.slug === identifier);
}

export async function saveProduct(productData: Partial<Product> & { name: string; categorySlug: string; price: number }): Promise<Product> {
  const now = new Date().toISOString();
  const slug =
    productData.slug ||
    productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const category = (globalRuntime._categories || seedCategories).find((c) => c.slug === productData.categorySlug);
  const categoryName = category ? category.name : productData.category || 'Resin Art';

  const newProduct: Product = {
    id: productData.id || 'prod-' + Date.now().toString(36),
    name: productData.name,
    slug,
    category: categoryName,
    categorySlug: productData.categorySlug,
    description: productData.description || '',
    shortDescription: productData.shortDescription || '',
    price: Number(productData.price),
    compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : undefined,
    costPrice: productData.costPrice ? Number(productData.costPrice) : undefined,
    images: productData.images && productData.images.length > 0 ? productData.images : ['/images/categories/clock-2.jpg'],
    thumbnail: (productData.images && productData.images[0]) || productData.thumbnail || '/images/categories/clock-2.jpg',
    sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : [{ label: 'Standard', value: 'standard', price: Number(productData.price), stock: 10 }],
    colors: productData.colors || ['Gold', 'White', 'Blue'],
    customizable: Boolean(productData.customizable),
    featured: Boolean(productData.featured),
    bestSeller: Boolean(productData.bestSeller),
    isNewArrival: Boolean(productData.isNewArrival),
    status: productData.status || 'ACTIVE',
    tags: productData.tags || [],
    stock: Number(productData.stock ?? 10),
    sku: productData.sku || `PM-${slug.substring(0, 6).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
    weight: productData.weight || '1.2 kg',
    dimensions: productData.dimensions || '12 x 12 inches',
    material: productData.material || 'High-gloss Epoxy Resin on Solid MDF Base',
    careInstructions: productData.careInstructions || 'Wipe clean with a soft, damp microfiber cloth. Keep away from direct harsh sunlight.',
    shippingInfo: productData.shippingInfo || 'Dispatched in 4-6 business days. Free shipping across India.',
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 1,
    createdAt: productData.createdAt || now,
    updatedAt: now,
  };

  const existingIndex = (globalRuntime._products || []).findIndex((p) => p.id === newProduct.id || p.slug === newProduct.slug);
  if (existingIndex > -1) {
    globalRuntime._products![existingIndex] = newProduct;
  } else {
    globalRuntime._products = [newProduct, ...(globalRuntime._products || [])];
  }

  try {
    if (process.env.DATABASE_URL) {
      await prisma.product.upsert({
        where: { slug: newProduct.slug },
        update: {
          name: newProduct.name,
          categoryName: newProduct.category,
          categorySlug: newProduct.categorySlug,
          description: newProduct.description,
          shortDescription: newProduct.shortDescription,
          price: newProduct.price,
          compareAtPrice: newProduct.compareAtPrice,
          costPrice: newProduct.costPrice,
          images: newProduct.images,
          thumbnail: newProduct.thumbnail,
          sizes: newProduct.sizes as unknown as any,
          colors: newProduct.colors,
          customizable: newProduct.customizable,
          featured: newProduct.featured,
          bestSeller: newProduct.bestSeller,
          isNewArrival: newProduct.isNewArrival,
          status: newProduct.status as unknown as any,
          tags: newProduct.tags,
          stock: newProduct.stock,
          sku: newProduct.sku,
          weight: newProduct.weight,
          dimensions: newProduct.dimensions,
          material: newProduct.material,
          careInstructions: newProduct.careInstructions,
          shippingInfo: newProduct.shippingInfo,
        },
        create: {
          name: newProduct.name,
          slug: newProduct.slug,
          categoryName: newProduct.category,
          categorySlug: newProduct.categorySlug,
          description: newProduct.description,
          shortDescription: newProduct.shortDescription,
          price: newProduct.price,
          compareAtPrice: newProduct.compareAtPrice,
          costPrice: newProduct.costPrice,
          images: newProduct.images,
          thumbnail: newProduct.thumbnail,
          sizes: newProduct.sizes as unknown as any,
          colors: newProduct.colors,
          customizable: newProduct.customizable,
          featured: newProduct.featured,
          bestSeller: newProduct.bestSeller,
          isNewArrival: newProduct.isNewArrival,
          status: newProduct.status as unknown as any,
          tags: newProduct.tags,
          stock: newProduct.stock,
          sku: newProduct.sku,
          weight: newProduct.weight,
          dimensions: newProduct.dimensions,
          material: newProduct.material,
          careInstructions: newProduct.careInstructions,
          shippingInfo: newProduct.shippingInfo,
        },
      });
    }
  } catch {}

  return newProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const existing = (globalRuntime._products || []).find((p) => p.id === productId || p.slug === productId);
  if (!existing) return false;

  globalRuntime._products = (globalRuntime._products || []).filter((p) => p.id !== productId && p.slug !== productId);

  try {
    if (process.env.DATABASE_URL) {
      await prisma.product.delete({
        where: { slug: existing.slug },
      });
    }
  } catch {}

  return true;
}

// ============================================
// CATEGORY SERVICE
// ============================================
export async function getAllCategories(): Promise<Category[]> {
  if (!globalRuntime._categories || globalRuntime._categories.length === 0) {
    globalRuntime._categories = [...seedCategories];
  }
  const products = globalRuntime._products || seedProducts;
  return globalRuntime._categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categorySlug === c.slug).length,
  }));
}

export async function saveCategory(categoryData: Partial<Category> & { name: string }): Promise<Category> {
  const slug =
    categoryData.slug ||
    categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const newCategory: Category = {
    id: categoryData.id || 'cat-' + Date.now().toString(36),
    name: categoryData.name,
    slug,
    description: categoryData.description || `Handcrafted ${categoryData.name} collection by paint_n_meraki`,
    image: categoryData.image || '/images/categories/clock-2.jpg',
    sortOrder: categoryData.sortOrder ?? 0,
    productCount: categoryData.productCount ?? 0,
    createdAt: categoryData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = (globalRuntime._categories || []).findIndex((c) => c.id === newCategory.id || c.slug === newCategory.slug);
  if (existingIndex > -1) {
    globalRuntime._categories![existingIndex] = newCategory;
  } else {
    globalRuntime._categories = [...(globalRuntime._categories || []), newCategory];
  }

  try {
    if (process.env.DATABASE_URL) {
      await prisma.category.upsert({
        where: { slug: newCategory.slug },
        update: {
          name: newCategory.name,
          description: newCategory.description,
          image: newCategory.image,
          sortOrder: newCategory.sortOrder,
        },
        create: {
          name: newCategory.name,
          slug: newCategory.slug,
          description: newCategory.description,
          image: newCategory.image,
          sortOrder: newCategory.sortOrder,
        },
      });
    }
  } catch {}

  return newCategory;
}

export async function deleteCategory(slug: string): Promise<{ success: boolean; error?: string }> {
  const prods = (globalRuntime._products || []).filter((p) => p.categorySlug === slug);
  if (prods.length > 0) {
    return {
      success: false,
      error: `Cannot delete category with ${prods.length} assigned products. Please reassign or delete the products first.`,
    };
  }

  globalRuntime._categories = (globalRuntime._categories || []).filter((c) => c.slug !== slug && c.id !== slug);

  try {
    if (process.env.DATABASE_URL) {
      await prisma.category.delete({ where: { slug } });
    }
  } catch {}

  return { success: true };
}

// Helper to normalize and guarantee complete OrderItem structure
function normalizeOrderItem(item: any, idx: number): OrderItem {
  const price =
    typeof item.price === 'number' && !isNaN(item.price)
      ? item.price
      : typeof item.selectedSize?.price === 'number'
      ? item.selectedSize.price
      : typeof item.product?.price === 'number'
      ? item.product.price
      : 0;

  const sizeStr =
    typeof item.selectedSize === 'string'
      ? item.selectedSize
      : item.selectedSize?.label || 'Standard';

  return {
    id: item.id || `item-${idx + 1}-${Math.random().toString(36).substring(2, 7)}`,
    product: item.product || { name: 'Handcrafted Resin Art', price, thumbnail: '/images/categories/clock-2.jpg' },
    quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
    price,
    selectedSize: sizeStr,
    customization: item.customization,
  };
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
    subtotal: Number(order.subtotal) || 0,
    shippingCharge: Number(order.shippingCharge) || 0,
    codFee: Number(order.codFee) || 0,
    total: Number(order.total) || 0,
  };
}

export async function getAllOrders(): Promise<Order[]> {
  if (!globalRuntime._orders || globalRuntime._orders.length === 0) {
    globalRuntime._orders = [...defaultOrders];
  }
  return globalRuntime._orders.map(normalizeOrder);
}

export async function getOrderByIdOrNumber(identifier: string): Promise<Order | undefined> {
  const orders = await getAllOrders();
  const clean = identifier.toUpperCase().replace('#', '').trim();
  const found = orders.find(
    (o) =>
      o.id === identifier ||
      o.orderNumber.toUpperCase().replace('#', '').trim() === clean ||
      o.orderNumber === identifier
  );
  return found ? normalizeOrder(found) : undefined;
}

export async function updateOrderStatus(
  orderNumber: string,
  updates: Partial<Order>
): Promise<Order | undefined> {
  if (!globalRuntime._orders || globalRuntime._orders.length === 0) {
    globalRuntime._orders = [...defaultOrders];
  }
  const orders = globalRuntime._orders;
  const clean = orderNumber.toUpperCase().replace('#', '').trim();
  const idx = orders.findIndex(
    (o) =>
      o.orderNumber.toUpperCase().replace('#', '').trim() === clean ||
      o.id === orderNumber ||
      o.orderNumber === orderNumber
  );
  if (idx === -1) return undefined;

  const updated: Order = normalizeOrder({
    ...orders[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  orders[idx] = updated;
  globalRuntime._orders = orders;

  try {
    if (process.env.DATABASE_URL) {
      await prisma.order.update({
        where: { orderNumber: updated.orderNumber },
        data: {
          orderStatus: updated.orderStatus as unknown as any,
          paymentStatus: updated.paymentStatus as unknown as any,
          utrNumber: updated.utrNumber,
          trackingNumber: updated.trackingNumber,
          courierName: updated.courierName,
          notes: updated.notes,
        },
      });
    }
  } catch {}

  return updated;
}

export async function createOrder(order: Order): Promise<Order> {
  const normalized = normalizeOrder(order);
  if (!globalRuntime._orders || globalRuntime._orders.length === 0) {
    globalRuntime._orders = [...defaultOrders];
  }
  const list = globalRuntime._orders;
  const clean = normalized.orderNumber.toUpperCase().replace('#', '').trim();
  const existingIdx = list.findIndex(
    (o) =>
      o.orderNumber.toUpperCase().replace('#', '').trim() === clean ||
      o.id === normalized.id ||
      o.orderNumber === normalized.orderNumber
  );

  if (existingIdx > -1) {
    list[existingIdx] = normalized;
  } else {
    globalRuntime._orders = [normalized, ...list];
  }

  return normalized;
}

// ============================================
// CUSTOM ORDER SERVICE
// ============================================
export async function getAllCustomOrders(): Promise<CustomOrderRequest[]> {
  if (!globalRuntime._customOrders || globalRuntime._customOrders.length === 0) {
    globalRuntime._customOrders = [...defaultCustomOrders];
  }
  return globalRuntime._customOrders;
}

export async function updateCustomOrderStatus(
  id: string,
  updates: Partial<CustomOrderRequest>
): Promise<CustomOrderRequest | undefined> {
  const list = globalRuntime._customOrders || defaultCustomOrders;
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;

  const updated: CustomOrderRequest = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;

  try {
    if (process.env.DATABASE_URL) {
      await prisma.customOrder.update({
        where: { id },
        data: {
          status: updated.status as unknown as any,
          quotationAmount: updated.quotationAmount,
          adminNotes: updated.adminNotes,
        },
      });
    }
  } catch {}

  return updated;
}

// ============================================
// BUSINESS SETTINGS SERVICE
// ============================================
export async function getBusinessSettings(): Promise<BusinessSettings> {
  return globalRuntime._settings || defaultSettings;
}

export async function updateBusinessSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = globalRuntime._settings || defaultSettings;
  const updated: BusinessSettings = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  globalRuntime._settings = updated;

  try {
    if (process.env.DATABASE_URL) {
      await prisma.businessSettings.upsert({
        where: { id: 'default' },
        update: {
          ...data,
        },
        create: {
          id: 'default',
          ...updated,
        },
      });
    }
  } catch {}

  return updated;
}

// ============================================
// BANNERS SERVICE
// ============================================
export async function getAllBanners(): Promise<Banner[]> {
  if (!globalRuntime._banners || globalRuntime._banners.length === 0) {
    globalRuntime._banners = [...defaultBanners];
  }
  return globalRuntime._banners;
}

export async function saveBanner(bannerData: Partial<Banner> & { title: string; imageUrl: string }): Promise<Banner> {
  const newBanner: Banner = {
    id: bannerData.id || 'ban-' + Date.now().toString(36),
    title: bannerData.title,
    subtitle: bannerData.subtitle,
    imageUrl: bannerData.imageUrl,
    mobileImageUrl: bannerData.mobileImageUrl,
    buttonText: bannerData.buttonText || 'Explore Now',
    buttonLink: bannerData.buttonLink || '/shop',
    position: bannerData.position || 'hero',
    isActive: bannerData.isActive ?? true,
    sortOrder: bannerData.sortOrder ?? 0,
    startDate: bannerData.startDate,
    endDate: bannerData.endDate,
    createdAt: bannerData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = globalRuntime._banners || [];
  const idx = list.findIndex((b) => b.id === newBanner.id);
  if (idx > -1) {
    list[idx] = newBanner;
  } else {
    globalRuntime._banners = [newBanner, ...list];
  }

  try {
    if (process.env.DATABASE_URL) {
      await prisma.banner.upsert({
        where: { id: newBanner.id },
        update: {
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          imageUrl: newBanner.imageUrl,
          mobileImageUrl: newBanner.mobileImageUrl,
          buttonText: newBanner.buttonText,
          buttonLink: newBanner.buttonLink,
          position: newBanner.position,
          isActive: newBanner.isActive,
          sortOrder: newBanner.sortOrder,
        },
        create: {
          id: newBanner.id,
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          imageUrl: newBanner.imageUrl,
          mobileImageUrl: newBanner.mobileImageUrl,
          buttonText: newBanner.buttonText,
          buttonLink: newBanner.buttonLink,
          position: newBanner.position,
          isActive: newBanner.isActive,
          sortOrder: newBanner.sortOrder,
        },
      });
    }
  } catch {}

  return newBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  globalRuntime._banners = (globalRuntime._banners || []).filter((b) => b.id !== id);
  try {
    if (process.env.DATABASE_URL) {
      await prisma.banner.delete({ where: { id } });
    }
  } catch {}
  return true;
}

// ============================================
// COUPONS SERVICE
// ============================================
export async function getAllCoupons(): Promise<Coupon[]> {
  if (!globalRuntime._coupons || globalRuntime._coupons.length === 0) {
    globalRuntime._coupons = [...defaultCoupons];
  }
  return globalRuntime._coupons;
}

export async function saveCoupon(couponData: Partial<Coupon> & { code: string; discountValue: number }): Promise<Coupon> {
  const code = couponData.code.trim().toUpperCase();
  const newCoupon: Coupon = {
    id: couponData.id || 'coup-' + Date.now().toString(36),
    code,
    description: couponData.description || '',
    discountType: couponData.discountType || 'PERCENTAGE',
    discountValue: Number(couponData.discountValue),
    minOrderAmount: Number(couponData.minOrderAmount || 0),
    maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : undefined,
    expiryDate: couponData.expiryDate,
    usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : undefined,
    usedCount: couponData.usedCount || 0,
    isActive: couponData.isActive ?? true,
    createdAt: couponData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = globalRuntime._coupons || [];
  const idx = list.findIndex((c) => c.code === code || c.id === newCoupon.id);
  if (idx > -1) {
    list[idx] = newCoupon;
  } else {
    globalRuntime._coupons = [newCoupon, ...list];
  }

  try {
    if (process.env.DATABASE_URL) {
      await prisma.coupon.upsert({
        where: { code },
        update: {
          description: newCoupon.description,
          discountType: newCoupon.discountType as unknown as any,
          discountValue: newCoupon.discountValue,
          minOrderAmount: newCoupon.minOrderAmount,
          maxDiscount: newCoupon.maxDiscount,
          isActive: newCoupon.isActive,
        },
        create: {
          code,
          description: newCoupon.description,
          discountType: newCoupon.discountType as unknown as any,
          discountValue: newCoupon.discountValue,
          minOrderAmount: newCoupon.minOrderAmount,
          maxDiscount: newCoupon.maxDiscount,
          isActive: newCoupon.isActive,
        },
      });
    }
  } catch {}

  return newCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  globalRuntime._coupons = (globalRuntime._coupons || []).filter((c) => c.id !== id && c.code !== id);
  try {
    if (process.env.DATABASE_URL) {
      await prisma.coupon.delete({ where: { id } });
    }
  } catch {}
  return true;
}

export async function validateCouponCode(code: string, orderSubtotal: number): Promise<{ valid: boolean; discountAmount: number; message: string; coupon?: Coupon }> {
  const coupons = await getAllCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code' };
  }

  if (orderSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for this coupon`,
    };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, discountAmount: 0, message: 'This coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, message: 'This coupon has reached its maximum usage limit' };
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  if (discount > orderSubtotal) {
    discount = orderSubtotal;
  }

  return {
    valid: true,
    discountAmount: discount,
    message: `Coupon ${coupon.code} applied! Saved ₹${discount.toLocaleString('en-IN')}`,
    coupon,
  };
}

// ============================================
// HOMEPAGE CONFIG SERVICE
// ============================================
export async function getHomepageConfig(): Promise<HomepageConfig> {
  return globalRuntime._homepageConfig || defaultHomepageConfig;
}

export async function updateHomepageConfig(data: Partial<HomepageConfig>): Promise<HomepageConfig> {
  const current = globalRuntime._homepageConfig || defaultHomepageConfig;
  const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
  globalRuntime._homepageConfig = updated;
  return updated;
}

// ============================================
// REVIEWS SERVICE
// ============================================
export async function getAllReviews(): Promise<Review[]> {
  if (!globalRuntime._reviews || globalRuntime._reviews.length === 0) {
    globalRuntime._reviews = [...seedReviews];
  }
  return globalRuntime._reviews;
}

export async function updateReviewStatus(id: string, updates: Partial<Review>): Promise<Review | undefined> {
  const list = globalRuntime._reviews || seedReviews;
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const updated = { ...list[idx], ...updates };
  list[idx] = updated;
  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  globalRuntime._reviews = (globalRuntime._reviews || []).filter((r) => r.id !== id);
  return true;
}

// ============================================
// USERS & ADMIN SERVICE
// ============================================
export async function getAllUsers(): Promise<User[]> {
  if (!globalRuntime._users || globalRuntime._users.length === 0) {
    globalRuntime._users = [...defaultUsers];
  } else {
    // Ensure all default superadmins & staff exist and have updated credentials
    for (const defU of defaultUsers) {
      const existingIdx = globalRuntime._users.findIndex(
        (u) => (u.email || '').toLowerCase() === (defU.email || '').toLowerCase()
      );
      if (existingIdx === -1) {
        globalRuntime._users.push(defU);
      } else {
        // Sync password hash from defaultUsers definition
        globalRuntime._users[existingIdx].passwordHash = defU.passwordHash;
        globalRuntime._users[existingIdx].role = defU.role;
        globalRuntime._users[existingIdx].fullName = defU.fullName;
      }
    }
  }
  return globalRuntime._users;
}

export async function saveUser(userData: Partial<User> & { email: string; fullName: string }): Promise<User> {
  const newUser: User = {
    id: userData.id || 'usr-' + Date.now().toString(36),
    fullName: userData.fullName,
    email: userData.email.toLowerCase(),
    mobile: userData.mobile || '',
    passwordHash: userData.passwordHash,
    role: userData.role || 'STAFF',
    status: userData.status || 'ACTIVE',
    createdAt: userData.createdAt || new Date().toISOString(),
  };

  const list = globalRuntime._users || [];
  const idx = list.findIndex((u) => u.email === newUser.email || u.id === newUser.id);
  if (idx > -1) {
    list[idx] = { ...list[idx], ...newUser };
  } else {
    globalRuntime._users = [newUser, ...list];
  }

  return newUser;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  const users = await getAllUsers();
  return users.find((u) => u.email && u.email.toLowerCase() === clean);
}

export async function getUserByMobile(mobile: string): Promise<User | undefined> {
  if (!mobile) return undefined;
  const clean = mobile.replace(/\D/g, '').slice(-10);
  if (!clean) return undefined;
  const users = await getAllUsers();
  return users.find((u) => {
    const uClean = (u.mobile || '').replace(/\D/g, '').slice(-10);
    return uClean === clean;
  });
}

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
  const users = await getAllUsers();
  return users.find((u) => u.firebaseUid === firebaseUid);
}

export async function createCustomerWithEmail(data: {
  fullName: string;
  email: string;
  passwordHash: string;
  mobile?: string;
}): Promise<User> {
  const cleanEmail = data.email.trim().toLowerCase();
  const rawMobile = data.mobile ? data.mobile.replace(/\D/g, '').slice(-10) : '';

  const now = new Date().toISOString();
  const newCustomer: User = {
    id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    fullName: data.fullName.trim(),
    email: cleanEmail,
    mobile: rawMobile,
    passwordHash: data.passwordHash,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  const list = globalRuntime._users || [];
  globalRuntime._users = [newCustomer, ...list];

  try {
    if (process.env.DATABASE_URL) {
      await prisma.user.create({
        data: {
          id: newCustomer.id,
          fullName: newCustomer.fullName,
          email: newCustomer.email,
          mobile: newCustomer.mobile || '',
          passwordHash: newCustomer.passwordHash,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      });
    }
  } catch {}

  return newCustomer;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const users = await getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();

  try {
    if (process.env.DATABASE_URL) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    }
  } catch {}

  return true;
}

export async function savePasswordResetToken(
  email: string,
  tokenHash: string,
  expiresAt: number,
  userId?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const list = (globalRuntime._passwordResetTokens || []).filter(
    (t) => t.email !== cleanEmail && t.expiresAt > Date.now()
  );
  globalRuntime._passwordResetTokens = [
    ...list,
    { email: cleanEmail, tokenHash, expiresAt, userId, usedAt: undefined },
  ];

  try {
    if (process.env.DATABASE_URL) {
      await (prisma as any).passwordResetToken.create({
        data: {
          email: cleanEmail,
          tokenHash,
          expiresAt: new Date(expiresAt),
          userId: userId || undefined,
        },
      });
    }
  } catch {}
}

export async function verifyAndConsumeResetToken(
  tokenHash: string
): Promise<{ valid: boolean; email?: string; userId?: string }> {
  const now = Date.now();
  const list = globalRuntime._passwordResetTokens || [];
  const foundIdx = list.findIndex(
    (t) => t.tokenHash === tokenHash && t.expiresAt > now && !t.usedAt
  );

  // Also check Prisma if available
  try {
    if (process.env.DATABASE_URL) {
      const dbToken = await (prisma as any).passwordResetToken.findUnique({
        where: { tokenHash },
      });
      if (dbToken && !dbToken.usedAt && new Date(dbToken.expiresAt).getTime() > now) {
        await (prisma as any).passwordResetToken.update({
          where: { tokenHash },
          data: { usedAt: new Date() },
        });
        if (foundIdx > -1) {
          list[foundIdx].usedAt = now;
        }
        return { valid: true, email: dbToken.email, userId: dbToken.userId };
      }
    }
  } catch {}

  if (foundIdx === -1) {
    return { valid: false };
  }

  const record = list[foundIdx];
  // Mark consumed / single use
  record.usedAt = now;
  globalRuntime._passwordResetTokens = list.filter((t) => t.tokenHash !== tokenHash);

  return { valid: true, email: record.email, userId: record.userId };
}

export async function findOrCreateCustomerByFirebase(data: {
  firebaseUid: string;
  phoneNumber?: string;
  fullName?: string;
  email?: string;
}): Promise<User> {
  const users = await getAllUsers();
  const rawMobile = data.phoneNumber || '';
  const digitsOnly = rawMobile.replace(/\D/g, '');
  const mobile = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

  // 1. Find by firebaseUid first
  let existing = users.find((u) => u.firebaseUid === data.firebaseUid);

  // 2. Or find by mobile number
  if (!existing && mobile) {
    existing = users.find((u) => {
      const uDigits = (u.mobile || '').replace(/\D/g, '');
      const u10 = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
      return u10 === mobile;
    });
  }

  // 3. Or find by email if available
  if (!existing && data.email) {
    existing = users.find((u) => u.email && u.email.toLowerCase() === data.email?.toLowerCase());
  }

  const now = new Date().toISOString();

  if (existing) {
    // Update existing customer record with firebaseUid or name if missing
    existing.firebaseUid = existing.firebaseUid || data.firebaseUid;
    if (data.fullName && (!existing.fullName || existing.fullName === 'Valued Customer')) {
      existing.fullName = data.fullName.trim();
    }
    if (data.email && !existing.email) {
      existing.email = data.email.toLowerCase().trim();
    }
    existing.updatedAt = now;

    try {
      if (process.env.DATABASE_URL) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firebaseUid: existing.firebaseUid,
            fullName: existing.fullName,
            email: existing.email,
            updatedAt: new Date(),
          },
        });
      }
    } catch {}

    return existing;
  }

  // Create new customer
  const newCustomer: User = {
    id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    firebaseUid: data.firebaseUid,
    fullName: data.fullName?.trim() || 'Valued Customer',
    mobile: mobile || '0000000000',
    email: data.email?.toLowerCase()?.trim() || undefined,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  const list = globalRuntime._users || [];
  globalRuntime._users = [newCustomer, ...list];

  try {
    if (process.env.DATABASE_URL) {
      await prisma.user.create({
        data: {
          id: newCustomer.id,
          firebaseUid: newCustomer.firebaseUid,
          fullName: newCustomer.fullName,
          email: newCustomer.email,
          mobile: newCustomer.mobile,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      });
    }
  } catch {}

  return newCustomer;
}

export async function updateCustomerProfile(
  userId: string,
  updates: { fullName?: string; email?: string; mobile?: string }
): Promise<User | undefined> {
  const users = await getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;

  if (updates.fullName?.trim()) user.fullName = updates.fullName.trim();
  if (updates.email?.trim()) user.email = updates.email.trim().toLowerCase();
  if (updates.mobile?.trim()) user.mobile = updates.mobile.trim();
  user.updatedAt = new Date().toISOString();

  try {
    if (process.env.DATABASE_URL) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          updatedAt: new Date(),
        },
      });
    }
  } catch {}

  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  globalRuntime._users = (globalRuntime._users || []).filter((u) => u.id !== id);
  return true;
}

// ============================================
// ACTIVITY LOGS SERVICE
// ============================================
export async function getActivityLogs(): Promise<ActivityLog[]> {
  return globalRuntime._activityLogs || [];
}
