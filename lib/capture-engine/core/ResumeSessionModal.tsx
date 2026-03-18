"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { FileText } from "lucide-react";

export type SessionOption = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  openCount?: number;
  resolvedCount?: number;
  feedbackCount?: number;
  /** True until GET /api/sessions/:id has been applied (title, createdAt, feedbackCount, etc.). */
  isLoading?: boolean;
  [key: string]: unknown;
};

export type ResumeSessionModalProps = {
  open: boolean;
  onClose: () => void;
  /** Cursor-based paginated fetch: initial limit=25, then limit=25&cursor. Required. */
  fetchSessionsPage: (opts: { limit: number; cursor?: string | null }) => Promise<{ data: SessionOption[]; nextCursor: string | null; totalCount: number }>;
  /** Optional: fetch single session detail for lazy hydration (feedbackCount, updatedAt). When provided, each row hydrates in background after list load. */
  fetchSessionDetail?: (sessionId: string) => Promise<Partial<SessionOption> | null>;
  onSelectSession: (sessionId: string) => void;
  /** Theme for modal (dark/light). Defaults to "dark". */
  theme?: "dark" | "light";
  /** Extension: run before loading sessions. If returns false, show login-required UI and do not call fetchSessionsPage. */
  checkAuth?: () => Promise<boolean>;
  /** Extension: called when user clicks "Open Login" in login-required state. */
  onOpenLogin?: () => void;
  /** When this value changes while modal is open, refetch first page and set totalCount from API (e.g. after new session created or cache invalidated). */
  sessionListVersion?: number;
};

const INITIAL_PAGE_LIMIT = 25;
const SKELETON_ROWS = 4;

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

const FILTER_ORDER: readonly FilterKey[] = ["all", "today", "7days", "30days"] as const;
const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All sessions",
  today: "Today",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
};

const CONCURRENCY = 3;

/** Run items with a concurrency limit. */
async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      results[i] = await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export function ResumeSessionModal({
  open,
  onClose,
  fetchSessionsPage,
  fetchSessionDetail,
  onSelectSession,
  theme = "dark",
  checkAuth,
  onOpenLogin,
  sessionListVersion,
}: ResumeSessionModalProps) {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loginRequired, setLoginRequired] = useState(false);
  const isLight = theme === "light";
  const hasLoadedRef = useRef(false);
  const hasHydratedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevSessionListVersionRef = useRef<number | undefined>(sessionListVersion);

  /** Refetch first page when sessionListVersion changes (e.g. after new session created or cache invalidated). */
  useEffect(() => {
    if (!open || sessionListVersion === undefined) return;
    if (prevSessionListVersionRef.current === sessionListVersion) return;
    prevSessionListVersionRef.current = sessionListVersion;
    let isMounted = true;
    (async () => {
      try {
        const res = await fetchSessionsPage({ limit: INITIAL_PAGE_LIMIT });
        if (!isMounted) return;
        setSessions(res.data.map((s) => ({ ...s, isLoading: true })));
        setCursor(res.nextCursor);
        setHasMore(!!res.nextCursor);
        setTotalCount(res.totalCount);
        const list = res.data;
        if (fetchSessionDetail && list.length > 0) {
          runWithConcurrency(list, CONCURRENCY, async (s) => {
            let detail: Partial<SessionOption> | null = null;
            try {
              detail = await fetchSessionDetail(s.id);
            } catch {
              // leave detail null
            }
            if (!isMounted) return null;
            setSessions((prev) =>
              prev.map((x) =>
                x.id === s.id ? { ...x, ...(detail ?? {}), isLoading: false } : x
              )
            );
            return detail;
          }).catch(() => {});
        } else if (list.length > 0) {
          setSessions((prev) =>
            prev.map((s) => ({ ...s, isLoading: false }))
          );
        }
      } catch (e) {
        console.error("[ECHLY UX] refetch sessions failed", e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [open, sessionListVersion, fetchSessionsPage, fetchSessionDetail]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchSessionsPage({ limit: INITIAL_PAGE_LIMIT, cursor: cursor || undefined });
      const newSessions = res.data.map((s) => ({ ...s, isLoading: true }));
      setSessions((prev) => [...prev, ...newSessions]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
      if (fetchSessionDetail && newSessions.length > 0) {
        runWithConcurrency(newSessions, CONCURRENCY, async (s) => {
          let detail: Partial<SessionOption> | null = null;
          try {
            detail = await fetchSessionDetail(s.id);
          } catch {
            // clear isLoading so row shows list data
          }
          setSessions((prev) =>
            prev.map((x) =>
              x.id === s.id ? { ...x, ...(detail ?? {}), isLoading: false } : x
            )
          );
          return detail;
        }).catch(() => {});
      } else if (newSessions.length > 0) {
        setSessions((prev) =>
          prev.map((x) =>
            newSessions.some((n) => n.id === x.id) ? { ...x, isLoading: false } : x
          )
        );
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchSessionsPage, fetchSessionDetail, isLoadingMore, hasMore, cursor]);

  useEffect(() => {
    if (!open) return;
    prevSessionListVersionRef.current = sessionListVersion ?? 0;
    setSearch("");
    setFilter("all");
    setError(null);
    setLoginRequired(false);
    setSessions([]);
    setCursor(null);
    setHasMore(true);
    setTotalCount(0);
    hasLoadedRef.current = false;
    let isMounted = true;

    const loadSessions = async () => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      setLoading(true);
      try {
        if (checkAuth) {
          const valid = await checkAuth();
          if (!isMounted) return;
          if (!valid) {
            setLoginRequired(true);
            setLoading(false);
            return;
          }
        }
        const res = await fetchSessionsPage({ limit: INITIAL_PAGE_LIMIT });
        if (!isMounted) return;
        setSessions(
          res.data.map((s) => ({
            ...s,
            isLoading: true,
          }))
        );
        setCursor(res.nextCursor);
        setHasMore(!!res.nextCursor);
        setTotalCount(res.totalCount);
        const list = res.data;
        if (fetchSessionDetail && list.length > 0) {
          hasHydratedRef.current = true;
          runWithConcurrency(list, CONCURRENCY, async (s) => {
            let detail: Partial<SessionOption> | null = null;
            try {
              detail = await fetchSessionDetail(s.id);
            } catch {
              // leave detail null; we still clear isLoading so row shows list data
            }
            if (!isMounted) return null;
            setSessions((prev) =>
              prev.map((x) =>
                x.id === s.id ? { ...x, ...(detail ?? {}), isLoading: false } : x
              )
            );
            return detail;
          }).catch(() => {});
        } else if (list.length > 0) {
          setSessions((prev) =>
            prev.map((s) => ({ ...s, isLoading: false }))
          );
        }
      } catch (e) {
        console.error("[ECHLY UX] failed to load sessions", e);
        if (isMounted) setError(e instanceof Error ? e.message : "Failed to load sessions");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [open, fetchSessionsPage, fetchSessionDetail, checkAuth]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const onScroll = () => {
      if (isLoadingMore || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight * 0.7) {
        loadMore();
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isLoadingMore, hasMore, loadMore]);

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

  const feedbackSubline = (s: SessionOption): string => {
    if (s.isLoading === true) return "Loading...";
    const n = feedbackCount(s);
    const items = n === 1 ? "feedback item" : "feedback items";
    return `${n} ${items} · ${formatLastUpdated(s.updatedAt ?? s.createdAt)}`;
  };

  const sessionTitle = (s: SessionOption): string => {
    if (s.isLoading === true) return "Loading...";
    return (s.title?.trim() || "Untitled Session");
  };

  if (!open) return null;

  return (
    <div
      data-echly-ui="true"
      data-resume-theme={theme}
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
      <style>{`
        .echly-resume-session-item:hover {
          background: rgba(255,255,255,.04);
          transform: translateY(-1px);
          transition: all 120ms ease;
        }
        [data-resume-theme="light"] .echly-resume-session-item:hover {
          background: rgba(0,0,0,.04);
        }
        .echly-resume-cancel-button:hover {
          background: rgba(255,255,255,.06);
          transform: translateY(-1px);
          transition: all 120ms ease;
        }
        [data-resume-theme="light"] .echly-resume-cancel-button:hover {
          background: rgba(0,0,0,.06);
        }
      `}</style>
      <div
        style={{
          width: "min(420px, 100%)",
          maxHeight: "85vh",
          borderRadius: 18,
          background: isLight ? "white" : "rgba(20,22,28,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: '"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: 20,
          borderBottom: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
        }}>
          <h2
            id="resume-session-modal-title"
            style={{
              margin: loginRequired ? 0 : "0 0 16px",
              fontSize: 18,
              fontWeight: 600,
              color: isLight ? "#1F2937" : "#F3F4F6",
            }}
          >
            {loginRequired ? "Previous Sessions" : "Resume Feedback Session"}
          </h2>
          {!loginRequired && (loading || sessions.length > 0 || totalCount > 0) && (
            <p style={{ margin: "0 0 12px", fontSize: 13, color: isLight ? "rgba(0,0,0,.55)" : "#A1A1AA" }}>
              {loading ? "Loading…" : `${totalCount} session${totalCount === 1 ? "" : "s"}`}
            </p>
          )}
          {!loginRequired && (
            <>
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
                  borderRadius: 10,
                  border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
                  background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                  color: isLight ? "#1F2937" : "#F3F4F6",
                  fontSize: 14,
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {FILTER_ORDER.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: filter === key ? "1px solid rgba(59,130,246,.45)" : "1px solid transparent",
                      background: filter === key ? "rgba(59,130,246,.18)" : isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
                      color: filter === key ? "#60A5FA" : isLight ? "#1F2937" : "#F3F4F6",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {FILTER_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div ref={scrollContainerRef} style={{ flex: 1, overflow: "auto", minHeight: 200, maxHeight: 360 }}>
          {loginRequired && onOpenLogin && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              minHeight: 240,
              textAlign: "center",
            }}>
              <span style={{ fontSize: 40, marginBottom: 16 }} aria-hidden>🔒</span>
              <h3 style={{
                margin: "0 0 8px",
                fontSize: 18,
                fontWeight: 600,
                color: isLight ? "#1F2937" : "#F3F4F6",
              }}>
                Sign in to continue
              </h3>
              <p style={{
                margin: "0 0 20px",
                fontSize: 14,
                color: isLight ? "rgba(0,0,0,.6)" : "#A1A1AA",
                maxWidth: 320,
              }}>
                To view your previous sessions, please sign in to your Echly dashboard.
              </p>
              <button
                type="button"
                onClick={() => {
                  onOpenLogin();
                  onClose();
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "#3B82F6",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Open Login
              </button>
            </div>
          )}
          {!loginRequired && loading && (
            <div style={{
              padding: 24,
              textAlign: "center",
              color: isLight ? "rgba(0,0,0,.55)" : "#A1A1AA",
              fontSize: 14,
            }}>
              <span className="echly-spinner" style={{ display: "inline-block", marginRight: 8, verticalAlign: "middle" }} aria-hidden />
              Loading previous sessions...
            </div>
          )}
          {!loginRequired && error && (
            <div style={{ padding: 24, color: "#EF4444", fontSize: 14 }}>
              {error}
            </div>
          )}
          {!loginRequired && !loading && !error && filtered.length === 0 && (
            <div style={{
              padding: 24,
              textAlign: "center",
              color: isLight ? "rgba(0,0,0,.55)" : "#A1A1AA",
              fontSize: 14,
            }}>
              {totalCount === 0 && sessions.length === 0 ? "No previous sessions yet" : "No sessions match."}
            </div>
          )}
          {!loginRequired && !loading && !error && filtered.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 12 }}>
              {filtered.map((s) => (
                <li key={s.id} style={{ marginBottom: 4 }}>
                  <button
                    type="button"
                    className="echly-resume-session-item"
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "none",
                      background: "transparent",
                      color: isLight ? "#1F2937" : "#F3F4F6",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <FileText
                      className="echly-resume-session-icon"
                      style={{
                        width: 18,
                        height: 18,
                        color: isLight ? "#111827" : "white",
                        opacity: 0.9,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{sessionTitle(s)}</div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isLight ? "rgba(0,0,0,.55)" : "#A1A1AA",
                        marginTop: 4,
                      }}>
                        {feedbackSubline(s)}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {isLoadingMore && Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <li key={`skeleton-${i}`} style={{ marginBottom: 4 }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ height: 14, borderRadius: 4, background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)", width: "70%", marginBottom: 8 }} />
                      <div style={{ height: 12, borderRadius: 4, background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", width: "50%" }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{
          padding: 16,
          borderTop: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
        }}>
          <button
            type="button"
            className="echly-resume-cancel-button"
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: isLight ? "rgba(0,0,0,.55)" : "#A1A1AA",
              fontSize: 13,
              fontWeight: 500,
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
