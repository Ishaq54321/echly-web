"use client";

import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatLastActivity } from "./formatLastActivity";

export interface ActiveSessionsSectionProps {
  items: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

const MAX_ITEMS = 5;

export function ActiveSessionsSection({ items, onView }: ActiveSessionsSectionProps) {
  const list = items.slice(0, MAX_ITEMS);
  if (list.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)] py-5 px-5 shadow-[var(--shadow-level-1)]"
      aria-label="Active Sessions"
    >
      <h2 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] mb-4">
        Active Sessions
      </h2>
      <ul className="flex flex-col gap-0.5">
        {list.map(({ session, counts }) => {
          const open = counts?.open;
          const last = formatLastActivity(session.updatedAt);
          const metaParts = [
            open != null ? `${open} open` : null,
            last || null,
          ].filter(Boolean) as string[];
          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onView(session.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-transparent hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-ring)] flex items-center justify-between gap-4"
              >
                {session.title?.trim() ? (
                  <span className="text-[14px] font-semibold leading-[1.4] text-[hsl(var(--text-primary-strong))] truncate min-w-0">
                    {session.title}
                  </span>
                ) : (
                  <span className="min-w-0 flex-1" />
                )}
                {metaParts.length > 0 ? (
                  <span className="text-[12px] text-[hsl(var(--text-tertiary))] shrink-0 tabular-nums">
                    {metaParts.join(" · ")}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
