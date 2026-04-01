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

    const total = 22; // Fix visual cards to exactly 22

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
        <div className="
        relative 
        min-h-screen 
        flex flex-col
        bg-[#2F2847] text-white 
        overflow-x-hidden" style={{ backgroundColor: "#2F2847" }}>

            <div className="sticky top-0 z-40 bg-[#2F2847]/95 backdrop-blur-md -mx-10 px-10 pt-6 pb-4 mb-4 flex items-center justify-between">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-[#ffecd9] hover:opacity-70 transition cursor-pointer"
                >
                    <ArrowBigLeft size={28} />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center pb-10">
                <h1 className="text-4xl text-center mb-8 font-semibold">
                    เลือกไพ่ — {getThaiName()}
                </h1>

            <style>{`
                .responsive-card-pos {
                    left: calc(var(--percent) * 100% - var(--percent) * 4rem);
                }
                @media (min-width: 640px) {
                    .responsive-card-pos { left: calc(var(--percent) * 100% - var(--percent) * 5rem); }
                }
                @media (min-width: 768px) {
                    .responsive-card-pos { left: calc(var(--percent) * 100% - var(--percent) * 7rem); }
                }
            `}</style>
            
            <div className="w-full max-w-5xl mx-auto my-10 px-2 sm:px-6">
                <div className="relative w-full h-[120px] sm:h-[180px] md:h-[240px] mx-auto">

                    {mounted && Array.from({ length: total }).map((_, index) => {

                        const isSelected = selectedCard === index;
                        const isOther = selectedCard !== null && selectedCard !== index;
                        const isHovered = hoveredCard === index && selectedCard === null && !isShuffling;

                        const percent = index / (total - 1);
                        const isCenter = index - (total - 1) / 2; // ranges from -10.5 to 10.5
                        const curveY = 0; // Flat layout
                        const rotateDeg = 0; // No rotation

                        return (
                            <motion.div
                                key={index}
                                onClick={() => handleSelectCard(index)}
                                onHoverStart={() => {
                                    if (selectedCard === null && !isShuffling) setHoveredCard(index);
                                }}
                                onHoverEnd={() => setHoveredCard(null)}

                                initial={{ opacity: 0, scale: 0.8, y: 50 }}

                                animate={
                                    isShuffling
                                        ? { scale: [1, 0.9, 1], y: curveY, rotate: [rotateDeg, rotateDeg - 3, rotateDeg + 3, rotateDeg], opacity: 1, zIndex: index }
                                        : isSelected
                                            ? { scale: 1.15, y: curveY - 40, rotate: rotateDeg, opacity: 1, zIndex: 100 }
                                            : isOther
                                                ? { scale: 0.95, y: curveY, rotate: rotateDeg, opacity: 0.5, filter: "blur(4px)", zIndex: index }
                                                : isHovered
                                                    ? { scale: 1.1, y: curveY - 20, rotate: rotateDeg, opacity: 1, zIndex: 50 }
                                                    : { scale: 1, y: curveY, rotate: rotateDeg, opacity: 1, zIndex: index }
                                }

                                transition={
                                    isShuffling
                                        ? { duration: 0.4, repeat: 1 }
                                        : isSelected
                                            ? { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
                                            : isOther
                                                ? { duration: 0.4, ease: [0.4, 0, 1, 1] }
                                                : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
                                }

                                className="absolute top-0 responsive-card-pos cursor-pointer"
                                style={{ 
                                    "--percent": percent,
                                    transformOrigin: "bottom center"
                                } as React.CSSProperties}
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
                                    className="w-16 h-24 sm:w-20 sm:h-32 md:w-28 md:h-40 rounded-md md:rounded-xl"
                                    style={{
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
                                    }}
                                />
                            </motion.div>
                        );

                    })}

                </div>
            </div>
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
            </div>

        </div>
    );
}