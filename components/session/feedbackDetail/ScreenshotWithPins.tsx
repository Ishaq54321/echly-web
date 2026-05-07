"use client";

import React, { useState, useCallback, useRef, memo, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Expand, Info, Loader2, Pencil, Smile, Paperclip, X, AtSign } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import type { Editor } from "@tiptap/react";
import type { Timestamp } from "firebase/firestore";
import { useWorkspace } from "@/lib/client/workspaceContext";
import type { Comment } from "@/lib/domain/comment";
import type { CommentPosition, CommentAttachment } from "@/lib/domain/comment";
import { Tooltip } from "@/components/ui/Tooltip";
import { TiptapCommentEditor, extractFromDoc, type TiptapEditorParticipant } from "@/components/comments/TiptapCommentEditor";

function getUploadBoxColor(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "var(--brand)";
  if (["pdf"].includes(ext)) return "var(--color-danger)";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt"].includes(ext)) return "var(--color-warning)";
  return "var(--text-secondary)";
}

const PIN_SIZE_PX = 24;
const POPOVER_GAP_PX = 8;
const TOOLTIP_MAX_LEN = 60;
const POPOVER_Z_INDEX = 10050;
const POPOVER_STYLE =
  "rounded-xl bg-white border border-[var(--border)] shadow-[var(--shadow-lg)] min-w-[300px] max-w-[380px] w-[min(380px,90vw)] p-6 animate-in fade-in zoom-in-95 duration-[120ms] ease-out";

interface ScreenshotWithPinsProps {
  screenshotId: string | null | undefined;
  /** Resolved download URL from parent `useScreenshotUrl` (single resolution per ticket). */
  screenshotUrl: string | null;
  screenshotUrlLoading: boolean;
  screenshotUrlError: string | null;
  onExpand: () => void;
  isCommentMode?: boolean;
  pins?: Comment[];
  comments?: Comment[];
  /** Which pin's inline popover is open (root-only view). */
  activePinId?: string | null;
  /** Which thread is selected in the right panel (highlights this pin on canvas). */
  activeThreadId?: string | null;
  onPinClick?: (commentId: string) => void;
  onOpenThreadPanel?: (commentId: string) => void;
  onCloseInlinePopover?: () => void;
  onAddPinComment?: (position: CommentPosition, message: string, mentionedUserIds?: string[], attachments?: CommentAttachment[]) => Promise<string | null>;
  /** Resolve this comment (root); updates pin + panel immediately via single source of truth. */
  updateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  onCommentPlaced?: (newCommentId?: string) => void;
  onPinPositionChange?: (commentId: string, position: CommentPosition) => Promise<void>;
  /** Omit outer card chrome when nested inside a parent attachment card. */
  embeddedInCard?: boolean;
  onEdit?: () => void;
  canEdit?: boolean;
  /** Pin id that should pulse its ring animation (set by comment-click navigation). */
  animatingPinId?: string | null;
  participants?: TiptapEditorParticipant[];
  /** AI-detected page/section, e.g. "Pricing Page → Hero Section". Hidden when null/empty. */
  pageArea?: string | null;
  userAgent?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  devicePixelRatio?: number | null;
  createdAt?: string | number | Timestamp | null;
}

function parseDeviceInfo(
  ua: string | null | undefined,
  vw: number | null | undefined,
  vh: number | null | undefined,
  dpr: number | null | undefined
): string | null {
  if (!ua) return null;

  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (ua.includes("Edg")) {
    const match = ua.match(/Edg\/(\d+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  } else if (ua.includes("Firefox")) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/(\d+[\.\d]*)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  }

  if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (ua.includes("Windows NT 10")) {
    os = ua.includes("Windows NT 10.0") ? "Windows 10/11" : "Windows";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    const match = ua.match(/OS (\d+[._]\d+)/);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
  } else if (ua.includes("Android")) {
    const match = ua.match(/Android (\d+[\.\d]*)/);
    os = match ? `Android ${match[1]}` : "Android";
  }

  const viewport = vw && vh ? `${vw}×${vh}` : null;
  const ratio = dpr ? `@${dpr}x` : null;

  const parts = [browser, os, [viewport, ratio].filter(Boolean).join(" ")].filter(Boolean);
  return parts.join(" · ");
}

function formatLocalDateTime(createdAt: string | number | Timestamp | null | undefined): string | null {
  if (!createdAt) return null;
  try {
    let date: Date;
    if (typeof createdAt === "number") {
      date = new Date(createdAt);
    } else if (typeof createdAt === "string") {
      date = new Date(createdAt);
    } else if (typeof (createdAt as Timestamp).toDate === "function") {
      date = (createdAt as Timestamp).toDate();
    } else {
      return null;
    }
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return null;
  }
}

const PinMarker = memo(function PinMarker({
  commentId,
  position,
  number,
  message,
  isActive,
  isResolved,
  onClick,
  onPositionChange,
  containerRef,
  animatingPinId,
}: {
  commentId: string;
  position: CommentPosition;
  number: number;
  message: string;
  isActive: boolean;
  isResolved?: boolean;
  onClick: () => void;
  onPositionChange: (commentId: string, position: CommentPosition) => Promise<void>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  animatingPinId?: string | null;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dragPosition, setDragPosition] = useState<CommentPosition | null>(null);
  const hasMovedRef = useRef(false);
  const lastDragRef = useRef<CommentPosition>(position);

  const displayPos = dragPosition ?? position;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
      if (!containerRef.current || !onPositionChange) return;

      const container = containerRef.current;

      const handleMouseMove = (ev: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
        hasMovedRef.current = true;
        const next = { xPercent, yPercent };
        lastDragRef.current = next;
        setDragPosition(next);
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        if (hasMovedRef.current) {
          onPositionChange(commentId, lastDragRef.current).catch(() => {});
        }
        setDragPosition(null);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [commentId, onPositionChange, containerRef]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasMovedRef.current) return;
      onClick();
    },
    [onClick]
  );

  const preview = message.length > TOOLTIP_MAX_LEN ? message.slice(0, TOOLTIP_MAX_LEN) + "…" : message;

  return (
    <div
      data-pin-marker
      className={`absolute flex items-center justify-center transition-all duration-150 cursor-grab active:cursor-grabbing border-0 ${animatingPinId === commentId ? "animate-pin-pop" : ""} ${isActive ? "scale-110" : "hover:scale-105"}`}
      style={{
        width: PIN_SIZE_PX,
        height: PIN_SIZE_PX,
        left: `${displayPos.xPercent}%`,
        top: `${displayPos.yPercent}%`,
        transform: "translate(-50%, -50%)",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      aria-label={`Comment ${number}${isResolved ? " (resolved)" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isResolved ? "var(--color-success)" : "var(--text-heading)"}
        stroke="white"
        strokeWidth="1.5"
        className="w-full h-full"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {showTooltip && preview && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-1.5 rounded bg-[var(--text-heading)] text-white text-[12px] leading-snug whitespace-nowrap overflow-hidden max-w-[200px] truncate pointer-events-none z-30 shadow-lg">
          {preview}
        </span>
      )}
    </div>
  );
});

const ScreenshotWithPinsInner = ({
  screenshotId,
  screenshotUrl: url,
  screenshotUrlLoading: screenshotLoading,
  screenshotUrlError: screenshotError,
  onExpand,
  isCommentMode = false,
  pins = [],
  comments = [],
  activePinId,
  activeThreadId,
  onPinClick,
  onOpenThreadPanel,
  onCloseInlinePopover,
  onAddPinComment,
  updateComment,
  onCommentPlaced,
  onPinPositionChange,
  embeddedInCard = false,
  onEdit,
  canEdit,
  animatingPinId,
  participants,
  pageArea,
  userAgent,
  viewportWidth,
  viewportHeight,
  devicePixelRatio,
  createdAt,
}: ScreenshotWithPinsProps) => {
  const trimmedPageArea = typeof pageArea === "string" ? pageArea.trim() : "";
  const deviceLine = parseDeviceInfo(userAgent, viewportWidth, viewportHeight, devicePixelRatio);
  const dateLine = formatLocalDateTime(createdAt);
  const tooltipContent = [trimmedPageArea, deviceLine, dateLine].filter(Boolean).join("\n");
  const { displayName, authEmail, authPhotoUrl } = useWorkspace();
  const containerRef = useRef<HTMLDivElement>(null);
  const draftPopoverRef = useRef<HTMLDivElement>(null);
  const pinEditorRef = useRef<Editor | null>(null);
  const [draftPosition, setDraftPosition] = useState<CommentPosition | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageDecoded, setImageDecoded] = useState(false);

  // Emoji picker state
  const [draftEmojiOpen, setDraftEmojiOpen] = useState(false);
  const draftEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const draftEmojiPickerRef = useRef<HTMLDivElement>(null);
  const [draftEmojiAnchorRect, setDraftEmojiAnchorRect] = useState<DOMRect | null>(null);

  // Attachment file input
  const draftFileInputRef = useRef<HTMLInputElement>(null);

  const [draftPendingAttachments, setDraftPendingAttachments] = useState<CommentAttachment[]>([]);
  const [draftFileError, setDraftFileError] = useState<string | null>(null);
  const MAX_ATTACHMENTS = 5;

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isCommentMode) setCursorPos(null);
  }, [isCommentMode]);

  useLayoutEffect(() => {
    setImageDecoded(false);
  }, [url]);
  useEffect(() => {
    if (!url) return;
    const timeout = window.setTimeout(() => {
      setImageDecoded(true);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [url]);

  useEffect(() => {
    if (!draftFileError) return;
    const t = setTimeout(() => setDraftFileError(null), 4000);
    return () => clearTimeout(t);
  }, [draftFileError]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isCommentMode && onAddPinComment) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        setDraftPosition({ xPercent, yPercent });
      } else if (!isCommentMode && onCloseInlinePopover) {
        onCloseInlinePopover();
      }
    },
    [isCommentMode, onAddPinComment, onCloseInlinePopover]
  );

  const handleSubmitDraftWithMentions = useCallback(async (text: string, mentionedUserIds: string[]) => {
    if (!draftPosition || !onAddPinComment) return;
    const trimmed = text.trim();
    if (!trimmed && draftPendingAttachments.length === 0) return;
    setSubmitting(true);
    try {
      const newCommentId = await onAddPinComment(
        draftPosition,
        trimmed,
        mentionedUserIds,
        draftPendingAttachments.length > 0 ? draftPendingAttachments : undefined
      );
      setDraftPosition(null);
      setDraftPendingAttachments([]);
      pinEditorRef.current?.commands.clearContent();
      onCommentPlaced?.(newCommentId ?? undefined);
    } finally {
      setSubmitting(false);
    }
  }, [draftPosition, draftPendingAttachments, onAddPinComment, onCommentPlaced]);

  const handleCancelDraft = useCallback(() => {
    setDraftPosition(null);
    setDraftPendingAttachments([]);
    setDraftFileError(null);
    pinEditorRef.current?.commands.clearContent();
  }, []);

  // Click-outside: dismiss draft compose when clicking outside the popover and outside the screenshot
  useEffect(() => {
    if (!draftPosition) return;
    function handleClickOutside(e: MouseEvent) {
      if ((e.target as HTMLElement)?.closest?.(".mention-dropdown")) return;
      const target = e.target as Node;
      if (draftPopoverRef.current?.contains(target)) return;
      if (containerRef.current?.contains(target)) return;
      if (draftEmojiPickerRef.current?.contains(target)) return;
      if (draftEmojiButtonRef.current?.contains(target)) return;
      handleCancelDraft();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [draftPosition, handleCancelDraft]);

  // Click-outside: close emoji picker
  useEffect(() => {
    if (!draftEmojiOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        draftEmojiPickerRef.current &&
        !draftEmojiPickerRef.current.contains(e.target as Node) &&
        draftEmojiButtonRef.current &&
        !draftEmojiButtonRef.current.contains(e.target as Node)
      ) {
        setDraftEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [draftEmojiOpen]);

  const pinComments = pins.filter(
    (c): c is Comment & { position: CommentPosition } => c.type === "pin" && c.position != null
  );

  type Placement = { left: number; top: number; showAbove: boolean };
  const [draftPlacement, setDraftPlacement] = useState<Placement | null>(null);

  const computePlacements = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (draftPosition) {
      setDraftPlacement({
        left: rect.left + (rect.width * draftPosition.xPercent) / 100,
        top: rect.top + (rect.height * draftPosition.yPercent) / 100,
        showAbove: draftPosition.yPercent >= 35,
      });
    } else {
      setDraftPlacement(null);
    }
  }, [draftPosition]);

  useLayoutEffect(() => {
    computePlacements();
    window.addEventListener("scroll", computePlacements, true);
    window.addEventListener("resize", computePlacements);
    return () => {
      window.removeEventListener("scroll", computePlacements, true);
      window.removeEventListener("resize", computePlacements);
    };
  }, [computePlacements]);

  const userAvatar = authPhotoUrl ?? "";
  const userName = displayName || authEmail || "You";

  const outerCard = embeddedInCard
    ? "block"
    : "rounded-xl border border-[var(--border)] bg-white backdrop-blur-[6px] p-2.5 shadow-none";
  const innerBorder = embeddedInCard ? "border-0" : "border border-[var(--border)]";

  return (
    <div className={outerCard}>
      <div
        ref={containerRef}
        className={`group relative overflow-visible rounded-lg max-h-[317px] bg-white ${innerBorder} shadow-none ${isCommentMode ? "comment-mode-cursor" : ""}`}
        onClick={handleImageClick}
        onMouseMove={(e) => {
          if (!isCommentMode) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setCursorPos(null)}
        role={isCommentMode ? "button" : undefined}
        aria-label={isCommentMode ? "Click to add comment pin" : undefined}
      >
        <div className="relative w-full max-h-[317px] aspect-video overflow-hidden rounded-lg">
          {url ? (
          <img
            key={url} // Hard reset the image element on ticket switch
            src={url}
            alt="Screenshot"
            className={`w-full h-full object-contain max-h-[317px] pointer-events-none block transition-[filter,opacity] duration-300 ease-out ${
              imageDecoded ? "opacity-100 blur-0" : "opacity-[0.88] blur-md"
            }`}
            loading="eager"
            decoding="async"
            draggable={false}
            onLoad={() => {
              setImageDecoded(true);
            }}
            onError={() => setImageDecoded(true)}
          />
          ) : null}

          {(screenshotLoading && !url) ||
          (Boolean(screenshotId) && !url && !screenshotError) ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10 bg-[var(--layer-2-bg)]/80">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" strokeWidth={1.8} aria-hidden />
            </div>
          ) : null}
          {!screenshotLoading && screenshotId && !url && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-[var(--layer-2-bg)] text-[12px] text-[var(--text-tertiary)]">
              {screenshotError ?? "Screenshot unavailable"}
            </div>
          )}
        </div>

        {isCommentMode && cursorPos && !draftPosition && (
          <div
            className="pointer-events-none absolute"
            style={{ left: cursorPos.x + 16, top: cursorPos.y - 12, zIndex: 10 }}
          >
            <span
              className="inline-block whitespace-nowrap pointer-events-none"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "var(--text-heading)",
                color: "var(--text-on-dark)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "-0.005em",
                fontFamily: "var(--font-sans)",
              }}
            >
              Click to add comment
            </span>
          </div>
        )}

        {pinComments.map((c, idx) => (
          <PinMarker
            key={c.id}
            commentId={c.id}
            position={c.position}
            number={idx + 1}
            message={c.message ?? ""}
            isActive={activePinId === c.id || activeThreadId === c.id}
            isResolved={c.resolved}
            onClick={() => onPinClick?.(c.id)}
            onPositionChange={onPinPositionChange ?? (async () => {})}
            containerRef={containerRef}
            animatingPinId={animatingPinId}
          />
        ))}

        {draftPosition && (
          <div
            className="absolute flex items-center justify-center z-20 pointer-events-none animate-in zoom-in-95 duration-150"
            style={{
              width: PIN_SIZE_PX,
              height: PIN_SIZE_PX,
              left: `${draftPosition.xPercent}%`,
              top: `${draftPosition.yPercent}%`,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="var(--text-heading)"
              stroke="white"
              strokeWidth="1.5"
              className="w-full h-full"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )}

        {draftPosition &&
          draftPlacement &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={draftPopoverRef}
              className="rounded-2xl bg-white shadow-[var(--shadow-lg)] w-[420px]"
              style={{
                position: "fixed",
                left: draftPlacement.left,
                top: draftPlacement.showAbove ? draftPlacement.top - POPOVER_GAP_PX : draftPlacement.top + POPOVER_GAP_PX,
                transform: draftPlacement.showAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                zIndex: POPOVER_Z_INDEX,
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] overflow-hidden focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20 transition-colors">

                {/* Row 1: Avatar + textarea */}
                <div className="flex items-start gap-3 px-4 pt-4">
                  <div className="w-[28px] h-[28px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[14px] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                    {userAvatar ? (
                      <Image src={userAvatar} alt="" width={28} height={28} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1.5">
                    <TiptapCommentEditor
                      placeholder="Add a comment..."
                      participants={participants ?? []}
                      editorRef={pinEditorRef}
                      autoFocus
                      onSubmit={(text, mentionedUserIds) => {
                        void handleSubmitDraftWithMentions(text, mentionedUserIds);
                      }}
                      onEscape={handleCancelDraft}
                      className="w-full min-h-[48px] px-2"
                    />
                  </div>
                </div>

                {draftPendingAttachments.length > 0 && (
                  <div className="flex flex-col gap-2 mx-4 mt-2 mb-1">
                    {draftPendingAttachments.map((att, i) => {
                      const isLoading = (att as any)._loading;
                      return (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl">
                          {isLoading ? (
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: getUploadBoxColor(att.file_name) }}>
                              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
                                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeDasharray="62.83"
                                  strokeDashoffset="62.83"
                                  className="upload-ring-animate"
                                />
                              </svg>
                            </div>
                          ) : att.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name) ? (
                            <img src={att.file_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: getUploadBoxColor(att.file_name) }}>
                              <Paperclip className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <span className="flex-1 min-w-0 text-[14px] font-medium text-[var(--text-body)] truncate">
                            {att.file_name}
                            {isLoading && <span className="ml-2 text-[12px] text-[var(--text-tertiary)]">Uploading...</span>}
                          </span>
                          <button type="button" onClick={() => setDraftPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="p-1 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {draftFileError && (
                  <div className="flex items-center gap-2 mx-4 mb-1 px-3 py-2 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
                    <span className="text-[14px] font-medium text-[var(--color-danger)]">{draftFileError}</span>
                    <button type="button" onClick={() => setDraftFileError(null)} className="ml-auto p-0.5 rounded text-[var(--color-danger)]">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Row 2: Icons + Cancel + Comment button */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <Tooltip content="Emoji">
                      <button
                        ref={draftEmojiButtonRef}
                        type="button"
                        onClick={() => {
                          if (draftEmojiButtonRef.current) {
                            setDraftEmojiAnchorRect(draftEmojiButtonRef.current.getBoundingClientRect());
                          }
                          setDraftEmojiOpen(v => !v);
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                      >
                        <Smile className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </button>
                    </Tooltip>
                    <span className="w-px h-4 bg-[var(--border)] mx-1" />
                    <Tooltip content="Mention someone">
                      <button
                        type="button"
                        onClick={() => {
                          pinEditorRef.current?.chain().focus().insertContent("@").run();
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                      >
                        <AtSign className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </button>
                    </Tooltip>
                    <span className="w-px h-4 bg-[var(--border)] mx-1" />
                    <Tooltip content="Attach">
                      <button
                        type="button"
                        onClick={() => draftFileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                      >
                        <Paperclip className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </button>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelDraft}
                      className="text-[14px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ed = pinEditorRef.current;
                        if (!ed) return;
                        const { text, mentionedUserIds } = extractFromDoc(ed.state.doc);
                        void handleSubmitDraftWithMentions(text, mentionedUserIds);
                      }}
                      disabled={submitting}
                      className="inline-flex h-[34px] items-center gap-1.5 px-3 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[13px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? "Sending..." : "Comment"}
                    </button>
                  </div>
                </div>

              </div>
            </div>,
            document.body
          )}

        {!isCommentMode && url && (
          <>
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="absolute top-2.5 right-[50px] flex items-center justify-center h-[38px] w-[38px] rounded-[var(--radius-btn)] bg-[var(--text-heading)] text-white hover:bg-[var(--text-body)] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer focus:outline-none z-10 shadow-sm"
                aria-label="Edit screenshot"
              >
                <Pencil className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="absolute top-2.5 right-2.5 flex items-center justify-center h-[38px] w-[38px] rounded-[var(--radius-btn)] bg-[var(--text-heading)] text-white hover:bg-[var(--text-body)] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer focus:outline-none z-10 shadow-sm"
              aria-label="Expand screenshot"
            >
              <Expand className="h-4 w-4" strokeWidth={2} />
            </button>
          </>
        )}

        {!isCommentMode && url && tooltipContent ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Tooltip content={tooltipContent} position="right">
              <span
                aria-label={trimmedPageArea ? `Page area: ${trimmedPageArea}` : "Device info"}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-black/55 text-white backdrop-blur-sm shadow-sm"
              >
                <Info className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
              </span>
            </Tooltip>
          </div>
        ) : null}
      </div>

      {/* Hidden file input for attachment */}
      <input
        ref={draftFileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            setDraftFileError("File must be under 10 MB");
            e.target.value = "";
            return;
          }
          if (draftPendingAttachments.length >= MAX_ATTACHMENTS) {
            setDraftFileError("Maximum 5 attachments allowed");
            e.target.value = "";
            return;
          }
          const placeholderId = Date.now().toString();
          const placeholder = { file_name: file.name, file_url: "", file_size: file.size, _loading: true, _id: placeholderId, _progress: 0 } as any;
          setDraftPendingAttachments(prev => [...prev, placeholder]);
          try {
            const { uploadAttachmentWithProgress } = await import("@/lib/uploadAttachment");
            const result = await Promise.race([
              uploadAttachmentWithProgress(file, (percent) => {
                setDraftPendingAttachments(prev =>
                  prev.map(att => (att as any)._id === placeholderId
                    ? { ...att, _progress: percent }
                    : att)
                );
              }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Upload timed out")), 30000)),
            ]);
            if (!result.url) {
              setDraftPendingAttachments(prev => prev.filter(att => (att as any)._id !== placeholderId));
              setDraftFileError("Upload completed but file URL is missing");
              e.target.value = "";
              return;
            }
            setDraftPendingAttachments(prev =>
              prev.map(att => (att as any)._id === placeholderId
                ? { file_name: result.name, file_url: result.url, file_size: result.size }
                : att)
            );
          } catch (err) {
            setDraftPendingAttachments(prev => prev.filter(att => (att as any)._id !== placeholderId));
            const message = err instanceof Error && err.message === "Upload timed out"
              ? "Upload timed out. Please try again."
              : "Failed to upload file. Please try again.";
            setDraftFileError(message);
          }
          e.target.value = "";
        }}
      />

      {/* Emoji picker portal */}
      {draftEmojiOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={draftEmojiPickerRef}
          className="fixed z-[2147480001]"
          style={{
            top: (draftEmojiAnchorRect?.bottom ?? 0) + 4,
            left: Math.min(draftEmojiAnchorRect?.left ?? 0, window.innerWidth - 320),
          }}
        >
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              pinEditorRef.current?.chain().focus().insertContent(emojiData.emoji).run();
              setDraftEmojiOpen(false);
            }}
            width={300}
            height={380}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export const ScreenshotWithPins = memo(ScreenshotWithPinsInner);
