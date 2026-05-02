import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string, name: string, price: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (productId, name, price, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === productId);
      const items = existing
        ? state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...state.items, { productId, name, price, quantity }];
      return { items };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  clearCart: () => set({ items: [] }),

  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
