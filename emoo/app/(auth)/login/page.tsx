"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cartstore";

const ADMIN_USERNAME = "adminlnwza";
const ADMIN_PASSWORD = "123321789";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // ─── Admin shortcut ───
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Save admin username in localStorage for profile display
      localStorage.setItem("admin_username", ADMIN_USERNAME);

      // Record login history
      try {
        await supabase.from("admin_login_history").insert({
          username: ADMIN_USERNAME,
          email: "admin@emoo.app",
          ip_address: "local",
          user_agent: navigator.userAgent,
        });
      } catch (e) {
        console.warn("Could not record admin login:", e);
      }

      router.push("/admin");
      return;
    }

    setLoading(true);

    // ─── Look up email from profiles table via username ───
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("username", username.trim())
      .single();

    if (profileError || !profileData || !profileData.email) {
      console.error("Profile lookup error:", profileError);
      setError("ไม่พบชื่อผู้ใช้นี้ในระบบ (ตรวจสอบว่าได้รันโค้ด SQL เปิด RLS ให้ profiles อ่านได้หรือยัง)");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profileData.email,
      password,
    });

    if (loginError) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      // โหลดตะกร้าจาก DB
      await useCartStore.getState().loadCart();
      router.push("/horoscope");
    }
  };

  return (
    <div className="
    min-h-screen 
    w-screen 
    flex
    bg-[url('/bg/login-bg.jpg')] 
    bg-cover 
    bg-center ">
        
        {/* Left panel - hidden on mobile */}
        <div className="
        hidden md:flex
        w-1/2
        min-h-screen
        items-center
        justify-center">
          <div className="text-white text-center ">
            <h1 className="
            text-6xl 
            font-bold 
            [text-shadow:0_0_10px_rgb(29,25,43),0_0_25px_rgb(29,25,43)]">
              ยินดีต้อนรับ!
            </h1>
            <p className="
            mt-2.5 
            text-2xl 
            [text-shadow:0_0_10px_rgb(29,25,43),0_0_25px_rgb(29,25,43)]">
              เริ่มต้นเส้นทางแห่งโชคชะตาไปกับเรา
            </p>
          </div>
        </div>

        <div className="
        w-full md:w-1/2
        min-h-screen
        bg-white 
        flex 
        flex-col
        justify-center 
        items-center 
        md:rounded-tl-4xl
        md:rounded-bl-4xl
        ">
          <div className="
          bg-white
          p-8 md:p-10
          flex flex-col items-center
          w-full max-w-sm
          ">
            <Image
              src="/icon.png"
              alt="logo"
              width={120}
              height={120}
              className="mb-2"
            />
            <h2 className="text-4xl md:text-5xl font-bold text-(--bg)">
              เข้าสู่ระบบ
            </h2>
          </div>

          {error && (
            <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded w-4/5 md:w-1/2 text-center border border-red-200">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="
            w-4/5 md:w-1/2
            mb-5 
            px-4 
            py-3 
            rounded-lg 
            bg-gray-300 
            outline-none 
            text-(--bg)
            disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="
            w-4/5 md:w-1/2
            mb-5 
            px-4 
            py-3 
            rounded-lg 
            bg-gray-300 
            outline-none 
            text-(--bg)
            disabled:opacity-50"
          />

          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="
            w-4/5 md:w-1/2
            py-3 
            rounded-full 
            bg-(--bg) 
            text-white 
            font-semibold 
            hover:opacity-90 
            transition
            mb-3
            disabled:opacity-50
            flex
            justify-center
            items-center
            cursor-pointer"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>

          <p className="text-sm mt-3 text-(--bg) text-[16px]">
            ยังไม่ได้เป็นสมาชิก?{" "}
            <Link href="/register" className="
            font-bold
            hover:underline
            cursor-pointer
            ">
              สมัครสมาชิก
            </Link> 
          </p>
        </div>
      </div>

  );
}