"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  statusFromResolved,
  type FeedbackStatus,
} from "@/lib/domain/feedback-display";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import type { ShareSurfacePermissions } from "@/lib/access/resolveAccess";
import type { Priority } from "@/lib/domain/feedback";
import {
  CalendarCheck2,
  Check,
  Clock,
  Lock,
  Trash2,
  RotateCcw,
  PencilLine,
} from "lucide-react";
import { AssignDropdown } from "@/components/feedback/AssignDropdown";
import { PriorityDropdown } from "@/components/feedback/PriorityDropdown";
import { Tooltip } from "@/components/ui/Tooltip";

const actionBtn =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const actionBtnBlack =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] bg-[var(--brand)] text-white text-[13px] font-medium border border-[var(--brand)] cursor-pointer hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:pointer-events-none";

const actionBtnResolve =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] bg-[var(--brand-subtle)] text-[var(--brand)] text-[13px] font-medium border border-[var(--brand-subtle)] cursor-pointer hover:bg-[var(--brand-muted)] transition-colors disabled:opacity-50 disabled:pointer-events-none";

const actionBtnActive =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-heading)] text-[13px] font-medium transition-all cursor-pointer";

const actionBtnDelete =
  "inline-flex h-[34px] w-[34px] items-center justify-center rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-bg)] transition-all cursor-pointer";

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
  /**
   * Toggles the activity rail (history timeline). Phase 26.8: a
   * single click opens it, a second click closes it. Phase 26.7
   * removed pin-placement from this button — that moved to the
   * MapPin action on the screenshot. See ScreenshotWithPins.
   */
  onToggleActivity?: () => void;
  /** Reflects panel open state so the button can show a pressed style. */
  isActivityPanelOpen?: boolean;
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
  onAssigned?: (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => void | Promise<void>;
  assigneeBusy?: boolean;
  priority?: Priority | null;
  onPriorityChanged?: (priority: Priority | null) => void | Promise<void>;
  priorityBusy?: boolean;
  canAssignTicket?: boolean;
  isWorkspaceMember?: boolean;
  onSaveTitle?: (newTitle: string) => Promise<void>;
}

export function SessionFeedbackHeader({
  item,
  resolveAffirmationKey = 0,
  impactScore,
  onResolvedChange,
  resolveSubmitting = false,
  onToggleActivity,
  isActivityPanelOpen = false,
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
  assigneeBusy = false,
  priority,
  onPriorityChanged,
  priorityBusy = false,
  canAssignTicket = false,
  isWorkspaceMember = false,
  onSaveTitle,
}: SessionFeedbackHeaderProps) {
  const [resolveFlash, setResolveFlash] = useState(false);
  useEffect(() => {
    if (resolveAffirmationKey <= 0) return;
    setResolveFlash(true);
    const t = window.setTimeout(() => setResolveFlash(false), 420);
    return () => window.clearTimeout(t);
  }, [resolveAffirmationKey]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-[var(--surface)] pt-0 px-0 pb-0">
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
        {titleTrim || isEditingTitle ? (
          isEditingTitle && onSaveTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === "Escape") {
                  setIsEditingTitle(false);
                  setTitleDraft("");
                }
              }}
              onBlur={async () => {
                const trimmed = titleDraft.trim();
                if (trimmed && trimmed !== titleTrim) {
                  try {
                    await onSaveTitle(trimmed);
                  } catch {
                    // rollback handled by saveTitle in SessionPageClient
                  }
                }
                setIsEditingTitle(false);
              }}
              className="w-full text-[21px] font-semibold text-[var(--text-heading)] tracking-[-0.018em] leading-[1.25] m-0 mb-4 bg-transparent border-none outline-none ring-0 focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 rounded-md px-1 -ml-1"
              autoFocus
            />
          ) : (
            <div
              className="group flex items-start gap-0 hover:gap-3 mb-4 transition-all duration-150"
              onClick={() => {
                if (!onSaveTitle) return;
                setTitleDraft(titleTrim);
                setIsEditingTitle(true);
                requestAnimationFrame(() => {
                  titleInputRef.current?.focus();
                  titleInputRef.current?.select();
                });
              }}
              role={onSaveTitle ? "button" : undefined}
              style={onSaveTitle ? { cursor: "pointer" } : undefined}
            >
              {onSaveTitle && (
                <PencilLine
                  size={16}
                  strokeWidth={2}
                  className="mt-[5px] shrink-0 text-[var(--brand)] opacity-0 group-hover:opacity-60 w-0 group-hover:w-4 overflow-hidden transition-all duration-150"
                />
              )}
              <h1
                className={`text-[21px] font-semibold tracking-[-0.018em] leading-[1.25] m-0 transition-colors duration-150 ${
                  onSaveTitle ? "group-hover:text-[var(--brand)] text-[var(--text-heading)]" : "text-[var(--text-heading)]"
                }`}
              >
                {titleTrim}
              </h1>
            </div>
          )
        ) : null}

        {/* Row 3: Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {shareGating ? (
            isActionable ? (
              <>
                {/* Resolve */}
                {shareGating.permissions.canResolve ? (
                  <button
                    type="button"
                    onClick={gateResolve}
                    disabled={isResolved}
                    className={isResolved ? actionBtnActive : actionBtnResolve}
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
                    className={isResolved ? actionBtnActive : actionBtnResolve}
                  >
                    <Check size={14} strokeWidth={1.7} />
                    {isResolved ? "Resolved" : "Resolve"}
                  </button>
                )}
                {/* Assign — only when set, read-only for view/resolve viewers */}
                {item && assigneeId ? (
                  <div>
                    <AssignDropdown
                      feedbackId={item.id}
                      sessionId={""}
                      currentAssigneeId={assigneeId}
                      currentAssigneeName={assigneeName ?? null}
                      currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                      onAssigned={() => {}}
                      disabled={true}
                      readOnly={true}
                      iconOnly={false}
                    />
                  </div>
                ) : null}
                {/* Priority — only when set, read-only for view/resolve viewers */}
                {item && priority ? (
                  <div>
                    <PriorityDropdown
                      feedbackId={item.id}
                      currentPriority={priority}
                      onPriorityChanged={() => {}}
                      disabled={true}
                      readOnly={true}
                      iconOnly={false}
                    />
                  </div>
                ) : null}
                {/* Activity button removed — share-gated viewers don't see Activity */}
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
                {/* Activity button removed — view-only viewers don't see Activity */}
                {/* Assign (read-only dropdown) */}
                {item && assigneeId && (
                  <div>
                    <AssignDropdown
                      feedbackId={item.id}
                      sessionId={""}
                      currentAssigneeId={assigneeId}
                      currentAssigneeName={assigneeName ?? null}
                      currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                      onAssigned={() => {}}
                      disabled={true}
                      readOnly={true}
                      iconOnly={false}
                    />
                  </div>
                )}
                {/* Priority (read-only dropdown) */}
                {item && priority && (
                  <div>
                    <PriorityDropdown
                      feedbackId={item.id}
                      currentPriority={priority}
                      onPriorityChanged={() => {}}
                      disabled={true}
                      readOnly={true}
                      iconOnly={false}
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
                    className={actionBtnResolve}
                  >
                    <Check size={14} strokeWidth={1.7} />
                    Resolve
                  </button>
                )
              ) : null}
              {/* Assign — manage when workspace member, read-only fallback for cross-workspace authed viewers */}
              {item && !isAnonymousViewer && canAssignTicket && isWorkspaceMember && onAssigned ? (
                <div>
                  <AssignDropdown
                    key={`assign-${item.id}`}
                    feedbackId={item.id}
                    sessionId={""}
                    currentAssigneeId={assigneeId ?? null}
                    currentAssigneeName={assigneeName ?? null}
                    currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                    onAssigned={onAssigned}
                    busy={assigneeBusy}
                    iconOnly
                  />
                </div>
              ) : item && !isAnonymousViewer && !isWorkspaceMember && assigneeId ? (
                <div>
                  <AssignDropdown
                    feedbackId={item.id}
                    sessionId={""}
                    currentAssigneeId={assigneeId}
                    currentAssigneeName={assigneeName ?? null}
                    currentAssigneeAvatarUrl={assigneeAvatarUrl ?? null}
                    onAssigned={() => {}}
                    disabled={true}
                    readOnly={true}
                    iconOnly={false}
                  />
                </div>
              ) : null}
              {/* Priority — manage when workspace member, read-only fallback for cross-workspace authed viewers */}
              {item && !isAnonymousViewer && isWorkspaceMember && onPriorityChanged ? (
                <div>
                  <PriorityDropdown
                    key={`priority-${item.id}`}
                    feedbackId={item.id}
                    currentPriority={priority ?? null}
                    onPriorityChanged={onPriorityChanged}
                    busy={priorityBusy}
                    iconOnly
                  />
                </div>
              ) : item && !isAnonymousViewer && !isWorkspaceMember && priority ? (
                <div>
                  <PriorityDropdown
                    feedbackId={item.id}
                    currentPriority={priority}
                    onPriorityChanged={() => {}}
                    disabled={true}
                    readOnly={true}
                    iconOnly={false}
                  />
                </div>
              ) : null}
              {/* Activity — toggle (Phase 26.8): click opens, click again closes */}
              {onToggleActivity ? (
                <button
                  type="button"
                  onClick={onToggleActivity}
                  className={isActivityPanelOpen ? actionBtnActive : actionBtn}
                  aria-pressed={isActivityPanelOpen}
                  aria-label={isActivityPanelOpen ? "Close activity panel" : "Open activity panel"}
                >
                  <CalendarCheck2
                    size={14}
                    strokeWidth={1.5}
                    className={isActivityPanelOpen ? "text-[var(--orange)]" : undefined}
                  />
                  Activity
                </button>
              ) : null}
              {/* Spacer */}
              <div className="flex-1" />
              {/* Delete — wrapped in a flex box so the Tooltip's
                  inline-flex anchor becomes a block-level flex item
                  that items-center aligns on the row baseline (Phase
                  26.8: fixes the trash icon sitting ~2px high). */}
              {onDelete ? (
                <div className="flex items-center">
                  <Tooltip content="Delete">
                    <button
                      type="button"
                      onClick={onDelete}
                      className={actionBtnDelete}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
