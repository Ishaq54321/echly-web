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
}: Props) {
  const [sort, setSort] = useState<SortKind>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayed = useMemo(() => {
    let list = [...feedback];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((f) => f.title.toLowerCase().includes(q));
    }
    const getTime = (f: FeedbackItem) => {
      if (f.createdAt?.seconds) return f.createdAt.seconds * 1000;
      if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
      if (typeof f.timestamp === "number") return f.timestamp;
      return 0;
    };
    if (sort === "recent") {
      list.sort((a, b) => getTime(b) - getTime(a));
    } else {
      list.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
    }
    return list;
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
      <div className="flex flex-col flex-1 min-h-0 gap-3 px-4 pt-5 pb-4">
        {/* Header (fixed) */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-[hsl(var(--text-muted))]">
              Feedback
            </h2>
            <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
              {subline}
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="text-xs bg-transparent border-none focus:ring-0 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-all duration-150 ease-out cursor-pointer py-0.5"
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
                        ? "font-medium text-[hsl(var(--text-primary))]"
                        : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"
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
                        ? "font-medium text-[hsl(var(--text-primary))]"
                        : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"
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
          <div className="space-y-1">
          {displayed.map((item) => {
            const isActive = item.id === selectedId;
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
                className={`group flex flex-col px-4 py-2.5 rounded-md cursor-pointer transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-0
                  ${isActive
                    ? "bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] relative shadow-[inset_0_1px_0_0_hsl(var(--border)/0.5)]"
                    : "hover:bg-[hsl(var(--surface-1))/0.7] border border-transparent"}`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[hsl(var(--brand))] rounded-r-full"
                    aria-hidden
                  />
                )}
                <div className="flex justify-between items-start gap-3">
                  <span className="text-sm font-medium text-[hsl(var(--text-primary))] leading-snug truncate flex-1 min-w-0">
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
        </div>
      </div>
    </div>
  );
}
