"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import tarot from "../../../data/tarot.json";
import { Shuffle, ArrowBigLeft } from "lucide-react";

export default function SelectCardPage() {

    const { category } = useParams();
    const router = useRouter();

    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Only render cards on client to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const total = tarot.cards.length;

    const handleSelectCard = (index: number) => {
        if (selectedCard !== null || isShuffling) return;
        setSelectedCard(index);

        const randomId = Math.floor(Math.random() * tarot.cards.length);
        setTimeout(() => {
            router.push(`/horoscope/result/${randomId}?category=${category}`);
        }, 1200);
    };

    const handleShuffle = useCallback(() => {
        if (selectedCard !== null || isShuffling) return;
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 600);
    }, [selectedCard, isShuffling]);

    const getThaiName = () => {
        if (category === "love") return "ความรัก";
        if (category === "money") return "การเงิน";
        if (category === "study") return "การเรียน";
        return "";
    };

    return (
        <div className="relative min-h-screen bg-[#2F2847] text-white p-10 md:pl-28 overflow-hidden">

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-[#ffecd9] hover:opacity-70 transition cursor-pointer mb-4"
            >
                <ArrowBigLeft size={28} />
            </button>

            <h1 className="text-4xl text-center mb-4 font-semibold">
                Select Card - {getThaiName()}
            </h1>

            {/* Shuffle Button */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleShuffle}
                    disabled={selectedCard !== null || isShuffling}
                    className="
                        flex items-center gap-2
                        px-6 py-2.5
                        rounded-full
                        bg-gradient-to-r from-purple-600 to-indigo-600
                        text-white font-medium text-sm
                        shadow-lg shadow-purple-900/30
                        hover:from-purple-500 hover:to-indigo-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        cursor-pointer
                        hover:scale-105 active:scale-95
                    "
                >
                    <Shuffle
                        size={16}
                        className={isShuffling ? "animate-spin" : ""}
                    />
                    สับไพ่
                </button>
            </div>

            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative w-full max-w-[1200px] h-[450px]">

                    {mounted && Array.from({ length: total }).map((_, index) => {

                        const spread = Math.PI / 3;
                        const start = -spread / 2;
                        const angle = start + (spread / (total - 1)) * index;
                        const radius = 900;
                        const x = radius * Math.sin(angle);
                        const y = radius * (1 - Math.cos(angle)) - 200;
                        const deg = angle * (180 / Math.PI);

                        const isSelected = selectedCard === index;
                        const isOther = selectedCard !== null && selectedCard !== index;

                        return (
                            <motion.div
                                key={index}
                                onClick={() => handleSelectCard(index)}

                                initial={{ x, y, rotate: deg, scale: 1, opacity: 1 }}

                                animate={
                                    isShuffling
                                        ? { x: 0, y: -50, rotate: 0, scale: 0.9, opacity: 1 }
                                        : isSelected
                                            ? { x: 0, y: -100, rotate: 0, scale: 1.4, opacity: 1, zIndex: 500 }
                                            : isOther
                                                ? { x, y, rotate: deg, scale: 1, opacity: 0 }
                                                : { x, y, rotate: deg, scale: 1, opacity: 1 }
                                }

                                whileHover={selectedCard === null && !isShuffling ? {
                                    y: y - 30,
                                    scale: 1.08,
                                    zIndex: 200,
                                    filter: "brightness(1.15)",
                                } : {}}

                                transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 20,
                                    mass: 0.8,
                                }}

                                className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 cursor-pointer"
                                style={{ transformOrigin: "bottom center" }}
                            >
                                {isSelected && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            boxShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.2)",
                                        }}
                                    />
                                )}
                                <img
                                    src="/card/back.jpg"
                                    alt="card"
                                    className="w-32 h-48 rounded-xl"
                                    style={{
                                        boxShadow: `
${index < total / 2 ? "-8px 6px 12px rgba(0,0,0,0.35)" : "8px 6px 12px rgba(0,0,0,0.35)"},
0 25px 40px rgba(0,0,0,0.4)
`
                                    }}
                                />
                            </motion.div>
                        );

                    })}

                </div>
            </div>

        </div>
    );
}