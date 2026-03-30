"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName]           = useState("");
  const [details, setDetails]     = useState("");
  const [price, setPrice]         = useState("");
  const [editPrice, setEditPrice] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  // Fetch current product data from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (data) {
          setName(data.name || "");
          setDetails(data.details || "");
          setPrice(data.price?.toString() || "");
          setPreviewImage(data.img || null);
        }
      } catch (err) {
        console.error("โหลดข้อมูลสินค้าไม่สำเร็จ", err);
        alert("ไม่พบรหัสสินค้านี้");
        router.push("/admin/shopping");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim() || !price) {
      alert("กรุณากรอกชื่อและราคา");
      return;
    }
    
    setSaving(true);
    
    try {
      let imageUrl = previewImage; // Default to existing image url

      // Upload new image if selected
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

      // Record update
      const { error: updateError } = await supabase
        .from("product")
        .update({
          name: name.trim(),
          details: details.trim(),
          price: parseFloat(price),
          img: imageUrl || null
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }
      
      router.push("/admin/shopping");
      
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    setSaving(true);
    try {
      const { error, count } = await supabase
        .from("product")
        .delete({ count: 'exact' })
        .eq("id", id);

      if (error) throw error;
      
      if (count === 0) {
        throw new Error("ลบออกจากฐานข้อมูลไม่ได้");
      }
      
      router.push("/admin/shopping");
    } catch (err: any) {
      console.error(err);
      alert(`ไม่สามารถลบสินค้าได้: ${err?.message || "Error"}`);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-10 ml-16">

      <div className="flex gap-10 flex-1">

        {/* LEFT: Main Image + Thumbnails */}
        <div className="flex gap-4">

          {/* Main Image */}
          <div className="w-[450px] h-[400px] bg-white rounded-2xl overflow-hidden relative flex-shrink-0">
            {previewImage ? (
              <Image src={previewImage} alt="main" fill className="object-cover rounded-2xl" />
            ) : (
              <div className="
              w-[450px] 
              h-[400px] 
              bg-gray-200
              rounded-2xl 
              overflow-hidden 
              relative 
              flex-shrink-0
              items-center">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="w-16 h-16 rounded-xl bg-[#1e1b4b] text-white text-3xl flex items-center justify-center cursor-pointer hover:opacity-80 flex-shrink-0">
              <span title="เปลี่ยนรูปสินค้า">📷</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button 
              onClick={handleDelete}
              disabled={saving}
              title="ลบสินค้านี้"
              className="w-16 h-16 rounded-xl bg-red-600 text-white text-3xl flex items-center justify-center cursor-pointer hover:bg-red-700 hover:opacity-80 flex-shrink-0 disabled:opacity-50">
              🗑️
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-0.5 bg-[#1e1b4b] opacity-60 mx-2" />

        {/* RIGHT: Info */}
        <div className="flex flex-col flex-1 justify-between py-2">
          <div className="flex flex-col gap-6">

            {/* Name */}
            <div className="flex items-center gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อสินค้า"
                className="text-3xl font-bold text-[#1e1b4b] bg-transparent outline-none border-b border-[#1e1b4b] w-full"
              />
              <span className="text-xl">✏️</span>
            </div>

            {/* Details */}
            <div className="flex items-center gap-3">
              <input
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม"
                className="text-base text-[#1e1b4b] bg-transparent outline-none border-b border-[#1e1b4b] w-full"
              />
              <span className="text-base">✏️</span>
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
                  className="text-2xl font-bold text-[#1e1b4b] bg-transparent border-b border-[#1e1b4b] outline-none w-32"
                />
              ) : (
                <span className="text-2xl font-bold text-[#1e1b4b]">
                  ${price || "-"}
                </span>
              )}
              <button
                onClick={() => setEditPrice(true)}
                className="px-5 py-1.5 bg-[#1e1b4b] text-white text-sm rounded-lg hover:opacity-80"
              >
                Edit
              </button>
            </div>

             {/* Amount removed */}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8 gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-14 py-3 bg-[#1e1b4b] text-white font-semibold text-lg rounded-xl hover:bg-[#2d2a6e] hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}