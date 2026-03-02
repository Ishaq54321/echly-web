"use client";

import React, { useCallback } from "react";
import { Pencil, Trash2, Expand, Check } from "lucide-react";
import type { StructuredFeedback } from "./types";

type FeedbackItemProps = {
  item: StructuredFeedback;
  expandedId: string | null;
  editingId: string | null;
  editedTitle: string;
  editedDescription: string;
  onExpand: (id: string | null) => void;
  onStartEdit: (item: StructuredFeedback) => void;
  onSaveEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onEditedTitleChange: (value: string) => void;
  onEditedDescriptionChange: (value: string) => void;
  highlightTicketId?: string | null;
};

function FeedbackItem({
  item,
  expandedId,
  editingId,
  editedTitle,
  editedDescription,
  onExpand,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onEditedTitleChange,
  onEditedDescriptionChange,
  highlightTicketId = null,
}: FeedbackItemProps) {
  const isExpanded = expandedId === item.id;
  const isEditing = editingId === item.id;
  const isHighlighted = highlightTicketId === item.id;

  const handleExpand = useCallback(() => {
    onExpand(isExpanded ? null : item.id);
  }, [isExpanded, item.id, onExpand]);

  const handleEdit = useCallback(() => {
    onStartEdit(item);
  }, [item, onStartEdit]);

  const handleSave = useCallback(() => {
    onSaveEdit(item.id);
  }, [item.id, onSaveEdit]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  return (
    <div
      className={`bg-white px-6 py-4 border-b border-[rgba(0,0,0,0.05)]
                 transition-colors duration-120 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                 hover:bg-neutral-100
                 active:scale-[0.99] active:duration-[80ms] active:ease-in
                 last:border-b-0
                 ${isHighlighted ? "echly-ticket-highlight" : ""}`}
    >
      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                value={editedTitle}
                onChange={(e) => onEditedTitleChange(e.target.value)}
                className="focus-ring-brand w-full mb-2 px-3 py-2
                                     bg-white text-slate-900
                                     border border-slate-300
                                     rounded-sm text-sm font-medium
                                     outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all duration-150"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => onEditedDescriptionChange(e.target.value)}
                rows={3}
                className="focus-ring-brand w-full px-3 py-2
                                     bg-white text-slate-800
                                     border border-slate-300
                                     rounded-sm text-sm
                                     outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all duration-150 resize-none"
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
            onClick={handleExpand}
            className="flex items-center justify-center w-6 h-6 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-brand-accent transition-colors duration-120 cursor-pointer"
          >
            <Expand size={18} strokeWidth={1.5} />
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center justify-center w-6 h-6 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-brand-accent transition-colors duration-120 cursor-pointer"
            >
              <Check size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center justify-center w-6 h-6 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-brand-accent transition-colors duration-120 cursor-pointer"
            >
              <Pencil size={18} strokeWidth={1.5} />
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center w-6 h-6 rounded-md text-neutral-500 hover:bg-semantic-danger/10 hover:text-semantic-danger transition-colors duration-120 cursor-pointer"
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FeedbackItem, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.expandedId === next.expandedId &&
    prev.editingId === next.editingId &&
    prev.editedTitle === next.editedTitle &&
    prev.editedDescription === next.editedDescription
  );
});
