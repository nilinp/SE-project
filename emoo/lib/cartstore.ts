import { create } from "zustand";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartStore = {
  remove: any;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],

  addToCart: (item) =>
    set((state) => {
      const exist = state.cart.find((p) => p.id === item.id);

      if (exist) {
        return {
          cart: state.cart.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
          ),
        };
      }

      return {
        cart: [...state.cart, item],
      };
    }),

  increase: (id) =>
    set((state) => ({
      cart: state.cart.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      ),
    })),

  decrease: (id) =>
    set((state) => ({
      cart: state.cart.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      ),
    })),
    remove: (id: string) =>
      set((state) => ({
        cart: state.cart.filter((item) => item.id !== id),
      })),
}));