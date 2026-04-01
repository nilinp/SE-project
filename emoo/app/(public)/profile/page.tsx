"use client";

import UserProfileCard from "@/app/components/UserProfileCard";
import { 
    Heart, 
    DollarSign, 
    BookOpen, 
    ShoppingBag, 
    Sparkles, 
    Package, 
    QrCode, 
    CreditCard, 
    X, 
    Eye, 
    EyeOff 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import tarot from "../../data/tarot.json";
import { motion, AnimatePresence } from "framer-motion";
import { usePopupStore } from "@/lib/popupstore";
import PopupAlert from "@/app/components/PopupAlert";
import Image from "next/image";

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

export default function ProfilePage() {
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
            if (digits === "00" || parseInt(digits) > 12) val = digits[0];
            else val = `${digits}/`;
        } else if (digits.length > 2) {
            const mm = digits.substring(0, 2);
            if (mm === "00" || parseInt(mm) > 12) {
                val = digits[0];
            } else {
                val = `${mm}/${digits.substring(2, 4)}`;
            }
        } else {
            val = digits;
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
        const newChars = inputVal.slice(cvvDisplay.length).replace(/\D/g, "");
        if (!newChars) return; 
        const finalCvv = (card.cvv + newChars).slice(0, 4);
        if (finalCvv === card.cvv) return;
        setCard({ ...card, cvv: finalCvv });
        if (showCvv) {
            setCvvDisplay(finalCvv);
        } else {
            const newDisplay = "•".repeat(finalCvv.length - 1) + finalCvv.slice(-1);
            setCvvDisplay(newDisplay);
            if (cvvTimer) clearTimeout(cvvTimer);
            const timer = setTimeout(() => {
                setCvvDisplay("•".repeat(finalCvv.length));
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

    const openPayment = (order: Order) => {
        setPayingOrder(order);
        setMethod(null);
        setCard({ number: "", name: "", expiry: "", cvv: "" });
    };

    const closePayment = () => {
        if (paying) return;
        setPayingOrder(null);
        setMethod(null);
        setCard({ number: "", name: "", expiry: "", cvv: "" });
    };

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
            <div className="min-h-screen bg-[#151226] flex items-center justify-center text-white">
                กำลังโหลด...
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen pt-0 pb-24 md:pb-10 px-4 sm:px-6 flex flex-col items-center bg-[#151226] md:ml-20 overflow-x-hidden">
            
            <div className="sticky top-0 z-40 bg-[#151226]/95 backdrop-blur-md w-full -mx-4 px-4 pt-10 pb-4 mb-4 flex justify-center">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-lg text-center">
                    โปรไฟล์ของคุณ
                </h1>
            </div>

            <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-10 items-start justify-center">
                
                {/* LEFT: Profile Card (Sticky on Desktop) */}
                <div className="w-full lg:w-auto flex justify-center lg:sticky lg:top-8">
                    <div className="w-full max-w-md h-[420px] sm:h-[550px] lg:h-[600px] rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <UserProfileCard />
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-white/30 text-xs hidden lg:block">
                <p>สลับไปยังหน้าหลักหรือตะกร้าผ่านแถบเมนูด้านซ้าย</p>
            </div>
        </div>
        </>
    );
}

// Sub-components for cleaner structure
function HoroscopeList({ views, cardMap, categoryLabel, router }: any) {
    if (views.length === 0) return <p className="text-white/30 text-center py-10">ยังไม่มีประวัติการดูดวง</p>;
    return (
        <div className="grid grid-cols-1 gap-4">
            {views.map((view: any) => {
                const card = cardMap[String(view.card_id).padStart(2, "0")];
                if (!card) return null;
                return (
                    <div key={view.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition">
                        <div className="w-16 h-24 shrink-0">
                            <img src={card.image} className="w-full h-full object-cover rounded-lg shadow-lg" alt={card.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{categoryLabel[view.category] || view.category}</p>
                            <h3 className="text-lg font-bold text-white truncate">{card.name}</h3>
                            <div className="flex justify-between items-center mt-3">
                                <button onClick={() => router.push(`/horoscope/result/${card.card_id}?category=${view.category}`)} 
                                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer">
                                    อ่านคำทำนายอีกครั้ง
                                </button>
                                <span className="text-[10px] text-white/20">{new Date(view.viewed_at).toLocaleDateString("th-TH")}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function OrderList({ isLoggedIn, orders, router, openPayment }: any) {
    if (!isLoggedIn) return (
        <div className="text-center py-12 flex flex-col items-center gap-4">
            <ShoppingBag size={48} className="text-white/10" />
            <p className="text-white/50">กรุณาเข้าสู่ระบบเพื่อดูประวัติสั่งซื้อ</p>
            <button onClick={() => router.push("/login")} className="bg-indigo-500 text-white px-6 py-2 rounded-full font-bold cursor-pointer">เข้าสู่ระบบ</button>
        </div>
    );
    if (orders.length === 0) return <p className="text-white/30 text-center py-10">ยังไม่มีประวัติการสั่งซื้อ</p>;
    return (
        <div className="space-y-4">
            {orders.map((order: any) => (
                <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 items-center text-xs text-white/40">
                            <Package size={14} />
                            <span>{new Date(order.created_at).toLocaleDateString("th-TH")}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${order.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {order.status === "paid" ? "ชำระแล้ว" : "รอชำระ"}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <Image src={item.image || "/placeholder.png"} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="flex-1 text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-white/40">x{item.quantity}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                        <div>
                            {order.status !== "paid" && (
                                <button onClick={() => openPayment(order)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition">
                                    <CreditCard size={14} /> ชำระเงิน
                                </button>
                            )}
                        </div>
                        <div className="text-lg font-bold">฿{order.total.toLocaleString()}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PaymentPopup({ payingOrder, method, setMethod, card, setCard, paying, closePayment, handlePayConfirm, handleNumberChange, handleExpiryChange, handleCvvChange, cvvDisplay, showCvv, toggleCvv }: any) {
    return (
        <AnimatePresence>
            {payingOrder && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) closePayment(); }}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#1a1a2e] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">ชำระเงิน</h2>
                            <button onClick={closePayment} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer"><X size={20} /></button>
                        </div>
                        
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 flex justify-between mb-8">
                            <div>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">ยอดชำระ</p>
                                <p className="text-3xl font-black">฿{payingOrder.total.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">การจัดส่ง</p>
                                <p className="text-green-400 font-bold">Free</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setMethod("qr")} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === "qr" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5"}`}>
                                <QrCode size={32} className="mb-2" />
                                <p className="text-xs font-bold">QR Code</p>
                            </button>
                            <button onClick={() => setMethod("credit")} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === "credit" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5"}`}>
                                <CreditCard size={32} className="mb-2" />
                                <p className="text-xs font-bold">Credit Card</p>
                            </button>
                        </div>

                        {method === "qr" && (
                            <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-2xl mb-8">
                                <div className="bg-white p-3 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=payment-${payingOrder.total}`} className="w-40 h-40" alt="QR" /></div>
                                <p className="text-2xl font-black text-indigo-400">฿{payingOrder.total.toLocaleString()}</p>
                            </div>
                        )}

                        {method === "credit" && (
                            <div className="space-y-4 mb-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/40 font-bold uppercase ml-2">หมายเลขบัตร</label>
                                    <input name="number" value={card.number} onChange={handleNumberChange} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/40 font-bold uppercase ml-2">ชื่อบนบัตร</label>
                                    <input name="name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.replace(/[^a-zA-Zก-ฮะ-์\s]/g, "") })} placeholder="JOHN DOE" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 font-bold uppercase ml-2">วันหมดอายุ</label>
                                        <input value={card.expiry} onChange={handleExpiryChange} placeholder="MM/YY" maxLength={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1 relative">
                                        <label className="text-[10px] text-white/40 font-bold uppercase ml-2">CVV</label>
                                        <div className="relative">
                                            <input value={cvvDisplay} onChange={handleCvvChange} maxLength={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 pr-12" />
                                            <button onClick={toggleCvv} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition cursor-pointer">{showCvv ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {method && (
                            <button onClick={handlePayConfirm} disabled={paying} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-xl transition active:scale-95 disabled:opacity-50 cursor-pointer">
                                {paying ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
                            </button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
