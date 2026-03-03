"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Trash2, Pencil, Check } from "lucide-react";
import { ResolvedToggle } from "@/components/ui/ResolvedToggle";
import type { FeedbackItemShape } from "./types";

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  onResolvedChange?: (isResolved: boolean) => void;
}

export function FeedbackHeader({
  item,
  isActivityOpen,
  onToggleActivity,
  onSaveTitle,
  onRequestDelete,
  onResolvedChange,
}: FeedbackHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const title = item.title;
    const t = requestAnimationFrame(() => setTitleDraft(title));
    return () => cancelAnimationFrame(t);
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
    <div className="pt-2 pb-6">
      <div className="text-[13px] text-[hsl(var(--text-tertiary))] mb-3">
        {item.index} of {item.total}
      </div>
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
                className="w-full text-[20px] font-semibold leading-[1.15] tracking-[-0.025em] text-[hsl(var(--text-primary-strong))] bg-white border border-[var(--layer-2-border)] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)] transition-all duration-150"
                aria-label="Edit title"
              />
              <p className="text-[14px] text-[hsl(var(--text-tertiary))] mt-1.5">
                Enter to save
              </p>
              {isSaving && (
                <p className="text-[14px] text-neutral-500 mt-0.5 transition-opacity duration-150">
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
              <h1 className="text-[20px] font-semibold leading-[1.15] tracking-[-0.025em] text-[hsl(var(--text-primary-strong))] truncate">
                {item.title}
              </h1>
              {onSaveTitle && (
                saveSuccess ? (
                  <Check size={14} className="text-neutral-600 shrink-0 flex-shrink-0" aria-hidden />
                ) : (
                  <Pencil
                    size={14}
                    className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-neutral-600 shrink-0 flex-shrink-0"
                    aria-hidden
                  />
                )
              )}
            </div>
          )}
          {saveSuccess && !isEditingTitle && (
            <p className="text-[14px] text-neutral-600 mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
              <Check size={12} className="shrink-0" aria-hidden />
              Saved
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {onResolvedChange != null && (
            <ResolvedToggle
              isResolved={item.isResolved ?? false}
              onChange={onResolvedChange}
            />
          )}
          {onRequestDelete && (
            <button
              type="button"
              onClick={onRequestDelete}
              className="flex items-center gap-2 px-3 py-2 text-[14px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-semantic-danger/10 transition-colors duration-120 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 rounded-md cursor-pointer"
              aria-label="Delete permanently"
            >
              <Trash2 size={14} />
              Delete permanently
            </button>
          )}
          <button
            type="button"
            onClick={onToggleActivity}
            className={`flex items-center gap-2 px-3 py-2 text-[14px] font-medium text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-120 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai-accent)] focus-visible:ring-offset-1 rounded-lg cursor-pointer ${
              isActivityOpen ? "text-[hsl(var(--text-secondary-soft))]" : ""
            }`}
            aria-pressed={isActivityOpen}
          >
            <MessageSquare size={14} />
            Activity
          </button>
        </div>
      </div>
      {(item.createdAt != null || item.updatedAt != null) && (
        <div className="mt-2 text-[13px] text-[hsl(var(--text-tertiary))]">
          {item.updatedAt != null
            ? `Created ${formatRelative(item.createdAt ?? null)} • Updated ${formatRelative(item.updatedAt)}`
            : `Created ${formatRelative(item.createdAt ?? null)}`}
        </div>
      )}
      <div className="my-6 border-b border-[var(--layer-1-border)]" />
    </div>
  );
}
