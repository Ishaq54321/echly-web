"use client";

import { useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";
import { Section } from "./Section";
import { SelectableText } from "./SelectableText";
import type { CommentTextRange } from "@/lib/domain/comment";

interface DescriptionSectionProps {
  description: string;
  isEditing?: boolean;
  draft?: string;
  onEdit?: () => void;
  onDraftChange?: (v: string) => void;
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
  isCommentMode?: boolean;
  sendTextComment?: (textRange: CommentTextRange, message: string) => Promise<string | null>;
}

export function DescriptionSection({
  description,
  isEditing,
  draft = "",
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
  isSaving = false,
  saveSuccess = false,
  isCommentMode,
  sendTextComment,
}: DescriptionSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayValue = isEditing ? draft : description;
  const hasEdit = Boolean(onEdit && onDraftChange && onSave && onCancel);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !isEditing) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(100, el.scrollHeight)}px`;
  }, [isEditing, draft]);

  const triggerSave = () => {
    if (!onSave || draft === description || isSaving) return;
    void onSave();
  };

  const handleBlur = () => {
    triggerSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      triggerSave();
    }
  };

  return (
    <Section title="" titleSemantic="insight">
      <div className="flex flex-col gap-2 border-l border-semantic-insight/30 pl-4">
        {isEditing && hasEdit ? (
          <>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => onDraftChange?.(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] p-4 text-[15px] leading-[1.7] text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)] resize-none overflow-hidden"
              autoFocus
              aria-label="Edit description"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-[14px] font-medium px-3 py-2 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerSave}
                disabled={isSaving || draft === description}
                className="text-[14px] font-semibold px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(26,86,219,0.3)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-[var(--motion-duration)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : isCommentMode && sendTextComment ? (
          <SelectableText
            containerId="description"
            isCommentMode
            onAddTextComment={sendTextComment}
            className="relative"
          >
            <div
              className={`group relative flex items-start justify-between gap-2 ${hasEdit ? "cursor-pointer" : ""}`}
              onClick={hasEdit ? onEdit : undefined}
              onKeyDown={hasEdit ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onEdit?.()) : undefined}
              role={hasEdit ? "button" : undefined}
              tabIndex={hasEdit ? 0 : undefined}
            >
              <p className="text-[15px] leading-[1.7] text-[hsl(var(--text-primary-strong))] flex-1 pr-6">
                {displayValue || (hasEdit ? "Add description…" : "")}
              </p>
              {hasEdit && (
                <span className="absolute top-0 right-0 flex items-center gap-1.5">
                  {saveSuccess ? (
                    <span className="text-xs text-semantic-success flex items-center gap-1.5 transition-opacity duration-150">
                      <Check size={14} className="shrink-0" aria-hidden />
                      Saved
                    </span>
                  ) : (
                    <Pencil
                      size={14}
                      className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-[hsl(var(--text-secondary))] shrink-0"
                      aria-hidden
                    />
                  )}
                </span>
              )}
            </div>
          </SelectableText>
        ) : (
          <div
            className={`group relative flex items-start justify-between gap-2 ${hasEdit ? "cursor-pointer" : ""}`}
            onClick={hasEdit ? onEdit : undefined}
            onKeyDown={hasEdit ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onEdit?.()) : undefined}
            role={hasEdit ? "button" : undefined}
            tabIndex={hasEdit ? 0 : undefined}
          >
            <p className="text-[15px] leading-[1.7] text-[hsl(var(--text-primary-strong))] flex-1 pr-6">
              {displayValue || (hasEdit ? "Add description…" : "")}
            </p>
            {hasEdit && (
              <span className="absolute top-0 right-0 flex items-center gap-1.5">
                {saveSuccess ? (
                  <span className="text-xs text-semantic-success flex items-center gap-1.5 transition-opacity duration-150">
                    <Check size={14} className="shrink-0" aria-hidden />
                    Saved
                  </span>
                ) : (
                  <Pencil
                    size={14}
                    className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-[hsl(var(--text-secondary))] shrink-0"
                    aria-hidden
                  />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
