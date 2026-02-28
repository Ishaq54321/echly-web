"use client";

import { Section } from "./Section";

interface DescriptionSectionProps {
  description: string;
  isEditing?: boolean;
  draft?: string;
  onEdit?: () => void;
  onDraftChange?: (v: string) => void;
  onSave?: () => void;
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
  const displayValue = isEditing ? draft : description;
  const hasEdit = Boolean(onEdit && onDraftChange && onSave && onCancel);

  return (
    <Section title="Description">
      <div className="flex flex-col gap-3">
        {isEditing && hasEdit ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange?.(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[hsl(var(--border))]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSave}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-[hsl(var(--text-primary))] text-[hsl(var(--surface-1))] hover:opacity-90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-relaxed text-[hsl(var(--text-primary))] flex-1">
              {displayValue}
            </p>
            {hasEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] flex-shrink-0"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
