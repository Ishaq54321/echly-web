"use client";

import React, { useState, useCallback, useRef, memo, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Expand, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { Comment } from "@/lib/domain/comment";
import type { CommentPosition } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";

const PIN_SIZE_PX = 23;
const POPOVER_GAP_PERCENT = 2;
const POPOVER_GAP_PX = 8;
const TOOLTIP_MAX_LEN = 60;
const POPOVER_MAX_WIDTH = 380;
const POPOVER_Z_INDEX = 10050;
const POPOVER_STYLE =
  "rounded-xl bg-white border border-neutral-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] min-w-[300px] max-w-[380px] w-[min(380px,90vw)] p-6 animate-in fade-in zoom-in-95 duration-[120ms] ease-out";

interface ScreenshotWithPinsProps {
  screenshotUrl: string;
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
  onAddPinComment?: (position: CommentPosition, message: string) => Promise<string | null>;
  /** Resolve this comment (root); updates pin + panel immediately via single source of truth. */
  updateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  onCommentPlaced?: () => void;
  onPinPositionChange?: (commentId: string, position: CommentPosition) => Promise<void>;
  /** Omit outer card chrome when nested inside a parent attachment card. */
  embeddedInCard?: boolean;
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
    <button
      type="button"
      data-pin-marker
      className={`absolute rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums transition-all duration-150 cursor-grab active:cursor-grabbing border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:scale-105 hover:ring-2 hover:ring-neutral-300 hover:ring-offset-1 ${
        isResolved
          ? "bg-emerald-100 text-emerald-700 opacity-90 hover:bg-emerald-200/90 hover:opacity-100"
          : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
      } ${
        isActive && !isResolved ? "bg-neutral-400 text-white shadow-[0_0_0_2px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.12)] scale-105 ring-2 ring-neutral-300" : ""
      } ${isActive && isResolved ? "ring-2 ring-emerald-300 shadow-[0_1px_4px_rgba(0,0,0,0.08)] scale-105" : ""}`}
      style={{
        width: PIN_SIZE_PX,
        height: PIN_SIZE_PX,
        left: `${displayPos.xPercent}%`,
        top: `${displayPos.yPercent}%`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={`Comment ${number}${isResolved ? " (resolved)" : ""}`}
    >
      {isResolved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden /> : number}
      {showTooltip && preview && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-1.5 rounded bg-neutral-800 text-white text-[11px] leading-snug whitespace-nowrap overflow-hidden max-w-[200px] truncate pointer-events-none z-30 shadow-lg">
          {preview}
        </span>
      )}
    </button>
  );
});

const ScreenshotWithPinsInner = ({
  screenshotUrl,
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
}: ScreenshotWithPinsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threadPopoverRef = useRef<HTMLDivElement>(null);
  const [draftPosition, setDraftPosition] = useState<CommentPosition | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Prevent "ghost" screenshot during ticket switch: reset loading before paint.
  useLayoutEffect(() => {
    setIsImageLoading(true);
  }, [screenshotUrl]);
  useEffect(() => {
    setIsImageLoading(true);
    const timeout = window.setTimeout(() => {
      setIsImageLoading(false);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [screenshotUrl]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isCommentMode && onAddPinComment) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        setDraftPosition({ xPercent, yPercent });
        setDraftMessage("");
      } else if (!isCommentMode && onCloseInlinePopover) {
        onCloseInlinePopover();
      }
    },
    [isCommentMode, onAddPinComment, onCloseInlinePopover]
  );

  useEffect(() => {
    if (!activePinId || !onCloseInlinePopover) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (threadPopoverRef.current?.contains(target)) return;
      let node: Node | null = target;
      while (node && node !== document.body) {
        if (node instanceof Element && node.getAttribute?.("data-pin-marker") != null) return;
        node = node.parentElement;
      }
      onCloseInlinePopover();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activePinId, onCloseInlinePopover]);

  const handleSubmitDraft = useCallback(async () => {
    if (!draftPosition || !onAddPinComment) return;
    const trimmed = draftMessage.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onAddPinComment(draftPosition, trimmed);
      setDraftPosition(null);
      setDraftMessage("");
      onCommentPlaced?.();
    } finally {
      setSubmitting(false);
    }
  }, [draftPosition, draftMessage, onAddPinComment, onCommentPlaced]);

  const handleCancelDraft = useCallback(() => {
    setDraftPosition(null);
    setDraftMessage("");
  }, []);

  const pinComments = pins.filter(
    (c): c is Comment & { position: CommentPosition } => c.type === "pin" && c.position != null
  );
  const root = activePinId
    ? (comments.find((c) => c.id === activePinId && c.type === "pin" && c.position) as (Comment & { position: CommentPosition }) | undefined)
    : undefined;

  type Placement = { left: number; top: number; showAbove: boolean };
  const [draftPlacement, setDraftPlacement] = useState<Placement | null>(null);
  const [threadPlacement, setThreadPlacement] = useState<Placement | null>(null);

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
    if (root?.position) {
      setThreadPlacement({
        left: rect.left + (rect.width * root.position.xPercent) / 100,
        top: rect.top + (rect.height * root.position.yPercent) / 100,
        showAbove: root.position.yPercent >= 35,
      });
    } else {
      setThreadPlacement(null);
    }
  }, [draftPosition, root]);

  useLayoutEffect(() => {
    computePlacements();
    window.addEventListener("scroll", computePlacements, true);
    window.addEventListener("resize", computePlacements);
    return () => {
      window.removeEventListener("scroll", computePlacements, true);
      window.removeEventListener("resize", computePlacements);
    };
  }, [computePlacements]);

  const currentUser = auth.currentUser;
  const userAvatar = currentUser?.photoURL ?? "";
  const userName = currentUser?.displayName || currentUser?.email || "You";

  const outerCard = embeddedInCard
    ? "block"
    : "rounded-xl border border-[#E5E7EB] bg-white backdrop-blur-[6px] p-2.5 shadow-none";
  const innerBorder = embeddedInCard ? "border-0" : "border border-[#E5E7EB]";

  return (
    <div className={outerCard}>
      <div
        ref={containerRef}
        className={`relative overflow-visible rounded-lg max-h-[317px] bg-white ${innerBorder} shadow-none ${isCommentMode ? "cursor-crosshair" : ""}`}
        onClick={handleImageClick}
        role={isCommentMode ? "button" : undefined}
        aria-label={isCommentMode ? "Click to add comment pin" : undefined}
      >
        <div className="relative w-full max-h-[317px] aspect-video overflow-hidden rounded-lg">
          <img
            key={screenshotUrl} // Hard reset the image element on ticket switch
            src={screenshotUrl}
            alt="Screenshot"
            className="w-full h-full object-contain max-h-[317px] pointer-events-none"
            style={{
              display: isImageLoading ? "none" : "block",
              opacity: isImageLoading ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
            loading="lazy"
            draggable={false}
            onLoad={() => {
              setIsImageLoading(false);
            }}
            onError={() => setIsImageLoading(false)}
          />

          {isImageLoading && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10 bg-[var(--layer-2-bg)]">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--text-tertiary))]" strokeWidth={1.8} aria-hidden />
            </div>
          )}
        </div>

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
          />
        ))}

        {draftPosition && (
          <div
            className="absolute rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums bg-neutral-200 text-neutral-800 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08)] z-20 pointer-events-none animate-in zoom-in-95 duration-150"
            style={{
              width: PIN_SIZE_PX,
              height: PIN_SIZE_PX,
              left: `${draftPosition.xPercent}%`,
              top: `${draftPosition.yPercent}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {pinComments.length + 1}
          </div>
        )}

        {draftPosition &&
          draftPlacement &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className={POPOVER_STYLE}
              style={{
                position: "fixed",
                left: draftPlacement.left,
                top: draftPlacement.showAbove ? draftPlacement.top - POPOVER_GAP_PX : draftPlacement.top + POPOVER_GAP_PX,
                transform: draftPlacement.showAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                zIndex: POPOVER_Z_INDEX,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {draftPlacement.showAbove && (
                <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-neutral-200" style={{ top: "100%", marginTop: -1 }} />
              )}
              {!draftPlacement.showAbove && (
                <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-neutral-200" style={{ bottom: "100%", marginBottom: -1 }} />
              )}
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                    {userAvatar ? (
                      <Image src={userAvatar} alt="" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[12px] font-medium text-secondary">{userName.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] truncate">{userName}</span>
                </div>
                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  placeholder="Add a comment..."
                  className="box-border w-full min-h-[56px] rounded-lg bg-[#f5f5f5] border border-neutral-200/80 px-3 py-2.5 text-[13px] leading-[1.5] text-[hsl(var(--text-primary-strong))] placeholder:text-meta focus:outline-none focus:border-neutral-300 focus:ring-1 focus:ring-[var(--accent-operational)]/20 resize-none transition-all duration-[120ms] ease-out"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleCancelDraft();
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSubmitDraft();
                    }
                  }}
                />
                <div className="flex justify-between items-center gap-3 flex-shrink-0 pt-0.5">
                  <button type="button" onClick={handleCancelDraft} className="text-[12px] font-medium text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] px-2.5 py-2 rounded-lg transition-colors duration-150 shrink-0">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSubmitDraft()}
                    disabled={!draftMessage.trim() || submitting}
                    className="text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 shrink-0 shadow-sm"
                  >
                    {submitting ? "Sending…" : "Done"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {activePinId && root && threadPlacement && typeof document !== "undefined" &&
          createPortal(
            <div
              ref={threadPopoverRef}
              className={POPOVER_STYLE}
              style={{
                position: "fixed",
                left: threadPlacement.left,
                top: threadPlacement.showAbove ? threadPlacement.top - POPOVER_GAP_PX : threadPlacement.top + POPOVER_GAP_PX,
                transform: threadPlacement.showAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                zIndex: POPOVER_Z_INDEX,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {threadPlacement.showAbove && <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-neutral-200" style={{ top: "100%", marginTop: -1 }} />}
              {!threadPlacement.showAbove && <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-neutral-200" style={{ bottom: "100%", marginBottom: -1 }} />}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                    {root.userAvatar ? (
                      <Image src={root.userAvatar} alt="" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[12px] font-medium text-secondary">{root.userName?.charAt(0) ?? "?"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-[hsl(var(--text-primary-strong))]">{root.userName}</span>
                    <span className="text-[11px] text-[hsl(var(--text-tertiary))] ml-2">{formatCommentDate(root.createdAt)}</span>
                  </div>
                </div>
                <p className={`text-[13px] leading-[1.5] ${root.resolved ? "text-[hsl(var(--text-tertiary))] opacity-80 line-through" : "text-[hsl(var(--text-secondary-soft))]"}`}>
                  {root.message}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                  {updateComment && !root.resolved && (
                    <button
                      type="button"
                      onClick={() => void updateComment(root.id, { resolved: true })}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5 hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolve comment
                    </button>
                  )}
                  {root.resolved && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                  {onOpenThreadPanel && (
                    <button
                      type="button"
                      onClick={() => onOpenThreadPanel(activePinId)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--text-secondary-soft))] hover:text-[hsl(var(--text-primary-strong))] px-2 py-1.5 rounded-md border border-[var(--layer-2-border)] bg-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open thread
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

        {!isCommentMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-120 cursor-pointer z-10"
            aria-label="Expand screenshot"
          >
            <Expand size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export const ScreenshotWithPins = memo(ScreenshotWithPinsInner);
