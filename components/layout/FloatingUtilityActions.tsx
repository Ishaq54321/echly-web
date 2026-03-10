"use client";

import { Bell } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/navigation";

export function FloatingUtilityActions() {
  const router = useRouter();
  const { user } = useAuthGuard({ router });

  return (
    <div className="absolute top-6 right-8 flex items-center gap-4 z-10">
      <button
        type="button"
        className="bg-[#155DFC] text-white px-4 py-1.5 rounded-full font-medium hover:bg-[#0F4ED1] transition"
      >
        Upgrade
      </button>
      <button
        type="button"
        aria-label="Notifications"
        className="text-neutral-900 cursor-pointer"
      >
        <Bell size={24} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        aria-label="Profile"
        className="cursor-pointer"
      >
        <img
          src={user?.photoURL || "/avatar-placeholder.png"}
          alt=""
          className="w-9 h-9 rounded-full object-cover cursor-pointer"
        />
      </button>
    </div>
  );
}
