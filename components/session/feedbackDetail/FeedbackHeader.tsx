"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
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
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onRequestDelete?: () => void;
}

export function FeedbackHeader({
  item,
  isActivityOpen,
  onToggleActivity,
  onSaveTitle,
  onRequestDelete,
}: FeedbackHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(item.title);
  }, [item.title]);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    if (!onSaveTitle || titleDraft.trim() === "" || titleDraft === item.title) {
      setIsEditingTitle(false);
      setTitleDraft(item.title);
      return;
    }
    onSaveTitle(titleDraft.trim()).finally(() => setIsEditingTitle(false));
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setTitleDraft(item.title);
      setIsEditingTitle(false);
      inputRef.current?.blur();
    }
  };

  const createdAgo = formatRelativeTime(item.timestamp);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {isEditingTitle && onSaveTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-[20px] font-semibold tracking-tight leading-snug text-[hsl(var(--text-primary))] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)]"
              aria-label="Edit title"
            />
          ) : (
            <h1
              onClick={() => onSaveTitle && setIsEditingTitle(true)}
              className={`text-[20px] font-semibold tracking-tight leading-snug text-[hsl(var(--text-primary))] ${onSaveTitle ? "cursor-text hover:bg-[hsl(var(--surface-2))]/50 rounded px-1 -mx-1" : ""}`}
            >
              {item.title}
            </h1>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-[12px]">
            <span className="font-medium text-[hsl(var(--text-primary))]">
              {item.type || "—"}
            </span>
            <span className="opacity-60" aria-hidden>•</span>
            <span className="text-[hsl(var(--text-secondary))] opacity-[0.92]">
              Created {createdAgo}
            </span>
            <span className="opacity-60" aria-hidden>•</span>
            <span className="text-[hsl(var(--text-secondary))] opacity-[0.92]">
              Assigned to You
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {onRequestDelete && (
            <button
              type="button"
              onClick={onRequestDelete}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800/50 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              aria-label="Delete ticket"
            >
              <Trash2 size={14} />
              Delete Ticket
            </button>
          )}
          <StatusPill defaultValue={item.status ?? "open"} aria-label="Status" />
          <div
            className="h-8 w-8 rounded-full bg-[hsl(var(--surface-2))] flex-shrink-0"
            title="Assignee"
            aria-hidden
          />
          <button
            type="button"
            onClick={onToggleActivity}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.4)] ${
              isActivityOpen
                ? "bg-[hsl(var(--surface-2))] text-active"
                : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))] hover:text-primary"
            }`}
            aria-pressed={isActivityOpen}
          >
            <MessageSquare size={14} />
            Activity
          </button>
        </div>
      </div>
      <div className="mt-4 border-b border-[hsl(var(--border))]" />
    </>
  );
}
