"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Link2,
  MoreHorizontal,
  Search,
  Bell,
} from "lucide-react";
import { useState, useCallback } from "react";

export function GlobalNavBar() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const iconButtonClass =
    "h-9 w-9 flex items-center justify-center rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer shrink-0";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] w-full bg-[var(--layer-1-bg)] border-b border-[var(--layer-1-border)] shadow-[var(--shadow-level-1)] flex items-center justify-between px-6">
      <Link href="/dashboard" className="flex items-center cursor-pointer hover:underline" aria-label="Echly home">
        <Image
          src="/Echly_logo.svg"
          alt="Echly"
          width={28}
          height={26}
          className="h-[26px] w-auto"
        />
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="focus-ring-brand text-[14px] px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] font-medium transition-colors duration-150 cursor-pointer"
        >
          Share
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className={iconButtonClass}
          title={copied ? "Copied" : "Copy link"}
          aria-label={copied ? "Copied" : "Copy link"}
        >
          <Link2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Search"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={`${iconButtonClass} rounded-full overflow-hidden`}
          aria-label="User menu"
        >
          <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-[14px] font-medium text-secondary">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
