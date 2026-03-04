"use client";

import React, { useMemo } from "react";
import type { Comment } from "@/lib/comments";
import { TicketMetadata } from "./TicketMetadata";

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
  if (!date || Number.isNaN(date.getTime())) return "—";
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
      return `Comment by ${lastComment.userName} · ${formatTimeAgo(
        lastCommentDate
      )}`;
    }
    if (isResolved) {
      return "Marked resolved";
    }
    return "No recent activity";
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
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))] mb-3">
            Details
          </h2>
          <TicketMetadata
            createdAt={createdAt}
            updatedAt={updatedAt}
            assignee={assignee ?? null}
          />
          <dl className="space-y-1.5 text-[12px]">
            <div>
              <dt className="text-[hsl(var(--text-tertiary))]">Tags</dt>
              <dd className="mt-0.5 flex flex-wrap gap-1.5">
                {safeTags.length === 0 ? (
                  <span className="text-[hsl(var(--text-tertiary))]">None</span>
                ) : (
                  safeTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-[var(--layer-2-border)] px-2 py-0.5 text-[11px] text-[hsl(var(--text-secondary-soft))]"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--text-tertiary))]">Priority</dt>
              <dd className="mt-0.5 text-[hsl(var(--text-primary-strong))] font-medium">
                {priorityLabel ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--text-tertiary))]">Estimated effort</dt>
              <dd className="mt-0.5 text-[hsl(var(--text-primary-strong))] font-medium">
                {estimatedEffortLabel ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))] mb-2">
            Activity summary
          </h2>
          <dl className="space-y-1.5 text-[12px]">
            <div>
              <dt className="text-[hsl(var(--text-tertiary))]">Last action</dt>
              <dd className="mt-0.5 text-[hsl(var(--text-primary-strong))]">
                {lastActionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--text-tertiary))]">Resolve history</dt>
              <dd className="mt-0.5 text-[hsl(var(--text-primary-strong))]">
                {resolveHistoryLabel}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))] mb-2">
            Execution insights
          </h2>
          <p className="text-[12px] text-[hsl(var(--text-tertiary))] leading-relaxed">
            Reserved for AI velocity metrics. This panel will surface risk, effort,
            and throughput signals as the system learns from execution patterns.
          </p>
        </section>
      </div>
    </aside>
  );
}

