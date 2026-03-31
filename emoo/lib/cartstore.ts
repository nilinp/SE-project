import { create } from "zustand";
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

// Helper: sync cart to Supabase
const syncCartToDb = async (cart: CartItem[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("[Cart] No session, skip sync");
      return;
    }

    const { error } = await supabase
      .from("carts")
      .upsert({
        user_id: session.user.id,
        items: cart,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      console.error("[Cart] Sync error:", error);
    } else {
      console.log("[Cart] Synced", cart.length, "items to DB");
    }
  } catch (err) {
    console.error("[Cart] Sync exception:", err);
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],

  // โหลดตะกร้าจาก DB ตอน login
  loadCart: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("[Cart] loadCart: No session");
        return;
      }
      console.log("[Cart] loadCart: user_id =", session.user.id);

      const { data, error } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", session.user.id)
        .single();

      console.log("[Cart] loadCart result:", { data, error });

      if (error && error.code !== "PGRST116") {
        console.error("[Cart] loadCart error:", error);
        return;
      }

      if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
        console.log("[Cart] loadCart: loaded", data.items.length, "items");
        set({ cart: data.items as CartItem[] });
      } else {
        console.log("[Cart] loadCart: no items in DB");
      }
    } catch (err) {
      console.error("[Cart] loadCart exception:", err);
    }
  },

  _syncToDb: async () => {
    await syncCartToDb(get().cart);
  },

  addToCart: (item: CartItem) => {
    set((state: CartStore) => {
      const exist = state.cart.find((p: CartItem) => p.id === item.id);
      if (exist) {
        return {
          cart: state.cart.map((p: CartItem) =>
            p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
          ),
        };
      }
      return { cart: [...state.cart, item] };
    });
    // sync หลัง state update
    setTimeout(() => syncCartToDb(get().cart), 0);
  },

  increase: (id: string) => {
    set((state: CartStore) => ({
      cart: state.cart.map((p: CartItem) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      ),
    }));
    setTimeout(() => syncCartToDb(get().cart), 0);
  },

  decrease: (id: string) => {
    set((state: CartStore) => ({
      cart: state.cart.map((p: CartItem) =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      ),
    }));
    setTimeout(() => syncCartToDb(get().cart), 0);
  },

  updateQuantity: (id: string, quantity: number) => {
    set((state: CartStore) => ({
      cart: state.cart.map((p: CartItem) =>
        p.id === id ? { ...p, quantity } : p
      ),
    }));
    setTimeout(() => syncCartToDb(get().cart), 0);
  },

  remove: (id: string) => {
    set((state: CartStore) => ({
      cart: state.cart.filter((item: CartItem) => item.id !== id),
    }));
    setTimeout(() => syncCartToDb(get().cart), 0);
  },

  clearCart: () => {
    set({ cart: [] });
    setTimeout(() => syncCartToDb([]), 0);
  },

  removeItems: (ids: string[]) => {
    set((state: CartStore) => ({
      cart: state.cart.filter((item: CartItem) => !ids.includes(item.id)),
    }));
    setTimeout(() => syncCartToDb(get().cart), 0);
  },
}));