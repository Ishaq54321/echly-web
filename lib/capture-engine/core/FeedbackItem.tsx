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
  const [isDeleting, setIsDeleting] = useState(false);
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
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(ticket.id);
    } catch (err) {
      console.error("Delete failed", err);
      setIsDeleting(false);
    }
  }, [ticket.id, onDelete, isDeleting]);

  const stepCount = ticket.actionSteps?.length ?? 0;
  const stepLabel = stepCount === 1 ? "action step" : "action steps";

  if (expanded) {
    return (
      <div
        className="ticket ticket--expanded"
        data-priority={priority}
        data-id={ticket.id}
      >
        <div className="ticket-expanded-body">
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
      </div>
    );
  }

  return (
    <div
      className={`ticket${highlighted ? " success-flash" : ""}`}
      data-priority={priority}
      data-id={ticket.id}
    >
      {/* Thumbnail placeholder */}
      <span className="ticket-thumb" aria-hidden />

      {/* Title + meta */}
      <div className="ticket-main">
        <div className="ticket-title">{ticket.title}</div>
        <div className="ticket-meta">
          <span>
            <b>{stepCount}</b> {stepLabel}
          </span>
        </div>
      </div>

      {/* Right column: success check or action icons */}
      {highlighted ? (
        <span className="ticket-check" aria-hidden>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8L6.5 11L12.5 5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <div className="ticket-icon-row">
          <button
            type="button"
            onClick={handleExpand}
            className="pill-icon-btn"
            aria-label="Edit"
          >
            <Expand size={13} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="pill-icon-btn"
            aria-label={isDeleting ? "Deleting…" : "Delete"}
          >
            {isDeleting ? (
              <span className="echly-spinner" aria-hidden />
            ) : (
              <Trash2 size={13} strokeWidth={1.5} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(FeedbackItem, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.highlightTicketId === next.highlightTicketId
  );
});
