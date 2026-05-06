"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Clock, Settings } from "lucide-react";
import {
  ActivityErrorIllustration,
  ActivityFilterNoResultsIllustration,
  ActivityNoActivityIllustration,
  ActivityUnauthenticatedIllustration,
} from "@/components/discussion/EmptyStateIllustrations";
import { authFetch } from "@/lib/authFetch";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { ActivityItem } from "@/components/activity/ActivityItem";
import { ActivitySkeletonStack } from "@/components/activity/ActivitySkeletonRow";
import { getTier } from "@/components/activity/eventIcons";
import {
  ACTIVITY_FILTER_CATEGORY_IDS,
  ACTIVITY_FILTER_CATEGORY_LABELS,
  categoriesToEventTypesForApi,
  type ActivityFilterCategoryId,
} from "@/lib/activity/activityEventTypeFilters";
import {
  groupEventsByDay,
  partitionEarlierByWeek,
  type ActivityEvent,
  type GroupedActivity,
} from "@/lib/activity/groupEvents";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";
import { useWorkspace } from "@/lib/client/workspaceContext";
import type { WorkspaceMember } from "@/lib/domain/workspaceMember";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActivityFeedData = {
  events: unknown[];
  /** Server-side adjacency groups; required whenever the API returns a feed page. */
  groupedEvents: unknown[];
  nextCursor: { createdAt: number; id: string } | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error?: { code: string; message: string };
};

// ─── Normalisation ───────────────────────────────────────────────────────────

function normalizeApiEvent(raw: unknown): ActivityEvent {
  if (typeof raw !== "object" || raw == null) {
    return {
      id: "",
      eventType: "",
      workspaceId: "",
      sessionId: "",
      actor: { id: "" },
      createdAt: null,
    };
  }
  const o = raw as Record<string, unknown>;
  const actorRaw = o.actor;
  let actor: ActivityEvent["actor"] = { id: "" };
  if (typeof actorRaw === "object" && actorRaw != null) {
    const a = actorRaw as Record<string, unknown>;
    const id = typeof a.id === "string" ? a.id : "";
    const name = typeof a.name === "string" ? a.name : undefined;
    const photoURL =
      typeof a.photoURL === "string"
        ? a.photoURL
        : typeof a.avatarUrl === "string"
          ? a.avatarUrl
          : undefined;
    actor = {
      id,
      ...(name !== undefined ? { name } : {}),
      ...(photoURL !== undefined ? { photoURL } : {}),
    };
  }
  const metadata =
    typeof o.metadata === "object" && o.metadata != null && !Array.isArray(o.metadata)
      ? (o.metadata as Record<string, unknown>)
      : undefined;
  return {
    id: typeof o.id === "string" ? o.id : "",
    eventType: typeof o.eventType === "string" ? o.eventType : "",
    workspaceId: typeof o.workspaceId === "string" ? o.workspaceId : "",
    sessionId: typeof o.sessionId === "string" ? o.sessionId : "",
    feedbackId: typeof o.feedbackId === "string" ? o.feedbackId : undefined,
    commentId: typeof o.commentId === "string" ? o.commentId : undefined,
    actor,
    metadata,
    createdAt: typeof o.createdAt === "number" ? o.createdAt : null,
    groupKey: typeof o.groupKey === "string" ? o.groupKey : undefined,
  };
}

/** Maps API `groupedEvents` into client {@link GroupedActivity}. */
function normalizeGroupedRows(raw: unknown): GroupedActivity[] {
  if (!Array.isArray(raw)) return [];
  const out: GroupedActivity[] = [];
  for (const row of raw) {
    const one = normalizeOneGroupedActivity(row);
    if (one) out.push(one);
  }
  return out;
}

function normalizeOneGroupedActivity(raw: unknown): GroupedActivity | null {
  if (typeof raw !== "object" || raw == null) return null;
  const o = raw as Record<string, unknown>;
  if (o.type === "single") {
    return { type: "single", event: normalizeApiEvent(o.event) };
  }
  if (o.type !== "group") return null;

  const previewWire = Array.isArray(o.previewEvents) ? o.previewEvents : [];
  const previewEvents = previewWire.map(normalizeApiEvent);
  if (previewEvents.length === 0) return null;

  const groupId = typeof o.groupId === "string" ? o.groupId.trim() : "";
  if (!groupId) return null;

  const countRaw = o.count;
  if (typeof countRaw !== "number" || !Number.isFinite(countRaw) || countRaw < 1) return null;
  const count = Math.trunc(countRaw);

  const primaryFromWire = typeof o.primaryEventId === "string" ? o.primaryEventId.trim() : "";
  const primaryEventId = primaryFromWire || (previewEvents[0]?.id ?? "");
  if (!primaryEventId) return null;

  const createdAt =
    typeof o.createdAt === "number" && Number.isFinite(o.createdAt)
      ? o.createdAt
      : (previewEvents[0]?.createdAt ?? null);

  const first = previewEvents[0]!;
  return {
    type: "group",
    groupId,
    eventType: typeof o.eventType === "string" ? o.eventType : first.eventType,
    actorId: typeof o.actorId === "string" ? o.actorId : first.actor?.id ?? "",
    actorName:
      typeof o.actorName === "string" ? o.actorName : (first.actor?.name ?? undefined),
    sessionId: typeof o.sessionId === "string" ? o.sessionId : first.sessionId ?? "",
    primaryEventId,
    count,
    previewEvents,
    createdAt,
  };
}

function formatRelativeActivityTime(ms: number | null): string {
  if (ms == null || !Number.isFinite(ms)) return "";
  const date = new Date(ms);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) {
    const m = Math.max(1, Math.floor(diffSec / 60));
    return `${m} min ago`;
  }
  if (diffSec < 86400) {
    const h = Math.max(1, Math.floor(diffSec / 3600));
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (dayDiff === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ─── System-event collapsing ─────────────────────────────────────────────────

type RenderRow =
  | { kind: "activity"; item: GroupedActivity }
  | { kind: "system-collapse"; items: GroupedActivity[]; key: string };

function groupedActivityStableKey(item: GroupedActivity): string {
  if (item.type === "single") {
    const ev = item.event;
    return ev.id || `${ev.eventType}-${ev.createdAt}`;
  }
  return `group-${item.groupId}`;
}

function collapseSystemEvents(items: GroupedActivity[]): RenderRow[] {
  const result: RenderRow[] = [];
  let buffer: GroupedActivity[] = [];
  let idx = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    const anchor = buffer[0]!;
    const anchorId =
      anchor.type === "single" ? anchor.event.id : anchor.primaryEventId;
    result.push({ kind: "system-collapse", items: buffer, key: `sys-${idx++}-${anchorId}` });
    buffer = [];
  };

  for (const item of items) {
    const eventType = item.type === "single" ? item.event.eventType : item.eventType;
    if (getTier(eventType) === 3) {
      buffer.push(item);
    } else {
      flush();
      result.push({ kind: "activity", item });
    }
  }
  flush();
  return result;
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchActivityFeed(
  sessionIdFilter: string | null,
  eventTypes: string[],
  actorId: string | null,
  cursor: string | null
): Promise<ActivityFeedData> {
  const params = new URLSearchParams();
  params.set("limit", "50");
  if (sessionIdFilter) params.set("sessionId", sessionIdFilter);
  if (eventTypes.length > 0) params.set("eventTypes", eventTypes.join(","));
  if (actorId) params.set("actorId", actorId);
  if (cursor) params.set("cursor", cursor);
  const res = await authFetch(`/api/activity-feed?${params.toString()}`);
  if (!res) throw new Error("Could not reach activity feed.");
  const json = (await res.json()) as ApiEnvelope<ActivityFeedData>;
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? "Failed to load activity.");
  }
  return json.data;
}

/**
 * Ensures every feed page includes server `groupedEvents` aligned with `events`.
 * Empty feed: both may be empty arrays. Throws in development on violation.
 */
function enforceGroupedEventsContract(data: ActivityFeedData, label: string): void {
  const ge = data.groupedEvents;
  const hasEvents = Array.isArray(data.events) && data.events.length > 0;
  const okArray = Array.isArray(ge);
  const violated = !okArray || (hasEvents && ge.length === 0);
  if (!violated) return;
  const msg = "groupedEvents missing — API contract violated";
  if (process.env.NODE_ENV === "development") {
    throw new Error(`${msg} (${label})`);
  }
  console.error(msg, { label, hasEvents, groupedEvents: ge });
  throw new Error("Activity feed returned an invalid response.");
}

// ─── Activity feed sessionStorage cache ──────────────────────────────────────

const ACTIVITY_CACHE_TTL_MS = 5 * 60 * 1000;

interface ActivityCache {
  groupedEvents: GroupedActivity[];
  nextCursor: { createdAt: number; id: string } | null;
  cachedAt: number;
}

function readActivityCache(key: string): ActivityCache | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActivityCache;
    if (Date.now() - parsed.cachedAt > ACTIVITY_CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeActivityCache(
  key: string,
  groupedEvents: GroupedActivity[],
  nextCursor: ActivityCache["nextCursor"]
): void {
  try {
    const cache: ActivityCache = { groupedEvents, nextCursor, cachedAt: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // sessionStorage full or unavailable — silent fail
  }
}

/** Semantic active state per category — inline styles to guarantee colors render (sourced from eventIconMap badgeClass). */
const ACTIVITY_TYPE_PILL_ACTIVE_STYLES: Record<ActivityFilterCategoryId, React.CSSProperties> = {
  comments: { background: 'var(--brand)', borderColor: 'var(--brand)', color: '#FFFFFF' },
  created:  { background: 'var(--color-insight)', borderColor: 'var(--color-insight)', color: '#FFFFFF' },
  resolved: { background: 'var(--color-success)', borderColor: 'var(--color-success)', color: '#FFFFFF' },
};

/** Shared pill geometry + motion; hover applied via FILTER_PILL_DEFAULT when not active. */
const FILTER_PILL_BASE =
  "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius-btn)] border px-4 h-[34px] text-[14px] font-medium whitespace-nowrap transition-all duration-150 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const FILTER_PILL_DEFAULT =
  "bg-white border-[var(--border)] text-[var(--text-body)] hover:border-[var(--border-strong)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)]";

/** Session / Members active pill — neutral light fill. */
const FILTER_PILL_SESSION_ACTIVE =
  "bg-[var(--text-body)] border-[var(--text-body)] text-white";

/** Auto-fill + infinite scroll: stop chaining loads once this many rows exist and the page scrolls. */
const ACTIVITY_FEED_MIN_VISIBLE_ROWS = 8;

function isActivityViewportFilled(rowCount: number): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return true;
  const scrollH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const shortPage = scrollH <= window.innerHeight + 2;
  const enoughRows = rowCount >= ACTIVITY_FEED_MIN_VISIBLE_ROWS;
  return enoughRows && !shortPage;
}

// ─── Page ────────────────────────────────────────────────────────────────────

function ActivityFeed() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** Session filter: `?sessionId=` is canonical so links and router.replace stay in sync. */
  const selectedSessionId = searchParams.get("sessionId")?.trim() || null;
  /** At most one type filter; `null` = all activity types (no filter). */
  const [selectedCategory, setSelectedCategory] = useState<ActivityFilterCategoryId | "member" | null>(null);
  const { sessions: sessionsWithCounts } = useWorkspaceStore();
  const { workspaceId } = useWorkspace();
  const sessions = useMemo(
    () => sessionsWithCounts.map(({ session }) => session),
    [sessionsWithCounts]
  );
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [sessionFilterTouched, setSessionFilterTouched] = useState(false);
  const [memberFilterTouched, setMemberFilterTouched] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const { user, loading: authLoading } = useAuthGuard();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<ActivityFeedData["nextCursor"]>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoFillCapped, setAutoFillCapped] = useState(false);
  const loadingInitialRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const nextCursorRef = useRef<ActivityFeedData["nextCursor"]>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
  const [expandedSystemKeys, setExpandedSystemKeys] = useState<Set<string>>(() => new Set());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, ActivityEvent[]>>({});
  /** Accumulated `/api/activity-feed` `groupedEvents` pages (sole source for feed rows). */
  const [groupedFromServer, setGroupedFromServer] = useState<GroupedActivity[]>([]);
  /** Keys of rows that just arrived via pagination (short-lived, for enter animation). */
  const [enterRowKeys, setEnterRowKeys] = useState<Set<string>>(() => new Set());
  const prevGroupedLenRef = useRef(0);
  const expandedGroupsRef = useRef<Record<string, ActivityEvent[]>>({});
  /** In-flight group-member fetches (dedupe / guard against stale completion). */
  const loadingGroupsRef = useRef<Record<string, boolean>>({});
  const groupFetchAbortRef = useRef(new Map<string, AbortController>());
  const autoFillAttemptsRef = useRef(0);

  useEffect(() => {
    expandedGroupsRef.current = expandedGroups;
  }, [expandedGroups]);

  useEffect(() => {
    loadingInitialRef.current = loadingInitial;
  }, [loadingInitial]);

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  const eventTypesForApi = useMemo(
    () => {
      if (!selectedCategory || selectedCategory === "member") return [];
      return categoriesToEventTypesForApi([selectedCategory]);
    },
    [selectedCategory]
  );
  const actorIdForApi = selectedMemberId;
  const eventTypesParamKey = eventTypesForApi.join(",");

  const activityCacheKey = useMemo(() => {
    const parts = [
      "echly_activity",
      workspaceId ?? "no-ws",
      selectedSessionId ?? "all",
      eventTypesParamKey || "all-types",
      actorIdForApi ?? "all-actors",
    ];
    return parts.join(":");
  }, [workspaceId, selectedSessionId, eventTypesParamKey, actorIdForApi]);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      ),
    [sessions]
  );

  const selectedSessionLabel = useMemo(() => {
    if (!selectedSessionId) return "All sessions";
    const s = sessions.find((x) => x.id === selectedSessionId);
    return s?.title ?? "Session";
  }, [selectedSessionId, sessions]);

  const dayBuckets = useMemo(() => {
    const { today, yesterday, earlier } = groupEventsByDay(groupedFromServer);
    const { thisWeek, rest } = partitionEarlierByWeek(earlier, new Date());
    return [
      { label: "Today" as const, items: today },
      { label: "Yesterday" as const, items: yesterday },
      { label: "This week" as const, items: thisWeek },
      { label: "Earlier" as const, items: rest },
    ].filter((s) => s.items.length > 0);
  }, [groupedFromServer]);

  // PERF R-018: memoize collapseSystemEvents per section so expand/collapse
  // state changes (expandedSystemKeys) don't re-run the collapse computation.
  // collapseSystemEvents is a pure function defined outside the component.
  const collapsedDayBuckets = useMemo(
    () =>
      dayBuckets.map((section) => ({
        label: section.label,
        items: section.items,
        renderRows: collapseSystemEvents(section.items),
      })),
    [dayBuckets]
  );

  useEffect(() => {
    if (!sessionMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(e.target as Node)) {
        setSessionMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [sessionMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false);
        if (!selectedMemberId) {
          setSelectedCategory(null);
        }
      }
    }
    if (memberDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [memberDropdownOpen, selectedMemberId]);

  useEffect(() => {
    if (!user?.uid || authLoading) return;
    setLoadingMembers(true);
    authFetch("/api/workspace/members")
      .then((r) => (r?.ok ? r.json() : null))
      .then((data: { data?: { members?: WorkspaceMember[] } } | null) => {
        setWorkspaceMembers(data?.data?.members ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingMembers(false));
  }, [user?.uid, authLoading]);

  useEffect(() => {
    for (const c of groupFetchAbortRef.current.values()) {
      c.abort();
    }
    groupFetchAbortRef.current.clear();
    setExpandedGroupIds(new Set());
    setExpandedSystemKeys(new Set());
    setExpandedGroups({});
    loadingGroupsRef.current = {};
    setGroupedFromServer([]);
    prevGroupedLenRef.current = 0;
    setEnterRowKeys(new Set());
  }, [selectedSessionId, eventTypesParamKey, actorIdForApi]);

  useEffect(() => {
    if (!user?.uid && !authLoading) {
      setLoadingInitial(false);
      setEvents([]);
      setNextCursor(null);
      setError(null);
      return;
    }
    if (!user?.uid || authLoading) return;

    let cancelled = false;
    (async () => {
      setError(null);

      // Check cache first
      const cached = readActivityCache(activityCacheKey);
      if (cached) {
        setGroupedFromServer(normalizeGroupedRows(cached.groupedEvents));
        setNextCursor(cached.nextCursor);
        setLoadingInitial(false);
        return;
      }

      // Cache miss — fetch from API
      setAutoFillCapped(false);
      autoFillAttemptsRef.current = 0;
      setLoadingInitial(true);
      setEvents([]);
      setNextCursor(null);
      setGroupedFromServer([]);
      try {
        const data = await fetchActivityFeed(selectedSessionId, eventTypesForApi, actorIdForApi, null);
        if (cancelled) return;
        enforceGroupedEventsContract(data, "initial");
        setEvents(data.events.map(normalizeApiEvent));
        setNextCursor(data.nextCursor);
        setGroupedFromServer(normalizeGroupedRows(data.groupedEvents));
        writeActivityCache(activityCacheKey, data.groupedEvents as GroupedActivity[], data.nextCursor);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setEvents([]);
          setNextCursor(null);
          setGroupedFromServer([]);
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, authLoading, selectedSessionId, eventTypesParamKey, actorIdForApi, activityCacheKey, refetchTick]);

  const onSessionFilterChange = useCallback(
    (value: string) => {
      const next = value === "" ? null : value;
      const sp = new URLSearchParams(searchParams.toString());
      if (next) sp.set("sessionId", next);
      else sp.delete("sessionId");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const selectCategory = useCallback((id: ActivityFilterCategoryId) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
  }, []);

  const loadMore = useCallback(async () => {
    if (!user?.uid) return;
    if (loadingInitialRef.current) return;
    if (!nextCursorRef.current) return;
    if (loadingMoreRef.current) return;

    const cursor = JSON.stringify(nextCursorRef.current);
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchActivityFeed(selectedSessionId, eventTypesForApi, actorIdForApi, cursor);
      enforceGroupedEventsContract(data, "loadMore");
      setEvents((prev) => [...prev, ...data.events.map(normalizeApiEvent)]);
      setNextCursor(data.nextCursor);
      const chunk = normalizeGroupedRows(data.groupedEvents);
      setGroupedFromServer((prev) => [...prev, ...chunk]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load more.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [user?.uid, selectedSessionId, eventTypesParamKey, actorIdForApi]);

  /** Fill short viewports after data paints; chains via deps when each load finishes. */
  useEffect(() => {
    if (authLoading || !user?.uid) return;
    if (loadingInitial) return;
    if (groupedFromServer.length === 0) return;
    if (!nextCursor) return;
    if (loadingMoreRef.current) return;

    const tick = () => {
      if (loadingMoreRef.current) return;
      if (!nextCursorRef.current) return;

      // Hard cap: max 2 auto-fill attempts per fresh fetch
      if (autoFillAttemptsRef.current >= 2) {
        if (nextCursorRef.current) {
          setAutoFillCapped(true);
        }
        return;
      }

      const rowCount = collapsedDayBuckets.reduce((n, s) => n + s.renderRows.length, 0);
      if (isActivityViewportFilled(rowCount)) return;

      autoFillAttemptsRef.current += 1;
      void loadMore();
    };

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [
    authLoading,
    user?.uid,
    loadingInitial,
    loadingMore,
    nextCursor,
    groupedFromServer.length,
    collapsedDayBuckets,
    loadMore,
  ]);

  useEffect(() => {
    if (loadingInitial) return;
    const prev = prevGroupedLenRef.current;
    const len = groupedFromServer.length;
    if (len > prev && prev > 0) {
      const keys = groupedFromServer.slice(prev).map(groupedActivityStableKey);
      setEnterRowKeys(new Set(keys));
      const t = window.setTimeout(() => setEnterRowKeys(new Set()), 200);
      prevGroupedLenRef.current = len;
      return () => window.clearTimeout(t);
    }
    prevGroupedLenRef.current = len;
  }, [groupedFromServer, loadingInitial]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        void loadMore();
      },
      { root: null, rootMargin: "0px 0px 280px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, loadMore]);

  const loadGroupMembersIfNeeded = useCallback(
    async (g: Extract<GroupedActivity, { type: "group" }>, groupKey: string) => {
      if (!g.groupId || g.createdAt == null) return;
      if (groupKey in expandedGroupsRef.current) return;
      if (loadingGroupsRef.current[groupKey]) return;

      const previewLen = g.previewEvents.length;
      if (g.count <= previewLen) return;

      const prev = groupFetchAbortRef.current.get(groupKey);
      prev?.abort();
      const ac = new AbortController();
      groupFetchAbortRef.current.set(groupKey, ac);

      loadingGroupsRef.current[groupKey] = true;
      try {
        const params = new URLSearchParams({
          groupId: g.groupId,
          sessionId: g.sessionId,
          eventType: g.eventType,
          actorId: g.actorId,
          createdAt: String(g.createdAt),
        });
        const res = await authFetch(`/api/activity-group-members?${params.toString()}`, {
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        if (!res) {
          console.warn("activity-group-members: authFetch returned null");
          return;
        }
        const json = (await res.json()) as ApiEnvelope<{ events: unknown[] }>;
        if (!res.ok || !json.success || !json.data) {
          console.warn("activity-group-members:", json.error?.message ?? res.status);
          return;
        }
        const mapped = json.data.events.map(normalizeApiEvent);
        if (groupFetchAbortRef.current.get(groupKey) === ac) {
          setExpandedGroups((prevMap) => ({ ...prevMap, [groupKey]: mapped }));
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.warn("activity-group-members fetch failed", e);
      } finally {
        if (groupFetchAbortRef.current.get(groupKey) === ac) {
          delete loadingGroupsRef.current[groupKey];
          groupFetchAbortRef.current.delete(groupKey);
        }
      }
    },
    []
  );

  const toggleGroup = useCallback(
    (g: Extract<GroupedActivity, { type: "group" }>) => {
      const groupKey = g.groupId;
      setExpandedGroupIds((prev) => {
        const next = new Set(prev);
        if (next.has(groupKey)) {
          next.delete(groupKey);
          return next;
        }
        next.add(groupKey);
        queueMicrotask(() => {
          void loadGroupMembersIfNeeded(g, groupKey);
        });
        return next;
      });
    },
    [loadGroupMembersIfNeeded]
  );

  const toggleSystemGroup = useCallback((key: string) => {
    setExpandedSystemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ─── Unauthenticated state ────────────────────────────────────────────────

  if (!user?.uid && !authLoading) {
    return (
      <div className="w-full px-6 py-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex items-center gap-2.5 mb-7">
            <Clock className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
            <h1 className="text-[16px] font-medium text-[var(--text-heading)]">Activity</h1>
          </div>
          <div className="flex flex-col items-center text-center px-6 py-16">
            <div className="mb-4">
              <ActivityUnauthenticatedIllustration />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">
              Sign in to view activity
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
              You need to be signed in to see workspace activity.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center h-[34px] px-3.5 rounded-[var(--radius-btn)] bg-[var(--brand)] text-white text-[13px] font-medium hover:bg-[var(--brand-hover)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="w-full px-6 py-8">
      <div className="mx-auto w-full max-w-[1280px]">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-[var(--text-heading)] tracking-[-0.4px] mt-1 mb-0">
            Activity
          </h1>
          <p className="text-sm font-normal text-[var(--text-secondary)] mt-2">
            Everything that&apos;s happened across your sessions and workspace
          </p>
          <div className="flex items-center gap-2 mt-5">
            <div
              className="flex flex-wrap items-center gap-1"
              role="toolbar"
              aria-label="Activity filters"
            >
              <div
                className={`relative shrink-0 ${sessionMenuOpen ? "z-[200]" : "z-0"}`}
                ref={sessionMenuRef}
              >
                <button
                  type="button"
                  onClick={() => setSessionMenuOpen((o) => !o)}
                  aria-expanded={sessionMenuOpen}
                  aria-haspopup="listbox"
                  aria-label={`Filter by session, ${selectedSessionLabel}`}
                  className={`${FILTER_PILL_BASE} max-w-[min(100vw-8rem,220px)] ${
                    (selectedSessionId || sessionFilterTouched) ? FILTER_PILL_SESSION_ACTIVE : FILTER_PILL_DEFAULT
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{selectedSessionLabel}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 ${(selectedSessionId || sessionFilterTouched) ? 'text-white opacity-100' : 'text-[var(--text-secondary)] opacity-60'} transition-transform duration-150 ${sessionMenuOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>

                {sessionMenuOpen ? (
                  <div
                    className="absolute left-1/2 top-full z-[200] mt-1 w-max min-w-[220px] max-w-[min(100vw-2rem,320px)] -translate-x-1/2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-1.5 text-[var(--text-heading)] shadow-none"
                    role="listbox"
                    aria-label="Sessions"
                  >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!selectedSessionId}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-heading)] transition-colors hover:bg-[var(--surface-hover)]/50 ${!selectedSessionId ? "bg-[var(--surface-hover)]/60 font-medium" : "font-normal"}`}
                    onClick={() => {
                      setSessionFilterTouched(false);
                      onSessionFilterChange("");
                      setSessionMenuOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">All sessions</span>
                    {!selectedSessionId ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)] opacity-70"
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                  {sortedSessions.map((s) => {
                    const selected = selectedSessionId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-heading)] transition-colors hover:bg-[var(--surface-hover)]/50 ${selected ? "bg-[var(--surface-hover)]/60 font-medium" : "font-normal"}`}
                        onClick={() => {
                          setSessionFilterTouched(true);
                          onSessionFilterChange(s.id);
                          setSessionMenuOpen(false);
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate">{s.title}</span>
                        {selected ? (
                          <Check
                            className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)] opacity-70"
                            strokeWidth={2}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    );
                  })}
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={memberDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMemberFilterTouched(true);
                    if (selectedCategory === "member") {
                      if (selectedMemberId !== null) {
                        setMemberDropdownOpen((prev) => !prev);
                      } else {
                        setSelectedCategory(null);
                        setMemberDropdownOpen(false);
                      }
                    } else {
                      setSelectedCategory("member");
                      setMemberDropdownOpen(true);
                    }
                  }}
                  className={`${FILTER_PILL_BASE} ${
                    (selectedCategory === "member" || memberFilterTouched) ? "bg-[var(--text-body)] border-[var(--text-body)] text-white" : FILTER_PILL_DEFAULT
                  }`}
                >
                  {selectedMemberId
                    ? (() => {
                        const selected = workspaceMembers.find(
                          (m) => m.uid === selectedMemberId
                        );
                        return selected?.displayName ?? selected?.email.split("@")[0] ?? "Members";
                      })()
                    : "Members"}
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </button>

                {(selectedCategory === "member" && selectedMemberId === null) ||
                memberDropdownOpen ? (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--surface-card)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-none z-50 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMemberId(null);
                        setSelectedCategory(null);
                        setMemberFilterTouched(false);
                        setMemberDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--surface-hover)]${selectedMemberId === null ? " font-medium text-[var(--text-heading)]" : ""}`}
                    >
                      <span className="flex-1 text-left">All</span>
                      {selectedMemberId === null && (
                        <Check className="h-3.5 w-3.5 text-[var(--brand)] flex-shrink-0" />
                      )}
                    </button>

                    {loadingMembers ? (
                      <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                        Loading…
                      </div>
                    ) : (
                      workspaceMembers.map((member) => (
                        <button
                          key={member.uid}
                          type="button"
                          onClick={() => {
                            if (selectedMemberId === member.uid) {
                              setSelectedMemberId(null);
                              setSelectedCategory(null);
                              setMemberDropdownOpen(false);
                            } else {
                              setSelectedMemberId(member.uid);
                              setMemberDropdownOpen(false);
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--surface-hover)] text-left${selectedMemberId === member.uid ? " font-medium text-[var(--text-heading)]" : ""}`}
                        >
                          <div className="w-5 h-5 rounded-full bg-[var(--surface-hover)] flex-shrink-0 overflow-hidden flex items-center justify-center text-[12px] font-medium text-[var(--text-secondary)]">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              (member.displayName ?? member.email)[0]?.toUpperCase()
                            )}
                          </div>
                          <span className="truncate">
                            {member.displayName ?? member.email.split("@")[0]}
                          </span>
                          {selectedMemberId === member.uid && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand)] ml-auto flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>

              <div
                className="flex flex-wrap items-center gap-1"
                role="radiogroup"
                aria-label="Activity type"
              >
                {ACTIVITY_FILTER_CATEGORY_IDS.map((id) => {
                  const selected = selectedCategory === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectCategory(id)}
                      className={`${FILTER_PILL_BASE} ${selected ? "" : FILTER_PILL_DEFAULT}`}
                      style={selected ? ACTIVITY_TYPE_PILL_ACTIVE_STYLES[id] : undefined}
                    >
                      {ACTIVITY_FILTER_CATEGORY_LABELS[id]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Initial load — partial skeleton reads as "content arriving", not a full-page wait */}
        {loadingInitial ? (
          <div className="w-full" aria-busy="true" aria-live="polite">
            <ActivitySkeletonStack count={4} />
          </div>
        ) : error && groupedFromServer.length === 0 ? (
          /* Error state */
          <div className="flex flex-col items-center py-16 text-center px-6" role="alert">
            <div className="mb-4">
              <ActivityErrorIllustration />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">
              Couldn&apos;t load activity
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
              Something went wrong. Please try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setRefetchTick((t) => t + 1);
              }}
              className="mt-4 inline-flex items-center h-[34px] px-3.5 rounded-[var(--radius-btn)] bg-[var(--brand)] text-white text-[13px] font-medium hover:bg-[var(--brand-hover)] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : groupedFromServer.length === 0 ? (
          /* Empty state — distinguish between "no activity at all" and "filter has no matches" */
          (selectedSessionId || selectedCategory || selectedMemberId) ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <div className="mb-4">
                <ActivityFilterNoResultsIllustration />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">
                No matching activity
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
                Try a different filter to see more results.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <div className="mb-4">
                <ActivityNoActivityIllustration />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">
                No activity yet
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
                Actions across your workspace will appear here as your team gets started.
              </p>
            </div>
          )
        ) : (

          /* Feed — single calm enter when surface replaces skeleton */
          <div className="space-y-4 activity-feed-row-enter">
            {collapsedDayBuckets.map((section, sectionIndex) => {
              const renderRows = section.renderRows;
              return (
                <div key={section.label} className="space-y-2">

                  {/* Day section rule */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" aria-hidden />
                    <span className="text-sm font-semibold text-[var(--text-heading)]/60 whitespace-nowrap tracking-wide">
                      {section.label}
                    </span>
                    <div className="flex-1 h-px bg-border" aria-hidden />
                  </div>

                  {/* Event rows */}
                  <div className="relative pb-3">

                    {renderRows.map((row, rowIndex) => {
                      /* System-event collapse chip */
                      if (row.kind === "system-collapse") {
                        const isExpanded = expandedSystemKeys.has(row.key);
                        return (
                          <div
                            key={`${sectionIndex}-${rowIndex}-${row.key}`}
                            className={
                              enterRowKeys.has(row.key) ? "activity-feed-row-enter" : undefined
                            }
                          >
                            <button
                              type="button"
                              onClick={() => toggleSystemGroup(row.key)}
                              className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <div className="relative z-10 flex w-[52px] shrink-0 justify-center">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-hover)]/50 text-[var(--text-secondary)]"
                                  aria-hidden
                                >
                                  <Settings className="h-5 w-5" />
                                </div>
                              </div>
                              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                <span className="min-w-0 text-[15px] font-normal leading-snug text-[var(--text-secondary)]">
                                  {row.items.length} system{" "}
                                  {row.items.length === 1 ? "event" : "events"}
                                </span>
                                <ChevronDown
                                  className={`h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                                  aria-hidden
                                />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="mt-2 w-full min-w-0 pl-[52px]">
                                {row.items.map((item, itemIndex) => {
                                  const ev =
                                    item.type === "single"
                                      ? item.event
                                      : item.previewEvents[0]!;
                                  const time = formatRelativeActivityTime(ev.createdAt);
                                  const rowKey =
                                    ev.id || `sys-${ev.eventType}-${ev.createdAt}`;
                                  return (
                                    <ActivityItem
                                      key={`${sectionIndex}-${rowIndex}-${itemIndex}-${rowKey}`}
                                      kind="single"
                                      event={ev}
                                      relativeTime={time || null}
                                      isoTime={
                                        ev.createdAt != null
                                          ? new Date(ev.createdAt).toISOString()
                                          : undefined
                                      }
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      /* Regular activity row (single or group) */
                      const item = row.item;

                      if (item.type === "single") {
                        const ev = item.event;
                        const time = formatRelativeActivityTime(ev.createdAt);
                        const rowKey = ev.id || `${ev.eventType}-${ev.createdAt}`;
                        const enter = enterRowKeys.has(groupedActivityStableKey(item));
                        return (
                          <div
                            key={`${sectionIndex}-${rowIndex}-${rowKey}`}
                            className={enter ? "activity-feed-row-enter" : undefined}
                          >
                            <ActivityItem
                              kind="single"
                              event={ev}
                              relativeTime={time || null}
                              isoTime={
                                ev.createdAt != null
                                  ? new Date(ev.createdAt).toISOString()
                                  : undefined
                              }
                            />
                          </div>
                        );
                      }

                      /* Group row */
                      const g = item;
                      const time = formatRelativeActivityTime(g.createdAt);
                      const groupKey = g.groupId;
                      const expanded = expandedGroupIds.has(groupKey);
                      const expandListEvents =
                        g.count <= g.previewEvents.length
                          ? g.previewEvents
                          : groupKey in expandedGroups
                            ? expandedGroups[groupKey]
                            : undefined;
                      const gEnter = enterRowKeys.has(groupedActivityStableKey(item));
                      return (
                        <div
                          key={`${sectionIndex}-${rowIndex}-group-${groupKey}`}
                          className={gEnter ? "activity-feed-row-enter" : undefined}
                        >
                          <ActivityItem
                            kind="group"
                            group={g}
                            relativeTime={time || null}
                            isoTime={
                              g.createdAt != null
                                ? new Date(g.createdAt).toISOString()
                                : undefined
                            }
                            isExpanded={expanded}
                            onToggleExpand={() => toggleGroup(g)}
                            expandListEvents={expandListEvents}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loadingInitial && groupedFromServer.length > 0 && nextCursor ? (
          <>
            <div ref={loadMoreRef} className="h-4 w-full shrink-0" aria-hidden />
            {loadingMore ? (
              <div className="mt-1 w-full" aria-busy="true" aria-live="polite">
                <ActivitySkeletonStack count={3} />
              </div>
            ) : null}
          </>
        ) : null}

        {/* Visible fallback for heavy-grouping edge case: auto-fill capped but more data exists */}
        {autoFillCapped && nextCursor && !loadingMore ? (
          <div className="flex justify-center py-6">
            <button
              type="button"
              onClick={() => {
                setAutoFillCapped(false);
                autoFillAttemptsRef.current = 0;
                void loadMore();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium border border-[var(--border)] rounded-[var(--radius-btn)] bg-white hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-body)] transition-colors"
            >
              Load more activity
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full px-6 py-8">
          <div className="mx-auto w-full max-w-[1280px]">
            <ActivitySkeletonStack count={4} />
          </div>
        </div>
      }
    >
      <ActivityFeed />
    </Suspense>
  );
}
