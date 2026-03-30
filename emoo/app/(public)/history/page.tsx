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

    // FIX: map ใช้ string key เท่านั้น
    const cardMap = useMemo(() => {
        const map: Record<string, any> = {};
        (tarot.cards as any[]).forEach((c) => {
            map[String(c.card_id)] = c;
        });
        return map;
    }, []);

    // fetch history
    const fetchHistory = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setViews([]);
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

            console.log("DATA FROM DB:", data); // 🔥 debug

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

    // stats
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
                <div className="flex-1 bg-[#4A445F] rounded-2xl p-6">
                    <h1 className="text-2xl font-bold mb-6">History</h1>

                    {views.length === 0 && (
                        <p className="text-gray-400">
                            ยังไม่มีประวัติการดูดวง
                        </p>
                    )}

                    <div className="space-y-6">
                        {views.map((view) => {
                            // FIX สำคัญตรงนี้
                            const card = cardMap[String(view.card_id)];

                            // 🔥 debug ถ้าไม่ขึ้น
                            if (!card) {
                                console.log("NOT FOUND CARD:", view.card_id);
                                return null;
                            }

                            return (
                                <div
                                    key={view.id}
                                    className="flex gap-4 items-center border-b border-white/10 pb-4"
                                >
                                    {/* ไพ่ */}
                                    <img
                                        src={card.image}
                                        className="w-20 h-32 object-cover rounded-md"
                                    />

                                    {/* info */}
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-300 capitalize">
                                            {view.category}
                                        </p>

                                        <h2 className="text-lg font-semibold">
                                            {card.name}
                                        </h2>

                                        <p className="text-xs text-gray-400">
                                            {new Date(
                                                view.created_at
                                            ).toLocaleDateString()}
                                        </p>

                                        {/* buttons */}
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/result/${card.card_id}?category=${view.category}&type=meaning`
                                                    )
                                                }
                                                className="bg-yellow-200 text-black px-3 py-1 rounded-md text-sm hover:opacity-80"
                                            >
                                                Meaning
                                            </button>

                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/result/${card.card_id}?category=${view.category}&type=predict`
                                                    )
                                                }
                                                className="bg-purple-300 text-black px-3 py-1 rounded-md text-sm hover:opacity-80"
                                            >
                                                Predict
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="w-80 bg-gradient-to-b from-[#3B3560] to-[#1F1A33] rounded-2xl p-6 shadow-xl">

                    <div className="bg-white/10 rounded-xl p-4 space-y-2">
                        <Stat label="Love" value={stats.love} />
                        <Stat label="Money" value={stats.money} />
                        <Stat label="Study" value={stats.study} />
                        <Stat label="Travel" value={stats.travel} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ reusable
function Stat({ label, value }: { label: string; value?: number }) {
    return (
        <div className="flex justify-between">
            <span>{label}</span>
            <span>{value || 0}</span>
        </div>
    );
}