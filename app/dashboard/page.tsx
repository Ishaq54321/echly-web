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

function StatItem({
  label,
  value,
  dominant,
}: {
  label: string;
  value: number;
  dominant?: boolean;
}) {
  return (
    <div className="flex flex-col justify-center">
      <p
        className={`tabular-nums font-semibold tracking-[-0.01em] text-[#0F172A] ${
          dominant ? "text-[40px] leading-[38px]" : "text-[36px] leading-[38px]"
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 mt-1">
        {label}
      </p>
    </div>
  );
}

const ROW_STAGGER_COLS = 3;

function SessionCard({
  item,
  onView,
  index = 0,
}: {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
  index?: number;
}) {
  const { session, counts } = item;
  const total = counts.open + counts.in_progress + counts.resolved;
  const rowStagger = Math.floor(index / ROW_STAGGER_COLS) % 2 === 1;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onView(session.id);
  };

  return (
    <div className={rowStagger ? "translate-y-[2px]" : ""}>
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
        className="group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 animate-[fade-rise_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        style={{ animationDelay: `${index * 40}ms` }}
        data-session-id={session.id}
      >
      {/* Layer 1 — Back sheet (shadow layer) */}
      <div
        className="absolute top-[8px] left-[8px] right-[-8px] bottom-[-8px] rounded-[18px] bg-[#DCDCDC] z-0 transition-[transform_260ms_cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[-1px]"
        aria-hidden
      />
      {/* Layer 2 — Mid sheet */}
      <div
        className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] rounded-[18px] bg-[#E5E5E5] z-10 transition-[transform_240ms_cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[-2px]"
        aria-hidden
      />
      {/* Layer 3 — Main folder body */}
      <div className="relative rounded-[18px] bg-[#F2F2F2] px-8 pt-8 pb-6 z-20 shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-[transform_220ms_cubic-bezier(0.22,1,0.36,1),box-shadow_220ms_cubic-bezier(0.22,1,0.36,1),filter_220ms_cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[-4px] group-hover:shadow-[0_28px_60px_rgba(0,0,0,0.12)] group-hover:brightness-[1.02]">
        {/* Folder tab */}
        <div
          className="absolute top-[-10px] left-[24px] w-[110px] h-[28px] bg-[#F2F2F2] rounded-t-[18px] rounded-b-[10px] z-30"
          aria-hidden
        />
        {/* Title row */}
        <div className="flex items-center gap-3 mt-2">
          <svg
            className="shrink-0 w-4 h-4 text-neutral-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h2 className="text-[20px] font-medium text-neutral-800 truncate min-w-0">
            {session.title}
          </h2>
        </div>
        {/* Info rows — 10% lighter separators */}
        <div className="flex items-center justify-between mt-6 text-[14px]">
          <span className="text-neutral-600 shrink-0">Feedback</span>
          <div className="flex-1 mx-4 h-[1px] bg-[#E0E0E0] shrink-0" aria-hidden />
          <span className="text-neutral-800 font-medium tabular-nums shrink-0">{total}</span>
        </div>
        <div className="flex items-center justify-between mt-5 text-[14px]">
          <span className="text-neutral-600 shrink-0">Open issues</span>
          <div className="flex-1 mx-4 h-[1px] bg-[#E0E0E0] shrink-0" aria-hidden />
          <span className="text-neutral-800 font-medium tabular-nums shrink-0">{counts.open}</span>
        </div>
        <div className="flex items-center justify-between mt-5 text-[14px]">
          <span className="text-neutral-600 shrink-0">Last updated</span>
          <div className="flex-1 mx-4 h-[1px] bg-[#E0E0E0] shrink-0" aria-hidden />
          <span className="text-neutral-800 font-medium shrink-0">{formatLastUpdated(session.createdAt)}</span>
        </div>
      </div>
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
      <div className="min-h-[40vh] flex items-center justify-center bg-[#ECECEC] px-4 md:px-6 lg:px-8 pt-8 pb-16">
        <div className="w-full max-w-[1280px] mx-auto">
          <p className="text-sm text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex flex-col bg-[#ECECEC] px-4 md:px-6 lg:px-8 pt-8 pb-16">
      <div className="w-full max-w-[1280px] mx-auto flex flex-col">
        {/* Header — pixel precise */}
        <header className="shrink-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-[34px] leading-[40px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Workspaces
            </h1>
            <p className="text-[14px] leading-[20px] text-neutral-500 mt-2">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 min-w-[140px] max-w-[200px] rounded-md border border-neutral-200 bg-white px-3 text-[13px] text-[#0F172A] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
              aria-label="Search sessions"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
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
              className="h-9 shrink-0 rounded-md bg-[#0F172A] text-white px-4 text-[13px] font-medium hover:bg-[#111827] transition-colors duration-150"
            >
              + New Session
            </button>
          </div>
        </header>

        {/* Metrics — folder-soft document above cards */}
        <section className="mt-8 bg-white border border-neutral-100 rounded-md px-8 py-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 md:gap-x-16 gap-y-4">
            <StatItem label="Total Sessions" value={stats.totalSessions} />
            <StatItem label="Active Sessions" value={stats.activeSessions} />
            <StatItem label="Total Feedback Items" value={stats.totalFeedbackItems} />
            <StatItem label="Open Issues" value={stats.openIssues} dominant />
          </div>
        </section>

        {/* Session Grid — folder workspace objects */}
        <main className="mt-12 pt-10 flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-10 max-w-4xl mx-auto">
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
            <p className="text-sm text-neutral-500 py-6">
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
