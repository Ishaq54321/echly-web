"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

interface FeedbackItem {
  id: string;
  title: string;
  type: string;
  isResolved?: boolean;
  isSkipped?: boolean;
  createdAt?: { seconds: number } | null;
  clientTimestamp?: number | null;
  timestamp?: number;
  commentCount?: number;
}

interface Props {
  feedback: FeedbackItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  selectedIndex?: number;
  total?: number;
  /** Server metadata: active (open) count; do not derive from feedback array. */
  activeCount?: number;
  /** Server metadata: resolved count; do not derive from feedback array. */
  resolvedCount?: number;
  /** Infinite scroll: loading next page. */
  loadingMore?: boolean;
  hasMore?: boolean;
  hasReachedLimit?: boolean;
  /** Ref for sentinel div (intersection observer). */
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  /** Called when "Mark all as resolved" is chosen; batch update then refetch. */
  onMarkAllResolved?: () => Promise<void>;
}

function FeedbackSidebarInner({
  feedback,
  selectedId,
  onSelect,
  total: totalProp,
  activeCount: activeCountProp,
  resolvedCount: resolvedCountProp,
  loadingMore = false,
  hasMore = false,
  hasReachedLimit = false,
  loadMoreRef,
  onMarkAllResolved,
}: Props) {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    return feedback.filter((item) => {
      if (filter === "active") return (item.isResolved ?? false) === false && (item.isSkipped ?? false) === false;
      if (filter === "resolved") return item.isResolved === true;
      return true;
    });
  }, [feedback, filter]);

  const displayed = useMemo(() => {
    const getTime = (f: FeedbackItem): number => {
      if (f.createdAt?.seconds != null) return f.createdAt.seconds * 1000;
      if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
      if (typeof f.timestamp === "number") return f.timestamp;
      return 0;
    };
    const q = searchQuery.trim().toLowerCase();
    const searchFiltered = q
      ? filteredItems.filter((f) => f.title.toLowerCase().includes(q))
      : filteredItems;
    return [...searchFiltered].sort((a, b) => getTime(b) - getTime(a));
  }, [filteredItems, searchQuery]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const total = typeof totalProp === "number" ? totalProp : feedback.length;
  const activeCount =
    typeof activeCountProp === "number"
      ? activeCountProp
      : feedback.filter((f) => (f.isResolved ?? false) === false && (f.isSkipped ?? false) === false).length;
  const resolvedCount =
    typeof resolvedCountProp === "number"
      ? resolvedCountProp
      : feedback.filter((f) => f.isResolved === true).length;

  const subline =
    total > 0
      ? [
          total + " total",
          ...(activeCount > 0 ? [activeCount + " active"] : []),
          ...(resolvedCount > 0 ? [resolvedCount + " resolved"] : []),
        ].join(" · ")
      : "0 total";

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
        {/* Header (fixed) */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-[12px] uppercase tracking-[0.08em] text-neutral-400">
              Feedback
            </h2>
            <p className="text-[13px] text-neutral-400 mt-1">
              {subline}
            </p>
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-md cursor-pointer hover:bg-neutral-100 transition-colors duration-150"
              aria-label="Options"
            >
              <MoreHorizontal className="h-4 w-4 text-neutral-500" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-lg border border-neutral-200 bg-white shadow-sm transition-opacity duration-120 z-20"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors duration-120"
                  onClick={() => {
                    setFilter("all");
                    setMenuOpen(false);
                  }}
                >
                  Show all
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors duration-120"
                  onClick={() => {
                    setFilter("active");
                    setMenuOpen(false);
                  }}
                >
                  Show active only
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors duration-120"
                  onClick={() => {
                    setFilter("resolved");
                    setMenuOpen(false);
                  }}
                >
                  Show resolved only
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-[14px] text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors duration-120"
                  onClick={async () => {
                    setMenuOpen(false);
                    await onMarkAllResolved?.();
                  }}
                >
                  Mark all as resolved
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search (fixed) */}
        <div className="shrink-0">
          <input
            type="search"
            placeholder="Search feedback…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full text-[15px] px-3 rounded-md bg-white border border-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 transition-all duration-150"
            aria-label="Search feedback"
          />
        </div>

        {/* Ticket list (content flows; scroll is on parent panel) */}
        <div className="flex flex-col">
          <div>
          {displayed.map((item, index) => {
            const isActive = item.id === selectedId;

            return (
              <div key={item.id} className="relative group">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(item.id);
                    }
                  }}
                  className={`relative flex items-center gap-3 px-5 py-2.5 rounded-full transition-colors duration-[120ms] outline-none focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)] cursor-pointer ${
                    isActive
                      ? "text-[hsl(var(--text-primary-strong))] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-[hsl(var(--text-secondary-soft))] hover:text-[hsl(var(--text-primary-strong))] hover:bg-black/[0.04]"
                  }`}
                >
                  <span
                    className={`w-6 shrink-0 text-right text-[13px] ${
                      isActive ? "text-[hsl(var(--text-primary-strong))] font-medium" : "text-[hsl(var(--text-tertiary))]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] ${
                      isActive ? "font-semibold text-[hsl(var(--text-primary-strong))]" : "font-normal text-[hsl(var(--text-secondary-soft))]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-colors duration-120 ease-out p-0.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer border-0 bg-transparent shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="More actions"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <circle cx="8" cy="3" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="13" r="1.5" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          {loadMoreRef && <div ref={loadMoreRef} />}
          {loadingMore && (
            <div className="text-[14px] text-neutral-500 py-4 text-center">
              Loading…
            </div>
          )}
          {!hasMore && feedback.length > 0 && (
            <div className="text-[12px] text-neutral-400 py-4 text-center">
              No more feedback
            </div>
          )}
          {hasReachedLimit && feedback.length > 0 && (
            <div className="shrink-0 px-3 py-1.5 text-[12px] text-neutral-400 text-center">
              Reached maximum items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FeedbackSidebarInner);
