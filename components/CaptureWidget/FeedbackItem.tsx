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
      className={`echly-feedback-item py-4 px-5 transition-colors duration-120 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.995] active:duration-[80ms] active:ease-in ${isHighlighted ? "echly-ticket-highlight" : ""}`}
    >
      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                value={editedTitle}
                onChange={(e) => onEditedTitleChange(e.target.value)}
                className="echly-widget-input focus-ring-brand w-full mb-2 px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 rounded-md text-[15px] font-medium outline-none focus:ring-1 focus:ring-brand-accent transition-all duration-150 border border-transparent focus:border-slate-300 dark:focus:border-slate-600"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => onEditedDescriptionChange(e.target.value)}
                rows={3}
                className="echly-widget-input focus-ring-brand w-full px-3 py-2 bg-transparent text-slate-700 dark:text-slate-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-brand-accent transition-all duration-150 resize-none border border-transparent focus:border-slate-300 dark:focus:border-slate-600"
              />
            </>
          ) : (
            <>
              <h3 className="echly-widget-item-title text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              {isExpanded && (
                <p className="echly-widget-item-desc text-slate-600 dark:text-slate-400 mt-1.5">
                  {item.description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="echly-feedback-item-actions flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleExpand}
            className="echly-widget-action-icon flex items-center justify-center w-8 h-8 rounded-md text-slate-500 cursor-pointer transition-opacity duration-150"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <Expand size={18} strokeWidth={1.5} />
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="echly-widget-action-icon flex items-center justify-center w-8 h-8 rounded-md text-slate-500 cursor-pointer transition-opacity duration-150"
              aria-label="Save"
            >
              <Check size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="echly-widget-action-icon flex items-center justify-center w-8 h-8 rounded-md text-slate-500 cursor-pointer transition-opacity duration-150"
              aria-label="Edit"
            >
              <Pencil size={18} strokeWidth={1.5} />
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="echly-widget-action-icon flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:!opacity-100 hover:!text-red-500 cursor-pointer transition-opacity duration-150"
            aria-label="Delete"
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
