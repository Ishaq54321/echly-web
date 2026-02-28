"use client";

import { useState, useMemo } from "react";
import { FeedbackTag } from "@/components/ui/FeedbackTag";

type FilterKind = "all" | "ux" | "bugs" | "unresolved" | "most_active";
type SortKind = "recent" | "commented" | "oldest";

interface FeedbackItem {
  id: string;
  title: string;
  type: string;
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

export default function FeedbackSidebar({
  feedback,
  selectedId,
  onSelect,
}: Props) {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [sort, setSort] = useState<SortKind>("recent");
  const [sortOpen, setSortOpen] = useState(false);

  const displayed = useMemo(() => {
    let list = feedback;

    switch (filter) {
      case "ux":
        list = feedback.filter((f) => f.type === "UX Issue");
        break;
      case "bugs":
        list = feedback.filter((f) => f.type === "Bug");
        break;
      case "unresolved":
        list = feedback.filter((f) => (f.commentCount ?? 0) === 0);
        break;
      case "most_active":
        list = [...feedback].sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
        break;
      default:
        break;
    }

    if (filter !== "most_active") {
      const getTime = (f: FeedbackItem) => {
        if (f.createdAt?.seconds) return f.createdAt.seconds * 1000;
        if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
        if (typeof f.timestamp === "number") return f.timestamp;
        return 0;
      };
      list = [...list];
      switch (sort) {
        case "recent":
          list.sort((a, b) => getTime(b) - getTime(a));
          break;
        case "oldest":
          list.sort((a, b) => getTime(a) - getTime(b));
          break;
        case "commented":
          list.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
          break;
      }
    }

    return list;
  }, [feedback, filter, sort]);

  const selectedIndex = selectedId
    ? displayed.findIndex((f) => f.id === selectedId)
    : -1;
  const total = displayed.length;

  return (
    <div className="flex h-full flex-col border-r border-[hsl(var(--border))] border-opacity-50 bg-[hsl(var(--surface-1))] px-6 pt-8 pb-6">
      <div className="space-y-5 flex-1 min-h-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--text-muted))]">
              FEEDBACK
            </div>
            {total >= 0 && (
              <div className="text-xs text-[hsl(var(--text-muted))]">
                {selectedIndex >= 0 ? selectedIndex + 1 : 0} of {total}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors duration-150 rounded px-2 py-1"
            >
              {sort === "recent" && "Most Recent"}
              {sort === "commented" && "Most Commented"}
              {sort === "oldest" && "Oldest"}
            </button>
            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-lg border border-[hsl(var(--border))] border-opacity-60 bg-[hsl(var(--surface-1))] py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSort("recent");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs transition-colors duration-150 ${
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
                      setSort("commented");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs transition-colors duration-150 ${
                      sort === "commented"
                        ? "font-medium text-[hsl(var(--text-primary))]"
                        : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"
                    }`}
                  >
                    Most Commented
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSort("oldest");
                      setSortOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs transition-colors duration-150 ${
                      sort === "oldest"
                        ? "font-medium text-[hsl(var(--text-primary))]"
                        : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"
                    }`}
                  >
                    Oldest
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["all", "All"],
              ["ux", "UX"],
              ["bugs", "Bugs"],
              ["unresolved", "Unresolved"],
              ["most_active", "Most Active"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs cursor-pointer transition-colors duration-150 ${
                filter === value
                  ? "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] font-medium"
                  : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col space-y-1.5 overflow-y-auto min-h-0">
          {displayed.map((item) => {
            const isActive = item.id === selectedId;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`relative w-full cursor-pointer rounded-xl px-4 py-3.5 text-left transition-all duration-150 ease-out
                  ${isActive ? "bg-[hsl(var(--surface-2))]" : "hover:bg-[hsl(var(--surface-2))]"}`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[hsl(var(--accent))]"
                    aria-hidden
                  />
                )}
                <div className="truncate text-sm font-medium text-[hsl(var(--text-primary))]">
                  {item.title}
                </div>
                <div className="mt-1.5">
                  <FeedbackTag type={item.type} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
