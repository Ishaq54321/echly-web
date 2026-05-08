"use client";

import { useEffect, useState, useMemo, type MouseEvent as ReactMouseEvent } from "react";
import { X, Mic, Pen, ChevronLeft } from "lucide-react";
import { ECHLY_DEBUG } from "@/lib/utils/logger";
import type { SessionOption } from "./ResumeSessionModal";

type FilterKey = "all" | "week" | "month";

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
  const ms = { week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 };
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

const FILTER_ORDER: readonly FilterKey[] = ["all", "week", "month"] as const;
const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All sessions",
  week: "This week",
  month: "This month",
};

type PreviousFeedbackViewProps = {
  onBack: () => void;
  onClose: () => void;
  onResumeSession: (sessionId: string) => void;
  fetchSessions?: () => Promise<SessionOption[]>;
  onOpenLogin?: () => void;
  captureMode?: "voice" | "text";
  onModeChange?: (mode: "voice" | "text") => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
  onHeaderMouseDown?: (e: ReactMouseEvent) => void;
  logoUrl?: string;
};

export default function PreviousFeedbackView({
  onBack,
  onClose,
  onResumeSession,
  fetchSessions,
  captureMode = "voice",
  onModeChange,
  onHeaderMouseDown,
  logoUrl,
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
      <div
        className="pill-head"
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          onHeaderMouseDown?.(e);
        }}
        style={{ cursor: onHeaderMouseDown ? "grab" : undefined }}
      >
        <span className="pill-mark pill-mark-logo">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Annote"
              style={{ width: 24, height: 30, objectFit: "contain", display: "block" }}
            />
          ) : (
            "A"
          )}
        </span>
        <div className="pill-ws">
          <span className="pill-ws-name">Previous Sessions</span>
        </div>
        <div className="tl-icon-group">
          <button
            type="button"
            className="pill-icon-btn"
            onClick={() => onModeChange?.(captureMode === "voice" ? "text" : "voice")}
            aria-label="Toggle mode"
          >
            {captureMode === "voice" ? (
              <Mic size={13} strokeWidth={2.25} />
            ) : (
              <Pen size={13} strokeWidth={2.25} />
            )}
            <span className="echly-tooltip">{captureMode === "voice" ? "Text mode" : "Voice mode"}</span>
          </button>
          <button type="button" className="pill-icon-btn" onClick={onBack} aria-label="Back">
            <ChevronLeft size={13} strokeWidth={2.25} />
            <span className="echly-tooltip">Back</span>
          </button>
          <button type="button" className="pill-icon-btn" onClick={onClose} aria-label="Close">
            <X size={13} strokeWidth={2.25} />
            <span className="echly-tooltip">Minimize</span>
          </button>
        </div>
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
              placeholder="Search sessions by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sessions"
            />
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
          <div className="ps-chips-divider" />

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
                  ? "Start a session on any page to capture voice or written feedback. Annote will save it here."
                  : "Try a different search term or filter."}
              </div>
            </div>
          )}

          {/* Populated list */}
          {!loading && !error && filtered.length > 0 && (
            <div className="ps-list" onWheel={(e) => e.stopPropagation()}>
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
                      <span>{feedbackCount(s)} {feedbackCount(s) === 1 ? "Feedback Ticket" : "Feedback Tickets"}</span>
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
