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
  CheckCircle,
  UserPlus,
  Clock,
  MessageSquare,
  Trash2,
  Lock,
  Minus,
} from "lucide-react";
import { AssignDropdown } from "@/components/feedback/AssignDropdown";
import { PriorityDropdown } from "@/components/feedback/PriorityDropdown";

const iconBtn = {
  size: 16,
  strokeWidth: 1.8,
  className: "shrink-0 text-inherit",
} as const;

const resolveBtn =
  "inline-flex h-9 items-center gap-1.5 px-4 rounded-[9px] text-[14px] font-semibold border border-transparent bg-[#1775E0] text-white shadow-[0_1px_3px_rgba(23,117,224,0.25)] hover:bg-[#1462C4] hover:shadow-[0_2px_8px_rgba(23,117,224,0.30)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/40 transition-all duration-150 ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const requestResolveAccessBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[9px] text-[14px] font-medium border border-[#C3DFFE] bg-[#EBF4FF] text-[#1775E0] shadow-none hover:bg-[#EBF4FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/40 transition-all duration-150 ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

// Blue variant for AUTH VIEWER on the dashboard surface
const requestResolveAccessBtnOrange =
  "inline-flex h-9 items-center gap-1.5 px-[14px] rounded-[9px] text-[14px] font-semibold border-none bg-[#1775E0] text-white shadow-[0_1px_3px_rgba(23,117,224,0.25)] hover:bg-[#1462C4] hover:shadow-[0_2px_8px_rgba(23,117,224,0.30)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/40 transition-all duration-[140ms] ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const pendingResolveAccessBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[9px] text-[14px] font-medium border border-[#EBEBEB] bg-[#F1F2F4] text-[#A8A29E] cursor-default opacity-95 pointer-events-none select-none";

const secondaryBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[9px] text-[14px] font-medium border border-[#EBEBEB] bg-white text-[#44403C] hover:bg-[#F4F5F7] hover:border-[#D5D5D5] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

const btnDelete =
  "group inline-flex h-9 items-center px-2.5 rounded-[9px] text-[14px] font-medium border border-[#EBEBEB] bg-white text-[#44403C] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium";
  if (status === "Resolved") {
    return (
      <span className={`${base} bg-[var(--color-success-bg)] text-[var(--color-success)]`}>Resolved</span>
    );
  }
  if (status === "Open") {
    return (
      <span className={`${base} bg-[#EBF4FF] text-[#0F5BB5]`}>Open</span>
    );
  }
  const styles: Record<Exclude<FeedbackStatus, "Open" | "Resolved">, string> = {
    "In Progress": "bg-[#F1F2F4] text-[#78716C]",
    Blocked: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  };
  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}

export interface SessionFeedbackHeaderProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  /** Increment when resolve is applied optimistically; drives a short status cue. */
  resolveAffirmationKey?: number;
  impactScore?: number | null;
  onResolvedChange?: (isResolved: boolean) => void;
  resolveSubmitting?: boolean;
  onOpenComment?: () => void;
  onCloseCommentMode?: () => void;
  isCommentMode?: boolean;
  onDelete?: () => void;
  /**
   * Public share (or other read-only surfaces): show the same action row shape as the dashboard,
   * but actions are non-interactive and gated by `readOnlyPermissions`.
   */
  readOnly?: boolean;
  readOnlyPermissions?: { canResolve: boolean; canComment: boolean };
  /**
   * Public share: same action bar as dashboard; clicks respect permissions then prompt to use the app.
   * When set, `readOnly` / `readOnlyPermissions` are ignored for the action row, and Delete is hidden.
   */
  shareGating?: {
    permissions: ShareSurfacePermissions;
    onBlocked: (detail: {
      reason: "tier" | "app";
      action: "resolve" | "comment" | "assign" | "defer";
    }) => void;
    /** When set with {@link shareGating.onRequestResolveAccess}, resolve affordance follows request/pending UI. */
    pendingResolve?: boolean;
    onRequestResolveAccess?: () => void;
  };
  /**
   * Dashboard/authenticated: reflects `access.capabilities.canResolve` and `request.pendingResolve`; does not grant capability.
   */
  accessResolve?: {
    canResolve: boolean;
    pendingResolve: boolean;
    onRequestAccess: () => void;
  };
  /** True while POST /request-access is in flight (dashboard). */
  accessResolveSubmitting?: boolean;
  /** True for unauthenticated viewers; shows sign-in affordances instead of disabled buttons. */
  isAnonymousViewer?: boolean;
  /** Assign dropdown data */
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  onAssigned?: (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => void;
  /** Priority dropdown data */
  priority?: Priority | null;
  onPriorityChanged?: (priority: Priority | null) => void;
  onSaveStateChange?: (state: 'saving' | 'saved' | 'error' | 'hidden') => void;
  /** Permission gates for new controls */
  canAssignTicket?: boolean;
  isWorkspaceMember?: boolean;
}

/**
 * Premium session ticket header: title + ticket meta, status badge, action bar (Resolve / Assign / … + Delete).
 * Session-level ⋮ (rename / archive / delete) lives in TopControlBar.
 */
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
    <header className="sticky top-0 z-20 shrink-0 bg-white/95 backdrop-blur-[2px] pt-4 px-6 -mx-6 pb-0">
      <div className="flex items-start justify-between gap-3 min-w-0 mb-5">
        <div className="min-w-0 flex-1">
          {titleTrim ? (
            <h1
              className="text-[24px] font-bold tracking-[-0.4px] text-[#1C1B1F] truncate leading-tight"
              title={titleTrim}
            >
              {titleTrim}
            </h1>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {positionLabel != null ? (
              <span className="ticket-pill inline-flex items-center bg-[#F1F2F4] px-2.5 py-1 rounded-full text-xs font-medium text-[#A8A29E]">
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
              <span className="text-xs tabular-nums text-[#A8A29E] font-medium">
                Impact {impactScore}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap ${
          shareGating ? "mb-3" : "mb-5"
        }`}
      >
        <div className="left flex flex-wrap items-center gap-2.5 min-w-0">
          {shareGating ? (
            isActionable ? (
              <>
                {shareGating.permissions.canResolve ? (
                  <button
                    type="button"
                    onClick={gateResolve}
                    disabled={isResolved}
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : resolveBtn
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
                    <span>{isResolved ? "Resolved" : "Resolve"}</span>
                  </button>
                ) : shareGating.onRequestResolveAccess ? (
                  isResolved ? (
                    <button
                      type="button"
                      disabled
                      className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle {...iconBtn} aria-hidden />
                      <span>Resolved</span>
                    </button>
                  ) : shareGating.pendingResolve ? (
                    <button type="button" disabled className={pendingResolveAccessBtn}>
                      <Clock {...iconBtn} aria-hidden />
                      <span>Pending approval</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={shareGating.onRequestResolveAccess}
                      disabled={accessResolveSubmitting}
                      className={requestResolveAccessBtn}
                    >
                      <Lock {...iconBtn} aria-hidden />
                      <span>Request resolve access</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={gateResolve}
                    disabled={isResolved}
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : resolveBtn
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
                    <span>{isResolved ? "Resolved" : "Resolve"}</span>
                  </button>
                )}
                <button type="button" className={secondaryBtn} onClick={gateAssign}>
                  <UserPlus {...iconBtn} aria-hidden />
                  Assign
                </button>
                <button type="button" className={secondaryBtn} onClick={gateDefer}>
                  <Minus {...iconBtn} aria-hidden />
                  Priority
                </button>
                <button type="button" className={secondaryBtn} onClick={gateComment}>
                  <MessageSquare {...iconBtn} aria-hidden />
                  Comment
                </button>
              </>
            ) : null
          ) : ro ? (
            isActionable ? (
              <>
                {readOnlyPermissions?.canResolve ? (
                  <button
                    type="button"
                    disabled
                    title="Not available on shared links yet"
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : `${resolveBtn} opacity-60 cursor-not-allowed`
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
                    <span>{isResolved ? "Resolved" : "Resolve"}</span>
                  </button>
                ) : accessResolve != null ? (
                  isResolved ? (
                    <button
                      type="button"
                      disabled
                      className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle {...iconBtn} aria-hidden />
                      <span>Resolved</span>
                    </button>
                  ) : accessResolve.pendingResolve ? (
                    <button type="button" disabled className={pendingResolveAccessBtn}>
                      <Clock {...iconBtn} aria-hidden />
                      <span>Pending approval</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={accessResolve.onRequestAccess}
                      disabled={accessResolveSubmitting}
                      className={requestResolveAccessBtnOrange}
                    >
                      <Lock size={14} color="#FFFFFF" aria-hidden />
                      <span>Request resolve access</span>
                    </button>
                  )
                ) : null}
                {readOnlyPermissions?.canComment ? (
                  <button
                    type="button"
                    disabled
                    title="Not available on shared links yet"
                    className={`${secondaryBtn} opacity-60 cursor-not-allowed`}
                  >
                    <MessageSquare {...iconBtn} aria-hidden />
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
                    className={secondaryBtn}
                  >
                    <MessageSquare {...iconBtn} aria-hidden />
                    Sign in to comment
                  </button>
                ) : null}
                {item && assigneeId && (
                  <AssignDropdown
                    feedbackId={item.id}
                    sessionId={""}
                    currentAssigneeId={assigneeId}
                    currentAssigneeName={assigneeName ?? null}
                    currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                    onAssigned={() => {}}
                    disabled={true}
                    readOnly={true}
                  />
                )}
                {item && priority && (
                  <PriorityDropdown
                    feedbackId={item.id}
                    currentPriority={priority}
                    onPriorityChanged={() => {}}
                    disabled={true}
                    readOnly={true}
                  />
                )}
              </>
            ) : null
          ) : isActionable ? (
            // Permission table (dashboard surface):
            // OWNER     canDeleteTicket=true  canResolve=true  → accessResolve=undefined → Resolve ✅ Assign ✅ Defer ✅ Comment ✅ Delete ✅
            // RESOLVER  canResolve=true       canDeleteTicket=false → accessResolve=undefined → Resolve ✅ Assign ✅ Defer ✅ Comment ✅ Delete ❌
            // AUTH VIEWER canResolve=false    canComment=true  → accessResolve set       → 🔒Request ✅ Assign ❌ Defer ❌ Comment ✅ Delete ❌
            // ANON VIEWER canResolve=false    canComment=false → readOnly=true (ro branch above)
            <>
              {onResolvedChange ? (
                accessResolve != null && !accessResolve.canResolve ? (
                  isResolved ? (
                    <button
                      type="button"
                      disabled
                      className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle {...iconBtn} aria-hidden />
                      <span>Resolved</span>
                    </button>
                  ) : accessResolve.pendingResolve ? (
                    <button type="button" disabled className={pendingResolveAccessBtn}>
                      <Clock {...iconBtn} aria-hidden />
                      <span>Pending approval</span>
                    </button>
                  ) : (
                    // AUTH VIEWER: orange "Request resolve access" button
                    <button
                      type="button"
                      onClick={accessResolve.onRequestAccess}
                      disabled={accessResolveSubmitting}
                      className={requestResolveAccessBtnOrange}
                    >
                      <Lock size={14} color="#FFFFFF" aria-hidden />
                      <span>Request resolve access</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => onResolvedChange(true)}
                    disabled={isResolved || resolveSubmitting}
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : resolveBtn
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
                    <span>{isResolved ? "Resolved" : "Resolve"}</span>
                  </button>
                )
              ) : null}
              {/* Assign: full dropdown for workspace members, read-only chip for others */}
              {item && (() => {
                const canManage = !!(canAssignTicket &&
                                     isWorkspaceMember &&
                                     onAssigned);
                const isAnon = isAnonymousViewer === true;

                if (isAnon) return null;

                return (
                  <AssignDropdown
                    key={`assign-${item.id}`}
                    feedbackId={item.id}
                    sessionId={""}
                    currentAssigneeId={assigneeId ?? null}
                    currentAssigneeName={assigneeName ?? null}
                    currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                    onAssigned={onAssigned ?? (() => {})}
                    onSaveStateChange={canManage ? onSaveStateChange : undefined}
                    disabled={!canManage}
                    readOnly={!canManage}
                  />
                );
              })()}
              {/* Priority: full dropdown for workspace members, read-only pill for others */}
              {item && (() => {
                const canManage = !!(isWorkspaceMember &&
                                     onPriorityChanged);
                const isAnon = isAnonymousViewer === true;

                if (isAnon) return null;

                return (
                  <PriorityDropdown
                    key={`priority-${item.id}`}
                    feedbackId={item.id}
                    currentPriority={priority ?? null}
                    onPriorityChanged={onPriorityChanged ?? (() => {})}
                    onSaveStateChange={canManage ? onSaveStateChange : undefined}
                    disabled={!canManage}
                    readOnly={!canManage}
                  />
                );
              })()}
              {onOpenComment ? (
                <button
                  type="button"
                  onClick={() =>
                    isCommentMode ? onCloseCommentMode?.() : onOpenComment()
                  }
                  className={`${secondaryBtn} ${
                    isCommentMode ? "bg-[#F1F2F4] border-[#D5D5D5] text-[#1C1B1F]" : ""
                  }`}
                >
                  <MessageSquare {...iconBtn} aria-hidden />
                  Comment
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        {onDelete && !shareGating && isActionable ? (
          <div className="right shrink-0">
            <button
              type="button"
              onClick={onDelete}
              className={btnDelete}
              aria-label="Delete ticket"
              title="Delete ticket"
            >
              <Trash2
                size={16}
                strokeWidth={1.8}
                aria-hidden
                className="shrink-0 text-inherit transition-all duration-150 group-hover:w-0 group-hover:opacity-0 group-hover:overflow-hidden"
              />
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-150 ease group-hover:max-w-[100px] group-hover:opacity-100 pr-1 pl-0.5">
                Delete ticket
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
