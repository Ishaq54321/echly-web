/**
 * SessionFeedbackHeader — marketing forklift of components/session/FeedbackHeader.tsx
 *
 * Modifications from source:
 * - Stripped useWorkspace/useFeedbackDetailController/useRouter (the source had
 *   none directly; data arrives via props). Replaced the heavy prop API with a
 *   small one fed from static mock data.
 * - INTERACTIVITY PASS: re-introduced the Assign + Priority chips (forklifted as
 *   DemoAssignDropdown / DemoPriorityDropdown) into the authed action row, in the
 *   real product's position — right after Resolve, before Activity
 *   (FeedbackHeader.tsx:466-518). Unlike production these are always the
 *   editable, label-visible (non-iconOnly) variant, fed local-state callbacks.
 * - Removed the shareGating / readOnly / accessResolve branches (never hit with
 *   static authed data). Kept ONLY the default authed action row verbatim:
 *   Resolve/Reopen + Assign + Priority + Activity + Delete (Delete + Activity
 *   are no-ops here).
 * - onResolvedChange flips local state in the parent (no API).
 * - No meta row under the title (a marketing-only page/browser/OS row was tried
 *   then removed per request) — capture metadata appears only in the screenshot
 *   Info-badge tooltip, matching production (SESSION_PAGE_DESIGN_SPEC §4.1).
 * - All action-button class constants, StatusBadge, eyebrow, title rows, and
 *   resolve-flash logic copied verbatim.
 */
"use client";

import React, { useEffect, useState } from "react";
import {
  statusFromResolved,
  type FeedbackStatus,
} from "@/lib/domain/feedback-display";
import {
  CalendarCheck2,
  Check,
  Sparkles,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { DemoAssignDropdown, type DemoMember } from "./DemoAssignDropdown";
import { DemoPriorityDropdown, type DemoPriority } from "./DemoPriorityDropdown";
import type { DemoAssignment } from "./useStaticFeedbackController";

const actionBtn =
  "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

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
  item: { id: string; title: string; isResolved: boolean; index: number; total: number };
  /** Capture metadata (page URL · browser · OS). No longer rendered here —
      kept as an accepted prop so callers don't error; meta lives in the
      screenshot Info-badge tooltip. */
  pageMetadata?: { url: string; browser: string; os: string };
  resolveAffirmationKey?: number;
  onResolvedChange?: (isResolved: boolean) => void;
  onToggleActivity?: () => void;
  isActivityPanelOpen?: boolean;
  /** Phase 5 forklift: open/close the Dev Tools side panel (mutually exclusive
      with Activity — SessionDemoStage enforces the exclusivity). */
  onToggleDevTools?: () => void;
  isDevToolsPanelOpen?: boolean;
  onDelete?: () => void;
  /** Demo-local assignment/priority for the selected ticket + their setters. */
  members?: DemoMember[];
  assignment?: DemoAssignment;
  onAssigned?: (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => void;
  onPriorityChanged?: (priority: DemoPriority | null) => void;
}

export function SessionFeedbackHeader({
  item,
  resolveAffirmationKey = 0,
  onResolvedChange,
  onToggleActivity,
  isActivityPanelOpen = false,
  onToggleDevTools,
  isDevToolsPanelOpen = false,
  onDelete,
  members,
  assignment,
  onAssigned,
  onPriorityChanged,
}: SessionFeedbackHeaderProps) {
  const [resolveFlash, setResolveFlash] = useState(false);
  useEffect(() => {
    if (resolveAffirmationKey <= 0) return;
    setResolveFlash(true);
    const t = window.setTimeout(() => setResolveFlash(false), 420);
    return () => window.clearTimeout(t);
  }, [resolveAffirmationKey]);

  const isResolved = item.isResolved === true;
  const status = statusFromResolved(item.isResolved);
  const titleTrim = item.title?.trim() ?? "";
  const positionLabel = `${item.index} of ${item.total}`;

  return (
    <header className="shrink-0 bg-[var(--surface)] pt-0 px-0 pb-0">
      <div className="mb-6">
        {/* Row 1: Eyebrow */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[11.5px] font-medium text-[var(--text-secondary)] bg-[var(--surface-hover)] px-2.5 py-[3px] rounded-full tabular-nums">
            {positionLabel}
          </span>
          <span
            className={`inline-flex transition-all duration-200 ease-out ${
              resolveFlash && isResolved
                ? "scale-105 opacity-100 ring-2 ring-[var(--color-success-border)] ring-offset-2 ring-offset-white rounded-full"
                : "scale-100 opacity-100"
            }`}
          >
            <StatusBadge status={status} />
          </span>
        </div>

        {/* Row 2: Title */}
        <div className="group flex items-start gap-0 mb-4 transition-all duration-150">
          <h1 className="text-[21px] font-semibold tracking-[-0.018em] leading-[1.25] m-0 transition-colors duration-150 text-[var(--text-heading)]">
            {titleTrim}
          </h1>
        </div>

        {/* Meta row removed (per request) — capture metadata now lives only in
            the screenshot Info-badge tooltip, matching production. */}

        {/* Row 3: Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isResolved ? (
            <button
              type="button"
              onClick={() => onResolvedChange?.(false)}
              className="inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] text-[13px] font-medium border border-[var(--border)] bg-transparent text-[var(--text-heading)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <RotateCcw size={14} strokeWidth={1.7} />
              Reopen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onResolvedChange?.(true)}
              className={actionBtnResolve}
            >
              <Check size={14} strokeWidth={1.7} />
              Resolve
            </button>
          )}
          {/* Assign — editable demo dropdown (real product: FeedbackHeader.tsx:466) */}
          {members && assignment && onAssigned ? (
            <DemoAssignDropdown
              members={members}
              currentAssigneeId={assignment.assignee?.id ?? null}
              currentAssigneeName={assignment.assignee?.name ?? null}
              currentAssigneeAvatarUrl={assignment.assignee?.avatarUrl ?? null}
              onAssigned={onAssigned}
            />
          ) : null}
          {/* Priority — editable demo dropdown (real product: FeedbackHeader.tsx:496) */}
          {assignment && onPriorityChanged ? (
            <DemoPriorityDropdown
              currentPriority={assignment.priority ?? null}
              onPriorityChanged={onPriorityChanged}
            />
          ) : null}
          {/* Activity — toggle (opens DemoActivityPanel in the right slot).
              Hidden on mobile (md:): the 3-column demo can't host a right panel
              on small screens. */}
          {onToggleActivity ? (
            <button
              type="button"
              data-action="activity"
              onClick={onToggleActivity}
              className={`hidden md:inline-flex ${isActivityPanelOpen ? actionBtnActive : actionBtn}`}
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
          {/* Dev Tools — sibling toggle (forklift of FeedbackHeader.tsx:541-568).
              Mutually exclusive with Activity (enforced in SessionDemoStage).
              Hidden on mobile alongside Activity. */}
          {onToggleDevTools ? (
            <button
              type="button"
              data-action="devtools"
              onClick={onToggleDevTools}
              className={`hidden md:inline-flex ${isDevToolsPanelOpen ? actionBtnActive : actionBtn}`}
              aria-pressed={isDevToolsPanelOpen}
              aria-label={isDevToolsPanelOpen ? "Close dev tools panel" : "Open dev tools panel"}
            >
              <Sparkles
                size={14}
                strokeWidth={1.5}
                className="text-[var(--brand)]"
              />
              Dev Tools
            </button>
          ) : null}
          {/* Spacer */}
          <div className="flex-1" />
          {/* Delete (no-op in the marketing demo) */}
          {onDelete ? (
            <div className="hidden md:flex items-center">
              <Tooltip content="Delete">
                <button type="button" onClick={onDelete} className={actionBtnDelete}>
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </Tooltip>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
