// ============================================
// paint_n_meraki — TYPE DEFINITIONS
// ============================================

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface User {
  id: string;
  firebaseUid?: string;
  fullName: string;
  email?: string;
  mobile?: string;
  passwordHash?: string;
  role?: Role;
  status?: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  images: string[];
  thumbnail: string;
  sizes: ProductSize[];
  colors: string[];
  customizable: boolean;
  featured: boolean;
  bestSeller: boolean;
  isNewArrival?: boolean;
  status?: ProductStatus;
  tags?: string[];
  stock: number;
  sku: string;
  weight?: string;
  dimensions?: string;
  material: string;
  careInstructions: string;
  shippingInfo: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSize {
  label: string;
  value: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: ProductSize;
  customization?: CartCustomization;
}

export interface CartCustomization {
  color?: string;
  text?: string;
  personalMessage?: string;
  photoUrl?: string;
  referenceImageUrl?: string;
  specialInstructions?: string;
  giftWrapping?: boolean;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  productName?: string;
  productSlug?: string;
  productId?: string;
  date?: string;
  verified: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customer: CustomerInfo;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingCharge: number;
  codFee: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'UPI' | 'COD' | string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  utrNumber?: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  selectedSize: string;
  customization?: CartCustomization;
}

export interface CustomerInfo {
  fullName: string;
  mobile: string;
  email: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'VERIFICATION'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REFUNDED';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFICATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface CustomOrderRequest {
  id: string;
  customerName: string;
  whatsappNumber: string;
  email: string;
  productType: string;
  preferredSize?: string;
  preferredColors?: string;
  budget?: string;
  quotationAmount?: number;
  referenceImageUrl?: string;
  personalPhotoUrl?: string;
  description: string;
  specialInstructions?: string;
  adminNotes?: string;
  status: CustomOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type CustomOrderStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'DESIGNING'
  | 'QUOTE_SENT'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BusinessSettings {
  businessName: string;
  logo: string;
  favicon?: string;
  whatsappNumber: string;
  instagramUrl: string;
  email: string;
  upiId: string;
  upiQrCode?: string;
  codEnabled: boolean;
  codMinOrder: number;
  codMaxOrder: number;
  codFee: number;
  shippingCharge: number;
  freeShippingThreshold: number;
  processingTime: string;
  deliveryTime: string;
  announcementText: string;
  announcementEnabled?: boolean;
  businessAddress: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageConfig {
  id: string;
  heroHeading: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroImage: string;
  heroEnabled: boolean;
  featuredCategories: string[];
  featuredProducts: string[];
  bestSellers: string[];
  newArrivals: string[];
  resinClocksImage?: string;
  poojaThalisImage?: string;
  updatedAt: string;
}

export interface WebsiteContent {
  id: string;
  key: string;
  title: string;
  content: string;
  section: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}
