"use client";

/**
 * Forklifted from: lib/capture-engine/core/FeedbackItem.tsx (only the
 * collapsed ticket card — TicketEditorOverlay is intentionally omitted as
 * the demo loop never opens the editor).
 *
 * Visual code is byte-faithful to the source — JSX, className strings,
 * data-priority attribute, data-id attribute, role/tabIndex/onKeyDown
 * accessibility wiring, the ticket-thumb / ticket-main / ticket-title /
 * ticket-meta / ticket-actions layout, and SVG paths are unchanged.
 *
 * Modifications (only):
 * - Removed the lazy import of DescriptionEditor (only used by the omitted
 *   TicketEditorOverlay).
 * - Removed the lazy/Suspense block (same reason).
 * - Removed the `parseDeviceInfo`, `formatLocalDateTime`, `tryBuildScreenshotUrl`
 *   helpers (only used by the omitted editor overlay).
 * - Removed the `getTicketIconFromTags` import (pulls in heavy constants); the
 *   demo passes the icon as a prop so the orchestrator can choose without
 *   loading the full taxonomy.
 * - `onEditRequest` and `onDelete` are stubbed via optional/no-op props.
 * - `priorityFromType` is preserved verbatim — same string regexes.
 * - `highlighted` state's 1200ms timeout is preserved verbatim.
 *
 * Every visible element (.ticket wrapper with success-flash modifier,
 * .ticket-thumb with --highlighted modifier, .ticket-main, .ticket-title,
 * .ticket-meta, .ticket-actions with edit + delete buttons + icons) is
 * unchanged from the source.
 */

import React, { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

/** Same shape as the production StructuredFeedback (subset used by the row). */
export interface DemoTicket {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  type?: string;
  /** Original capture type (copy/ui/broken-link/content/bug) — drives the
   *  per-type thumb icon color via `data-type` (see marketing.css). */
  iconType?: string;
}

function priorityFromType(type: string | undefined): "critical" | "high" | "medium" | "low" {
  const t = (type ?? "").toLowerCase();
  if (/critical|blocking/.test(t)) return "critical";
  if (/high|urgent|bug/.test(t)) return "high";
  if (/low/.test(t)) return "low";
  return "medium";
}

// ─── Collapsed ticket card ────────────────────────────────────────────────────

type FeedbackItemProps = {
  item: DemoTicket;
  /** Icon supplied by the orchestrator (replaces getTicketIconFromTags). */
  IconComponent: LucideIcon;
  onEditRequest?: (id: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
  highlightTicketId?: string | null;
};

function FeedbackItem({
  item: ticket,
  IconComponent,
  onEditRequest = () => {},
  onDelete = () => {},
  highlightTicketId = null,
}: FeedbackItemProps) {
  const [highlighted, setHighlighted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priority = priorityFromType(ticket.type);

  useEffect(() => {
    if (highlightTicketId === ticket.id) {
      setHighlighted(true);
      setTimeout(() => setHighlighted(false), 1200);
    }
  }, [highlightTicketId, ticket.id]);

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

  const handleRowClick = useCallback(() => {
    if (isDeleting) return;
    onEditRequest(ticket.id);
  }, [ticket.id, onEditRequest, isDeleting]);

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRowClick();
      }
    },
    [handleRowClick],
  );

  const tagCount = ticket.tags?.length ?? 0;
  const tagLabel = tagCount === 1 ? "tag" : "tags";

  return (
    <div
      className={`ticket${highlighted ? " success-flash" : ""}`}
      data-priority={priority}
      data-id={ticket.id}
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      style={{ cursor: "pointer" }}
    >
      <span
        className={`ticket-thumb${highlighted ? " ticket-thumb--highlighted" : ""}`}
        data-type={ticket.iconType}
        aria-hidden
      >
        <IconComponent size={14} strokeWidth={2} />
      </span>

      <div className="ticket-main">
        <div className="ticket-title">{ticket.title}</div>
        <div className="ticket-meta">
          <span>
            <b>{tagCount}</b> {tagLabel}
          </span>
        </div>
      </div>

      <div className="ticket-actions">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditRequest(ticket.id);
          }}
          className="ticket-action-btn"
          aria-label="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleDelete();
          }}
          disabled={isDeleting}
          className="ticket-action-btn ticket-action-btn--danger"
          aria-label={isDeleting ? "Deleting…" : "Delete"}
        >
          {isDeleting ? (
            <span className="echly-spinner" aria-hidden />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          )}
        </button>
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
