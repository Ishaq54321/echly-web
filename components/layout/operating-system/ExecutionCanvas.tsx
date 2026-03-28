"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, MoreHorizontal, CheckCircle2, Pencil, Trash2, UserPlus, Clock, ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { statusFromResolved } from "@/lib/domain/feedback-display";
import type { FeedbackStatus } from "@/lib/domain/feedback-display";

export interface ExecutionCanvasHeaderItem {
  id: string;
  title: string;
  isResolved?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  screenshotUrl?: string | null;
  /** 0–100 impact score for minimal header display */
  impactScore?: number;
}

export interface ExecutionCanvasProps {
  /** Workspace name for breadcrumb */
  workspaceName?: string;
  /** Session title and link */
  sessionTitle?: string;
  sessionId?: string;
  /** Current ticket for header; null = empty state */
  item: ExecutionCanvasHeaderItem | null;
  /** Index in list for breadcrumb ("n of m"); omit when unknown. */
  index?: number;
  total?: number;
  onResolve?: (resolved: boolean) => void;
  onRequestDelete?: () => void;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  /** Context: related, similar patterns, effort (collapsed by default) */
  systemAnalysis?: {
    relatedSignalIds?: string[];
    similarPatterns?: string;
    historicalResolutionPath?: string;
    estimatedEffortBand?: string;
    escalationProbability?: string;
  } | null;
  /** Left column (70%): description, attachments */
  leftContent: React.ReactNode;
  /** Right column: metadata, activity (inline collapsible). */
  rightContent: React.ReactNode;
  /** Resolve current and go to next (for Resolve & Next button) */
  onResolveAndNext?: () => void;
}

function StatusPill({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    Open: "bg-amber-50 text-amber-800 border-amber-200",
    "In Progress": "bg-blue-50 text-[var(--accent-operational)] border-[var(--accent-operational-border)]",
    Blocked: "bg-red-50 text-red-700 border-red-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wide border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function ExecutionCanvas({
  workspaceName = "Workspace",
  sessionTitle,
  sessionId,
  item,
  index,
  total,
  onResolve,
  onRequestDelete,
  onSaveTitle,
  systemAnalysis,
  leftContent,
  rightContent,
  onResolveAndNext,
}: ExecutionCanvasProps) {
  const status = item ? statusFromResolved(item.isResolved) : null;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item?.title ?? "");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (actionsRef.current?.contains(e.target as Node)) return;
      setActionsOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [actionsOpen]);

  useEffect(() => {
    if (item) setTitleDraft(item.title);
  }, [item?.id, item?.title]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const handleTitleBlur = () => {
    if (!onSaveTitle || !item || titleDraft.trim() === "" || titleDraft === item.title) {
      setEditingTitle(false);
      setTitleDraft(item?.title ?? "");
      return;
    }
    onSaveTitle(titleDraft.trim()).then(() => setEditingTitle(false));
  };

  const sessionTitleTrim = sessionTitle?.trim() ?? "";
  const showTicketPosition =
    typeof index === "number" &&
    typeof total === "number" &&
    total >= 0 &&
    index >= 1;

  if (!item) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--canvas-base)]">
        <div className="flex-1 min-h-0 flex items-center justify-center p-8">
          <p className="text-[15px] text-[hsl(var(--text-tertiary))]">
            Select a feedback item from the queue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--canvas-base)]">
      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-2">
        <nav className="flex items-center gap-1 text-[12px] text-[hsl(var(--text-tertiary))]" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-120"
          >
            {workspaceName}
          </Link>
          {sessionTitleTrim ? (
            <>
              <ChevronRight className="h-3.5 w-3 shrink-0" aria-hidden />
              {sessionId ? (
                <Link
                  href={`/dashboard/${sessionId}`}
                  className="hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-120 truncate"
                >
                  {sessionTitleTrim}
                </Link>
              ) : (
                <span className="truncate">{sessionTitleTrim}</span>
              )}
            </>
          ) : null}
          {showTicketPosition ? (
            <>
              <ChevronRight className="h-3.5 w-3 shrink-0" aria-hidden />
              <span className="text-[hsl(var(--text-primary-strong))] truncate">
                Ticket {index} of {total}
              </span>
            </>
          ) : null}
        </nav>
      </div>

      {/* Header section */}
      <header className="shrink-0 px-6 pt-2 pb-4 border-b border-[var(--layer-2-border)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editingTitle && onSaveTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setTitleDraft(item.title);
                    setEditingTitle(false);
                    titleInputRef.current?.blur();
                  }
                }}
                className="w-full text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))] bg-white border border-[var(--layer-2-border)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-operational)]"
                aria-label="Edit title"
              />
            ) : (
              <div
                className="group flex items-center gap-2 min-w-0"
                onClick={() => onSaveTitle && setEditingTitle(true)}
                role={onSaveTitle ? "button" : undefined}
                tabIndex={onSaveTitle ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onSaveTitle && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setEditingTitle(true);
                  }
                }}
              >
                {item.title?.trim() ? (
                  <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))] truncate">
                    {item.title}
                  </h1>
                ) : null}
                {onSaveTitle && (
                  <Pencil className="h-4 w-4 shrink-0 text-[hsl(var(--text-tertiary))] opacity-0 group-hover:opacity-70 transition-opacity duration-120" aria-hidden />
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {status && <StatusPill status={status} />}
              {item.impactScore != null && (
                <span className="text-[11px] tabular-nums text-[hsl(var(--text-tertiary))]">
                  Impact {item.impactScore}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={actionsRef}>
              <button
                type="button"
                onClick={() => setActionsOpen((o) => !o)}
                className="h-10 w-10 flex items-center justify-center rounded-lg text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-120 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
                aria-label="More actions"
                aria-expanded={actionsOpen}
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </button>
              {actionsOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg bg-white border border-[var(--layer-2-border)] shadow-[var(--elevation-2)] z-10"
                  role="menu"
                >
                  {onRequestDelete && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setActionsOpen(false);
                        onRequestDelete();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors duration-120 text-left"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Context: collapsed by default */}
      {systemAnalysis && (
        <div className="shrink-0 border-b border-[var(--layer-2-border)]">
          <button
            type="button"
            onClick={() => setContextOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] hover:bg-[var(--structural-gray-ticket)] transition-colors duration-120"
            aria-expanded={contextOpen}
          >
            <span className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
              Context
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-120 ${contextOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
          </button>
          {contextOpen && (
            <div className="px-6 pb-4 pt-1 space-y-3 text-[12px] text-[hsl(var(--text-secondary-soft))] bg-[var(--structural-gray-ticket)]/50">
              {systemAnalysis.relatedSignalIds && systemAnalysis.relatedSignalIds.length > 0 && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Related signals</span>
                  <p className="mt-0.5">{systemAnalysis.relatedSignalIds.length} linked</p>
                </div>
              )}
              {systemAnalysis.similarPatterns && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Similar patterns</span>
                  <p className="mt-0.5">{systemAnalysis.similarPatterns}</p>
                </div>
              )}
              {systemAnalysis.historicalResolutionPath && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Historical resolution</span>
                  <p className="mt-0.5">{systemAnalysis.historicalResolutionPath}</p>
                </div>
              )}
              {systemAnalysis.estimatedEffortBand && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Estimated effort</span>
                  <p className="mt-0.5">{systemAnalysis.estimatedEffortBand}</p>
                </div>
              )}
              {systemAnalysis.escalationProbability && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Escalation probability</span>
                  <p className="mt-0.5">{systemAnalysis.escalationProbability}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick actions: Resolve, Assign, Defer, Resolve & Next; Activity (slide-in) */}
      <div className="shrink-0 px-6 py-3 border-b border-[var(--layer-2-border)] flex flex-wrap items-center gap-2">
        {onResolve && (
          <button
            type="button"
            onClick={() => onResolve(!item.isResolved)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] ${
              item.isResolved
                ? "border border-[var(--layer-2-border)] bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)]"
                : "bg-[var(--accent-operational)] text-white border border-transparent hover:opacity-92"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            {item.isResolved ? "Reopen" : "Resolve"}
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium border border-[var(--layer-2-border)] bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
        >
          <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
          Assign
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium border border-[var(--layer-2-border)] bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          Defer
        </button>
        {onResolveAndNext && !item.isResolved && (
          <button
            type="button"
            onClick={onResolveAndNext}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium border border-[var(--layer-2-border)] bg-white text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
          >
            Resolve & Next
          </button>
        )}
      </div>

      {/* Body: two columns — content + metadata/activity */}
      <div className="flex-1 min-h-0 overflow-hidden flex">
        <div className="min-h-0 overflow-y-auto flex-[0_0_70%] border-r border-[var(--layer-2-border)]" style={{ maxWidth: "70%" }}>
          <div className="p-6">{leftContent}</div>
        </div>
        <div className="min-h-0 overflow-y-auto flex-[1_1_30%] bg-[var(--structural-gray-ticket)]/50 text-[13px]" style={{ minWidth: 0 }}>
          <div className="p-4">{rightContent}</div>
        </div>
      </div>
    </div>
  );
}
