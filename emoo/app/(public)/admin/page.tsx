"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

type Tab = "Horoscope" | "Shopping";

const horoscopeData = [
  { month: "MONTH 1", Love: 80, Finances: 55, Study: 65 },
  { month: "MONTH 2", Love: 60, Finances: 90, Study: 70 },
  { month: "MONTH 3", Love: 30, Finances: 75, Study: 40 },
];

const shoppingData = [
  { month: "MONTH 1", Crystal: 40, Tarot: 70, Jewelry: 55 },
  { month: "MONTH 2", Crystal: 80, Tarot: 50, Jewelry: 65 },
  { month: "MONTH 3", Crystal: 60, Tarot: 90, Jewelry: 30 },
];

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState<Tab>("Horoscope");

  const data = activeTab === "Horoscope" ? horoscopeData : shoppingData;

  return (
    <div className="flex-1 flex flex-col items-center p-8 gap-6 min-h-screen bg-[#2d2a4a]">

      {/* Tab Toggle */}
      <div className="flex bg-[#f5e6d0] rounded-full p-1">
        {(["Horoscope", "Shopping"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === tab
                ? "bg-[#2d2a6e] text-white"
                : "text-gray-500 bg-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-[#c4a882] rounded-2xl p-7 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-[#1e1b4b] mb-5">Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.1)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#1e1b4b", fontWeight: 600 }}
            />
            <YAxis hide />
            <Legend
              align="right"
              verticalAlign="middle"
              layout="vertical"
              wrapperStyle={{ color: "#1e1b4b", fontSize: 13 }}
            />
            {activeTab === "Horoscope" ? (
              <>
                <Bar dataKey="Love"     fill="#ffffff" radius={[2,2,0,0]} />
                <Bar dataKey="Finances" fill="#2d2a6e" radius={[2,2,0,0]} />
                <Bar dataKey="Study"    fill="#0a0a0a" radius={[2,2,0,0]} />
              </>
            ) : (
              <>
                <Bar dataKey="Crystal" fill="#ffffff" radius={[2,2,0,0]} />
                <Bar dataKey="Tarot"   fill="#2d2a6e" radius={[2,2,0,0]} />
                <Bar dataKey="Jewelry" fill="#0a0a0a" radius={[2,2,0,0]} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}