import { NextResponse } from 'next/server';
import {
  createOrder,
  getAllOrders,
  getProductByIdOrSlug,
  getBusinessSettings,
  validateCouponCode,
} from '@/lib/services/db-service';
import { getCurrentCustomerSession } from '@/lib/auth-session';
import { Order, OrderItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getCurrentCustomerSession();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view orders' },
        { status: 401 }
      );
    }

    const allOrders = await getAllOrders();
    const customerMobile = (customer.mobile || '').replace(/\D/g, '').slice(-10);

    const userOrders = allOrders.filter((o) => {
      const orderMobile = (o.customer?.mobile || '').replace(/\D/g, '').slice(-10);
      return (
        o.userId === customer.id ||
        (customerMobile && orderMobile && customerMobile === orderMobile) ||
        (customer.email && o.customer?.email && customer.email.toLowerCase() === o.customer.email.toLowerCase())
      );
    });

    return NextResponse.json({ success: true, orders: userOrders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer: inputCustomer,
      shippingAddress: inputAddress,
      items: inputItems,
      paymentMethod: inputPaymentMethod,
      utrNumber: inputUtrNumber,
      couponCode: inputCouponCode,
    } = body;

    // 1. Basic validation
    if (!inputCustomer || !inputCustomer.fullName || !inputCustomer.mobile) {
      return NextResponse.json({ success: false, error: 'Customer name and valid mobile number are required' }, { status: 400 });
    }

    const cleanMobile = String(inputCustomer.mobile).replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return NextResponse.json({ success: false, error: 'Please provide a valid 10-digit mobile number' }, { status: 400 });
    }

    if (!inputAddress || !inputAddress.address || !inputAddress.city || !inputAddress.state || !inputAddress.pincode) {
      return NextResponse.json({ success: false, error: 'Complete delivery address is required' }, { status: 400 });
    }

    if (!Array.isArray(inputItems) || inputItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
    }

    // 2. Server-side product price & catalog validation (Zero client trust)
    const verifiedItems: OrderItem[] = [];
    let serverSubtotal = 0;

    for (let i = 0; i < inputItems.length; i++) {
      const item = inputItems[i];
      const prodId = item.product?.id || item.productId || item.product?.slug;

      if (!prodId) {
        return NextResponse.json({ success: false, error: 'Invalid product in order' }, { status: 400 });
      }

      const dbProduct = await getProductByIdOrSlug(prodId);
      if (!dbProduct) {
        return NextResponse.json({ success: false, error: `Product not found or unavailable: ${prodId}` }, { status: 400 });
      }

      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));

      // Resolve legitimate price from database catalog
      let verifiedUnitPrice = dbProduct.price;
      const requestedSize = typeof item.selectedSize === 'object' && item.selectedSize ? item.selectedSize.label : item.selectedSize;

      if (requestedSize && Array.isArray(dbProduct.sizes)) {
        const matchedSize = dbProduct.sizes.find(
          (s) => s.label?.toLowerCase() === String(requestedSize).toLowerCase()
        );
        if (matchedSize && typeof matchedSize.price === 'number') {
          verifiedUnitPrice = matchedSize.price;
        }
      }

      const lineTotal = verifiedUnitPrice * quantity;
      serverSubtotal += lineTotal;

      verifiedItems.push({
        id: `item-${Date.now()}-${i}`,
        product: dbProduct,
        quantity,
        price: verifiedUnitPrice,
        selectedSize: requestedSize || 'Standard',
        customization: item.customization ? {
          specialInstructions: item.customization.specialInstructions ? String(item.customization.specialInstructions).slice(0, 500) : undefined,
          color: item.customization.color ? String(item.customization.color).slice(0, 50) : undefined,
          text: item.customization.text ? String(item.customization.text).slice(0, 200) : undefined,
          giftWrapping: Boolean(item.customization.giftWrapping),
        } : undefined,
      });
    }

    // 3. Server-side Coupon & Discount Calculation (Zero client trust)
    let verifiedDiscount = 0;
    let verifiedCouponCode: string | undefined;

    if (inputCouponCode && typeof inputCouponCode === 'string' && inputCouponCode.trim()) {
      const cleanCode = inputCouponCode.trim();
      const couponResult = await validateCouponCode(cleanCode, serverSubtotal);
      if (!couponResult.valid) {
        return NextResponse.json(
          {
            success: false,
            error: couponResult.message || `The coupon code '${cleanCode}' is invalid, expired, or does not meet the minimum requirement.`,
          },
          { status: 400 }
        );
      }
      verifiedDiscount = couponResult.discountAmount || 0;
      verifiedCouponCode = (couponResult.coupon?.code || cleanCode).toUpperCase();
    }

    // 4. Server-side Shipping & COD fee calculation from Business Settings
    const settings = await getBusinessSettings();
    const isFreeShipping = serverSubtotal >= (settings.freeShippingThreshold ?? 2000);
    const serverShippingCharge = isFreeShipping ? 0 : (settings.shippingCharge ?? 99);

    const paymentMethod: 'UPI' | 'COD' = inputPaymentMethod === 'COD' ? 'COD' : 'UPI';
    const serverCodFee = paymentMethod === 'COD' ? (settings.codFee || 0) : 0;

    const serverTotal = Math.max(
      0,
      serverSubtotal - verifiedDiscount + serverShippingCharge + serverCodFee
    );

    // 5. Enforce strict Payment & Order Statuses
    let paymentStatus: 'PENDING' | 'VERIFICATION';
    let orderStatus: 'CONFIRMED' | 'PENDING_PAYMENT';
    let cleanUtr: string | undefined;

    if (paymentMethod === 'COD') {
      paymentStatus = 'PENDING';
      orderStatus = 'CONFIRMED';
    } else {
      paymentStatus = 'VERIFICATION';
      orderStatus = 'PENDING_PAYMENT';
      if (inputUtrNumber && typeof inputUtrNumber === 'string') {
        cleanUtr = inputUtrNumber.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
      }
    }

    // 6. User account association
    const customerSession = await getCurrentCustomerSession();
    const userId = customerSession?.id;

    // 7. Assemble safe server-validated order
    const orderNumber = `PM${Date.now().toString().slice(-6)}`;
    const verifiedOrder: Order = {
      id: 'ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      orderNumber,
      userId,
      customer: {
        fullName: String(inputCustomer.fullName).trim().slice(0, 100),
        email: inputCustomer.email ? String(inputCustomer.email).trim().toLowerCase().slice(0, 120) : '',
        mobile: cleanMobile,
      },
      shippingAddress: {
        address: String(inputAddress.address).trim().slice(0, 300),
        city: String(inputAddress.city).trim().slice(0, 80),
        state: String(inputAddress.state).trim().slice(0, 80),
        pincode: String(inputAddress.pincode).trim().replace(/\D/g, '').slice(0, 6),
        landmark: inputAddress.landmark ? String(inputAddress.landmark).trim().slice(0, 150) : undefined,
      },
      items: verifiedItems,
      subtotal: serverSubtotal,
      shippingCharge: serverShippingCharge,
      codFee: serverCodFee,
      discountAmount: verifiedDiscount > 0 ? verifiedDiscount : undefined,
      couponCode: verifiedCouponCode,
      total: serverTotal,
      paymentMethod,
      paymentStatus,
      orderStatus,
      utrNumber: cleanUtr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await createOrder(verifiedOrder);
    return NextResponse.json({ success: true, order: saved });
  } catch (err: any) {
    console.error('[POST /api/orders] Order placement error:', err.message);
    return NextResponse.json({ success: false, error: err.message || 'Failed to process order' }, { status: 500 });
  }
}
