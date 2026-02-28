"use client";

import { Pencil, Trash2, Expand, Check } from "lucide-react";
import type { StructuredFeedback } from "./types";

export type FeedbackItemHandlers = {
  onExpand: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onEditedTitleChange: (value: string) => void;
  onEditedDescriptionChange: (value: string) => void;
};

type FeedbackItemProps = {
  item: StructuredFeedback;
  isExpanded: boolean;
  isEditing: boolean;
  editedTitle: string;
  editedDescription: string;
  handlers: FeedbackItemHandlers;
};

export default function FeedbackItem({
  item,
  isExpanded,
  isEditing,
  editedTitle,
  editedDescription,
  handlers,
}: FeedbackItemProps) {
  const {
    onExpand,
    onEdit,
    onSaveEdit,
    onDelete,
    onEditedTitleChange,
    onEditedDescriptionChange,
  } = handlers;

  return (
    <div
      className="bg-white px-6 py-4 border-b border-[rgba(0,0,0,0.05)]
                 transition-[background-color,transform] duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
                 hover:bg-[rgba(0,0,0,0.02)]
                 active:scale-[0.99] active:duration-[80ms] active:ease-in
                 last:border-b-0"
    >
      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                value={editedTitle}
                onChange={(e) => onEditedTitleChange(e.target.value)}
                className="w-full mb-2 px-3 py-2
                                     bg-white text-slate-900
                                     border border-slate-300
                                     rounded-sm text-sm font-medium
                                     focus:ring-2 focus:ring-rose-500
                                     outline-none transition"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => onEditedDescriptionChange(e.target.value)}
                rows={3}
                className="w-full px-3 py-2
                                     bg-white text-slate-800
                                     border border-slate-300
                                     rounded-sm text-sm
                                     focus:ring-2 focus:ring-rose-500
                                     outline-none transition resize-none"
              />
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                {item.title}
              </h3>
              {isExpanded && (
                <p className="text-xs text-slate-600 mt-1.5">
                  {item.description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={onExpand}
            className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-slate-700 transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          >
            <Expand size={18} strokeWidth={2} />
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={onSaveEdit}
              className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-emerald-600 transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            >
              <Check size={18} strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-slate-700 transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            >
              <Pencil size={18} strokeWidth={2} />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-rose-600 transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
