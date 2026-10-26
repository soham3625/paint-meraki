// ============================================
// paint_n_meraki — CART STORE (Zustand + localStorage)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductSize, CartCustomization } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: ProductSize, quantity: number, customization?: CartCustomization) => void;
  removeItem: (productId: string, sizeValue: string) => void;
  updateQuantity: (productId: string, sizeValue: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingCharge: (freeThreshold?: number, shippingFee?: number) => number;
  getTotal: (freeThreshold?: number, shippingFee?: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

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

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.selectedSize.price * item.quantity,
          0
        );
      },

      getShippingCharge: (freeThreshold = 2000, shippingFee = 99) => {
        const subtotal = get().getSubtotal();
        return subtotal >= freeThreshold ? 0 : shippingFee;
      },

      getTotal: (freeThreshold = 2000, shippingFee = 99) => {
        return get().getSubtotal() + get().getShippingCharge(freeThreshold, shippingFee);
      },
    }),
    {
      name: 'paint-meraki-cart',
    }
  )
);
