"use client";

import { useState, useEffect } from "react";
import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowBigLeft, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePopupStore } from "@/lib/popupstore";
import PopupAlert from "@/app/components/PopupAlert";

export default function CheckoutPage() {
  const router = useRouter();
  const { isOpen, title, message, type, showPopup, closePopup } = usePopupStore();
  const cart = useCartStore((state: CartStore) => state.cart);
  const increase = useCartStore((state: CartStore) => state.increase);
  const decrease = useCartStore((state: CartStore) => state.decrease);
  const remove = useCartStore((state: CartStore) => state.remove);

  const [userId, setUserId] = useState<string | null>(null);

  // โหลดรายการที่เลือกจาก localStorage และตรวจสอบว่า login อยู่
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("checkout_items");
    if (stored) {
      setSelectedIds(JSON.parse(stored));
    }

    // ตรวจสอบสถานะ login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        showPopup("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อ", "error");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setUserId(session.user.id);
      }
    });
  }, []);

  // กรองเฉพาะสินค้าที่เลือก
  const checkoutItems = cart.filter((item) => selectedIds.includes(item.id));
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "",
    address: "", subdistrict: "", district: "",
    province: "", zipcode: "",
  });
  const [loading, setLoading] = useState(false);


  // ฟิลด์ที่ต้องเป็นตัวอักษรเท่านั้น
  // ชื่อ/นามสกุล/แขวง/เขต/จังหวัด = ตัวอักษรเท่านั้น (ที่อยู่ยกเว้น เพราะมีตัวเลข/อักขระ)
  const textOnlyFields = ["first_name", "last_name", "subdistrict", "district", "province"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (textOnlyFields.includes(name)) {
      // อนุญาตเฉพาะตัวอักษรไทย/อังกฤษ ช่องว่าง และ / - .
      const filtered = value.replace(/[0-9]/g, "");
      setForm({ ...form, [name]: filtered });
      return;
    }

    if (name === "phone") {
      // เฉพาะตัวเลข ไม่เกิน 10 หลัก
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: digits });
      return;
    }

    if (name === "zipcode") {
      // เฉพาะตัวเลข ไม่เกิน 5 หลัก
      const digits = value.replace(/\D/g, "").slice(0, 5);
      setForm({ ...form, zipcode: digits });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleConfirm = async () => {
    const { first_name, last_name, phone, address, subdistrict, district, province, zipcode } = form;

    if (!first_name || !last_name || !phone || !address || !subdistrict || !district || !province || !zipcode) {
      showPopup("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง", "error");
      return;
    }
    if (phone.length !== 10) {
      showPopup("เบอร์โทรไม่ถูกต้อง", "กรุณากรอกเบอร์โทรให้ครบ 10 หลัก", "error");
      return;
    }
    if (zipcode.length !== 5) {
      showPopup("รหัสไปรษณีย์ไม่ถูกต้อง", "กรุณากรอกรหัสไปรษณีย์ให้ครบ 5 หลัก", "error");
      return;
    }
    if (checkoutItems.length === 0) {
      showPopup("ไม่มีสินค้า", "ไม่มีสินค้าที่เลือกชำระเงิน", "error");
      return;
    }

    if (!userId) {
      showPopup("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อ", "error");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([{
          user_id: userId,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          address: form.address,
          district: form.district,
          province: form.province,
          zipcode: form.zipcode,
          items: checkoutItems,
          total: subtotal,
          status: "pending",
        }])
        .select();

      if (error) throw error;

      // เก็บ order id และ selected items ไว้ใช้ในหน้า payment
      localStorage.setItem("order_id", data[0].id);
      localStorage.setItem("purchased_item_ids", JSON.stringify(selectedIds));
      router.push("/payment");
    } catch (err) {
      showPopup("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกคำสั่งซื้อได้ กรุณาลองใหม่", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pb-24 md:pb-10 bg-[#1a1a2e] text-white py-6 sm:py-12 px-4 sm:px-8 md:ml-20 flex justify-center">
      <div className="w-full max-w-xl lg:max-w-7xl flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        
        {/* ฝั่งซ้าย: แบบฟอร์ม */}
        <div className="flex-1 w-full space-y-12">
          <header className="sticky top-0 z-40 bg-[#1a1a2e]/95 backdrop-blur-md -mx-4 px-4 pt-6 pb-4 mb-8">
            <button
              onClick={() => router.back()}
              className="
              flex 
              items-center 
              gap-1 
              text-white/60 
              hover:text-white 
              transition 
              cursor-pointer 
              mb-2"
            >
              <ArrowBigLeft size={28} />
            </button>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white">ทำการสั่งซื้อ</h1>
            <p className="text-white/40 text-[10px] sm:text-sm tracking-wide uppercase mt-2">การจัดส่งและข้อมูลลูกค้า</p>
          </header>

          <div className="space-y-10">
            <section className="space-y-6">
              <h2 className="
              text-lg 
              font-bold 
              text-indigo-400 
              uppercase 
              tracking-widest 
              italic">ข้อมูลลูกค้า</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="
                  text-xs 
                  font-bold 
                  text-white/30 
                  uppercase ml-1">
                    ชื่อ
                  </label>
                  <input 
                  name="first_name" 
                  type="text" 
                  value={form.first_name} 
                  onChange={handleChange} 
                  placeholder="สมปอง"
                  className="
                    w-full 
                    bg-white/[0.03] 
                    border border-white/10 
                    rounded-2xl px-5 py-4 
                    focus:border-indigo-500 
                    outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">นามสกุล</label>
                  <input name="last_name" type="text" value={form.last_name} onChange={handleChange} placeholder="พนมนุ่ม"
                    className="
                    w-full 
                    bg-white/[0.03]
                     border border-white/10 
                     rounded-2xl px-5 py-4 
                     focus:border-indigo-500 
                     outline-none transition-all" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">เบอร์โทรศัพท์ <span className="text-indigo-400 normal-case">(10 หลัก)</span></label>
                  <input name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={handleChange} placeholder="0812345678" maxLength={10}
                    className="
                    w-full 
                    bg-white/[0.03] 
                    border border-white/10 
                    rounded-2xl px-5 py-4 
                    focus:border-indigo-500 
                    outline-none transition-all" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="
              text-lg 
              font-bold 
              text-indigo-400 
              uppercase tracking-widest italic">ที่อยู่ของลูกค้า</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">ที่อยู่</label>
                  <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="123/4 หมู่ 5 ซอยสุขุมวิท 10"
                    className="
                    w-full 
                    bg-white/[0.03] 
                    border border-white/10 
                    rounded-2xl 
                    px-5 
                    py-4 
                    focus:border-indigo-500 
                    outline-none 
                    transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">แขวง / ตำบล</label>
                    <input name="subdistrict" type="text" value={form.subdistrict} onChange={handleChange} placeholder="แขวงลาดยาว"
                      className="
                      w-full 
                      bg-white/[0.03] 
                      border border-white/10 
                      rounded-xl px-4 py-3 
                      outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">เขต / อำเภอ</label>
                    <input name="district" type="text" value={form.district} onChange={handleChange} placeholder="เขตจตุจักร"
                      className="
                      w-full 
                      bg-white/[0.03] 
                      border border-white/10 
                      rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">จังหวัด</label>
                    <input name="province" type="text" value={form.province} onChange={handleChange} placeholder="กรุงเทพฯ"
                      className="
                      w-full 
                      bg-white/[0.03] 
                      border border-white/10 
                      rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">รหัสไปรษณีย์ <span className="text-indigo-400 normal-case">(5 หลัก)</span></label>
                    <input name="zipcode" type="tel" inputMode="numeric" value={form.zipcode} onChange={handleChange} placeholder="10110" maxLength={5}
                      className="
                      w-full 
                      bg-white/[0.03] 
                      border border-white/10 
                      rounded-xl px-4 py-3 outline-none" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ฝั่งขวา: Order Summary */}
        <div className="flex-1 w-full lg:sticky lg:top-10">
          <div className="
          bg-white/[0.02] 
          border border-white/10 
          rounded-3xl lg:rounded-[3rem] 
          p-6 lg:p-14 
          backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl sm:text-3xl font-black mb-10 tracking-tight">ยอดรวมคำสั่งซื้อ</h2>

            <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-4">
              {checkoutItems.map((item: CartItem) => (
                <div key={item.id} className="flex gap-4 items-start group py-4 border-b border-white/5">
                  <div className="w-18 h-18 sm:w-36 sm:h-36 bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                    <Image src={item.image || (item as any).img || "/placeholder.png"} alt={item.name} width={144} height={144}
                      className="
                      object-cover 
                      w-full h-full 
                      rounded-xl sm:rounded-2xl 
                      group-hover:scale-110 
                      transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-1 sm:space-y-2 pl-2 sm:pl-4">
                    <div className="flex justify-between items-start min-w-0">
                      <h3 className="font-bold text-sm sm:text-xl text-white/90 leading-tight pr-4 truncate flex-1">{item.name}</h3>
                      <button 
                      onClick={() => remove(item.id)} className=" cursor-pointer
                      text-white/20 
                      hover:text-red-400 
                      transition-colors 
                      text-lg sm:text-xl cursor-pointer">
                      <X size={20} />
                      </button>
                    </div>
                    <p className="text-indigo-400 font-black text-lg sm:text-2xl">฿{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 w-fit mt-1 sm:mt-2">
                      <button onClick={() => decrease(item.id)} 
                      className="
                      w-8 h-8 
                      flex items-center justify-center 
                      rounded-full 
                      bg-white/10 
                      hover:bg-red-500/30 
                      text-white transition
                      cursor-pointer">—</button>
                      <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => increase(item.id)} 
                      className="
                      w-8 h-8 
                      flex items-center justify-center 
                      rounded-full 
                      bg-white/10 
                      hover:bg-green-500/30 
                      text-white transition
                      cursor-pointer">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5 pt-10 border-t border-white/10">
              <div className="flex justify-between text-white/40 font-bold uppercase tracking-widest text-xs">
                <span>ราคารวม</span>
                <span className="text-white">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/40 font-bold uppercase tracking-widest text-xs">
                <span>ค่าจัดส่ง</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-end pt-8">
                <span className="text-base sm:text-2xl font-black italic uppercase">รวมยอดสั่งซื้อ</span>
                <div className="text-right">
                  <p className="text-2xl sm:text-5xl font-black text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    ฿{subtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="
              w-full
              bg-transparent 
              border-2 border-white 
              hover:bg-white/10 
              text-white 
              mt-10 sm:mt-20 py-4 
              rounded-2xl 
              font-black 
              text-xl sm:text-2xl 
              transition-all 
              active:scale-[0.98] 
              disabled:opacity-50
              cursor-pointer"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการสั่งซื้อ"}
            </button>
          </div>
        </div>
      </div>
      </div>

      <PopupAlert
        isOpen={isOpen}
        title={title}
        message={message}
        type={type}
        onClose={closePopup}
      />
    </>
  );
}