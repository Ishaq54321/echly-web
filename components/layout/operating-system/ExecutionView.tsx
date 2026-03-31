"use client";

import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import { FeedbackContent } from "@/components/session/feedbackDetail/FeedbackContent";
import { SessionFeedbackHeader } from "@/components/session/FeedbackHeader";
import type { Comment } from "@/lib/domain/comment";
import type { ShareSurfacePermissions } from "@/lib/access/resolveAccess";

export interface ExecutionViewProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  /** Increment after optimistic resolve for a brief header/status cue (dashboard). */
  resolveAffirmationKey?: number;
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
  onDelete?: () => void;
  /** Public share: dashboard chrome without mutations */
  readOnly?: boolean;
  readOnlyPermissions?: { canResolve: boolean; canComment: boolean };
  /** Renders read-only Description section (e.g. public API body text). */
  readOnlyDescription?: string | null;
  /** Public share: gated action bar (same chrome as dashboard; no auth hooks here). */
  shareGating?: {
    permissions: ShareSurfacePermissions;
    onBlocked: (detail: {
      reason: "tier" | "app";
      action: "resolve" | "resolve_next" | "comment" | "assign" | "defer";
    }) => void;
    pendingResolve?: boolean;
    onRequestResolveAccess?: () => void;
  };
  accessResolve?: {
    canResolve: boolean;
    pendingResolve: boolean;
    onRequestAccess: () => void;
  };
  accessResolveSubmitting?: boolean;
}

export function ExecutionView({
  item,
  resolveAffirmationKey = 0,
  onSaveTitle: _onSaveTitle,
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
  sendReply: _sendReply,
  activePinIdForPopover,
  activeThreadId,
  onPinClick,
  onOpenThreadPanel,
  onCloseInlinePopover,
  updateComment,
  sendTextComment,
  onCommentPlaced,
  updatePinPosition,
  onDelete,
  readOnly = false,
  readOnlyPermissions,
  readOnlyDescription = null,
  shareGating,
  accessResolve,
  accessResolveSubmitting,
}: ExecutionViewProps) {
  const displayItem = item;

  const isShareSurface = shareGating != null;
  const isPublicReadOnly =
    readOnly === true && readOnlyPermissions != null && !isShareSurface;

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      <SessionFeedbackHeader
        item={displayItem}
        resolveAffirmationKey={resolveAffirmationKey}
        impactScore={impactScore}
        onResolvedChange={
          isPublicReadOnly || isShareSurface ? undefined : onResolvedChange
        }
        onResolveAndNext={
          isPublicReadOnly || isShareSurface ? undefined : onResolveAndNext
        }
        onOpenComment={
          isPublicReadOnly || isShareSurface ? undefined : onOpenComment
        }
        onCloseCommentMode={onCloseCommentMode}
        isCommentMode={isCommentMode}
        onDelete={isShareSurface ? undefined : onDelete}
        readOnly={isPublicReadOnly}
        readOnlyPermissions={isPublicReadOnly ? readOnlyPermissions : undefined}
        shareGating={shareGating}
        accessResolve={accessResolve}
        accessResolveSubmitting={accessResolveSubmitting}
      />

      {!isPublicReadOnly && !isShareSurface && isCommentMode && (
        <div className="shrink-0 px-3 py-2.5 flex items-center justify-center bg-[#FAFBFC] -mx-6 mt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] text-[#6B7280]">
            Comment mode · Click anywhere to add comment · Esc to exit
          </span>
        </div>
      )}

      <div
        className={`main-content flex-1 min-h-0 overflow-y-auto ${
          !isPublicReadOnly && !isShareSurface && isCommentMode
            ? "cursor-crosshair"
            : ""
        }`}
        data-comment-mode={
          !isPublicReadOnly && !isShareSurface && isCommentMode ? true : undefined
        }
      >
        <div className={isShareSurface ? "pt-0 pb-2" : "pt-0 pb-4"}>
          {displayItem ? (
            <FeedbackContent
              item={displayItem}
              readOnlyDescription={readOnlyDescription}
              onSaveActionSteps={
                isPublicReadOnly || isShareSurface ? undefined : onSaveActionSteps
              }
              onSaveTags={
                isPublicReadOnly || isShareSurface ? undefined : onSaveTags
              }
              onExpandImage={() => setIsImageExpanded(true)}
              isCommentMode={
                !isPublicReadOnly && !isShareSurface && isCommentMode
              }
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
