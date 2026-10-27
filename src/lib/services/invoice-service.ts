// ============================================
// paint_n_meraki — INVOICE GENERATION & SECURITY SERVICE
// Strict separation between Customer Delivery Invoice and Admin Internal Invoice
// ============================================

import { getOrderByIdOrNumber, getBusinessSettings } from '@/lib/services/db-service';
import type { Order, User, BusinessSettings } from '@/types';
import type { AdminSession } from '@/lib/auth/admin-auth';

export interface CustomerInvoiceItem {
  name: string;
  size: string;
  customizationDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  estimatedDelivery?: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;

  // Store details (Customer Safe)
  store: {
    name: string;
    tagline: string;
    logo: string;
    email: string;
    whatsapp: string;
    address: string;
    website: string;
    instagram: string;
    instagramUrl?: string;
  };

  // Customer info (Customer Safe)
  customer: {
    fullName: string;
    mobile: string;
    email?: string;
  };

  // Shipping Address
  shippingAddress: {
    fullName: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    mobile: string;
  };

  // Order Items
  items: CustomerInvoiceItem[];

  // Pricing summary
  subtotal: number;
  shippingCharge: number;
  codFee: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;

  // Customer-safe notes
  customerInstructions?: string;
  isCustomOrder?: boolean;
}

export interface AdminInvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  internalOrderId: string;
  userId?: string;
  orderDate: string;
  updatedDate: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  utrNumber?: string;
  courierName?: string;
  trackingNumber?: string;
  internalNotes?: string;

  store: BusinessSettings;
  customer: {
    fullName: string;
    mobile: string;
    email: string;
  };
  shippingAddress: {
    fullName: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    mobile: string;
  };
  items: Array<{
    id: string;
    productId: string;
    sku?: string;
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customization?: any;
  }>;
  subtotal: number;
  shippingCharge: number;
  codFee: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
}

// Generate stable, human-readable invoice number from order number
export function generateInvoiceNumber(orderNumber: string): string {
  const clean = orderNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const digits = clean.replace(/^PM/, '');
  return `PM-INV-${digits.padStart(6, '0')}`;
}

// Format customer-friendly status labels
export function getCustomerFriendlyStatus(status: string): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Order Placed';
    case 'PAYMENT_VERIFICATION':
      return 'Payment Verification';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PROCESSING':
      return 'Handcrafting in Progress';
    case 'READY_TO_SHIP':
      return 'Ready for Dispatch';
    case 'SHIPPED':
      return 'Shipped / In Transit';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return status;
  }
}

/**
 * Fetch and sanitize CUSTOMER DELIVERY INVOICE
 * Validates customer session or admin override.
 * Strictly strips internal fields.
 */
export async function getCustomerInvoiceData(
  orderIdentifier: string,
  userSession: User | null,
  isAdminUser: boolean = false
): Promise<{ success: boolean; data?: CustomerInvoiceData; error?: string; status?: number }> {
  const order = await getOrderByIdOrNumber(orderIdentifier);
  if (!order) {
    return { success: false, error: 'Order not found', status: 404 };
  }

  // Security Check: Customer must own the order OR caller must be an Admin
  if (!isAdminUser) {
    if (!userSession) {
      return { success: false, error: 'Authentication required to view invoice', status: 401 };
    }

    const sessionMobile = (userSession.mobile || '').replace(/\D/g, '').slice(-10);
    const orderMobile = (order.customer?.mobile || '').replace(/\D/g, '').slice(-10);
    const ownsOrder =
      (order.userId && order.userId === userSession.id) ||
      (sessionMobile && orderMobile && sessionMobile === orderMobile);

    if (!ownsOrder) {
      return {
        success: false,
        error: 'Access denied. You are not authorized to view this invoice.',
        status: 403,
      };
    }
  }

  const settings = await getBusinessSettings();
  const invoiceNumber = generateInvoiceNumber(order.orderNumber);

  // Map and sanitize items
  const items: CustomerInvoiceItem[] = (order.items || []).map((item) => {
    const sizeStr =
      typeof item.selectedSize === 'object' && item.selectedSize
        ? (item.selectedSize as any).label
        : item.selectedSize || 'Standard';

    const unitPrice =
      typeof item.price === 'number' && !isNaN(item.price)
        ? item.price
        : typeof (item.selectedSize as any)?.price === 'number'
        ? (item.selectedSize as any).price
        : typeof item.product?.price === 'number'
        ? item.product.price
        : 0;

    const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;

    // Build customer-friendly customization description
    const customParts: string[] = [];
    if (item.customization?.color) {
      customParts.push(`Color: ${item.customization.color}`);
    }
    if (item.customization?.text) {
      customParts.push(`Custom Text: "${item.customization.text}"`);
    }
    if (item.customization?.personalMessage) {
      customParts.push(`Message: "${item.customization.personalMessage}"`);
    }
    if (item.customization?.specialInstructions) {
      customParts.push(`Note: ${item.customization.specialInstructions}`);
    }

    return {
      name: item.product?.name || 'Handcrafted Resin Art',
      size: sizeStr,
      customizationDescription: customParts.length > 0 ? customParts.join(' • ') : undefined,
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
    };
  });

  // Collect customer instructions (if provided on item level)
  const customerNotes = (order.items || [])
    .map((it) => it.customization?.specialInstructions)
    .filter(Boolean)
    .join('; ');

  const invoiceData: CustomerInvoiceData = {
    invoiceNumber,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    estimatedDelivery: settings.deliveryTime || '3-5 business days',
    orderStatus: getCustomerFriendlyStatus(order.orderStatus),
    paymentMethod: order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod,
    paymentStatus:
      order.paymentStatus === 'CONFIRMED'
        ? 'Paid / Confirmed'
        : order.paymentMethod === 'COD'
        ? 'Payable on Delivery'
        : 'Pending Verification',

    store: {
      name:
        settings.businessName &&
        ['paint_n_meraki', 'paint meraki', 'paintnmeraki', 'paintmeraki'].includes(
          settings.businessName.toLowerCase().replace(/[\s_]+/g, '')
        )
          ? 'Paint_n_Meraki'
          : settings.businessName || 'Paint_n_Meraki',
      tagline: 'Handcrafted Resin Art • Made with Love',
      logo: settings.logo || '/logo.jpg',
      email: settings.email || 'paintnmeraki@gmail.com',
      whatsapp: settings.whatsappNumber
        ? (settings.whatsappNumber.startsWith('+') ? settings.whatsappNumber : `+${settings.whatsappNumber.replace(/\D/g, '')}`)
        : '+917284075825',
      address: settings.businessAddress || 'Gujarat, India',
      website: process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'paintnmeraki.vercel.app',
      instagram: settings.instagramUrl
        ? (settings.instagramUrl.includes('instagram.com/')
            ? `@${settings.instagramUrl.split('instagram.com/')[1]?.replace(/\/$/, '')}`
            : settings.instagramUrl.startsWith('@') ? settings.instagramUrl : `@${settings.instagramUrl}`)
        : '@paint.meraki',
      instagramUrl: settings.instagramUrl || 'https://www.instagram.com/paint.meraki',
    },

    customer: {
      fullName: order.customer.fullName,
      mobile: order.customer.mobile,
      email: order.customer.email,
    },

    shippingAddress: {
      fullName: order.customer.fullName,
      address: order.shippingAddress.address,
      landmark: order.shippingAddress.landmark || undefined,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      country: 'India',
      mobile: order.customer.mobile,
    },

    items,

    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    codFee: order.codFee || 0,
    discountAmount: order.discountAmount || 0,
    couponCode: order.couponCode || undefined,
    total: order.total,

    customerInstructions: customerNotes || undefined,
    isCustomOrder: (order.items || []).some((it) => Boolean(it.customization)),
  };

  return { success: true, data: invoiceData };
}

/**
 * Fetch ADMIN INTERNAL & FULFILLMENT INVOICE
 * Validates admin session. Contains complete operational details.
 */
export async function getAdminInvoiceData(
  orderIdentifier: string,
  adminSession: AdminSession | null
): Promise<{ success: boolean; data?: AdminInvoiceData; error?: string; status?: number }> {
  if (!adminSession || adminSession.role === 'CUSTOMER') {
    return {
      success: false,
      error: 'Unauthorized. Administrative credentials required.',
      status: 403,
    };
  }

  const order = await getOrderByIdOrNumber(orderIdentifier);
  if (!order) {
    return { success: false, error: 'Order not found', status: 404 };
  }

  const settings = await getBusinessSettings();
  const invoiceNumber = generateInvoiceNumber(order.orderNumber);

  const items = (order.items || []).map((item, idx) => {
    const unitPrice =
      typeof item.price === 'number' && !isNaN(item.price)
        ? item.price
        : typeof (item.selectedSize as any)?.price === 'number'
        ? (item.selectedSize as any).price
        : typeof item.product?.price === 'number'
        ? item.product.price
        : 0;

    const sizeStr =
      typeof item.selectedSize === 'object' && item.selectedSize
        ? (item.selectedSize as any).label
        : item.selectedSize || 'Standard';

    const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;

    return {
      id: item.id || `item-${idx + 1}`,
      productId: item.product?.id || 'prod-custom',
      sku: item.product?.sku || 'PM-ART',
      name: item.product?.name || 'Handcrafted Item',
      size: sizeStr,
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
      customization: item.customization,
    };
  });

  const adminInvoiceData: AdminInvoiceData = {
    invoiceNumber,
    orderNumber: order.orderNumber,
    internalOrderId: order.id,
    userId: order.userId,
    orderDate: order.createdAt,
    updatedDate: order.updatedAt,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    utrNumber: order.utrNumber,
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
    internalNotes: order.notes,

    store: settings,
    customer: {
      fullName: order.customer.fullName,
      mobile: order.customer.mobile,
      email: order.customer.email,
    },
    shippingAddress: {
      fullName: order.customer.fullName,
      address: order.shippingAddress.address,
      landmark: order.shippingAddress.landmark,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      mobile: order.customer.mobile,
    },
    items,
    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    codFee: order.codFee || 0,
    discountAmount: order.discountAmount || 0,
    couponCode: order.couponCode,
    total: order.total,
  };

  return { success: true, data: adminInvoiceData };
}
