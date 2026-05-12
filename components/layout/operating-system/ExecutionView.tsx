"use client";

import type { Ref } from "react";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import { FeedbackContent } from "@/components/session/feedbackDetail/FeedbackContent";
import type { ActionItemsSectionHandle } from "@/components/session/feedbackDetail/ActionItemsSection";
import { SessionFeedbackHeader } from "@/components/session/FeedbackHeader";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoTicketSelectedIllu } from "@/components/empty/canvasIllustrations";
import type { Comment } from "@/lib/domain/comment";
import type { ShareSurfacePermissions } from "@/lib/access/resolveAccess";
import type { Priority } from "@/lib/domain/feedback";

export interface ExecutionViewProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  /** Increment after optimistic resolve for a brief header/status cue (dashboard). */
  resolveAffirmationKey?: number;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onResolvedChange?: (isResolved: boolean) => void;
  onSaveDescription?: (description: string) => Promise<void>;
  onSaveTags?: (tags: string[]) => Promise<void>;
  setIsImageExpanded: (v: boolean) => void;
  onEdit?: () => void;
  canEdit?: boolean;
  onOpenComment?: () => void;
  onCloseCommentMode?: () => void;
  isCommentMode?: boolean;
  /** True while PATCH resolve is in flight (dashboard Resolve control). */
  resolveSubmitting?: boolean;
  impactScore?: number | null;
  comments?: Comment[];
  sendPinComment?: (position: { xPercent: number; yPercent: number }, message: string, mentionedUserIds?: string[]) => Promise<string | null>;
  participants?: { uid: string; displayName: string; email: string; avatarUrl?: string | null }[];
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
      action: "resolve" | "comment" | "assign" | "defer";
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
  isAnonymousViewer?: boolean;
  /** Parent resolves once via `useScreenshotUrl` for the selected ticket. */
  screenshotUrl: string | null;
  screenshotUrlLoading: boolean;
  screenshotUrlError: string | null;
  onAssigned?: (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => void;
  onPriorityChanged?: (priority: Priority | null) => void;
  onSaveStateChange?: (state: 'saving' | 'saved' | 'error' | 'hidden') => void;
  canAssignTicket?: boolean;
  isWorkspaceMember?: boolean;
  animatingPinId?: string | null;
  /** Imperative handle for guarding navigation against unsaved description edits. */
  actionItemsRef?: Ref<ActionItemsSectionHandle>;
}

export function ExecutionView({
  item,
  resolveAffirmationKey = 0,
  onSaveTitle,
  onResolvedChange,
  onSaveDescription,
  onSaveTags,
  setIsImageExpanded,
  onEdit,
  canEdit,
  onOpenComment,
  onCloseCommentMode,
  isCommentMode = false,
  resolveSubmitting = false,
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
  isAnonymousViewer,
  screenshotUrl,
  screenshotUrlLoading,
  screenshotUrlError,
  onAssigned,
  onPriorityChanged,
  onSaveStateChange,
  canAssignTicket = false,
  isWorkspaceMember = false,
  animatingPinId,
  participants,
  actionItemsRef,
}: ExecutionViewProps) {
  const displayItem = item;

  const isShareSurface = shareGating != null;
  const isPublicReadOnly =
    readOnly === true && readOnlyPermissions != null && !isShareSurface;

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      <SessionFeedbackHeader
        item={displayItem}
        onSaveTitle={isPublicReadOnly || isShareSurface ? undefined : onSaveTitle}
        resolveAffirmationKey={resolveAffirmationKey}
        impactScore={impactScore}
        onResolvedChange={
          isPublicReadOnly || isShareSurface ? undefined : onResolvedChange
        }
        resolveSubmitting={
          isPublicReadOnly || isShareSurface ? false : resolveSubmitting
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
        isAnonymousViewer={isAnonymousViewer}
        assigneeId={(displayItem as { assigneeId?: string | null } | null)?.assigneeId ?? null}
        assigneeName={(displayItem as { assigneeName?: string | null } | null)?.assigneeName ?? null}
        assigneeAvatarUrl={(displayItem as { assigneeAvatarUrl?: string | null } | null)?.assigneeAvatarUrl ?? null}
        onAssigned={(!isPublicReadOnly && !isShareSurface) ? onAssigned : undefined}
        priority={(displayItem as { priority?: string | null } | null)?.priority as ("high" | "medium" | "low" | null) ?? null}
        onPriorityChanged={(!isPublicReadOnly && !isShareSurface) ? onPriorityChanged : undefined}
        onSaveStateChange={(!isPublicReadOnly && !isShareSurface) ? onSaveStateChange : undefined}
        canAssignTicket={canAssignTicket}
        isWorkspaceMember={isWorkspaceMember}
      />

      <div
        className="main-content flex-1 min-h-0 overflow-y-auto"
        data-comment-mode={
          !isPublicReadOnly && !isShareSurface && isCommentMode ? true : undefined
        }
      >
        <div className={isShareSurface ? "pt-0 pb-2" : "pt-0 pb-4"}>
          {!displayItem ? (
            <div className="flex h-full min-h-[320px] items-center justify-center py-16">
              <CanvasEmptyState
                illustration={<NoTicketSelectedIllu />}
                title="Select a ticket"
                description="Choose a ticket from the list to view details and comments."
              />
            </div>
          ) : (
            <FeedbackContent
              key={displayItem.id}
              item={displayItem}
              actionItemsRef={actionItemsRef}
              screenshotUrl={screenshotUrl}
              screenshotUrlLoading={screenshotUrlLoading}
              screenshotUrlError={screenshotUrlError}
              readOnlyDescription={readOnlyDescription}
              onSaveDescription={
                isPublicReadOnly || isShareSurface ? undefined : onSaveDescription
              }
              onSaveTags={
                isPublicReadOnly || isShareSurface ? undefined : onSaveTags
              }
              onExpandImage={() => setIsImageExpanded(true)}
              onEdit={isPublicReadOnly || isShareSurface ? undefined : onEdit}
              canEdit={!isPublicReadOnly && !isShareSurface ? canEdit : undefined}
              isCommentMode={
                !isPublicReadOnly && !isShareSurface && isCommentMode
              }
              comments={comments}
              pinComments={comments.filter((c): c is Comment & { position: NonNullable<Comment["position"]> } => c.type === "pin" && c.position != null && c.feedbackId === displayItem?.id)}
              animatingPinId={animatingPinId}
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
              participants={participants}
            />
          )}
        </div>
      </div>
    </div>
  );
}
