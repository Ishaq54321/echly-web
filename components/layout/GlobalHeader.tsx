"use client";

import { GlobalSearchButton } from "@/components/layout/GlobalSearchButton";
import { GlobalNotificationButton } from "@/components/layout/GlobalNotificationButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

export function GlobalHeader() {
  return (
    <div className="global-header flex h-16 w-full shrink-0 items-center justify-between bg-white px-6">
      <div className="spacer min-w-0 flex-1" aria-hidden />
      <div className="actions flex items-center gap-3">
        <GlobalSearchButton />
        <GlobalNotificationButton />
        <ProfileDropdown />
      </div>
    </div>
  );
}
