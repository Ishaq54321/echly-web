"use client";

import React, { useCallback, useState } from "react";
import { Pencil, Trash2, Expand, Check } from "lucide-react";
import type { StructuredFeedback } from "./types";

function priorityFromType(type: string | undefined): "critical" | "high" | "medium" | "low" {
  const t = (type ?? "").toLowerCase();
  if (/critical|blocking/.test(t)) return "critical";
  if (/high|urgent|bug/.test(t)) return "high";
  if (/low/.test(t)) return "low";
  return "medium";
}

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
  const priority = priorityFromType(item.type);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleExpand = useCallback(() => {
    onExpand(isExpanded ? null : item.id);
  }, [isExpanded, item.id, onExpand]);

  const handleEdit = useCallback(() => {
    onStartEdit(item);
  }, [item, onStartEdit]);

  const handleSave = useCallback(() => {
    onSaveEdit(item.id);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 220);
  }, [item.id, onSaveEdit]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  return (
    <div
      className={`echly-feedback-item ${isHighlighted ? "echly-ticket-highlight" : ""}`}
      data-priority={priority}
    >
      <span className="echly-priority-dot" aria-hidden />
      <div className="echly-feedback-item-inner">
        <div className="echly-feedback-item-content">
          {isEditing ? (
            <>
              <input
                value={editedTitle}
                onChange={(e) => onEditedTitleChange(e.target.value)}
                className="echly-widget-input echly-feedback-item-input"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => onEditedDescriptionChange(e.target.value)}
                rows={3}
                className="echly-widget-input echly-feedback-item-textarea"
              />
            </>
          ) : (
            <>
              <h3 className="echly-widget-item-title">{item.title}</h3>
            </>
          )}
        </div>
        <div className="echly-feedback-item-actions">
          <button
            type="button"
            onClick={handleExpand}
            className="echly-widget-action-icon"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <Expand size={16} strokeWidth={1.5} />
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className={`echly-widget-action-icon echly-widget-action-icon--confirm ${showSaveSuccess ? "echly-widget-action-icon--confirm-success" : ""}`}
              aria-label="Save"
            >
              <Check size={16} strokeWidth={1.5} />
            </button>
          ) : (
            <button type="button" onClick={handleEdit} className="echly-widget-action-icon" aria-label="Edit">
              <Pencil size={16} strokeWidth={1.5} />
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="echly-widget-action-icon echly-widget-action-icon--delete"
            aria-label="Delete"
          >
            <Trash2 size={16} strokeWidth={1.5} />
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
    prev.editedDescription === next.editedDescription &&
    prev.highlightTicketId === next.highlightTicketId
  );
});
