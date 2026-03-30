"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Home, ShoppingCart, Bell, Store } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cartstore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
  };

  const items = useCartStore((state) => state.cart);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity, 0);
  return (
    <aside className=" 
      hidden 
      md:flex 
      fixed
      top-0
      left-0
      w-20
      h-screen
      bg-(--bg) 
      flex-col 
      items-center 
      justify-between 
      py-6 
      shadow-lg">

      <div className="flex flex-col items-center gap-10">

        <Image
          src="/icon.png"
          alt="logo"
          width={50}
          height={50} />

        <div className="flex flex-col gap-10 text-white">
          <Link href="/">
            <Home 
            size={28}
            className="cursor-pointer hover:text-(--main) transition" />
          </Link>
          
          <button
            onClick={() => user ? router.push("/shopping") : router.push("/login")}
            title={user ? "ร้านค้า" : "กรุณาเข้าสู่ระบบก่อนใช้งานร้านค้า"}
          >
            <Store
            size={28}
            className={`cursor-pointer hover:text-(--main) transition ${!user ? "opacity-40" : ""}`} />
          </button>
          
          <button
            onClick={() => user ? router.push("/cart") : router.push("/login")}
            title={user ? "ตะกร้า" : "กรุณาเข้าสู่ระบบก่อนใช้งานตะกร้า"}
          >
            <div className="relative">
              <ShoppingCart 
              size={28}
              className={`cursor-pointer hover:text-(--main) transition ${!user ? "opacity-40" : ""}`} />

              <AnimatePresence>
                {user && totalItems > 0 && (
                <motion.span 
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="
                  absolute 
                  -top-2 
                  -right-2 
                  bg-red-500 
                  text-white 
                  text-xs
                  rounded-full 
                  min-w-[20px] 
                  h-[20px] 
                  px-1
                  flex 
                  items-center 
                  justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </motion.span>
                )}
              </AnimatePresence>
            </div>
          </button>
        </div>
      </div>  
    </aside>
  );
}