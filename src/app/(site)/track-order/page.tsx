'use client';

// ============================================
// paint_n_meraki — ORDER TRACKING PAGE
// ============================================

import { useState } from 'react';
import { useOrderStore } from '@/lib/store/order-store';
import { formatPrice } from '@/lib/data/products';
import { Search, Package, CheckCircle, Truck, Clock, CreditCard, Box } from 'lucide-react';
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

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const { getOrderByNumber, syncOrder } = useOrderStore();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setNotFound(false);

    const cleanNumber = orderNumber.toUpperCase().replace('#', '').trim();
    const cleanMobile = mobile.replace(/\D/g, '').trim();

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(cleanNumber)}&mobile=${encodeURIComponent(cleanMobile)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          syncOrder(data.order);
          setNotFound(false);
          setSearching(false);
          return;
        }
      }
    } catch (err) {
      console.error('Track API error:', err);
    }

    // Local fallback if offline
    const localFound = getOrderByNumber(cleanNumber);
    if (localFound && (!cleanMobile || (localFound.customer?.mobile || '').replace(/\D/g, '').slice(-10) === cleanMobile.slice(-10))) {
      setOrder(localFound);
      setSearching(false);
      return;
    }

    setOrder(null);
    setNotFound(true);
    setSearching(false);
  };

  const currentStatusIndex = order ? getStatusIndex(order.orderStatus) : -1;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-8 sm:py-12">
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">Track Your Order</h1>
          <p className="text-taupe">Enter your order number and mobile number to track your order.</p>
        </div>
      </div>

      <div className="container-custom py-8 max-w-2xl mx-auto">
        {/* Search Form */}
        <form onSubmit={handleTrack} className="bg-white rounded-xl border border-beige/30 p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="input-label">Order Number</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., PM1001"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="input-field"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={searching} className="btn-primary w-full justify-center disabled:opacity-50">
            <Search size={16} /> {searching ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {/* Not Found */}
        {notFound && (
          <div className="text-center py-12 bg-white rounded-xl border border-beige/30 animate-fade-in">
            <Package size={40} className="text-taupe/30 mx-auto mb-3" />
            <p className="font-heading text-lg text-charcoal mb-1">Order Not Found</p>
            <p className="text-sm text-taupe">Please check your order number and mobile number.</p>
            <p className="text-xs text-taupe mt-4">
              Need help?{' '}
              <a href="https://wa.me/919878541310" target="_blank" rel="noopener noreferrer" className="text-dusty-rose hover:underline">
                Chat on WhatsApp
              </a>
            </p>
          </div>
        )}

        {/* Order Found */}
        {order && (
          <div className="space-y-6 animate-fade-in">
            {/* Order Info */}
            <div className="bg-white rounded-xl border border-beige/30 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-taupe">Order Number</p>
                  <p className="font-heading text-xl font-semibold text-charcoal">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-taupe">Total</p>
                  <p className="font-heading text-lg font-semibold text-charcoal">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="py-6">
                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isCancelled = order.orderStatus === 'CANCELLED';

                    return (
                      <div key={step.status} className="flex items-start gap-4 mb-6 last:mb-0">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCancelled ? 'bg-error/10' :
                              isCompleted ? 'bg-success/10' : 'bg-beige/30'
                            }`}>
                            <Icon size={14} className={
                              isCancelled ? 'text-error' :
                                isCompleted ? 'text-success' : 'text-taupe/40'
                            } />
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`w-0.5 h-6 mt-1 ${isCompleted && index < currentStatusIndex ? 'bg-success/30' : 'bg-beige/30'}`} />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isCurrent ? 'text-charcoal' : isCompleted ? 'text-charcoal/70' : 'text-taupe/40'
                            }`}>
                            {step.label}
                            {isCurrent && <span className="ml-2 badge badge-new text-[10px]">Current</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(order.trackingNumber || order.courierName) && (
                <div className="bg-cream/40 rounded-xl p-3.5 border border-beige/30 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {order.courierName && (
                    <div>
                      <span className="text-taupe">Courier Partner: </span>
                      <span className="font-semibold text-charcoal">{order.courierName}</span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <span className="text-taupe">Tracking No: </span>
                      <span className="font-mono font-semibold text-charcoal">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="border-t border-beige/30 pt-4">
                <h3 className="text-sm font-medium text-charcoal mb-3">Order Items</h3>
                {order.items.map((item, index) => {
                  const sizeLabel =
                    typeof item.selectedSize === 'object' && item.selectedSize
                      ? (item.selectedSize as any).label
                      : (item.selectedSize || 'Standard');
                  const unitPrice =
                    typeof item.price === 'number' && !isNaN(item.price)
                      ? item.price
                      : ((item.selectedSize as any)?.price || item.product?.price || 0);

                  return (
                    <div key={item.id || `track-item-${index}`} className="flex justify-between text-sm py-1.5 border-b border-beige/20 last:border-b-0">
                      <span className="text-taupe">
                        {item.product?.name || 'Handcrafted Item'} ({sizeLabel}) × {item.quantity || 1}
                      </span>
                      <span className="text-charcoal font-medium">
                        {formatPrice(unitPrice * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
