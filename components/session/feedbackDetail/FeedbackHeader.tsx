"use client";

import { MessageSquare } from "lucide-react";
import type { FeedbackItemShape } from "./types";

function formatCreatedDate(timestamp: number | undefined): string {
  if (timestamp == null) return "—";
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      dateStyle: "short",
    });
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
  const createdLabel = formatCreatedDate(item.timestamp);

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight leading-tight text-[hsl(var(--text-primary))]">
          {item.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-[hsl(var(--text-muted))]">
          {item.id && (
            <>
              <span>{item.id.slice(0, 8)}</span>
              <span className="opacity-50" aria-hidden>·</span>
            </>
          )}
          <span>{createdLabel}</span>
          <span className="opacity-50" aria-hidden>·</span>
          <span>—</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select
          defaultValue={item.status ?? "open"}
          className="text-xs rounded-md bg-[hsl(var(--surface-2))] border-0 px-3 py-1.5 text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--border))]"
          aria-label="Status"
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        {item.type && (
          <span className="text-xs px-2 py-1 rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))]">
            {item.type}
          </span>
        )}
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
  );
}
