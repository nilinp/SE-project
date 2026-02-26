"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import TabSwitch from "@/app/components/tabswitch";
import Sidebar from "@/app/components/sidebar";
import SearchBar from "@/app/components/SearchBar";
import luckyData from "@/app/data/luckycolor.json";
import Image from "next/image";

export default function Horoscope() {

  const [open, setOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const todayColor = luckyData.lucky_color.find(
    (item) => item.name === today
  );

  return (
    <div className="relative min-h-screen bg-[#2B2343] text-white flex">

      <Sidebar/>

      {/* TOP BAR */}
      <div className="absolute top-6 left-0 w-full px-16 flex items-center justify-between">

        <div className="ml-24">
          <TabSwitch />
        </div>

        <SearchBar />

      </div>

      {/* LEFT SECTION */}
      <div className="flex-1 p-16 pt-28 ml-24">

        {/* CATEGORY BOX */}
        <div className="bg-gradient-to-b from-[#4B415E] to-[#3E354F]
          p-10 rounded-[32px] shadow-2xl
          max-w-4xl border border-[#6B5E7A]">

          {/* HEADER */}
          <div className="flex items-center gap-6 mb-12">

            <div className="w-16 h-[4px] bg-[#E6D5B8]" />

            <h2 className="text-6xl font-extrabold text-[#F3E2C7]
            drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
              Category
            </h2>

            <p className="text-sm text-[#CBBBA3] mt-4 whitespace-nowrap">
              Choose what you want to know about today
            </p>

            <div className="flex-1 h-[4px] bg-[#E6D5B8]" />
            <div className="w-6 h-[4px] bg-[#E6D5B8]" />

          </div>

          {/* CARD LIST */}
          <div className="flex justify-between px-6">
            {[
              { icon: "❤️", label: "Love" },
              { icon: "💵", label: "Finances" },
              { icon: "📚", label: "Study" },
            ].map((item, index) => (
              <div key={index}
                className="flex flex-col items-center gap-4 cursor-pointer group">

                <div className="relative bg-[#F3E2C7]
                w-44 h-44 rounded-2xl
                flex items-center justify-center
                shadow-lg
                group-hover:scale-105
                transition duration-300">

                  <div className="absolute -top-3
                  w-12 h-6 bg-[#3E354F]
                  rounded-b-xl" />

                  <span className="text-6xl">{item.icon}</span>
                </div>

                <p className="text-[#F3E2C7] text-xl font-semibold">
                  {item.label}
                </p>

              </div>
            ))}
          </div>
        </div>

        {/* LUCKY COLOR BOX */}
        <div className="mt-10 bg-[#8E7F7F]
          p-10 rounded-[28px]
          border border-[#B9AFAF]
          shadow-xl
          max-w-4xl">

          <div className="flex items-center gap-6 mb-8">

            <div className="w-16 h-[3px] bg-[#3E354F]" />

            <h2 className="text-5xl font-bold text-[#F3E2C7]">
              Lucky color
            </h2>

            <span className="text-xs text-[#3E354F] mt-3">
              Your color of the day
            </span>

            <div className="flex-1 h-[3px] bg-[#3E354F]" />
            <div className="w-6 h-[3px] bg-[#3E354F]" />

          </div>

          {todayColor && (
            <div className="flex items-center justify-between">

              {/* LEFT SIDE */}
              <div className="flex items-center gap-10">

                {/* Day */}
                <p className="text-2xl font-semibold text-[#F3E2C7]">
                  {todayColor.name}
                </p>

                {/* Recommended Colors */}
                <div className="flex items-center gap-4">
                  {[
                    ...todayColor.work,
                    ...todayColor.lucky,
                    ...todayColor.money,
                    ...todayColor.love
                  ]
                    .slice(0, 4) // กันยาวเกิน
                    .map((color, index) => (
                      <div
                        key={index}
                        className="w-14 h-14 rounded-full shadow-lg border border-white/30 hover:scale-110 transition duration-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-8">

                {/* Unlucky */}
                <div className="flex items-center gap-4 bg-red-500/10 px-4 py-2 rounded-xl border border-red-400">

                  <span className="text-red-400 text-sm font-medium">
                    ⚠ Unlucky
                  </span>

                  <div className="flex gap-2">
                    {todayColor.unlucky.map((color, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-full border-2 border-red-400 shadow-md hover:scale-110 transition"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                </div>

                {/* View Button */}
                <button
                  onClick={() => setOpen(true)}
                  className="text-sm text-[#3E354F] underline hover:opacity-70 transition"
                >
                  View full →
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-col items-center pt-28 gap-6">

        {/* 🃏 Tarot Card */}
        <div className="relative w-[420px] h-[650px] rounded-[40px] overflow-hidden">

          {/* พื้นหลังดาว */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/Profile-bg.jpg')" }}
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-[#1E1A33]/60" />

          {/* มุมเว้า */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2
                 w-24 h-24 bg-[#2B2343] rounded-full"
          />

        </div>

      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          >

            <motion.div
              className="bg-[#3E354F] w-[90%] max-w-5xl max-h-[85vh] overflow-y-auto
        p-12 rounded-3xl shadow-2xl relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 text-white text-2xl"
              >
                ✕
              </button>

              <h1 className="text-4xl font-bold mb-10 text-[#F3E2C7]">
                Lucky Color
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {luckyData.lucky_color.map((day) => (
                  <div
                    key={day.name}
                    className="bg-[#4B415E] p-8 rounded-2xl shadow-xl border border-[#6B5E7A]"
                  >

                    {/* Day Title */}
                    <h2 className="text-2xl font-bold text-[#F3E2C7] mb-6">
                      {day.name}
                    </h2>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 gap-6">

                      {Object.entries(day)
                        .filter(([key]) => key !== "name")
                        .map(([category, colors]) => {

                          const isUnlucky = category === "unlucky";

                          return (
                            <div
                              key={category}
                              className={`flex flex-col gap-3 p-4 rounded-xl transition duration-300
        ${isUnlucky
                                  ? "bg-red-500/10 border-2 border-red-500 "
                                  : "bg-white/5 border border-white/10"
                                }`}
                            >

                              <p
                                className={`capitalize text-sm font-semibold ${isUnlucky ? "text-red-400" : "text-[#CBBBA3]"
                                  }`}
                              >
                                {isUnlucky ? "⚠ unlucky" : category}
                              </p>

                              <div className="flex gap-3">
                                {colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className={`w-10 h-10 rounded-full shadow-md border
                ${isUnlucky ? "border-red-400" : "border-white/30"}
                hover:scale-110 transition duration-300`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>

                            </div>
                          );
                        })}

                    </div>

                  </div>
                ))}
              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}