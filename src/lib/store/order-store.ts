// ============================================
// paint_n_meraki — ORDER STORE
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  addOrder: (order: Order) => void;
  syncOrder: (order: Order) => void;
  syncOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  getOrdersByUserId: (userId: string) => Order[];
  getNextOrderNumber: () => string;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,

      addOrder: (order) => {
        set((state) => {
          const cleanNum = order.orderNumber.toUpperCase().replace('#', '').trim();
          const filtered = state.orders.filter(
            (o) => o.orderNumber.toUpperCase().replace('#', '').trim() !== cleanNum && o.id !== order.id
          );
          return {
            orders: [order, ...filtered],
            currentOrder: order,
          };
        });
      },

      syncOrder: (order) => {
        set((state) => {
          const cleanNum = order.orderNumber.toUpperCase().replace('#', '').trim();
          const existingIdx = state.orders.findIndex(
            (o) => o.orderNumber.toUpperCase().replace('#', '').trim() === cleanNum || o.id === order.id
          );

          let updatedOrders: Order[];
          if (existingIdx >= 0) {
            updatedOrders = [...state.orders];
            updatedOrders[existingIdx] = { ...updatedOrders[existingIdx], ...order };
          } else {
            updatedOrders = [order, ...state.orders];
          }

          const current =
            state.currentOrder &&
            (state.currentOrder.orderNumber.toUpperCase().replace('#', '').trim() === cleanNum ||
              state.currentOrder.id === order.id)
              ? { ...state.currentOrder, ...order }
              : state.currentOrder;

          return {
            orders: updatedOrders,
            currentOrder: current,
          };
        });
      },

      syncOrders: (newOrders) => {
        if (!Array.isArray(newOrders) || newOrders.length === 0) return;
        set((state) => {
          const orderMap = new Map<string, Order>();
          // Put existing orders first
          state.orders.forEach((o) => {
            const key = o.orderNumber.toUpperCase().replace('#', '').trim();
            orderMap.set(key, o);
          });
          // Merge incoming orders from server (server wins)
          newOrders.forEach((o) => {
            const key = o.orderNumber.toUpperCase().replace('#', '').trim();
            const existing = orderMap.get(key);
            orderMap.set(key, existing ? { ...existing, ...o } : o);
          });

          return {
            orders: Array.from(orderMap.values()),
          };
        });
      },

      setCurrentOrder: (order) => set({ currentOrder: order }),

      getOrderByNumber: (orderNumber) => {
        const clean = orderNumber.toUpperCase().replace('#', '').trim();
        return get().orders.find((o) => o.orderNumber.toUpperCase().replace('#', '').trim() === clean);
      },

      getOrdersByUserId: (userId) => {
        return get().orders.filter((o) => o.userId === userId);
      },

      getNextOrderNumber: () => {
        const count = get().orders.length;
        return `PM${(1001 + count).toString()}`;
      },
    }),
    {
      name: 'paint-meraki-orders',
    }
  )
);

