"use client";

import { Sparkles } from "lucide-react";
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
    <Section title="Description" icon={<Sparkles size={16} />}>
      {isEditing && hasEdit ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange?.(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-slate-800 leading-8 focus:outline-none focus:ring-2 focus:ring-slate-200"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] text-slate-800 leading-8 flex-1">
            {displayValue}
          </p>
          {hasEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-sm text-slate-500 hover:text-slate-700 flex-shrink-0"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </Section>
  );
}
