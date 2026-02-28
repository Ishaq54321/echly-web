"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import type { Session } from "@/lib/domain/session";

function useCountUp(value: number, enabled: boolean, durationMs = 600) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    let start: number | null = null;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      if (start == null) start = now;
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      setDisplay(Math.round(easeOut(t) * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, enabled, durationMs]);
  return display;
}

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

function formatLastUpdated(createdAt: Session["createdAt"]): string {
  const d = toDate(createdAt);
  if (!d) return "—";
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  const days = Math.floor(sec / 86400);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
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

function MetricBlock({
  label,
  value,
  animate,
}: {
  label: string;
  value: number;
  animate: boolean;
}) {
  const display = useCountUp(value, animate, 600);
  return (
    <div className="flex flex-col">
      <span className="text-[36px] font-semibold tracking-[-0.02em] tabular-nums text-neutral-900">
        {display}
      </span>
      <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-400 mt-1">
        {label}
      </span>
    </div>
  );
}

function SessionCard({
  item,
  onView,
  index,
}: {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
  index: number;
}) {
  const { session, counts } = item;
  const total = counts.open + counts.in_progress + counts.resolved;
  const resolutionPct = total > 0 ? (counts.resolved / total) * 100 : 0;
  const hasOpenIssues = counts.open > 0;
  const [healthWidth, setHealthWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHealthWidth(resolutionPct));
    return () => cancelAnimationFrame(id);
  }, [resolutionPct]);

  const ownerInitial = session.title ? session.title.charAt(0).toUpperCase() : "?";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(session.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(session.id);
        }
      }}
      className="dashboard-card-v5 group flex flex-col justify-between min-h-[160px] w-full max-w-[520px] bg-white rounded-[16px] px-6 py-6 shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 hover:shadow-md hover:-translate-y-[3px] transition-[box-shadow,transform] duration-[180ms] ease-out"
      style={{ animationDelay: `${index * 30}ms` }}
      data-session-id={session.id}
    >
      {/* Top row: folder icon, name, status dot */}
      <div className="flex items-center gap-2 min-w-0">
        <svg
          className="shrink-0 w-4 h-4 text-neutral-400"
          fill="none"
          strokeWidth={1.5}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44l-2.122-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6z" />
        </svg>
        <h2 className="text-[16px] font-medium text-neutral-900 truncate min-w-0">
          {session.title}
        </h2>
        <span
          className={`shrink-0 w-1.5 h-1.5 rounded-full ${hasOpenIssues ? "bg-neutral-900" : "bg-neutral-300"}`}
          aria-hidden
        />
      </div>

      {/* Middle: feedback count (left), open issues (right) */}
      <div className="flex justify-between items-baseline gap-4 mt-4">
        <div className="flex flex-col">
          <span className="text-[26px] font-semibold tabular-nums text-neutral-900">
            {total}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 mt-0.5">
            Feedback
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[18px] font-medium tabular-nums text-neutral-900">
            {counts.open}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 mt-0.5">
            Open issues
          </span>
        </div>
      </div>

      {/* Health line */}
      <div className="mt-4 h-[2px] rounded-full bg-neutral-200 overflow-hidden">
        <div
          className="h-[2px] rounded-full bg-neutral-900 transition-[width] duration-300 ease-out"
          style={{ width: `${healthWidth}%` }}
          aria-hidden
        />
      </div>

      {/* Bottom meta strip */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-[12px] text-neutral-400">
          {formatLastUpdated(session.createdAt)}
        </span>
        <span
          className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-600"
          aria-hidden
        >
          {ownerInitial}
        </span>
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
      <div
        className="min-h-[40vh] flex items-center justify-center px-6 pt-16 pb-24"
        style={{ background: "#F7F8FA" }}
      >
        <div className="w-full max-w-[1120px] mx-auto">
          <p className="text-[14px] text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-0 flex flex-col px-6 pt-16 pb-24"
      style={{ background: "#F7F8FA" }}
    >
      <div className="w-full max-w-[1120px] mx-auto flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-neutral-900">
              Workspaces
            </h1>
            <p className="text-[14px] text-neutral-500 mt-2">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 px-3 border border-neutral-200 rounded-md text-[13px] text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
              aria-label="Search sessions"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="h-9 px-3 border border-neutral-200 rounded-md text-[13px] text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
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
              className="h-9 px-4 rounded-md bg-black text-white text-[13px] font-medium hover:bg-neutral-800 transition-colors"
            >
              New Session
            </button>
          </div>
        </header>

        <div className="h-[1px] bg-neutral-200 mt-12" aria-hidden />

        {/* Metrics: inline row, no card */}
        <section className="flex justify-between mt-10 gap-x-20 flex-wrap gap-y-4">
          <MetricBlock label="Total Sessions" value={stats.totalSessions} animate={true} />
          <MetricBlock label="Active Sessions" value={stats.activeSessions} animate={true} />
          <MetricBlock label="Total Feedback Items" value={stats.totalFeedbackItems} animate={true} />
          <MetricBlock label="Open Issues" value={stats.openIssues} animate={true} />
        </section>

        {/* Main grid */}
        <main className="mt-16 flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-x-[4.5rem] gap-y-[4.5rem]">
            {filteredSessions.map((item, index) => (
              <SessionCard
                key={item.session.id}
                item={item}
                onView={handleView}
                index={index}
              />
            ))}
          </div>
          {filteredSessions.length === 0 && (
            <p className="text-[14px] text-neutral-500 py-8">
              {search.trim()
                ? "No sessions match your search."
                : "No sessions yet. Create one to get started."}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
