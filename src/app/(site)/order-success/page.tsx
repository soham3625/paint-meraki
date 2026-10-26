'use client';

// ============================================
// paint_n_meraki — ORDER SUCCESS PAGE
// ============================================

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrderStore } from '@/lib/store/order-store';
import { formatPrice } from '@/lib/data/products';
import { CheckCircle, Package, MessageCircle, ShoppingBag } from 'lucide-react';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { currentOrder } = useOrderStore();
  const order = currentOrder;

  return (
    <div className="container-custom py-12 sm:py-20 text-center max-w-2xl mx-auto pb-24 sm:pb-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle size={40} className="text-success" />
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">
        Thank you for supporting handmade.
      </h1>
      <p className="font-accent text-xl text-dusty-rose mb-6">Your order has been placed!</p>

      {orderNumber && (
        <div className="bg-white rounded-xl border border-beige/30 p-6 mb-6 text-left">
          <div className="text-center mb-4">
            <p className="text-sm text-taupe">Order Number</p>
            <p className="font-heading text-2xl font-semibold text-charcoal">#{orderNumber}</p>
          </div>

          {order && (
            <>
              <div className="border-t border-beige/30 pt-4 space-y-3">
                {order.items.map((item, index) => {
                  const sizeLabel =
                    typeof item.selectedSize === 'object' && item.selectedSize
                      ? (item.selectedSize as any).label
                      : (item.selectedSize || 'Standard');
                  const itemPrice = typeof item.price === 'number' ? item.price : ((item.selectedSize as any)?.price || item.product?.price || 0);

                  return (
                    <div key={item.id || `item-${index}`} className="flex justify-between text-sm">
                      <span className="text-taupe">
                        {item.product?.name || 'Handcrafted Item'} ({sizeLabel}) × {item.quantity || 1}
                      </span>
                      <span className="text-charcoal font-medium">
                        {formatPrice(itemPrice * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-beige/30 pt-2 flex justify-between font-heading font-semibold text-charcoal">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="border-t border-beige/30 pt-4 mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-taupe font-medium">Payment</p>
                  <p className="text-charcoal">{order.paymentMethod}</p>
                  <p className="text-xs text-dusty-rose capitalize">{order.paymentStatus.toLowerCase().replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-taupe font-medium">Shipping To</p>
                  <p className="text-charcoal">{order.customer.fullName}</p>
                  <p className="text-xs text-taupe">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 p-3 bg-cream/50 rounded-lg text-center">
            <p className="text-xs text-taupe">
              ⏱ Expected processing time: <span className="font-medium text-charcoal">5-7 business days</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/track-order" className="btn-primary">
          <Package size={16} /> Track Order
        </Link>
        <a
          href={`https://wa.me/919878541310?text=${encodeURIComponent(`Hi paint_n_meraki, I just placed order #${orderNumber}. Thank you!`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <MessageCircle size={16} /> Chat on WhatsApp
        </a>
        <Link href="/shop" className="btn-secondary">
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 skeleton rounded-full" />
        <div className="h-8 w-64 mx-auto skeleton mb-2" />
        <div className="h-4 w-48 mx-auto skeleton" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
