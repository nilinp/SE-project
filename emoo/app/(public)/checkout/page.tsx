"use client";

import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state: CartStore) => state.cart);
  const increase = useCartStore((state: CartStore) => state.increase);
  const decrease = useCartStore((state: CartStore) => state.decrease);
  const remove = useCartStore((state: CartStore) => state.remove);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white py-16 px-8 lg:ml-24">
      {/* Container หลัก: แบ่งครึ่ง 50/50 แบบในรูปตัวอย่าง */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-start">
        
        {/* --- ฝั่งซ้าย: แบบฟอร์ม (เรียบง่าย ไม่ซ้อนกรอบเยอะ) --- */}
        <div className="flex-1 w-full space-y-12">
          <header>
            <h1 className="text-5xl font-black mb-3 tracking-tighter text-white">Checkout</h1>
            <p className="text-white/40 text-sm tracking-wide uppercase">Shipping & Customer Information</p>
          </header>

          <div className="space-y-10">
            {/* Customer Details */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest italic">Customer Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase ml-1">First Name</label>
                  <input placeholder="Sarah" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase ml-1">Last Name</label>
                  <input placeholder="Davis" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase ml-1">Phone Number</label>
                  <input placeholder="081-XXX-XXXX" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* Shipping Details */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest italic">Customer Address</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase ml-1">Street Address</label>
                  <input placeholder="123/4 หมู่บ้าน..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input placeholder="District" className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none" />
                  <input placeholder="Province" className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none" />
                  <input placeholder="Zipcode" className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none" />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* --- ฝั่งขวา: Order Summary (ดีไซน์ใหม่ให้ "ลอย" และ "คลีน") --- */}
        <div className="flex-1 w-full lg:sticky lg:top-10">
          <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 lg:p-14 backdrop-blur-xl shadow-2xl relative">
            <h2 className="text-3xl font-black mb-10 tracking-tight">Order Summary</h2>

            {/* รายการสินค้า: จัดวางแบบโปร่งๆ */}
            <div className="space-y-10 mb-12 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {cart.map((item: CartItem) => (
                <div key={item.id} className="flex gap-8 items-center group relative">
                  <div className="relative w-28 h-28 bg-white/5 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-inner">
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xl text-white/90 leading-tight pr-4">{item.name}</h3>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-white/20 hover:text-red-400 transition-colors text-xl"
                        >
                        ✕
                      </button>
                    </div>
                    <p className="text-indigo-400 font-black text-2xl">฿{item.price.toLocaleString()}</p>
                    {/* ตัวปรับจำนวนแบบมินิมอล */}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center bg-white/5 rounded-full px-3 py-1.5 border border-white/10 gap-3">

                            {/* ปุ่มลด */}
                            <button
                            onClick={() => decrease(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/30 text-white transition"
                            >
                            —
                            </button>

                            {/* จำนวน */}
                            <span className="text-sm font-bold min-w-[20px] text-center">
                            {item.quantity}
                            </span>

                            {/* ปุ่มเพิ่ม */}
                            <button
                            onClick={() => increase(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-green-500/30 text-white transition"
                            >
                            +
                            </button>

                        </div>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* สรุปยอดเงิน */}
            <div className="space-y-5 pt-10 border-t border-white/10">
              <div className="flex justify-between text-white/40 font-bold uppercase tracking-widest text-xs">
                <span>Subtotal</span>
                <span className="text-white">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/40 font-bold uppercase tracking-widest text-xs">
                <span>Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-end pt-8">
                <span className="text-2xl font-black italic uppercase">Total</span>
                <div className="text-right">
                  <p className="text-5xl font-black text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    ฿{subtotal.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-white/20 uppercase font-bold mt-1 tracking-[0.2em]">Including VAT</p>
                </div>
              </div>
            </div>

            {/* ปุ่มจ่ายเงินที่เด่นที่สุด */}
            <button
              onClick={() => router.push("/payment")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-12 py-6 rounded-[2rem] font-black text-2xl transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-[0.98] active:shadow-none"
            >
              Confirm Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}