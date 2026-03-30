"use client";

import Image from "next/image";
import { Home, Store, LogOut } from "lucide-react";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_username");
    router.push("/login");
  };

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
      shadow-lg
      z-50">

      <div className="flex flex-col items-center gap-10">

        <Image
          src="/icon.png"
          alt="logo"
          width={50}
          height={50} />

        <div className="flex flex-col gap-10 text-white">
          <Link href="/admin">
            <Home 
            size={28}
            className={`cursor-pointer transition ${pathname === "/admin" ? "text-(--main)" : "hover:text-(--main)"}`} />
          </Link>
          
          <Link href="/admin/shopping">
            <Store
            size={28}
            className={`cursor-pointer transition ${pathname.startsWith("/admin/shopping") ? "text-(--main)" : "hover:text-(--main)"}`} />
          </Link>
        </div>
      </div>

      {/* Logout button at bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center text-white/50 hover:text-red-400 transition-colors duration-200 cursor-pointer"
        title="ออกจากระบบ"
      >
        <LogOut size={28} />
      </button>
    </aside>
  );
}