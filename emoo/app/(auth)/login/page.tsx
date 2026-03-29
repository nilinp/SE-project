"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
      router.push("/admin");
      return;
    }

    setLoading(true);

    // ─── Look up email from profiles table via username ───
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .single();

    if (profileError || !profileData) {
      setError("ไม่พบชื่อผู้ใช้นี้ในระบบ");
      setLoading(false);
      return;
    }

    // ─── Get email from auth.users via user id ───
    // We need the email associated with this profile id.
    // Since profiles.id = auth.users.id, we sign in via the email stored in session.
    // Strategy: try signing in with a dummy email placeholder — instead we look up via RPC or use stored email.
    // Best approach: store email in profiles table during register.
    const { data: emailData, error: emailError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", username.trim())
      .single();

    if (emailError || !emailData?.email) {
      setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: emailData.email,
      password,
    });

    if (loginError) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
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
        
        <div className="
        w-1/2
        min-h-screen
        flex 
        items-center
        justify-center">
          <div className="text-white text-center ">
            <h1 className="
            text-6xl 
            font-bold 
            [text-shadow:0_0_10px_rgb(29,25,43),0_0_25px_rgb(29,25,43)]">
              WELCOME!
            </h1>
            <p className="
            mt-2.5 
            text-2xl 
            [text-shadow:0_0_10px_rgb(29,25,43),0_0_25px_rgb(29,25,43)]">
              Continue your fortune journey
            </p>
          </div>
        </div>

        <div className="
        w-1/2 
        min-h-screen
        bg-white 
        flex 
        flex-col
        justify-center 
        items-center 
        rounded-tl-4xl
        rounded-bl-4xl
        ">
          <div className="
          bg-white
          p-10
          ">
            <h2 className="text-5xl font-bold text-(--bg)">
            LOGIN
            </h2>
          </div>
          
          <div className="flex gap-10 mb-6 text-(--bg)">
            <button className="hover:scale-110 transition">
              <Image src="/icon/google.png" alt="google" width={30} height={30}/>
            </button>
            <button className="hover:scale-110 transition">
              <Image src="/icon/facebook.svg" alt="facebook" width={30} height={30}/>
            </button>
            <button className="hover:scale-110 transition">
              <Image src="/icon/linkedin.png" alt="linkedin" width={30} height={30}/>
            </button>
          </div>

          {error && (
            <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded w-1/2 text-center border border-red-200">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="ชื่อผู้ใช้ (Username)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="
            w-1/2 
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
            placeholder="รหัสผ่าน (Password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="
            w-1/2 
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
            w-1/2 
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
            items-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>

          <p className="text-sm mt-3 text-(--bg) text-[16px]">
            ยังไม่มีบัญชี?{" "}
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