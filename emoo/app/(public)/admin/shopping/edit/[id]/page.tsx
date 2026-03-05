"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import products from "@/app/data/product.json";

export default function EditProduct() {
  const { id } = useParams();
  const product = products.product.find((p) => p.id === id);

  const [name, setName]           = useState(product?.name || "Name Product");
  const [description, setDesc]    = useState("description");
  const [price, setPrice]         = useState(product?.price || "");
  const [amount, setAmount]       = useState(10);
  const [editPrice, setEditPrice] = useState(false);
  const [images, setImages]       = useState<string[]>(product?.image ? [product.image] : []);
  const [mainImage, setMainImage] = useState<string | null>(product?.image || null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
    if (!mainImage) setMainImage(urls[0]);
  };

  const handleSave = () => {
    alert("บันทึกสำเร็จ!");
  };

  return (
    <div className="min-h-screen bg-[#c4a882] flex flex-col p-10 ml-16">

      {/* Back */}
      <Link href="/admin/shopping" className="flex items-center gap-2 text-[#1e1b4b] font-semibold mb-8 hover:opacity-70 w-fit text-lg">
        ← Back
      </Link>

      <div className="flex gap-10 flex-1">

        {/* LEFT: Main Image + Thumbnails */}
        <div className="flex gap-4">

          {/* Main Image */}
          <div className="w-[450px] h-[400px] bg-white rounded-2xl overflow-hidden relative flex-shrink-0">
            {mainImage ? (
              <Image src={mainImage} alt="main" fill className="object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg opacity-60">
                No Image
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setMainImage(img)}
                className="w-16 h-16 rounded-xl overflow-hidden relative cursor-pointer border-2 border-transparent hover:border-[#1e1b4b] flex-shrink-0"
              >
                <Image src={img} alt={`thumb-${i}`} fill className="object-cover" />
              </div>
            ))}
            <label className="w-16 h-16 rounded-xl bg-[#1e1b4b] text-white text-3xl flex items-center justify-center cursor-pointer hover:opacity-80 flex-shrink-0">
              +
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
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
                className="text-3xl font-bold text-[#1e1b4b] bg-transparent outline-none border-b border-[#1e1b4b] w-full"
              />
              <span className="text-xl">✏️</span>
            </div>

            {/* Description */}
            <div className="flex items-center gap-3">
              <input
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                className="text-base text-[#1e1b4b] bg-transparent outline-none border-b border-[#1e1b4b] w-full"
              />
              <span className="text-base">✏️</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mt-4">
              {editPrice ? (
                <input
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

            {/* Amount */}
            <div className="flex items-center gap-6">
              <span className="text-[#1e1b4b] font-semibold text-lg">Amount</span>
              <div className="flex items-center border border-[#1e1b4b] rounded-lg overflow-hidden">
                <button
                  onClick={() => setAmount((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 text-[#1e1b4b] font-bold text-lg hover:bg-[#1e1b4b] hover:text-white transition"
                >
                  −
                </button>
                <span className="px-6 py-2 font-bold text-[#1e1b4b] text-lg border-x border-[#1e1b4b]">
                  {amount}
                </span>
                <button
                  onClick={() => setAmount((p) => p + 1)}
                  className="px-4 py-2 text-[#1e1b4b] font-bold text-lg hover:bg-[#1e1b4b] hover:text-white transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              className="px-14 py-3 bg-[#1e1b4b] text-white font-semibold text-lg rounded-xl hover:opacity-80 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}