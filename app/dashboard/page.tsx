"use client";

import { useMemo, useRef, useState } from "react";
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

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col justify-center">
      <p className="tabular-nums text-[56px] font-semibold tracking-[-0.03em] text-black leading-none">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mt-2">
        {label}
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
  const openRatioPct = total > 0 ? (counts.open / total) * 100 : 0;
  const isHighActivity = total > 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => onView(session.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setTilt({ x: Math.max(-1, Math.min(1, y)) * 1, y: Math.max(-1, Math.min(1, x)) * -1 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const tiltStyle = isHovered
    ? {
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`,
      }
    : undefined;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(session.id);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="group relative bg-white rounded-[18px] px-8 py-7 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 active:translate-y-0 transition-[transform,box-shadow] duration-[180ms] ease-[cubic-bezier(.2,.8,.2,1)] shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.03)] hover:-translate-y-[6px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
      data-session-id={session.id}
    >
      {/* Top accent strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px] ${isHighActivity ? "bg-neutral-900" : "bg-neutral-300"}`}
        aria-hidden
      />
      <h2 className="text-[19px] font-medium tracking-[-0.01em] text-neutral-900 truncate">
        {session.title}
      </h2>
      <p className="text-[13px] text-neutral-400 mt-1">
        {formatLastUpdated(session.createdAt)}
      </p>
      <div className="mt-7 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[13px] text-neutral-500">Feedback</span>
          <span className="text-[16px] font-medium text-neutral-900 tabular-nums">{total}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[13px] text-neutral-500">Open issues</span>
          <span className="text-[16px] font-medium text-neutral-900 tabular-nums">{counts.open}</span>
        </div>
      </div>
      <div className="mt-7 h-[2px] rounded-full bg-neutral-200 overflow-hidden">
        <div
          className="h-[2px] rounded-full bg-neutral-900"
          style={{ width: `${openRatioPct}%` }}
          aria-hidden
        />
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
      <div className="min-h-[40vh] flex items-center justify-center bg-[#F6F7F8] px-8 pt-14 pb-24">
        <div className="w-full max-w-[1100px] mx-auto">
          <p className="text-[14px] text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex flex-col bg-[#F6F7F8] px-8 pt-14 pb-24">
      <div className="w-full max-w-[1100px] mx-auto flex flex-col">
        <header className="shrink-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-[44px] font-semibold tracking-[-0.04em] leading-[48px] text-black">
              Workspaces
            </h1>
            <p className="text-[16px] text-neutral-500 mt-3">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 px-4 border border-neutral-200 rounded-md text-[14px] text-black placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
              aria-label="Search sessions"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="h-10 px-4 border border-neutral-200 rounded-md text-[14px] text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300"
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
              className="h-10 px-5 bg-black text-white text-[14px] font-medium rounded-md hover:bg-neutral-900 transition-colors duration-150"
            >
              New Session
            </button>
          </div>
        </header>

        <section className="mt-14">
          <div className="grid grid-cols-4 gap-x-24">
            <StatItem label="Total Sessions" value={stats.totalSessions} />
            <StatItem label="Active Sessions" value={stats.activeSessions} />
            <StatItem label="Total Feedback Items" value={stats.totalFeedbackItems} />
            <StatItem label="Open Issues" value={stats.openIssues} />
          </div>
        </section>

        <main className="mt-16 flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-20 gap-y-20">
            {filteredSessions.map((item) => (
              <SessionCard
                key={item.session.id}
                item={item}
                onView={handleView}
              />
            ))}
          </div>
          {filteredSessions.length === 0 && (
            <p className="text-[14px] text-neutral-500 py-6">
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
