import { create } from "zustand";
import { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  cartPosition: { x: number; y: number } | null;
  setCartPosition: (pos: { x: number; y: number }) => void;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartPosition: null,
  setCartPosition: (pos) => set({ cartPosition: pos }),
  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { ...product, quantity }],
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalAmount: () => {
    const state = get();
    return state.items.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  },

  getTotalItems: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
