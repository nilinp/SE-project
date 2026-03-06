"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import tarot from "../../../data/tarot.json";

export default function SelectCardPage() {

    const { category } = useParams();
    const router = useRouter();

    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const handleSelectCard = (index: number) => {

        if (selectedCard !== null) return;

        setSelectedCard(index);

        const randomId = Math.floor(Math.random() * tarot.cards.length);

        setTimeout(() => {
            router.push(`/horoscope/result/${randomId}?category=${category}`);
        }, 800);

    };

    const getThaiName = () => {
        if (category === "love") return "ความรัก";
        if (category === "money") return "การเงิน";
        if (category === "study") return "การเรียน";
        return "";
    };

    return (
        <div className="relative min-h-screen bg-[#2F2847] text-white p-10 md:pl-28">

            <h1 className="text-4xl text-center mb-10 font-semibold">
                Select Card - {getThaiName()}
            </h1>

            <div className="flex justify-center items-center min-h-[60vh]">

                <div className="relative w-full max-w-[1200px] h-[450px]">

                    {Array.from({ length: tarot.cards.length }).map((_, index) => {

                        const total = tarot.cards.length;

                        const spread = Math.PI / 3;
                        const start = -spread / 2;
                        const angle = start + (spread / (total - 1)) * index;

                        const radius = 900;

                        const x = radius * Math.sin(angle);
                        const y = radius * (1 - Math.cos(angle)) - 200;

                        const isSelected = selectedCard === index;
                        const isOther = selectedCard !== null && selectedCard !== index;

                        return (
                            <motion.div
                                key={index}
                                onClick={() => handleSelectCard(index)}

                                initial={{
                                    x,
                                    y,
                                    rotate: angle * (180 / Math.PI),
                                }}

                                animate={{
                                    x: isSelected ? 0 : x,
                                    y: isSelected ? -120 : y,
                                    rotate: isSelected ? 0 : angle * (180 / Math.PI),
                                    scale: isSelected ? 1.6 : 1,
                                    opacity: isOther ? 0 : 1,
                                    zIndex: isSelected ? 500 : 1
                                }}

                                whileHover={selectedCard === null ? {
                                    y: y - 40,
                                    scale: 1.1,
                                    zIndex: 200,
                                    filter: "brightness(1.1)"
                                } : {}}

                                transition={{ duration: 0.4 }}

                                className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 cursor-pointer"
                                style={{ transformOrigin: "bottom center" }}
                            >
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