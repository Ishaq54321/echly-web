"use client";

import { FileText, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";
import { useWorkspace } from "@/lib/client/workspaceContext";
import type { Session, SharedSessionMembership } from "@/lib/domain/session";
import { SESSION_FEEDBACK_PATH } from "@/utils/getSessionLink";
import { authFetch } from "@/lib/authFetch";
import { toMillis } from "@/lib/utils/timestamp";

export const OPEN_SEARCH_EVENT = "annote:open-search-overlay";

function sessionUpdatedMs(updatedAt: Session["updatedAt"]): number {
  return toMillis(updatedAt) ?? 0;
}

function formatSessionMeta(s: Session): string {
  const base = "Session";
  const ms = sessionUpdatedMs(s.updatedAt);
  if (ms === 0) return base;
  try {
    const d = new Date(ms);
    const now = Date.now();
    const diff = now - d.getTime();
    const day = 86400000;
    if (diff < day) return `${base} · Today`;
    if (diff < day * 7) return `${base} · This week`;
    return `${base} · Updated`;
  } catch {
    return base;
  }
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sharedSessions, setSharedSessions] = useState<SharedSessionMembership[]>([]);
  const { sessions: sessionsWithCounts, loading } = useWorkspaceStore();
  const { workspaceName } = useWorkspace();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const sessionList = useMemo(
    () => sessionsWithCounts.map(({ session }) => session),
    [sessionsWithCounts]
  );

  const filteredSessions = useMemo(() => {
    const q = query.trim();
    if (!q) return sessionList;

    return sessionList.filter((session) =>
      (session.title ?? "").toLowerCase().includes(q.toLowerCase())
    );
  }, [sessionList, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase?.() ?? e.key;
      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    authFetch("/api/sessions/shared")
      .then((r) => {
        if (!r || !r.ok) return;
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const list: SharedSessionMembership[] =
          data?.data?.sessions ?? [];
        setSharedSessions(list.filter((s) => !s.isArchived));
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const t = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(t);
  }, [open]);

  const q = query.trim();
  const searchMatches = useMemo(() => {
    if (!q) return [];
    return filteredSessions
      .filter((s) => (s.isArchived ?? s.archived) !== true)
      .slice(0, 12);
  }, [filteredSessions, q]);

  const sharedMatches = useMemo(() => {
    if (!q) return [];
    return sharedSessions
      .filter((s) => (s.sessionName ?? "").toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8);
  }, [sharedSessions, q]);

  if (!open) return null;

  const showIdleEmpty = !loading && !q;
  const showNoMatches =
    !loading && q.length > 0 && searchMatches.length === 0 && sharedMatches.length === 0;
  const showSearchResults = searchMatches.length > 0;

  const navigateToSession = (id: string) => {
    router.push(`${SESSION_FEEDBACK_PATH}/${id}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search sessions"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="search-box" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search sessions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search sessions"
          autoComplete="off"
        />

        {loading ? (
          <div className="search-results-wrap">
            <div className="search-loading">Loading sessions…</div>
          </div>
        ) : showIdleEmpty ? (
          <div className="search-results-wrap">
            <div className="search-empty">
              <SearchIcon className="search-empty-icon" strokeWidth={2} aria-hidden />
              <h3>Search sessions</h3>
              <p>Find sessions by title — start typing to filter.</p>
            </div>
          </div>
        ) : (
          <div className="search-results-wrap search-results-wrap--scroll">
            {showNoMatches ? (
              <div className="search-no-match">
                <SearchIcon className="search-no-match-icon" strokeWidth={2} aria-hidden />
                <p>No sessions match &ldquo;{q}&rdquo;</p>
                <span>Try another keyword.</span>
              </div>
            ) : (
              <>
                {showSearchResults && (
                  <>
                    <div className="search-results-section-label">{workspaceName ?? "Workspace"}</div>
                    <div className="search-results-list">
                      {searchMatches.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="search-result-item"
                          onClick={() => navigateToSession(s.id)}
                        >
                          <div className="search-result-item-left" aria-hidden>
                            <FileText className="search-result-file-icon" strokeWidth={2} />
                          </div>
                          <div className="search-result-item-content">
                            <p className="search-result-item-title">{s.title}</p>
                            <span className="search-result-item-meta">{formatSessionMeta(s)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {sharedMatches.length > 0 && (
                  <>
                    <div className="search-results-section-label">Shared with me</div>
                    <div className="search-results-list">
                      {sharedMatches.map((s) => (
                        <button
                          key={s.sessionId}
                          type="button"
                          className="search-result-item"
                          onClick={() => navigateToSession(s.sessionId)}
                        >
                          <div className="search-result-item-left" aria-hidden>
                            <FileText className="search-result-file-icon" strokeWidth={2} />
                          </div>
                          <div className="search-result-item-content">
                            <p className="search-result-item-title">{s.sessionName}</p>
                            <span className="search-result-item-meta">
                              {s.workspaceName ? `Shared · ${s.workspaceName}` : "Shared with me"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
