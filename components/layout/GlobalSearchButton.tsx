"use client";

import { Search } from "lucide-react";
import { useCallback } from "react";
import { OPEN_SEARCH_EVENT } from "@/components/search/GlobalSearch";

export type GlobalSearchButtonProps = {
  /** Runs before the global search overlay opens (e.g. close other panels). */
  onBeforeOpen?: () => void;
};

export function GlobalSearchButton({ onBeforeOpen }: GlobalSearchButtonProps = {}) {
  const openSearch = useCallback(() => {
    onBeforeOpen?.();
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }, [onBeforeOpen]);

  return (
    <button
      type="button"
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-hover)] transition-colors cursor-pointer border-0 bg-transparent"
      aria-label="Search"
      onClick={openSearch}
    >
      <Search size={22} strokeWidth={2.2} className="text-[var(--text-heading)]" />
    </button>
  );
}
