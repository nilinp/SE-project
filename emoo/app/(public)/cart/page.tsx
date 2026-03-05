"use client";

import { useCartStore } from "@/lib/cartstore";
import Image from "next/image";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-10 flex gap-10 text-(--sec)">

      {/* cart items */}
      <div className="flex-1 space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-6 items-center">

            <Image
              src={item.image}
              alt={item.name}
              width={120}
              height={120}
              className="rounded-xl"
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p>${item.price}</p>
            </div>

            <div className="flex gap-3 items-center">
              <button onClick={() => decrease(item.id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => increase(item.id)}>+</button>
            </div>

          </div>
        ))}
      </div>

      {/* order summary */}
      <div className="w-[350px] p-6 border rounded-xl">

        <h2 className="text-xl font-bold mb-4">
          Order Summary
        </h2>

        <div className="flex justify-between">
          <span>Total</span>
          <span>${total}</span>
        </div>

        <button className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg">
          Process to checkout
        </button>

      </div>
    </div>
  );
}