"use client";

import { FileText, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSessionsListJson } from "@/lib/api/fetchSessionsList";

export const OPEN_SEARCH_EVENT = "echly:open-search-overlay";

type SessionSearchResult = {
  id: string;
  title: string;
  archived?: boolean;
  updatedAt?: string | null;
};

function formatSessionMeta(s: SessionSearchResult): string {
  const base = "Session";
  if (!s.updatedAt) return base;
  try {
    const d = new Date(s.updatedAt);
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
  const [sessions, setSessions] = useState<SessionSearchResult[] | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

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

    const t = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    if (sessions === null) {
      fetchSessionsListJson()
        .then((data) => {
          const payload = data as { sessions?: SessionSearchResult[] };
          return payload.sessions ?? [];
        })
        .then((nextSessions) => setSessions(nextSessions))
        .catch(() => setSessions([]));
    }

    return () => cancelAnimationFrame(t);
  }, [open, sessions]);

  const recentSessions = useMemo(() => {
    if (!sessions) return [];
    return [...sessions]
      .filter((s) => !s.archived)
      .sort((a, b) => {
        const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 8);
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const q = query.trim().toLowerCase();
    const nonArchived = sessions.filter((s) => !s.archived);
    if (!q) return [];
    return nonArchived.filter((s) => (s.title ?? "").toLowerCase().includes(q)).slice(0, 12);
  }, [sessions, query]);

  if (!open) return null;

  const q = query.trim();
  const showIdleEmpty = sessions !== null && !q;
  const showNoMatches = sessions !== null && q.length > 0 && filteredSessions.length === 0;
  const showSearchResults = filteredSessions.length > 0;

  const navigateToSession = (id: string) => {
    router.push(`/dashboard/${id}`);
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

        {sessions === null ? (
          <div className="search-results-wrap">
            <div className="search-loading">Loading sessions…</div>
          </div>
        ) : showIdleEmpty ? (
          <div className="search-results-wrap search-results-wrap--scroll">
            {recentSessions.length === 0 ? (
              <div className="search-empty">
                <SearchIcon className="search-empty-icon" strokeWidth={2} aria-hidden />
                <h3>Search sessions</h3>
                <p>Find sessions by title — start typing to filter.</p>
              </div>
            ) : (
              <>
                <div className="search-results-section-label">Recent</div>
                <div className="search-results-list">
                  {recentSessions.map((s) => (
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
              showSearchResults && (
                <>
                  <div className="search-results-section-label">Sessions</div>
                  <div className="search-results-list">
                    {filteredSessions.map((s) => (
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
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
