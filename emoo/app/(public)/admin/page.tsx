"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Legend, Tooltip, Cell,
  PieChart, Pie,
} from "recharts";
import { Clock, User, Mail, Globe, Monitor, TrendingUp, Eye, Heart, DollarSign, BookOpen, RefreshCw, LogOut } from "lucide-react";

/* ─── Types ─── */
type LoginRecord = {
  id: string;
  username: string;
  email: string;
  login_at: string;
  ip_address: string;
  user_agent: string;
};

type CategoryCount = {
  category: string;
  count: number;
};

type MonthlyData = {
  month: string;
  love: number;
  money: number;
  study: number;
};

/* ─── Helpers ─── */
const CATEGORY_COLORS: Record<string, string> = {
  love: "#FF6B9D",
  money: "#FFD93D",
  study: "#6BCB77",
};

const CATEGORY_LABELS: Record<string, string> = {
  love: "ความรัก",
  money: "การเงิน",
  study: "การเรียน",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  love: <Heart size={18} />,
  money: <DollarSign size={18} />,
  study: <BookOpen size={18} />,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenUA(ua: string) {
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return ua.length > 30 ? ua.substring(0, 30) + "…" : ua;
}

function getMonthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
}

/* ─── Custom Tooltip for Monthly Chart ─── */
function MonthlyTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#1E1A33] border border-[#ffecd9]/20 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[#ffecd9] font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#ffecd9]/70">{CATEGORY_LABELS[entry.dataKey] ?? entry.dataKey}:</span>
          <span className="text-[#ffecd9] font-bold">{entry.value} ครั้ง</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminProfile() {
  const router = useRouter();
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryCount[]>([
    { category: "love", count: 0 },
    { category: "money", count: 0 },
    { category: "study", count: 0 },
  ]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminUsername, setAdminUsername] = useState("Admin");

  useEffect(() => {
    const stored = localStorage.getItem("admin_username");
    if (stored) setAdminUsername(stored);
  }, []);

  const fetchData = async () => {
    setRefreshing(true);

    // 1. Fetch login history
    const { data: logins } = await supabase
      .from("admin_login_history")
      .select("*")
      .order("login_at", { ascending: false })
      .limit(20);

    if (logins) setLoginHistory(logins);

    // 2. Fetch horoscope views
    const { data: views } = await supabase
      .from("horoscope_views")
      .select("category, viewed_at");

    if (views) {
      // Category totals
      const counts: Record<string, number> = { love: 0, money: 0, study: 0 };
      views.forEach((v) => {
        if (counts[v.category] !== undefined) counts[v.category]++;
      });
      setCategoryTotals(
        Object.entries(counts).map(([category, count]) => ({ category, count }))
      );
      setTotalViews(views.length);

      // Monthly breakdown (last 6 months)
      const monthMap: Record<string, Record<string, number>> = {};
      views.forEach((v) => {
        const label = getMonthLabel(v.viewed_at);
        if (!monthMap[label]) monthMap[label] = { love: 0, money: 0, study: 0 };
        if (monthMap[label][v.category] !== undefined) monthMap[label][v.category]++;
      });

      const sorted = Object.entries(monthMap)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => {
          // parse back to date for sorting
          const parse = (m: string) => {
            const parts = m.split(" ");
            return parts.join(" ");
          };
          return parse(a.month).localeCompare(parse(b.month));
        })
        .slice(-6);

      setMonthlyData(sorted as MonthlyData[]);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2d2a4a] flex items-center justify-center ml-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ffecd9]/30 border-t-[#ffecd9] rounded-full animate-spin" />
          <p className="text-[#ffecd9]/60 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2d2a4a] p-6 md:p-10 ml-16">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffecd9] to-[#c4a882] flex items-center justify-center shadow-lg shadow-[#ffecd9]/10">
            <User size={22} className="text-[#1E1A33]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#ffecd9]">{adminUsername}</h1>
            <p className="text-[#ffecd9]/40 text-xs">ประวัติการเข้าใช้งาน & สถิติการดูดวง</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#ffecd9]/60 text-sm hover:bg-white/10 hover:text-[#ffecd9] transition-all duration-200 disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            รีเฟรช
          </button>
          <button
            onClick={() => { localStorage.removeItem("admin_username"); router.push("/login"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut size={14} />
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* ═══ Stats Overview Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Views */}
        <div className="bg-gradient-to-br from-[#3E354F] to-[#2d2a4a] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#ffecd9]/10 flex items-center justify-center">
            <Eye size={20} className="text-[#ffecd9]" />
          </div>
          <div>
            <p className="text-[#ffecd9]/40 text-xs">ดูดวงทั้งหมด</p>
            <p className="text-2xl font-bold text-[#ffecd9]">{totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Per-category */}
        {categoryTotals.map((item) => (
          <div key={item.category} className="bg-gradient-to-br from-[#3E354F] to-[#2d2a4a] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: CATEGORY_COLORS[item.category] + "20" }}>
              <span style={{ color: CATEGORY_COLORS[item.category] }}>
                {CATEGORY_ICONS[item.category]}
              </span>
            </div>
            <div>
              <p className="text-[#ffecd9]/40 text-xs">{CATEGORY_LABELS[item.category]}</p>
              <p className="text-2xl font-bold text-[#ffecd9]">{item.count.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Charts Section ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Monthly Bar Chart — 2/3 width */}
        <div className="xl:col-span-2 bg-gradient-to-br from-[#3E354F] to-[#34304a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={18} className="text-[#ffecd9]" />
            <h2 className="text-lg font-bold text-[#ffecd9]">จำนวนการดูดวงรายเดือน</h2>
          </div>

          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData} barGap={2} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke="rgba(255,236,217,0.06)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#ffecd9", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,236,217,0.4)", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<MonthlyTooltip />} cursor={{ fill: "rgba(255,236,217,0.04)" }} />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: "#ffecd9", fontSize: 12 }}>
                      {CATEGORY_LABELS[value] ?? value}
                    </span>
                  )}
                />
                <Bar dataKey="love" fill={CATEGORY_COLORS.love} radius={[6, 6, 0, 0]} />
                <Bar dataKey="money" fill={CATEGORY_COLORS.money} radius={[6, 6, 0, 0]} />
                <Bar dataKey="study" fill={CATEGORY_COLORS.study} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[320px] text-[#ffecd9]/30">
              <Eye size={40} className="mb-3" />
              <p className="text-sm">ยังไม่มีข้อมูลการดูดวง</p>
            </div>
          )}
        </div>

        {/* Category Donut Chart — 1/3 width */}
        <div className="bg-gradient-to-br from-[#3E354F] to-[#34304a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye size={18} className="text-[#ffecd9]" />
            <h2 className="text-lg font-bold text-[#ffecd9]">สัดส่วนแต่ละหมวด</h2>
          </div>

          {totalViews > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="count"
                    nameKey="category"
                    strokeWidth={0}
                    paddingAngle={4}
                  >
                    {categoryTotals.map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-col gap-3 mt-2">
                {categoryTotals.map((item) => {
                  const pct = totalViews > 0 ? Math.round((item.count / totalViews) * 100) : 0;
                  return (
                    <div key={item.category} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] }} />
                      <span className="text-[#ffecd9]/70 text-sm flex-1">{CATEGORY_LABELS[item.category]}</span>
                      <span className="text-[#ffecd9] font-bold text-sm">{pct}%</span>
                      <span className="text-[#ffecd9]/40 text-xs">({item.count})</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-[#ffecd9]/30">
              <Eye size={40} className="mb-3" />
              <p className="text-sm">ยังไม่มีข้อมูล</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Login History Table ═══ */}
      <div className="bg-gradient-to-br from-[#3E354F] to-[#34304a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-white/5">
          <Clock size={18} className="text-[#ffecd9]" />
          <h2 className="text-lg font-bold text-[#ffecd9]">ประวัติการเข้าสู่ระบบ</h2>
          <span className="ml-auto text-[#ffecd9]/30 text-xs">{loginHistory.length} รายการล่าสุด</span>
        </div>

        <div className="overflow-x-auto">
          {loginHistory.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#ffecd9]/50 text-xs uppercase tracking-wider">
                  <th className="py-3 px-6 font-medium">ผู้ใช้</th>
                  <th className="py-3 px-6 font-medium">อีเมล</th>
                  <th className="py-3 px-6 font-medium">เข้าสู่ระบบเมื่อ</th>
                  <th className="py-3 px-6 font-medium">IP Address</th>
                  <th className="py-3 px-6 font-medium">Browser</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((log, i) => (
                  <tr
                    key={log.id || i}
                    className="border-t border-white/5 hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#ffecd9]/10 flex items-center justify-center">
                          <User size={13} className="text-[#ffecd9]/60" />
                        </div>
                        <span className="text-[#ffecd9] font-medium">{log.username || "admin"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-[#ffecd9]/60">
                        <Mail size={12} />
                        <span>{log.email || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-[#ffecd9]/60">
                        <Clock size={12} />
                        <span>{formatDate(log.login_at)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-[#ffecd9]/60">
                        <Globe size={12} />
                        <span className="font-mono text-xs">{log.ip_address}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-[#ffecd9]/60">
                        <Monitor size={12} />
                        <span>{shortenUA(log.user_agent)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#ffecd9]/30">
              <Clock size={36} className="mb-3" />
              <p className="text-sm">ยังไม่มีประวัติการเข้าสู่ระบบ</p>
              <p className="text-xs mt-1">ข้อมูลจะปรากฏเมื่อมีการเข้าสู่ระบบ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}