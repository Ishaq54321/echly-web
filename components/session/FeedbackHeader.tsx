"use client";

import React, { useEffect, useState } from "react";
import {
  statusFromResolved,
  type FeedbackStatus,
} from "@/lib/domain/feedback-display";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import type { ShareSurfacePermissions } from "@/lib/access/resolveAccess";
import type { Priority } from "@/lib/domain/feedback";
import {
  Check,
  UserPlus,
  Clock,
  MessageSquare,
  Lock,
  Flag,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { AssignDropdown } from "@/components/feedback/AssignDropdown";
import { PriorityDropdown } from "@/components/feedback/PriorityDropdown";
import { Tooltip } from "@/components/ui/Tooltip";

const actionBtn =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const actionBtnBlack =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] bg-[var(--brand)] text-white text-[13px] font-medium border border-[var(--brand)] cursor-pointer hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:pointer-events-none";

const actionBtnActive =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-heading)] text-[13px] font-medium transition-all cursor-pointer";

const actionBtnDelete =
  "inline-flex h-[34px] w-[34px] items-center justify-center rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-bg)] transition-all cursor-pointer";

// Resize AssignDropdown/PriorityDropdown trigger buttons to match action row height
const dropdownBtnOverride =
  "[&>div>button]:!h-[34px] [&>div>button]:!rounded-[7px] [&>div>button]:!text-[13px] [&>div>button]:!font-medium [&>div>button]:!px-3.5 [&>div>button]:!gap-2 [&>div>button]:!border [&>div>button]:!border-[var(--border)]";

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold tracking-[-0.005em]";
  if (status === "Resolved") {
    return (
      <span className={`${base} bg-[var(--color-success-bg)] text-[var(--color-success)]`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
        Resolved
      </span>
    );
  }
  if (status === "Open") {
    return (
      <span className={`${base} bg-[var(--brand-subtle)] text-[var(--brand)]`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
        Open
      </span>
    );
  }
  const styles: Record<Exclude<FeedbackStatus, "Open" | "Resolved">, string> = {
    "In Progress": "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    Blocked: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  };
  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}

export interface SessionFeedbackHeaderProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  resolveAffirmationKey?: number;
  impactScore?: number | null;
  onResolvedChange?: (isResolved: boolean) => void;
  resolveSubmitting?: boolean;
  onOpenComment?: () => void;
  onCloseCommentMode?: () => void;
  isCommentMode?: boolean;
  onDelete?: () => void;
  readOnly?: boolean;
  readOnlyPermissions?: { canResolve: boolean; canComment: boolean };
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
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  onAssigned?: (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => void;
  priority?: Priority | null;
  onPriorityChanged?: (priority: Priority | null) => void;
  onSaveStateChange?: (state: 'saving' | 'saved' | 'error' | 'hidden') => void;
  canAssignTicket?: boolean;
  isWorkspaceMember?: boolean;
}

export function SessionFeedbackHeader({
  item,
  resolveAffirmationKey = 0,
  impactScore,
  onResolvedChange,
  resolveSubmitting = false,
  onOpenComment,
  onCloseCommentMode,
  isCommentMode = false,
  onDelete,
  readOnly = false,
  readOnlyPermissions,
  shareGating,
  accessResolve,
  accessResolveSubmitting = false,
  isAnonymousViewer = false,
  assigneeId,
  assigneeName,
  assigneeAvatarUrl,
  onAssigned,
  priority,
  onPriorityChanged,
  onSaveStateChange,
  canAssignTicket = false,
  isWorkspaceMember = false,
}: SessionFeedbackHeaderProps) {
  const [resolveFlash, setResolveFlash] = useState(false);
  useEffect(() => {
    if (resolveAffirmationKey <= 0) return;
    setResolveFlash(true);
    const t = window.setTimeout(() => setResolveFlash(false), 420);
    return () => window.clearTimeout(t);
  }, [resolveAffirmationKey]);

  const isResolved = item?.isResolved === true;
  const status = statusFromResolved(item?.isResolved);
  const ro = readOnly === true && readOnlyPermissions != null && shareGating == null;
  const titleTrim = item?.title?.trim() ?? "";
  const showPosition =
    item != null &&
    typeof item.index === "number" &&
    typeof item.total === "number" &&
    item.total >= 0 &&
    item.index >= 1;
  const positionLabel = showPosition ? `${item.index} of ${item.total}` : null;

  const isActionable =
    item != null &&
    Boolean(item.id?.trim()) &&
    Boolean(item.type?.trim());

  const gateResolve = () => {
    if (!shareGating || isResolved) return;
    const { permissions, onBlocked } = shareGating;
    if (!permissions.canResolve) onBlocked({ reason: "tier", action: "resolve" });
    else onBlocked({ reason: "app", action: "resolve" });
  };

  const gateComment = () => {
    if (!shareGating) return;
    const { permissions, onBlocked } = shareGating;
    if (!permissions.canComment) onBlocked({ reason: "tier", action: "comment" });
    else onBlocked({ reason: "app", action: "comment" });
  };

  const gateAssign = () => {
    if (!shareGating) return;
    const { permissions, onBlocked } = shareGating;
    if (!permissions.canAssign) onBlocked({ reason: "tier", action: "assign" });
    else onBlocked({ reason: "app", action: "assign" });
  };

  const gateDefer = () => {
    if (!shareGating) return;
    const { permissions, onBlocked } = shareGating;
    if (!permissions.canDefer) onBlocked({ reason: "tier", action: "defer" });
    else onBlocked({ reason: "app", action: "defer" });
  };

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-[var(--surface-card)] pt-0 px-0 pb-0">
      <div className="mb-6">
        {/* Row 1: Eyebrow */}
        <div className="flex items-center gap-2.5 mb-3">
          {positionLabel != null ? (
            <span className="text-[11.5px] font-medium text-[var(--text-secondary)] bg-[var(--surface-hover)] px-2.5 py-[3px] rounded-full tabular-nums">
              {positionLabel}
            </span>
          ) : null}
          {item != null ? (
            <span
              className={`inline-flex transition-all duration-200 ease-out ${
                resolveFlash && isResolved
                  ? "scale-105 opacity-100 ring-2 ring-[var(--color-success-border)] ring-offset-2 ring-offset-white rounded-full"
                  : "scale-100 opacity-100"
              }`}
            >
              <StatusBadge status={status} />
            </span>
          ) : null}
          {item != null && impactScore != null ? (
            <span className="text-[11.5px] tabular-nums text-[var(--text-secondary)] font-medium">
              Impact {impactScore}
            </span>
          ) : null}
        </div>

        {/* Row 2: Title */}
        {titleTrim ? (
          <h1 className="text-[21px] font-semibold text-[var(--text-heading)] tracking-[-0.018em] leading-[1.25] m-0 mb-4">
            {titleTrim}
          </h1>
        ) : null}

        {/* Row 3: Action buttons */}
        <div className="flex items-center gap-2">
          {shareGating ? (
            isActionable ? (
              <>
                {/* Resolve */}
                {shareGating.permissions.canResolve ? (
                  <button
                    type="button"
                    onClick={gateResolve}
                    disabled={isResolved}
                    className={isResolved ? actionBtnActive : actionBtnBlack}
                  >
                    <Check size={14} strokeWidth={1.7} />
                    {isResolved ? "Resolved" : "Resolve"}
                  </button>
                ) : shareGating.onRequestResolveAccess ? (
                  isResolved ? (
                    <button type="button" disabled className={`${actionBtnActive} opacity-50`}>
                      <Check size={14} strokeWidth={1.7} />
                      Resolved
                    </button>
                  ) : shareGating.pendingResolve ? (
                    <button type="button" disabled className={`${actionBtn} opacity-60`}>
                      <Clock size={14} strokeWidth={1.5} />
                      Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={shareGating.onRequestResolveAccess}
                      disabled={accessResolveSubmitting}
                      className={actionBtnBlack}
                    >
                      <Lock size={14} />
                      Request Access
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={gateResolve}
                    disabled={isResolved}
                    className={isResolved ? actionBtnActive : actionBtnBlack}
                  >
                    <Check size={14} strokeWidth={1.7} />
                    {isResolved ? "Resolved" : "Resolve"}
                  </button>
                )}
                {/* Assign */}
                <button type="button" className={actionBtn} onClick={gateAssign}>
                  <UserPlus size={14} strokeWidth={1.5} />
                  Assign
                </button>
                {/* Priority */}
                <button type="button" className={actionBtn} onClick={gateDefer}>
                  <Flag size={14} strokeWidth={1.5} />
                  Priority
                </button>
                {/* Comment */}
                <button type="button" className={actionBtn} onClick={gateComment}>
                  <MessageSquare size={14} strokeWidth={1.5} />
                  Comment
                </button>
              </>
            ) : null
          ) : ro ? (
            isActionable ? (
              <>
                {/* Resolve (read-only) */}
                {readOnlyPermissions?.canResolve ? (
                  <button
                    type="button"
                    disabled
                    className={`${actionBtnBlack} opacity-60 cursor-not-allowed`}
                  >
                    <Check size={14} strokeWidth={1.7} />
                    Resolve
                  </button>
                ) : accessResolve != null ? (
                  isResolved ? (
                    <button type="button" disabled className={`${actionBtnActive} opacity-50`}>
                      <Check size={14} strokeWidth={1.7} />
                      Resolved
                    </button>
                  ) : accessResolve.pendingResolve ? (
                    <button type="button" disabled className={`${actionBtn} opacity-60`}>
                      <Clock size={14} strokeWidth={1.5} />
                      Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={accessResolve.onRequestAccess}
                      disabled={accessResolveSubmitting}
                      className={actionBtnBlack}
                    >
                      <Lock size={14} />
                      Request Access
                    </button>
                  )
                ) : null}
                {/* Comment (read-only) */}
                {readOnlyPermissions?.canComment ? (
                  <button
                    type="button"
                    disabled
                    className={`${actionBtn} opacity-60 cursor-not-allowed`}
                  >
                    <MessageSquare size={14} strokeWidth={1.5} />
                    Comment
                  </button>
                ) : isAnonymousViewer ? (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/login?returnUrl=${encodeURIComponent(
                        window.location.pathname + window.location.search
                      )}`;
                    }}
                    className={actionBtn}
                  >
                    <MessageSquare size={14} strokeWidth={1.5} />
                    Comment
                  </button>
                ) : null}
                {/* Assign (read-only dropdown) */}
                {item && assigneeId && (
                  <div className={dropdownBtnOverride}>
                    <AssignDropdown
                      feedbackId={item.id}
                      sessionId={""}
                      currentAssigneeId={assigneeId}
                      currentAssigneeName={assigneeName ?? null}
                      currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                      onAssigned={() => {}}
                      disabled={true}
                      readOnly={true}
                      iconOnly
                    />
                  </div>
                )}
                {/* Priority (read-only dropdown) */}
                {item && priority && (
                  <div className={dropdownBtnOverride}>
                    <PriorityDropdown
                      feedbackId={item.id}
                      currentPriority={priority}
                      onPriorityChanged={() => {}}
                      disabled={true}
                      readOnly={true}
                      iconOnly
                    />
                  </div>
                )}
              </>
            ) : null
          ) : isActionable ? (
            <>
              {/* Resolve */}
              {onResolvedChange ? (
                accessResolve != null && !accessResolve.canResolve ? (
                  isResolved ? (
                    <button type="button" disabled className={`${actionBtnActive} opacity-50`}>
                      <Check size={14} strokeWidth={1.7} />
                      Resolved
                    </button>
                  ) : accessResolve.pendingResolve ? (
                    <button type="button" disabled className={`${actionBtn} opacity-60`}>
                      <Clock size={14} strokeWidth={1.5} />
                      Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={accessResolve.onRequestAccess}
                      disabled={accessResolveSubmitting}
                      className={actionBtnBlack}
                    >
                      <Lock size={14} />
                      Request Access
                    </button>
                  )
                ) : isResolved ? (
                  <button
                    type="button"
                    onClick={() => onResolvedChange(false)}
                    disabled={resolveSubmitting}
                    className="inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] text-[13px] font-medium border border-[var(--border)] bg-transparent text-[var(--text-heading)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <RotateCcw size={14} strokeWidth={1.7} />
                    Reopen
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onResolvedChange(true)}
                    disabled={resolveSubmitting}
                    className={actionBtnBlack}
                  >
                    <Check size={14} strokeWidth={1.7} />
                    Resolve
                  </button>
                )
              ) : null}
              {/* Assign — only render if the user can actually manage it */}
              {item && !isAnonymousViewer && canAssignTicket && isWorkspaceMember && onAssigned ? (
                <div className={dropdownBtnOverride}>
                  <AssignDropdown
                    key={`assign-${item.id}`}
                    feedbackId={item.id}
                    sessionId={""}
                    currentAssigneeId={assigneeId ?? null}
                    currentAssigneeName={assigneeName ?? null}
                    currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                    onAssigned={onAssigned}
                    onSaveStateChange={onSaveStateChange}
                    iconOnly
                  />
                </div>
              ) : null}
              {/* Priority — only render if the user can actually manage it */}
              {item && !isAnonymousViewer && isWorkspaceMember && onPriorityChanged ? (
                <div className={dropdownBtnOverride}>
                  <PriorityDropdown
                    key={`priority-${item.id}`}
                    feedbackId={item.id}
                    currentPriority={priority ?? null}
                    onPriorityChanged={onPriorityChanged}
                    onSaveStateChange={onSaveStateChange}
                    iconOnly
                  />
                </div>
              ) : null}
              {/* Comment */}
              {onOpenComment ? (
                <button
                  type="button"
                  onClick={() => isCommentMode ? onCloseCommentMode?.() : onOpenComment()}
                  className={isCommentMode ? actionBtnActive : actionBtn}
                >
                  <MessageSquare size={14} strokeWidth={1.5} />
                  Comment
                </button>
              ) : null}
              {/* Spacer */}
              <div className="flex-1" />
              {/* Delete */}
              {onDelete ? (
                <Tooltip content="Delete">
                  <button
                    type="button"
                    onClick={onDelete}
                    className={actionBtnDelete}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </Tooltip>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
