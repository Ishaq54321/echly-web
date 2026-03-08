"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Trash2, Expand } from "lucide-react";
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
  onUpdate: (id: string, payload: { title: string; actionSteps: string[] }) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  highlightTicketId?: string | null;
  onExpandChange?: (id: string | null) => void;
};

function FeedbackItem({
  item: ticket,
  onUpdate,
  onDelete,
  highlightTicketId = null,
  onExpandChange,
}: FeedbackItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [editedSteps, setEditedSteps] = useState<string[]>(ticket.actionSteps ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priority = priorityFromType(ticket.type);

  useEffect(() => {
    setEditedTitle(ticket.title);
    setEditedSteps(ticket.actionSteps ?? []);
  }, [ticket]);

  useEffect(() => {
    if (highlightTicketId === ticket.id) {
      setHighlighted(true);
      setTimeout(() => {
        setHighlighted(false);
      }, 1200);
    }
  }, [highlightTicketId, ticket.id]);

  const handleExpand = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      onExpandChange?.(next ? ticket.id : null);
      return next;
    });
  }, [ticket.id, onExpandChange]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onUpdate(ticket.id, {
        title: editedTitle.trim() || editedTitle,
        actionSteps: editedSteps,
      });
      setExpanded(false);
      onExpandChange?.(null);
    } catch (err) {
      console.error("Save failed", err);
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [ticket.id, editedTitle, editedSteps, onUpdate, onExpandChange]);

  const handleCancel = useCallback(() => {
    setExpanded(false);
    onExpandChange?.(null);
  }, [onExpandChange]);

  const handleDelete = useCallback(async () => {
    try {
      await onDelete(ticket.id);
    } catch (err) {
      console.error("Delete failed", err);
    }
  }, [ticket.id, onDelete]);

  return (
    <div
      className={`echly-feedback-item ${highlighted ? "echly-ticket-highlight" : ""}`}
      data-priority={priority}
    >
      <div className="echly-ticket-row">
        <div className="echly-ticket-dot echly-priority-dot" aria-hidden />
        <div className="echly-ticket-content">
          {!expanded ? (
            <div className="echly-ticket-header">
              <input
                className="echly-edit-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={{ width: "100%" }}
              />
              <div className="echly-header-actions">
                <button
                  type="button"
                  onClick={handleExpand}
                  className="echly-expand-btn echly-widget-action-icon"
                  aria-label="Expand"
                >
                  <Expand size={16} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="echly-delete-btn echly-widget-action-icon echly-widget-action-icon--delete"
                  aria-label="Delete"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : (
            <div className="echly-ticket-expanded">
              <textarea
                className="echly-title-editor"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                className="echly-action-editor"
                value={editedSteps.join("\n\n")}
                onChange={(e) => {
                  setEditedSteps(e.target.value.split(/\n\s*\n/));
                }}
              />
              {error && (
                <div className="echly-ticket-error" role="alert">
                  {error}
                </div>
              )}
              <div className="echly-edit-actions">
                <button
                  type="button"
                  className="echly-primary-button"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="echly-secondary-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FeedbackItem, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.highlightTicketId === next.highlightTicketId
  );
});
