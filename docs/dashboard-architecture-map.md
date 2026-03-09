# Echly Dashboard Architecture Map

> **Document Purpose:** Complete architecture analysis for the Echly dashboard. Use this map before implementing improvements. The dashboard is the primary workspace where teams review feedback captured via the Chrome extension.

---

## 1. Dashboard Page Structure

### Confirmed Routes

| Route | File | Responsibility |
|-------|------|----------------|
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Workspace list: sessions grid, search, create, filter (all/archived), Needs Attention section |
| `/dashboard/[sessionId]` | `app/(app)/dashboard/[sessionId]/page.tsx` → `SessionPageClient.tsx` | Session detail: ticket list sidebar, ticket detail view, Execution Mode |
| `/dashboard/[sessionId]/overview` | `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Session overview: metrics (total/open/done/completion %), status previews, tag distribution, recent activity |
| `/dashboard/insights` | `app/(app)/dashboard/insights/page.tsx` | Insights: recurring patterns, cross-session overlap, escalation risk, delayed clusters, owner load, resolution trend (placeholder UI) |

### Route Notes

- **`/dashboard`** — Uses `lib/sessions` + `lib/feedback` via `useWorkspaceOverview`; does **not** call `GET /api/sessions` directly (uses Firestore via `getUserSessions`).
- **`/dashboard/[sessionId]`** — Server component wraps `SessionPageClient`; session doc loaded via Firestore `getDoc`, feedback via `GET /api/feedback`.
- **`/dashboard/insights`** — Static placeholder; no backend data. Sections show hardcoded "coming soon" / placeholder content.

---

## 2. Dashboard Component Hierarchy

### Main Dashboard Page (`/dashboard`)

```
DashboardPage (page.tsx)
├── useWorkspaceOverview(viewMode)
├── InsightStrip                    ← GET /api/dashboard/metrics
├── NeedsAttentionSection          ← sessions with open > 0
└── WorkspaceCard[] (grid)
    ├── ShareSessionModal
    ├── RenameSessionModal
    └── DeleteSessionModal
```

### Session Detail Page (`/dashboard/[sessionId]`)

```
SessionPageClient
├── useAuthGuard
├── useSessionFeedbackPaginated    ← GET /api/feedback, GET /api/feedback/counts
├── useFeedbackDetailController    ← Firestore comments listener
├── TicketList (sidebar, lg+)
│   └── TicketItem[]
├── ExecutionView (main content)
│   └── FeedbackContent
│       ├── ScreenshotWithPins | ScreenshotBlock
│       ├── SuggestionSection
│       ├── ActionItemsSection
│       └── Tags
├── CommentPanel (slide-in when thread selected)
├── ExecutionModeLayout (full-screen mode)
│   └── ExecutionModeActionSteps
├── Clarity Guard modal (block submit)
├── Delete ticket modal
└── Expanded screenshot overlay
```

### Session Overview Page (`/dashboard/[sessionId]/overview`)

```
SessionOverviewPage
├── useAuthGuard
├── useSessionOverview             ← lib/feedback, lib/sessions, lib/comments
├── OverviewSessionHeader
├── MetricCard[] (4 cards)
├── StatusSection (Open / Done)
├── TagDistribution
└── RecentActivity
```

### Insights Page (`/dashboard/insights`)

```
InsightsPage
└── Static sections (no data binding):
    ├── Recurring patterns
    ├── Cross-session overlap
    ├── Escalation risk
    ├── Delayed cluster warnings
    ├── Owner load
    └── Resolution trend (placeholder)
```

---

## 3. Session Workspace Architecture

### Session List UI

- **Location:** `app/(app)/dashboard/page.tsx`
- **Data source:** `useWorkspaceOverview` → `getUserSessions` + `getSessionFeedbackCounts` (Firestore, not REST)
- **Display:** Grid of `WorkspaceCard` components (responsive: 1–5 columns)
- **Filtering:** `filterAndSortSessions()` — search by title, sort by `updatedAt` desc

### Session Card UI

- **Component:** `components/dashboard/WorkspaceCard.tsx`
- **Props:** `item: SessionWithCounts`, `onView`, `onRenameSuccess`, `onArchiveSuccess`, `onDeleteSuccess`
- **Features:** Title, feedback count, open count, view count, comment count, 3-dot menu (Copy link, Copy ID, Share, Rename, Archive, Delete)

### Session Creation

- **Trigger:** "New Session" button on `/dashboard`
- **Flow:** `handleCreateSession` → `createSession(userId, createdBy)` (lib/sessions) → `router.push(/dashboard/${sessionId})`
- **API:** Uses `createSessionRepo` via `lib/sessions`; no `POST /api/sessions` from dashboard (extension may use it)

### Session Deletion

- **Component:** `DeleteSessionModal` (from WorkspaceCard menu)
- **API:** `DELETE /api/sessions/[id]`
- **Flow:** `handleDeleteConfirm` → authFetch DELETE → `onDeleteSuccess(session.id)` → parent removes from list

### Session Rename

- **Component:** `RenameSessionModal` (from WorkspaceCard or TicketList sidebar menu)
- **API:** `PATCH /api/sessions/[id]` with `{ title }`
- **Flow:** `handleRenameSave` → authFetch PATCH → `onRenameSuccess` → parent updates session in state

### Session Archive

- **Trigger:** WorkspaceCard dropdown → Archive
- **API:** `PATCH /api/sessions/[id]` with `{ archived: true }`
- **Effect:** `onArchiveSuccess` removes from "all" view (archived shown in separate tab)

---

## 4. Feedback Data Flow

### Expected vs Actual Flow

| Step | Expected | Actual |
|------|----------|--------|
| Dashboard load | GET /api/sessions | `getUserSessions` (Firestore) + `getSessionFeedbackCounts` |
| User clicks session | Navigate to `/dashboard/[sessionId]` | Same |
| Load feedback | GET /api/feedback?sessionId=... | Same |

### Fetching Sessions

- **Dashboard page:** `useWorkspaceOverview` → `getUserSessions(uid, 50, { archivedOnly })` + `getSessionFeedbackCounts` per session
- **API route:** `GET /api/sessions` exists but dashboard does not use it; uses Firestore directly

### Fetching Feedback

- **Initial:** `useSessionFeedbackPaginated` → `GET /api/feedback?sessionId=X&cursor=&limit=20`
- **Counts:** `GET /api/feedback/counts?sessionId=X` (runs in parallel for immediate badge display)
- **Detail:** `GET /api/tickets/:id` when `selectedId` changes

### Pagination Logic

- **Location:** `useSessionFeedbackPaginated`
- **Page size:** 20
- **Load cap:** 200 items (client-side protection)
- **Mechanism:** Scroll near bottom + IntersectionObserver on sentinel div
- **Debounce:** 150ms on scroll handler

### Ticket Selection Logic

- **State:** `selectedId` in `SessionPageClient`
- **Auto-select:** First feedback when list loads and none selected
- **Execution Mode:** Selection constrained to open tickets only; preloads next ticket for instant transition

---

## 5. State Management Architecture

### useWorkspaceOverview

| Property | Type | Purpose |
|----------|------|---------|
| `sessions` | `SessionWithCounts[]` | Sessions + open/resolved counts |
| `loading` | boolean | Initial load |
| `handleCreateSession` | () => void | Create session, navigate |
| `updateSession` | (id, patch) => void | Optimistic session update |
| `removeSession` | (id) => void | Remove from list (archive/delete) |
| `stats` | WorkspaceStats | Aggregated counts |

**Used by:** `DashboardPage`

### useSessionFeedbackPaginated

| Property | Type | Purpose |
|----------|------|---------|
| `feedback` | Feedback[] | Paginated list |
| `setFeedback` | setter | Mutate list (create, delete, resolve) |
| `total`, `activeCount`, `resolvedCount`, `skippedCount` | number | Server counts |
| `setTotal`, `setActiveCount`, etc. | setters | Optimistic count updates |
| `loading`, `loadingMore`, `hasMore`, `hasReachedLimit` | boolean | Loading state |
| `loadMoreRef` | RefObject | Sentinel for infinite scroll |

**Used by:** `SessionPageClient`

### useFeedbackDetailController

| Property | Type | Purpose |
|----------|------|---------|
| `comments` | Comment[] | Realtime from Firestore |
| `loadingComments` | boolean | Comments loading |
| `sendComment`, `sendReply`, `sendPinComment`, `sendTextComment` | fns | Add comments |
| `updateComment`, `deleteComment`, `updatePinPosition` | fns | Edit comments |
| `resolve` | fn | Resolve feedback |

**Used by:** `SessionPageClient`

### useSessionOverview

| Property | Type | Purpose |
|----------|------|---------|
| `data` | SessionOverviewData | Session, counts, status preview, activity, tags |
| `loading` | boolean | Load state |
| `error` | Error | Load error |

**Used by:** `SessionOverviewPage`

### useCommandCenterData

| Property | Type | Purpose |
|----------|------|---------|
| `summary` | AIExecutiveSummary | High-impact items, risk alerts, momentum |
| `priorityRadarGroups` | PriorityRadarGroup[] | Critical/At Risk/Stalled/Trending |
| `momentum` | ExecutionMomentum | Resolution velocity |
| `heatmapBuckets` | SignalHeatmapBucket[] | Session feedback counts |

**Used by:** Not currently used by dashboard pages (prepared for future Command Center)

### State Flow Summary

```
DashboardPage
  useWorkspaceOverview → sessions, create, update, remove

SessionPageClient
  useSessionFeedbackPaginated → feedback list, counts, pagination
  useFeedbackDetailController → comments (realtime)
  Local state: selectedId, detailTicket, session, executionMode, etc.

SessionOverviewPage
  useSessionOverview → overview data (Firestore + lib)
```

---

## 6. Screenshot Handling

### Storage

- **Field:** `screenshotUrl` on feedback/ticket document
- **Source:** Firebase Storage via `uploadScreenshot()` in `lib/screenshot.ts`
- **Path:** `sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png`
- **Value:** Download URL (string)

### Rendering

- **Components:**
  - `ScreenshotBlock` — Simple image + expand button (no pins)
  - `ScreenshotWithPins` — Image + pin markers, comment mode, draggable pins
- **Usage:** `FeedbackContent` uses `ScreenshotWithPins` when `sendPinComment` is provided, else `ScreenshotBlock`
- **Next/Image:** Used with `fill`, `object-contain`; `unoptimized` for data URLs

### Zooming

- **In-place:** Execution Mode has Zoom button; `Z` toggles full-screen zoom
- **Detail view:** Expand button opens fixed overlay; click outside to close

### Annotations / Pins

- **Supported:** Pin comments with `{ xPercent, yPercent }` position
- **Component:** `ScreenshotWithPins` renders `PinMarker` per pin
- **Features:** Click to open popover, drag to reposition, resolve, reply

### Not Supported

- Element markers (DOM selectors)
- Highlight overlays (beyond pin markers)
- Zoom/pan within inline view (only full-screen expand)

---

## 7. Ticket Editing System

### API Endpoints

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| GET | `/api/tickets/:id` | — | Fetch single ticket |
| PATCH | `/api/tickets/:id` | `title`, `description`, `actionSteps`, `suggestedTags`, `isResolved`, `isSkipped`, `screenshotUrl` | Update ticket |
| DELETE | `/api/tickets/:id` | — | Delete ticket |

### Edit Locations

| Field | Component | Handler |
|-------|-----------|---------|
| Title | ExecutionView header (static in current ExecutionView) | `saveTitle` in SessionPageClient; `ExecutionCanvas` has editable title, not used here |
| Description | Not exposed in ExecutionView | — |
| Action steps | `ActionItemsSection` in FeedbackContent | `saveActionSteps` → PATCH |
| Tags | `FeedbackContent` tag section | `saveTags` → PATCH |
| Status (resolve) | ExecutionView action bar | `saveResolved` → PATCH |
| Skip | Execution Mode | `handleExecutionSkip` → PATCH |

### Delete Flow

- `onDelete` → `setShowDeleteModal(true)` → Confirm → `handleDeleteFeedback(id)` → optimistic remove → `DELETE /api/tickets/:id` → on success navigate to `/dashboard/[sessionId]` (stays on page; list updates)

### Optimistic Updates

- Title, action steps, tags, resolve: optimistic update to `detailTicket` and `feedback` list, then PATCH; rollback on error

---

## 8. Performance Risks

### Large Screenshot Rendering

- **Risk:** Full-resolution screenshots in list/detail
- **Mitigation:** `ScreenshotBlock` uses `loading="lazy"`; `max-h-[317px]`; Next Image with `sizes`
- **Gap:** No responsive srcset; large images can still impact LCP

### Long Ticket Lists

- **Risk:** 200+ items in DOM
- **Mitigation:** Pagination (20 per page), 200-item cap; no virtualization
- **Gap:** All loaded items rendered; no `react-window` / `react-virtual`

### Unnecessary Rerenders

- **Risk:** `SessionPageClient` has many `useState` and passes many props
- **Mitigation:** `TicketList` and `TicketItem` are `memo()`'d
- **Gap:** No React.memo on ExecutionView, FeedbackContent; `feedback` array reference changes can trigger cascading rerenders

### Expensive Hooks

- **useSessionOverview:** Multiple Firestore reads + `getFeedbackByIds` on each sessionId change
- **useFeedbackDetailController:** New Firestore listener per `feedbackId`; cleanup on change
- **useWorkspaceOverview:** Loads all sessions + counts on mount and viewMode change; no incremental loading

### Other

- **Session doc:** Loaded via `getDoc` in useEffect; blocks until ready
- **Counts:** Fetched separately from feedback; potential for count/list mismatch flicker (partially mitigated by `/api/feedback/counts`)

---

## 9. UX Gaps

| Gap | Description |
|-----|-------------|
| **Ticket title editing** | ExecutionView receives `onSaveTitle` but renders static title; `FeedbackHeader`/`ExecutionCanvas` support editing but are not used in current ExecutionView |
| **Description editing** | No UI to edit ticket description in dashboard |
| **Share session** | ShareSessionModal is placeholder: "Invite by email — coming soon" |
| **Insights page** | All sections are static placeholders; no real data |
| **Session overview** | "Owner • —" hardcoded; no real owner display |
| **Assign / Defer** | Buttons present but `onAssign` is no-op |
| **Keyboard nav** | Limited; Execution Mode has D/N/S/C/A shortcuts |
| **Mobile** | Ticket list is slide-over on mobile; no table/list view toggle |
| **Real-time sync** | Feedback list is not realtime; new tickets from extension use `ECHLY_FEEDBACK_CREATED` event |
| **Bulk actions** | "Resolve all" / "Reopen all" exist; no multi-select, bulk delete, or bulk assign |

---

## 10. Opportunities for Major Improvement

### Architecture

1. **Unify data sources** — Dashboard uses Firestore directly for sessions; API has `GET /api/sessions`. Standardize on REST or Firestore.
2. **Centralize ticket state** — `detailTicket` and `feedback` list can drift; consider single source (e.g. normalized store or server state).
3. **Extract SessionPageClient** — Large file (~1200 lines); split into sub-components and custom hooks.

### Performance

4. **Virtualize ticket list** — Use `@tanstack/react-virtual` or similar for 100+ items.
5. **Lazy-load screenshots** — Native lazy loading + blur placeholder.
6. **Preload session** — Prefetch session doc and first page when hovering WorkspaceCard.

### UX

7. **Enable ticket title editing** — Wire `onSaveTitle` in ExecutionView or use FeedbackHeader/ExecutionCanvas.
8. **Implement Insights** — Connect to backend for patterns, overlap, risk, trends.
9. **Implement Share** — Invite by email, link sharing, permissions.
10. **Execution Mode polish** — Quick note (`/`) exists but not persisted; add save, keyboard hints.

### Developer Experience

11. **Type safety** — Align `TicketFromApi` and `Feedback`; reduce `as` casts.
12. **Error boundaries** — Add boundaries around major sections (list, detail, overview).
13. **Testing** — No visible tests for dashboard; add unit tests for hooks and integration tests for flows.

---

## Appendix: File Reference

| Path | Purpose |
|------|---------|
| `app/(app)/dashboard/page.tsx` | Dashboard main page |
| `app/(app)/dashboard/[sessionId]/page.tsx` | Session page wrapper |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Session detail client |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Session overview |
| `app/(app)/dashboard/insights/page.tsx` | Insights placeholder |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | Workspace state |
| `app/(app)/dashboard/hooks/useCommandCenterData.ts` | Command Center data (unused) |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | Paginated feedback |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | Comments + actions |
| `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` | Overview data |
| `components/dashboard/WorkspaceCard.tsx` | Session card |
| `components/dashboard/InsightStrip.tsx` | Metrics strip |
| `components/dashboard/NeedsAttentionSection.tsx` | Needs attention list |
| `components/dashboard/RenameSessionModal.tsx` | Rename session |
| `components/dashboard/DeleteSessionModal.tsx` | Delete session |
| `components/dashboard/ShareSessionModal.tsx` | Share placeholder |
| `components/layout/operating-system/TicketList.tsx` | Ticket sidebar |
| `components/layout/operating-system/ExecutionView.tsx` | Ticket detail view |
| `components/layout/operating-system/ExecutionModeLayout.tsx` | Full-screen execution |
| `components/session/feedbackDetail/FeedbackContent.tsx` | Ticket body |
| `components/session/feedbackDetail/ScreenshotWithPins.tsx` | Screenshot + pins |
| `components/session/feedbackDetail/ScreenshotBlock.tsx` | Simple screenshot |
| `app/api/feedback/route.ts` | GET/POST feedback |
| `app/api/feedback/counts/route.ts` | GET counts |
| `app/api/tickets/[id]/route.ts` | GET/PATCH/DELETE ticket |
| `app/api/sessions/route.ts` | GET/POST sessions |
| `app/api/sessions/[id]/route.ts` | PATCH/DELETE session |
| `app/api/dashboard/metrics/route.ts` | Dashboard metrics |
