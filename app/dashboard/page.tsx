"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import type { Session } from "@/lib/domain/session";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function toDate(createdAt: Session["createdAt"]): Date | null {
  if (!createdAt) return null;
  if (typeof (createdAt as { toDate?: () => Date }).toDate === "function") {
    return (createdAt as { toDate: () => Date }).toDate();
  }
  if ((createdAt as { seconds?: number }).seconds != null) {
    return new Date((createdAt as { seconds: number }).seconds * 1000);
  }
  return null;
}

function formatSessionDate(createdAt: Session["createdAt"]): string {
  const d = toDate(createdAt);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(createdAt: Session["createdAt"]): string {
  const d = toDate(createdAt);
  if (!d) return "";
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "Created just now";
  if (sec < 3600) return `Created ${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `Created ${Math.floor(sec / 3600)}h ago`;
  if (sec < 2592000) return `Created ${Math.floor(sec / 86400)}d ago`;
  if (sec < 31536000) return `Created ${Math.floor(sec / 2592000)}mo ago`;
  return `Created ${Math.floor(sec / 31536000)}y ago`;
}

function filterAndSortSessions(
  sessions: SessionWithCounts[],
  search: string,
  sort: SortValue
): SessionWithCounts[] {
  const q = search.trim().toLowerCase();
  let list = q
    ? sessions.filter(({ session }) =>
        session.title.toLowerCase().includes(q)
      )
    : [...sessions];

  if (sort === "newest") {
    list = [...list].sort((a, b) => {
      const ta = a.session.createdAt as { seconds?: number } | null | undefined;
      const tb = b.session.createdAt as { seconds?: number } | null | undefined;
      const sa = ta?.seconds ?? 0;
      const sb = tb?.seconds ?? 0;
      return sb - sa;
    });
  } else if (sort === "oldest") {
    list = [...list].sort((a, b) => {
      const ta = a.session.createdAt as { seconds?: number } | null | undefined;
      const tb = b.session.createdAt as { seconds?: number } | null | undefined;
      const sa = ta?.seconds ?? 0;
      const sb = tb?.seconds ?? 0;
      return sa - sb;
    });
  } else if (sort === "title") {
    list = [...list].sort((a, b) =>
      a.session.title.localeCompare(b.session.title, undefined, { sensitivity: "base" })
    );
  }
  return list;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col justify-center">
      <p className="text-[36px] font-semibold tracking-tight text-[var(--brand-900)] tabular-nums leading-tight">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 mt-1">
        {label}
      </p>
    </div>
  );
}

function isRecentSession(createdAt: Session["createdAt"]): boolean {
  const d = toDate(createdAt);
  if (!d) return false;
  const now = new Date();
  return now.getTime() - d.getTime() < 24 * 60 * 60 * 1000;
}

function SessionCard({
  item,
  onView,
}: {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
}) {
  const { session, counts } = item;
  const total = counts.open + counts.in_progress + counts.resolved;
  const done = counts.resolved;
  const progress = total > 0 ? (done / total) * 100 : 0;
  const openRatio = total > 0 ? counts.open / total : 0;
  const hasOpen = counts.open > 0;
  const highOpenRatio = openRatio > 0.7;
  const zeroFeedback = total === 0;
  const recent = isRecentSession(session.createdAt);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onView(session.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(session.id);
        }
      }}
      className={`relative flex flex-col justify-between rounded-md border border-neutral-200 bg-white px-5 py-4 cursor-pointer transition-colors duration-[120ms] hover:border-[var(--brand-500)] hover:bg-neutral-50 ${highOpenRatio ? "border-l-2 border-l-[var(--brand-700)]" : ""} ${zeroFeedback ? "opacity-[0.94]" : ""}`}
      data-session-id={session.id}
    >
      {/* Top section: title row, metadata, stats, progress */}
      <div>
        <div className="flex justify-between items-start">
          <h2
            className={`text-[15px] font-semibold leading-snug truncate min-w-0 ${recent ? "text-[var(--brand-900)]" : "text-neutral-800"}`}
          >
            {session.title}
          </h2>
          {hasOpen && (
            <span
              className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--brand-700)] mt-1.5 ml-2"
              aria-hidden
            />
          )}
        </div>
        <p className="text-[12px] text-neutral-500 mt-1">
          {formatSessionDate(session.createdAt)}
        </p>

        <div className="mt-3 text-[12px] text-neutral-600">
          <span>{total} feedback</span>
          <span> · </span>
          <span className="font-medium text-[var(--brand-900)] tabular-nums">{counts.open} open</span>
          <span> · </span>
          <span>{counts.resolved} done</span>
        </div>
        <div
          className="mt-3 h-[2px] w-full bg-neutral-200 rounded-none overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-[2px] bg-[var(--brand-900)] rounded-none transition-[width] duration-[120ms]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom row: Created + View */}
      <div className="mt-3 flex items-center justify-between">
        <span className="min-w-0 text-[12px] text-neutral-500">
          {formatRelativeTime(session.createdAt)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(session.id);
          }}
          className="shrink-0 text-xs border border-neutral-300 px-3 py-1 rounded-md hover:bg-neutral-100 transition-colors duration-[120ms]"
        >
          View
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { sessions, stats, loading, handleCreateSession } = useWorkspaceOverview();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");

  const filteredSessions = useMemo(
    () => filterAndSortSessions(sessions, search, sort),
    [sessions, search, sort]
  );

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-start px-6 py-8">
        <p className="text-sm text-neutral-500">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex flex-col">
      {/* Workspace Header — baseline aligned with metrics */}
      <header className="shrink-0 px-6 pt-3 pb-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-[34px] font-semibold tracking-tight text-[var(--brand-900)]">
              Workspaces
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full min-w-[140px] max-w-[200px] rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
              aria-label="Search sessions"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
              aria-label="Sort sessions"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCreateSession}
              className="h-9 shrink-0 rounded-md bg-[var(--brand-900)] text-white px-4 text-sm font-medium hover:bg-[var(--brand-700)] transition-colors duration-[120ms]"
            >
              + New Session
            </button>
          </div>
        </div>
      </header>

      {/* Metrics — command strip */}
      <section className="shrink-0 bg-[var(--neutral-weak)] border-t border-neutral-300 border-b border-neutral-200 py-6 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-4">
            <StatCard label="Total Sessions" value={stats.totalSessions} />
            <StatCard label="Active Sessions" value={stats.activeSessions} />
            <StatCard label="Total Feedback Items" value={stats.totalFeedbackItems} />
            <StatCard label="Open Issues" value={stats.openIssues} />
          </div>
      </section>

      {/* Session Grid */}
      <main className="flex-1 overflow-auto px-6 pt-4 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-4">
          {filteredSessions.map((item) => (
            <SessionCard
              key={item.session.id}
              item={item}
              onView={handleView}
            />
          ))}
        </div>
        {filteredSessions.length === 0 && (
          <p className="text-sm text-neutral-500 py-6">
            {search.trim()
              ? "No sessions match your search."
              : "No sessions yet. Create one to get started."}
          </p>
        )}
      </main>
    </div>
  );
}
