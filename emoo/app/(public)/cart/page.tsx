"use client";

import { useState } from "react";
import { useCartStore, CartItem, CartStore } from "@/lib/cartstore";
import Image from "next/image";
import { EllipsisVertical, ArrowBigLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore((state: CartStore) => state.cart);
  const increase = useCartStore((state: CartStore) => state.increase);
  const decrease = useCartStore((state: CartStore) => state.decrease);
  const updateQuantity = useCartStore((state: CartStore) => state.updateQuantity);

  const [selected, setSelected] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev: string[]) => prev.includes(id) ? prev.filter((item: string) => item !== id) : [...prev, id]);
  };

  const remove = useCartStore((state: CartStore) => state.remove);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      remove(itemToDelete);
      setItemToDelete(null);
      setOpenMenuId(null);
    }
  };

  const handleCancelDelete = () => {
    setItemToDelete(null);
  };

  const handleDecrease = (item: { id: string; name?: string; price?: number; image?: string; quantity: number }) => {
    if (item.quantity <= 1) {
      remove(item.id);
    } else {
      decrease(item.id);
    }
  };

  const total = cart
    .filter((item: CartItem) => selected.includes(item.id))
    .reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return (
    <>
      <div className="
        min-h-screen pb-20
        text-(--sec)
        flex 
        flex-col 
        lg:flex-row 
        lg:items-start
        justify-center
        px-4
        lg:px-16
        lg:ml-24
        pt-5
        gap-20">

        {/* cart items */}
        <div className="flex-1">
          <div className="
            sticky 
            top-0 
            z-30 
            bg-white/95 
            backdrop-blur-sm 
            pb-2 pt-4 mb-4
            mt-2 
            flex 
            items-baseline 
            gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[var(--bg)] hover:opacity-70 transition cursor-pointer mr-2"
            >
              <ArrowBigLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold">ตะกร้าของคุณ</h1>
            {totalItems > 0 && (
              <span className="text-gray-500 font-medium">({totalItems})</span>
            )}
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.map((item: CartItem) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  key={item.id}
                  className="flex gap-6 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-5 h-5 accent-(--bg) cursor-pointer"
                  />
                  <Image
                    src={item.image || (item as any).img || "/placeholder.png"}
                    alt={item.name}
                    width={250}
                    height={250}
                    className="rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p>{item.price} ฿</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <button onClick={() => handleDecrease(item)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                      -
                    </button>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={item.quantity === 0 ? "0" : item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val === "" || val === "0") {
                          updateQuantity(item.id, 0);
                          confirmDelete(item.id);
                          return;
                        }
                        const num = parseInt(val, 10);
                        if (!isNaN(num) && num > 0) {
                          updateQuantity(item.id, num);
                        }
                      }}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                        if (item.quantity === 0 && itemToDelete !== item.id) {
                          updateQuantity(item.id, 1);
                        }
                      }}
                      className="w-12 text-center bg-gray-100/80 rounded-md py-1 font-medium hover:bg-gray-200 focus:bg-white focus:ring-1 focus:ring-(--bg) transition-colors focus:outline-none"
                    />
                    <button onClick={() => increase(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                      +
                    </button>
                  </div>

                  <div className="relative isolate ml-4 self-start -mt-2">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="text-gray-500 hover:text-black p-2 text-xl leading-none cursor-pointer"
                    >
                      <EllipsisVertical/>
                    </button>
                    <AnimatePresence>
                      {openMenuId === item.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-100 py-1 origin-top-right"
                          >
                            <button
                              onClick={() => { confirmDelete(item.id); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              ลบสินค้า
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* order summary */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-[350px] p-6 border-2 rounded-xl border-(--bg) sticky top-10"
            >
              <h2 className="text-xl font-bold mb-4">ทำการสั่งซื้อ</h2>
              <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-4 overflow-y-auto pr-2 max-h-[calc(100vh-380px)] minimal-scrollbar">
                  {cart
                    .filter((item: CartItem) => selected.includes(item.id))
                    .map((item: CartItem) => (
                      <div key={item.id} className="flex gap-3 justify-between items-start">
                        <Image
                          src={item.image || (item as any).img || "/placeholder.png"}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover w-12 h-12"
                        />
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-gray-500 text-sm">x{item.quantity}</span>
                        </div>
                        <span className="text-gray-500 text-sm whitespace-nowrap">{item.price} ฿</span>
                      </div>
                    ))}
                </div>
                <div className="border-t mt-4 pt-3 font-bold flex justify-between">
                  <span>รวมยอดสั่งซื้อ</span>
                  <span>{total} ฿</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  localStorage.setItem("checkout_items", JSON.stringify(selected));
                  router.push("/checkout");
                }}
                className="mt-6 w-full bg-(--bg) text-white py-3 rounded-lg cursor-pointer hover:opacity-80 transition-colors duration-300">
                ชำระเงิน
              </button>
              <button 
                className="mt-3 w-full border-2 border-(--bg) text-(--bg) py-3 rounded-lg cursor-pointer hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors duration-300"
                onClick={() => setSelected([])}
              >
                ยกเลิก
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all text-(--sec)">
            <h3 className="text-xl font-bold mb-2">ลบสินค้า?</h3>
            <p className="text-gray-600 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้ออกจากตะกร้า?</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { handleCancelDelete(); updateQuantity(itemToDelete, 1); }}
                className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium cursor-pointer"
              >
                ลบสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}