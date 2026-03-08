"use client";

import Image from "next/image";
import { Home, History, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <Image src="/icon.png" alt="logo" width={50} height={50} />

        <div className="flex flex-col gap-10 text-white">
          <Link href="/admin">
            <Home className={`cursor-pointer transition ${pathname === "/admin" ? "text-(--main)" : "hover:text-(--main)"}`} />
          </Link>
          <Link href="/admin/profile">
            <History className={`cursor-pointer transition ${pathname.startsWith("/admin/profile") ? "text-(--main)" : "hover:text-(--main)"}`} />
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 relative" ref={menuRef}>
        <Bell className="text-white cursor-pointer hover:text-(--main) transition" />
        <div
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <Image src="/icon.png" alt="profile" width={40} height={40} className="object-cover" />
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
                bg-(--bg-dark)
                text-white 
                rounded-xl
                shadow-lg
                p-3 
                flex 
                flex-col 
                gap-2">
              <Link href="/admin/profile" className="
                block
                text-left 
                px-3 
                py-2 
                rounded 
                hover:bg-(--main) 
                hover:text-(--bg)
                transition duration-200">
                Profile
              </Link>
              <Link href="/login" className="
                block
                text-left 
                px-3 
                py-2 
                rounded 
                hover:bg-(--main) 
                hover:text-(--bg)
                transition duration-200">
                Logout
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}