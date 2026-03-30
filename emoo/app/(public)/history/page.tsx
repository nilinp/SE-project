"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import tarot from "../../data/tarot.json";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";

type View = {
    id: string;
    card_id: number | string;
    category: string;
    created_at: string;
};

export default function HistoryPage() {
    const [views, setViews] = useState<View[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const cardMap = useMemo(() => {
        const map: Record<string, any> = {};
        (tarot.cards as any[]).forEach((c) => {
            map[String(c.card_id)] = c;
        });
        return map;
    }, []);

    const fetchHistory = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            // ✅ ถ้าไม่ login → ไม่ต้องโหลด
            if (!session) {
                setViews([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("horoscope_views")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false })
                .limit(30);

            if (error) {
                console.error("Fetch error:", error);
                return;
            }

            setViews(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const stats = useMemo(() => {
        return views.reduce((acc: Record<string, number>, cur) => {
            acc[cur.category] = (acc[cur.category] || 0) + 1;
            return acc;
        }, {});
    }, [views]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#2F2847] flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2F2847] text-white flex">
            <Sidebar />

            <div className="flex-1 md:ml-20 p-10 flex gap-8">

                {/* LEFT */}
                <div className="flex-[2] bg-[#4A445F] rounded-2xl p-8">
                    <h1 className="text-3xl font-bold mb-8">History</h1>

                    {views.length === 0 && (
                        <p className="text-gray-400">
                            ยังไม่มีประวัติการดูดวง
                        </p>
                    )}

                    <div className="space-y-6">
                        {views.map((view) => {
                            const card = cardMap[String(view.card_id)];
                            if (!card) return null;

                            return (
                                <div
                                    key={view.id}
                                    className="flex gap-6 items-center bg-[#5A5470] rounded-xl p-5 shadow-lg hover:scale-[1.02] transition duration-300"
                                >
                                    {/* ไพ่ */}
                                    <img
                                        src={card.image}
                                        className="w-28 h-44 object-cover rounded-lg shadow-md"
                                    />

                                    {/* info */}
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-gray-300 capitalize">
                                            🔮 {view.category}
                                        </p>

                                        <h2 className="text-xl font-bold text-yellow-200">
                                            {card.name}
                                        </h2>

                                        <p className="text-sm text-gray-400">
                                            🕒{" "}
                                            {new Date(view.created_at).toLocaleString("th-TH", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>

                                        <div className="mt-3">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/horoscope/result/${card.card_id}?category=${view.category}`
                                                    )
                                                }
                                                className="px-4 py-2 rounded-lg bg-yellow-200 text-black text-sm font-medium hover:scale-105 transition"
                                            >
                                                🔁 ดูความหมายอีกครั้ง
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="w-72 bg-gradient-to-b from-[#3B3560] to-[#1F1A33] rounded-2xl p-6 shadow-xl">
                    <div className="bg-white/10 rounded-xl p-4 space-y-2">
                        <Stat label="Love" value={stats.love ?? 0} />
                        <Stat label="Money" value={stats.money ?? 0} />
                        <Stat label="Study" value={stats.study ?? 0} />
                        <Stat label="Travel" value={stats.travel ?? 0} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value?: number }) {
    return (
        <div className="flex justify-between">
            <span>{label}</span>
            <span>{value || 0}</span>
        </div>
    );
}