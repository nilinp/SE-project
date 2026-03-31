"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";
import { ArrowBigLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PaymentPage() {
  const router = useRouter();
  const cart = useCartStore((state: CartStore) => state.cart);
  const removeItems = useCartStore((state: CartStore) => state.removeItems);

  // โหลดรายการที่กำลังจะชำระ
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("purchased_item_ids");
    if (stored) {
      setPurchasedIds(JSON.parse(stored));
    }
  }, []);

  const checkoutItems = cart.filter((item) => purchasedIds.includes(item.id));
  const total = checkoutItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  const [method, setMethod] = useState<"qr" | "credit" | null>(null);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  const handleConfirm = async () => {
    if (!method) { alert("กรุณาเลือกวิธีชำระเงิน"); return; }
    if (method === "credit" && (!card.number || !card.name || !card.expiry || !card.cvv)) {
      alert("กรุณากรอกข้อมูลบัตรให้ครบถ้วน"); return;
    }

    setLoading(true);
    try {
      const orderId = localStorage.getItem("order_id");

      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({ status: "paid", payment_method: method })
          .eq("id", orderId);

        if (error) throw error;
      }

      // ลบเฉพาะสินค้าที่ซื้อออกจากตะกร้า
      removeItems(purchasedIds);

      // ล้าง localStorage
      localStorage.removeItem("order_id");
      localStorage.removeItem("purchased_item_ids");
      localStorage.removeItem("checkout_items");

      alert("ชำระเงินสำเร็จ! 🎉");
      router.push("/");
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white py-16 px-8 lg:ml-24">
      <div className="max-w-4xl mx-auto space-y-10">

        <header>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-white/60 hover:text-white transition cursor-pointer mb-4"
          >
            <ArrowBigLeft size={28} />
          </button>
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
            <p>{checkoutItems.length} รายการ</p>
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
              disabled={loading}
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white py-4 rounded-2xl font-black text-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ paddingLeft: '6rem', paddingRight: '6rem' }}
            >
              {loading ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}