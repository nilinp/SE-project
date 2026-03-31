"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";

export default function PaymentPage() {
  const router = useRouter();
  const cart = useCartStore((state: CartStore) => state.cart);
  const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  const [method, setMethod] = useState<"qr" | "credit" | null>(null);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  const handleConfirm = () => {
    if (!method) { alert("กรุณาเลือกวิธีชำระเงิน"); return; }
    if (method === "credit" && (!card.number || !card.name || !card.expiry || !card.cvv)) {
      alert("กรุณากรอกข้อมูลบัตรให้ครบถ้วน"); return;
    }
    alert("ชำระเงินสำเร็จ! 🎉");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white py-16 px-8 lg:ml-24">
      <div className="max-w-4xl mx-auto space-y-10">

        <header>
          <h1 className="text-5xl font-black mb-3 tracking-tighter">Payment</h1>
          <p className="text-white/40 text-sm tracking-wide uppercase">เลือกวิธีชำระเงิน</p>
        </header>

        {/* สรุปยอด */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex justify-between items-center">
          <div>
            <p className="text-white/40 text-sm uppercase tracking-widest font-bold">ยอดที่ต้องชำระ</p>
            <p className="text-5xl font-black text-indigo-400 mt-1">฿{total.toLocaleString()}</p>
          </div>
          <div className="text-right text-white/30 text-sm">
            <p>{cart.length} รายการ</p>
            <p className="text-green-400 font-bold mt-1">ฟรีค่าจัดส่ง</p>
          </div>
        </div>

        {/* เลือกวิธีชำระ */}
        <div>
          <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest italic mb-6">วิธีชำระเงิน</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMethod("qr")}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${method === "qr" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
            >
              <p className="text-3xl mb-2">📱</p>
              <p className="font-bold text-lg">QR Code</p>
              <p className="text-white/40 text-sm mt-1">โอนผ่าน Mobile Banking</p>
            </button>
            <button
              onClick={() => setMethod("credit")}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${method === "credit" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
            >
              <p className="text-3xl mb-2">💳</p>
              <p className="font-bold text-lg">บัตรเครดิต / เดบิต</p>
              <p className="text-white/40 text-sm mt-1">Visa, Mastercard</p>
            </button>
          </div>
        </div>

        {/* QR Code */}
        {method === "qr" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-10 flex flex-col items-center gap-6">
            <p className="text-white/40 text-sm uppercase tracking-widest font-bold">สแกน QR เพื่อชำระเงิน</p>
            <div className="bg-white p-4 rounded-2xl">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment-${total}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-indigo-400 font-black text-3xl">฿{total.toLocaleString()}</p>
            <p className="text-white/40 text-sm">หลังโอนแล้วกดยืนยันด้านล่าง</p>
          </div>
        )}

        {/* Credit Card */}
        {method === "credit" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-10 space-y-6">
            <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest italic">ข้อมูลบัตร</h2>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/30 uppercase ml-1">หมายเลขบัตร</label>
              <input name="number" value={card.number} onChange={handleChange} placeholder="0000 0000 0000 0000" maxLength={19}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/30 uppercase ml-1">ชื่อบนบัตร</label>
              <input name="name" value={card.name} onChange={handleChange} placeholder="FIRSTNAME LASTNAME"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase ml-1">วันหมดอายุ</label>
                <input name="expiry" value={card.expiry} onChange={handleChange} placeholder="MM/YY" maxLength={5}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase ml-1">CVV</label>
                <input name="cvv" value={card.cvv} onChange={handleChange} placeholder="000" maxLength={3} type="password"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* ปุ่มยืนยัน */}
        {method && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleConfirm}
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white py-4 rounded-2xl font-black text-2xl transition-all active:scale-[0.98]"
              style={{ paddingLeft: '6rem', paddingRight: '6rem' }}
            >
              ยืนยันการชำระเงิน
            </button>
          </div>
        )}

      </div>
    </div>
  );
}