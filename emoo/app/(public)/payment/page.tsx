"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";
import { ArrowBigLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

type FormErrors = {
  number?: string;
  name?: string;
  expiry?: string;
  cvv?: string;
};

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // State สำหรับ CVV
  const [cvvDisplay, setCvvDisplay] = useState("");
  const [cvvTimer, setCvvTimer] = useState<NodeJS.Timeout | null>(null);
  const [showCvv, setShowCvv] = useState(false);

  useEffect(() => {
    return () => {
      if (cvvTimer) clearTimeout(cvvTimer);
    };
  }, [cvvTimer]);

  // --- LOGIC: หมายเลขบัตร (เว้นวรรคทุก 4 ตัว) ---
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || "";
    setCard({ ...card, number: formatted });
    if (errors.number) setErrors((prev) => ({ ...prev, number: undefined }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCard({ ...card, [name]: value });
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // --- LOGIC: วันหมดอายุ (Smart Auto-slash & Easy Delete) ---
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const oldVal = card.expiry;

    if (val.length < oldVal.length) {
      setCard({ ...card, expiry: val });
      return;
    }

    if (val.endsWith("/") && val.length === 2 && !oldVal.includes("/")) {
      setCard({ ...card, expiry: `0${val[0]}/` });
      return;
    }

    const digits = val.replace(/\D/g, "");
    if (digits.length === 1) {
      if (parseInt(digits) >= 2 && parseInt(digits) <= 9) val = `0${digits}/`;
      else val = digits;
    } else if (digits.length === 2) {
      if (parseInt(digits) > 12) val = digits[0];
      else val = `${digits}/`;
    } else if (digits.length > 2) {
      val = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    setCard({ ...card, expiry: val });
    setErrors((prev) => ({ ...prev, expiry: undefined }));
  };

  // --- LOGIC: CVV (ห้ามเกิน 4 หลัก + ระบบซ่อนตัวเลข) ---
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal.length < cvvDisplay.length) {
      const newActualCvv = card.cvv.slice(0, -1);
      setCard({ ...card, cvv: newActualCvv });
      setCvvDisplay(showCvv ? newActualCvv : "•".repeat(newActualCvv.length));
      return;
    }
    const addedChar = inputVal.slice(-1);
    if (!/^[0-9]$/.test(addedChar) || card.cvv.length >= 4) return;

    const newActualCvv = card.cvv + addedChar;
    setCard({ ...card, cvv: newActualCvv });
    setErrors((prev) => ({ ...prev, cvv: undefined }));

    if (showCvv) {
      setCvvDisplay(newActualCvv);
    } else {
      const newDisplay = "•".repeat(newActualCvv.length - 1) + addedChar;
      setCvvDisplay(newDisplay);
      if (cvvTimer) clearTimeout(cvvTimer);
      const timer = setTimeout(() => {
        setCvvDisplay("•".repeat(newActualCvv.length));
      }, 500);
      setCvvTimer(timer);
    }
  };

  const toggleCvv = () => {
    const nextShow = !showCvv;
    setShowCvv(nextShow);
    if (nextShow) {
      setCvvDisplay(card.cvv);
      if (cvvTimer) clearTimeout(cvvTimer);
    } else {
      setCvvDisplay("•".repeat(card.cvv.length));
    }
  };

  // --- VALIDATION: ตรวจสอบความถูกต้อง ---
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "number":
        if (!value.trim()) return "กรุณากรอกหมายเลขบัตร";
        const numStr = value.replace(/\s/g, "");
        if (numStr.length < 15) return "หมายเลขบัตรไม่ครบ";
        break;
      case "name":
        if (!value.trim()) return "กรุณากรอกชื่อบนบัตร";
        break;
      case "expiry":
        if (!value.trim()) return "กรุณากรอกวันหมดอายุ";
        if (value.length !== 5) return "รูปแบบ MM/YY";
        const [m, y] = value.split("/");
        const month = parseInt(m, 10);
        const year = parseInt(y, 10);
        const now = new Date();
        const currY = parseInt(now.getFullYear().toString().slice(-2), 10);
        if (month < 1 || month > 12) return "เดือนผิด";
        if (year < currY || (year === currY && month < now.getMonth() + 1)) return "บัตรหมดอายุ";
        if (year > currY + 10) return `ไม่เกินปี ${currY + 10}`;
        break;
      case "cvv":
        if (!value.trim()) return "กรุณากรอก CVV";
        if (value.length < 3) return "อย่างน้อย 3 หลัก";
        break;
      default: return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const val = name === "cvv" ? card.cvv : card[name as keyof typeof card];
    const errorMsg = validateField(name, val);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleConfirm = async () => {
    if (!method) { alert("กรุณาเลือกวิธีชำระเงิน"); return; }
    if (method === "credit") {
      const newErrors: FormErrors = {};
      Object.keys(card).forEach((key) => {
        const errorMsg = validateField(key, card[key as keyof typeof card]);
        if (errorMsg) newErrors[key as keyof FormErrors] = errorMsg;
      });
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    setLoading(true);
    try {
      const orderId = localStorage.getItem("order_id");
      if (orderId) {
        await supabase.from("orders").update({ status: "paid", payment_method: method }).eq("id", orderId);
      }
      removeItems(purchasedIds);
      localStorage.removeItem("order_id");
      localStorage.removeItem("purchased_item_ids");
      alert("ชำระเงินสำเร็จ! 🎉");
      router.push("/");
    } catch (_err) { // ใส่ _ ข้างหน้า
        alert("เกิดข้อผิดพลาด");
        console.error(_err); // หรือเอามา console ดูว่าพังเพราะอะไร
      } finally { setLoading(false); }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-[#1a1a2e]/50 border rounded-xl px-4 py-4 outline-none transition-all text-sm font-medium ${
      errors[field] ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-indigo-500"
    }`;

  // --- LAYOUT: ส่วนแสดงผลที่ User จะเห็น ---
  return (
    <div className="min-h-screen bg-[#11111b] text-white py-16 px-8 lg:ml-24">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-white/60 hover:text-white transition cursor-pointer mb-4">
            <ArrowBigLeft size={28} />
          </button>
          <h1 className="text-5xl font-black mb-3 tracking-tighter">Payment</h1>
          <p className="text-white/40 text-sm tracking-wide uppercase">เลือกวิธีชำระเงิน</p>
        </header>

        <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-8 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-white/40 text-sm uppercase tracking-widest font-bold">ยอดที่ต้องชำระ</p>
            <p className="text-5xl font-black text-indigo-400 mt-1">฿{total.toLocaleString()}</p>
          </div>
          <div className="text-right text-white/30 text-sm">
            <p>{checkoutItems.length} รายการ</p>
            <p className="text-green-400 font-bold mt-1">ฟรีค่าจัดส่ง</p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMethod("qr")} className={`p-6 rounded-2xl border transition-all text-left ${method === "qr" ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
              <p className="text-3xl mb-2">📱</p>
              <p className="font-bold text-lg">QR Code</p>
              <p className="text-white/40 text-sm mt-1">โอนผ่าน Mobile Banking</p>
            </button>
            <button onClick={() => setMethod("credit")} className={`p-6 rounded-2xl border transition-all text-left ${method === "credit" ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
              <p className="text-3xl mb-2">💳</p>
              <p className="font-bold text-lg">บัตรเครดิต / เดบิต</p>
              <p className="text-white/40 text-sm mt-1">Visa, Mastercard</p>
            </button>
          </div>

          {method === "qr" && (
            <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-10 flex flex-col items-center gap-6 shadow-lg animate-in fade-in zoom-in-95 duration-300">
              <p className="text-white/40 text-sm uppercase tracking-widest font-bold">สแกน QR เพื่อชำระเงิน</p>
              <div className="bg-white p-4 rounded-2xl">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment-${total}`} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-indigo-400 font-black text-3xl">฿{total.toLocaleString()}</p>
            </div>
          )}

          {method === "credit" && (
            <div className="bg-[#181824] border border-white/5 rounded-[24px] p-8 space-y-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-xl font-bold text-indigo-400 italic">ข้อมูลบัตร</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">หมายเลขบัตร</label>
                <input name="number" value={card.number} onChange={handleNumberChange} onBlur={handleBlur} placeholder="0000 0000 0000 0000" maxLength={19} className={inputClass("number")} />
                {errors.number && <p className="text-red-400 text-xs ml-1">{errors.number}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">ชื่อบนบัตร</label>
                <input name="name" value={card.name} onChange={handleChange} onBlur={handleBlur} placeholder="FIRSTNAME LASTNAME" className={inputClass("name")} />
                {errors.name && <p className="text-red-400 text-xs ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 ml-1">วันหมดอายุ</label>
                  <input name="expiry" value={card.expiry} onChange={handleExpiryChange} onBlur={handleBlur} placeholder="MM/YY" maxLength={5} className={inputClass("expiry")} />
                  {errors.expiry && <p className="text-red-400 text-xs ml-1">{errors.expiry}</p>}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-white/40 ml-1">CVV</label>
                  <div className="relative">
                    <input name="cvv" value={cvvDisplay} onChange={handleCvvChange} onBlur={handleBlur} placeholder="000" type="text" className={`${inputClass("cvv")} pr-12`} />
                    <button type="button" onClick={toggleCvv} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 p-1">
                      {showCvv ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {errors.cvv && <p className="text-red-400 text-xs ml-1">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {method && (
          <div className="flex justify-center pt-8">
            <button onClick={handleConfirm} disabled={loading} className="bg-transparent border-2 border-white hover:bg-white/10 text-white py-4 rounded-2xl font-black text-2xl transition-all active:scale-[0.98] disabled:opacity-50 px-24">
              {loading ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}