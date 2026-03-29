"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/app/components/searchbar";

interface Product {
  id: string;
  name: string;
  price: number;
  amount: number;
  image: string;
  description: string;
}

export default function AdminShopping() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  // ดึงข้อมูลจาก Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("โหลดสินค้าไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-10 text-white">กำลังโหลด...</p>;

  return (
    <div className="min-h-screen bg-[#c4a882] px-8 py-6">

      {/* Tab + Search + Add */}
      <div className="flex flex-col items-center gap-4 mb-8">

        {/* Tab Toggle */}
        <div className="flex bg-[#f5e6d0] rounded-full p-1">
          <Link href="/admin">
            <button className="px-6 py-2 rounded-full font-semibold text-sm text-gray-500">
              Horoscope
            </button>
          </Link>
          <button className="px-6 py-2 rounded-full font-semibold text-sm bg-[#2d2a6e] text-white">
            Shopping
          </button>
        </div>

        <div className="flex items-center w-full justify-center relative">
          <SearchBar />
          <Link href="/admin/shopping/add" className="absolute right-0">
            <button className="w-10 h-10 bg-[#1e1b4b] text-white rounded-lg text-2xl flex items-center justify-center hover:opacity-80 transition">
              +
            </button>
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-[#1e1b4b] font-semibold mt-20">
          ยังไม่มีสินค้าครับ กด + เพื่อเพิ่มสินค้า
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col items-center">
              <div className="relative w-[370px] rounded-2xl overflow-hidden bg-[#d4b896] mx-auto">
                <div className="relative w-full h-[300px]">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <Link href={`/admin/shopping/edit/${item.id}`}>
                  <button className="absolute top-3 right-3 bg-white text-[#1e1b4b] font-semibold px-4 py-1 rounded-full text-sm hover:opacity-80 transition shadow">
                    Edit
                  </button>
                </Link>
              </div>
              <p className="mt-2 font-bold text-[#1e1b4b] text-base text-center">{item.name}</p>
              <p className="text-[#1e1b4b] font-semibold text-sm">${item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}