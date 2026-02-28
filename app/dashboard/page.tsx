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

function formatSessionDate(createdAt: Session["createdAt"]): string {
  if (!createdAt) return "—";
  const d =
    typeof (createdAt as { toDate?: () => Date }).toDate === "function"
      ? (createdAt as { toDate: () => Date }).toDate()
      : (createdAt as { seconds?: number }).seconds != null
        ? new Date((createdAt as { seconds: number }).seconds * 1000)
        : null;
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    <div className="rounded-md border border-neutral-200 bg-white p-3 flex flex-col justify-center min-h-[72px]">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-semibold leading-tight text-neutral-900 tabular-nums">
        {value}
      </p>
    </div>
  );
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
  const highOpenRatio = openRatio >= 0.5;

  return (
    <div
      className={`rounded-md border border-neutral-200 bg-white p-3 transition-[border-color,background-color] duration-[120ms] hover:border-neutral-300 hover:bg-neutral-50 ${highOpenRatio ? "border-l-2 border-l-neutral-400" : ""}`}
      data-session-id={session.id}
    >
      <h2 className="font-semibold text-base leading-tight text-neutral-900 truncate">
        {session.title}
      </h2>
      <p className="text-xs text-neutral-500 mt-0.5">
        {formatSessionDate(session.createdAt)}
      </p>

      <div className="mt-2 flex items-baseline gap-x-3 gap-y-0 text-xs text-neutral-500">
        <span>{total} feedback</span>
        <span className={hasOpen ? "font-medium text-neutral-700" : ""}>
          {counts.open} open
        </span>
        <span>{counts.in_progress} in progress</span>
        <span>{counts.resolved} done</span>
      </div>
      <div
        className="mt-1.5 h-1 w-full bg-neutral-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-neutral-700 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onView(session.id)}
          className="h-9 px-3 rounded-md border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors duration-[120ms]"
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
      {/* Workspace Header */}
      <header className="shrink-0 px-6 py-3 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Workspaces
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2">
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
              className="h-9 shrink-0 rounded-md bg-neutral-900 text-white px-4 text-sm font-medium hover:bg-neutral-800 transition-colors duration-[120ms]"
            >
              + New Session
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="shrink-0 px-6 py-3 border-b border-neutral-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Sessions" value={stats.totalSessions} />
          <StatCard label="Active Sessions" value={stats.activeSessions} />
          <StatCard label="Total Feedback Items" value={stats.totalFeedbackItems} />
          <StatCard label="Open Issues" value={stats.openIssues} />
        </div>
      </section>

      {/* Session Grid */}
      <main className="flex-1 overflow-auto px-6 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
