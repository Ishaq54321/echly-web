"use client";

import React from "react";
import {
  statusFromResolved,
  type FeedbackStatus,
} from "@/lib/domain/feedback-display";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
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
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium border border-transparent bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 transition-all duration-150 ease cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

const secondaryBtn =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:bg-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

const btnDelete =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FECACA] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease cursor-pointer";

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
  item: FeedbackItemShape & { index: number; total: number };
  impactScore?: number | null;
  onResolvedChange?: (isResolved: boolean) => void;
  onResolveAndNext?: () => void;
  onOpenComment?: () => void;
  onCloseCommentMode?: () => void;
  isCommentMode?: boolean;
  onDelete?: () => void;
}

/**
 * Premium session ticket header: title + ticket meta, status badge, action bar (Resolve / Assign / … + Delete).
 * Used by ExecutionView for the main dashboard session detail surface.
 */
export function SessionFeedbackHeader({
  item,
  impactScore,
  onResolvedChange,
  onResolveAndNext,
  onOpenComment,
  onCloseCommentMode,
  isCommentMode = false,
  onDelete,
}: SessionFeedbackHeaderProps) {
  const status = statusFromResolved(item.isResolved);

  return (
    <header className="sticky top-0 z-10 shrink-0 bg-white py-5 px-6 -mx-6">
      <div className="header flex justify-between items-start gap-4 min-w-0">
        <div className="header-left min-w-0 flex-1">
          <h1
            className="text-2xl font-semibold tracking-[-0.3px] text-[#0A0A0A] truncate leading-tight"
            title={item.title}
          >
            {item.title}
          </h1>
          <div className="header-meta mt-1.5 flex flex-wrap items-center gap-2">
            <span className="ticket-pill inline-flex items-center bg-[#F3F4F6] px-2.5 py-1 rounded-full text-[12px] font-medium text-[#374151]">
              {item.index} of {item.total}
            </span>
            <StatusBadge status={status} />
            {impactScore != null && (
              <span className="text-[12px] tabular-nums text-[#6B7280] font-medium">
                Impact {impactScore}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="action-bar mt-4 flex justify-between items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="left flex flex-wrap items-center gap-2 min-w-0">
          {onResolvedChange && (
            <button
              type="button"
              onClick={() => onResolvedChange(true)}
              disabled={item.isResolved === true}
              className={
                item.isResolved
                  ? `${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`
                  : resolveBtn
              }
            >
              <CheckCircle {...iconBtn} aria-hidden />
              <span>{item.isResolved ? "Resolved" : "Resolve"}</span>
            </button>
          )}
          <button type="button" className={secondaryBtn}>
            <UserPlus {...iconBtn} aria-hidden />
            Assign
          </button>
          <button type="button" className={secondaryBtn}>
            <Clock {...iconBtn} aria-hidden />
            Defer
          </button>
          {onResolveAndNext && !item.isResolved && (
            <button type="button" onClick={onResolveAndNext} className={secondaryBtn}>
              <CheckCircle {...iconBtn} aria-hidden />
              Resolve &amp; Next
            </button>
          )}
          {onOpenComment && (
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
          )}
        </div>

        {onDelete ? (
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
