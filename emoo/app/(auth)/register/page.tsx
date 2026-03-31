"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!email || !password || !username) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      setError("ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาเลือกชื่ออื่น");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered") || signUpError.status === 422) {
        setError("อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น");
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    // บันทึก email ลง profiles เพื่อให้ login ด้วย username ได้
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ email })
        .eq("id", data.user.id);
    }

    alert("สมัครสมาชิกสำเร็จ");
    router.push("/login");
  };

  return (
    <div className="
    min-h-screen 
    w-screen 
    flex
    bg-[url('/bg/register-bg.jpg')] 
    bg-cover 
    bg-center ">
        
        <div className="
            w-2/3
            min-h-screen
            bg-white 
            flex 
            flex-col
            justify-center 
            items-center 
            rounded-tr-4xl
            rounded-br-4xl
            ">
            <div className="
            bg-white
            pt-4 pb-2 px-10
            flex flex-col items-center
            ">
              <Image
                src="/icon.png"
                alt="logo"
                width={150}
                height={150}
                className="mb-2"
              />
              <h2 className="text-5xl font-bold text-(--bg) text-center">
                    สมัครสมาชิก
                </h2>
                <p className="
                text-(--bg) 
                text-center 
                mt-3">
                    สร้างบัญชีของคุณวันนี้ เพื่อเริ่มต้นเส้นทางแห่งโชคชะตาไปกับเรา
                </p>
            </div>
            
            {error && (
                <p className="text-red-500 mb-2 text-sm bg-red-50 p-2 rounded w-1/2 text-center border border-red-200">
                    {error}
                </p>
            )}

            <input
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
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
                type="email"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="
                w-1/2 
                mb-1 
                px-4 
                py-3 
                rounded-lg 
                bg-gray-300 
                outline-none text-(--bg)
                disabled:opacity-50"
            />
            <p className="text-xs text-red-400 w-1/2 mb-3 ml-1">*ต้องมีอย่างน้อย 8 ตัว</p>

            <button 
                onClick={handleRegister} 
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
                disabled:opacity-50
                flex
                justify-center
                items-center
                cursor-pointer"
            >
                {loading ? (
                  <div className="
                  w-6 
                  h-6 
                  border-2 
                  border-white 
                  border-t-transparent 
                  rounded-full 
                  animate-spin"></div>
                ) : (
                  "สมัครสมาชิก"
                )}
            </button>

            <p className="text-sm mt-6 text-(--bg) text-[16px]">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/login" className="font-bold hover:underline cursor-pointer">
                    เข้าสู่ระบบ
                </Link>
            </p>

        </div>
    </div>
  );
}