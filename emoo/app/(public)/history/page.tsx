"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import tarot from "../../data/tarot.json";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import { Heart, DollarSign, BookOpen } from "lucide-react";


type View = {
    id: string;
    card_id: number | string;
    category: string;
    viewed_at: string;
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
                .order("viewed_at", { ascending: false })
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
                            // FIX: zero-pad card_id to match tarot.json keys (e.g. 0 -> "00")
                            const card = cardMap[String(view.card_id).padStart(2, "0")];

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
                                                view.viewed_at
                                            ).toLocaleDateString()}
                                        </p>

                                        {/* buttons */}
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/horoscope/result/${card.card_id}?category=${view.category}`
                                                    )
                                                }
                                                className="
                                                bg-purple-300 
                                                text-(--bg)
                                                px-3 
                                                py-1 
                                                rounded-md 
                                                text-sm 
                                                hover:opacity-80
                                                cursor-pointer
                                                "
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
                <div className="
                w-80 
                h-80
                bg-gradient-to-b 
                from-[#3B3560] 
                to-[#1F1A33] 
                rounded-2xl 
                p-6 
                shadow-xl
                ">

                    <div className="flex flex-col gap-4 mt-4">
                        <StatCard
                            icon={<Heart size={20} style={{ color: "#f472b6" }} />}
                            label="ความรัก"
                            value={stats.love}
                            iconBg="rgba(236,72,153,0.2)"
                        />
                        <StatCard
                            icon={<DollarSign size={20} style={{ color: "#facc15" }} />}
                            label="การเงิน"
                            value={stats.money}
                            iconBg="rgba(250,204,21,0.2)"
                        />
                        <StatCard
                            icon={<BookOpen size={20} style={{ color: "#4ade80" }} />}
                            label="การเรียน"
                            value={stats.study}
                            iconBg="rgba(74,222,128,0.15)"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ reusable stat card
function StatCard({ icon, label, value, iconBg }: {
    icon: React.ReactNode;
    label: string;
    value?: number;
    iconBg: string;
}) {
    return (
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: iconBg }}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-xl font-bold text-white">{value || 0}</p>
            </div>
        </div>
    );
}