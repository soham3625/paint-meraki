'use client';

// ============================================
// paint_n_meraki — CART PAGE
// ============================================

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/data/products';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShippingCharge, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingCharge();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center pb-24 sm:pb-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-beige/30 flex items-center justify-center">
          <ShoppingBag size={32} className="text-taupe/40" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mb-2">Your Cart</h1>
        <p className="text-taupe mb-6">Your cart is waiting for something beautiful.</p>
        <Link href="/shop" className="btn-primary">
          Explore Our Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-6 sm:py-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal">Your Cart</h1>
          <p className="text-taupe text-sm">{items.length} item{items.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize.value}`}
                className="bg-white rounded-xl p-4 sm:p-5 border border-beige/30 flex gap-4"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-cream to-beige/30 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                  {item.product.thumbnail || (item.product.images && item.product.images[0]) ? (
                    <img
                      src={item.product.thumbnail || item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-pm')) {
                          const span = document.createElement('span');
                          span.className = 'font-accent text-dusty-rose/40 text-sm fallback-pm';
                          span.innerText = 'PM';
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="font-accent text-dusty-rose/40 text-sm">PM</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-heading text-sm sm:text-base font-semibold text-charcoal hover:text-dusty-rose transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-taupe mt-0.5">
                        Size: {item.selectedSize.label}
                        {item.customization?.color && ` · ${item.customization.color}`}
                      </p>
                      {item.customization?.text && (
                        <p className="text-xs text-dusty-rose mt-0.5">
                          Custom: &ldquo;{item.customization.text}&rdquo;
                        </p>
                      )}
                    </div>
                    <p className="font-heading text-base font-semibold text-charcoal whitespace-nowrap">
                      {formatPrice(item.selectedSize.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize.value, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-lg border border-beige/50 flex items-center justify-center text-taupe hover:bg-beige/30 disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize.value, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-beige/50 flex items-center justify-center text-taupe hover:bg-beige/30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          removeItem(item.product.id, item.selectedSize.value);
                          toast.success('Item removed from cart');
                        }}
                        className="text-xs text-taupe hover:text-error transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6 sticky top-24">
              <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-taupe">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-taupe">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-dusty-rose">
                    Add {formatPrice(2000 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-beige/30 pt-3">
                  <div className="flex justify-between font-heading text-base font-semibold text-charcoal">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-center mt-6">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <Link href="/shop" className="block text-center text-sm text-taupe hover:text-charcoal transition-colors mt-3 py-2">
                ← Continue Shopping
              </Link>

              <div className="mt-4 pt-4 border-t border-beige/30 space-y-2 text-xs text-taupe">
                <p>🔒 Secure checkout</p>
                <p>📦 Free shipping on orders above ₹2,000</p>
                <p>💬 Need help? Chat on WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
