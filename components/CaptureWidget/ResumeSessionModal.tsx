"use client";

import React, { useEffect, useState, useMemo } from "react";

export type SessionOption = {
  id: string;
  title: string;
  updatedAt?: string;
  openCount?: number;
  resolvedCount?: number;
  feedbackCount?: number;
  [key: string]: unknown;
};

export type ResumeSessionModalProps = {
  open: boolean;
  onClose: () => void;
  fetchSessions: () => Promise<SessionOption[]>;
  onSelectSession: (sessionId: string) => void;
};

type FilterKey = "today" | "7days" | "30days" | "all";

function filterSessions(
  sessions: SessionOption[],
  filter: FilterKey
): SessionOption[] {
  if (filter === "all") return sessions;
  const now = Date.now();
  const ms = { today: 24 * 60 * 60 * 1000, "7days": 7 * 24 * 60 * 60 * 1000, "30days": 30 * 24 * 60 * 60 * 1000 };
  const cutoff = now - ms[filter];
  return sessions.filter((s) => {
    const u = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
    return u >= cutoff;
  });
}

function formatLastUpdated(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function ResumeSessionModal({
  open,
  onClose,
  fetchSessions,
  onSelectSession,
}: ResumeSessionModalProps) {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setFilter("all");
    setError(null);
    setLoading(true);
    fetchSessions()
      .then((list) => setSessions(list))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load sessions"))
      .finally(() => setLoading(false));
  }, [open, fetchSessions]);

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

  const feedbackCount = (s: SessionOption): number => {
    if (typeof s.feedbackCount === "number") return s.feedbackCount;
    const open = typeof s.openCount === "number" ? s.openCount : 0;
    const resolved = typeof s.resolvedCount === "number" ? s.resolvedCount : 0;
    const skipped = typeof (s as Record<string, unknown>).skippedCount === "number" ? (s as Record<string, unknown>).skippedCount as number : 0;
    return open + resolved + skipped;
  };

  if (!open) return null;

  return (
    <div
      data-echly-ui="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-session-modal-title"
    >
      <div
        style={{
          width: "min(420px, 100%)",
          maxHeight: "85vh",
          borderRadius: 16,
          background: "rgba(20,22,28,0.98)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 id="resume-session-modal-title" style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>
            Resume Feedback Session
          </h2>
          <input
            type="search"
            placeholder="Search sessions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sessions"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.95)",
              fontSize: 14,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {(["today", "7days", "30days", "all"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: filter === key ? "rgba(37, 99, 235, 0.4)" : "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {key === "today" ? "Today" : key === "7days" ? "Last 7 days" : key === "30days" ? "Last 30 days" : "All sessions"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 200, maxHeight: 360 }}>
          {loading && (
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
              Loading sessions…
            </div>
          )}
          {error && (
            <div style={{ padding: 24, color: "#ef4444", fontSize: 14 }}>
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
              No sessions match.
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 8 }}>
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 14,
                      cursor: "pointer",
                      marginBottom: 4,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{s.title?.trim() || "Untitled Session"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      {feedbackCount(s)} feedback items · {formatLastUpdated(s.updatedAt)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
