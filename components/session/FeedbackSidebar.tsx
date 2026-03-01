"use client";

import { useState, useMemo } from "react";

type SortKind = "recent" | "active";

interface FeedbackItem {
  id: string;
  title: string;
  type: string;
  isResolved?: boolean;
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
  /** Infinite scroll: loading next page. */
  loadingMore?: boolean;
  hasMore?: boolean;
  hasReachedLimit?: boolean;
  /** Ref for sentinel div (intersection observer). */
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
}

export default function FeedbackSidebar({
  feedback,
  selectedId,
  onSelect,
  total: totalProp,
  loadingMore = false,
  hasMore = false,
  hasReachedLimit = false,
  loadMoreRef,
}: Props) {
  const [sort, setSort] = useState<SortKind>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayed = useMemo(() => {
    const getTime = (f: FeedbackItem): number => {
      if (f.createdAt?.seconds != null) return f.createdAt.seconds * 1000;
      if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
      if (typeof f.timestamp === "number") return f.timestamp;
      return 0;
    };
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? feedback.filter((f) => f.title.toLowerCase().includes(q))
      : feedback;
    const sorted =
      sort === "recent"
        ? [...filtered].sort((a, b) => getTime(b) - getTime(a))
        : [...filtered].sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
    return sorted;
  }, [feedback, searchQuery, sort]);

  const total = typeof totalProp === "number" ? totalProp : feedback.length;
  const openCount = feedback.filter((f) => !(f.isResolved ?? false)).length;
  const resolvedCount = feedback.filter((f) => f.isResolved === true).length;

  const subline =
    total > 0
      ? [
          total + " total",
          ...(openCount > 0 ? [openCount + " active"] : []),
          ...(resolvedCount > 0 ? [resolvedCount + " resolved"] : []),
        ].join(" · ")
      : "0 total";

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-4 pt-5 pb-4">
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="text-[12px] bg-transparent border-none focus:ring-0 text-neutral-400 hover:text-neutral-600 transition-all duration-150 ease-out cursor-pointer py-0.5"
            >
              {sort === "recent" ? "Most Recent" : "Most Active"}
            </button>
            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10 cursor-pointer"
                  aria-hidden
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-md border border-neutral-200 bg-white py-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <button
                    type="button"
                    onClick={() => {
                      setSort("recent");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs bg-transparent border-none focus:ring-0 cursor-pointer transition-colors duration-120 hover:bg-neutral-100 ${
                      sort === "recent"
                        ? "font-medium text-neutral-900"
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    Most Recent
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSort("active");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs bg-transparent border-none focus:ring-0 cursor-pointer transition-colors duration-120 hover:bg-neutral-100 ${
                      sort === "active"
                        ? "font-medium text-neutral-900"
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    Most Active
                  </button>
                </div>
              </>
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
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-120 outline-none focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 cursor-pointer ${
                    isActive
                      ? "text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-semantic-system"
                      aria-hidden
                    />
                  )}
                  <span
                    className={`w-6 shrink-0 text-right text-[13px] ${
                      isActive ? "text-semantic-system font-medium" : "text-neutral-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] ${
                      isActive ? "font-medium text-neutral-900" : "font-normal text-neutral-600"
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
