"use client";

import { useState, useEffect } from "react";
import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowBigLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  device_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  zipcode: string;
  items: CartItem[];
  total: number;
  status: string;
};

type FormErrors = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  zipcode?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state: CartStore) => state.cart);
  const increase = useCartStore((state: CartStore) => state.increase);
  const decrease = useCartStore((state: CartStore) => state.decrease);
  const remove = useCartStore((state: CartStore) => state.remove);

  // โหลดรายการที่เลือกจาก localStorage
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("checkout_items");
    if (stored) {
      setSelectedIds(JSON.parse(stored));
    }
  }, []);

  // กรองเฉพาะสินค้าที่เลือก
  const checkoutItems = cart.filter((item) => selectedIds.includes(item.id));
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "",
    address: "", subdistrict: "", district: "",
    province: "", zipcode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const getDeviceId = () => {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("device_id", id);
    }
    return id;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // เคลียร์ error ทันทีที่ผู้ใช้เริ่มแก้ไขข้อมูลใหม่
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ฟังก์ชันแยกสำหรับเช็คแต่ละฟิลด์ และระบุประเภทข้อมูลที่ต้องการ
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "first_name":
        if (!value.trim()) return "กรุณากรอกชื่อ (ต้องเป็นตัวอักษร)";
        break;
      case "last_name":
        if (!value.trim()) return "กรุณากรอกนามสกุล (ต้องเป็นตัวอักษร)";
        break;
      case "phone":
        if (!value.trim()) return "กรุณากรอกเบอร์โทรศัพท์";
        if (!/^[0-9]+$/.test(value)) return "ข้อมูลไม่ถูกต้อง: ต้องเป็นตัวเลขเท่านั้น";
        if (!/^0[0-9]{9}$/.test(value)) return "ข้อมูลไม่ถูกต้อง: ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0";
        break;
      case "address":
        if (!value.trim()) return "กรุณากรอกที่อยู่ (ข้อความ)";
        break;
      case "subdistrict":
        if (!value.trim()) return "กรุณากรอกแขวง/ตำบล (ข้อความ)";
        break;
      case "district":
        if (!value.trim()) return "กรุณากรอกเขต/อำเภอ (ข้อความ)";
        break;
      case "province":
        if (!value.trim()) return "กรุณากรอกจังหวัด (ข้อความ)";
        break;
      case "zipcode":
        if (!value.trim()) return "กรุณากรอกรหัสไปรษณีย์";
        if (!/^[0-9]+$/.test(value)) return "ข้อมูลไม่ถูกต้อง: ต้องเป็นตัวเลขเท่านั้น";
        if (!/^[0-9]{5}$/.test(value)) return "ข้อมูลไม่ถูกต้อง: ต้องเป็นตัวเลข 5 หลัก";
        break;
      default:
        return undefined;
    }
  };

  // ตรวจสอบข้อมูลเมื่อผู้ใช้พิมพ์เสร็จและคลิกออกนอกช่อง (Blur)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // ตรวจสอบข้อมูลทั้งหมดก่อนกด Confirm
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    Object.keys(form).forEach((key) => {
      const fieldName = key as keyof typeof form;
      const errorMsg = validateField(fieldName, form[fieldName]);
      if (errorMsg) {
        newErrors[fieldName] = errorMsg;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateAll()) {
      alert("กรุณาตรวจสอบข้อมูลให้ถูกต้องตามรูปแบบที่กำหนด");
      return;
    }
<<<<<<< HEAD

    if (cart.length === 0) {
      alert("ตะกร้าสินค้าว่างเปล่า");
=======
    if (checkoutItems.length === 0) {
      alert("ไม่มีสินค้าที่เลือกชำระเงิน");
>>>>>>> backend
      return;
    }

    setLoading(true);
    try {
      const deviceId = getDeviceId();

      const orderData: Order = {
        device_id: deviceId,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
        district: form.district,
        province: form.province,
        zipcode: form.zipcode,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: subtotal,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("orders")
<<<<<<< HEAD
        .insert([orderData])
=======
        .insert([{
          device_id: deviceId,
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
>>>>>>> backend
        .select();

      if (error) {
        console.error(error);
        alert("บันทึกไม่สำเร็จ: " + error.message);
        return;
      }

<<<<<<< HEAD
=======
      // เก็บ order id และ selected items ไว้ใช้ในหน้า payment
>>>>>>> backend
      localStorage.setItem("order_id", data[0].id);
      localStorage.setItem("purchased_item_ids", JSON.stringify(selectedIds));
      router.push("/payment");

    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-white/[0.03] border rounded-2xl px-5 py-4 outline-none transition-all ${
      errors[field] ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-indigo-500"
    }`;

  const inputClassSm = (field: keyof FormErrors) =>
    `w-full bg-white/[0.03] border rounded-xl px-4 py-3 outline-none transition-all ${
      errors[field] ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-indigo-500"
    }`;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white py-16 px-8 lg:ml-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-start">

        {/* ฝั่งซ้าย: แบบฟอร์ม */}
        <div className="flex-1 w-full space-y-12">
          <header>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-white/60 hover:text-white transition cursor-pointer mb-4"
            >
              <ArrowBigLeft size={28} />
            </button>
            <h1 className="text-5xl font-black mb-3 tracking-tighter text-white">Checkout</h1>
            <p className="text-white/40 text-sm tracking-wide uppercase">Shipping & Customer Information</p>
          </header>

          <div className="space-y-10">
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest italic">Customer Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">First Name/ชื่อ</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} onBlur={handleBlur} placeholder="ex. สมปอง"
                    className={inputClass("first_name")} />
                  {errors.first_name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.first_name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">Last Name/นามสกุล</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} onBlur={handleBlur} placeholder="ex. พนมนุ่ม"
                    className={inputClass("last_name")} />
                  {errors.last_name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.last_name}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">Phone Number/เบอร์โทรศัพท์</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="ex. 0812345678"
                    maxLength={10}
                    className={inputClass("phone")}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest italic">Customer Address</h2>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/30 uppercase ml-1">Street Address/ที่อยู่</label>
                  <input name="address" value={form.address} onChange={handleChange} onBlur={handleBlur} placeholder="ex. 123/4 หมู่ 5 ซอยสุขุมวิท 10"
                    className={inputClass("address")} />
                  {errors.address && <p className="text-red-400 text-xs mt-1 ml-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">Subdistrict/แขวง</label>
                    <input name="subdistrict" value={form.subdistrict} onChange={handleChange} onBlur={handleBlur} placeholder="ex. แขวงลาดยาว"
                      className={inputClassSm("subdistrict")} />
                    {errors.subdistrict && <p className="text-red-400 text-xs mt-1 ml-1">{errors.subdistrict}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">District/เขต</label>
                    <input name="district" value={form.district} onChange={handleChange} onBlur={handleBlur} placeholder="ex. เขตจตุจักร"
                      className={inputClassSm("district")} />
                    {errors.district && <p className="text-red-400 text-xs mt-1 ml-1">{errors.district}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">Province/จังหวัด</label>
                    <input name="province" value={form.province} onChange={handleChange} onBlur={handleBlur} placeholder="ex. กรุงเทพฯ"
                      className={inputClassSm("province")} />
                    {errors.province && <p className="text-red-400 text-xs mt-1 ml-1">{errors.province}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/30 uppercase ml-1">Postal Code/รหัสไปรษณีย์</label>
                    <input
                      name="zipcode"
                      value={form.zipcode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="ex. 10900"
                      maxLength={5}
                      className={inputClassSm("zipcode")}
                    />
                    {errors.zipcode && <p className="text-red-400 text-xs mt-1 ml-1">{errors.zipcode}</p>}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ฝั่งขวา: Order Summary */}
        <div className="flex-1 w-full lg:sticky lg:top-10">
          <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 lg:p-14 backdrop-blur-xl shadow-2xl">
            <h2 className="text-3xl font-black mb-10 tracking-tight">Order Summary</h2>

            <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-4">
              {checkoutItems.map((item: CartItem) => (
                <div key={item.id} className="flex gap-6 items-start group py-4 border-b border-white/5">
                  <div className="w-36 h-36 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} width={144} height={144}
                      className="object-cover w-full h-full rounded-2xl group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-2 pl-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xl text-white/90 leading-tight pr-4">{item.name}</h3>
                      <button onClick={() => remove(item.id)} className="text-white/20 hover:text-red-400 transition-colors text-xl">✕</button>
                    </div>
                    <p className="text-indigo-400 font-black text-2xl">฿{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 w-fit mt-2">
                      <button onClick={() => {
                        if (item.quantity <= 1) {
                          remove(item.id);
                        } else {
                          decrease(item.id);
                        }
                      }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/30 text-white transition">—</button>
                      <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => increase(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-green-500/30 text-white transition">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="mx-auto block bg-transparent border-2 border-white hover:bg-white/10 text-white mt-20 py-4 rounded-2xl font-black text-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ paddingLeft: '6rem', paddingRight: '6rem' }}
            >
              {loading ? "กำลังบันทึก..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}