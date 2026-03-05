"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

const horoscopeData = [
  { month: "MONTH 1", Love: 80, Finances: 55, Study: 65 },
  { month: "MONTH 2", Love: 60, Finances: 90, Study: 70 },
  { month: "MONTH 3", Love: 30, Finances: 75, Study: 40 },
];

export default function AdminHome() {
  return (
    <div className="flex-1 flex flex-col items-center p-8 gap-6 min-h-screen bg-[#2d2a4a]">

      {/* Tab Toggle */}
      <div className="flex bg-[#f5e6d0] rounded-full p-1">
        <button className="px-6 py-2 rounded-full font-semibold text-sm bg-[#2d2a6e] text-white">
          Horoscope
        </button>
        <Link href="/admin/shopping">
          <button className="px-6 py-2 rounded-full font-semibold text-sm text-gray-500">
            Shopping
          </button>
        </Link>
      </div>

      {/* Chart Card */}
      <div className="bg-[#c4a882] rounded-2xl p-7 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-[#1e1b4b] mb-5">Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={horoscopeData} barGap={4}>
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
            <Bar dataKey="Love"     fill="#ffffff" radius={[2,2,0,0]} />
            <Bar dataKey="Finances" fill="#2d2a6e" radius={[2,2,0,0]} />
            <Bar dataKey="Study"    fill="#0a0a0a" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}