"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Home, ShoppingCart, Bell, Store, ShoppingBag, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cartstore";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const navItems = [
    { href: "/", icon: Home, label: "หน้าหลัก" },
    { 
      href: user ? "/cart" : "/login", 
      icon: ShoppingCart, 
      label: "ตะกร้า",
      badge: user && totalItems > 0 ? totalItems : null,
      disabled: !user,
    },
    { href: "/shopping", icon: Store, label: "ร้านค้า" },
    { href: "/history", icon: Clock, label: "ประวัติ" },
  ];

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
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
        shadow-lg
        z-40">

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

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-(--bg) border-t border-white/10 z-40 safe-pb">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <Home size={24} className={`transition ${pathname === "/" ? "text-(--main)" : "text-white/60"}`} />
            <span className={`text-[10px] ${pathname === "/" ? "text-(--main)" : "text-white/60"}`}>หน้าหลัก</span>
          </Link>

          {/* Shopping */}
          <Link href="/shopping" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <Store size={24} className={`transition ${pathname.startsWith("/shopping") ? "text-(--main)" : "text-white/60"}`} />
            <span className={`text-[10px] ${pathname.startsWith("/shopping") ? "text-(--main)" : "text-white/60"}`}>ร้านค้า</span>
          </Link>

          {/* Cart */}
          <button
            onClick={() => user ? router.push("/cart") : router.push("/login")}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <div className="relative">
              <ShoppingCart 
                size={24} 
                className={`transition ${pathname === "/cart" ? "text-(--main)" : !user ? "text-white/30" : "text-white/60"}`} 
              />
              <AnimatePresence>
                {user && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className={`text-[10px] ${pathname === "/cart" ? "text-(--main)" : !user ? "text-white/30" : "text-white/60"}`}>ตะกร้า</span>
          </button>

          {/* History */}
          <Link href="/history" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <Clock size={24} className={`transition ${pathname === "/history" ? "text-(--main)" : "text-white/60"}`} />
            <span className={`text-[10px] ${pathname === "/history" ? "text-(--main)" : "text-white/60"}`}>ประวัติ</span>
          </Link>

          {/* Profile / Login */}
          <button
            onClick={() => user ? router.push("/horoscope") : router.push("/login")}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <div className={`w-6 h-6 rounded-full bg-(--main)/30 flex items-center justify-center text-xs font-bold ${pathname === "/horoscope" ? "text-(--main)" : "text-white/60"}`}>
              {user ? user.email?.[0]?.toUpperCase() ?? "U" : "👤"}
            </div>
            <span className={`text-[10px] ${pathname === "/horoscope" ? "text-(--main)" : "text-white/60"}`}>
              {user ? "โปรไฟล์" : "เข้าสู่ระบบ"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}