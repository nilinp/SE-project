"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, color, useAnimation } from "framer-motion";
import Image from "next/image";

import TabSwitch from "@/app/components/tabswitch";
import SearchBar from "@/app/components/searchbar";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore, CartStore } from "@/lib/cartstore";
import React from "react";
import { supabase } from "@/lib/supabase";
{/* {products.product.map((item) => (
  <Link key={item.id} href={`/shopping/${item.id}`}>
    <div className="card">
      <h3>{item.name}</h3>
      <p>{item.price} ฿</p>
    </div>
  </Link>
))} */}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  img: string;
  details: string;
}

const banner = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg",
  "/banner/banner-4.jpg"
];

export default function Shopping() {
  const controls = useAnimation();
  const [index, setIndex] = useState(0);
  const addToCart = useCartStore((state: CartStore) => state.addToCart);

  const loopImage = [...banner, ...banner];

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*")
          .order("id", { ascending: true });
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(() => {
      controls.start({
        x: `-${(index + 1) * 100}%`,
        transition: { duration: 1.5, ease: "easeInOut" },
      }).then(() => {
        if (!isMounted) return;
        if (index + 1 === banner.length) {
          controls.set({ x: 0 });
          setIndex(0);
        } else {
          setIndex((prev: number) => prev + 1);
        }
      });
    }, 5000); // ค้าง 5 วิ

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [index, controls]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 lg:ml-24 pt-0 pb-32 md:pb-20">

      {/* TOP SECTION (Static & Transparent) */}
      <div className="-mx-4 px-4 pt-6 md:pt-10 pb-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-6 lg:gap-20">

          {/* Switcher */}
          <div className="w-full lg:w-auto flex justify-center">
            <TabSwitch />
          </div>

          {/* Search */}
          <div className="w-full lg:w-1/3 flex justify-center">
            <SearchBar 
              value={searchQuery} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="
        relative 
        w-full 
        h-44 sm:h-64 lg:h-100
        overflow-hidden
        mb-6
        rounded-2xl shadow-lg">
        <motion.div
          className="flex w-full h-full"
          animate={controls}
          initial={{ x: 0 }}>

          {loopImage.map((img, i) => (
            <div key={i} className="relative w-full h-full flex-shrink-0">
              <Image
                src={img}
                alt={`banner-${i}`}
                fill
                className="object-cover" />
              {/* Overlay for better depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* PRODUCT SECTION */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="text-xl font-semibold text-(--sec)">กำลังโหลด...</span>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
        {products
          .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item: ProductItem) => (
          <div
            key={item.id}
            className="
              flex flex-col
              w-full h-full
              bg-white
              rounded-xl sm:rounded-2xl
              shadow-[0_2px_15px_rgba(0,0,0,0.06)]
              overflow-hidden
              transition-shadow
              hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)]
            ">
          
            {/* Product Image */}
            <Link href={`/shopping/${item.id}`}>
              <div className="relative w-full aspect-[1/1] bg-gray-50 flex-shrink-0">
                <Image
                  src={item.img || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"/>
              </div>
            </Link>

            {/* Content */}
            <div className="p-3 sm:px-5 sm:pt-4 sm:pb-5 flex flex-col flex-grow text-[var(--sec)]">
              <Link href={`/shopping/${item.id}`}>   
                <h3 className="text-sm sm:text-lg font-bold leading-tight sm:leading-snug hover:underline line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                  {item.name}
                </h3>
              </Link>

              <p className="text-[10px] sm:text-xs text-gray-400 mt-1 line-clamp-2 min-h-[1.5rem] sm:min-h-[2rem]">
                {item.details}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 sm:gap-2 mt-auto pt-2 sm:pt-4 mb-3 sm:mb-4">
                <span className="text-lg sm:text-2xl font-bold">{item.price}</span>
                <span className="text-[10px] sm:text-sm text-gray-400">บาท</span>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.img || "/placeholder.png",
                    quantity: 1,
                  });
                }}
                className="
                  w-full
                  flex items-center justify-center gap-1 sm:gap-2
                  py-2 sm:py-3
                  rounded-full
                  font-bold
                  text-[10px] sm:text-sm
                  cursor-pointer
                  transition-all duration-200
                  bg-(--bg) 
                  text-(--main)
                  hover:scale-[1.02]
                  active:scale-[0.98]
                ">
                  <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                  <span className="truncate">ใส่ตะกร้า</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

    </div>

    
  );
}