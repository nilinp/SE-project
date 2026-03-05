"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Home, ShoppingCart, Bell, Store } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cartstore";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          
          <Link href="/shopping">
            <Store
            size={28}
            className="cursor-pointer hover:text-(--main) transition" />
          </Link>
          
          <Link href="/cart">
            <div className="relative">
              <ShoppingCart 
              size={28}
              className="cursor-pointer hover:text-(--main) transition" />

              <AnimatePresence>
                {totalItems > 0 && (
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
                  rounded-full 
                  w-5 h-5 
                  flex 
                  items-center 
                  justify-center">
                  {totalItems}
                </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </div>
      </div>

      <div className="
        flex 
        flex-col 
        items-center 
        gap-6 
        relative" ref={menuRef}>
        <Bell className="text-white cursor-pointer hover:text-(--main) transition" />
        <div
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <Image
            src="/icon.png" /*รอดาต้าเบส*/
            alt="profile"
            width={40}
            height={40}
            className="object-cover"
          />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
            absolute 
            bottom-16 
            -right-30 
            w-40 
            bg-(--bg2)
            text-white 
            rounded-xl
            shadow-lg
            p-3 
            flex 
            flex-col 
            gap-2">

            <Link href="/login" className="
              block
              text-left 
              px-3 
              py-2 
              bg-(--bg2)
              rounded 
              hover:bg-(--main) 
              hover:text-(--bg)
              transition duration-200">
              Login
            </Link>
          </motion.div>

            /* <button className="
              text-left 
              px-3 py-2 
              rounded 
              hover:bg-(--main)
              transition 
              text-red-400">
                Logout
              </button> */

          
        )}
      </AnimatePresence>
      </div>
    </aside>
  );
}