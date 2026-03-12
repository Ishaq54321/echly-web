"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { ProfileCommandPanel } from "@/components/layout/ProfileCommandPanel";

export function DashboardHeaderActions() {
  const { user } = useAuthGuard();
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  return (
    <>
    <div className="dashboard-header-actions fixed top-4 right-6 z-[1000] flex items-center gap-[14px]">
      <button
        type="button"
        className="primary-cta px-4 py-1.5 rounded-full transition"
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

