"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function TabSwitch() {
  const router = useRouter();
  const pathname = usePathname();

  const current = pathname.startsWith("/horoscope") ? "horoscope" : "shopping";

  const [active, setActive] = useState(current);

  useEffect(() => {
    setActive(current);
  }, [current]);

  const handleChange = (tab: "horoscope" | "shopping") => {
    if (tab === active) return;

    setActive(tab);

    setTimeout(() => {
      router.push(`/${tab}`);
    }, 300);
  };

  return (
    <div className="relative flex bg-(--main) p-1 rounded-full w-96">

      <div
        className={`
          absolute 
          left-1 
          top-1 
          bottom-1
          w-[calc(50%-4px)]
          rounded-full
          bg-(--bg)
          transition-transform duration-300 ease-in-out
          ${active === "shopping" ? "translate-x-full" : "translate-x-0"}
        `}
      />

      <button
        onClick={() => handleChange("horoscope")}
        className={`relative z-10 flex-1 py-2 rounded-full cursor-pointer
          ${active === "horoscope"
            ? "text-(--main)"
            : "text-(--bg)"
          }`}
      >
        Horoscope
      </button>

      <button
        onClick={() => handleChange("shopping")}
        className={`relative z-10 flex-1 py-2 rounded-full cursor-pointer
          ${active === "shopping"
            ? "text-(--main)"
            : "text-(--bg)"
          }`}
      >
        Shopping
      </button>
    </div>
  );
}