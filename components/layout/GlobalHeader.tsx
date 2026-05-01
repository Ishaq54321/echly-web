"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { GlobalNotificationButton } from "@/components/layout/GlobalNotificationButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { useBillingStore } from "@/lib/store/billingStore";
import { retainNotificationListener } from "@/lib/store/notificationStore";

export function GlobalHeader() {
  const { plan, isLoaded } = useBillingStore();
  const showUpgrade = isLoaded && plan === "starter";

  useEffect(() => retainNotificationListener(), []);

  return (
    <div className="global-header flex h-16 w-full shrink-0 items-center justify-between bg-white px-6">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("echly:open-search-overlay"))}
        className="flex items-center gap-2.5 h-[34px] max-w-[320px] w-full px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-[var(--surface-subtle)] text-[13px] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer mx-auto"
      >
        <Search size={16} strokeWidth={2} className="text-[var(--text-secondary)] shrink-0" />
        <span className="truncate">Search by Session Title...</span>
      </button>
      <div className="actions flex items-center gap-4">
        {showUpgrade && (
          <Link href="/settings?tab=billing">
            <button
              type="button"
              className="inline-flex items-center h-[34px] px-4 rounded-[var(--radius-btn)] bg-[var(--brand)] text-white text-[13px] font-semibold tracking-[-0.005em] border-0 cursor-pointer hover:bg-[var(--brand-hover)] transition-colors shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(23,117,224,0.3)]"
            >
              Upgrade
            </button>
          </Link>
        )}
        <GlobalNotificationButton />
        <ProfileDropdown />
      </div>
    </div>
  );
}
