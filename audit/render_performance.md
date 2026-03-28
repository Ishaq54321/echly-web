# Phase 6.7 — Render performance audit

Focus: **list/array work** on each render, **sort/filter** cost, and **memoization** presence in hot paths.

---

## Well-memoized patterns

| Location | Pattern |
|----------|---------|
| `app/(app)/dashboard/page.tsx` | `useMemo` for `filteredSessions`, `activeSessions`, `archivedSessions`, `tabFilteredSessions`, `workspaceSections` after `filterAndSortSessions` |
| `useSessionFeedbackPaginated.ts` | `useMemo` for `openFeedback` / `resolvedFeedback` from `canonicalFeedback` |
| `insights/page.tsx` | Heavy chart derivations wrapped in `useMemo` (`filteredDaily`, `activityTrend`, `issueTypeSlices`, `sessionBars`, etc.) |
| `DiscussionList.tsx` | `useMemo` for `filteredItems` (project + search) |
| `SessionPageClient.tsx` | Extensive `useMemo` / `useStableState` for selected item, contextual index, `sessionActionCaps`, etc. (large file) |

---

## Sorting / filtering on large structures

| Location | Behavior | Risk |
|----------|----------|------|
| `useSessionFeedbackPaginated` | `finalizeList` → `dedupeFeedbackById` + **in-place sort** by timestamp on **every** canonical list update | **O(n log n)** per snapshot; acceptable for small/medium n, degrades for very large sessions |
| `dashboard/page.tsx` | `filterAndSortSessions` runs inside `useMemo` when `stableSessions` or `search` changes | Bounded by 30 sessions from query + optimistic rows |
| `DiscussionFeed.tsx` (unused) | Sorts up to 100 raw items client-side after `getDocs` | Would run per load, not per render |
| `insights/page.tsx` | Multiple `Object.entries` + `sort` on small maps | Low |

---

## `map()` on lists in render

| Component | Notes |
|-----------|-------|
| `SessionsWorkspace` / children | Maps session sections to rows — driven by memoized `workspaceSections` |
| `TicketList` (session board) | Maps feedback arrays; depends on list size |
| `DiscussionList` | Maps `filteredItems` |
| `DiscussionFeed` | Maps `items` |

**Risk**: If parent passes **new array identity** every render without memoization, child lists re-render. `SessionPageClient` uses `useStableState` for feedback subsets to reduce flicker — helps **perception**; still reconciles list children when data changes.

---

## Missing or partial memoization (watchlist)

| Area | Observation |
|------|-------------|
| `useWorkspaceOverview` | Builds `sessionsWithCounts` with `.map` each render from `sessions` + `countsForView` — **light** work (≤30 rows) but new array each time; consumers should memoize if passed deep trees |
| `useFeedbackDetailController` | `mergeRealtimeComments` on each snapshot — not per render; OK |
| `GlobalSearch` | Depends on `useWorkspaceOverview` — re-renders when context updates |

---

## `useSessionFeedbackPaginated` list updates

- `setItems(list)` replaces full array from snapshot processing.
- **Re-sort** runs inside `finalizeList` on updates — correct for ordering but **cpu** cost scales with ticket count.

---

## Image / media

| Location | Behavior |
|----------|----------|
| `SessionPageClient` | Preloads next 1–2 screenshot URLs when selection changes (`preloadImage`) | Reduces perceived latency; extra network for adjacent tickets |

---

## Summary for Phase 6.7

- **Primary CPU concern**: Very large sessions × **full-list sort** on each Firestore snapshot + **large React list reconciliation**.
- **Primary memo win already in place**: Dashboard filters, insights derivations, open/resolved feedback splits.
- **Secondary**: `sessionsWithCounts` allocation frequency; likely negligible at limit 30.
