"use client";

import { useEffect, useState, useMemo } from "react";
import { ECHLY_DEBUG } from "@/lib/utils/logger";
import type { SessionOption } from "./ResumeSessionModal";

type FilterKey = "today" | "7days" | "30days" | "all";

function sessionUpdatedAtToMs(value: SessionOption["updatedAt"]): number {
  if (value == null) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") return new Date(value).getTime();
  if (typeof value === "object" && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

function filterSessions(sessions: SessionOption[], filter: FilterKey): SessionOption[] {
  if (filter === "all") return sessions;
  const now = Date.now();
  const ms = { today: 24 * 60 * 60 * 1000, "7days": 7 * 24 * 60 * 60 * 1000, "30days": 30 * 24 * 60 * 60 * 1000 };
  const cutoff = now - ms[filter];
  return sessions.filter((s) => sessionUpdatedAtToMs(s.updatedAt) >= cutoff);
}

function formatLastUpdated(value?: SessionOption["updatedAt"]): string {
  const t = sessionUpdatedAtToMs(value);
  if (!t) return "—";
  const d = new Date(t);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

const FILTER_ORDER: readonly FilterKey[] = ["all", "today", "7days", "30days"] as const;
const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All sessions",
  today: "Today",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
};

type PreviousFeedbackViewProps = {
  onBack: () => void;
  onClose: () => void;
  onResumeSession: (sessionId: string) => void;
  fetchSessions?: () => Promise<SessionOption[]>;
  onOpenLogin?: () => void;
};

export default function PreviousFeedbackView({
  onBack,
  onClose,
  onResumeSession,
  fetchSessions,
}: PreviousFeedbackViewProps) {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    setSearch("");
    setFilter("all");
    setError(null);
    let isMounted = true;

    const load = async () => {
      if (ECHLY_DEBUG) console.debug("[ECHLY UX] fetching sessions for PreviousFeedbackView");
      setLoading(true);
      try {
        const data = await fetchSessions?.();
        if (isMounted) {
          setSessions(data ?? []);
          if (ECHLY_DEBUG) console.debug("[ECHLY UX] sessions loaded:", data?.length ?? 0);
        }
      } catch (e) {
        console.error("[ECHLY UX] failed to load sessions", e);
        if (isMounted) setError(e instanceof Error ? e.message : "Failed to load sessions");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [fetchSessions]);

  const filtered = useMemo(() => {
    let list = filterSessions(sessions, filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.title ?? "").toLowerCase().includes(q) ||
          (s.id ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [sessions, filter, search]);

  const feedbackCount = (s: SessionOption): number => s.counts?.total ?? 0;

  return (
    <div className="pill pill-md">
      {/* Header */}
      <div className="pill-head">
        <span className="pill-mark">E</span>
        <div className="pill-ws">
          <span className="pill-ws-name">Previous Feedback</span>
        </div>
        <button type="button" className="pill-icon-btn" onClick={onBack} aria-label="Back">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M9.5 4L5.5 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="pill-icon-btn" onClick={onClose} aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="pill-rule" />

      <>
          {/* Search */}
          <div className="ps-search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search sessions, tickets, pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sessions"
            />
            <span className="ps-search-shortcut">⌘ K</span>
          </div>

          {/* Filter chips */}
          <div className="ps-chips">
            {FILTER_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={`ps-chip${filter === key ? " active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {FILTER_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="ps-empty">
              <div className="ps-empty-sub">Loading sessions…</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="ps-empty">
              <div className="ps-empty-sub" style={{ color: "var(--danger)" }}>{error}</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="ps-empty">
              <div className="ps-empty-art">
                <span className="sheet s1" />
                <span className="sheet s2" />
                <span className="glow" />
              </div>
              <div className="ps-empty-title">
                {sessions.length === 0 ? "No previous sessions yet" : "No sessions match"}
              </div>
              <div className="ps-empty-sub">
                {sessions.length === 0
                  ? "Start a session on any page to capture voice or written feedback. Echly will save it here."
                  : "Try a different search term or filter."}
              </div>
            </div>
          )}

          {/* Populated list */}
          {!loading && !error && filtered.length > 0 && (
            <div className="ps-list">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="ps-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => onResumeSession(s.id)}
                  onKeyDown={(e) => e.key === "Enter" && onResumeSession(s.id)}
                >
                  <span className="ps-row-icon">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M3 2.5h6.5L13 6v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M9 2.5V6h4M5 9h6M5 11.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="ps-row-main">
                    <div className="ps-row-title">{s.title?.trim() || "Untitled Session"}</div>
                    <div className="ps-row-meta">
                      <span><b style={{ color: "var(--ink)", fontWeight: 600 }}>{feedbackCount(s)}</b> feedback items</span>
                      <span className="pip" />
                      <span>{formatLastUpdated(s.updatedAt)}</span>
                    </div>
                  </div>
                  <span className="ps-row-time">{formatLastUpdated(s.updatedAt)}</span>
                </div>
              ))}
            </div>
          )}
      </>

      {/* Footer close */}
      <div className="ps-cancel-row">
        <button type="button" className="ps-cancel" onClick={onBack}>Close</button>
      </div>
    </div>
  );
}
