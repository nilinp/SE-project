"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { ShoppingCart, ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cartstore";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const triggerAlert = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const router = useRouter();

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

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-[var(--bg)] hover:opacity-70 transition cursor-pointer mb-4"
      >
        <ArrowBigLeft size={28} />
      </button>

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
        <div className="w-[500px] h-100 relative bg-gray-50 rounded-2xl overflow-hidden">
          <Image
            src={product.img || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 max-w-xl">
          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

          {/* Details */}
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            {product.details}
          </p>

          {/* Price */}
          <div className="mt-6">
            <span className="text-3xl font-bold">{product.price}</span>
            <span className="text-lg text-gray-400 ml-2">บาท</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm text-gray-500 font-medium">จำนวน</span>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <button
                onClick={() =>
                  setQuantity(quantity > 1 ? quantity - 1 : 1)
                }
                className="
                  w-10 h-10
                  flex items-center justify-center
                  text-lg font-medium
                  hover:bg-gray-100
                  transition-colors
                  cursor-pointer
                "
              >
                −
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
                  font-semibold
                  text-lg
                  focus:outline-none
                  bg-transparent
                "
              />

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="
                  w-10 h-10
                  flex items-center justify-center
                  text-lg font-medium
                  hover:bg-gray-100
                  transition-colors
                  cursor-pointer
                "
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-8">
            <button 
              onClick={() => {
                if (!user) {
                  router.push("/login");
                  return;
                }
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
                w-full max-w-sm
                flex items-center justify-center gap-3
                py-4
                rounded-full
                text-lg font-bold
                shadow-lg
                cursor-pointer 
                hover:opacity-90
                hover:shadow-xl
                active:scale-[0.98]
                transition-all duration-200
                bg-[var(--bg)] text-[var(--main)]
              "
            >
              <ShoppingCart size={22} />
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
        </>
        )}

      </div>
    </div>
  );
}