"use client";

import { useRef, useEffect } from "react";
import { Section } from "./Section";

interface DescriptionSectionProps {
  description: string;
  isEditing?: boolean;
  draft?: string;
  onEdit?: () => void;
  onDraftChange?: (v: string) => void;
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
}

export function DescriptionSection({
  description,
  isEditing,
  draft = "",
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
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

  const handleBlur = () => {
    if (onSave && draft !== description) {
      void onSave();
    }
  };

  return (
    <Section title="Description">
      <div className="flex flex-col gap-2">
        {isEditing && hasEdit ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onDraftChange?.(e.target.value)}
            onBlur={handleBlur}
            className="w-full min-h-[100px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)] resize-none overflow-hidden"
            autoFocus
            aria-label="Edit description"
          />
        ) : (
          <div
            className={`flex items-start justify-between gap-2 ${hasEdit ? "cursor-text" : ""}`}
            onClick={hasEdit ? onEdit : undefined}
            onKeyDown={hasEdit ? (e) => e.key === "Enter" && (e.target as HTMLElement).click() : undefined}
            role={hasEdit ? "button" : undefined}
            tabIndex={hasEdit ? 0 : undefined}
          >
            <p className="text-[14px] leading-[1.55] text-[hsl(var(--text-primary))] flex-1 hover:bg-[hsl(var(--surface-2))]/50 rounded px-1 -mx-1">
              {displayValue || (hasEdit ? "Add description…" : "")}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
