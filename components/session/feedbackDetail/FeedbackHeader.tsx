"use client";

import { MessageSquare } from "lucide-react";
import { StatusPill } from "./StatusPill";
import type { FeedbackItemShape } from "./types";

function formatRelativeTime(timestamp: number | undefined): string {
  if (timestamp == null) return "—";
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

interface FeedbackHeaderProps {
  item: FeedbackItemShape & { index: number; total: number };
  isActivityOpen: boolean;
  onToggleActivity: () => void;
}

export function FeedbackHeader({
  item,
  isActivityOpen,
  onToggleActivity,
}: FeedbackHeaderProps) {
  const createdAgo = formatRelativeTime(item.timestamp);

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[19px] font-semibold tracking-tight leading-snug text-[hsl(var(--text-primary))]">
            {item.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-[12px]">
            <span className="font-medium text-[hsl(var(--text-primary))]">
              {item.type || "—"}
            </span>
            <span className="opacity-40" aria-hidden>•</span>
            <span className="text-[hsl(var(--text-muted))] opacity-80">
              Created {createdAgo}
            </span>
            <span className="opacity-40" aria-hidden>•</span>
            <span className="text-[hsl(var(--text-muted))] opacity-80">
              Assigned to You
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill defaultValue={item.status ?? "open"} aria-label="Status" />
          <div
            className="h-8 w-8 rounded-full bg-[hsl(var(--surface-2))] flex-shrink-0"
            title="Assignee"
            aria-hidden
          />
          <button
            type="button"
            onClick={onToggleActivity}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActivityOpen
                ? "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))]"
                : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"
            }`}
            aria-pressed={isActivityOpen}
          >
            <MessageSquare size={14} />
            Activity
          </button>
        </div>
      </div>
      <div className="mt-5 border-b border-[hsl(var(--border)/0.7)]" />
    </>
  );
}
