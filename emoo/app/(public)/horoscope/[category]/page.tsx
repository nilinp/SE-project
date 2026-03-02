"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SelectCardPage() {
    const { category } = useParams();
    const router = useRouter();

    const getThaiName = () => {
        if (category === "love") return "ความรัก";
        if (category === "money") return "การเงิน";
        if (category === "study") return "การเรียน";
        return "";
    };

    return (
        <div className="relative min-h-screen bg-[#2F2847] text-white p-10 md:pl-28">

            {/* Title */}
            <h1 className="text-4xl text-center mb-10 font-semibold">
                Select Card - {getThaiName()}
            </h1>

            {/* Card Container */}
            <div className="flex justify-center items-center min-h-[60vh]">
                <div
                    className="relative w-full max-w-[1200px] h-[450px]"
                    suppressHydrationWarning
                >
                    {Array.from({ length: 21 }).map((_, index) => {
                        const total = 21;

                        const spread = Math.PI / 3; // ความโค้ง (เพิ่ม = โค้งมากขึ้น)
                        const start = -spread / 2;
                        const angle = start + (spread / (total - 1)) * index;

                        const radius = 900; // รัศมีวงกลม (มาก = โค้งเนียนขึ้น)

                        const x = radius * Math.sin(angle);
                        const y = radius * (1 - Math.cos(angle)) - 200;

                        return (
                            <motion.div
                                key={index}
                                initial={{
                                    x,
                                    y,
                                    rotate: angle * (180 / Math.PI),
                                }}
                                whileHover={{
                                    y: y - 40,
                                    scale: 1.1,
                                    zIndex: 200,
                                    filter: "brightness(1.1)"
                                }}
                                transition={{ type: "spring", stiffness: 200 }}
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
