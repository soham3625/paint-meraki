// ============================================
// paint_n_meraki — WISHLIST STORE (Zustand + localStorage)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, WishlistItem } from '@/types';

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.product.id === product.id)) {
            return state;
          }
          return {
            items: [...state.items, { product, addedAt: new Date().toISOString() }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      toggleItem: (product) => {
        const isIn = get().isInWishlist(product.id);
        if (isIn) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      getItemCount: () => get().items.length,

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'paint-meraki-wishlist',
    }
  )
);
