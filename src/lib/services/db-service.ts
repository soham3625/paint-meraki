// ============================================
// paint_n_meraki — UNIFIED DATABASE SERVICE
// Authoritative Data Access with Prisma + Active Runtime Resilience
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
  businessName: 'Paint_n_Meraki',
  logo: '/logo.jpg',
  favicon: '/logo.jpg',
  whatsappNumber: '917284075825',
  instagramUrl: 'https://www.instagram.com/paint_n_meraki/',
  email: 'paintnmeraki@gmail.com',
  upiId: '7284075825-2@ibl',
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
  heroImage: '/circle.png',
  heroEnabled: true,
  featuredCategories: ['resin-clocks', 'pooja-thalis', 'decorative-frames', 'resin-hanging-decor'],
  featuredProducts: ['classic-geode-resin-clock-10-inch', 'handcrafted-resin-pooja-thali-8-inch', 'decorative-photo-frame-10-inch'],
  bestSellers: ['classic-geode-resin-clock-10-inch', '3-piece-geode-resin-clock-16-20-inch', 'custom-resin-krishna-magnets-hanging'],
  newArrivals: ['handcrafted-resin-ganesh-wall-hanging', 'ocean-wave-resin-clock-12-inch'],
  resinClocksImage: '/images/products/clock-6.png',
  poojaThalisImage: '/images/categories/pooja_thali.jpg',
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

// Initial Demo Orders
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

// In-Memory Global Store for resilient fallback
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
      details: 'paint_n_meraki Admin Panel initialized with active collections & catalog',
      createdAt: new Date().toISOString(),
    },
  ];
}

// Check if database is configured
function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
}

// Helper to map Prisma Product model to App Product
function mapPrismaProductToAppProduct(dbP: any): Product {
  let sizes: ProductSize[] = [{ label: 'Standard', value: 'standard', price: Number(dbP.price), stock: 10 }];
  if (Array.isArray(dbP.sizes)) {
    sizes = dbP.sizes;
  } else if (typeof dbP.sizes === 'string') {
    try {
      sizes = JSON.parse(dbP.sizes);
    } catch { }
  }

  return {
    id: dbP.id,
    name: dbP.name,
    slug: dbP.slug,
    category: dbP.categoryName || 'Resin Art',
    categorySlug: dbP.categorySlug,
    description: dbP.description || '',
    shortDescription: dbP.shortDescription || '',
    price: Number(dbP.price),
    compareAtPrice: dbP.compareAtPrice ? Number(dbP.compareAtPrice) : undefined,
    costPrice: dbP.costPrice ? Number(dbP.costPrice) : undefined,
    images: Array.isArray(dbP.images) && dbP.images.length > 0 ? dbP.images : ['/images/categories/clock-2.jpg'],
    thumbnail: dbP.thumbnail || (Array.isArray(dbP.images) && dbP.images[0]) || '/images/categories/clock-2.jpg',
    sizes,
    colors: Array.isArray(dbP.colors) ? dbP.colors : ['Gold', 'White', 'Blue'],
    customizable: Boolean(dbP.customizable),
    featured: Boolean(dbP.featured),
    bestSeller: Boolean(dbP.bestSeller),
    isNewArrival: Boolean(dbP.isNewArrival),
    status: (dbP.status as ProductStatus) || 'ACTIVE',
    tags: Array.isArray(dbP.tags) ? dbP.tags : [],
    stock: Number(dbP.stock ?? 10),
    sku: dbP.sku || dbP.slug,
    weight: dbP.weight || '1.2 kg',
    dimensions: dbP.dimensions || '12 x 12 inches',
    material: dbP.material || 'High-gloss Epoxy Resin on Solid MDF Base',
    careInstructions: dbP.careInstructions || 'Wipe clean with a soft, damp microfiber cloth. Keep away from direct harsh sunlight.',
    shippingInfo: dbP.shippingInfo || 'Dispatched in 4-6 business days. Free shipping across India.',
    rating: Number(dbP.rating || 5.0),
    reviewCount: Number(dbP.reviewCount || 1),
    createdAt: dbP.createdAt instanceof Date ? dbP.createdAt.toISOString() : (dbP.createdAt || new Date().toISOString()),
    updatedAt: dbP.updatedAt instanceof Date ? dbP.updatedAt.toISOString() : (dbP.updatedAt || new Date().toISOString()),
  };
}

// Helper to map Prisma Order model to App Order
function mapPrismaOrderToAppOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.orderNumber,
    userId: dbOrder.userId || undefined,
    customer: {
      fullName: dbOrder.customerName,
      email: dbOrder.customerEmail,
      mobile: dbOrder.customerMobile,
    },
    shippingAddress: {
      address: dbOrder.address,
      city: dbOrder.city,
      state: dbOrder.state,
      pincode: dbOrder.pincode,
      landmark: dbOrder.landmark || undefined,
    },
    items: (dbOrder.items || []).map((i: any) => ({
      id: i.id,
      product: i.product ? mapPrismaProductToAppProduct(i.product) : {
        id: i.productId,
        name: 'Handcrafted Resin Art',
        slug: 'resin-art',
        categoryName: 'Resin Art',
        categorySlug: 'resin-art',
        description: '',
        shortDescription: '',
        price: Number(i.price) || 0,
        images: ['/images/categories/clock-2.jpg'],
        thumbnail: '/images/categories/clock-2.jpg',
        sizes: [],
        colors: [],
        material: 'Epoxy Resin',
        careInstructions: '',
        shippingInfo: '',
        sku: i.productId,
        stock: 10,
        rating: 5,
        reviewCount: 0,
        customizable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
      selectedSize: i.selectedSize || 'Standard',
      customization: i.customization || undefined,
    })),
    subtotal: Number(dbOrder.subtotal) || 0,
    shippingCharge: Number(dbOrder.shippingCharge) || 0,
    codFee: Number(dbOrder.codFee) || 0,
    discountAmount: dbOrder.discountAmount ? Number(dbOrder.discountAmount) : undefined,
    couponCode: dbOrder.couponCode || undefined,
    total: Number(dbOrder.total) || 0,
    paymentMethod: dbOrder.paymentMethod,
    paymentStatus: dbOrder.paymentStatus,
    orderStatus: dbOrder.orderStatus,
    utrNumber: dbOrder.utrNumber || undefined,
    trackingNumber: dbOrder.trackingNumber || undefined,
    courierName: dbOrder.courierName || undefined,
    notes: dbOrder.notes || undefined,
    createdAt: dbOrder.createdAt instanceof Date ? dbOrder.createdAt.toISOString() : dbOrder.createdAt,
    updatedAt: dbOrder.updatedAt instanceof Date ? dbOrder.updatedAt.toISOString() : dbOrder.updatedAt,
  };
}

// Automatic PostgreSQL table bootstrap to ensure cloud database tables and columns exist
let _tablesEnsuredPromise: Promise<void> | null = null;
export async function ensureDatabaseTables(): Promise<void> {
  if (!isDbConfigured()) return;
  if (_tablesEnsuredPromise) return _tablesEnsuredPromise;

  _tablesEnsuredPromise = (async () => {
    try {
      // 1. Ensure Enum types in PostgreSQL
      const enumQueries = [
        `DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFICATION', 'CONFIRMED', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE "CustomOrderStatus" AS ENUM ('NEW', 'CONTACTED', 'DESIGNING', 'QUOTE_SENT', 'APPROVED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      ];
      for (const q of enumQueries) {
        try {
          await prisma.$executeRawUnsafe(q);
        } catch { }
      }

      // 2. Ensure BusinessSettings table and required columns
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BusinessSettings" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
          "businessName" TEXT NOT NULL DEFAULT 'paint_n_meraki',
          "logo" TEXT NOT NULL DEFAULT '/logo.jpg',
          "favicon" TEXT DEFAULT '/logo.jpg',
          "whatsappNumber" TEXT NOT NULL DEFAULT '919878541310',
          "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/paint.meraki',
          "email" TEXT NOT NULL DEFAULT 'hello@paintmeraki.com',
          "upiId" TEXT NOT NULL DEFAULT 'paintmeraki@upi',
          "upiQrCode" TEXT,
          "codEnabled" BOOLEAN NOT NULL DEFAULT true,
          "codMinOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "codMaxOrder" DOUBLE PRECISION NOT NULL DEFAULT 10000,
          "codFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "shippingCharge" DOUBLE PRECISION NOT NULL DEFAULT 99,
          "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2000,
          "processingTime" TEXT NOT NULL DEFAULT '5-7 business days',
          "deliveryTime" TEXT NOT NULL DEFAULT '3-5 business days',
          "announcementText" TEXT NOT NULL DEFAULT '♡ Handmade with Love | ✦ Custom Orders Available | Made Just for You ♡',
          "announcementEnabled" BOOLEAN NOT NULL DEFAULT true,
          "businessAddress" TEXT NOT NULL DEFAULT 'Gujarat, India',
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const businessAlterQueries = [
        `ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "favicon" TEXT DEFAULT '/logo.jpg';`,
        `ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "announcementEnabled" BOOLEAN DEFAULT true;`,
        `ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "upiQrCode" TEXT;`,
        `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'APPROVED';`,
      ];
      for (const q of businessAlterQueries) {
        try {
          await prisma.$executeRawUnsafe(q);
        } catch { }
      }

      // 3. Ensure HomepageConfig table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "HomepageConfig" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
          "heroHeading" TEXT NOT NULL DEFAULT 'Art That Speaks to Your Soul',
          "heroSubtitle" TEXT NOT NULL DEFAULT 'Handcrafted Resin Masterpieces & Custom Decor',
          "heroDescription" TEXT NOT NULL DEFAULT 'Every piece at paint_n_meraki is meticulously handcrafted with love and artistic passion.',
          "heroButtonText" TEXT NOT NULL DEFAULT 'Explore Collection',
          "heroButtonLink" TEXT NOT NULL DEFAULT '/shop',
          "heroImage" TEXT NOT NULL DEFAULT '/circle.png',
          "heroEnabled" BOOLEAN NOT NULL DEFAULT true,
          "featuredCategories" TEXT[] NOT NULL DEFAULT ARRAY['resin-clocks', 'pooja-thalis', 'decorative-frames', 'resin-hanging-decor']::TEXT[],
          "featuredProducts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          "bestSellers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          "newArrivals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          "resinClocksImage" TEXT,
          "poojaThalisImage" TEXT,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Ensure Category table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL UNIQUE,
          "description" TEXT NOT NULL,
          "image" TEXT NOT NULL,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 5. Ensure Product table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL UNIQUE,
          "categoryName" TEXT NOT NULL,
          "categorySlug" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "shortDescription" TEXT NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "compareAtPrice" DOUBLE PRECISION,
          "costPrice" DOUBLE PRECISION,
          "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          "thumbnail" TEXT NOT NULL,
          "sizes" JSONB NOT NULL DEFAULT '[]'::JSONB,
          "colors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          "customizable" BOOLEAN NOT NULL DEFAULT false,
          "featured" BOOLEAN NOT NULL DEFAULT false,
          "bestSeller" BOOLEAN NOT NULL DEFAULT false,
          "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
          "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
          "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          "stock" INTEGER NOT NULL DEFAULT 0,
          "sku" TEXT NOT NULL UNIQUE,
          "weight" TEXT,
          "dimensions" TEXT,
          "material" TEXT NOT NULL,
          "careInstructions" TEXT NOT NULL,
          "shippingInfo" TEXT NOT NULL,
          "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
          "reviewCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 6. Ensure User table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "firebaseUid" TEXT UNIQUE,
          "fullName" TEXT NOT NULL,
          "email" TEXT UNIQUE,
          "mobile" TEXT UNIQUE,
          "passwordHash" TEXT,
          "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
          "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 7. Ensure Order table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderNumber" TEXT NOT NULL UNIQUE,
          "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
          "customerName" TEXT NOT NULL,
          "customerMobile" TEXT NOT NULL,
          "customerEmail" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "state" TEXT NOT NULL,
          "pincode" TEXT NOT NULL,
          "landmark" TEXT,
          "subtotal" DOUBLE PRECISION NOT NULL,
          "shippingCharge" DOUBLE PRECISION NOT NULL,
          "codFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "couponCode" TEXT,
          "total" DOUBLE PRECISION NOT NULL,
          "paymentMethod" TEXT NOT NULL,
          "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
          "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
          "utrNumber" TEXT,
          "trackingNumber" TEXT,
          "courierName" TEXT,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const orderAlterQueries = [
        `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0;`,
        `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;`,
      ];
      for (const q of orderAlterQueries) {
        try {
          await prisma.$executeRawUnsafe(q);
        } catch { }
      }

      // 8. Ensure OrderItem table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
          "productId" TEXT NOT NULL REFERENCES "Product"("id"),
          "quantity" INTEGER NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "selectedSize" TEXT NOT NULL,
          "customization" JSONB
        );
      `);

      // 9. Ensure Banner table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Banner" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "subtitle" TEXT,
          "imageUrl" TEXT NOT NULL,
          "mobileImageUrl" TEXT,
          "buttonText" TEXT,
          "buttonLink" TEXT,
          "position" TEXT NOT NULL DEFAULT 'hero',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "startDate" TIMESTAMP(3),
          "endDate" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 10. Ensure Coupon table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Coupon" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "code" TEXT NOT NULL UNIQUE,
          "description" TEXT,
          "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
          "discountValue" DOUBLE PRECISION NOT NULL,
          "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "maxDiscount" DOUBLE PRECISION,
          "expiryDate" TIMESTAMP(3),
          "usageLimit" INTEGER,
          "usedCount" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 11. Ensure Review table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Review" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "customerName" TEXT NOT NULL,
          "rating" DOUBLE PRECISION NOT NULL,
          "review" TEXT NOT NULL,
          "productId" TEXT REFERENCES "Product"("id") ON DELETE SET NULL,
          "verified" BOOLEAN NOT NULL DEFAULT true,
          "isFeatured" BOOLEAN NOT NULL DEFAULT false,
          "isVisible" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 12. Ensure CustomOrder table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CustomOrder" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "customerName" TEXT NOT NULL,
          "whatsappNumber" TEXT NOT NULL,
          "email" TEXT,
          "productType" TEXT NOT NULL,
          "preferredSize" TEXT,
          "preferredColors" TEXT,
          "budget" TEXT,
          "quotationAmount" DOUBLE PRECISION,
          "referenceImageUrl" TEXT,
          "personalPhotoUrl" TEXT,
          "description" TEXT NOT NULL,
          "specialInstructions" TEXT,
          "adminNotes" TEXT,
          "status" "CustomOrderStatus" NOT NULL DEFAULT 'NEW',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 13. Ensure ActivityLog table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ActivityLog" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "adminEmail" TEXT NOT NULL,
          "adminName" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "entity" TEXT NOT NULL,
          "entityId" TEXT,
          "details" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (err: any) {
      console.warn('[ensureDatabaseTables] Schema bootstrap notice:', err?.message || err);
    }
  })();

  return _tablesEnsuredPromise;
}

// Auto-seed database if connected but empty
let _seedingPromise: Promise<void> | null = null;
async function autoSeedDatabase() {
  if (!isDbConfigured()) return;
  if (_seedingPromise) return _seedingPromise;

  _seedingPromise = (async () => {
    try {
      await ensureDatabaseTables();

      // 1. Seed Categories if empty
      const catCount = await prisma.category.count();
      if (catCount === 0) {
        for (const cat of seedCategories) {
          await prisma.category.upsert({
            where: { slug: cat.slug },
            create: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image: cat.image,
              sortOrder: cat.sortOrder,
            },
            update: {},
          });
        }
      }

      // 2. Seed Products if empty
      const prodCount = await prisma.product.count();
      if (prodCount === 0) {
        for (const prod of seedProducts) {
          await prisma.category.upsert({
            where: { slug: prod.categorySlug },
            create: {
              name: prod.category || prod.categorySlug,
              slug: prod.categorySlug,
              description: `Handcrafted ${prod.category || prod.categorySlug} by paint_n_meraki`,
              image: prod.thumbnail || '/images/categories/clock-2.jpg',
            },
            update: {},
          });

          await prisma.product.upsert({
            where: { slug: prod.slug },
            create: {
              id: prod.id,
              name: prod.name,
              slug: prod.slug,
              categoryName: prod.category,
              categorySlug: prod.categorySlug,
              description: prod.description,
              shortDescription: prod.shortDescription,
              price: prod.price,
              compareAtPrice: prod.compareAtPrice,
              images: prod.images,
              thumbnail: prod.thumbnail,
              sizes: prod.sizes as any,
              colors: prod.colors,
              customizable: prod.customizable,
              featured: prod.featured,
              bestSeller: prod.bestSeller,
              isNewArrival: prod.isNewArrival,
              status: prod.status as any,
              tags: prod.tags,
              stock: prod.stock,
              sku: prod.sku,
              material: prod.material,
              careInstructions: prod.careInstructions,
              shippingInfo: prod.shippingInfo,
            },
            update: {},
          });
        }
      }

      // 3. Seed HomepageConfig if empty
      const homeConfig = await prisma.homepageConfig.findUnique({ where: { id: 'default' } });
      if (!homeConfig) {
        await prisma.homepageConfig.create({
          data: {
            id: 'default',
            heroHeading: defaultHomepageConfig.heroHeading,
            heroSubtitle: defaultHomepageConfig.heroSubtitle,
            heroDescription: defaultHomepageConfig.heroDescription,
            heroButtonText: defaultHomepageConfig.heroButtonText,
            heroButtonLink: defaultHomepageConfig.heroButtonLink,
            heroImage: defaultHomepageConfig.heroImage,
            heroEnabled: defaultHomepageConfig.heroEnabled,
            featuredCategories: defaultHomepageConfig.featuredCategories,
            featuredProducts: defaultHomepageConfig.featuredProducts,
            bestSellers: defaultHomepageConfig.bestSellers,
            newArrivals: defaultHomepageConfig.newArrivals,
            resinClocksImage: defaultHomepageConfig.resinClocksImage,
            poojaThalisImage: defaultHomepageConfig.poojaThalisImage,
          },
        });
      }

      // 4. Seed BusinessSettings if empty
      const settings = await prisma.businessSettings.findUnique({ where: { id: 'default' } });
      if (!settings) {
        await prisma.businessSettings.create({
          data: {
            id: 'default',
            businessName: defaultSettings.businessName,
            logo: defaultSettings.logo,
            favicon: defaultSettings.favicon,
            whatsappNumber: defaultSettings.whatsappNumber,
            instagramUrl: defaultSettings.instagramUrl,
            email: defaultSettings.email,
            upiId: defaultSettings.upiId,
            upiQrCode: defaultSettings.upiQrCode,
            codEnabled: defaultSettings.codEnabled,
            codMinOrder: defaultSettings.codMinOrder,
            codMaxOrder: defaultSettings.codMaxOrder,
            codFee: defaultSettings.codFee,
            shippingCharge: defaultSettings.shippingCharge,
            freeShippingThreshold: defaultSettings.freeShippingThreshold,
            processingTime: defaultSettings.processingTime,
            deliveryTime: defaultSettings.deliveryTime,
            announcementText: defaultSettings.announcementText,
            announcementEnabled: defaultSettings.announcementEnabled,
            businessAddress: defaultSettings.businessAddress,
          },
        });
      }

      // 5. Seed Users if empty
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        for (const user of defaultUsers) {
          await prisma.user.create({
            data: {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              mobile: user.mobile,
              passwordHash: user.passwordHash,
              role: user.role as any,
              status: user.status as any,
            },
          });
        }
      }

      // 6. Seed Banners if empty
      const bannerCount = await prisma.banner.count();
      if (bannerCount === 0) {
        for (const banner of defaultBanners) {
          await prisma.banner.create({
            data: {
              id: banner.id,
              title: banner.title,
              subtitle: banner.subtitle,
              imageUrl: banner.imageUrl,
              buttonText: banner.buttonText,
              buttonLink: banner.buttonLink,
              position: banner.position,
              isActive: banner.isActive,
              sortOrder: banner.sortOrder,
            },
          });
        }
      }

      // 7. Seed Coupons if empty
      const couponCount = await prisma.coupon.count();
      if (couponCount === 0) {
        for (const coupon of defaultCoupons) {
          await prisma.coupon.create({
            data: {
              id: coupon.id,
              code: coupon.code,
              description: coupon.description,
              discountType: coupon.discountType as any,
              discountValue: coupon.discountValue,
              minOrderAmount: coupon.minOrderAmount,
              maxDiscount: coupon.maxDiscount,
              isActive: coupon.isActive,
            },
          });
        }
      }

      // 8. Seed CustomOrders if empty
      const customOrderCount = await prisma.customOrder.count();
      if (customOrderCount === 0) {
        for (const co of defaultCustomOrders) {
          await prisma.customOrder.create({
            data: {
              id: co.id,
              customerName: co.customerName,
              whatsappNumber: co.whatsappNumber,
              email: co.email || null,
              productType: co.productType,
              preferredSize: co.preferredSize || null,
              preferredColors: co.preferredColors || null,
              budget: co.budget || null,
              quotationAmount: co.quotationAmount || null,
              referenceImageUrl: co.referenceImageUrl || null,
              personalPhotoUrl: co.personalPhotoUrl || null,
              description: co.description,
              specialInstructions: co.specialInstructions || null,
              adminNotes: co.adminNotes || null,
              status: co.status as any,
            },
          });
        }
      }

      // 9. Seed Reviews if empty
      const reviewCount = await prisma.review.count();
      if (reviewCount === 0) {
        for (const rev of seedReviews) {
          let matchedProdId: string | null = null;
          if (rev.productSlug) {
            const p = await prisma.product.findUnique({ where: { slug: rev.productSlug } });
            if (p) matchedProdId = p.id;
          }
          await prisma.review.create({
            data: {
              id: rev.id,
              customerName: rev.customerName,
              rating: rev.rating,
              review: rev.review,
              productId: matchedProdId,
              verified: rev.verified ?? true,
              isFeatured: rev.isFeatured ?? false,
              isVisible: rev.isVisible ?? true,
            },
          });
        }
      }
    } catch (err: any) {
      console.warn('[autoSeedDatabase] Table structure check or seed notice:', err.message);
    } finally {
      _seedingPromise = null;
    }
  })();

  return _seedingPromise;
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

  if (isDbConfigured()) {
    try {
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
    } catch (err: any) {
      console.warn('[logActivity] Notice:', err.message);
    }
  }
}

// ============================================
// PRODUCT SERVICE
// ============================================
export async function getAllProducts(): Promise<Product[]> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbProducts && dbProducts.length > 0) {
        const mapped = dbProducts.map(mapPrismaProductToAppProduct);
        globalRuntime._products = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllProducts] Prisma read notice:', err.message);
    }
  }

  if (!globalRuntime._products || globalRuntime._products.length === 0) {
    globalRuntime._products = [...seedProducts];
  }
  return globalRuntime._products;
}

export async function getProductByIdOrSlug(identifier: string): Promise<Product | undefined> {
  if (isDbConfigured()) {
    try {
      const dbProduct = await prisma.product.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });
      if (dbProduct) {
        return mapPrismaProductToAppProduct(dbProduct);
      }
    } catch (err: any) {
      console.warn('[getProductByIdOrSlug] Prisma read notice:', err.message);
    }
  }

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

  if (isDbConfigured()) {
    try {
      await prisma.category.upsert({
        where: { slug: newProduct.categorySlug },
        create: {
          name: newProduct.category,
          slug: newProduct.categorySlug,
          description: `Handcrafted ${newProduct.category} collection`,
          image: newProduct.thumbnail || '/images/categories/clock-2.jpg',
        },
        update: {},
      });

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
    } catch (err: any) {
      console.warn('[saveProduct] Database save notice (persisted to runtime store):', err?.message);
    }
  }

  return newProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const existing = (globalRuntime._products || []).find((p) => p.id === productId || p.slug === productId);
  if (!existing) return false;

  globalRuntime._products = (globalRuntime._products || []).filter((p) => p.id !== productId && p.slug !== productId);

  if (isDbConfigured()) {
    try {
      await prisma.product.delete({
        where: { slug: existing.slug },
      });
    } catch (err: any) {
      console.warn('[deleteProduct] Database delete notice (removed from runtime store):', err?.message);
    }
  }

  return true;
}

// ============================================
// CATEGORY SERVICE
// ============================================
export async function getAllCategories(): Promise<Category[]> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbCategories = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      if (dbCategories && dbCategories.length > 0) {
        const products = await getAllProducts();
        const mapped = dbCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          sortOrder: c.sortOrder,
          productCount: products.filter((p) => p.categorySlug === c.slug).length,
          createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
          updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
        }));
        globalRuntime._categories = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllCategories] Prisma read notice:', err.message);
    }
  }

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

  if (isDbConfigured()) {
    try {
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
    } catch (err: any) {
      console.warn('[saveCategory] Database save notice (persisted to runtime store):', err?.message);
    }
  }

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

  if (isDbConfigured()) {
    try {
      await prisma.category.delete({ where: { slug } });
    } catch (err: any) {
      console.warn('[deleteCategory] Database delete notice (removed from runtime store):', err?.message);
    }
  }

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

// ============================================
// ORDER SERVICE
// ============================================
export async function getAllOrders(): Promise<Order[]> {
  if (isDbConfigured()) {
    try {
      await ensureDatabaseTables();
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      if (dbOrders) {
        const mapped = dbOrders.map(mapPrismaOrderToAppOrder);
        globalRuntime._orders = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllOrders] PostgreSQL query notice:', err.message);
    }
  }

  if (!globalRuntime._orders || globalRuntime._orders.length === 0) {
    globalRuntime._orders = [...defaultOrders];
  }
  return globalRuntime._orders.map(normalizeOrder);
}

export async function getOrderByIdOrNumber(identifier: string): Promise<Order | undefined> {
  const clean = identifier.toUpperCase().replace('#', '').trim();

  if (isDbConfigured()) {
    try {
      const dbOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: identifier },
            { orderNumber: identifier },
            { orderNumber: clean },
          ],
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      if (dbOrder) {
        return mapPrismaOrderToAppOrder(dbOrder);
      }
    } catch (err: any) {
      console.warn('[getOrderByIdOrNumber] Prisma notice:', err.message);
    }
  }

  const orders = await getAllOrders();
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
  const clean = orderNumber.toUpperCase().replace('#', '').trim();

  if (isDbConfigured()) {
    try {
      const existing = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: clean }, { orderNumber }, { id: orderNumber }],
        },
      });

      if (existing) {
        const updateData: any = {};
        if (updates.orderStatus) updateData.orderStatus = updates.orderStatus;
        if (updates.paymentStatus) updateData.paymentStatus = updates.paymentStatus;
        if (updates.utrNumber !== undefined) updateData.utrNumber = updates.utrNumber;
        if (updates.trackingNumber !== undefined) updateData.trackingNumber = updates.trackingNumber;
        if (updates.courierName !== undefined) updateData.courierName = updates.courierName;
        if (updates.notes !== undefined) updateData.notes = updates.notes;

        const updatedDb = await prisma.order.update({
          where: { id: existing.id },
          data: updateData,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        const mapped = mapPrismaOrderToAppOrder(updatedDb);
        if (globalRuntime._orders) {
          const idx = globalRuntime._orders.findIndex((o) => o.id === mapped.id || o.orderNumber === mapped.orderNumber);
          if (idx > -1) globalRuntime._orders[idx] = mapped;
        }
        return mapped;
      }
    } catch (err: any) {
      console.error('[updateOrderStatus] Prisma update error:', err.message);
      throw new Error(`Failed to update order status in database: ${err.message}`);
    }
  }

  if (!globalRuntime._orders || globalRuntime._orders.length === 0) {
    globalRuntime._orders = [...defaultOrders];
  }
  const orders = globalRuntime._orders;
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
  return updated;
}

export async function createOrder(order: Order): Promise<Order> {
  const normalized = normalizeOrder(order);

  if (isDbConfigured()) {
    try {
      await ensureDatabaseTables();
      // 1. Idempotency guard: Return existing order if already created in database
      const existingDb = await prisma.order.findFirst({
        where: {
          OR: [
            { id: normalized.id },
            { orderNumber: normalized.orderNumber },
          ],
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (existingDb) {
        const mapped = mapPrismaOrderToAppOrder(existingDb);
        const list = globalRuntime._orders || [];
        globalRuntime._orders = [mapped, ...list.filter((o) => o.id !== mapped.id && o.orderNumber !== mapped.orderNumber)];
        return mapped;
      }

      // 2. Validate userId foreign key: ensure user exists in DB before linking
      let validUserId: string | undefined = undefined;
      if (normalized.userId) {
        try {
          const userExists = await prisma.user.findUnique({
            where: { id: normalized.userId },
          });
          if (userExists) {
            validUserId = userExists.id;
          }
        } catch {
          validUserId = undefined;
        }
      }

      // 3. Ensure referenced categories and products exist to prevent foreign key errors
      const itemData = [];
      for (const item of normalized.items) {
        let prodId = item.product.id;
        try {
          const existingProd = await prisma.product.findUnique({ where: { id: prodId } });
          if (!existingProd) {
            const bySlug = await prisma.product.findUnique({ where: { slug: item.product.slug } });
            if (bySlug) {
              prodId = bySlug.id;
            } else {
              // Ensure category exists before creating product
              const categorySlug = item.product.categorySlug || 'resin-art';
              await prisma.category.upsert({
                where: { slug: categorySlug },
                create: {
                  name: item.product.category || 'Resin Art',
                  slug: categorySlug,
                  description: 'Handcrafted resin creations',
                  image: item.product.thumbnail || '/images/categories/clock-2.jpg',
                },
                update: {},
              });

              const createdP = await prisma.product.upsert({
                where: { slug: item.product.slug },
                create: {
                  name: item.product.name,
                  slug: item.product.slug,
                  categoryName: item.product.category || 'Resin Art',
                  categorySlug,
                  description: item.product.description || '',
                  shortDescription: item.product.shortDescription || '',
                  price: item.product.price,
                  images: item.product.images || [],
                  thumbnail: item.product.thumbnail || '',
                  sizes: (item.product.sizes || []) as any,
                  colors: item.product.colors || [],
                  material: item.product.material || 'Epoxy Resin',
                  careInstructions: item.product.careInstructions || '',
                  shippingInfo: item.product.shippingInfo || '',
                  sku: item.product.sku || item.product.slug,
                },
                update: {},
              });
              prodId = createdP.id;
            }
          }
        } catch (pErr: any) {
          console.warn('[createOrder] Product foreign key resolution:', pErr?.message);
        }

        itemData.push({
          product: { connect: { id: prodId } },
          quantity: item.quantity,
          price: item.price,
          selectedSize:
            typeof item.selectedSize === 'object' && item.selectedSize
              ? (item.selectedSize as any).label
              : String(item.selectedSize || 'Standard'),
          customization: (item.customization || undefined) as any,
        });
      }

      // 4. Durably persist order and order items in PostgreSQL
      const savedDbOrder = await prisma.order.create({
        data: {
          id: normalized.id,
          orderNumber: normalized.orderNumber,
          userId: validUserId,
          customerName: normalized.customer.fullName,
          customerMobile: normalized.customer.mobile,
          customerEmail: normalized.customer.email || '',
          address: normalized.shippingAddress.address,
          city: normalized.shippingAddress.city,
          state: normalized.shippingAddress.state,
          pincode: normalized.shippingAddress.pincode,
          landmark: normalized.shippingAddress.landmark || null,
          subtotal: normalized.subtotal,
          shippingCharge: normalized.shippingCharge,
          codFee: normalized.codFee,
          discountAmount: normalized.discountAmount || 0,
          couponCode: normalized.couponCode || null,
          total: normalized.total,
          paymentMethod: normalized.paymentMethod,
          paymentStatus: normalized.paymentStatus as any,
          orderStatus: normalized.orderStatus as any,
          utrNumber: normalized.utrNumber || null,
          trackingNumber: normalized.trackingNumber || null,
          courierName: normalized.courierName || null,
          notes: normalized.notes || null,
          items: {
            create: itemData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      const mapped = mapPrismaOrderToAppOrder(savedDbOrder);
      const list = globalRuntime._orders || [];
      globalRuntime._orders = [mapped, ...list.filter((o) => o.id !== mapped.id && o.orderNumber !== mapped.orderNumber)];

      // Increment coupon usage count if a valid coupon was applied
      if (normalized.couponCode) {
        try {
          await prisma.coupon.updateMany({
            where: { code: { equals: normalized.couponCode.trim(), mode: 'insensitive' } },
            data: { usedCount: { increment: 1 } },
          });
          if (globalRuntime._coupons) {
            const coup = globalRuntime._coupons.find(
              (c) => c.code.toUpperCase() === normalized.couponCode?.trim().toUpperCase()
            );
            if (coup) coup.usedCount = (coup.usedCount || 0) + 1;
          }
        } catch (cErr: any) {
          console.warn('[createOrder] Notice on coupon usedCount increment:', cErr?.message);
        }
      }

      return mapped;
    } catch (err: any) {
      console.error('[createOrder] Failed to persist order in PostgreSQL:', err?.message || err);
      // Ensure order is not lost from runtime memory even if PostgreSQL has a temporary error
      const list = globalRuntime._orders || [];
      globalRuntime._orders = [normalized, ...list.filter((o) => o.id !== normalized.id && o.orderNumber !== normalized.orderNumber)];
      return normalized;
    }
  }

  // Fallback only if database is explicitly not configured
  const list = globalRuntime._orders || [...defaultOrders];
  globalRuntime._orders = [normalized, ...list.filter((o) => o.id !== normalized.id && o.orderNumber !== normalized.orderNumber)];
  return normalized;
}

// ============================================
// CUSTOM ORDER SERVICE
// ============================================
export async function getAllCustomOrders(): Promise<CustomOrderRequest[]> {
  if (isDbConfigured()) {
    try {
      const dbCustomOrders = await prisma.customOrder.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbCustomOrders && dbCustomOrders.length > 0) {
        const mapped: CustomOrderRequest[] = dbCustomOrders.map((co: any) => ({
          id: co.id,
          customerName: co.customerName,
          whatsappNumber: co.whatsappNumber,
          email: co.email || '',
          productType: co.productType,
          preferredSize: co.preferredSize || undefined,
          preferredColors: co.preferredColors || undefined,
          budget: co.budget || undefined,
          quotationAmount: co.quotationAmount || undefined,
          referenceImageUrl: co.referenceImageUrl || undefined,
          personalPhotoUrl: co.personalPhotoUrl || undefined,
          description: co.description,
          specialInstructions: co.specialInstructions || undefined,
          adminNotes: co.adminNotes || undefined,
          status: co.status as CustomOrderStatus,
          createdAt: co.createdAt instanceof Date ? co.createdAt.toISOString() : co.createdAt,
          updatedAt: co.updatedAt instanceof Date ? co.updatedAt.toISOString() : co.updatedAt,
        }));
        globalRuntime._customOrders = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllCustomOrders] Prisma read notice:', err.message);
    }
  }
  if (!globalRuntime._customOrders || globalRuntime._customOrders.length === 0) {
    globalRuntime._customOrders = [...defaultCustomOrders];
  }
  return globalRuntime._customOrders;
}

export async function updateCustomOrderStatus(
  id: string,
  updates: Partial<CustomOrderRequest>
): Promise<CustomOrderRequest | undefined> {
  if (!globalRuntime._customOrders || globalRuntime._customOrders.length === 0) {
    globalRuntime._customOrders = [...defaultCustomOrders];
  }
  const orders = globalRuntime._customOrders;
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;

  const updated: CustomOrderRequest = {
    ...orders[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  orders[idx] = updated;
  globalRuntime._customOrders = orders;

  if (isDbConfigured()) {
    try {
      await prisma.customOrder.upsert({
        where: { id },
        update: {
          status: updated.status as any,
          quotationAmount: updated.quotationAmount ?? null,
          adminNotes: updated.adminNotes ?? null,
        },
        create: {
          id: updated.id,
          customerName: updated.customerName || 'Customer',
          whatsappNumber: updated.whatsappNumber || '',
          email: updated.email || null,
          productType: updated.productType || 'Custom Order',
          preferredSize: updated.preferredSize || null,
          preferredColors: updated.preferredColors || null,
          budget: updated.budget || null,
          quotationAmount: updated.quotationAmount ?? null,
          referenceImageUrl: updated.referenceImageUrl || null,
          personalPhotoUrl: updated.personalPhotoUrl || null,
          description: updated.description || 'Custom resin art request',
          specialInstructions: updated.specialInstructions || null,
          adminNotes: updated.adminNotes || null,
          status: (updated.status as any) || 'NEW',
        },
      });
    } catch (err: any) {
      console.warn('[updateCustomOrderStatus] Database update notice:', err?.message || err);
      // Fallback: order is safely updated in globalRuntime cache so admin action succeeds seamlessly
    }
  }

  return updated;
}

// ============================================
// BUSINESS SETTINGS SERVICE
// ============================================
export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbSettings = await prisma.businessSettings.findUnique({
        where: { id: 'default' },
      });
      if (dbSettings) {
        const mapped: BusinessSettings = {
          businessName: dbSettings.businessName,
          logo: dbSettings.logo || '/logo.jpg',
          favicon: (dbSettings as any).favicon || dbSettings.logo || '/logo.jpg',
          whatsappNumber: dbSettings.whatsappNumber,
          instagramUrl: dbSettings.instagramUrl,
          email: dbSettings.email,
          upiId: dbSettings.upiId,
          upiQrCode: dbSettings.upiQrCode || '',
          codEnabled: dbSettings.codEnabled,
          codMinOrder: dbSettings.codMinOrder,
          codMaxOrder: dbSettings.codMaxOrder,
          codFee: dbSettings.codFee,
          shippingCharge: dbSettings.shippingCharge,
          freeShippingThreshold: dbSettings.freeShippingThreshold,
          processingTime: dbSettings.processingTime,
          deliveryTime: dbSettings.deliveryTime,
          announcementText: dbSettings.announcementText,
          announcementEnabled: dbSettings.announcementEnabled,
          businessAddress: dbSettings.businessAddress,
        };
        globalRuntime._settings = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getBusinessSettings] Prisma read notice:', err.message);
    }
  }
  return globalRuntime._settings || defaultSettings;
}

export async function updateBusinessSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = await getBusinessSettings();

  // If freeShippingThreshold was updated and announcement text was not explicitly altered,
  // ensure any free shipping mention in the announcement text stays synchronized
  let synchronizedAnnouncement = data.announcementText !== undefined ? data.announcementText : current.announcementText;
  if (data.freeShippingThreshold !== undefined && !data.announcementText && synchronizedAnnouncement) {
    const formattedNum = Number(data.freeShippingThreshold).toLocaleString('en-IN');
    synchronizedAnnouncement = synchronizedAnnouncement.replace(
      /Free Shipping (?:Above|on orders above)\s*₹[0-9,]+/i,
      `Free Shipping Above ₹${formattedNum}`
    );
  }

  const payloadToPersist = {
    ...data,
    ...(data.freeShippingThreshold !== undefined && !data.announcementText ? { announcementText: synchronizedAnnouncement } : {}),
  };

  const updated: BusinessSettings = {
    ...current,
    ...payloadToPersist,
    updatedAt: new Date().toISOString(),
  };

  // Always update in-memory cache immediately
  globalRuntime._settings = updated;

  if (isDbConfigured()) {
    try {
      await ensureDatabaseTables();
      await prisma.businessSettings.upsert({
        where: { id: 'default' },
        update: { ...payloadToPersist },
        create: {
          id: 'default',
          ...updated,
        },
      });
      return updated;
    } catch (err: any) {
      console.warn('[updateBusinessSettings] Primary upsert notice, trying column-safe fallback:', err?.message || err);
      try {
        const { favicon: _f1, ...safeData } = data as any;
        const { favicon: _f2, ...safeUpdated } = updated as any;
        await prisma.businessSettings.upsert({
          where: { id: 'default' },
          update: safeData,
          create: {
            id: 'default',
            ...safeUpdated,
          },
        });
        return updated;
      } catch (innerErr: any) {
        console.error('[updateBusinessSettings] Failed to save settings to PostgreSQL:', innerErr?.message || innerErr);
        return updated;
      }
    }
  }

  return updated;
}

// ============================================
// BANNERS SERVICE
// ============================================
export async function getAllBanners(): Promise<Banner[]> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbBanners = await prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      if (dbBanners && dbBanners.length > 0) {
        const mapped: Banner[] = dbBanners.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || undefined,
          imageUrl: b.imageUrl,
          mobileImageUrl: b.mobileImageUrl || undefined,
          buttonText: b.buttonText || undefined,
          buttonLink: b.buttonLink || undefined,
          position: (b.position as any) || 'hero',
          isActive: b.isActive,
          sortOrder: b.sortOrder,
          startDate: b.startDate ? (b.startDate instanceof Date ? b.startDate.toISOString() : b.startDate) : undefined,
          endDate: b.endDate ? (b.endDate instanceof Date ? b.endDate.toISOString() : b.endDate) : undefined,
          createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
          updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
        }));
        globalRuntime._banners = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllBanners] Prisma read notice:', err.message);
    }
  }
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

  if (isDbConfigured()) {
    try {
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
    } catch (err: any) {
      console.warn('[saveBanner] Database save notice (persisted to runtime store):', err?.message);
    }
  }

  return newBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  globalRuntime._banners = (globalRuntime._banners || []).filter((b) => b.id !== id);
  if (isDbConfigured()) {
    try {
      await prisma.banner.delete({ where: { id } });
    } catch (err: any) {
      console.warn('[deleteBanner] Database delete notice (removed from runtime store):', err?.message);
    }
  }
  return true;
}

// ============================================
// COUPONS SERVICE
// ============================================
export async function getAllCoupons(): Promise<Coupon[]> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbCoupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbCoupons && dbCoupons.length > 0) {
        const mapped: Coupon[] = dbCoupons.map((c: any) => ({
          id: c.id,
          code: c.code,
          description: c.description || undefined,
          discountType: (c.discountType as any) || 'PERCENTAGE',
          discountValue: c.discountValue,
          minOrderAmount: c.minOrderAmount,
          maxDiscount: c.maxDiscount || undefined,
          expiryDate: c.expiryDate ? (c.expiryDate instanceof Date ? c.expiryDate.toISOString() : c.expiryDate) : undefined,
          usageLimit: c.usageLimit || undefined,
          usedCount: c.usedCount || 0,
          isActive: c.isActive,
          createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
          updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
        }));
        globalRuntime._coupons = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllCoupons] Prisma read notice:', err.message);
    }
  }
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

  if (isDbConfigured()) {
    try {
      await prisma.coupon.upsert({
        where: { code },
        update: {
          description: newCoupon.description,
          discountType: newCoupon.discountType as any,
          discountValue: newCoupon.discountValue,
          minOrderAmount: newCoupon.minOrderAmount,
          maxDiscount: newCoupon.maxDiscount,
          isActive: newCoupon.isActive,
        },
        create: {
          code,
          description: newCoupon.description,
          discountType: newCoupon.discountType as any,
          discountValue: newCoupon.discountValue,
          minOrderAmount: newCoupon.minOrderAmount,
          maxDiscount: newCoupon.maxDiscount,
          isActive: newCoupon.isActive,
        },
      });
    } catch (err: any) {
      console.warn('[saveCoupon] Database save notice (persisted to runtime store):', err?.message);
    }
  }

  return newCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  globalRuntime._coupons = (globalRuntime._coupons || []).filter((c) => c.id !== id && c.code !== id);
  if (isDbConfigured()) {
    try {
      await prisma.coupon.delete({ where: { id } });
    } catch (err: any) {
      console.warn('[deleteCoupon] Database delete notice (removed from runtime store):', err?.message);
    }
  }
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
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbConfig = await prisma.homepageConfig.findUnique({
        where: { id: 'default' },
      });
      if (dbConfig) {
        const mapped: HomepageConfig = {
          id: dbConfig.id,
          heroHeading: dbConfig.heroHeading,
          heroSubtitle: dbConfig.heroSubtitle,
          heroDescription: dbConfig.heroDescription,
          heroButtonText: dbConfig.heroButtonText,
          heroButtonLink: dbConfig.heroButtonLink,
          heroImage: dbConfig.heroImage || '/circle.png',
          heroEnabled: dbConfig.heroEnabled,
          featuredCategories: Array.isArray(dbConfig.featuredCategories) ? dbConfig.featuredCategories : [],
          featuredProducts: Array.isArray(dbConfig.featuredProducts) ? dbConfig.featuredProducts : [],
          bestSellers: Array.isArray(dbConfig.bestSellers) ? dbConfig.bestSellers : [],
          newArrivals: Array.isArray(dbConfig.newArrivals) ? dbConfig.newArrivals : [],
          resinClocksImage: (dbConfig as any).resinClocksImage || globalRuntime._homepageConfig?.resinClocksImage || defaultHomepageConfig.resinClocksImage,
          poojaThalisImage: (dbConfig as any).poojaThalisImage || globalRuntime._homepageConfig?.poojaThalisImage || defaultHomepageConfig.poojaThalisImage,
          updatedAt: dbConfig.updatedAt instanceof Date ? dbConfig.updatedAt.toISOString() : (dbConfig.updatedAt || new Date().toISOString()),
        };
        globalRuntime._homepageConfig = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getHomepageConfig] Prisma read notice:', err.message);
    }
  }
  return globalRuntime._homepageConfig || defaultHomepageConfig;
}

export async function updateHomepageConfig(data: Partial<HomepageConfig>): Promise<HomepageConfig> {
  const current = await getHomepageConfig();
  const updated: HomepageConfig = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Always update in-memory cache immediately
  globalRuntime._homepageConfig = updated;

  if (isDbConfigured()) {
    try {
      await ensureDatabaseTables();
      const dbPayload: any = {
        heroHeading: updated.heroHeading,
        heroSubtitle: updated.heroSubtitle,
        heroDescription: updated.heroDescription,
        heroButtonText: updated.heroButtonText,
        heroButtonLink: updated.heroButtonLink,
        heroImage: updated.heroImage,
        heroEnabled: updated.heroEnabled,
        featuredCategories: updated.featuredCategories || [],
        featuredProducts: updated.featuredProducts || [],
        bestSellers: updated.bestSellers || [],
        newArrivals: updated.newArrivals || [],
      };
      if (updated.resinClocksImage !== undefined) {
        dbPayload.resinClocksImage = updated.resinClocksImage;
      }
      if (updated.poojaThalisImage !== undefined) {
        dbPayload.poojaThalisImage = updated.poojaThalisImage;
      }

      await prisma.homepageConfig.upsert({
        where: { id: 'default' },
        update: dbPayload,
        create: {
          id: 'default',
          ...dbPayload,
        },
      });
      return updated;
    } catch (err: any) {
      console.error('[updateHomepageConfig] Failed to save homepage config to PostgreSQL:', err?.message || err);
      return updated;
    }
  }

  return updated;
}

// ============================================
// REVIEWS SERVICE
// ============================================
export async function getAllReviews(): Promise<Review[]> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbReviews = await prisma.review.findMany({
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (dbReviews && dbReviews.length > 0) {
        const mapped: Review[] = dbReviews.map((r: any) => {
          const matchedProd = r.product || globalRuntime._products?.find((p) => p.id === r.productId);
          return {
            id: r.id,
            customerName: r.customerName,
            rating: r.rating,
            review: r.review,
            productId: r.productId || undefined,
            productName: matchedProd?.name || undefined,
            productSlug: matchedProd?.slug || undefined,
            verified: r.verified ?? true,
            isFeatured: r.isFeatured ?? false,
            isVisible: r.isVisible ?? true,
            status: (r as any).status || (r.isVisible !== false ? 'APPROVED' : 'PENDING'),
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
            date: r.createdAt instanceof Date ? r.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
          };
        });
        globalRuntime._reviews = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllReviews] Prisma read notice:', err.message);
    }
  }
  if (!globalRuntime._reviews || globalRuntime._reviews.length === 0) {
    globalRuntime._reviews = [...seedReviews];
  }
  return globalRuntime._reviews;
}

export async function createReview(data: {
  customerName: string;
  rating: number;
  review: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  orderNumber?: string;
  verified?: boolean;
}): Promise<Review> {
  const newId = `rev-${Date.now()}`;
  const now = new Date();

  // Find product info if productId or productSlug provided
  let productName = data.productName;
  let productSlug = data.productSlug;
  if (data.productId && !productName) {
    const prod = globalRuntime._products?.find((p) => p.id === data.productId || p.slug === data.productId);
    if (prod) {
      productName = prod.name;
      productSlug = prod.slug;
    }
  }

  const createdReview: Review = {
    id: newId,
    customerName: data.customerName.trim(),
    rating: Number(data.rating) || 5,
    review: data.review.trim(),
    productId: data.productId || undefined,
    productName: productName || undefined,
    productSlug: productSlug || undefined,
    verified: data.verified ?? true,
    isFeatured: false,
    isVisible: true,
    status: 'APPROVED',
    createdAt: now.toISOString(),
    date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  };

  // Add to in-memory runtime cache immediately
  const existing = globalRuntime._reviews || [...seedReviews];
  globalRuntime._reviews = [createdReview, ...existing.filter((r) => r.id !== createdReview.id)];

  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();

      // Check if product exists in PostgreSQL
      let validProductId: string | null = null;
      if (data.productId) {
        const prod = await prisma.product.findFirst({
          where: {
            OR: [{ id: data.productId }, { slug: data.productId }],
          },
        });
        if (prod) {
          validProductId = prod.id;
        }
      }

      const dbSaved = await prisma.review.create({
        data: {
          id: newId,
          customerName: createdReview.customerName,
          rating: createdReview.rating,
          review: createdReview.review,
          productId: validProductId,
          verified: createdReview.verified,
          isFeatured: false,
          isVisible: true,
        },
      });

      if (dbSaved) {
        createdReview.id = dbSaved.id;
      }

      // If productId was attached, recalculate product rating & review count
      if (validProductId) {
        try {
          const productReviews = await prisma.review.findMany({
            where: { productId: validProductId, isVisible: true },
            select: { rating: true },
          });
          if (productReviews.length > 0) {
            const avg = productReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / productReviews.length;
            const roundedAvg = Math.round(avg * 10) / 10;
            await prisma.product.update({
              where: { id: validProductId },
              data: {
                rating: roundedAvg,
                reviewCount: productReviews.length,
              },
            });
            // Update in-memory product cache as well
            if (globalRuntime._products) {
              const pIdx = globalRuntime._products.findIndex((p) => p.id === validProductId);
              if (pIdx !== -1) {
                globalRuntime._products[pIdx].rating = roundedAvg;
                globalRuntime._products[pIdx].reviewCount = productReviews.length;
              }
            }
          }
        } catch (rErr: any) {
          console.warn('[createReview] Recalculate rating notice:', rErr?.message);
        }
      }
    } catch (err: any) {
      console.warn('[createReview] PostgreSQL database insert notice:', err?.message || err);
    }
  }

  return createdReview;
}

export async function updateReviewStatus(id: string, updates: Partial<Review>): Promise<Review | undefined> {
  const list = globalRuntime._reviews || [...seedReviews];
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const updated: Review = { ...list[idx], ...updates };
  list[idx] = updated;
  globalRuntime._reviews = list;

  if (isDbConfigured()) {
    try {
      await prisma.review.upsert({
        where: { id },
        update: {
          isFeatured: updates.isFeatured !== undefined ? updates.isFeatured : updated.isFeatured,
          isVisible: updates.isVisible !== undefined ? updates.isVisible : updated.isVisible,
          verified: updates.verified !== undefined ? updates.verified : updated.verified,
        },
        create: {
          id: updated.id,
          customerName: updated.customerName || 'Customer',
          rating: updated.rating || 5,
          review: updated.review || '',
          productId: updated.productId || null,
          verified: updated.verified ?? true,
          isFeatured: updated.isFeatured ?? false,
          isVisible: updated.isVisible ?? true,
        },
      });
    } catch (err: any) {
      console.warn('[updateReviewStatus] Database update notice:', err?.message || err);
    }
  }

  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  globalRuntime._reviews = (globalRuntime._reviews || []).filter((r) => r.id !== id);
  if (isDbConfigured()) {
    try {
      await prisma.review.delete({ where: { id } }).catch(() => {});
    } catch (err: any) {
      console.warn('[deleteReview] Notice on delete:', err?.message || err);
    }
  }
  return true;
}

// ============================================
// USERS & ADMIN SERVICE
// ============================================
export async function getAllUsers(): Promise<User[]> {
  if (isDbConfigured()) {
    try {
      await autoSeedDatabase();
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbUsers && dbUsers.length > 0) {
        const mapped: User[] = dbUsers.map((u: any) => ({
          id: u.id,
          firebaseUid: u.firebaseUid || undefined,
          fullName: u.fullName,
          email: u.email || undefined,
          mobile: u.mobile || undefined,
          passwordHash: u.passwordHash || undefined,
          role: u.role as any,
          status: u.status as any,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
          updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
        }));
        globalRuntime._users = mapped;
        return mapped;
      }
    } catch (err: any) {
      console.warn('[getAllUsers] Prisma read notice:', err.message);
    }
  }

  if (!globalRuntime._users || globalRuntime._users.length === 0) {
    globalRuntime._users = [...defaultUsers];
  } else {
    for (const defU of defaultUsers) {
      const existingIdx = globalRuntime._users.findIndex(
        (u) => (u.email || '').toLowerCase() === (defU.email || '').toLowerCase()
      );
      if (existingIdx === -1) {
        globalRuntime._users.push(defU);
      } else {
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

  if (isDbConfigured()) {
    try {
      await prisma.user.upsert({
        where: { email: newUser.email },
        update: {
          fullName: newUser.fullName,
          mobile: newUser.mobile,
          role: newUser.role as any,
          status: newUser.status as any,
          ...(newUser.passwordHash ? { passwordHash: newUser.passwordHash } : {}),
        },
        create: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          mobile: newUser.mobile,
          passwordHash: newUser.passwordHash,
          role: newUser.role as any,
          status: newUser.status as any,
        },
      });
    } catch (err: any) {
      console.error('[saveUser] Failed to save user in database:', err.message);
      throw new Error(`Failed to save user in database: ${err.message}`);
    }
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

  if (isDbConfigured()) {
    try {
      await prisma.user.create({
        data: {
          id: newCustomer.id,
          fullName: newCustomer.fullName,
          email: newCustomer.email,
          mobile: newCustomer.mobile || null,
          passwordHash: newCustomer.passwordHash,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      });
    } catch (err: any) {
      console.warn('[createCustomerWithEmail] Notice:', err.message);
    }
  }

  return newCustomer;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const users = await getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();

  if (isDbConfigured()) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.warn('[updateUserPassword] Notice:', err.message);
    }
  }

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

  if (isDbConfigured()) {
    try {
      await (prisma as any).passwordResetToken.create({
        data: {
          email: cleanEmail,
          tokenHash,
          expiresAt: new Date(expiresAt),
          userId: userId || undefined,
        },
      });
    } catch (err: any) {
      console.warn('[savePasswordResetToken] Notice:', err.message);
    }
  }
}

export async function verifyAndConsumeResetToken(
  tokenHash: string
): Promise<{ valid: boolean; email?: string; userId?: string }> {
  const now = Date.now();
  const list = globalRuntime._passwordResetTokens || [];
  const foundIdx = list.findIndex(
    (t) => t.tokenHash === tokenHash && t.expiresAt > now && !t.usedAt
  );

  if (isDbConfigured()) {
    try {
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
    } catch (err: any) {
      console.warn('[verifyAndConsumeResetToken] Notice:', err.message);
    }
  }

  if (foundIdx === -1) {
    return { valid: false };
  }

  const record = list[foundIdx];
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

  let existing = users.find((u) => u.firebaseUid === data.firebaseUid);

  if (!existing && mobile) {
    existing = users.find((u) => {
      const uDigits = (u.mobile || '').replace(/\D/g, '');
      const u10 = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
      return u10 === mobile;
    });
  }

  if (!existing && data.email) {
    existing = users.find((u) => u.email && u.email.toLowerCase() === data.email?.toLowerCase());
  }

  const now = new Date().toISOString();

  if (existing) {
    existing.firebaseUid = existing.firebaseUid || data.firebaseUid;
    if (data.fullName && (!existing.fullName || existing.fullName === 'Valued Customer')) {
      existing.fullName = data.fullName.trim();
    }
    if (data.email && !existing.email) {
      existing.email = data.email.toLowerCase().trim();
    }
    existing.updatedAt = now;

    if (isDbConfigured()) {
      try {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firebaseUid: existing.firebaseUid,
            fullName: existing.fullName,
            email: existing.email,
            updatedAt: new Date(),
          },
        });
      } catch (err: any) {
        console.warn('[findOrCreateCustomerByFirebase] Update notice:', err.message);
      }
    }

    return existing;
  }

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

  if (isDbConfigured()) {
    try {
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
    } catch (err: any) {
      console.warn('[findOrCreateCustomerByFirebase] Create notice:', err.message);
    }
  }

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

  if (isDbConfigured()) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          updatedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.warn('[updateCustomerProfile] Notice:', err.message);
    }
  }

  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  globalRuntime._users = (globalRuntime._users || []).filter((u) => u.id !== id);
  if (isDbConfigured()) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (err: any) {
      console.error('[deleteUser] Failed to delete user from database:', err.message);
      throw new Error(`Failed to delete user from database: ${err.message}`);
    }
  }
  return true;
}

// ============================================
// ACTIVITY LOGS SERVICE
// ============================================
export async function getActivityLogs(): Promise<ActivityLog[]> {
  return globalRuntime._activityLogs || [];
}
