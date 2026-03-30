"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Share2, Settings, LayoutPanelLeft, Loader2 } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useSessionOverview } from "./hooks/useSessionOverview";
import type { Feedback } from "@/lib/domain/feedback";
import type { OverviewActivityItem } from "./hooks/useSessionOverview";
import { formatOverviewDate, formatActivityTime } from "@/lib/utils/date";
import { copySessionLink } from "@/utils/copySessionLink";
import type { Timestamp } from "firebase/firestore";

function resolutionLabel(isResolved: boolean): string {
  return isResolved ? "Done" : "Open";
}

// ----- Session header -----
function OverviewSessionHeader({
  title,
  createdAt,
  sessionId,
  copied,
  copyBusy,
  onCopy,
}: {
  title: string;
  createdAt: string | Date | Timestamp | null;
  sessionId: string;
  copied: boolean;
  copyBusy: boolean;
  onCopy: () => void;
}) {
  const normalizedCreatedAt =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt ?? null;
  const dateStr = formatOverviewDate(normalizedCreatedAt as any);
  const metaLine = [dateStr || null].filter(Boolean).join(" · ");
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--layer-1-border)]">
      <div>
        {title?.trim() ? (
          <h1 className="text-[20px] font-semibold leading-[1.15] tracking-[-0.025em] text-[hsl(var(--text-primary-strong))]">
            {title}
          </h1>
        ) : null}
        {metaLine ? (
          <p className="text-[13px] text-[hsl(var(--text-tertiary))] mt-2">
            {metaLine}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          disabled={copyBusy}
          className="h-9 inline-flex items-center gap-2 text-sm px-3 rounded-lg border border-[var(--layer-2-border)] bg-white hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 text-[hsl(var(--text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {copyBusy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Share2 size={14} />}
          {copyBusy ? "" : copied ? "Copied" : "Share"}
        </button>
        <Link
          href={`/session/${sessionId}`}
          className="h-9 inline-flex items-center gap-2 text-sm px-3 rounded-lg bg-brand-primary text-white hover:opacity-90 transition-colors duration-200 ease-out font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 cursor-pointer"
        >
          <LayoutPanelLeft size={14} />
          Open Feedback Board
        </Link>
        <button
          type="button"
          aria-label="Settings"
          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-[var(--layer-2-border)] bg-white hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 text-[hsl(var(--text-secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 cursor-pointer"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}

// ----- Metric card -----
function MetricCard({
  label,
  value,
  progressPercent,
}: {
  label: string;
  value: string | number;
  progressPercent?: number;
}) {
  return (
    <div className="rounded-lg border border-[var(--layer-2-border)] p-4 bg-white">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--text-tertiary))]">
        {label}
      </p>
      <p className="text-[13px] font-medium text-[hsl(var(--text-primary-strong))] mt-1">
        {value}
      </p>
      {progressPercent !== undefined && (
        <div className="mt-2 h-1 rounded-sm border border-[var(--layer-2-border)] overflow-hidden bg-white">
          <div
            className="h-full rounded-sm bg-[hsl(var(--text-active))] transition-[width] duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ----- Feedback preview row -----
function FeedbackPreviewRow({
  item,
  showStatus,
}: {
  item: Feedback;
  showStatus?: boolean;
}) {
  const createdStr = formatOverviewDate(item.createdAt);
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--layer-1-border)] last:border-0">
      <div className="min-w-0 flex-1">
        {item.title?.trim() ? (
          <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
            {item.title}
          </p>
        ) : null}
        {createdStr ? (
          <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
            {createdStr}
          </p>
        ) : null}
      </div>
      {showStatus && (
        <span className="text-xs font-medium text-[hsl(var(--text-secondary))] shrink-0 px-2 py-0.5 rounded-md border border-[var(--layer-2-border)] bg-white">
          {resolutionLabel(item.isResolved ?? false)}
        </span>
      )}
    </div>
  );
}

// ----- Status section -----
function StatusSection({
  label,
  count,
  items,
  viewAllHref,
}: {
  label: string;
  count: number;
  items: Feedback[];
  viewAllHref: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))]">
          {label}
        </span>
        <span className="text-xs font-medium text-[hsl(var(--text-secondary))] px-2 py-0.5 rounded-md border border-[var(--layer-2-border)] bg-white">
          {count}
        </span>
      </div>
      <div className="rounded-lg border border-[var(--layer-2-border)] bg-white divide-y divide-[var(--layer-1-border)]">
        {items.length === 0 ? (
          <p className="text-sm text-[hsl(var(--text-muted))] py-3 px-3">
            No items
          </p>
        ) : (
          items.map((item) => (
            <FeedbackPreviewRow key={item.id} item={item} showStatus />
          ))
        )}
      </div>
      <Link
        href={viewAllHref}
        className="text-xs font-medium text-[hsl(var(--text-active))] mt-1.5 inline-block cursor-pointer hover:underline"
      >
        View all →
      </Link>
    </section>
  );
}

// ----- Tag distribution -----
function TagDistribution({ tagCounts }: { tagCounts: { tag: string; count: number }[] }) {
  return (
    <div className="rounded-lg border border-[var(--layer-2-border)] p-4 bg-white">
      <h3 className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] mb-3">
        Tag distribution
      </h3>
      {tagCounts.length === 0 ? (
        <p className="text-sm text-[hsl(var(--text-muted))]">No tags yet</p>
      ) : (
        <ul className="space-y-2">
          {tagCounts.map(({ tag, count }) => (
            <li
              key={tag}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-[hsl(var(--text-primary))]">{tag}</span>
              <span className="text-[hsl(var(--text-muted))] font-medium px-2 py-0.5 rounded-md border border-[var(--layer-2-border)] bg-white">
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ----- Recent activity -----
function RecentActivity({ items }: { items: OverviewActivityItem[] }) {
  return (
    <div className="rounded-lg border border-[var(--layer-2-border)] bg-white">
      <h3 className="text-xs font-medium uppercase tracking-[0.06em] text-[hsl(var(--text-tertiary))] px-4 py-3 border-b border-[var(--layer-1-border)]">
        Recent activity
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-[hsl(var(--text-muted))] py-4 px-4">
          No recent activity
        </p>
      ) : (
        <ul className="divide-y divide-[var(--layer-1-border)]">
          {items.map((item, i) => {
            const timeLabel = formatActivityTime(item.timestamp);
            const targetTrim = item.targetTitle.trim();
            return (
              <li key={i} className="px-4 py-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                    {item.actorName}
                  </p>
                  <p
                    className="text-xs text-[hsl(var(--text-secondary))] truncate"
                    title={targetTrim ? item.targetTitle : undefined}
                  >
                    {item.action}
                    {targetTrim ? ` · ${item.targetTitle}` : ""}
                  </p>
                </div>
                {timeLabel ? (
                  <span className="text-xs text-[hsl(var(--text-muted))] shrink-0">
                    {timeLabel}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SessionOverviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuthGuard({
    router,
    useReplace: true,
  });
  const { data, loading, error } = useSessionOverview(sessionId);
  const { isIdentityResolved, authUid } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [copyBusy, setCopyBusy] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!sessionId || copyBusy) return;
    assertIdentityResolved(isIdentityResolved);
    const ok = await copySessionLink(sessionId, authUid, { onBusy: setCopyBusy });
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sessionId, copyBusy, authUid, isIdentityResolved]);

  const session = data.session;
  const showOverviewLoading = Boolean(sessionId) && loading && !session;

  const shouldRedirectMissingSession =
    Boolean(sessionId) &&
    !loading &&
    !authLoading &&
    isIdentityResolved &&
    !session;

  if (!sessionId) {
    router.replace("/dashboard");
    return null;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--canvas-base)]">
        <p className="text-sm text-secondary">Failed to load overview.</p>
      </div>
    );
  }

  if (shouldRedirectMissingSession) {
    router.replace("/dashboard");
    return null;
  }

  const { countsByStatus, totalCount, statusPreview, recentActivity, tagCounts } = data;
  const doneCount = countsByStatus.resolved;
  const completionPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="h-full bg-[var(--canvas-base)]">
      {session && !showOverviewLoading ? (
        <OverviewSessionHeader
          title={session.title}
          createdAt={session.createdAt ?? null}
          sessionId={sessionId}
          copied={copied}
          copyBusy={copyBusy}
          onCopy={handleCopy}
        />
      ) : (
        <header
          className="flex min-h-[73px] items-center border-b border-[var(--layer-1-border)] px-6 py-4"
          aria-busy="true"
          aria-label="Loading session"
        />
      )}

      {showOverviewLoading || !session ? (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16"
          aria-busy="true"
          aria-label="Loading overview"
        >
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" strokeWidth={2} aria-hidden />
        </div>
      ) : (
        <main className="px-6 py-4 max-w-6xl mx-auto">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Total Feedback" value={totalCount} />
            <MetricCard label="Open" value={countsByStatus.open} />
            <MetricCard label="Done" value={doneCount} />
            <MetricCard
              label="Completion %"
              value={`${Math.round(completionPercent)}%`}
              progressPercent={completionPercent}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatusSection
                  label="Open"
                  count={countsByStatus.open}
                  items={statusPreview.open}
                  viewAllHref={`/session/${sessionId}`}
                />
                <StatusSection
                  label="Done"
                  count={countsByStatus.resolved}
                  items={statusPreview.resolved}
                  viewAllHref={`/session/${sessionId}`}
                />
              </div>
            </div>

            <div className="space-y-6">
              <TagDistribution tagCounts={tagCounts} />
              <RecentActivity items={recentActivity} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
