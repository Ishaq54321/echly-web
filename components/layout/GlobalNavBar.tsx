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
    "h-9 w-9 flex items-center justify-center rounded-md text-neutral-500 hover:bg-[hsl(var(--surface-2))] hover:text-brand-accent transition-colors duration-150 shrink-0";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 w-full bg-white border-b border-[hsl(var(--border))] flex items-center justify-between px-6">
      <Link href="/dashboard" className="flex items-center" aria-label="Echly home">
        <Image
          src="/Echly_logo.svg"
          alt="Echly"
          width={24}
          height={22}
          className="h-5 w-auto"
        />
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="focus-ring-brand text-sm px-4 py-2 rounded-lg bg-brand-primary text-white hover:brightness-95 active:scale-[0.98] font-medium transition-transform duration-100 ease-out"
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
          <div className="h-8 w-8 rounded-full bg-[hsl(var(--surface-3))] flex items-center justify-center text-sm font-medium text-[hsl(var(--text-secondary))]">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
