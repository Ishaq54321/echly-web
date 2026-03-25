"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import type { Session } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

const PINNED_IDS_KEY = "echly-pinned-session-ids";

function getPinnedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PINNED_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function setPinnedIds(ids: Set<string>) {
  try {
    localStorage.setItem(PINNED_IDS_KEY, JSON.stringify([...ids]));
  } catch {}
}

export interface SessionNavigatorProps {
  sessions: SessionWithCounts[];
  currentSessionId: string | null;
  onSelectSession?: (sessionId: string) => void;
}

export function SessionNavigator({
  sessions,
  currentSessionId,
  onSelectSession,
}: SessionNavigatorProps) {
  const [pinnedIds, setPinnedIdsState] = useState<Set<string>>(() => getPinnedIds());

  const togglePinned = (sessionId: string) => {
    setPinnedIdsState((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      setPinnedIds(next);
      return next;
    });
  };

  const active = sessions.filter((s) => (s.session.isArchived ?? s.session.archived) !== true);
  const archived = sessions.filter((s) => (s.session.isArchived ?? s.session.archived) === true);
  const pinned = active.filter((s) => pinnedIds.has(s.session.id));
  const activeUnpinned = active.filter((s) => !pinnedIds.has(s.session.id));

  const renderRow = (s: SessionWithCounts) => {
    const open = s.counts.open;
    const isCurrent = s.session.id === currentSessionId;
    const isUnread = open > 0;
    const isPinned = pinnedIds.has(s.session.id);
    const href = `/dashboard/${s.session.id}`;
    const content = (
      <>
        <span className="shrink-0 w-2 flex items-center justify-center" aria-hidden>
          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />}
        </span>
        <span className="truncate text-[13px] text-[hsl(var(--text-primary-strong))]">
          {s.session.title || "Untitled"}
        </span>
        <span className="shrink-0 text-[11px] tabular-nums text-[hsl(var(--text-tertiary))]">
          {open}
        </span>
      </>
    );
    return (
      <div key={s.session.id} className="flex items-center gap-1 py-1.5 px-2 rounded-md group">
        {onSelectSession ? (
          <button
            type="button"
            onClick={() => onSelectSession(s.session.id)}
            className={`flex-1 min-w-0 flex items-center gap-2 text-left rounded-md py-1 px-1.5 -my-1 -mx-1.5 ${
              isCurrent ? "bg-white" : "hover:bg-black/[0.04]"
            }`}
          >
            {content}
          </button>
        ) : (
          <Link
            href={href}
            className={`flex-1 min-w-0 flex items-center gap-2 rounded-md py-1 px-1.5 -my-1 -mx-1.5 ${
              isCurrent ? "bg-white" : "hover:bg-black/[0.04]"
            }`}
          >
            {content}
          </Link>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinned(s.session.id); }}
          className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-70 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))]"
          aria-label={isPinned ? "Unpin" : "Pin"}
        >
          {isPinned ? <PinOff className="h-3 w-3" strokeWidth={1.5} /> : <Pin className="h-3 w-3" strokeWidth={1.5} />}
        </button>
      </div>
    );
  };

  return (
    <aside
      className="shrink-0 flex flex-col w-[220px] bg-[var(--structural-gray-ticket)] border-r border-[var(--layer-2-border)] min-h-0"
      aria-label="Sessions"
    >
      <div className="shrink-0 px-3 pt-3 pb-2">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
          Sessions
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
        {pinned.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-1 pb-1">
              Pinned
            </h3>
            {pinned.map((s) => renderRow(s))}
          </section>
        )}
        <section className="mb-3">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-1 pb-1">
            Active
          </h3>
          {activeUnpinned.length === 0 && pinned.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-tertiary))] px-2 py-1">None</p>
          ) : (
            activeUnpinned.map((s) => renderRow(s))
          )}
        </section>
        {archived.length > 0 && (
          <section>
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-1 pb-1">
              Archived
            </h3>
            {archived.map((s) => renderRow(s))}
          </section>
        )}
      </div>
    </aside>
  );
}
