"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, color, useAnimation } from "framer-motion";
import Image from "next/image";

import TabSwitch from "@/app/components/tabswitch";
import SearchBar from "@/app/components/searchbar";

const banner = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg"
];

export default function Shopping() {
  const controls = useAnimation();
  const [index, setIndex] = useState(0);

  const loopImage = [...banner, ...banner];

  // animation banner
  useEffect(() => {
    const timeout = setTimeout(() => {
    controls.start({
      x: `-${(index + 1) * 100}%`,
      transition: { duration: 1.5, ease: "easeInOut" },
    }).then(() => {
      if (index + 1 === banner.length) {
        controls.set({ x: 0 });
        setIndex(0);
      } else {
        setIndex((prev) => prev + 1);
      }
    });
  }, 5000); // ค้าง 5 วิ

  return () => clearTimeout(timeout);
}, [index, controls]);

  return (
    <div className="
    min-h-screen 
    flex 
    flex-col 
    lg:flex-row 
    lg:items-start
    justify-center
    px-4
    lg:px-16
    lg:ml-24
    pt-10
    gap-20">

      {/* LEFT SECTION */}
      <div className="w-full lg:w-2/3 flex flex-col items-center">

        <div className="w-full mb-10 flex justify-center">
          <TabSwitch />
        </div>

        {/* BANNER */}
        <div className="
        relative 
        w-full 
        h-64
        overflow-hidden
        mb-10
        rounded-2xl
        ">
          <motion.div
            className="flex w-full h-full"
            animate={controls}
            initial={{ x:0 }}>
          
              {loopImage.map((img, i) => (
                <div key={i} className="relative w-full h-full flex-shrink-0">
                  <Image 
                  src={img} 
                  alt={`banner-${i}`}
                  fill
                  className="object-cover"/>
                </div>
              ))}
          </motion.div>

        </div>

      </div>

        {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/2 flex flex-col items-center">

          <div className="w-full mb-10 flex justify-center">
            <SearchBar />
          </div>

      </div>
    </div>
  );
}