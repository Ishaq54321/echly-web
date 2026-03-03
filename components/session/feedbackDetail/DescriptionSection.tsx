"use client";

import { useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";
import { Section } from "./Section";

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
    <Section title="Description" titleSemantic="insight">
      <div className="flex flex-col gap-2 border-l border-semantic-insight/30 pl-4">
        {isEditing && hasEdit ? (
          <>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => onDraftChange?.(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] rounded-lg border border-[var(--layer-2-border)] bg-white p-3 text-[15px] leading-[1.7] text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)] focus:border-[var(--ai-accent)] transition-all duration-150 resize-none overflow-hidden"
              autoFocus
              aria-label="Edit description"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-[14px] font-medium px-3 py-1.5 rounded-lg border border-[var(--layer-2-border)] bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerSave}
                disabled={isSaving || draft === description}
                className="text-[14px] font-medium px-3 py-1.5 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
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
