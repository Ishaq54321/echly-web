"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

export interface MobileAppHeaderProps {
  onMenuClick: () => void;
}

export function MobileAppHeader({ onMenuClick }: MobileAppHeaderProps) {
  return (
    <header
      className="md:hidden sticky top-0 z-30 flex items-center h-14 px-2 bg-[var(--surface)] border-b border-[var(--border)]"
      role="banner"
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="w-11 h-11 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-heading)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF]"
      >
        <Menu size={22} strokeWidth={2} aria-hidden />
      </button>

      <Link
        href="/dashboard"
        className="flex items-center ml-1"
        aria-label="Annote home"
      >
        <Image
          src="/annote-logo-full.svg"
          alt="Annote"
          width={92}
          height={22}
          sizes="92px"
          className="h-[22px] w-auto object-contain"
          priority
        />
      </Link>

      <div className="ml-auto" aria-hidden />
    </header>
  );
}
