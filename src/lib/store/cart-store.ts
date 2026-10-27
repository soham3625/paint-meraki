// ============================================
// paint_n_meraki — CART STORE (Zustand + localStorage)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductSize, CartCustomization } from '@/types';

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountType: 'PERCENTAGE' | 'FIXED' | string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
}

interface CartStore {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (product: Product, size: ProductSize, quantity: number, customization?: CartCustomization) => void;
  removeItem: (productId: string, sizeValue: string) => void;
  updateQuantity: (productId: string, sizeValue: string, quantity: number) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingCharge: (freeThreshold?: number, shippingFee?: number) => number;
  getTotal: (freeThreshold?: number, shippingFee?: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      applyCoupon: (coupon: AppliedCoupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      addItem: (product, size, quantity, customization) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.selectedSize.value === size.value
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
              customization: customization || newItems[existingIndex].customization,
            };
            return { items: newItems };
          }

          return {
            items: [...state.items, { product, quantity, selectedSize: size, customization }],
          };
        });
      },

      removeItem: (productId, sizeValue) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.selectedSize.value === sizeValue)
          ),
        }));
      },

      updateQuantity: (productId, sizeValue, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.selectedSize.value === sizeValue
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.selectedSize.price * item.quantity,
          0
        );
      },

      getDiscountAmount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return 0;
        }
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        return Math.min(discount, subtotal);
      },

      getShippingCharge: (freeThreshold = 2000, shippingFee = 99) => {
        const subtotal = get().getSubtotal();
        return subtotal >= freeThreshold ? 0 : shippingFee;
      },

      getTotal: (freeThreshold = 2000, shippingFee = 99) => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingCharge(freeThreshold, shippingFee);
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: 'paint-meraki-cart',
    }
  )
);
