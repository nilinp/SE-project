"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import tarot from "../../../../data/tarot.json";
import { supabase } from "@/lib/supabase";



export default function ResultPage() {
    
    

    const { id } = useParams();
    const searchParams = useSearchParams();
    const category = searchParams.get("category");

    const cardId = Number(id);

    const card = (tarot.cards as any[]).find(
        (c) => Number(c.card_id) === cardId
    );

    const [loveType, setLoveType] = useState("single");
    const router = useRouter();

    /* ─── Save last viewed card to profile ─── */
    useEffect(() => {
        if (!card) return;
        const save = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await supabase
                .from("profiles")
                .update({
                    last_card: {
                        card_id: card.card_id,
                        name: card.name,
                        image: card.image,
                        keyword: card.keyword,
                        category: category ?? "",
                        viewed_at: new Date().toISOString(),
                    },
                })
                .eq("id", session.user.id);
        };
        save();
    }, [card?.card_id]);

    if (!card) return <div>Card not found</div>;

    return (

        <div className="min-h-screen bg-[#2F2847] text-white p-12">

            <div className="max-w-6xl mx-auto flex gap-16 items-start">

                {/* ไพ่ */}
                <div className="w-1/3 flex flex-col items-center">

                    <img
                        src={card.image}
                        className="w-80 rounded-xl shadow-2xl mb-6"
                    />

                    <h1 className="text-3xl font-bold">
                        {card.name}
                    </h1>

                </div>


                {/* ข้อความ */}
                <div className="w-2/3 space-y-8">


                    {/* Keyword */}
                    <div className="bg-white/10 p-6 rounded-xl shadow-lg">

                        <h2 className="text-3xl font-bold mb-4 text-yellow-300 border-b-2 border-yellow-300/40 pb-2">
                            ความหมายไพ่
                        </h2>

                        <p className="leading-relaxed text-gray-200">
                            {card.keyword}
                        </p>

                    </div>


                    {/* Prediction */}
                    <div className="bg-white/10 p-6 rounded-xl shadow-lg">

                        <h2 className="text-3xl font-bold mb-4 text-purple-300 border-b-2 border-purple-300/40 pb-2">
                            คำทำนาย
                        </h2>

                        {category === "love" && (

                            <div className="grid md:grid-cols-2 gap-6 mt-4">

                                {/* Single */}
                                <div className="
                                            bg-[#5A5470]
                                            rounded-xl
                                            min-h-[180px]
                                            flex
                                            flex-col
                                            items-center
                                            justify-start
                                            text-center
                                            transition-all
                                            duration-300
                                            hover:scale-105
                                            hover:bg-[#6A6285]
                                            group
                                            cursor-pointer
                                            p-6
                                            pt-8
                                            ">

                                    {/* Title */}
                                    <div className="
                                            transition-all
                                            duration-500
                                            group-hover:-translate-y-6
                                            ">

                                        <h3 className="text-2xl font-semibold text-pink-300">
                                            Single
                                        </h3>

                                        <p className="
                                            text-sm
                                            text-gray-300
                                            mt-2
                                            transition-opacity
                                            duration-300
                                            group-hover:opacity-0
                                            ">
                                            เลื่อนเมาส์เพื่อดูคำทำนาย
                                        </p>

                                    </div>

                                    {/* Prediction text */}
                                    <p className="
                                            text-gray-200
                                            leading-loose
                                            mt-4
                                            opacity-0
                                            origin-top
                                            max-h-0
                                            overflow-hidden
                                            transition-all
                                            duration-500
                                            group-hover:opacity-100
                                            group-hover:scale-y-100
                                            group-hover:max-h-[400px]
                                            text-center
                                            max-w-[420px]
                                            mx-auto
                                            ">
                                        {card.love.single}
                                    </p>

                                </div>


                                {/* Couple */}
                                <div className="
                                            bg-[#5A5470]
                                            rounded-xl
                                            min-h-[180px]
                                            flex
                                            flex-col
                                            items-center
                                            justify-start
                                            text-center
                                            transition-all
                                            duration-300
                                            hover:scale-105
                                            hover:bg-[#6A6285]
                                            group
                                            cursor-pointer
                                            p-6
                                            pt-8
                                            ">

                                    {/* Title */}
                                    <div className="
                                            transition-all
                                            duration-500
                                            group-hover:-translate-y-6
                                            ">

                                        <h3 className="text-2xl font-semibold text-rose-300">
                                            Couple
                                        </h3>

                                        <p className="
                                            text-sm
                                            text-gray-300
                                            mt-2
                                            transition-opacity
                                            duration-300
                                            group-hover:opacity-0
                                            ">
                                            เลื่อนเมาส์เพื่อดูคำทำนาย
                                        </p>

                                    </div>

                                    {/* Prediction text */}
                                    <p className="
                                            text-gray-200
                                            leading-loose
                                            mt-4
                                            opacity-0
                                            max-h-0
                                            overflow-hidden
                                            transition-all
                                            duration-500
                                            group-hover:opacity-100
                                            group-hover:max-h-[1000px]
                                            text-center
                                            max-w-[420px]
                                            mx-auto
                                            ">
                                        {card.love.couple}
                                    </p>

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

                        <h2 className="text-3xl font-bold mb-4 text-pink-300 border-b-2 border-pink-300/40 pb-2">
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
            <div className="max-w-6xl mx-auto flex justify-end mt-10">

                <button
                    onClick={() => router.push("/history")}
                    className="
                            px-8
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
                    Next →
                </button>

            </div>

        </div>
    );
}