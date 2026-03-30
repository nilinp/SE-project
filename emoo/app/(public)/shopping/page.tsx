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
    <div className="min-h-screen px-4 lg:px-16 lg:ml-24 pt-10">

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {products
          .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item: ProductItem) => (
          <div
            key={item.id}
            className="
              w-[370px]
              h-[480px]
              p-6
              bg-[white]
              rounded-[30px]
              shadow-[0_0_30px_rgba(0,0,0,0.05)]
              flex flex-col">
          
            <div className="relative w-full h-[300px] bg-white rounded-2xl overflow-hidden">
              <Image
                src={item.img || "/placeholder.png"}
                alt={item.name}
                fill
                className="object-contain p-6"/>
            </div>

            {/* Content */}
            <div className="mt-5 text-(--sec) flex flex-col flex-grow">
              <Link href={`/shopping/${item.id}`}>   
                <h3 className="text-2xl font-bold leading-tight min-h-[56px] hover:underline">
                  {item.name}
                </h3>
              </Link>

              {/* รายละเอียด */}
              <p className="text-sm mt-3 text-gray-700 min-h-[60px]">
                {item.details}
              </p>

              {/* ราคา */}
              <div className="flex justify-between items-end mt-auto">
                <p className="text-2xl font-bold">
                  {item.price} ฿
                </p>

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
                  w-[45px]
                  h-[45px]
                  rounded-full
                  flex
                  justify-center
                  items-center
                  cursor-pointer
                  transition-colors
                  bg-(--bg) text-(--main)
                  ">
                    <ShoppingCart className="w-[20px] h-[20px]"/>
                  {/* ปุ่ม + เล็ก */}
                  <span className="text-sm">+</span>
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
      )}

    </div>

    
  );
}