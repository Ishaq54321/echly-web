"use client";

import React from "react";
import { statusFromResolved, type FeedbackStatus } from "@/lib/domain/feedback-display";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import { FeedbackContent } from "@/components/session/feedbackDetail/FeedbackContent";
import { CheckCircle2, UserPlus, Clock, MessageSquare } from "lucide-react";
import type { Comment } from "@/lib/domain/comment";

export interface ExecutionViewProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  isEditingDescription: boolean;
  descriptionDraft: string;
  setIsEditingDescription: (v: boolean) => void;
  setDescriptionDraft: (v: string) => void;
  saveDescription: () => void | Promise<void>;
  isSavingDescription?: boolean;
  saveDescriptionSuccess?: boolean;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onResolvedChange?: (isResolved: boolean) => void;
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  setIsImageExpanded: (v: boolean) => void;
  onOpenComment?: () => void;
  onCloseCommentMode?: () => void;
  isCommentMode?: boolean;
  onResolveAndNext?: () => void;
  impactScore?: number | null;
  comments?: Comment[];
  sendPinComment?: (position: { xPercent: number; yPercent: number }, message: string) => Promise<string | null>;
  sendReply?: (threadId: string, message: string) => Promise<void>;
  activePinIdForPopover?: string | null;
  activeThreadId?: string | null;
  onPinClick?: (commentId: string) => void;
  onOpenThreadPanel?: (commentId: string) => void;
  onCloseInlinePopover?: () => void;
  updateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  sendTextComment?: (textRange: { startOffset: number; endOffset: number; containerId: string }, message: string) => Promise<string | null>;
  onCommentPlaced?: () => void;
  updatePinPosition?: (commentId: string, position: { xPercent: number; yPercent: number }) => Promise<void>;
}

function StatusPill({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    Open: "bg-amber-50 text-amber-800 border-amber-200",
    "In Progress":
      "bg-blue-50 text-[var(--accent-operational)] border-[var(--accent-operational-border)]",
    Blocked: "bg-red-50 text-red-700 border-red-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wide border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function ExecutionView({
  item,
  isEditingDescription,
  descriptionDraft,
  setIsEditingDescription,
  setDescriptionDraft,
  saveDescription,
  isSavingDescription,
  saveDescriptionSuccess,
  onResolvedChange,
  onSaveActionSteps,
  onSaveTags,
  setIsImageExpanded,
  onOpenComment,
  onCloseCommentMode,
  isCommentMode = false,
  onResolveAndNext,
  impactScore,
  comments = [],
  sendPinComment,
  sendReply,
  activePinIdForPopover,
  activeThreadId,
  onPinClick,
  onOpenThreadPanel,
  onCloseInlinePopover,
  updateComment,
  sendTextComment,
  onCommentPlaced,
  updatePinPosition,
}: ExecutionViewProps) {

  if (!item) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-12">
          <p className="text-[14px] text-[hsl(var(--text-tertiary))]">
            Select a ticket from the navigator to start executing.
          </p>
        </div>
      </div>
    );
  }

  const status = statusFromResolved(item.isResolved);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Header: static title, no kebab */}
      <header className="shrink-0 pb-2 border-b border-[var(--layer-2-border)]">
        <div className="min-w-0">
          <div className="text-[12px] text-[hsl(var(--text-tertiary))] mb-1">
            Ticket {item.index} of {item.total}
          </div>
          <h1 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))] truncate">
            {item.title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusPill status={status} />
            {impactScore != null && (
              <span className="text-[11px] tabular-nums text-[hsl(var(--text-tertiary))]">
                Impact {impactScore}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Action bar: Resolve first, then Assign, Defer, Resolve & Next, Activity. No wrap. */}
      <div className="shrink-0 py-1.5 flex flex-nowrap items-center gap-2 border-b border-[var(--layer-2-border)] overflow-x-auto">
        {onResolvedChange && (
          <button
            type="button"
            onClick={() => onResolvedChange(!(item.isResolved ?? false))}
            className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-8 min-w-[4.5rem] px-3 rounded-lg text-[12px] font-medium whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors duration-150 cursor-pointer ${
              item.isResolved
                ? "border border-neutral-200 bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-neutral-50"
                : "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={1.5} aria-hidden />
            <span className="inline-block">{item.isResolved ? "Reopen" : "Resolve"}</span>
          </button>
        )}
        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border border-neutral-200 bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-neutral-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] transition-colors duration-150 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
          Assign
        </button>
        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border border-neutral-200 bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-neutral-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] transition-colors duration-150 cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          Defer
        </button>
        {onResolveAndNext && !item.isResolved && (
          <button
            type="button"
            onClick={onResolveAndNext}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border border-neutral-200 bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-neutral-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] transition-colors duration-150 cursor-pointer"
          >
            Resolve &amp; Next
          </button>
        )}
        {onOpenComment && (
          <button
            type="button"
            onClick={() => (isCommentMode ? onCloseCommentMode?.() : onOpenComment())}
            className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] transition-colors duration-150 ${
              isCommentMode
                ? "border-[var(--accent-operational)] bg-[var(--accent-operational)]/10 text-[var(--accent-operational)]"
                : "border-neutral-200 bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-neutral-50 cursor-pointer"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
            Comment
          </button>
        )}
      </div>

      {/* Subtle comment mode indicator (inline pill, not banner) */}
      {isCommentMode && (
        <div className="shrink-0 px-3 py-1.5 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] text-[hsl(var(--text-tertiary))]">
            Comment mode · Click anywhere to add comment · Esc to exit
          </span>
        </div>
      )}

      {/* Body: description, attachments, action steps, tags only */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto ${isCommentMode ? "cursor-crosshair" : ""}`}
        data-comment-mode={isCommentMode || undefined}
      >
        <div className="py-3 space-y-4">
          <FeedbackContent
            item={item}
            isEditingDescription={isEditingDescription}
            descriptionDraft={descriptionDraft}
            setIsEditingDescription={setIsEditingDescription}
            setDescriptionDraft={setDescriptionDraft}
            saveDescription={saveDescription}
            isSavingDescription={isSavingDescription}
            saveDescriptionSuccess={saveDescriptionSuccess}
            onSaveActionSteps={onSaveActionSteps}
            onSaveTags={onSaveTags}
            onExpandImage={() => setIsImageExpanded(true)}
            isCommentMode={isCommentMode}
            comments={comments}
            pinComments={comments.filter((c): c is Comment & { position: NonNullable<Comment["position"]> } => c.type === "pin" && c.position != null)}
            activePinId={activePinIdForPopover ?? undefined}
            activeThreadId={activeThreadId}
            onPinClick={onPinClick}
            onOpenThreadPanel={onOpenThreadPanel}
            onCloseInlinePopover={onCloseInlinePopover}
            sendPinComment={sendPinComment}
            updateComment={updateComment}
            sendTextComment={sendTextComment}
            onCommentPlaced={onCommentPlaced}
            updatePinPosition={updatePinPosition}
          />
        </div>
      </div>
    </div>
  );
}

