"use client";

import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatFullDateTime } from "@/lib/utils/date";

export interface WorkspaceCardProps {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
  index: number;
}

export function WorkspaceCard({ item, onView, index }: WorkspaceCardProps) {
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
      <div className={`flex items-center gap-2 min-w-0 ${!isActive ? "opacity-90" : ""}`}>
        <svg
          className="shrink-0 w-[14px] h-[14px] text-[hsl(var(--text-secondary))] transition-colors duration-150 group-hover:text-[hsl(var(--brand))]"
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

      <div className={`mt-1.5 text-[14px] text-neutral-600 ${!isActive ? "opacity-[0.85]" : ""}`}>
        {feedbackCount} Feedback ·{" "}
        <span className={openIssues > 0 ? "text-[var(--color-brand-primary)]" : ""}>{openIssues}</span> Open
      </div>

      <div className="mt-1.5 flex justify-between items-center">
        <span className="text-xs text-[hsl(var(--text-secondary))] tracking-tight">
          {/* Per-session only: this session's last activity, not global or other sessions */}
          Last activity · {formatFullDateTime(session.updatedAt ?? session.createdAt)}
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
