"use client";

import { useState, useMemo } from "react";
import { FeedbackTag } from "@/components/ui/FeedbackTag";

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
  /** Pagination: show "Load more" and call when user requests next page. */
  loadingMore?: boolean;
  hasMore?: boolean;
  hasReachedLimit?: boolean;
  onLoadMore?: () => void;
}

function formatRowTime(f: FeedbackItem): string {
  const ms =
    f.createdAt?.seconds != null
      ? f.createdAt.seconds * 1000
      : typeof f.clientTimestamp === "number"
        ? f.clientTimestamp
        : typeof f.timestamp === "number"
          ? f.timestamp
          : null;
  if (ms == null) return "";
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function FeedbackSidebar({
  feedback,
  selectedId,
  onSelect,
  loadingMore = false,
  hasMore = false,
  hasReachedLimit = false,
  onLoadMore,
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
    <div className="flex flex-col h-full min-h-0">
      <style dangerouslySetInnerHTML={{ __html: `
        .feedback-sidebar-active-rail::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: hsl(var(--brand));
        }
      `}} />
      <div className="flex flex-col flex-1 min-h-0 gap-3 px-4 pt-5 pb-4">
        {/* Header (fixed) */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.02em] text-[#111827]">
              Feedback
            </h2>
            <p className="text-xs text-[#4B5563] mt-1">
              {subline}
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="text-xs bg-transparent border-none focus:ring-0 text-[#4B5563] hover:text-[#374151] transition-all duration-150 ease-out cursor-pointer py-0.5"
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
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSort("recent");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs bg-transparent border-none focus:ring-0 transition-colors duration-150 ${
                      sort === "recent"
                        ? "font-medium text-active"
                        : "text-[hsl(var(--text-muted))] hover:text-primary"
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
                        ? "font-medium text-active"
                        : "text-[hsl(var(--text-muted))] hover:text-primary"
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
            className="h-9 w-full text-sm px-3 rounded-md bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] placeholder:text-[hsl(var(--text-muted))] focus:ring-2 focus:ring-[hsl(var(--brand)/0.35)] focus:outline-none transition-all duration-150 ease-out"
            aria-label="Search feedback"
          />
        </div>

        {/* Ticket list (scrollable only) */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          <div>
          {displayed.map((item, index) => {
            const isActive = item.id === selectedId;
            const isLast = index === displayed.length - 1;
            const timeStr = formatRowTime(item);
            const commentNum = item.commentCount ?? 0;

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
                className={`group flex flex-col px-3 py-2.5 cursor-pointer transition-[background-color] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.4)] focus-visible:ring-offset-0 border-b border-b-[rgba(0,0,0,0.04)]
                  ${isLast ? "border-b-0" : ""}
                  ${isActive
                    ? "relative bg-[var(--surface-selected)] feedback-sidebar-active-rail hover:bg-[#e4e7ec]"
                    : "bg-[var(--surface-card)] hover:bg-[rgba(0,0,0,0.02)]"}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <span className={`text-sm leading-snug truncate flex-1 min-w-0 ${isActive ? "font-semibold text-[#2A2A2A]" : "font-medium text-[hsl(var(--text-muted))]"}`}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-[hsl(var(--text-secondary))] opacity-90">
                      {commentNum > 0 ? `${commentNum}` : timeStr || ""}
                    </span>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out p-0.5 rounded text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] cursor-pointer border-0 bg-transparent"
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
                  <FeedbackTag type={item.type} />
                </div>
              </div>
            );
          })}
          </div>
          {/* Cost protection: load more only when allowed; append results. */}
          {hasMore && !hasReachedLimit && onLoadMore && (
            <div className="shrink-0 px-3 py-2 border-t border-[rgba(0,0,0,0.04)]">
              <button
                type="button"
                onClick={() => onLoadMore()}
                disabled={loadingMore}
                className="w-full text-xs py-2 rounded-md bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] disabled:opacity-60 transition-colors"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
          {hasReachedLimit && feedback.length > 0 && (
            <div className="shrink-0 px-3 py-1.5 text-xs text-[hsl(var(--text-muted))] text-center">
              Reached maximum items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
