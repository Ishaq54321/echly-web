"use client";

import { memo, type Ref } from "react";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import { FeedbackContent } from "@/components/session/feedbackDetail/FeedbackContent";
import type { ActionItemsSectionHandle } from "@/components/session/feedbackDetail/ActionItemsSection";
import { SessionFeedbackHeader } from "@/components/session/FeedbackHeader";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoTicketSelectedIllu } from "@/components/empty/canvasIllustrations";
import type { Comment, CommentAttachment, CommentPosition } from "@/lib/domain/comment";
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
  /** Toggles the activity rail (history timeline). Phase 26.8. */
  onToggleActivity?: () => void;
  /** Reflects panel open state so the Activity button can show pressed. */
  isActivityPanelOpen?: boolean;
  /** Pin-placement mode for the screenshot (driven by the MapPin action). */
  isCommentMode?: boolean;
  /** Toggles screenshot pin-placement mode (Phase 26.7 comment action). */
  onTogglePinMode?: () => void;
  /** Force-exits comment mode (cancel / Escape / click-outside). */
  onExitCommentMode?: () => void;
  /** Comment to scroll to + briefly highlight on pin click (Phase 26.7). */
  highlightedCommentId?: string | null;
  /** True while PATCH resolve is in flight (dashboard Resolve control). */
  resolveSubmitting?: boolean;
  impactScore?: number | null;
  comments?: Comment[];
  loadingComments?: boolean;
  sendPinComment?: (position: { xPercent: number; yPercent: number }, message: string, mentionedUserIds?: string[]) => Promise<string | null>;
  participants?: { uid: string; displayName: string; email: string; avatarUrl?: string | null }[];
  sendReply?: (
    threadId: string,
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    mentionedUserIds?: string[]
  ) => Promise<void>;
  sendComment?: (
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    position?: CommentPosition,
    mentionedUserIds?: string[]
  ) => Promise<string>;
  deleteComment?: (commentId: string) => Promise<void>;
  onReactionsChanged?: (
    commentId: string,
    reactions: Record<string, { userIds: string[]; userNames: string[] }>
  ) => void;
  currentUserId?: string | null;
  currentUserName?: string;
  currentUserInitial?: string;
  currentUserAvatarUrl?: string;
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
  onAssigned?: (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => void | Promise<void>;
  onPriorityChanged?: (priority: Priority | null) => void | Promise<void>;
  assigneeBusy?: boolean;
  priorityBusy?: boolean;
  canAssignTicket?: boolean;
  isWorkspaceMember?: boolean;
  animatingPinId?: string | null;
  /** Imperative handle for guarding navigation against unsaved description edits. */
  actionItemsRef?: Ref<ActionItemsSectionHandle>;
}

function ExecutionViewInner({
  item,
  resolveAffirmationKey = 0,
  onSaveTitle,
  onResolvedChange,
  onSaveDescription,
  onSaveTags,
  setIsImageExpanded,
  onEdit,
  canEdit,
  onToggleActivity,
  isActivityPanelOpen = false,
  isCommentMode = false,
  onTogglePinMode,
  onExitCommentMode,
  highlightedCommentId,
  resolveSubmitting = false,
  impactScore,
  comments = [],
  loadingComments = false,
  sendPinComment,
  sendReply,
  sendComment,
  deleteComment,
  onReactionsChanged,
  currentUserId = null,
  currentUserName,
  currentUserInitial,
  currentUserAvatarUrl,
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
  assigneeBusy = false,
  priorityBusy = false,
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
        onToggleActivity={
          isPublicReadOnly || isShareSurface ? undefined : onToggleActivity
        }
        isActivityPanelOpen={isActivityPanelOpen}
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
        assigneeBusy={assigneeBusy}
        priority={(displayItem as { priority?: string | null } | null)?.priority as ("high" | "medium" | "low" | null) ?? null}
        onPriorityChanged={(!isPublicReadOnly && !isShareSurface) ? onPriorityChanged : undefined}
        priorityBusy={priorityBusy}
        canAssignTicket={canAssignTicket}
        isWorkspaceMember={isWorkspaceMember}
      />

      <div
        className="main-content flex-1 min-h-0 overflow-y-auto pr-4"
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
              onTogglePinMode={
                !isPublicReadOnly && !isShareSurface ? onTogglePinMode : undefined
              }
              onExitCommentMode={
                !isPublicReadOnly && !isShareSurface ? onExitCommentMode : undefined
              }
              highlightedCommentId={highlightedCommentId}
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
              loadingComments={loadingComments}
              sendComment={isPublicReadOnly || isShareSurface ? undefined : sendComment}
              sendReply={isPublicReadOnly || isShareSurface ? undefined : sendReply}
              deleteComment={isPublicReadOnly || isShareSurface ? undefined : deleteComment}
              onReactionsChanged={isPublicReadOnly || isShareSurface ? undefined : onReactionsChanged}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserInitial={currentUserInitial}
              currentUserAvatarUrl={currentUserAvatarUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const ExecutionView = memo(ExecutionViewInner);
