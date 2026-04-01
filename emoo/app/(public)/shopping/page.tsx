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
    <div className="min-h-screen px-4 md:px-8 lg:px-16 lg:ml-24 pt-6 md:pt-10 pb-20">

      {/* TOP SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-20">

        {/* LEFT SECTION */}
        <div className="w-full lg:w-2/3 flex flex-col items-center">

          <div className="w-full mb-6 flex justify-center">
            <TabSwitch />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">

          <div className="w-full mb-6 flex justify-center">
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
        h-100
        overflow-hidden
        mb-6
        rounded-2xl">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        {products
          .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item: ProductItem) => (
          <div
            key={item.id}
            className="
              w-5/4.5
              h-[400px]
              bg-white
              rounded-2xl
              shadow-[0_2px_20px_rgba(0,0,0,0.06)]
              overflow-hidden
              flex flex-col
              transition-shadow
              hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)]
            ">
          
            {/* Product Image */}
            <Link href={`/shopping/${item.id}`}>
              <div className="relative w-full aspect-[4/3] bg-gray-50">
                <Image
                  src={item.img || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"/>
              </div>
            </Link>

            {/* Content */}
            <div className="px-5 pt-4 pb-5 flex flex-col flex-grow text-[var(--sec)]">
              <Link href={`/shopping/${item.id}`}>   
                <h3 className="text-lg font-bold leading-snug hover:underline line-clamp-2">
                  {item.name}
                </h3>
              </Link>

              <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                {item.details}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-2xl font-bold">{item.price}</span>
                <span className="text-sm text-gray-400">บาท</span>
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
                  flex items-center justify-center gap-2
                  mt-4
                  py-3
                  rounded-full
                  font-bold
                  text-sm
                  cursor-pointer
                  transition-all duration-200
                  hover:opacity-90
                  hover:shadow-lg
                  active:scale-[0.98]
                  bg-[var(--bg)] text-[var(--main)]
                ">
                  <ShoppingCart size={18} />
                  เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

    </div>

    
  );
}