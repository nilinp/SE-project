"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--main) border-t-transparent rounded-full animate-spin" />
          <p className="text-(--main) opacity-60 text-sm">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
