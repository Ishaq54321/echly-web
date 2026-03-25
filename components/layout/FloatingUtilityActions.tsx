"use client";

import { useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import { ProfileCommandPanel } from "@/components/layout/ProfileCommandPanel";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SessionsSearchInput } from "@/components/dashboard/SessionsSearchInput";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";

export function FloatingUtilityActions() {
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const { search, setSearch } = useSessionsSearch();
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="sticky top-0 z-[100] flex w-full shrink-0 items-center justify-between bg-white px-6 pt-5 pb-3">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4" />

          <div className="flex min-w-0 flex-1 justify-center">
            <div className="mx-auto w-full max-w-[520px]">
              <SessionsSearchInput value={search} onChange={setSearch} />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <button
              type="button"
              className="shrink-0 bg-[#155DFC] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#0F4ED1] rounded-full"
            >
              Upgrade
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="shrink-0 cursor-pointer text-neutral-900"
            >
              <Bell className="h-6 w-6 stroke-[2.2]" aria-hidden />
            </button>
            <button
              ref={avatarRef}
              type="button"
              aria-label="Profile"
              aria-expanded={profilePanelOpen}
              className="shrink-0 cursor-pointer"
              onClick={() => setProfilePanelOpen((v) => !v)}
            >
              <UserAvatar
                image={(user as { image?: string | null } | null)?.image}
                photoURL={user?.photoURL}
                name={
                  user?.displayName?.trim() ||
                  user?.email?.split("@")[0] ||
                  undefined
                }
                className="h-9 w-9 cursor-pointer"
              />
            </button>
          </div>
        </div>
      </header>
      <ProfileCommandPanel
        open={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        user={user}
        anchorRef={avatarRef}
      />
    </>
  );
}
