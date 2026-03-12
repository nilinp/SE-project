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

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
      });
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
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
            p-10
            ">
                <h2 className=" text-5xl font-bold text-(--bg)">
                    CREATE ACCOUNT
                </h2>
                <p className="text-(--bg) text-center mt-3">
                    Create your account to start your fortune journey
                </p>
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
            placeholder="Name"
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
                placeholder="Email"
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="
                w-1/2 
                mb-6 
                px-4 
                py-3 
                rounded-lg 
                bg-gray-300 
                outline-none text-(--bg)
                disabled:opacity-50"
            />

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
                items-center"
            >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign up"
                )}
            </button>

            <p className="text-sm mt-6 text-(--bg) text-[16px]">
                Already have an account?{" "}
                <Link href="/login" className="font-bold hover:underline">
                    Login
                </Link>
            </p>

        </div>
    </div>
  );
}