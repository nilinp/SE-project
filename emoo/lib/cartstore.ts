import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

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
  clearCart: () => void;
  removeItems: (ids: string[]) => void;
  loadCart: () => Promise<void>;
  _syncToDb: () => Promise<void>;
};

const syncCartToDb = async (cart: CartItem[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from("carts")
      .upsert({ user_id: session.user.id, items: cart, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch (err) {
    console.error("[Cart] Sync exception:", err);
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      loadCart: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const { data, error } = await supabase
            .from("carts")
            .select("items")
            .eq("user_id", session.user.id)
            .single();
          
          if (error && error.code !== "PGRST116") return;
          if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
            // Merge with local cart gracefully
            const localCart = get().cart;
            if (localCart.length > 0) {
              const merged = [...localCart];
              data.items.forEach((item: any) => {
                const existingIndex = merged.findIndex(i => i.id === item.id);
                if (existingIndex >= 0) {
                  merged[existingIndex].quantity = Math.max(merged[existingIndex].quantity, item.quantity);
                } else {
                  merged.push(item);
                }
              });
              set({ cart: merged });
              syncCartToDb(merged);
            } else {
              set({ cart: data.items as CartItem[] });
            }
          } else {
            // DB empty, try to sync local to DB
            if (get().cart.length > 0) syncCartToDb(get().cart);
          }
        } catch (err) {}
      },
      _syncToDb: async () => await syncCartToDb(get().cart),
      addToCart: (item) => {
        set((state) => {
          const exist = state.cart.find((p) => p.id === item.id);
          if (exist) return { cart: state.cart.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p) };
          return { cart: [...state.cart, item] };
        });
        setTimeout(() => syncCartToDb(get().cart), 0);
      },
      increase: (id) => {
        set((state) => ({ cart: state.cart.map((p) => p.id === id ? { ...p, quantity: p.quantity + 1 } : p) }));
        setTimeout(() => syncCartToDb(get().cart), 0);
      },
      decrease: (id) => {
        set((state) => ({ cart: state.cart.map((p) => p.id === id ? { ...p, quantity: p.quantity - 1 } : p) }));
        setTimeout(() => syncCartToDb(get().cart), 0);
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({ cart: state.cart.map((p) => p.id === id ? { ...p, quantity } : p) }));
        setTimeout(() => syncCartToDb(get().cart), 0);
      },
      remove: (id) => {
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
        setTimeout(() => syncCartToDb(get().cart), 0);
      },
      clearCart: () => {
        set({ cart: [] });
        setTimeout(() => syncCartToDb([]), 0);
      },
      removeItems: (ids) => {
        set((state) => ({ cart: state.cart.filter((item) => !ids.includes(item.id)) }));
        setTimeout(() => syncCartToDb(get().cart), 0);
      },
    }),
    { name: "cart-storage" }
  )
);
