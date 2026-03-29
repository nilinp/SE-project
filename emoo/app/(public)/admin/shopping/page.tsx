"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/app/components/searchbar";

import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  details: string;
}

export default function AdminShopping() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  // ดึงข้อมูลจาก Backend Supabase
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
        console.error("โหลดสินค้าไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      const { error, count } = await supabase
        .from("product")
        .delete({ count: 'exact' })
        .eq("id", id);
      
      if (error) throw error;
      
      if (count === 0) {
        throw new Error("ลบออกจากฐานข้อมูลไม่ได้ (คาดว่าติดเรื่องสิทธิ์ RLS ในฐานข้อมูล)");
      }
      
      // Update UI
      setProducts(products.filter((p) => p.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`ไม่สามารถลบสินค้าได้: ${err?.message || "Error"}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#c4a882]">
      <p className="text-[#1e1b4b] text-2xl font-semibold">กำลังโหลด...</p>
    </div>
  );

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
          <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
          <Link href="/admin/shopping/add" className="absolute right-0">
            <button className="w-10 h-10 bg-[#1e1b4b] text-white rounded-lg text-2xl flex items-center justify-center hover:opacity-80 transition">
              +
            </button>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 relative font-semibold" role="alert">
          <p>{errorMsg}</p>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" 
            onClick={() => setErrorMsg(null)}>
            ปิด (X)
          </button>
        </div>
      )}

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
                    src={item.img || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  {deletingId === item.id ? (
                    <>
                      <button 
                        type="button"
                        onClick={(e) => confirmDelete(item.id, e)}
                        className="bg-red-600 text-white font-semibold px-4 py-1 rounded-full text-sm hover:bg-red-700 transition shadow cursor-pointer relative z-10">
                        ยืนยันลบ
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setDeletingId(null); }}
                        className="bg-gray-400 text-white font-semibold px-4 py-1 rounded-full text-sm hover:bg-gray-500 transition shadow cursor-pointer relative z-10">
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setDeletingId(item.id); }}
                        className="bg-red-600 text-white font-semibold px-4 py-1 rounded-full text-sm hover:bg-red-700 transition shadow cursor-pointer relative z-10">
                        Delete
                      </button>
                      <Link href={`/admin/shopping/edit/${item.id}`}>
                        <button type="button" className="bg-white text-[#1e1b4b] font-semibold px-4 py-1 rounded-full text-sm hover:opacity-80 transition shadow cursor-pointer relative z-10">
                          Edit
                        </button>
                      </Link>
                    </>
                  )}
                </div>
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