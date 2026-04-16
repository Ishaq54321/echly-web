"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import type { Session } from "@/lib/domain/session";
import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/domain/session";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { SESSION_FEEDBACK_PATH } from "@/utils/getSessionLink";

const SESSIONS_CACHE_PREFIX = "echly_sessions";

function sessionsCacheKey(uid: string): string {
  return `${SESSIONS_CACHE_PREFIX}:${uid}`;
}

function filterSessionsByView(sessions: Session[], archivedOnly: boolean): Session[] {
  if (!archivedOnly) return sessions;
  return sessions.filter((s) => (s.isArchived ?? s.archived) === true);
}

function readCachedSessions(uid: string): Session[] | null {
  if (!uid) return null;
  try {
    const cached = sessionStorage.getItem(sessionsCacheKey(uid));
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as Session[]) : null;
  } catch {
    return null;
  }
}

function writeCachedSessions(uid: string, sessions: Session[]) {
  if (!uid) return;
  try {
    sessionStorage.setItem(sessionsCacheKey(uid), JSON.stringify(sessions));
  } catch {
    // Ignore cache write errors (private mode/quota).
  }
}

type SessionsBootstrapResult =
  | { ok: true; sessions: Session[]; hasMore: boolean; nextCursor: string | null }
  | { ok: false };

/**
 * Parsed bootstrap result per uid (not `Response`) so Strict Mode remounts can await the same
 * promise without double-consuming the body. Successful entries stay until logout / account switch.
 */
const sessionsBootstrapPromiseByUid = new Map<string, Promise<SessionsBootstrapResult>>();

let lastSessionsBootstrapUid: string | null = null;

async function fetchSessionsBootstrapFromNetwork(): Promise<SessionsBootstrapResult> {
  try {
    const res = await authFetch("/api/sessions", { cache: "no-store" });
    if (!res?.ok) return { ok: false };
    const data = await res.json().catch(() => ({}));
    const list = sessionsArrayFromApiPayload(data);
    const next = list.map((s) => {
      const archived = (s.archived ?? s.isArchived) === true;
      return { ...s, archived, isArchived: archived };
    });
    const payload = data as { data?: { nextCursor?: string | null; hasMore?: boolean } };
    const envelope = payload?.data ?? {};
    const hasMore = envelope.hasMore === true && typeof envelope.nextCursor === "string";
    const nextCursor = hasMore ? envelope.nextCursor ?? null : null;
    return { ok: true, sessions: next, hasMore, nextCursor };
  } catch {
    return { ok: false };
  }
}

/** Ticket counts from `sessions/{id}` denormalized fields / API session list. */
export function countsFromSessionFields(session: Session): SessionFeedbackCounts {
  const open = session.openCount ?? 0;
  const resolved = session.resolvedCount ?? 0;
  const total =
    typeof session.totalCount === "number"
      ? session.totalCount
      : typeof session.feedbackCount === "number"
        ? session.feedbackCount
        : 0;
  return { total, open, resolved };
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

/** Session list from GET /api/sessions (permission and scoping enforced on the server). */
export function useWorkspaceOverviewState(viewMode: ViewMode = "all") {
  const { claimsReady, authUid, isIdentityResolved, isIdentityReady } = useWorkspace();
  const router = useRouter();
  const userIdRef = useRef<string | null>(null);
  const allSessionsRef = useRef<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [awaitingSessions, setAwaitingSessions] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);
  const sessionsSourceUserRef = useRef<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const bootstrapInFlightRef = useRef<Promise<SessionsBootstrapResult> | null>(null);
  const bootstrapCompletedRef = useRef(false);
  const userId = authUid;

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    allSessionsRef.current = allSessions;
  }, [allSessions]);

  useEffect(() => {
    bootstrapCompletedRef.current = false;
    bootstrapInFlightRef.current = null;

    console.log("\u{1F504} RESET BOOTSTRAP (user changed)", { userId });
  }, [userId]);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid || !isIdentityReady) return;
    setAwaitingSessions(true);
    nextCursorRef.current = null;
    setHasMoreSessions(false);
    setLoadingMoreSessions(false);
    try {
      const res = await authFetch("/api/sessions", { cache: "no-store" });
      if (!res?.ok) {
        setAwaitingSessions(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const list = sessionsArrayFromApiPayload(data);
      const next = list.map((s) => {
        const archived = (s.archived ?? s.isArchived) === true;
        return { ...s, archived, isArchived: archived };
      });
      const payload = data as { data?: { nextCursor?: string | null; hasMore?: boolean } };
      const envelope = payload?.data ?? {};
      const hasMore = envelope.hasMore === true && typeof envelope.nextCursor === "string";
      nextCursorRef.current = hasMore ? envelope.nextCursor ?? null : null;
      setHasMoreSessions(hasMore);
      sessionsSourceUserRef.current = uid;
      setAllSessions(next);
      writeCachedSessions(uid, next);
      sessionsBootstrapPromiseByUid.set(
        uid,
        Promise.resolve({
          ok: true,
          sessions: next,
          hasMore,
          nextCursor: hasMore ? envelope.nextCursor ?? null : null,
        })
      );
    } catch (e) {
      console.error("[ECHLY] refreshSessions failed", e);
    } finally {
      setAwaitingSessions(false);
    }
  }, [isIdentityReady]);

  useEffect(() => {
    if (!userId) {
      sessionsBootstrapPromiseByUid.clear();
      lastSessionsBootstrapUid = null;
      sessionsSourceUserRef.current = null;
      setAwaitingSessions(false);
      setHasMoreSessions(false);
      setLoadingMoreSessions(false);
      nextCursorRef.current = null;
      return;
    }

    const uid = userId;

    if (lastSessionsBootstrapUid !== uid) {
      if (lastSessionsBootstrapUid) {
        sessionsBootstrapPromiseByUid.delete(lastSessionsBootstrapUid);
      }
      lastSessionsBootstrapUid = uid;
    }

    if (!isIdentityReady) {
      setAwaitingSessions(true);
      return;
    }

    sessionsSourceUserRef.current = uid;
    const cached = readCachedSessions(uid);
    if (Array.isArray(cached) && cached.length > 0) {
      setAllSessions(cached);
    } else {
      setAllSessions([]);
    }

    if (bootstrapCompletedRef.current) {
      console.log("\u{1F6AB} BOOTSTRAP BLOCKED (already completed)", { uid });
      setAwaitingSessions(false);
      return;
    }

    if (bootstrapInFlightRef.current) {
      console.log("\u{1F6AB} BOOTSTRAP BLOCKED (in-flight)", { uid });
      return;
    }

    console.log("\u{1F680} BOOTSTRAP START", { uid });

    let bootstrapPromise = sessionsBootstrapPromiseByUid.get(uid);
    if (!bootstrapPromise) {
      const promise = (async () => {
        try {
          const result = await fetchSessionsBootstrapFromNetwork();
          return result;
        } catch (e) {
          console.error("\u{274C} BOOTSTRAP FAILED", e);
          throw e;
        }
      })();
      bootstrapPromise = promise.then((r) => {
        if (!r.ok) sessionsBootstrapPromiseByUid.delete(uid);
        return r;
      });
      sessionsBootstrapPromiseByUid.set(uid, bootstrapPromise);
    }

    bootstrapInFlightRef.current = bootstrapPromise;

    bootstrapPromise
      .then((result) => {
        if (result && result.ok) {
          bootstrapCompletedRef.current = true;
          console.log("\u{2705} BOOTSTRAP COMPLETED", { uid });
        } else {
          bootstrapInFlightRef.current = null;
        }
      })
      .catch(() => {
        bootstrapInFlightRef.current = null;
      });

    setAwaitingSessions(true);
    setHasMoreSessions(false);
    setLoadingMoreSessions(false);
    nextCursorRef.current = null;

    let cancelled = false;

    void (async () => {
      try {
        const result = await bootstrapPromise;
        if (cancelled) return;
        if (userIdRef.current !== uid) return;
        if (!result.ok) {
          setAwaitingSessions(false);
          return;
        }
        nextCursorRef.current = result.hasMore ? result.nextCursor : null;
        setHasMoreSessions(result.hasMore);
        sessionsSourceUserRef.current = uid;
        setAllSessions(result.sessions);
        writeCachedSessions(uid, result.sessions);
      } catch (e) {
        if (cancelled) return;
        console.error("[ECHLY] GET /api/sessions failed", e);
        sessionsBootstrapPromiseByUid.delete(uid);
        bootstrapInFlightRef.current = null;
      } finally {
        if (!cancelled) setAwaitingSessions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isIdentityReady]);

  const loadMoreSessions = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid || !isIdentityReady) return;
    if (loadingMoreSessions) return;
    const cursor = nextCursorRef.current;
    if (!cursor) return;
    setLoadingMoreSessions(true);
    try {
      const res = await authFetch(`/api/sessions?cursor=${encodeURIComponent(cursor)}`, {
        cache: "no-store",
      });
      if (!res?.ok) return;
      const data = await res.json().catch(() => ({}));
      const incoming = sessionsArrayFromApiPayload(data).map((s) => {
        const archived = (s.archived ?? s.isArchived) === true;
        return { ...s, archived, isArchived: archived };
      });
      const payload = data as { data?: { nextCursor?: string | null; hasMore?: boolean } };
      const envelope = payload?.data ?? {};
      const nextHasMore = envelope.hasMore === true && typeof envelope.nextCursor === "string";
      nextCursorRef.current = nextHasMore ? envelope.nextCursor ?? null : null;
      setHasMoreSessions(nextHasMore);
      setAllSessions((prev) => {
        const merged = [...prev, ...incoming];
        const dedupedById = new Map<string, Session>();
        for (const session of merged) {
          dedupedById.set(session.id, session);
        }
        const next = Array.from(dedupedById.values());
        writeCachedSessions(uid, next);
        return next;
      });
    } catch (e) {
      console.error("[ECHLY] loadMoreSessions failed", e);
    } finally {
      setLoadingMoreSessions(false);
    }
  }, [isIdentityReady, loadingMoreSessions]);

  const overviewDataAligned =
    Boolean(userId) && sessionsSourceUserRef.current === userId;

  const allSessionsForView = overviewDataAligned ? allSessions : [];

  const sessions = filterSessionsByView(allSessionsForView, archivedOnly);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: countsFromSessionFields(session),
  }));

  const handleCreateSession = useCallback(
    async (
      onPlanLimitReached?: (payload: { message: string; upgradePlan: string | null }) => void
    ) => {
      assertIdentityResolved(isIdentityResolved);
      if (!claimsReady || !userIdRef.current) return;
      const tempSessionId = `temp-${Date.now()}`;
      const tempSession: Session = {
        id: tempSessionId,
        title: "Untitled Session",
        workspaceId: "",
        createdByUserId: userIdRef.current,
        accessLevel: "view",
        generalAccess: "restricted",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
        openCount: 0,
        resolvedCount: 0,
        totalCount: 0,
        feedbackCount: 0,
      };
      setAllSessions((prev) => [tempSession, ...prev]);

      try {
        const res = await authFetch("/api/sessions", { method: "POST" });
        if (!res) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }
        const data = await res.json().catch((err: unknown) => {
          console.error("[ECHLY] JSON parse failed", err);
          return {};
        });

        if (res.status === 403) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          const err = data.error as { code?: string; message?: string } | undefined;
          const limitData = data.data as { upgradePlan?: string | null } | null | undefined;
          const isPlanLimit =
            data.success === false &&
            err?.code === "FORBIDDEN" &&
            limitData &&
            "upgradePlan" in limitData;
          if (isPlanLimit) {
            onPlanLimitReached?.({
              message: err?.message ?? "You've reached your plan limit.",
              upgradePlan: limitData.upgradePlan ?? "starter",
            });
            return;
          }
          if (
            err?.code === "FORBIDDEN" &&
            err?.message === "Workspace suspended"
          ) {
            onPlanLimitReached?.({
              message: err.message ?? "Workspace suspended. Contact support.",
              upgradePlan: null,
            });
            return;
          }

          onPlanLimitReached?.({
            message:
              (err && typeof err.message === "string" && err.message) ||
              "You don't have permission to create a session.",
            upgradePlan: limitData?.upgradePlan ?? null,
          });
          return;
        }

        if (!res.ok) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          console.error("[ECHLY] Create session failed", res.status, data);
          return;
        }

        const payload = data as {
          data?: { session?: { id?: string } };
          session?: { id?: string };
        };
        const newSessionId = payload.data?.session?.id ?? payload.session?.id;
        if (!newSessionId) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }

        setAllSessions((prev) =>
          prev.map((s) =>
            s.id === tempSessionId
              ? {
                  ...s,
                  id: newSessionId,
                  isOptimistic: false,
                  updatedAt: new Date(),
                }
              : s
          )
        );

        router.push(`${SESSION_FEEDBACK_PATH}/${newSessionId}`);
      } catch (err) {
        setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
        console.error("[ECHLY] Create session failed", err);
      }
    },
    [claimsReady, isIdentityResolved, router]
  );

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    setAllSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
    );
  }, []);

  const uidForCache = () => userIdRef.current;

  const setSessionArchived = useCallback(async (sessionId: string, archived: boolean) => {
    if (!sessionId) return;
    assertIdentityResolved(isIdentityResolved);
    const uid = uidForCache();

    let hasRollback = false;
    let rollbackArchived = false;
    setAllSessions((prev) => {
      const current = prev.find((s) => s.id === sessionId) ?? null;
      if (current) {
        hasRollback = true;
        rollbackArchived = (current.isArchived ?? current.archived) === true;
      }
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, archived, isArchived: archived } : s
      );
      if (uid) writeCachedSessions(uid, next);
      return next;
    });

    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived, isArchived: archived }),
      });
      if (!res) {
        if (hasRollback) {
          setAllSessions((prev) => {
            const next = prev.map((s) =>
              s.id === sessionId ? { ...s, archived: rollbackArchived, isArchived: rollbackArchived } : s
            );
            if (uid) writeCachedSessions(uid, next);
            return next;
          });
        }
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data &&
          typeof data === "object" &&
          data.error &&
          typeof (data.error as { message?: string }).message === "string"
            ? (data.error as { message: string }).message
            : null;
        throw new Error(msg || `Archive update failed: ${res.status}`);
      }
    } catch (err) {
      if (hasRollback) {
        setAllSessions((prev) => {
          const next = prev.map((s) =>
            s.id === sessionId ? { ...s, archived: rollbackArchived, isArchived: rollbackArchived } : s
          );
          if (uid) writeCachedSessions(uid, next);
          return next;
        });
      }
      console.error("[ECHLY] setSessionArchived failed", err);
      throw err;
    }
  }, [isIdentityResolved]);

  const removeSession = useCallback((sessionId: string) => {
    setAllSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const deleteSession = useCallback(
    async (session: Session) => {
      assertIdentityResolved(isIdentityResolved);
      const sessionId = session.id;
      const uid = uidForCache();
      setAllSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        if (uid) writeCachedSessions(uid, next);
        return next;
      });
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res) {
          setAllSessions((prev) => {
            const next = [session, ...prev];
            if (uid) writeCachedSessions(uid, next);
            return next;
          });
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch((err: unknown) => {
            console.error("[ECHLY] JSON parse failed", err);
            return {};
          });
          const delMsg =
            data &&
            typeof data === "object" &&
            data.error &&
            typeof (data.error as { message?: string }).message === "string"
              ? (data.error as { message: string }).message
              : null;
          throw new Error(delMsg || "Failed to delete session");
        }
      } catch (err) {
        setAllSessions((prev) => {
          const next = [session, ...prev];
          if (uid) writeCachedSessions(uid, next);
          return next;
        });
        console.error("[ECHLY] Delete session failed", err);
        throw err;
      }
    },
    [isIdentityResolved]
  );

  return {
    sessions: sessionsWithCounts,
    loading: overviewDataAligned ? awaitingSessions : true,
    isCountsReady: overviewDataAligned ? true : false,
    hasMoreSessions,
    loadingMoreSessions,
    loadMoreSessions,
    handleCreateSession,
    refreshSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
  };
}
