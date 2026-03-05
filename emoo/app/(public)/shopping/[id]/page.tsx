"use client";

import products from "@/app/data/product.json";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cartstore";


export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = use(params);

  const product = products.product.find(
    (item) => item.id === id
  );

  if (!product) return notFound();

  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="min-h-screen px-4 lg:px-16 lg:ml-24 pt-10 bg-(white) text-(--sec)">
      <Link href="/shopping">← Back</Link>

      <div className="flex gap-20 mt-10 justify-center">

        <div className="w-[700px] h-[450px] relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain rounded-2xl"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl mt-4">{product.price}฿</p>
          <p className="mt-4">{product.details}</p>
          <p className="mt-4 text-gray-500">คลัง: </p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() =>
                setQuantity(quantity > 1 ? quantity - 1 : 1)
              }
              className="px-4 py-2 bg-gray-300 rounded-full"
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 bg-gray-300 rounded-full"
            >
              +
            </button>
          </div>

          <div className="w-full max-w-2xl flex gap-4 mt-30">

            <button 
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
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

      </div>
    </div>
  );
}