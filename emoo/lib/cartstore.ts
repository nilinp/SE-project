import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type CartStore = {
  remove: (id: string) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],

  addToCart: (item: CartItem) =>
    set((state: CartStore) => {
      const exist = state.cart.find((p: CartItem) => p.id === item.id);

      if (exist) {
        return {
          cart: state.cart.map((p: CartItem) =>
            p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
          ),
        };
      }

      return {
        cart: [...state.cart, item],
      };
    }),

  increase: (id: string) =>
    set((state: CartStore) => ({
      cart: state.cart.map((p: CartItem) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      ),
    })),

  decrease: (id: string) =>
    set((state: CartStore) => ({
      cart: state.cart.map((p: CartItem) =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      ),
    })),

  updateQuantity: (id: string, quantity: number) =>
    set((state: CartStore) => ({
      cart: state.cart.map((p: CartItem) =>
        p.id === id ? { ...p, quantity } : p
      ),
    })),

  remove: (id: string) =>
    set((state: CartStore) => ({
      cart: state.cart.filter((item: CartItem) => item.id !== id),
    })),
}));