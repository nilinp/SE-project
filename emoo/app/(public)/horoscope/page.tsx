import TabSwitch from "@/app/components/tabswitch";
import Sidebar from "@/app/components/sidebar";
import SearchBar from "@/app/components/SearchBar";
import Image from "next/image";

export default function Horoscope() {
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


    </div>
  );
}