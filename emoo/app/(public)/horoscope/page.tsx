"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import TabSwitch from "@/app/components/tabswitch";
import rawData from "@/app/data/luckycolor.json";
import UserProfileCard from "@/app/components/UserProfileCard";
import { Eye, X } from "lucide-react";

type LuckyDay = {
  name: string;
  work: string[];
  lucky: string[];
  money: string[];
  love: string[];
  unlucky: string[];
}

type LuckyData = {
  lucky_color: LuckyDay[];
}

const luckyData = rawData as LuckyData;

export default function Horoscope() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString("th-TH", { 
      weekday: "long" });
    setToday(today);
  }, []);

  const todayColor = luckyData.lucky_color.find(
    (item) => item.name === today
  );

  // กันbgเลื่อนตอนเปิด lucky color modal
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]); 

  const router = useRouter();

  const categories = [
    { src: "/category/love.jpg", label: "ความรัก", slug: "love" },
    { src: "/category/money.jpg", label: "การเงิน", slug: "money" },
    { src: "/category/study.jpg", label: "การเรียน", slug: "study" },
  ];

  return (
    <div className="
    min-h-screen 
    bg-(--bg) 
    flex 
    flex-col 
    lg:flex-row 
    lg:items-start
    justify-center
    px-4
    lg:px-16
    lg:ml-24
    pt-10
    gap-10">
      {/* LEFT SECTION */}
      <div className="w-full lg:w-2/3 flex flex-col items-center">

        <div className="w-full mb-10 flex justify-center">
          <TabSwitch />
        </div>

        {/* CATEGORY BOX */}
        <div className="
          mt-5
          bg-(--bg3)
          p-10 
          rounded-[32px] 
          shadow-2xl
          w-full
          max-w-4xl 
          mx-auto
          border 
          border-(--main)">
          
          {/* HEADER */}
          <div className="flex items-center gap-6 mb-12">

            <div className="w-16 h-[4px] bg-[#E6D5B8]" />

            <h2 className="
            text-4xl md:text-6xl
            font-extrabold 
            text-(--main)
            drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
              หมวดหมู่
            </h2>

            <p className="text-sm text-(--main) mt-4 whitespace-nowrap">
              วันนี้คุณอยากรู้อะไร?
            </p>

            <div className="flex-1 h-[4px] bg-(--main)" />
            <div className="w-6 h-[4px] bg-(--main)" />
          </div>

          <div className="text-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-4 mt-10">
            {categories.map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(`/horoscope/${item.slug}`)}
                className="flex flex-col items-center gap-4 cursor-pointer group"
              >
                <div
                  className=" relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44
                              rounded-2xl bg-cover bg-center overflow-hidden
                              shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
                  style={{ backgroundImage: `url(${item.src})` }}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                </div>

                <p className="text-(--main) text-xl font-semibold">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* LUCKY COLOR BOX */}
        <div className="mt-10 bg-[#8E7F7F]
          p-10 rounded-[28px]
          border border-(--main)
          shadow-xl
          w-full
          max-w-4xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-[3px] bg-(--bg)" />
              <h2 className="text-5xl font-bold text-(--main)">
                สีเสริมดวงวันนี้
              </h2>
              <div className="flex-1 h-[3px] bg-(--bg)" />
              <div className="w-6 h-[3px] bg-(--bg)" />
            </div>

            {todayColor && (
              <div className="flex flex-col items-center gap-6">
                {/* วัน */}
                <p className="text-2xl font-bold text-(--main)">
                  {todayColor.name}
                </p>

                {/* สี */}
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                  ...todayColor.work.map(c => ({ color: c, type: "การงาน/การเรียน" })),
                  ...todayColor.lucky.map(c => ({ color: c, type: "โชคลาภ" })),
                  ...todayColor.money.map(c => ({ color: c, type: "การเงิน" })),
                  ...todayColor.love.map(c => ({ color: c, type: "ความรัก" })),
                  ]
                  .slice(0, 8)
                .map((item, index) => (
                  <div key={index} className="relative group">
                    <div
                      className="
                      w-12 
                      h-12 
                      rounded-full 
                      shadow-lg 
                      border 
                      border-white/30 
                      hover:scale-110 
                      transition 
                      duration-300
                      cursor-pointer
                      "
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-(--bg) text-(--main) text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      {item.type}
                    </div>
                  </div>
                ))}
                </div>
                
                {/* กาลกิณี */}
                <div className="flex items-center gap-4 bg-red-500/10 px-4 py-2 rounded-xl border border-red-400">
                  <span className="text-red-400 text-sm font-medium">
                    ⚠ กาลกิณี
                  </span>
                   
                   <div className="flex gap-2">
                    {todayColor.unlucky.map((color, index) => (
                      <div
                        key={index}
                        className="
                        w-10 
                        h-10 
                        rounded-full 
                        border-2 
                        border-red-400 
                        shadow-md 
                        hover:scale-110 
                        transition
                        cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                   </div>
                </div>
                
                {/* View Button */}
                <button
                  onClick={() => setOpen(true)}
                  className="
                  mt-4 
                  px-6 
                  py-2 
                  rounded-full 
                  bg-(--main) 
                  text-(--bg) 
                  text-sm 
                  font-medium 
                  hover:opacity-70 
                  transition
                  cursor-pointer
                  flex items-center gap-2
                  "
                >
                  ดูทั้งหมด <Eye size={16} />
                </button>
                
              </div>
            )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/3 flex flex-col items-center">
        {/* 👤 User Profile Card */}
        <div className="
          relative
          w-full
          max-w-xs sm:max-w-sm lg:max-w-[380px]
          aspect-[3/4]
          rounded-[40px]
          overflow-hidden">
          <UserProfileCard />
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
          onClick={() => setOpen(false)} > 

            <motion.div
              className="
              bg-[#3E354F] 
              w-[90%] 
              max-w-5xl 
              max-h-[85vh] 
              overflow-y-auto
              p-12 
              rounded-3xl 
              shadow-2xl 
              relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} >
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-6 right-6 text-white text-2xl cursor-pointer hover:text-red-400 transition" >
                  <X size={36}/>
                </button>

                <h1 className="text-4xl font-bold mb-10 text-[#F3E2C7]">
                  ตารางสีมงคล
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {luckyData.lucky_color.map((day) => (
                    <div
                      key={day.name}
                      className="bg-[#4B415E] p-8 rounded-2xl shadow-xl border border-[#6B5E7A]" >
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
                            const categoryLabel: Record<string, string> = {
                              work: "การเรียน",
                              lucky: "โชคลาภ",
                              money: "การเงิน",
                              love: "ความรัก",
                              unlucky: "กาลกิณี",
                            };

                            return (
                              <div key={category} className={`
                                flex 
                                flex-col 
                                gap-3 
                                p-4 
                                rounded-xl 
                                transition 
                                duration-300
                                cursor-pointer
                                ${isUnlucky
                                ? "bg-red-500/10 border-2 border-red-500 "
                                : "bg-white/5 border border-white/10"
                              }`}>

                              <p className={`
                                text-sm 
                                font-semibold 
                                ${isUnlucky ? "text-red-400" : "text-[#CBBBA3]" }`}>
                                {isUnlucky ? "⚠ " : ""}{categoryLabel[category] || category}
                              </p>

                              <div className="flex gap-3">
                              {(colors as string[]).map((color, index) => (
                                <div
                                  key={index}
                                  className={`
                                    w-10 
                                    h-10 
                                    rounded-full 
                                    shadow-md 
                                    border
                                    ${isUnlucky ? "border-red-400" : "border-white/30"}
                                    hover:scale-110 
                                    transition duration-300`}
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