"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import tarot from "../../../../data/tarot.json";
import { supabase } from "@/lib/supabase";
import { History, ArrowBigLeft } from "lucide-react";
import { getDeviceId } from "@/lib/deviceId";


export default function ResultPage() {
    
    const { id } = useParams();
    const searchParams = useSearchParams();
    const category = searchParams.get("category");

    const cardId = Number(id);

    const card = (tarot.cards as any[]).find(
        (c) => Number(c.card_id) === cardId
    );

    const [expandedLove, setExpandedLove] = useState<'single' | 'couple' | null>(null);
    const router = useRouter();
    const hasSaved = useRef(false);

    /* ─── Save last viewed card to profile + track view ─── */
    useEffect(() => {
        if (!card || !category || hasSaved.current) return;
        hasSaved.current = true;

        const save = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                // ✅ check ซ้ำก่อน insert
                const cardIdInt = parseInt(card.card_id, 10);
                const { data: existing } = await supabase
                    .from("horoscope_views")
                    .select("id")
                    .eq("user_id", session?.user?.id ?? null)
                    .eq("card_id", cardIdInt)
                    .eq("category", category)
                    .limit(1);

                if (!existing || existing.length === 0) {
                    await supabase.from("horoscope_views").insert([
                        {
                            user_id: session?.user?.id ?? null,
                            category: category,
                            card_id: cardIdInt,
                        },
                    ]);
                }

                // ✅ save last card (เฉพาะ login)
                if (session) {
                    await supabase
                        .from("profiles")
                        .update({
                            last_card: {
                                card_id: card.card_id,
                                name: card.name,
                                image: card.image,
                                keyword: card.keyword,
                                category: category,
                                viewed_at: new Date().toISOString(),
                            },
                        })
                        .eq("id", session.user.id);
                }
            } catch (err) {
                console.error("Save history error:", err);
            }
        };

        save();
    }, [card?.card_id, category]);
    
    if (!card) return <div>Card not found</div>;

    return (

        <div className="min-h-screen pb-20 bg-[#2F2847] text-white overflow-x-hidden pt-0">

            <div className="sticky top-0 z-40 bg-[#2F2847]/95 backdrop-blur-md -mx-6 px-6 pt-6 pb-4 mb-4">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-[#ffecd9] hover:opacity-70 transition cursor-pointer"
                >
                    <ArrowBigLeft size={28} />
                </button>
            </div>

            <div className="p-6 pt-0 md:p-12">

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">

                    {/* ไพ่ */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">

                        <img
                            src={card.image}
                            className="w-64 md:w-80 rounded-xl shadow-2xl mb-6"
                        />

                        <h1 className="text-2xl md:text-3xl font-bold">
                            {card.name}
                        </h1>

                    </div>


                    {/* ข้อความ */}
                    <div className="w-full md:w-2/3 space-y-8">


                        {/* Keyword */}
                        <div className="bg-white/10 p-6 rounded-xl shadow-lg">

                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300 border-b-2 border-yellow-300/40 pb-2">
                                ความหมายไพ่
                            </h2>

                            <p className="leading-relaxed text-gray-200">
                                {card.keyword}
                            </p>

                        </div>


                        {/* Prediction */}
                        <div className="bg-white/10 p-6 rounded-xl shadow-lg">

                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-purple-300 border-b-2 border-purple-300/40 pb-2">
                                คำทำนาย
                            </h2>

                            {category === "love" && (

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                                    {/* Single */}
                                    <div 
                                        onClick={() => setExpandedLove(prev => prev === 'single' ? null : 'single')}
                                        className={`
                                            bg-[#5A5470] rounded-xl min-h-[150px] md:min-h-[180px]
                                            flex flex-col items-center justify-start text-center
                                            transition-all duration-300 cursor-pointer p-6 pt-8
                                            ${expandedLove === 'single' ? 'bg-[#6A6285]' : 'hover:bg-[#6A6285] hover:scale-[1.02] md:hover:scale-105'}
                                        `}
                                    >
                                        <div className={`transition-all duration-500 ${expandedLove === 'single' ? '-translate-y-2 md:-translate-y-6' : ''}`}>
                                            <h3 className="text-xl md:text-2xl font-semibold text-pink-300">Single</h3>
                                            <p className={`text-sm text-gray-300 mt-2 transition-opacity duration-300 ${expandedLove === 'single' ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
                                                แตะหรือคลิก เพื่อดูคำทำนาย
                                            </p>
                                        </div>
                                        <div className={`transition-all duration-500 overflow-hidden ${expandedLove === 'single' ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                                            <p className="text-gray-200 leading-loose text-center max-w-[420px] mx-auto flex-1">
                                                {card.love.single}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Couple */}
                                    <div 
                                        onClick={() => setExpandedLove(prev => prev === 'couple' ? null : 'couple')}
                                        className={`
                                            bg-[#5A5470] rounded-xl min-h-[150px] md:min-h-[180px]
                                            flex flex-col items-center justify-start text-center
                                            transition-all duration-300 cursor-pointer p-6 pt-8
                                            ${expandedLove === 'couple' ? 'bg-[#6A6285]' : 'hover:bg-[#6A6285] hover:scale-[1.02] md:hover:scale-105'}
                                        `}
                                    >
                                        <div className={`transition-all duration-500 ${expandedLove === 'couple' ? '-translate-y-2 md:-translate-y-6' : ''}`}>
                                            <h3 className="text-xl md:text-2xl font-semibold text-rose-300">Couple</h3>
                                            <p className={`text-sm text-gray-300 mt-2 transition-opacity duration-300 ${expandedLove === 'couple' ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
                                                แตะหรือคลิก เพื่อดูคำทำนาย
                                            </p>
                                        </div>
                                        <div className={`transition-all duration-500 overflow-hidden ${expandedLove === 'couple' ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                                            <p className="text-gray-200 leading-loose text-center max-w-[420px] mx-auto flex-1">
                                                {card.love.couple}
                                            </p>
                                        </div>
                                    </div>

                                </div>

                            )}
                            
                            {category === "money" && (
                                <p className="text-gray-200">
                                    {card.finance.predict}
                                </p>
                            )}

                            {category === "study" && (
                                <p className="text-gray-200">
                                    {card.job_edu.predict}
                                </p>
                            )}

                        </div>


                        {/* Guidance */}
                        <div className="bg-white/10 p-6 rounded-xl shadow-lg">

                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-pink-300 border-b-2 border-pink-300/40 pb-2">
                                คำแนะนำ
                            </h2>

                            {category === "love" && (
                                <p className="text-gray-200">
                                    {card.love.guidance}
                                </p>
                            )}

                            {category === "money" && (
                                <p className="text-gray-200">
                                    {card.finance.guidance}
                                </p>
                            )}

                            {category === "study" && (
                                <p className="text-gray-200">
                                    {card.job_edu.guidance}
                                </p>
                            )}

                        </div>

                    </div>

                </div>

                {/* Next Button */}
                <div className="max-w-6xl mx-auto flex justify-end mt-8">

                    <button
                        onClick={() => router.push("/history")}
                        className="
                                flex
                                items-center
                                cursor-pointer
                                gap-2
                                px-6 md:px-8
                                py-3
                                rounded-xl
                                bg-gradient-to-r
                                from-purple-500
                                to-indigo-500
                                text-yellow-200
                                font-semibold
                                tracking-wide
                                shadow-lg
                                shadow-purple-900/40
                                border
                                border-yellow-300/30
                                hover:scale-105
                                hover:shadow-purple-500/40
                                hover:from-purple-400
                                hover:to-indigo-400
                                transition
                                duration-300
                                "
                    >
                        <History size={16} /> ดูประวัติทั้งหมด
                    </button>

                </div>

            </div>

        </div>
    );
}