"use client";

import UserProfileCard from "@/app/components/UserProfileCard";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-(--bg) flex flex-col items-center justify-start pt-8 px-4 pb-24">
      <div className="w-full max-w-sm aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl">
        <UserProfileCard />
      </div>
    </div>
  );
}
