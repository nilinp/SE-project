"use client";

import UserProfileCard from "@/app/components/UserProfileCard";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-(--bg) flex flex-col items-center justify-start pt-6 px-4 pb-24">
      {/* Profile Card — full width on mobile, constrained on tablet */}
      <div className="w-full max-w-sm md:max-w-md aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl">
        <UserProfileCard />
      </div>
    </div>
  );
}
