"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import tarot from "../../data/tarot.json";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import { Heart, DollarSign, BookOpen, ArrowBigLeft, ShoppingBag, Sparkles, Package, QrCode, CreditCard, X, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePopupStore } from "@/lib/popupstore";
import PopupAlert from "@/app/components/PopupAlert";

type View = {
    id: string;
    card_id: number | string;
    category: string;
    viewed_at: string;
};

type OrderItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

type Order = {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    items: OrderItem[];
    total: number;
    status: string;
    payment_method: string | null;
    created_at: string;
};

export default function HistoryPage() {
    const [views, setViews] = useState<View[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [tab, setTab] = useState<"horoscope" | "orders">("horoscope");
    const router = useRouter();

    // Payment Popup state
    const [payingOrder, setPayingOrder] = useState<Order | null>(null);
    const [method, setMethod] = useState<"qr" | "credit" | null>(null);
    const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
    const [paying, setPaying] = useState(false);

    // CVV states
    const [cvvDisplay, setCvvDisplay] = useState("");
    const [cvvTimer, setCvvTimer] = useState<NodeJS.Timeout | null>(null);
    const [showCvv, setShowCvv] = useState(false);

    useEffect(() => {
        return () => {
            if (cvvTimer) clearTimeout(cvvTimer);
        };
    }, [cvvTimer]);

    const { isOpen, title, message, type, showPopup, closePopup } = usePopupStore();

    const categoryLabel: Record<string, string> = {
        love: "ความรัก",
        money: "การเงิน",
        study: "การเรียน",
    };

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

            setViews(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // fetch order history
    const fetchOrders = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                setOrders([]);
                return;
            }

            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(30);

            if (error) {
                console.error("Fetch orders error:", error);
                return;
            }

            setOrders(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });
        Promise.all([fetchHistory(), fetchOrders()]).then(() => setLoading(false));
    }, []);

    // stats
    const stats = useMemo(() => {
        return views.reduce((acc: Record<string, number>, cur) => {
            acc[cur.category] = (acc[cur.category] || 0) + 1;
            return acc;
        }, {});
    }, [views]);

    const orderStats = useMemo(() => {
        const totalSpent = orders.filter(o => o.status === "paid").reduce((sum, o) => sum + (o.total || 0), 0);
        const totalOrders = orders.length;
        const paidOrders = orders.filter(o => o.status === "paid").length;
        return { totalSpent, totalOrders, paidOrders };
    }, [orders]);

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        const oldVal = card.expiry;

        if (val.length < oldVal.length) {
            setCard({ ...card, expiry: val });
            return;
        }

        if (val.endsWith("/") && val.length === 2 && !oldVal.includes("/")) {
            setCard({ ...card, expiry: `0${val[0]}/` });
            return;
        }

        const digits = val.replace(/\D/g, "");
        if (digits.length === 1) {
            if (parseInt(digits) >= 2 && parseInt(digits) <= 9) val = `0${digits}/`;
            else val = digits;
        } else if (digits.length === 2) {
            if (parseInt(digits) > 12) val = digits[0];
            else val = `${digits}/`;
        } else if (digits.length > 2) {
            val = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
        }
        setCard({ ...card, expiry: val });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 16) val = val.slice(0, 16);
        const formatted = val.match(/.{1,4}/g)?.join(" ") || "";
        setCard({ ...card, number: formatted });
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        if (inputVal.length < cvvDisplay.length) {
            const newActualCvv = card.cvv.slice(0, -1);
            setCard({ ...card, cvv: newActualCvv });
            setCvvDisplay(showCvv ? newActualCvv : "•".repeat(newActualCvv.length));
            return;
        }
        const addedChar = inputVal.slice(-1);
        if (!/^[0-9]$/.test(addedChar) || card.cvv.length >= 4) return;

        const newActualCvv = card.cvv + addedChar;
        setCard({ ...card, cvv: newActualCvv });

        if (showCvv) {
            setCvvDisplay(newActualCvv);
        } else {
            const newDisplay = "•".repeat(newActualCvv.length - 1) + addedChar;
            setCvvDisplay(newDisplay);
            if (cvvTimer) clearTimeout(cvvTimer);
            const timer = setTimeout(() => {
                setCvvDisplay("•".repeat(newActualCvv.length));
            }, 500);
            setCvvTimer(timer);
        }
    };

    const toggleCvv = () => {
        const nextShow = !showCvv;
        setShowCvv(nextShow);
        if (nextShow) {
            setCvvDisplay(card.cvv);
            if (cvvTimer) clearTimeout(cvvTimer);
        } else {
            setCvvDisplay("•".repeat(card.cvv.length));
        }
    };

    // Open payment popup
    const openPayment = (order: Order) => {
        setPayingOrder(order);
        setMethod(null);
        setCard({ number: "", name: "", expiry: "", cvv: "" });
    };

    // Close payment popup
    const closePayment = () => {
        if (paying) return;
        setPayingOrder(null);
        setMethod(null);
        setCard({ number: "", name: "", expiry: "", cvv: "" });
    };

    // Confirm payment
    const handlePayConfirm = async () => {
        if (!payingOrder) return;
        if (!method) {
            showPopup("เลือกวิธีชำระเงิน", "กรุณาเลือกวิธีชำระเงิน", "error");
            return;
        }
        if (method === "credit" && (!card.number || !card.name || !card.expiry || !card.cvv)) {
            showPopup("ข้อมูลบัตรไม่ครบ", "กรุณากรอกข้อมูลบัตรให้ครบถ้วนทุกช่อง", "error");
            return;
        }

        setPaying(true);
        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: "paid", payment_method: method })
                .eq("id", payingOrder.id);

            if (error) throw error;

            // Update local state
            setOrders(prev =>
                prev.map(o =>
                    o.id === payingOrder.id
                        ? { ...o, status: "paid", payment_method: method }
                        : o
                )
            );

            closePayment();
            showPopup("ชำระเงินสำเร็จ", "ชำระเงินเรียบร้อยแล้ว! 🎉 ขอบคุณที่ใช้บริการ", "success");
        } catch (err) {
            showPopup("เกิดข้อผิดพลาด", "ไม่สามารถชำระเงินได้ กรุณาลองใหม่", "error");
            console.error(err);
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#2F2847] flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen pb-20 bg-[#2F2847] text-white flex">
            <Sidebar />

            <div className="flex-1 md:ml-20 p-10 flex gap-8">

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-[#ffecd9] hover:opacity-70 transition cursor-pointer self-start mt-1"
                >
                    <ArrowBigLeft size={28} />
                </button>

                {/* LEFT */}
                <div className="flex-1 bg-[#4A445F] rounded-2xl p-6">
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setTab("horoscope")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all cursor-pointer ${
                                tab === "horoscope"
                                    ? "bg-purple-500 text-white shadow-lg"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                        >
                            <Sparkles size={16} />
                            ดูดวง
                        </button>
                        <button
                            onClick={() => setTab("orders")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all cursor-pointer ${
                                tab === "orders"
                                    ? "bg-indigo-500 text-white shadow-lg"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                        >
                            <ShoppingBag size={16} />
                            สั่งซื้อ
                        </button>
                    </div>

                    {/* Horoscope Tab */}
                    {tab === "horoscope" && (
                        <>
                            {views.length === 0 && (
                                <p className="text-gray-400">
                                    ยังไม่มีประวัติการดูดวง
                                </p>
                            )}

                            <div className="space-y-6">
                                {views.map((view) => {
                                    const card = cardMap[String(view.card_id).padStart(2, "0")];
                                    if (!card) return null;

                                    return (
                                        <div
                                            key={view.id}
                                            className="flex gap-4 items-center border-b border-white/10 pb-4"
                                        >
                                            <img
                                                src={card.image}
                                                className="w-20 h-32 object-cover rounded-md"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-300">
                                                    {categoryLabel[view.category] || view.category}
                                                </p>
                                                <h2 className="text-lg font-semibold">
                                                    {card.name}
                                                </h2>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(view.viewed_at).toLocaleDateString("th-TH", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/horoscope/result/${card.card_id}?category=${view.category}`
                                                            )
                                                        }
                                                        className="bg-purple-300 text-[var(--bg)] px-3 py-1 rounded-md text-sm hover:opacity-80 cursor-pointer"
                                                    >
                                                        ดูคำทำนาย
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Orders Tab */}
                    {tab === "orders" && (
                        <>
                            {!isLoggedIn && (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <ShoppingBag size={48} className="text-indigo-400/50" />
                                    <p className="text-gray-400 text-center">
                                        กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ
                                    </p>
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all cursor-pointer"
                                    >
                                        เข้าสู่ระบบ
                                    </button>
                                </div>
                            )}
                            {isLoggedIn && orders.length === 0 && (
                                <p className="text-gray-400">
                                    ยังไม่มีประวัติการสั่งซื้อ
                                </p>
                            )}

                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5"
                                    >
                                        {/* Header */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <Package size={18} className="text-indigo-400" />
                                                <span className="text-xs text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString("th-TH", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                    order.status === "paid"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : "bg-yellow-500/20 text-yellow-400"
                                                }`}
                                            >
                                                {order.status === "paid" ? "ชำระแล้ว" : "รอชำระ"}
                                            </span>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-3">
                                            {(order.items || []).map((item: OrderItem, idx: number) => (
                                                <div key={idx} className="flex gap-3 items-center">
                                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                                        <Image
                                                            src={item.image || "/placeholder.png"}
                                                            alt={item.name}
                                                            width={56}
                                                            height={56}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            x{item.quantity} · ฿{item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-bold text-indigo-300">
                                                        ฿{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                                            <span className="text-xs text-gray-400 flex items-center gap-2">
                                                {order.payment_method === "qr"
                                                    ? <>
                                                        <QrCode className="w-5 h-5" /> 
                                                        <span>QR Code</span>
                                                    </>
                                                    : order.payment_method === "credit"
                                                    ? <>
                                                        <CreditCard className="w-5 h-5" />
                                                        <span>บัตรเครดิต</span>
                                                    </>
                                                    : order.status !== "paid"
                                                    ? (
                                                        <button
                                                            onClick={() => openPayment(order)}
                                                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            <CreditCard size={14} />
                                                            ชำระเงิน
                                                        </button>
                                                    )
                                                    : "—"}
                                            </span>
                                            <span className="text-lg font-bold text-white">
                                                รวม ฿{(order.total || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT - Stats */}
                <div className="w-80 space-y-6">
                    {/* Horoscope Stats */}
                    <div className="bg-gradient-to-b from-[#3B3560] to-[#1F1A33] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">สถิติดูดวง</h3>
                        <div className="flex flex-col gap-4">
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

                    {/* Order Stats */}
                    <div className="bg-gradient-to-b from-[#2D3561] to-[#1A1F33] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">สถิติสั่งซื้อ</h3>
                        <div className="flex flex-col gap-4">
                            <StatCard
                                icon={<ShoppingBag size={20} style={{ color: "#818cf8" }} />}
                                label="คำสั่งซื้อทั้งหมด"
                                value={orderStats.totalOrders}
                                iconBg="rgba(129,140,248,0.2)"
                            />
                            <StatCard
                                icon={<Package size={20} style={{ color: "#34d399" }} />}
                                label="ชำระแล้ว"
                                value={orderStats.paidOrders}
                                iconBg="rgba(52,211,153,0.2)"
                            />
                            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(250,204,21,0.2)" }}
                                >
                                    <DollarSign size={20} style={{ color: "#facc15" }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">ยอดรวม</p>
                                    <p className="text-lg font-bold text-white">฿{orderStats.totalSpent.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ===== Payment Popup ===== */}
        <AnimatePresence>
            {payingOrder && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) closePayment(); }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-[#1a1a2e] text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        {/* Popup Header */}
                        <div className="flex justify-between items-center px-8 pt-8 pb-4">
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter">ชำระเงิน</h2>
                                <p className="text-white/40 text-xs uppercase tracking-widest mt-1">เลือกวิธีชำระเงิน</p>
                            </div>
                            <button
                                onClick={closePayment}
                                disabled={paying}
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-8 pb-8 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* ยอดที่ต้องชำระ */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex justify-between items-center">
                                <div>
                                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">ยอดที่ต้องชำระ</p>
                                    <p className="text-4xl font-black text-indigo-400 mt-1">฿{(payingOrder.total || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-right text-white/30 text-xs">
                                    <p>{(payingOrder.items || []).length} รายการ</p>
                                    <p className="text-green-400 font-bold mt-1">ฟรีค่าจัดส่ง</p>
                                </div>
                            </div>

                            {/* เลือกวิธีชำระ */}
                            <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">วิธีชำระเงิน</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setMethod("qr")}
                                        className={`p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${method === "qr" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                                    >
                                        <p className="font-bold text-sm"> <QrCode size={40}/> QR Code</p>
                                        <p className="text-white/40 text-xs mt-0.5">ชำระผ่าน Mobile Banking</p>
                                    </button>
                                    <button
                                        onClick={() => setMethod("credit")}
                                        className={`p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${method === "credit" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                                    >
                                        <p className="font-bold text-sm"> <CreditCard size={40}/> บัตรเครดิต / เดบิต</p>
                                        <p className="text-white/40 text-xs mt-0.5">Visa, Mastercard</p>
                                    </button>
                                </div>
                            </div>

                            {/* QR Code */}
                            {method === "qr" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4"
                                >
                                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">สแกน QR เพื่อชำระเงิน</p>
                                    <div className="bg-white p-3 rounded-xl">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=payment-${payingOrder.total}`}
                                            alt="QR Code"
                                            className="w-44 h-44"
                                        />
                                    </div>
                                    <p className="text-indigo-400 font-black text-2xl">฿{(payingOrder.total || 0).toLocaleString()}</p>
                                    <p className="text-white/40 text-xs">หลังโอนแล้วกดยืนยันด้านล่าง</p>
                                </motion.div>
                            )}

                            {/* Credit Card Form */}
                            {method === "credit" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4"
                                >
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">ข้อมูลบัตร</p>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/30 uppercase ml-1">หมายเลขบัตร</label>
                                        <input
                                            name="number"
                                            value={card.number}
                                            onChange={handleNumberChange}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/30 uppercase ml-1">ชื่อบนบัตร</label>
                                        <input
                                            name="name"
                                            value={card.name}
                                            onChange={(e) => setCard({ ...card, name: e.target.value })}
                                            placeholder="FIRSTNAME LASTNAME"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/30 uppercase ml-1">วันหมดอายุ</label>
                                            <input
                                                name="expiry"
                                                value={card.expiry}
                                                onChange={handleExpiryChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-xs font-bold text-white/30 uppercase ml-1">CVV</label>
                                            <div className="relative">
                                                <input
                                                    name="cvv"
                                                    value={cvvDisplay}
                                                    onChange={handleCvvChange}
                                                    placeholder="000"
                                                    type="text"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all text-sm pr-12"
                                                />
                                                <button type="button" onClick={toggleCvv} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 p-1 cursor-pointer">
                                                    {showCvv ? <Eye size={20} /> : <EyeOff size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Confirm Button */}
                            {method && (
                                <motion.button
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handlePayConfirm}
                                    disabled={paying}
                                    className="w-full bg-transparent border-2 border-white hover:bg-white/10 text-white py-4 rounded-2xl font-black text-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {paying ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <PopupAlert
            isOpen={isOpen}
            title={title}
            message={message}
            type={type}
            onClose={closePopup}
        />
        </>
    );
}

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