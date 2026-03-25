"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Trash2, Pencil, Check } from "lucide-react";
import { ResolvedToggle } from "@/components/ui/ResolvedToggle";
import type { Timestamp } from "firebase/firestore";
import type { FeedbackItemShape } from "./types";

function toDate(value: string | Timestamp | null | undefined): Date | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const t = value as Timestamp;
  if (typeof t.toDate === "function") return t.toDate();
  if (typeof (t as { seconds?: number }).seconds === "number") {
    const d = new Date((t as { seconds: number }).seconds * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatRelative(isoOrTimestamp: string | Timestamp | null | undefined): string {
  const d = toDate(isoOrTimestamp);
  if (!d) return "—";
  try {
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
    <div className="pt-0 pb-4">
      <div className="text-[13px] text-[hsl(var(--text-tertiary))] mb-1.5">
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
                className="w-full text-[20px] font-semibold leading-[1.25] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))] bg-[var(--layer-1-bg)] border border-[var(--layer-2-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)]"
                aria-label="Edit title"
              />
              <p className="text-[14px] text-[hsl(var(--text-tertiary))] mt-1">
                Enter to save
              </p>
              {isSaving && (
                <p className="text-[14px] text-[hsl(var(--text-tertiary))] mt-0.5 transition-opacity duration-150">
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
                  <Check size={14} className="text-secondary shrink-0 flex-shrink-0" aria-hidden />
                ) : (
                  <Pencil
                    size={14}
                    className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-secondary shrink-0 flex-shrink-0"
                    aria-hidden
                  />
                )
              )}
            </div>
          )}
          {saveSuccess && !isEditingTitle && (
            <p className="text-[14px] text-secondary mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
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
              className="flex items-center gap-2 px-3 py-2 text-[14px] font-medium text-[hsl(var(--text-tertiary))] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors duration-[var(--motion-duration)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] rounded-xl cursor-pointer"
              aria-label="Delete"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onToggleActivity}
            className={`flex items-center gap-2 px-3 py-2 text-[14px] font-medium text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] rounded-xl cursor-pointer ${
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
        <div className="mt-1 text-[13px] text-[hsl(var(--text-tertiary))]">
          {item.updatedAt != null
            ? `Created ${formatRelative(item.createdAt ?? null)} • Updated ${formatRelative(item.updatedAt)}`
            : `Created ${formatRelative(item.createdAt ?? null)}`}
        </div>
      )}
      <div className="my-3 border-b border-[var(--layer-1-border)]" />
    </div>
  );
}
