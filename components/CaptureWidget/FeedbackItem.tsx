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
      className="bg-white px-5 py-3 border-b border-[rgba(0,0,0,0.05)]
                 transition-[background-color,transform] duration-[120ms] ease-out
                 hover:bg-[rgba(0,0,0,0.02)]
                 active:scale-[0.99] active:duration-75 active:ease-in
                 last:border-b-0"
    >
      <div className="flex justify-between gap-4">
        <div className="flex-1">
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
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
              {isExpanded && (
                <p className="text-xs text-slate-600 mt-1">
                  {item.description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-start gap-0.5 text-slate-400">
          <button
            onClick={onExpand}
            className="p-1.5 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-slate-700 transition-colors duration-[120ms] ease-out"
          >
            <Expand size={16} strokeWidth={2} />
          </button>

          {isEditing ? (
            <button
              onClick={onSaveEdit}
              className="p-1.5 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-emerald-600 transition-colors duration-[120ms] ease-out"
            >
              <Check size={16} strokeWidth={2} />
            </button>
          ) : (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-slate-700 transition-colors duration-[120ms] ease-out"
            >
              <Pencil size={16} strokeWidth={2} />
            </button>
          )}

          <button
            onClick={onDelete}
            className="p-1.5 rounded-sm hover:bg-[rgba(0,0,0,0.04)] hover:text-rose-600 transition-colors duration-[120ms] ease-out"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
