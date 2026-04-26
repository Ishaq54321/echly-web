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
  Flag,
} from "lucide-react";
import { AssignDropdown } from "@/components/feedback/AssignDropdown";
import { PriorityDropdown } from "@/components/feedback/PriorityDropdown";

const iconBtn = {
  size: 16,
  strokeWidth: 1.8,
  className: "shrink-0 text-inherit",
} as const;

const resolveBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand)] text-white shadow-[0_1px_3px_rgba(23,117,224,0.2)] hover:bg-[var(--brand-hover)] hover:shadow-[0_2px_6px_rgba(23,117,224,0.25)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const requestResolveAccessBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[var(--radius-sm)] text-[15px] font-medium border border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand)] shadow-none hover:bg-[var(--brand-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/40 transition-all duration-150 ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

// Blue variant for AUTH VIEWER on the dashboard surface
const requestResolveAccessBtnOrange =
  "inline-flex h-9 items-center gap-1.5 px-[14px] rounded-[var(--radius-sm)] text-[15px] font-semibold border-none bg-[var(--brand)] text-white shadow-[0_1px_3px_rgba(23,117,224,0.25)] hover:bg-[var(--brand-hover)] hover:shadow-[0_2px_8px_rgba(23,117,224,0.30)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/40 transition-all duration-[140ms] ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const pendingResolveAccessBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[var(--radius-sm)] text-[15px] font-medium border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-tertiary)] cursor-default opacity-95 pointer-events-none select-none";

const secondaryBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[var(--radius-sm)] text-[15px] font-medium border border-[var(--border)] bg-white text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:border-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

const ghostIconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors cursor-pointer";

const btnDelete =
  "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer";

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
      <span className={`${base} bg-[var(--brand-subtle)] text-[var(--brand)]`}>Open</span>
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
    <header className="sticky top-0 z-20 shrink-0 bg-[var(--surface-subtle)] pt-4 px-0 pb-0">
      <div className="flex items-start justify-between gap-4 min-w-0 mb-6">
        {/* Left: title + meta */}
        <div className="min-w-0 flex-1">
          {titleTrim ? (
            <h1
              className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--text-heading)] leading-[1.3]"
            >
              {titleTrim}
            </h1>
          ) : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {positionLabel != null ? (
              <span className="ticket-pill inline-flex items-center bg-[var(--surface-subtle)] px-2.5 py-0.5 rounded-full text-[14px] font-medium text-[var(--text-secondary)]">
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
              <span className="text-[14px] tabular-nums text-[var(--text-secondary)] font-medium">
                Impact {impactScore}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pt-1.5">
          {shareGating ? (
            isActionable ? (
              <>
                {shareGating.permissions.canResolve ? (
                  <button
                    type="button"
                    onClick={gateResolve}
                    disabled={isResolved}
                    title={isResolved ? "Unresolve" : "Resolve"}
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : resolveBtn
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
                  </button>
                ) : shareGating.onRequestResolveAccess ? (
                  isResolved ? (
                    <button
                      type="button"
                      disabled
                      title="Resolved"
                      className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle {...iconBtn} aria-hidden />
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
                    title={isResolved ? "Unresolve" : "Resolve"}
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : resolveBtn
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
                  </button>
                )}
                <button type="button" className={ghostIconBtn} onClick={gateAssign} aria-label="Assign">
                  <UserPlus {...iconBtn} aria-hidden />
                </button>
                <button type="button" className={ghostIconBtn} onClick={gateDefer} aria-label="Priority">
                  <Flag size={16} strokeWidth={1.8} className="shrink-0" aria-hidden />
                </button>
                <button type="button" className={ghostIconBtn} onClick={gateComment} aria-label="Comment">
                  <MessageSquare {...iconBtn} aria-hidden />
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
                  </button>
                ) : accessResolve != null ? (
                  isResolved ? (
                    <button
                      type="button"
                      disabled
                      title="Resolved"
                      className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle {...iconBtn} aria-hidden />
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
                    className={`${ghostIconBtn} opacity-60 cursor-not-allowed`}
                    aria-label="Comment"
                  >
                    <MessageSquare {...iconBtn} aria-hidden />
                  </button>
                ) : isAnonymousViewer ? (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/login?returnUrl=${encodeURIComponent(
                        window.location.pathname + window.location.search
                      )}`;
                    }}
                    className={ghostIconBtn}
                    aria-label="Sign in to comment"
                  >
                    <MessageSquare {...iconBtn} aria-hidden />
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
                    iconOnly
                  />
                )}
                {item && priority && (
                  <PriorityDropdown
                    feedbackId={item.id}
                    currentPriority={priority}
                    onPriorityChanged={() => {}}
                    disabled={true}
                    readOnly={true}
                    iconOnly
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
                      title="Resolved"
                      className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <CheckCircle {...iconBtn} aria-hidden />
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
                    title={isResolved ? "Resolved" : "Resolve"}
                    className={
                      isResolved
                        ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                        : resolveBtn
                    }
                  >
                    <CheckCircle {...iconBtn} aria-hidden />
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
                    iconOnly
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
                    iconOnly
                  />
                );
              })()}
              {onOpenComment ? (
                <button
                  type="button"
                  onClick={() =>
                    isCommentMode ? onCloseCommentMode?.() : onOpenComment()
                  }
                  className={`${ghostIconBtn} ${
                    isCommentMode ? "bg-[var(--surface-subtle)] text-[var(--text-heading)]" : ""
                  }`}
                  aria-label="Comment"
                >
                  <MessageSquare {...iconBtn} aria-hidden />
                </button>
              ) : null}
              {onDelete ? (
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
                    className="shrink-0 text-inherit"
                  />
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
