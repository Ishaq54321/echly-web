"use client";

import React, { useMemo } from "react";
import type { Comment } from "@/lib/comments";
import { TicketMetadata } from "./TicketMetadata";
import { TAG_CHIP_BASE_CLASS } from "@/lib/tagConfig";

export interface ContextPanelProps {
  createdAt?: string | { seconds: number } | null;
  updatedAt?: string | { seconds: number } | null;
  assignee?: string | null;
  tags?: string[] | null;
  priorityLabel?: string | null;
  estimatedEffortLabel?: string | null;
  comments?: Comment[];
  isResolved?: boolean;
}

function formatTimeAgo(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function ContextPanel({
  createdAt,
  updatedAt,
  assignee,
  tags,
  priorityLabel,
  estimatedEffortLabel,
  comments = [],
  isResolved,
}: ContextPanelProps) {
  const { lastComment, lastCommentDate } = useMemo(() => {
    if (!comments.length) return { lastComment: null as Comment | null, lastCommentDate: null as Date | null };
    const latest = comments[0];
    const ts = latest.createdAt;
    const d =
      ts && typeof ts.seconds === "number"
        ? new Date(ts.seconds * 1000)
        : null;
    return { lastComment: latest, lastCommentDate: d };
  }, [comments]);

  const lastActionLabel = useMemo(() => {
    if (lastComment && lastCommentDate) {
      const ago = formatTimeAgo(lastCommentDate);
      return ago
        ? `Comment by ${lastComment.userName} · ${ago}`
        : `Comment by ${lastComment.userName}`;
    }
    if (isResolved) {
      return "Marked resolved";
    }
    return null;
  }, [lastComment, lastCommentDate, isResolved]);

  const resolveHistoryLabel = useMemo(() => {
    if (!isResolved) return "Not yet resolved";
    if (!updatedAt) return "Resolved (time unknown)";
    if (typeof updatedAt === "string") {
      const d = new Date(updatedAt);
      if (!Number.isNaN(d.getTime())) {
        return `Resolved on ${d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      }
      return "Resolved";
    }
    if (typeof updatedAt === "object" && typeof updatedAt.seconds === "number") {
      const d = new Date(updatedAt.seconds * 1000);
      return `Resolved on ${d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return "Resolved";
  }, [isResolved, updatedAt]);

  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <aside
      className="flex flex-col h-full min-h-0 w-[280px] shrink-0 border-l border-[var(--layer-2-border)] bg-[var(--canvas-base)]"
      aria-label="Ticket context and metadata"
    >
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-6">
        <section>
          <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-3">
            Details
          </h2>
          <TicketMetadata
            createdAt={createdAt}
            updatedAt={updatedAt}
            assignee={assignee ?? null}
          />
          <dl className="space-y-1.5 text-[12px]">
            <div>
              <dt className="text-[var(--text-tertiary)]">Tags</dt>
              {safeTags.length > 0 ? (
                <dd className="mt-0.5 flex flex-wrap gap-1.5">
                  {safeTags.map((tag) => (
                    <span
                      key={tag}
                      className={`${TAG_CHIP_BASE_CLASS} bg-[var(--surface-subtle)] text-[var(--text-body)] border-[var(--border)] !px-2.5 !py-0.5 !text-[12px]`}
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              ) : (
                <dd className="mt-0.5 text-[var(--text-tertiary)] italic">Not set</dd>
              )}
            </div>
            <div>
              <dt className="text-[var(--text-tertiary)]">Priority</dt>
              {priorityLabel?.trim() ? (
                <dd className="mt-0.5 text-[var(--text-primary-strong)] font-medium">
                  {priorityLabel}
                </dd>
              ) : (
                <dd className="mt-0.5 text-[var(--text-tertiary)] italic">Not set</dd>
              )}
            </div>
            <div>
              <dt className="text-[var(--text-tertiary)]">Estimated effort</dt>
              {estimatedEffortLabel?.trim() ? (
                <dd className="mt-0.5 text-[var(--text-primary-strong)] font-medium">
                  {estimatedEffortLabel}
                </dd>
              ) : (
                <dd className="mt-0.5 text-[var(--text-tertiary)] italic">Not set</dd>
              )}
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-2">
            Activity summary
          </h2>
          <dl className="space-y-1.5 text-[12px]">
            {lastActionLabel ? (
              <div>
                <dt className="text-[var(--text-tertiary)]">Last action</dt>
                <dd className="mt-0.5 text-[var(--text-primary-strong)]">
                  {lastActionLabel}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[var(--text-tertiary)]">Resolve history</dt>
              <dd className="mt-0.5 text-[var(--text-primary-strong)]">
                {resolveHistoryLabel}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-2">
            Execution insights
          </h2>
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "8px 0 4px" }}>
            <div style={{ width: 120, height: 96, marginBottom: 8 }}>
              <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
                <g transform="translate(100 80) rotate(-3) translate(-50 -34)">
                  <rect width="100" height="68" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
                  <rect x="14" y="16" width="50" height="5" rx="2.5" fill="#E5E7EB" />
                  <rect x="16" y="44" width="10" height="14" rx="2" fill="#E5E7EB" />
                  <rect x="32" y="36" width="10" height="22" rx="2" fill="#D1D5DB" />
                  <rect x="48" y="30" width="10" height="28" rx="2" fill="#E5E7EB" />
                  <rect x="64" y="40" width="10" height="18" rx="2" fill="#E5E7EB" />
                  <rect x="80" y="32" width="10" height="26" rx="2" fill="#D1D5DB" />
                </g>
                <g transform="translate(146 112)">
                  <circle cx="17" cy="17" r="14" fill="#6B7280" />
                  <rect x="10" y="17" width="3" height="6" fill="#fff" />
                  <rect x="15.5" y="14" width="3" height="9" fill="#fff" />
                  <rect x="21" y="11" width="3" height="12" fill="#fff" />
                </g>
              </svg>
            </div>
            <h3 className="text-[13px] font-semibold text-[var(--text-heading)]" style={{ margin: "0 0 4px 0" }}>
              Insights coming soon
            </h3>
            <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed" style={{ margin: 0 }}>
              AI-powered velocity and risk signals will appear here.
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}

