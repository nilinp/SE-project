"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddProduct() {
  const router = useRouter();
  const [name, setName]           = useState("");
  const [details, setDetails]     = useState("");
  const [price, setPrice]         = useState("");
  const [editPrice, setEditPrice] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!name.trim() || !price) {
      alert("กรุณากรอกชื่อและราคา");
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = "";

      // Upload image mechanism using Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // Generate next ID
      let nextId = "01";
      const { data: maxIdData } = await supabase
        .from("product")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdData && maxIdData.length > 0) {
        const currentMaxId = parseInt(maxIdData[0].id, 10);
        if (!isNaN(currentMaxId)) {
          nextId = String(currentMaxId + 1).padStart(2, "0");
        }
      }

      // Record insertion
      const { error: insertError } = await supabase.from("product").insert({
        id: nextId,
        name: name.trim(),
        details: details.trim(),
        price: parseFloat(price),
        img: imageUrl || null
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("เพิ่มสินค้าไม่สำเร็จ");
      }

      router.push("/admin/shopping");
      
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-10 ml-16">

      <div className="flex gap-10 flex-1 mt-10">

        {/* LEFT: Main Image + Thumbnails */}
        <div className="flex gap-4">
          <div className="
          w-[450px] 
          h-[400px] 
          bg-gray-200
          rounded-2xl 
          overflow-hidden 
          relative 
          flex-shrink-0
          items-center">
            {previewImage ? (
              <Image src={previewImage} alt="main" fill className="object-cover rounded-2xl" />
            ) : (
              <div className="
              w-full 
              h-full 
              flex 
              flex-col 
              items-center 
              justify-center 
              text-gray-400 
              gap-4">
                <span className="text-lg">No Image</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="
            w-16 
            h-16 
            rounded-xl 
            bg-(--bg) 
            text-(--main)
            text-3xl 
            flex 
            items-center 
            justify-center 
            cursor-pointer 
            hover:opacity-80 
            flex-shrink-0">
              +
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="w-0.5 bg-(--bg) opacity-60 mx-2" />

        {/* RIGHT: Info */}
        <div className="flex flex-col flex-1 justify-between py-2 ">
          <div className="flex flex-col gap-6">

            {/* Name */}
            <div className="flex items-center gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อสินค้า"
                className="
                text-3xl 
                leading-relaxed
                text-(--bg)
                bg-transparent 
                outline-none 
                border border-(--bg)
                rounded-xl
                p-3 
                w-full 
                placeholder-(--bg)/50"
              />
            </div>

            {/* Details */}
            <div className="flex items-center gap-3 mt-3">
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="รายละเอียดสินค้า"
                className="
                text-base 
                text-(--bg) 
                bg-transparent 
                outline-none 
                border border-(--bg)
                rounded-xl
                p-3
                w-full 
                placeholder-(--bg)/50
                min-h-[200px] 
                resize-none  
                block"
              />
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mt-4">
              {editPrice ? (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  onBlur={() => setEditPrice(false)}
                  className="
                  text-2xl 
                  font-bold 
                  text-(--bg) 
                  bg-transparent 
                  border-b border-(--bg) 
                  outline-none 
                  w-32"
                />
              ) : (
                <span className="text-2xl font-bold text-(--bg)">
                  ฿   {price || "-"}
                </span>
              )}
              <button
                onClick={() => setEditPrice(true)}
                className="
                px-5 
                py-1.5 
                bg-(--bg) 
                text-(--main) 
                text-sm 
                rounded-lg 
                hover:opacity-80 
                disabled:opacity-50
                cursor-pointer"
              >
                Edit
              </button>
            </div>

             {/* Amount removed */}
          </div>

          {/* Add Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="
              px-14 
              py-3 
              bg-(--bg) 
              text-(--main) 
              font-semibold 
              text-lg 
              rounded-xl 
              hover:opacity-80 
              transition 
              disabled:opacity-50
              cursor-pointer"
            >
              {loading ? "กำลังบันทึก..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}