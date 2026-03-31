"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Pencil, Check, X, Camera, Star, Sparkles, History, LogIn, Lock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type LastCard = {
  card_id: string;
  name: string;
  image: string;
  keyword: string;
  category: string;
  viewed_at: string;
};

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  last_card: LastCard | null;
};

export default function UserProfileCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGuest, setIsGuest] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  /* ─── Load profile ─── */
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Guest mode
        setIsGuest(true);
        setLoaded(true);
        return;
      }

      setEmail(session.user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setNewUsername(data.username ?? "");
        if (data.avatar_url) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.avatar_url);
          setAvatarUrl(urlData.publicUrl + `?t=${Date.now()}`);
        }
      }
      setLoaded(true);
    };
    load();
  }, []);

  /* ─── Upload avatar ─── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", profile.id);

      if (!updateError) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        setAvatarUrl(urlData.publicUrl + `?t=${Date.now()}`);
        setProfile({ ...profile, avatar_url: path });
      }
    }

    e.target.value = "";
    setUploading(false);
  };

  /* ─── Save username ─── */
  const handleSaveUsername = async () => {
    if (!profile || !newUsername.trim()) return;
    setUsernameError("");
    setSaving(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", newUsername.trim())
      .neq("id", profile.id)
      .single();

    if (existing) {
      setUsernameError("ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername.trim() })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, username: newUsername.trim() });
      setEditingUsername(false);
    }
    setSaving(false);
  };

  /* ─── Logout ─── */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Or reload window
    window.location.reload();
  };

  /* ─── Loading skeleton ─── */
  if (!loaded) {
    return (
      <div className="relative w-full h-full rounded-[40px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/bg/Profile-bg.jpg')" }} />
        <div className="absolute inset-0 bg-[#1E1A33]/70" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
          <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
          <div className="w-32 h-4 rounded-full bg-white/10 animate-pulse" />
          <div className="w-20 h-3 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════ */
  /* GUEST STATE                                        */
  /* ══════════════════════════════════════════════════ */
  if (isGuest) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-cover bg-center rounded-[40px]" style={{ backgroundImage: "url('/bg/Profile-bg.jpg')" }} />
        <div className="absolute inset-0 bg-[#1E1A33]/80 backdrop-blur-[2px] rounded-[40px]" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 gap-4">
          {/* Guest avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#ffecd9]/20 shadow-xl bg-gradient-to-br from-[#4B415E] to-[#28223C] flex items-center justify-center">
            <span className="text-4xl font-bold text-[#ffecd9]/60 select-none">?</span>
          </div>

          {/* Guest name */}
          <p className="text-xl font-bold text-[#ffecd9]/70">Guest</p>
          <p className="text-[#ffecd9]/30 text-xs tracking-wide">ยังไม่ได้เข้าสู่ระบบ</p>

          {/* Lock hint */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Lock size={12} className="text-[#ffecd9]/40" />
            <p className="text-[#ffecd9]/40 text-xs">ล็อกอินเพื่อใช้งานเต็มรูปแบบ</p>
          </div>

          <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-[#ffecd9]/15 to-transparent" />

          {/* Login button */}
          <button
            onClick={() => router.push("/login")}
            className="
            flex 
            items-center 
            gap-2 
            px-6 
            py-2.5 
            rounded-full 
            bg-[#ffecd9]/15 
            border 
            border-[#ffecd9]/30 
            text-[#ffecd9] 
            text-sm 
            font-semibold 
            hover:bg-[#ffecd9]/25 
            hover:border-[#ffecd9]/60 
            transition-all 
            duration-200
            cursor-pointer
            "
          >
            <LogIn size={14} />
            เข้าสู่ระบบ
          </button>

          {/* Blocked history button */}
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[#ffecd9]/30 text-sm font-medium cursor-not-allowed"
            title="กรุณาเข้าสู่ระบบก่อน"
          >
            <History size={14} />
            ดูประวัติทั้งหมด
            <Lock size={11} />
          </button>
        </div>
      </div>
    );
  }

  /* ─── Logged-in states ─── */
  const hasCard = !!profile?.last_card;
  const card = profile?.last_card;

  const categoryLabel: Record<string, string> = {
    love: "❤️ ความรัก",
    money: "💰 การเงิน",
    study: "📚 การงาน/การเรียน",
  };

  /* ─── Avatar UI ─── */
  const AvatarUI = ({ size = 96 }: { size?: number }) => (
    <div className="relative group" style={{ width: size, height: size }}>
      <div
        className="rounded-full overflow-hidden ring-4 ring-[#ffecd9]/30 shadow-xl"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="avatar"
            width={size}
            height={size}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#4B415E] to-[#28223C] flex items-center justify-center">
            <span className="font-bold select-none text-[#ffecd9]" style={{ fontSize: size * 0.35 }}>
              {profile?.username?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera size={size * 0.22} className="text-white" />
        )}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
    </div>
  );

  /* ─── Username UI ─── */
  const UsernameUI = ({ textSize = "text-xl" }: { textSize?: string }) => (
    <div className="flex flex-col items-center gap-1">
      {editingUsername ? (
        <div className="flex flex-col items-center gap-2 w-full px-4">
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            maxLength={30}
            className="text-center text-lg font-semibold bg-white/10 border border-[#ffecd9]/40 text-[#ffecd9] rounded-xl px-3 py-1.5 outline-none focus:border-[#ffecd9] w-full"
            placeholder="ชื่อผู้ใช้"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveUsername();
              if (e.key === "Escape") { setEditingUsername(false); setNewUsername(profile?.username ?? ""); setUsernameError(""); }
            }}
            autoFocus
          />
          {usernameError && <p className="text-red-400 text-xs">{usernameError}</p>}
          <div className="flex gap-2">
            <button 
            onClick={handleSaveUsername} 
            disabled={saving} 
            className="
            flex 
            items-center 
            gap-1 
            px-3 
            py-1 
            rounded-lg 
            bg-[#ffecd9] 
            text-[#1E1A33] 
            text-xs 
            font-semibold 
            hover:opacity-80 
            transition 
            disabled:opacity-50
            cursor-pointer
            ">
              {saving ? <div 
              className="
              w-3 
              h-3 
              border-2 
              border-[#1E1A33] 
              border-t-transparent 
              rounded-full 
              animate-spin" /> : <><Check size={12} /> บันทึก</>}
            </button>
            <button 
            onClick={() => { setEditingUsername(false); setNewUsername(profile?.username ?? ""); setUsernameError(""); }} 
            className="
            flex 
            items-center 
            gap-1 
            px-3 
            py-1 
            rounded-lg 
            bg-white/10 
            text-[#ffecd9] 
            text-xs 
            font-semibold 
            hover:bg-white/20 
            transition
            cursor-pointer
            ">
              <X size={12} /> ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditingUsername(true)} 
        className="
        group/name 
        flex 
        items-center 
        gap-2 
        hover:opacity-80 
        transition
        cursor-pointer
        ">
          <span className={`${textSize} font-bold text-[#ffecd9] drop-shadow`}>{profile?.username || "ไม่มีชื่อ"}</span>
          <Pencil size={13} className="text-[#ffecd9]/50 group-hover/name:text-[#ffecd9] transition" />
        </button>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center rounded-[40px]" style={{ backgroundImage: "url('/bg/Profile-bg.jpg')" }} />
      <div className="absolute inset-0 bg-[#1E1A33]/70 backdrop-blur-[2px] rounded-[40px]" />

      {/* Logout button (only for logged-in users) */}
      {!isGuest && (
        <button
          onClick={handleLogout}
          className="
          absolute 
          top-5 
          right-5 
          z-20 
          p-2 
          text-[#ffecd9]/40 
          hover:text-[#ffecd9] 
          hover:bg-white/10 
          rounded-full 
          transition-all
          cursor-pointer
          "
          title="ออกจากระบบ"
        >
          <LogOut size={16} />
        </button>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* STATE A: ยังไม่เคยดูไพ่ — centered layout */}
      {/* ══════════════════════════════════════════ */}
      {!hasCard && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 gap-4">
          <div className="flex gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="text-[#FFD700] fill-[#FFD700] opacity-80" />
            ))}
          </div>

          <AvatarUI size={96} />
          <UsernameUI textSize="text-xl" />
          <p className="text-[#ffecd9]/50 text-xs tracking-wide">{email}</p>

          <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10">
            <Sparkles size={13} className="text-[#ffecd9]/50" />
            <p className="text-[#ffecd9]/50 text-xs">ยังไม่มีประวัติการดูไพ่</p>
          </div>

          <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-[#ffecd9]/20 to-transparent mt-2" />

          <button
            onClick={() => router.push("/history")}
            className="
            flex 
            items-center 
            gap-2 
            px-5 
            py-2 
            rounded-full 
            bg-white/10 
            border 
            border-[#ffecd9]/20 
            text-[#ffecd9]/70 
            text-sm 
            font-medium 
            hover:bg-white/20 
            hover:text-[#ffecd9] 
            transition-all 
            duration-200
            cursor-pointer
            "
          >
            <History size={14} />
            ดูประวัติทั้งหมด
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* STATE B: เคยดูไพ่แล้ว — compact top + card  */}
      {/* ══════════════════════════════════════════════ */}
      {hasCard && card && (
        <div className="relative z-10 flex flex-col h-full">
          {/* Top bar: avatar + username */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/10">
            <AvatarUI size={48} />
            <div className="flex flex-col">
              <UsernameUI textSize="text-base" />
              <p className="text-[#ffecd9]/40 text-[10px] tracking-wide leading-none mt-0.5">{email}</p>
            </div>
          </div>

          {/* Last card section */}
          <div className="px-5 pt-5 pb-6 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-[#FFD700]" />
              <span className="text-xs font-semibold text-[#ffecd9]/70 uppercase tracking-widest">ไพ่ล่าสุด</span>
              {card.category && (
                <span className="ml-auto text-[10px] text-[#ffecd9]/40 bg-white/8 px-2 py-0.5 rounded-full">
                  {categoryLabel[card.category] ?? card.category}
                </span>
              )}
            </div>

            <div className="flex gap-4 items-start">
              <div className="relative flex-shrink-0">
                <div className="w-[72px] rounded-xl overflow-hidden ring-2 ring-[#ffecd9]/20 shadow-lg shadow-purple-900/40">
                  <img src={card.image} alt={card.name} className="w-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-purple-500/10 blur-md -z-10" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[#ffecd9] font-bold text-base leading-tight mb-1.5">{card.name}</h3>
                <p className="text-[#ffecd9]/55 text-[11px] leading-relaxed line-clamp-5">{card.keyword}</p>
              </div>
            </div>

            {card.viewed_at && (
              <p className="text-[#ffecd9]/30 text-[10px] mt-3 text-right">
                ดูเมื่อ {new Date(card.viewed_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => router.push("/history")}
                className="
                flex 
                items-center 
                gap-2 
                px-5 
                py-2 
                rounded-full 
                bg-white/10 
                border 
                border-[#ffecd9]/20 
                text-[#ffecd9]/70 
                text-sm 
                font-medium 
                hover:bg-white/20 
                hover:text-[#ffecd9] 
                transition-all 
                duration-200
                cursor-pointer
                "
              >
                <History size={14} />
                ดูประวัติทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
