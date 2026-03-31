"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/cartstore";

export default function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // โหลดตะกร้าเมื่อ user login อยู่แล้ว
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        useCartStore.getState().loadCart();
      }
    });

    // โหลดตะกร้าเมื่อ auth state เปลี่ยน (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        useCartStore.getState().loadCart();
      } else if (event === "SIGNED_OUT") {
        useCartStore.setState({ cart: [] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
