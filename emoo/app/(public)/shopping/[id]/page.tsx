"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cartstore";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  img: string;
  details: string;
}


export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = use(params);

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const triggerAlert = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="min-h-screen px-4 lg:px-16 lg:ml-24 pt-10 bg-(white) text-(--sec) relative">
      
      {/* Validation Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl font-semibold border border-red-400"
          >
            กรุณากรอกข้อมูลให้ถูกต้อง
          </motion.div>
        )}
      </AnimatePresence>

      <Link href="/shopping">← Back</Link>

      <div className="flex gap-20 mt-10 justify-center">

        {loading ? (
          <div className="flex justify-center items-center py-20 w-full h-[450px]">
            <span className="text-xl font-semibold text-(--sec)">กำลังโหลด...</span>
          </div>
        ) : !product ? (
          <div className="flex justify-center items-center py-20 w-full h-[450px]">
             <span className="text-xl font-semibold text-(--sec)">ไม่พบสินค้า</span>
          </div>
        ) : (
        <>
        <div className="w-[700px] h-[450px] relative">
          <Image
            src={product.img || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-contain rounded-2xl"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl mt-4">{product.price}฿</p>
          <p className="mt-4">{product.details}</p>
          <p className="mt-4 text-gray-500"> {/*คลัง:*/}</p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() =>
                setQuantity(quantity > 1 ? quantity - 1 : 1)
              }
              className="
                px-4 py-2 
                bg-gray-300
                flex 
                items-center justify-center 
                rounded-full 
                hover:bg-gray-200 
                transition-colors
                cursor-pointer"
            >
              -
            </button>

            <input
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val === "" || val === "0") {
                  setQuantity(0);
                  return;
                }
                const num = parseInt(val, 10);
                if (!isNaN(num) && num > 0) {
                  setQuantity(num);
                }
              }}
              onBlur={() => {
                if (quantity <= 0) {
                  setQuantity(1);
                  triggerAlert();
                }
              }}
              className="
                w-12 
                text-center 
                bg-gray-100/80 
                rounded-md 
                py-1 
                font-medium 
                hover:bg-gray-200 
                focus:bg-white 
                focus:ring-1 
                focus:ring-(--bg) 
                transition-colors 
                focus:outline-none"
            />

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="
                px-4 py-2 
                bg-gray-300
                flex 
                items-center justify-center 
                rounded-full 
                hover:bg-gray-200 
                transition-colors
                cursor-pointer" >
              +
            </button>
          </div>

          <div className="w-full max-w-2xl flex gap-4 mt-30">

            <button 
            onClick={() => {
              if (quantity <= 0) {
                triggerAlert();
                return;
              }
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.img || "/placeholder.png",
                quantity: quantity,
              });
            }}
            className="
            flex-1 
            flex 
            items-center 
            justify-center 
            gap-3 
            bg-[var(--main)] 
            text-[var(--bg)] 
            text-lg 
            font-semibold 
            py-4 
            rounded-lg 
            shadow-md 
            cursor-pointer 
            hover:opacity-90 
            transition">
              <ShoppingCart size={22} />
              เพิ่มไปยังรถเข็น
            </button>

            <button className="
            flex-1 
            bg-(--bg) 
            text-(--main) 
            text-lg 
            font-semibold 
            py-4 
            rounded-lg 
            shadow-md 
            cursor-pointer
            hover:opacity-90 
            transition">
              ซื้อเลย
            </button>
          </div>
        </div>
        </>
        )}

      </div>
    </div>
  );
}