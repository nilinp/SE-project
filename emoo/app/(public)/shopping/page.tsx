"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, color, useAnimation } from "framer-motion";
import Image from "next/image";

import TabSwitch from "@/app/components/tabswitch";
import SearchBar from "@/app/components/searchbar";
import products from "@/app/data/product.json";
import { ShoppingCart } from "lucide-react";

const banner = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg",
  "/banner/banner-4.jpg"
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
    <div className="min-h-screen px-4 lg:px-16 lg:ml-24 pt-10">

      {/* TOP SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-center gap-20">

        {/* LEFT SECTION */}
        <div className="w-full lg:w-2/3 flex flex-col items-center">

          <div className="w-full mb-6 flex justify-center">
            <TabSwitch />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">

          <div className="w-full mb-6 flex justify-center">
            <SearchBar />
          </div>

        </div>
      </div>

      {/* BANNER */}
      <div className="
        relative 
        w-full 
        h-100
        overflow-hidden
        mb-6
        rounded-2xl">
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

      {/* PRODUCT SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {products.product.map((item) => (
          <div
            key={item.id}
            className="
              w-[370px]
              h-[480px]
              p-6
              bg-[white]
              rounded-[30px]
              shadow-[0_0_30px_rgba(0,0,0,0.05)]">
          
            <div className="relative w-full h-[240px] bg-white rounded-2xl overflow-hidden">
              <Image
                src={item.image || "/placeholder.png"}
                alt={item.name}
                fill
                className="object-contain p-6"/>
            </div>

            {/* Content */}
            <div className="mt-5 text-(--sec)">
              <h3 className="text-2xl font-bold leading-tight">
                {item.name}
              </h3>

              {/* รายละเอียด */}
              <p className="text-sm mt-3 text-gray-700">
                {item.details}
              </p>

              {/* ราคา */}
              <div className="flex justify-between items-end mt-3">
                <p className="text-2xl font-bold">
                  {item.price} ฿
                </p>

                <button className="
                w-[45px]
                h-[45px]
                rounded-full
                bg-(--bg)
                text-(--main)
                flex
                justify-center
                items-center
                cursor-pointer">
                  <ShoppingCart className="w-[20px] h-[20px]"/>
                  {/* ปุ่ม + เล็ก */}
                  <span className="text-sm">+</span>
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

    </div>

    
  );
}