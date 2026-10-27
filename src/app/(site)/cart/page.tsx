'use client';

// ============================================
// paint_n_meraki — CART PAGE
// ============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/data/products';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShippingCharge, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [storeSettings, setStoreSettings] = useState<{
    freeShippingThreshold: number;
    shippingCharge: number;
  }>({
    freeShippingThreshold: 2000,
    shippingCharge: 99,
  });

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.freeShippingThreshold === 'number') {
          setStoreSettings({
            freeShippingThreshold: data.freeShippingThreshold,
            shippingCharge: typeof data.shippingCharge === 'number' ? data.shippingCharge : 99,
          });
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = getSubtotal();
  const freeThreshold = storeSettings.freeShippingThreshold;
  const standardShipping = storeSettings.shippingCharge;
  const isFreeShipping = subtotal >= freeThreshold;
  const shipping = isFreeShipping ? 0 : standardShipping;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      discountAmount = 0;
    } else if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shipping);

  // Auto-remove coupon if cart drops below required spend
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      toast.error(`Coupon ${appliedCoupon.code} requires min order ₹${appliedCoupon.minOrderAmount}. Removed.`);
      removeCoupon();
    }
  }, [subtotal, appliedCoupon, removeCoupon]);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        const errorMsg = data.message || 'Invalid or inactive coupon code';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      applyCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        minOrderAmount: data.coupon.minOrderAmount,
        maxDiscount: data.coupon.maxDiscount,
      });

      toast.success(data.message || `Coupon ${data.coupon.code} applied!`);
      setCouponCodeInput('');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to validate coupon';
      setCouponError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponError(null);
    toast.success('Coupon removed');
  };

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

              {/* Discount / Coupon Section */}
              <div className="border-t border-beige/30 pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    <Tag size={13} className="text-[#9B7B1B]" /> Have a Coupon Code?
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Applied
                    </span>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Tag size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-xs text-emerald-950 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Saved {formatPrice(discountAmount)} on your order
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition-colors"
                      title="Remove coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => {
                            setCouponCodeInput(e.target.value.toUpperCase());
                            if (couponError) setCouponError(null);
                          }}
                          placeholder="Coupon code (e.g. MERAKI10)"
                          className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-beige/60 bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:border-[#9B7B1B] transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-taupe"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isValidatingCoupon || !couponCodeInput.trim()}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
                      >
                        {isValidatingCoupon ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 font-medium animate-fade-in pl-1">
                        {couponError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-taupe">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-700 font-medium bg-emerald-50/70 -mx-2 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <span>🏷️ Coupon Discount</span>
                      <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                        {appliedCoupon.code}
                      </span>
                    </span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-taupe">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-success font-semibold">Free</span> : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && freeThreshold > subtotal && (
                  <p className="text-xs text-dusty-rose font-medium animate-fade-in">
                    Add {formatPrice(freeThreshold - subtotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-beige/30 pt-3">
                  <div className="flex justify-between font-heading text-base font-semibold text-charcoal">
                    <span>Total</span>
                    <span className={discountAmount > 0 ? 'text-[#9B7B1B]' : ''}>{formatPrice(total)}</span>
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
                <p>📦 Free shipping on orders above {formatPrice(freeThreshold)}</p>
                <p>💬 Need help? Chat on WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
