"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartstore";
import Image from "next/image";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);

  const [selected, setSelected] = useState<string[]>([])
  const toggleSelect = (id: string) => {
  setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const remove = useCartStore((state) => state.remove);

    const handleDecrease = (item: { id: any; name?: string; price?: number; image?: string; quantity: any; }) => {
        if (item.quantity === 1) {
            const confirmDelete = window.confirm("คุณต้องการลบสินค้าออกจากตะกร้าใช่หรือไม่");

            if (confirmDelete) {
                remove(item.id);
            }
        } else {
            decrease(item.id);
        }
    };

    const total = cart
        .filter((item) => selected.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (
    <div className="
    min-h-screen 
    text-(--sec)
    flex 
    flex-col 
    lg:flex-row 
    lg:items-start
    justify-center
    px-4
    lg:px-16
    lg:ml-24
    pt-10
    gap-20">

      {/* cart items */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold mb-6">ตะกร้าสินค้า</h1>

        {cart.map((item) => (
          <div key={item.id} className="flex gap-6 items-center border-t pt-3">

            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
              className="w-5 h-5 accent-(--bg) cursor-pointer"
            />
            <Image
              src={item.image}
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
              <button onClick={() => handleDecrease(item)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => increase(item.id)}>+</button>
            </div>

          </div>
        ))}
      </div>

      {/* order summary */}
      {selected.length > 0 && (
        <div className="
          w-[350px] 
          p-6 
          border-2 
          rounded-xl
          border-(--bg)">
            <h2 className="text-xl font-bold mb-4">
              ทำการสั่งซื้อ
            </h2>

            <div className="space-y-4">
                {cart
                    .filter((item) => selected.includes(item.id))
                    .map((item) => (
                        <div key={item.id} className="flex justify-between items-start">

                            <div className="flex flex-col">
                                <span className="font-semibold">{item.name}</span>
                                <span className="text-gray-500 text-sm">
                                    x{item.quantity}
                            </span>
                        </div>

                        <span className="text-gray-500 text-sm">
                            {item.price * item.quantity} ฿
                        </span>

                    </div>
                ))}
            <div className="border-t pt-3 font-bold flex justify-between">
                <span>รวมยอดสั่งซื้อ</span>
                <span>{total} ฿</span>
            </div>
        </div>

        <button className="mt-6 w-full bg-(--bg) text-white py-3 rounded-lg cursor-pointer hover:opacity-80 transition-colors duration-300">
          ชำระเงิน
        </button>

      </div>
      )}
    </div>
  );
}