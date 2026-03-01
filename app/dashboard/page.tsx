"use client";

import { useMemo, useState, useEffect } from "react";
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

/* Monochrome Echly symbol — 16px, stroke 1.5, neutral-800 */
function EchlySymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.5}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h12M4 18h8" />
    </svg>
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
      className="dashboard-workspace-card focus-ring-brand group relative flex flex-col min-h-[110px] w-full bg-white rounded-[16px] px-5 py-4 border border-neutral-200/70 shadow-[0_4px_14px_rgba(0,0,0,0.03)] cursor-pointer outline-none transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(.4,0,.2,1)] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)] hover:border-neutral-300"
      style={{ animationDelay: `${index * 40}ms` }}
      data-session-id={session.id}
    >
      {/* Top row: folder icon, name, status dot */}
      <div className="flex items-center gap-2 min-w-0">
        <svg
          className="shrink-0 w-[14px] h-[14px] text-neutral-600 group-hover:text-brand-primary transition-colors duration-200"
          fill="none"
          strokeWidth={1.5}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44l-2.122-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6z" />
        </svg>
        <h2 className="text-[14px] font-medium tracking-[-0.01em] text-neutral-900 truncate min-w-0">
          {session.title}
        </h2>
        <span
          className={`shrink-0 w-1.5 h-1.5 rounded-full ${hasOpenIssues ? "bg-brand-primary" : "bg-neutral-300"}`}
          aria-hidden
        />
      </div>

      {/* Primary signal: feedback number + "X Feedback · Y Open" with brand weight on open */}
      <div className="mt-1.5 flex flex-col">
        <span className="text-[26px] font-semibold tracking-[-0.01em] tabular-nums text-neutral-900">
          {total}
        </span>
        <span className="text-[13px] text-neutral-500 mt-0.5">
          {total} Feedback ·{" "}
          <span className={counts.open > 0 ? "text-brand-primary" : "text-neutral-500"}>
            {counts.open} Open
          </span>
        </span>
      </div>

      {/* Progress bar — brand tint on fill */}
      <div className="mt-1.5 h-px rounded-full bg-neutral-200/70 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary/80 transition-[width] duration-200 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ width: `${healthWidth}%` }}
          aria-hidden
        />
      </div>

      {/* Meta row */}
      <div className="mt-1.5 flex justify-between items-center">
        <span className="text-[11px] text-neutral-400">
          {formatLastUpdated(session.createdAt)}
        </span>
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out inline-flex text-neutral-400 group-hover:text-brand-primary"
          aria-hidden
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { sessions, loading, handleCreateSession } = useWorkspaceOverview();
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
      <div className="min-h-[40vh] flex items-center justify-center px-6 pt-12 pb-32 bg-[#F7F8FA]">
        <div className="w-full max-w-[1100px] mx-auto relative">
          <p className="text-[13px] text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex flex-col bg-[#F7F8FA]">
      <div className="dashboard-workspace-section w-full max-w-[1100px] mx-auto px-6 pt-12 pb-32 flex flex-col relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-neutral-600 mt-0.5 inline-flex hover:text-brand-primary transition-colors duration-200" aria-hidden>
              <EchlySymbol />
            </span>
            <div>
              <h1 className="text-[30px] font-medium tracking-[-0.01em] text-neutral-900">
                Workspaces
              </h1>
              <p className="text-[13px] text-neutral-500 mt-1">
                Sessions and feedback in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-ring-brand h-9 px-3 bg-white border border-neutral-200/70 rounded-xl text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none min-w-[180px]"
              aria-label="Search sessions"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="focus-ring-brand h-9 px-3 bg-white border border-neutral-200/70 rounded-xl text-[13px] text-neutral-700 focus:outline-none appearance-none cursor-pointer pr-8 bg-[length:12px] bg-[right_10px_center] bg-no-repeat min-w-0"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")" }}
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
              className="focus-ring-brand h-9 rounded-xl bg-neutral-900 text-white text-[13px] px-4 font-medium hover:bg-neutral-800 focus:outline-none transition-colors"
            >
              New Session
            </button>
          </div>
        </header>

        {/* Cards grid */}
        <main className="mt-8 flex-1 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
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
            <p className="text-[13px] text-neutral-500 py-8">
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
