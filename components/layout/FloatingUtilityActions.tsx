"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import { ProfileCommandPanel } from "@/components/layout/ProfileCommandPanel";

export function FloatingUtilityActions() {
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  return (
    <>
    <div className="absolute top-6 right-8 flex items-center gap-4 z-10">
      <button
        type="button"
        className="primary-cta px-4 py-2 rounded-full text-meta transition-colors"
      >
        Upgrade
      </button>
      <button
        type="button"
        aria-label="Notifications"
        className="text-[#111111] hover:text-[#111111] cursor-pointer transition-colors"
      >
        <Bell size={24} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        aria-label="Profile"
        className="cursor-pointer"
        onClick={() => setProfilePanelOpen(true)}
      >
        <img
          src={user?.photoURL || "/avatar-placeholder.png"}
          alt=""
          className="w-9 h-9 rounded-full object-cover cursor-pointer"
        />
      </button>
    </div>
    <ProfileCommandPanel
      open={profilePanelOpen}
      onClose={() => setProfilePanelOpen(false)}
    />
    </>
  );
}
