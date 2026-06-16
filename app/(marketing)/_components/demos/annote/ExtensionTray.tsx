"use client";

/**
 * ExtensionTray — rebuilt (v5) to reproduce the REAL extension-mode tray.
 *
 * There is no standalone React component for the tray; it is composed inside
 * lib/capture-engine/core/CaptureWidget.tsx (the `extensionMode` branch,
 * L1107-1399). v4 incorrectly reproduced the *legacy* `.echly-sidebar-*`
 * hierarchy, which looks nothing like the live extension (washed-out, plain).
 * This rebuild matches CaptureWidget's `.pill.pill-tickets` hierarchy exactly
 * (the one Aakash's screenshot 3 shows):
 *
 *   .pill.pill-tickets
 *     ↳ .tl-head
 *         ↳ .pill-mark.pill-mark-logo        (purple-ish gradient avatar = Annote mark)
 *         ↳ .tl-title-block
 *             ↳ .tl-eyebrow  → .live-dot + "ACTIVE SESSION" | "PAUSED"
 *             ↳ .tl-title-hover-row → .tl-title  (truncated session title)
 *         ↳ .tl-icon-group → .pill-icon-btn × 3 (link / mic / X)
 *     ↳ .pill-rule
 *     ↳ .tl-list
 *         ↳ <FeedbackItem> .ticket rows  (forklifted separately)
 *     ↳ .tl-foot  → "AI · auto-structured" + "Exit session"
 *
 * Every className on every element is sourced from app/globals.css (the `tl-*`
 * and `.pill*` families under `.echly-v2`, L6553-8889). The visual treatment is
 * 100% supplied by the CSS now copied into marketing.css under .marketing-root.
 *
 * Marketing adaptations (only):
 * - Title is static text (the real header supports click-to-edit; the demo
 *   doesn't need it).
 * - The link / mic / X buttons render but their onClick handlers are no-ops.
 * - Tickets come from props (the MockTicket list) instead of session state.
 * - The body always renders the ticket list (no loading/processing/empty
 *   branches — the demo session is always populated).
 *
 * No CSS in this file — every visual rule lives in marketing.css.
 */

import React from "react";
import { Link as LinkIcon, Mic, X } from "lucide-react";
import FeedbackItem, { type DemoTicket } from "./FeedbackItem";
import { iconForType } from "./icons";
import type { MockTicket } from "./mockTickets";

export interface ExtensionTrayProps {
  /** Full session title — truncated via CSS ellipsis on .tl-title. */
  sessionTitle: string;
  /** When true, the eyebrow reads "Paused"; otherwise "Active session". */
  paused?: boolean;
  /** Tickets to render (newest first). */
  tickets: MockTicket[];
  /** ID of the freshly-captured ticket — drives the .success-flash glow. */
  highlightTicketId?: string | null;
  /** v6: a tray row was clicked — opens that ticket's EditModal. */
  onTicketClick?: (ticket: MockTicket) => void;
}

/** Map a MockTicket to the DemoTicket shape the forklifted .ticket row reads. */
function toDemoTicket(t: MockTicket): DemoTicket {
  return {
    id: t.id,
    title: t.title,
    // The row renders "<n> tags"; it counts tags.length, so synthesize an
    // array of the right length. Contents are unused by the collapsed row.
    tags: Array.from({ length: t.tagCount }, (_, i) => `tag-${i}`),
    type: t.type === "bug" ? "high" : "medium",
    // Original capture type → per-type thumb icon color (see marketing.css).
    iconType: t.type,
  };
}

export function ExtensionTray({
  sessionTitle,
  paused = false,
  tickets,
  highlightTicketId = null,
  onTicketClick,
}: ExtensionTrayProps) {
  return (
    <div className="echly-v2" data-annote-ui="true">
      <div className="pill pill-tickets">

        {/* ── Session header (logo removed per feedback; title block leads) ── */}
        <div className="tl-head">
          <div className="tl-title-block">
            <div className="tl-eyebrow">
              <span className="live-dot" aria-hidden />
              {paused ? "Paused" : "Active session"}
            </div>
            <div className="tl-title-hover-row">
              <div className="tl-title">{sessionTitle}</div>
            </div>
          </div>

          <div className="tl-icon-group">
            <button type="button" className="pill-icon-btn tl-share-btn" aria-label="Copy session link">
              <LinkIcon size={13} strokeWidth={2.25} />
            </button>
            <button type="button" className="pill-icon-btn" aria-label="Toggle mode">
              <Mic size={13} strokeWidth={2.25} />
            </button>
            <button type="button" className="pill-icon-btn" aria-label="Minimize">
              <X size={13} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="pill-rule" />

        {/* ── Scrollable ticket list ── */}
        <div className="tl-list">
          {tickets.map((t) => (
            <FeedbackItem
              key={t.id}
              item={toDemoTicket(t)}
              IconComponent={iconForType(t.type)}
              highlightTicketId={highlightTicketId}
              onEditRequest={onTicketClick ? () => onTicketClick(t) : undefined}
            />
          ))}
        </div>

        {/* ── Pinned footer ── */}
        <div className="tl-foot">
          <span className="tl-foot-left">
            <span className="ai-dot" aria-hidden />
            AI · auto-structured
          </span>
          <button type="button" className="tl-foot-home">Exit session</button>
        </div>

      </div>
    </div>
  );
}
