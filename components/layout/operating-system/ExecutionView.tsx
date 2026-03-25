"use client";

import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import { FeedbackContent } from "@/components/session/feedbackDetail/FeedbackContent";
import { SessionFeedbackHeader } from "@/components/session/FeedbackHeader";
import type { Comment } from "@/lib/domain/comment";

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
}: ExecutionViewProps) {

  if (!item) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 py-12 gap-4">
          <p className="text-[14px] text-[#6B7280] text-center">
            Select a ticket from the navigator to start executing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      <SessionFeedbackHeader
        item={item}
        impactScore={impactScore}
        onResolvedChange={onResolvedChange}
        onResolveAndNext={onResolveAndNext}
        onOpenComment={onOpenComment}
        onCloseCommentMode={onCloseCommentMode}
        isCommentMode={isCommentMode}
        onDelete={onDelete}
      />

      {isCommentMode && (
        <div className="shrink-0 px-3 py-2.5 flex items-center justify-center bg-[#FAFBFC] -mx-6 mt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] text-[#6B7280]">
            Comment mode · Click anywhere to add comment · Esc to exit
          </span>
        </div>
      )}

      <div
        className={`main-content flex-1 min-h-0 overflow-y-auto ${isCommentMode ? "cursor-crosshair" : ""}`}
        data-comment-mode={isCommentMode || undefined}
      >
        <div className="pt-1 pb-6">
          <FeedbackContent
            item={item}
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
