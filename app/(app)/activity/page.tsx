"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Clock, Filter, Settings } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { ActivityItem } from "@/components/activity/ActivityItem";
import { getTier } from "@/components/activity/eventIcons";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import {
  ACTIVITY_FILTER_CATEGORY_IDS,
  ACTIVITY_FILTER_CATEGORY_LABELS,
  categoriesToEventTypesForApi,
  type ActivityFilterCategoryId,
} from "@/lib/activity/activityEventTypeFilters";
import {
  groupEvents,
  groupEventsByDay,
  partitionEarlierByWeek,
  type ActivityEvent,
  type GroupedActivity,
} from "@/lib/activity/groupEvents";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActivityFeedData = {
  events: unknown[];
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
  cursor: string | null
): Promise<ActivityFeedData> {
  const params = new URLSearchParams();
  params.set("limit", "20");
  if (sessionIdFilter) params.set("sessionId", sessionIdFilter);
  if (eventTypes.length > 0) params.set("eventTypes", eventTypes.join(","));
  if (cursor) params.set("cursor", cursor);
  const res = await authFetch(`/api/activity-feed?${params.toString()}`);
  if (!res) throw new Error("Could not reach activity feed.");
  const json = (await res.json()) as ApiEnvelope<ActivityFeedData>;
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? "Failed to load activity.");
  }
  return json.data;
}

/** Soft color-coded selected state for activity type pills (+ tactile depth). */
const ACTIVITY_TYPE_PILL_ACTIVE: Record<ActivityFilterCategoryId, string> = {
  comments: "bg-blue-50 text-blue-600 shadow-sm",
  created: "bg-purple-50 text-purple-600 shadow-sm",
  resolved: "bg-green-50 text-green-600 shadow-sm",
};

/** Shared geometry + motion; default fill/text/hover applied unless overridden by active state. */
const FILTER_PILL_BASE =
  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border-0 px-3 py-1.5 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]";

const FILTER_PILL_DEFAULT =
  "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900";

/** Session narrowed to one workspace: same pill language, light surface only. */
const FILTER_PILL_SESSION_ACTIVE =
  "bg-white text-neutral-900 shadow-sm hover:bg-white hover:text-neutral-900";

// ─── Page ────────────────────────────────────────────────────────────────────

function ActivityFeed() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** Session filter: `?sessionId=` is canonical so links and router.replace stay in sync. */
  const selectedSessionId = searchParams.get("sessionId")?.trim() || null;
  /** At most one type filter; `null` = all activity types (no filter). */
  const [selectedCategory, setSelectedCategory] = useState<ActivityFilterCategoryId | null>(null);
  const { sessions: sessionsWithCounts } = useWorkspaceStore();
  const sessions = useMemo(
    () => sessionsWithCounts.map(({ session }) => session),
    [sessionsWithCounts]
  );
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const sessionMenuRef = useRef<HTMLDivElement>(null);

  const { user, loading: authLoading } = useAuthGuard();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<ActivityFeedData["nextCursor"]>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
  const [expandedSystemKeys, setExpandedSystemKeys] = useState<Set<string>>(() => new Set());

  const eventTypesForApi = useMemo(
    () => categoriesToEventTypesForApi(selectedCategory ? [selectedCategory] : []),
    [selectedCategory]
  );
  const eventTypesParamKey = eventTypesForApi.join(",");

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

  const grouped = useMemo(() => groupEvents(events), [events]);
  const dayBuckets = useMemo(() => {
    const { today, yesterday, earlier } = groupEventsByDay(grouped);
    const { thisWeek, rest } = partitionEarlierByWeek(earlier, new Date());
    return [
      { label: "Today" as const, items: today },
      { label: "Yesterday" as const, items: yesterday },
      { label: "This week" as const, items: thisWeek },
      { label: "Earlier" as const, items: rest },
    ].filter((s) => s.items.length > 0);
  }, [grouped]);

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
    setExpandedGroupIds(new Set());
    setExpandedSystemKeys(new Set());
  }, [selectedSessionId, eventTypesParamKey]);

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
      setLoadingInitial(true);
      setEvents([]);
      setNextCursor(null);
      try {
        const data = await fetchActivityFeed(selectedSessionId, eventTypesForApi, null);
        if (cancelled) return;
        setEvents(data.events.map(normalizeApiEvent));
        setNextCursor(data.nextCursor);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setEvents([]);
          setNextCursor(null);
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, authLoading, selectedSessionId, eventTypesForApi]);

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
    if (!nextCursor || loadingMore || !user?.uid) return;
    const cursor = JSON.stringify(nextCursor);
    setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchActivityFeed(selectedSessionId, eventTypesForApi, cursor);
      setEvents((prev) => [...prev, ...data.events.map(normalizeApiEvent)]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, user?.uid, selectedSessionId, eventTypesForApi]);

  const toggleGroup = useCallback((id: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
        <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-2.5 mb-7">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h1 className="text-[16px] font-medium text-foreground">Activity</h1>
        </div>
        <p className="text-sm text-muted-foreground">Please sign in to view activity.</p>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="w-full px-6 py-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Page header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h1 className="text-[16px] font-medium text-foreground">Activity</h1>
            {events.length > 0 && (
              <span className="text-[12px] text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5 tabular-nums">
                {events.length}{nextCursor ? "+" : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end">
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
                    selectedSessionId ? FILTER_PILL_SESSION_ACTIVE : FILTER_PILL_DEFAULT
                  }`}
                >
                  <Filter
                    className="h-3.5 w-3.5 shrink-0 text-neutral-600 opacity-60"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{selectedSessionLabel}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-neutral-600 opacity-60 transition-transform duration-150 ${sessionMenuOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>

                {sessionMenuOpen ? (
                  <div
                    className="absolute left-1/2 top-full z-[200] mt-1 w-max min-w-[220px] max-w-[min(100vw-2rem,320px)] -translate-x-1/2 rounded-xl border border-neutral-200/80 bg-neutral-100 p-1.5 text-neutral-900 shadow-[var(--shadow-level-4)] dark:border-neutral-200/80 dark:bg-neutral-100 dark:text-neutral-900"
                    role="listbox"
                    aria-label="Sessions"
                  >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!selectedSessionId}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-200/50 ${!selectedSessionId ? "bg-neutral-200/60 font-medium" : "font-normal"}`}
                    onClick={() => {
                      onSessionFilterChange("");
                      setSessionMenuOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">All sessions</span>
                    {!selectedSessionId ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-neutral-600 opacity-70"
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
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-200/50 ${selected ? "bg-neutral-200/60 font-medium" : "font-normal"}`}
                        onClick={() => {
                          onSessionFilterChange(s.id);
                          setSessionMenuOpen(false);
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate">{s.title}</span>
                        {selected ? (
                          <Check
                            className="h-3.5 w-3.5 shrink-0 text-neutral-600 opacity-70"
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
                      className={`${FILTER_PILL_BASE} ${
                        selected ? ACTIVITY_TYPE_PILL_ACTIVE[id] : FILTER_PILL_DEFAULT
                      }`}
                    >
                      {ACTIVITY_FILTER_CATEGORY_LABELS[id]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <p className="px-6 py-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {/* Loading */}
        {loadingInitial ? (
          <div className="flex justify-center py-10" aria-busy="true" aria-live="polite">
            <MinimalLoader compact label="Loading activity…" />
          </div>
        ) : events.length === 0 && !error ? (
          /* Empty state */
          <div className="flex flex-col items-center py-14 text-center px-6">
            <div className="mb-4 text-muted-foreground" aria-hidden>
              <Clock className="h-8 w-8 opacity-30" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Activity from your sessions will show up here
            </p>
          </div>
        ) : events.length === 0 ? null : (

          /* Feed */
          <div className="space-y-4">
            {collapsedDayBuckets.map((section) => {
              const renderRows = section.renderRows;
              return (
                <div key={section.label} className="space-y-2">

                  {/* Day section rule */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" aria-hidden />
                    <span className="text-[13px] font-semibold text-foreground/60 whitespace-nowrap tracking-wide">
                      {section.label}
                    </span>
                    <div className="flex-1 h-px bg-border" aria-hidden />
                  </div>

                  {/* Event rows with timeline spine */}
                  <div className="relative pb-3">
                    {/* Vertical spine — centred on w-[52px] column (26px from row left edge) */}
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 w-px bg-border/50"
                      style={{ left: 26 }}
                      aria-hidden
                    />

                    {renderRows.map((row) => {
                      /* System-event collapse chip */
                      if (row.kind === "system-collapse") {
                        const isExpanded = expandedSystemKeys.has(row.key);
                        return (
                          <div key={row.key}>
                            <button
                              type="button"
                              onClick={() => toggleSystemGroup(row.key)}
                              className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent py-3 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <div className="relative z-10 flex w-[52px] shrink-0 justify-center">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground"
                                  aria-hidden
                                >
                                  <Settings className="h-5 w-5" />
                                </div>
                              </div>
                              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                <span className="min-w-0 text-[15px] font-normal leading-snug text-muted-foreground">
                                  {row.items.length} system{" "}
                                  {row.items.length === 1 ? "event" : "events"}
                                </span>
                                <ChevronDown
                                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                                  aria-hidden
                                />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="mt-2 w-full min-w-0 pl-[52px]">
                                {row.items.map((item) => {
                                  const ev =
                                    item.type === "single"
                                      ? item.event
                                      : item.events[0]!;
                                  const time = formatRelativeActivityTime(ev.createdAt);
                                  const rowKey =
                                    ev.id || `sys-${ev.eventType}-${ev.createdAt}`;
                                  return (
                                    <ActivityItem
                                      key={rowKey}
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
                        return (
                          <ActivityItem
                            key={rowKey}
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
                      }

                      /* Group row */
                      const g = item;
                      const time = formatRelativeActivityTime(g.createdAt);
                      const expandId = g.primaryEventId;
                      const expanded = expandedGroupIds.has(expandId);
                      return (
                        <ActivityItem
                          key={`group-${expandId}`}
                          kind="group"
                          group={g}
                          relativeTime={time || null}
                          isoTime={
                            g.createdAt != null
                              ? new Date(g.createdAt).toISOString()
                              : undefined
                          }
                          isExpanded={expanded}
                          onToggleExpand={() => toggleGroup(expandId)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {!loadingInitial && nextCursor ? (
          <div className="flex justify-center py-4 border-t border-border">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loadingMore ? (
                <span
                  className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin"
                  aria-hidden
                />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden />
              )}
              Load more events
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="w-full" />}>
      <ActivityFeed />
    </Suspense>
  );
}
