"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { StructuredFeedback } from "./types";
import { getTicketIcon } from "@/lib/utils/getTicketIcon";

function priorityFromType(type: string | undefined): "critical" | "high" | "medium" | "low" {
  const t = (type ?? "").toLowerCase();
  if (/critical|blocking/.test(t)) return "critical";
  if (/high|urgent|bug/.test(t)) return "high";
  if (/low/.test(t)) return "low";
  return "medium";
}

function tryBuildScreenshotUrl(sessionId: string, screenshotId: string): string | null {
  try {
    // process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is inlined by Next.js but
    // NOT by the extension's esbuild — guard defensively so it returns null there.
    const bucket =
      (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET : undefined)
      || "echly-b74cc.firebasestorage.app";
    if (!bucket) return null;
    const filePath = `sessions/${sessionId}/screenshots/${screenshotId}.png`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;
  } catch {
    return null;
  }
}

// ─── Collapsed ticket card ────────────────────────────────────────────────────

type FeedbackItemProps = {
  item: StructuredFeedback;
  onEditRequest: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
  highlightTicketId?: string | null;
};

function FeedbackItem({
  item: ticket,
  onEditRequest,
  onDelete,
  highlightTicketId = null,
}: FeedbackItemProps) {
  const [highlighted, setHighlighted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priority = priorityFromType(ticket.type);
  const IconComponent = getTicketIcon(ticket.title);

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

  const stepCount = ticket.actionSteps?.length ?? 0;
  const stepLabel = stepCount === 1 ? "action step" : "action steps";

  return (
    <div
      className={`ticket${highlighted ? " success-flash" : ""}`}
      data-priority={priority}
      data-id={ticket.id}
    >
      <span className={`ticket-thumb${highlighted ? " ticket-thumb--highlighted" : ""}`} aria-hidden>
        <IconComponent size={14} strokeWidth={2} />
      </span>

      <div className="ticket-main">
        <div className="ticket-title">{ticket.title}</div>
        <div className="ticket-meta">
          <span>
            <b>{stepCount}</b> {stepLabel}
          </span>
        </div>
      </div>

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
        <div className="ticket-actions">
          <button
            type="button"
            onClick={() => onEditRequest(ticket.id)}
            className="ticket-action-btn"
            aria-label="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDelete}
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

// ─── Ticket editor overlay ────────────────────────────────────────────────────

export type TicketEditorOverlayProps = {
  ticket: StructuredFeedback;
  sessionId: string;
  onUpdate: (id: string, payload: { title: string; actionSteps: string[]; suggestedTags?: string[] }) => Promise<void>;
  onClose: () => void;
};

export function TicketEditorOverlay({
  ticket,
  sessionId,
  onUpdate,
  onClose,
}: TicketEditorOverlayProps) {
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [editedSteps, setEditedSteps] = useState<string[]>(ticket.actionSteps ?? []);
  const [editedTags, setEditedTags] = useState<string[]>(ticket.suggestedTags ?? []);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [screenshotExpanded, setScreenshotExpanded] = useState(false);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const stepsListRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);
  const focusStepIndexRef = useRef<number | null>(null);

  const IconComponent = getTicketIcon(ticket.title);
  const screenshotUrl =
    ticket.screenshotId ? tryBuildScreenshotUrl(sessionId, ticket.screenshotId) : null;

  useEffect(() => {
    setScreenshotLoaded(false);
  }, [screenshotUrl]);

  // Escape closes overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (screenshotExpanded) {
          setScreenshotExpanded(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, screenshotExpanded]);

  // Auto-resize a textarea to fit its content
  const resizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Focus + resize step textareas after append (skip focus on initial mount)
  useEffect(() => {
    const list = stepsListRef.current;
    if (!list) return;
    const textareas = list.querySelectorAll<HTMLTextAreaElement>("textarea");
    textareas.forEach((ta) => resizeTextarea(ta));
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const targetIndex = focusStepIndexRef.current;
    if (targetIndex !== null && textareas[targetIndex]) {
      textareas[targetIndex].focus();
      focusStepIndexRef.current = null;
    } else if (textareas.length > 0) {
      textareas[textareas.length - 1].focus();
    }
  }, [editedSteps.length, resizeTextarea]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onUpdate(ticket.id, {
        title: editedTitle.trim() || ticket.title,
        actionSteps: editedSteps.filter((s) => s.trim()),
        suggestedTags: editedTags,
      });
      onClose();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [ticket.id, ticket.title, editedTitle, editedSteps, onUpdate, onClose]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTagText.trim()) {
      setEditedTags((prev) => [...prev, newTagText.trim()]);
      setNewTagText("");
      setAddingTag(false);
    } else if (e.key === "Escape") {
      setNewTagText("");
      setAddingTag(false);
    }
  };

  const handleTagBlur = () => {
    if (newTagText.trim()) {
      setEditedTags((prev) => [...prev, newTagText.trim()]);
    }
    setNewTagText("");
    setAddingTag(false);
  };

  return (
    <div className="echly-v2">
      {/* Dim backdrop — click to discard */}
      <div
        className="editor-overlay-backdrop"
        onClick={onClose}
        aria-hidden
      />

      {/* Editor card */}
      <div className="editor-overlay" role="dialog" aria-label="Edit ticket">

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
          <input
            type="text"
            className="editor-title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Ticket title..."
          />

          {/* Screenshot (only when URL can be built) */}
          {screenshotUrl && (
            <div className="editor-screenshot">
              <img
                src={screenshotUrl}
                alt=""
                loading="lazy"
                className={screenshotLoaded ? "loaded" : ""}
                onLoad={() => setScreenshotLoaded(true)}
              />
              <div className="editor-screenshot-actions">
                <button
                  type="button"
                  className="editor-screenshot-btn"
                  title="Edit in dashboard"
                  onClick={() => {
                    const base = (typeof process !== "undefined" ? process.env.ECHLY_WEB_APP_URL : "") || "http://localhost:3000";
                    window.open(`${base}/session/${sessionId}?ticket=${ticket.id}&edit=true`, "_blank");
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
                <button
                  type="button"
                  className="editor-screenshot-btn"
                  title="Expand screenshot"
                  onClick={() => setScreenshotExpanded(true)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="editor-tags">
            {editedTags.map((tag, i) => (
              <span key={i} className="editor-tag">
                {tag}
                <span
                  className="editor-tag-remove"
                  role="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() =>
                    setEditedTags((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  ×
                </span>
              </span>
            ))}
            {addingTag ? (
              <input
                autoFocus
                className="editor-tag-input"
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={handleTagBlur}
                placeholder="Tag name…"
              />
            ) : (
              <button
                type="button"
                className="editor-tag-add"
                onClick={() => setAddingTag(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add tag
              </button>
            )}
          </div>

          <div className="editor-divider" />

          {/* Action steps */}
          <div className="editor-steps">
            <div className="editor-steps-label">Action steps</div>
            <div className="editor-steps-list" ref={stepsListRef}>
              {editedSteps.map((step, i) => (
                <div key={i} className="step-row">
                  <span className="step-number">{i + 1}.</span>
                  <textarea
                    className="step-text"
                    value={step}
                    rows={1}
                    placeholder="Add an action step…"
                    ref={(el) => resizeTextarea(el)}
                    onChange={(e) => {
                      setEditedSteps((prev) =>
                        prev.map((s, j) => (j === i ? e.target.value : s))
                      );
                      resizeTextarea(e.target);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        focusStepIndexRef.current = i + 1;
                        setEditedSteps((prev) => {
                          const next = [...prev];
                          next.splice(i + 1, 0, "");
                          return next;
                        });
                      } else if (e.key === "Backspace" && editedSteps[i] === "" && editedSteps.length > 1) {
                        e.preventDefault();
                        focusStepIndexRef.current = Math.max(0, i - 1);
                        setEditedSteps((prev) => prev.filter((_, j) => j !== i));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="step-delete"
                    title="Remove step"
                    onClick={() =>
                      setEditedSteps((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="step-add"
              onClick={() => setEditedSteps((prev) => [...prev, ""])}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add action step
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="editor-overlay-foot">
          <button
            type="button"
            className="editor-save-btn"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>



      {/* Simple full-screen screenshot expand */}
      {screenshotExpanded && screenshotUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483648,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setScreenshotExpanded(false)}
        >
          <img
            src={screenshotUrl}
            alt="Screenshot (expanded)"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 12,
              objectFit: "contain",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setScreenshotExpanded(false); }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
