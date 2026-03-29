"use client";

import React, { useEffect, useState } from "react";
import {
  statusFromResolved,
  type FeedbackStatus,
} from "@/lib/domain/feedback-display";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import type { ShareSurfacePermissions } from "@/lib/access/resolveAccess";
import {
  CheckCircle,
  UserPlus,
  Clock,
  MessageSquare,
  Trash2,
} from "lucide-react";

const iconBtn = {
  size: 16,
  strokeWidth: 1.8,
  className: "shrink-0 text-inherit",
} as const;

const resolveBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-lg text-[13px] font-medium border border-transparent bg-[#2563EB] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 transition-all duration-150 ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const secondaryBtn =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-lg text-[13px] font-medium border border-[#E7ECF2] bg-[#FAFBFC] text-[#374151] hover:bg-[#F1F4F8] hover:border-[#DCE4EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

const btnDelete =
  "inline-flex h-9 items-center gap-1.5 px-3.5 rounded-lg text-[13px] font-medium border border-[#E7ECF2] bg-[#FAFBFC] text-[#374151] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FECACA] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium";
  if (status === "Resolved") {
    return (
      <span className={`${base} bg-[#ECFDF5] text-[#059669]`}>Resolved</span>
    );
  }
  if (status === "Open") {
    return (
      <span className={`${base} bg-[#EFF6FF] text-[#2563EB]`}>Open</span>
    );
  }
  const styles: Record<Exclude<FeedbackStatus, "Open" | "Resolved">, string> = {
    "In Progress": "bg-[#F3F4F6] text-[#374151]",
    Blocked: "bg-[#FEF2F2] text-[#B91C1C]",
  };
  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}

export interface SessionFeedbackHeaderProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  /** Increment when resolve is applied optimistically; drives a short status cue. */
  resolveAffirmationKey?: number;
  impactScore?: number | null;
  onResolvedChange?: (isResolved: boolean) => void;
  onResolveAndNext?: () => void;
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
      action: "resolve" | "resolve_next" | "comment" | "assign" | "defer";
    }) => void;
  };
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
  onResolveAndNext,
  onOpenComment,
  onCloseCommentMode,
  isCommentMode = false,
  onDelete,
  readOnly = false,
  readOnlyPermissions,
  shareGating,
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

  const gateResolveNext = () => {
    if (!shareGating || isResolved) return;
    const { permissions, onBlocked } = shareGating;
    if (!permissions.canResolve) onBlocked({ reason: "tier", action: "resolve_next" });
    else onBlocked({ reason: "app", action: "resolve_next" });
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
      <div className="flex items-start justify-between gap-3 min-w-0 mb-3">
        <div className="min-w-0 flex-1">
          {titleTrim ? (
            <h1
              className="text-[29px] font-semibold tracking-[-0.35px] text-[#0A0A0A] truncate leading-tight"
              title={titleTrim}
            >
              {titleTrim}
            </h1>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {positionLabel != null ? (
              <span className="ticket-pill inline-flex items-center bg-[#F4F6F8] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#4B5563]">
                {positionLabel}
              </span>
            ) : null}
            {item != null ? (
              <span
                className={`inline-flex transition-all duration-200 ease-out ${
                  resolveFlash && isResolved
                    ? "scale-105 opacity-100 ring-2 ring-emerald-300/70 ring-offset-2 ring-offset-white rounded-full"
                    : "scale-100 opacity-100"
                }`}
              >
                <StatusBadge status={status} />
              </span>
            ) : null}
            {item != null && impactScore != null ? (
              <span className="text-[11px] tabular-nums text-[#94A3B8] font-medium">
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
                <button type="button" className={secondaryBtn} onClick={gateAssign}>
                  <UserPlus {...iconBtn} aria-hidden />
                  Assign
                </button>
                <button type="button" className={secondaryBtn} onClick={gateDefer}>
                  <Clock {...iconBtn} aria-hidden />
                  Defer
                </button>
                {!isResolved && (
                  <button type="button" onClick={gateResolveNext} className={secondaryBtn}>
                    <CheckCircle {...iconBtn} aria-hidden />
                    Resolve &amp; Next
                  </button>
                )}
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
                ) : null}
              </>
            ) : null
          ) : isActionable ? (
            <>
              {onResolvedChange ? (
                <button
                  type="button"
                  onClick={() => onResolvedChange(true)}
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
              ) : null}
              <button type="button" className={secondaryBtn}>
                <UserPlus {...iconBtn} aria-hidden />
                Assign
              </button>
              <button type="button" className={secondaryBtn}>
                <Clock {...iconBtn} aria-hidden />
                Defer
              </button>
              {onResolveAndNext && !isResolved ? (
                <button type="button" onClick={onResolveAndNext} className={secondaryBtn}>
                  <CheckCircle {...iconBtn} aria-hidden />
                  Resolve &amp; Next
                </button>
              ) : null}
              {onOpenComment ? (
                <button
                  type="button"
                  onClick={() =>
                    isCommentMode ? onCloseCommentMode?.() : onOpenComment()
                  }
                  className={`${secondaryBtn} ${
                    isCommentMode ? "bg-[#F3F4F6] border-[#D1D5DB] text-[#111827]" : ""
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
              title="Delete"
            >
              <Trash2 {...iconBtn} aria-hidden />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
