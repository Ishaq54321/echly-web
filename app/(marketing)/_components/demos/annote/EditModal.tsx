"use client";

/**
 * EditModal — forklifted from: lib/capture-engine/core/FeedbackItem.tsx
 *   (the `TicketEditorOverlay` export, source L188-547).
 *
 * This is the real modal that opens when a user clicks a tray ticket to refine
 * it. The chrome is byte-faithful to the source: the `.editor-overlay-backdrop`
 * + `.editor-overlay` card, `.editor-overlay-head` (icon + "EDIT TICKET" label +
 * close), `.editor-title-row`/`.editor-title-input`, `.editor-screenshot`,
 * `.editor-tags`/`.editor-tag`, `.editor-divider`, `.editor-steps`, and the
 * `.editor-overlay-foot`/`.editor-save-btn` footer all match the source
 * className-for-className. All visual rules come from globals.css (the
 * `.editor-*` family under `.echly-v2`, L9453-9928), copied to marketing.css.
 *
 * Modifications (only) — confirmed with Aakash before forklift:
 *
 * 1. The source's description field is the heavy <DescriptionEditor> (TipTap +
 *    ProseMirror + useAiImprove + firebase uploadAttachment — ~480KB and
 *    forbidden imports). It is replaced with a STATIC, read-only paragraph in
 *    the same `.editor-steps` wrapper. (Decision: "Faithful + static desc".)
 * 2. The source has NO severity selector and NO visible metadata block — those
 *    fields in the v5 prompt don't exist in the real component, so they're not
 *    added (a true forklift, not the prompt's literal field list).
 * 3. The screenshot is a type-specific mock SVG (see ./screenshots) chosen by
 *    the ticket's `screenshot.type` — no real screenshotId / firebase URL.
 *    (v6: replaced the v5 shared CSS-gradient placeholder.)
 * 4. All hooks reduced to local `useState` for entry/exit; all handlers
 *    (onClose / save / tag edits) are no-ops — the demo modal is read-only.
 * 5. The full-screen screenshot-expand branch and Escape-key listener are kept
 *    structurally but never trigger (screenshotExpanded stays false).
 *
 * Removed imports from the source: getTicketIconFromTags, parseDeviceInfo,
 * formatLocalDateTime, tryBuildScreenshotUrl, the lazy DescriptionEditor +
 * Suspense, StructuredFeedback type. Entry/exit animation uses framer-motion
 * (already in the project, used by other forklifted demo pieces).
 */

import React from "react";
import { motion } from "framer-motion";
import { Info, PencilLine, X } from "lucide-react";
import { iconForType } from "./icons";
import { MockScreenshot } from "./screenshots";
import type { MockTicket } from "./mockTickets";

interface EditModalProps {
  /**
   * The ticket whose data populates the modal. v6: every tray ticket — and the
   * freshly-captured one — carries its full payload (title / description / tags /
   * screenshot / metadata), so the same modal renders per-ticket content.
   */
  ticket: MockTicket;
  onClose?: () => void;
}

export function EditModal({ ticket, onClose = () => {} }: EditModalProps) {
  const IconComponent = iconForType(ticket.type);
  const screenshotInfoTooltip = [ticket.element, ticket.browser, ticket.url]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="echly-v2">
      {/* Dim backdrop — click to discard (no-op in demo) */}
      <motion.div
        className="editor-overlay-backdrop"
        onClick={onClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Editor card */}
      <motion.div
        className="editor-overlay"
        role="dialog"
        aria-label="Edit ticket"
        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.98, x: "-50%", y: "-50%" }}
        transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      >

        {/* ── Header ── */}
        <div className="editor-overlay-head">
          <div className="editor-overlay-head-left">
            <div className="editor-overlay-icon">
              <IconComponent size={14} strokeWidth={2} />
            </div>
            <span className="editor-overlay-label">Edit ticket</span>
          </div>
          <button className="editor-close-btn" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="editor-overlay-body">

          {/* Title */}
          <div className="editor-title-row">
            <PencilLine className="editor-title-pencil" size={16} strokeWidth={2} />
            <input
              type="text"
              className="editor-title-input"
              value={ticket.title}
              readOnly
              placeholder="Ticket title..."
            />
          </div>

          {/* Screenshot — type-specific mock SVG standing in for a captured frame. */}
          <div className="editor-screenshot" role="img" aria-label="Captured screenshot">
            <div className="editor-screenshot-mock" aria-hidden>
              <MockScreenshot screenshot={ticket.screenshot} />
            </div>
            {screenshotInfoTooltip && (
              <div className="editor-screenshot-info" aria-label={`Element: ${ticket.element}`}>
                <Info size={13} strokeWidth={1.8} />
                <span className="echly-tooltip echly-tooltip--multiline">{screenshotInfoTooltip}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="editor-tags">
            {ticket.tags.map((tag, i) => (
              <span key={i} className="editor-tag">
                {tag}
                <span className="editor-tag-remove" role="button" aria-label={`Remove ${tag}`}>
                  <X size={10} strokeWidth={3} />
                </span>
              </span>
            ))}
            <button type="button" className="editor-tag-add">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add tag
            </button>
          </div>

          <div className="editor-divider" />

          {/* Description — static read-only render replacing the heavy DescriptionEditor. */}
          <div className="editor-steps">
            <div className="editor-steps-label">Description</div>
            <p className="editor-static-desc">{ticket.description}</p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="editor-overlay-foot">
          <button type="button" className="editor-save-btn" onClick={onClose}>
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
