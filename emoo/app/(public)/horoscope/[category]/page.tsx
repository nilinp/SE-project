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
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const total = tarot.cards.length;

    const handleSelectCard = (index: number) => {
        if (selectedCard !== null || isShuffling) return;
        setSelectedCard(index);
        setHoveredCard(null);

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
        <div className="relative min-h-screen bg-[#2F2847] text-white p-10 md:pl-28" style={{ backgroundColor: "#2F2847" }}>

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-[#ffecd9] hover:opacity-70 transition cursor-pointer mb-4"
            >
                <ArrowBigLeft size={28} />
            </button>

            <h1 className="text-4xl text-center mb-4 font-semibold">
                เลือกไพ่ — {getThaiName()}
            </h1>

            {/* Shuffle Button */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleShuffle}
                    disabled={selectedCard !== null || isShuffling}
                    className="
                        flex items-center gap-2
                        cursor-pointer
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

            <div className="flex justify-center items-center min-h-full">
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
                        const isHovered = hoveredCard === index && selectedCard === null && !isShuffling;

                        return (
                            <motion.div
                                key={index}
                                onClick={() => handleSelectCard(index)}
                                onHoverStart={() => {
                                    if (selectedCard === null && !isShuffling) setHoveredCard(index);
                                }}
                                onHoverEnd={() => setHoveredCard(null)}

                                initial={{ x, y, rotate: deg, scale: 1, opacity: 1 }}

                                animate={
                                    isShuffling
                                        ? { x: 0, y: -30, rotate: 0, scale: 0.92, opacity: 1 }
                                        : isSelected
                                            ? { x: 0, y: -80, rotate: 0, scale: 1.35, opacity: 1, zIndex: 500 }
                                            : isOther
                                                ? { x, y, rotate: deg, scale: 0.95, opacity: 0, filter: "blur(4px)" }
                                                : { x, y, rotate: deg, scale: 1, opacity: 1 }
                                }

                                transition={
                                    isShuffling
                                        ? { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
                                        : isSelected
                                            ? { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
                                            : isOther
                                                ? { duration: 0.4, ease: [0.4, 0, 1, 1] }
                                                : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
                                }

                                className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 cursor-pointer"
                                style={{ transformOrigin: "bottom center" }}
                            >
                                {/* Hover glow outline */}
                                {isHovered && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            outline: "2.5px solid rgba(216, 180, 254, 0.95)",
                                            outlineOffset: "3px",
                                            boxShadow: "0 0 24px rgba(168,85,247,0.65), 0 0 8px rgba(216,180,254,0.5), inset 0 0 12px rgba(168,85,247,0.15)",
                                        }}
                                    />
                                )}

                                {/* Selected glow */}
                                {isSelected && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        style={{
                                            boxShadow: "0 0 30px rgba(168,85,247,0.55), 0 0 60px rgba(168,85,247,0.2)",
                                        }}
                                    />
                                )}

                                <img
                                    src="/card/back.jpg"
                                    alt="card"
                                    className="w-32 h-48 rounded-xl"
                                    style={{
                                        boxShadow: `
${index < total / 2 ? "-6px 5px 10px rgba(0,0,0,0.3)" : "6px 5px 10px rgba(0,0,0,0.3)"},
0 20px 35px rgba(0,0,0,0.35)
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