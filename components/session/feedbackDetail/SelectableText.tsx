"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { CommentTextRange } from "@/lib/domain/comment";

function getTextRangeFromSelection(container: HTMLElement): CommentTextRange | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  try {
    const startRange = document.createRange();
    startRange.setStart(container, 0);
    startRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = startRange.toString().length;
    const endRange = document.createRange();
    endRange.setStart(container, 0);
    endRange.setEnd(range.endContainer, range.endOffset);
    const endOffset = endRange.toString().length;
    return { containerId: container.getAttribute("data-container-id") || "text", startOffset, endOffset };
  } catch {
    return null;
  }
}

export interface SelectableTextProps {
  containerId: string;
  children: React.ReactNode;
  isCommentMode?: boolean;
  onAddTextComment?: (textRange: CommentTextRange, message: string) => Promise<string | null>;
  className?: string;
}

export function SelectableText({
  containerId,
  children,
  isCommentMode,
  onAddTextComment,
  className,
}: SelectableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBubble, setShowBubble] = useState(false);
  const [pendingRange, setPendingRange] = useState<CommentTextRange | null>(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const [draftMessage, setDraftMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleMouseUp = useCallback(() => {
    if (!isCommentMode || !onAddTextComment || !containerRef.current) return;
    const range = getTextRangeFromSelection(containerRef.current);
    if (!range) {
      setShowBubble(false);
      setPendingRange(null);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    const rect = r.getBoundingClientRect();
    const parent = containerRef.current.getBoundingClientRect();
    setPendingRange(range);
    setBubblePos({
      top: rect.bottom - parent.top + 4,
      left: rect.left - parent.left,
    });
    setShowBubble(true);
    setDraftMessage("");
  }, [isCommentMode, onAddTextComment]);

  const handleSubmit = useCallback(async () => {
    if (!pendingRange || !onAddTextComment) return;
    const trimmed = draftMessage.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onAddTextComment(pendingRange, trimmed);
      setShowBubble(false);
      setPendingRange(null);
      setDraftMessage("");
      window.getSelection()?.removeAllRanges();
    } finally {
      setSubmitting(false);
    }
  }, [pendingRange, draftMessage, onAddTextComment]);

  useEffect(() => {
    if (!showBubble) return;
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (sel?.isCollapsed) setShowBubble(false);
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [showBubble]);

  return (
    <div
      ref={containerRef}
      data-container-id={containerId}
      onMouseUp={handleMouseUp}
      className={className}
    >
      {children}
      {showBubble && pendingRange && onAddTextComment && (
        <div
          className="absolute z-20 rounded-lg bg-white border border-[var(--layer-2-border)] shadow-[var(--elevation-2)] p-2 min-w-[200px]"
          style={{ top: bubblePos.top, left: bubblePos.left }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--text-tertiary))]">+ Comment</span>
          </div>
          <textarea
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            placeholder="Add a comment…"
            className="w-full min-h-[60px] rounded border border-[var(--layer-2-border)] px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-operational)] resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowBubble(false);
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => setShowBubble(false)}
              className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] px-2 py-1 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!draftMessage.trim() || submitting}
              className="text-[11px] font-medium text-white bg-[var(--accent-operational)] px-2 py-1 rounded disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Comment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
