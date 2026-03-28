"use client";

import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import { FeedbackContent } from "@/components/session/feedbackDetail/FeedbackContent";
import { SessionFeedbackHeader } from "@/components/session/FeedbackHeader";
import type { Comment } from "@/lib/domain/comment";
import type { ResolvedPublicSharePermissions } from "@/lib/permissions/publicSharePermissions";

export interface ExecutionViewProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onResolvedChange?: (isResolved: boolean) => void;
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  setIsImageExpanded: (v: boolean) => void;
  onOpenComment?: () => void;
  onCloseCommentMode?: () => void;
  isCommentMode?: boolean;
  onResolveAndNext?: () => void;
  canComment?: boolean;
  canResolve?: boolean;
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
    permissions: ResolvedPublicSharePermissions;
    onBlocked: (detail: {
      reason: "tier" | "app";
      action: "resolve" | "resolve_next" | "comment" | "assign" | "defer";
    }) => void;
  };
}

export function ExecutionView({
  item,
  onSaveTitle: _onSaveTitle,
  onResolvedChange,
  onSaveActionSteps,
  onSaveTags,
  setIsImageExpanded,
  onOpenComment,
  onCloseCommentMode,
  isCommentMode = false,
  onResolveAndNext,
  canComment = true,
  canResolve = true,
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
}: ExecutionViewProps) {
  const displayItem = item;

  const isShareSurface = shareGating != null;
  const isPublicReadOnly =
    readOnly === true && readOnlyPermissions != null && !isShareSurface;

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      <SessionFeedbackHeader
        item={displayItem}
        impactScore={impactScore}
        onResolvedChange={
          isPublicReadOnly || isShareSurface ? undefined : canResolve ? onResolvedChange : undefined
        }
        onResolveAndNext={
          isPublicReadOnly || isShareSurface ? undefined : canResolve ? onResolveAndNext : undefined
        }
        onOpenComment={
          isPublicReadOnly || isShareSurface ? undefined : canComment ? onOpenComment : undefined
        }
        onCloseCommentMode={onCloseCommentMode}
        isCommentMode={isCommentMode}
        onDelete={isShareSurface ? undefined : onDelete}
        readOnly={isPublicReadOnly}
        readOnlyPermissions={isPublicReadOnly ? readOnlyPermissions : undefined}
        shareGating={shareGating}
      />

      {!isPublicReadOnly && !isShareSurface && canComment && isCommentMode && (
        <div className="shrink-0 px-3 py-2.5 flex items-center justify-center bg-[#FAFBFC] -mx-6 mt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] text-[#6B7280]">
            Comment mode · Click anywhere to add comment · Esc to exit
          </span>
        </div>
      )}

      <div
        className={`main-content flex-1 min-h-0 overflow-y-auto ${
          !isPublicReadOnly && !isShareSurface && canComment && isCommentMode
            ? "cursor-crosshair"
            : ""
        }`}
        data-comment-mode={
          !isPublicReadOnly && !isShareSurface && canComment && isCommentMode ? true : undefined
        }
      >
        <div className={isShareSurface ? "pt-0 pb-2" : "pt-0 pb-4"}>
          {displayItem ? (
            <FeedbackContent
              item={displayItem}
              readOnlyDescription={readOnlyDescription}
              onSaveActionSteps={
                isPublicReadOnly || isShareSurface ? undefined : canResolve ? onSaveActionSteps : undefined
              }
              onSaveTags={
                isPublicReadOnly || isShareSurface ? undefined : canResolve ? onSaveTags : undefined
              }
              onExpandImage={() => setIsImageExpanded(true)}
              isCommentMode={
                !isPublicReadOnly && !isShareSurface && canComment && isCommentMode
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
