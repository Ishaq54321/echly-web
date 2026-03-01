"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Trash2, Pencil, Check } from "lucide-react";
import { StatusPill } from "./StatusPill";
import type { FeedbackItemShape } from "./types";

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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
    setIsSaving(true);
    onSaveTitle(titleDraft.trim())
      .then(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1200);
        setIsEditingTitle(false);
      })
      .catch(() => {
        setIsSaving(false);
      });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setTitleDraft(item.title);
      setIsEditingTitle(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="pt-4 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {isEditingTitle && onSaveTitle ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleBlur}
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={handleTitleKeyDown}
                className="w-full text-[20px] font-semibold tracking-tight leading-snug text-[hsl(var(--text-primary))] bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                aria-label="Edit title"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Enter to save
              </p>
              {isSaving && (
                <p className="text-xs text-neutral-500 mt-0.5 transition-opacity duration-150">
                  Saving...
                </p>
              )}
            </>
          ) : (
            <div
              className={`group flex items-center gap-2 min-w-0 ${onSaveTitle ? "cursor-pointer" : ""}`}
              onClick={() => onSaveTitle && setIsEditingTitle(true)}
              role={onSaveTitle ? "button" : undefined}
              tabIndex={onSaveTitle ? 0 : undefined}
              onKeyDown={(e) => {
                if (onSaveTitle && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setIsEditingTitle(true);
                }
              }}
              aria-label={onSaveTitle ? "Edit title" : undefined}
            >
              <h1 className="text-[20px] font-semibold tracking-tight leading-snug text-[hsl(var(--text-primary))] truncate">
                {item.title}
              </h1>
              {onSaveTitle && (
                saveSuccess ? (
                  <Check size={14} className="text-green-600 shrink-0 flex-shrink-0" aria-hidden />
                ) : (
                  <Pencil
                    size={14}
                    className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-[hsl(var(--text-secondary))] shrink-0 flex-shrink-0"
                    aria-hidden
                  />
                )
              )}
            </div>
          )}
          {saveSuccess && !isEditingTitle && (
            <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
              <Check size={12} className="shrink-0" aria-hidden />
              Saved
            </p>
          )}
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
      <div className="mt-4 border-b border-neutral-200" />
    </div>
  );
}
