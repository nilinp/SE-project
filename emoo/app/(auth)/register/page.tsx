"use client";

import Link from "next/link";
import Image from "next/image";

export default function Register() {
  return (
    <div className="
    min-h-screen 
    w-screen 
    flex
    bg-[url('/register-bg.jpg')] 
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
                <h2 className="
                text-5xl 
                font-bold 
                text-(--bg)">
                    CREATE ACCOUNT
                </h2>
                <p className="text-(--bg) text-center mt-3">
                    Create your account to start your fortune journey
                </p>
            </div>
            
            <div className="flex gap-10 mb-6 text-(--bg)">
                <button className="hover:scale-110 transition">
                <Image src="/google.png" alt="google" width={30} height={30}/>
                </button>
                <button className="hover:scale-110 transition">
                <Image src="/facebook.svg" alt="facebook" width={30} height={30}/>
                </button>
                <button className="hover:scale-110 transition">
                <Image src="/linkedin.png" alt="linkedin" width={30} height={30}/>
                </button>
            </div>

            <input
            placeholder="Name"
            className="
            w-1/2 
            mb-5 
            px-4 
            py-3 
            rounded-lg 
            bg-gray-300 
            outline-none 
            text-(--bg)"
            />

            <input
                type="email"
                placeholder="Email"
                className="
                w-1/2 
                mb-5 
                px-4 
                py-3 
                rounded-lg 
                bg-gray-300 
                outline-none 
                text-(--bg)"
            />

            <input
                type="password"
                placeholder="Password"
                className="
                w-1/2 
                mb-6 
                px-4 
                py-3 
                rounded-lg 
                bg-gray-300 
                outline-none text-(--bg)"
            />

            <button className="
            w-1/2 
            py-3 
            rounded-full 
            bg-(--bg) 
            text-white 
            font-semibold 
            hover:opacity-90 
            transition">
                Sign up
            </button>

        </div>
    </div>
  );
}