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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-(--sec) text-2xl font-semibold">กำลังโหลด...</p>
    </div>
  );

  return (
    <div className="min-h-screen px-4 lg:px-16 lg:ml-24 pt-10">

      {/* TOP SECTION — same layout as user shopping */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-20">

        {/* Search + Add */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full mb-6 flex justify-center items-center gap-4">
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
            <Link href="/admin/shopping/add">
              <button className="
              w-10 h-10  
              bg-(--bg)   
              text-(--main)
              rounded-lg 
              text-2xl 
              flex items-center justify-center 
              hover:opacity-80 
              transition 
              shrink-0
              cursor-pointer">
                +
              </button>
            </Link>
          </div>
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

      {/* PRODUCT SECTION — matches user shopping gap/spacing */}
      {filtered.length === 0 ? (
        <p className="text-center text-(--sec) font-semibold mt-20">
          กด + เพื่อเพิ่มสินค้า
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="
                w-[370px]
                h-[480px]
                p-6
                bg-[white]
                rounded-[30px]
                shadow-[0_0_30px_rgba(0,0,0,0.05)]
                flex flex-col
                relative">

              {/* Image */}
              <div className="relative w-full h-[300px] bg-white rounded-2xl overflow-hidden">
                <Image
                  src={item.img || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-contain p-6"/>
                
                {/* Admin Buttons overlay */}
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

              {/* Content — same style as user shopping */}
              <div className="mt-5 text-(--sec) flex flex-col flex-grow">
                <h3 className="text-2xl font-bold leading-tight min-h-[56px]">
                  {item.name}
                </h3>

                <p className="text-sm mt-3 text-gray-700 min-h-[60px]">
                  {item.details}
                </p>

                <div className="flex justify-between items-end mt-auto">
                  <p className="text-2xl font-bold">
                    {item.price} ฿
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}