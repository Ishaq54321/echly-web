"use client";

import { useState, useMemo } from "react";
import { Tag } from "@/components/ui/Tag";

type SortKind = "recent" | "active";

interface FeedbackItem {
  id: string;
  title: string;
  type: string;
  status?: string;
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

  const total = feedback.length;
  const activeCount =
    feedback.filter((f) => f.status !== "resolved").length;
  const resolvedCount = feedback.filter((f) => f.status === "resolved").length;

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
      <div className="flex flex-col gap-3 px-4 pt-5 pb-4">
        {/* Header (fixed) */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.08em] text-neutral-500 uppercase">
              Feedback
            </h2>
            <p className="text-[12px] text-neutral-400 mt-1">
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
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-md border border-neutral-200 bg-white py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setSort("recent");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs bg-transparent border-none focus:ring-0 transition-colors duration-150 ${
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
                    className={`block w-full text-left px-3 py-1.5 text-xs bg-transparent border-none focus:ring-0 transition-colors duration-150 ${
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
            className="h-9 w-full text-sm px-3 rounded-md bg-white border border-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all duration-150"
            aria-label="Search feedback"
          />
        </div>

        {/* Ticket list (content flows; scroll is on parent panel) */}
        <div className="flex flex-col">
          <div>
          {displayed.map((item, index) => {
            const isActive = item.id === selectedId;
            const isLast = index === displayed.length - 1;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(item.id);
                  }
                }}
                className={`group flex flex-col px-3 py-2.5 cursor-pointer transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.4)] focus-visible:ring-offset-0 border-b border-neutral-200
                  ${isLast ? "border-b-0" : ""}
                  ${isActive
                    ? "bg-white text-neutral-900 rounded-lg shadow-sm hover:bg-white"
                    : "bg-transparent hover:bg-white/60"}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <span className={`text-[14px] font-medium leading-snug truncate flex-1 min-w-0 ${isActive ? "text-neutral-900" : "text-neutral-700"}`}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out p-0.5 rounded text-neutral-400 hover:text-neutral-900 cursor-pointer border-0 bg-transparent"
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
                <div className="flex items-center gap-2 mt-1.5">
                  <Tag name={item.type} variant="sidebar" inactive={!isActive} />
                </div>
              </div>
            );
          })}
          </div>
          {loadMoreRef && <div ref={loadMoreRef} />}
          {loadingMore && (
            <div className="text-[13px] text-neutral-500 py-4 text-center">
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
