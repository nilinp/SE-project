"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
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
              "Sign in"
            )}
          </button>

          <p className="text-sm mt-3 text-(--bg) text-[16px]">
            Don’t have an account?{" "}
            <Link href="/register" className="
            font-bold
            hover:underline
            cursor-pointer
            ">
              Register
            </Link> 
          </p>
        </div>
      </div>

  );
}