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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async (sessionUser: User | null) => {
      setUser(sessionUser);
      if (sessionUser) {
        const { data } = await supabase.from("profiles").select("avatar_url, username").eq("id", sessionUser.id).single();
        if (data) {
          setUsername(data.username);
          if (data.avatar_url) {
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.avatar_url);
            setAvatarUrl(urlData.publicUrl + `?t=${Date.now()}`);
          } else {
            setAvatarUrl(null);
          }
        }
      } else {
        setAvatarUrl(null);
        setUsername(null);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
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
      fixed
      z-50
      
      /* Mobile: Bottom Bar */
      bottom-0
      left-0
      w-full
      h-16
      flex-row
      justify-around
      py-2
      border-t border-white/5
      
      /* Desktop: Left Sidebar */
      md:top-0
      md:bottom-auto
      md:w-20
      md:h-screen
      md:flex-col
      md:justify-between
      md:py-6
      md:border-t-0
      md:border-r
      
      bg-(--bg)
      flex 
      items-center 
      shadow-[0_-8px_30px_rgba(0,0,0,0.3)] md:shadow-lg">

      <div className="flex md:flex-col flex-row items-center justify-around md:justify-start w-full md:gap-10 md:h-auto">
        
        {/* LOGO: Hidden on mobile, visible on desktop at top */}
        <div className="hidden md:block">
          <Image src="/icon.png" alt="logo" width={50} height={50} />
        </div>

        <div className="flex md:flex-col flex-row items-center justify-around w-full md:gap-10 text-white/50">
          
          <Link href="/" className="flex flex-col items-center gap-1 group">
            <Home size={26} className="
            cursor-pointer group-hover:text-(--main) text-white transition" />
            <span className="text-[10px] md:hidden font-medium text-white group-hover:text-(--main)">หน้าหลัก</span>
          </Link>
          
          <button
            onClick={() => user ? router.push("/cart") : router.push("/login")}
            title={user ? "ตะกร้า" : "กรุณาเข้าสู่ระบบก่อนใช้งานตะกร้า"}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="relative">
              <ShoppingCart size={26} className={`
                cursor-pointer 
                group-hover:text-(--main) 
                transition 
                ${!user ? "opacity-40" : "text-white"}`} />
              <AnimatePresence>
                {user && totalItems > 0 && (
                <motion.span 
                  key={totalItems}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border border-[#151226]">
                  {totalItems > 99 ? "99+" : totalItems}
                </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="
            text-[10px] 
            md:hidden 
            font-medium 
            text-white 
            group-hover:text-(--main)">ตะกร้า</span>
          </button>

          {/* PROFILE ICON */}
          <button
            onClick={() => router.push(user ? "/profile" : "/login")}
            className="flex flex-col items-center gap-1 group md:hidden"
          >
            <div className="w-[26px] h-[26px] rounded-full overflow-hidden border-2 border-white/20 group-hover:border-(--main) transition bg-gradient-to-br from-[#4B415E] to-[#28223C] flex items-center justify-center">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="avatar" width={32} height={32} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="font-bold text-[10px] text-white select-none">
                  {username ? username[0].toUpperCase() : (user ? "U" : "?")}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-white group-hover:text-(--main)">โปรไฟล์</span>
          </button>
          
        </div>
      </div>  
    </aside>
  );
}