"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Info, X, PencilLine } from "lucide-react";
import type { StructuredFeedback } from "./types";
import { getTicketIconFromTags } from "@/lib/utils/getTicketIconFromTags";
import { parseDeviceInfo, formatLocalDateTime } from "@/lib/utils/captureInfo";

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
  const IconComponent = getTicketIconFromTags(ticket.tags ?? null, ticket.title);

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

  const tagCount = ticket.tags?.length ?? 0;
  const tagLabel = tagCount === 1 ? "tag" : "tags";

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
            <b>{tagCount}</b> {tagLabel}
          </span>
        </div>
      </div>

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
  onUpdate: (id: string, payload: { title: string; description?: string; tags?: string[] }) => Promise<void>;
  onClose: () => void;
  onPauseForEditor?: () => void | Promise<void>;
};

export function TicketEditorOverlay({
  ticket,
  sessionId,
  onUpdate,
  onClose,
  onPauseForEditor,
}: TicketEditorOverlayProps) {
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [editedDescription, setEditedDescription] = useState<string>(ticket.description ?? "");
  const [editedTags, setEditedTags] = useState<string[]>(ticket.tags ?? []);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [screenshotExpanded, setScreenshotExpanded] = useState(false);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const IconComponent = getTicketIconFromTags(ticket.tags ?? null, ticket.title);
  const screenshotUrl =
    ticket.screenshotId ? tryBuildScreenshotUrl(sessionId, ticket.screenshotId) : null;

  const trimmedPageArea = ticket.pageArea?.trim() || "";
  const deviceLine = parseDeviceInfo(
    ticket.userAgent,
    ticket.viewportWidth,
    ticket.viewportHeight,
    ticket.devicePixelRatio
  );
  const dateLine = ticket.createdAt ? formatLocalDateTime(ticket.createdAt) : null;
  const screenshotInfoTooltip = [trimmedPageArea, deviceLine, dateLine].filter(Boolean).join("\n");

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

  useEffect(() => {
    resizeTextarea(descriptionRef.current);
  }, [editedDescription, resizeTextarea]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onUpdate(ticket.id, {
        title: editedTitle.trim() || ticket.title,
        description: editedDescription.trim(),
        tags: editedTags,
      });
      onClose();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [ticket.id, ticket.title, editedTitle, editedDescription, editedTags, onUpdate, onClose]);

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
          <div className="editor-title-row">
            <PencilLine className="editor-title-pencil" size={16} strokeWidth={2} />
            <input
              type="text"
              className="editor-title-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Ticket title..."
            />
          </div>

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
              {screenshotInfoTooltip && (
                <div
                  className="editor-screenshot-info"
                  tabIndex={0}
                  aria-label={trimmedPageArea ? `Page area: ${trimmedPageArea}` : "Screenshot info"}
                >
                  <Info size={13} strokeWidth={1.8} />
                  <span className="echly-tooltip echly-tooltip--multiline">{screenshotInfoTooltip}</span>
                </div>
              )}
              <div className="editor-screenshot-actions">
                <button
                  type="button"
                  className="editor-screenshot-btn"
                  title="Edit in dashboard"
                  onClick={async () => {
                    await onPauseForEditor?.();
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
                  <X size={10} strokeWidth={3} />
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

          {/* Description */}
          <div className="editor-steps">
            <div className="editor-steps-label">Description</div>
            <textarea
              ref={descriptionRef}
              className="step-text"
              value={editedDescription}
              rows={3}
              placeholder="Description…"
              onChange={(e) => {
                setEditedDescription(e.target.value);
                resizeTextarea(e.target);
              }}
            />
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
