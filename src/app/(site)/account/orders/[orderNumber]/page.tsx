'use client';

// ============================================
// paint_n_meraki — ORDER DETAIL PAGE
// ============================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrderStore } from '@/lib/store/order-store';
import { formatPrice } from '@/lib/data/products';
import { ArrowLeft, Package, CheckCircle, Truck, Clock, CreditCard, Box, MapPin } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'PENDING_PAYMENT', label: 'Order Placed', icon: Package },
  { status: 'PAYMENT_VERIFICATION', label: 'Payment Verification', icon: CreditCard },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PROCESSING', label: 'Processing', icon: Clock },
  { status: 'READY_TO_SHIP', label: 'Ready to Ship', icon: Box },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

function getStatusIndex(status: OrderStatus): number {
  const idx = statusSteps.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const { getOrderByNumber, syncOrder } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
    const cleanNum = (orderNumber || '').toUpperCase().replace('#', '').trim();
    const localFound = getOrderByNumber(cleanNum);
    if (localFound) {
      setOrder(localFound);
      setLoading(false);
    }

    // Always fetch live status from API
    fetch(`/api/orders/track?orderNumber=${encodeURIComponent(cleanNum)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && data.order) {
          setOrder(data.order);
          syncOrder(data.order);
        }
      })
      .catch((e) => console.error('Error fetching live order:', e))
      .finally(() => setLoading(false));
  }, [orderNumber, getOrderByNumber, syncOrder]);

  if (!mounted || loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dusty-rose mx-auto mb-3" />
        <p className="text-sm text-taupe">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-10 text-center">
        <Package size={48} className="text-beige mx-auto mb-4" />
        <h2 className="font-heading text-xl text-charcoal mb-2">Order Not Found</h2>
        <p className="text-sm text-taupe mb-4">We couldn&apos;t find order #{orderNumber}</p>
        <Link href="/account/orders" className="btn-primary inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'REFUNDED';

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/account/orders" className="p-2 rounded-lg hover:bg-cream/50 transition-colors text-taupe hover:text-charcoal">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-lg font-semibold text-charcoal">Order #{order.orderNumber}</h2>
            <p className="text-xs text-taupe">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <Link
          href={`/account/orders/${order.orderNumber}/invoice`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-beige/60 hover:bg-cream/40 text-charcoal font-semibold text-xs shadow-xs hover:border-dusty-rose/40 transition-all self-start sm:self-auto"
        >
          <Box size={14} className="text-dusty-rose" />
          View Delivery Invoice
        </Link>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
        <h3 className="font-heading text-sm font-semibold text-charcoal mb-6">Order Status</h3>

        {isCancelled ? (
          <div className="bg-red-50 rounded-xl px-4 py-3 text-center">
            <p className="text-red-600 font-medium text-sm">{order.orderStatus === 'CANCELLED' ? 'Order Cancelled' : 'Order Refunded'}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-beige/50 z-0" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-dusty-rose z-10 transition-all duration-500"
              style={{ width: `calc(${(currentStatusIndex / (statusSteps.length - 1)) * 100}% - 40px)` }}
            />

            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;

              return (
                <div key={step.status} className="flex flex-col items-center relative z-20" style={{ width: `${100 / statusSteps.length}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                      ? 'bg-dusty-rose border-dusty-rose text-white'
                      : 'bg-white border-beige/50 text-taupe'
                    } ${isCurrent ? 'ring-4 ring-dusty-rose/20' : ''}`}>
                    <Icon size={16} />
                  </div>
                  <p className={`text-[9px] sm:text-[10px] mt-2 text-center leading-tight ${isCompleted ? 'text-charcoal font-medium' : 'text-taupe'
                    }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-beige/30">
            <p className="text-xs text-taupe">Tracking Number</p>
            <p className="text-sm font-medium text-charcoal font-mono">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-beige/30">
          <h3 className="font-heading text-sm font-semibold text-charcoal">
            Items ({order.items.length})
          </h3>
        </div>
        <div>
          {order.items.map((item, index) => {
            const sizeLabel =
              typeof item.selectedSize === 'object' && item.selectedSize
                ? (item.selectedSize as any).label
                : (item.selectedSize || 'Standard');
            const unitPrice =
              typeof item.price === 'number' && !isNaN(item.price)
                ? item.price
                : ((item.selectedSize as any)?.price || item.product?.price || 0);
            const qty = item.quantity || 1;

            return (
              <div key={item.id || `acc-item-${index}`} className="flex items-center gap-4 px-6 py-4 border-b border-beige/20 last:border-b-0">
                <div className="w-14 h-14 rounded-xl bg-cream/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product?.thumbnail ? (
                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} className="text-taupe" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{item.product?.name || 'Handcrafted Art'}</p>
                  <p className="text-xs text-taupe">Size: {sizeLabel} • Qty: {qty}</p>
                </div>
                <p className="font-heading font-semibold text-sm text-charcoal flex-shrink-0">{formatPrice(unitPrice * qty)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary & Shipping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Price Summary */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
          <h3 className="font-heading text-sm font-semibold text-charcoal mb-4">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-taupe">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-taupe">
              <span>Shipping</span>
              <span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between text-taupe">
                <span>COD Fee</span>
                <span>{formatPrice(order.codFee)}</span>
              </div>
            )}
            {order.discountAmount ? (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({order.couponCode || 'Coupon'})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-heading font-semibold text-charcoal pt-2 border-t border-beige/30">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-beige/30">
            <p className="text-xs text-taupe">Payment: {order.paymentMethod}</p>
            {order.utrNumber && <p className="text-xs text-taupe mt-0.5">UTR: {order.utrNumber}</p>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
          <h3 className="font-heading text-sm font-semibold text-charcoal mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-dusty-rose" /> Shipping Address
          </h3>
          <div className="text-sm text-taupe space-y-1">
            <p className="font-medium text-charcoal">{order.customer.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
            <p className="pt-1">📞 {order.customer.mobile}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
