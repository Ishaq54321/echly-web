"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import type { Session } from "@/lib/domain/session";

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

function formatUpdatedAgo(createdAt: Session["createdAt"]): string {
  const d = toDate(createdAt);
  if (!d) return "—";
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  const days = Math.floor(sec / 86400);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function filterAndSortSessions(sessions: SessionWithCounts[], search: string): SessionWithCounts[] {
  const q = search.trim().toLowerCase();
  const list = q
    ? sessions.filter(({ session }) =>
        session.title.toLowerCase().includes(q)
      )
    : [...sessions];

  return [...list].sort((a, b) => {
    const openA = a.counts.open;
    const openB = b.counts.open;
    if (openB !== openA) return openB - openA;
    const ta = a.session.createdAt as { seconds?: number } | null | undefined;
    const tb = b.session.createdAt as { seconds?: number } | null | undefined;
    const sa = ta?.seconds ?? 0;
    const sb = tb?.seconds ?? 0;
    return sb - sa;
  });
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
  const feedbackCount = counts.open + counts.in_progress + counts.resolved;
  const openIssues = counts.open;
  const isActive = openIssues > 0;

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
      className={`focus-ring-brand group relative flex flex-col min-h-[132px] w-full bg-white rounded-[16px] px-5 py-5 border cursor-pointer outline-none transition-[border-color,box-shadow] duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        isActive
          ? "border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]"
          : "border-neutral-200/70 shadow-[0_4px_12px_rgba(0,0,0,0.025)] hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]"
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
      data-session-id={session.id}
    >
      {/* Header row: folder icon, name, status dot — active: full opacity; inactive: title 90% */}
      <div className={`flex items-center gap-2 min-w-0 ${!isActive ? "opacity-90" : ""}`}>
        <svg
          className={`shrink-0 w-[14px] h-[14px] ${isActive ? "text-neutral-600" : "text-neutral-500"}`}
          fill="none"
          strokeWidth={1.4}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44l-2.122-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6z" />
        </svg>
        <h2 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 truncate min-w-0">
          {session.title}
        </h2>
        <span
          className={`shrink-0 w-[6px] h-[6px] rounded-full ${isActive ? "bg-[var(--color-brand-primary)]" : "bg-neutral-300"}`}
          aria-hidden
        />
      </div>

      {/* Summary row — active: default; inactive: 85% opacity */}
      <div className={`mt-1.5 text-[14px] text-neutral-600 ${!isActive ? "opacity-[0.85]" : ""}`}>
        {feedbackCount} Feedback ·{" "}
        <span className={openIssues > 0 ? "text-[var(--color-brand-primary)]" : ""}>{openIssues}</span> Open
      </div>

      {/* Meta row — active: 70%; inactive: 70% (same) */}
      <div className="mt-1.5 flex justify-between items-center">
        <span className="text-[13px] text-neutral-500 opacity-70">
          Updated {formatUpdatedAgo(session.createdAt)}
        </span>
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] inline-flex text-neutral-400"
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

  const filteredSessions = useMemo(
    () => filterAndSortSessions(sessions, search),
    [sessions, search]
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
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-neutral-600 mt-0.5 inline-flex hover:text-brand-primary transition-colors duration-200" aria-hidden>
              <EchlySymbol />
            </span>
            <div>
              <h1 className="text-[30px] font-medium tracking-[-0.01em] text-neutral-900">
                Workspaces
              </h1>
              <p className="text-[13px] text-neutral-500 mt-0.5">
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
            <button
              type="button"
              onClick={handleCreateSession}
              className="focus-ring-brand h-9 rounded-xl bg-neutral-900 text-white text-[13px] px-4 font-medium hover:bg-neutral-800 focus:outline-none transition-colors"
            >
              New Session
            </button>
          </div>
        </header>

        {/* Cards grid — no overflow so card shadows can extend; pb-10 buffers last row hover shadow */}
        <main className="mt-6 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 pb-10">
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
