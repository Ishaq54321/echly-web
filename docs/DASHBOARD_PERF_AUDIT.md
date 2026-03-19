# Dashboard Performance Audit

## Scope and Method

- Audited dashboard load path from `app/(app)/dashboard/page.tsx` and its direct dependencies.
- Traced session loading code (`useWorkspaceOverview`, `getWorkspaceSessions`, `sessionsStore`, `fetchSessions`, `/api/sessions`).
- Mapped all `onSnapshot()` usage and classified listeners by data domain.
- Analyzed render-blocking behavior and request waterfall from code paths (plus observed runtime log patterns).
- No implementation changes were made in this audit.

---

## 1) Dashboard Entry Trace

### Entry file

- `app/(app)/dashboard/page.tsx` (client component)

### Hooks used directly in dashboard page

- React hooks:
  - `useState` (view mode, search, folders, modal state, capture state)
  - `useEffect` (folder loading)
  - `useMemo` (session filtering/sorting and folder membership maps)
- Next hooks:
  - `useRouter`
- App hooks/context:
  - `useWorkspaceOverview(viewMode)` (primary sessions data source)
  - `useToast()`
  - `useDragSession()`

### Dashboard data dependencies

- Sessions list + counts from `useWorkspaceOverview`:
  - ultimately `getUserWorkspaceIdRepo(uid)` + `getWorkspaceSessions(workspaceId, 50, ...)`
- Folder list from Firestore client SDK:
  - `getDocs(collection(db, "folders"))` (unfiltered full collection fetch)
- UI-only data:
  - search query, tab mode, drag state, modal state

### Async calls triggered by dashboard page

- From `useWorkspaceOverview`:
  - `onAuthStateChanged(auth, ...)`
  - `getUserWorkspaceIdRepo(uid)` -> Firestore read `users/{uid}`
  - `getWorkspaceSessions(...)` -> Firestore query `sessions` with `workspaceId`, `orderBy(updatedAt desc)`, `limit(50)`
  - fallback `getUserSessions(...)` only if workspace query returns empty
- From dashboard page itself:
  - `loadFolders()` -> `getDocs(collection(db, "folders"))` (full folders collection)
  - folder CRUD operations (`addDoc`, `updateDoc`, `deleteDoc`) happen on user action, not initial load

### App-shell requests that also happen during dashboard load

- `WorkspaceSuspendedGuard` requests `/api/workspace/status` (non-blocking redirect check)
- `BillingUsageCacheInitializer` requests `/api/billing/usage` (background cache warmup)
- `GlobalRail` + `FloatingUtilityActions` each use `useAuthGuard`, which calls `ensureUserWorkspaceLinkRepo(currentUser)` on auth callback (fire-and-forget transaction path, duplicated at least twice in shell)

---

## 2) Session Data Analysis

### Traced components

- `useWorkspaceOverview` in `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`
- `sessionsStore` in `lib/realtime/sessionsStore.ts`
- `fetchSessions` in `echly-extension/src/content.tsx` via `echly-extension/src/cachedSessions.ts`
- API route `app/api/sessions/route.ts`

### SESSION DATA ANALYSIS

#### `useWorkspaceOverview` -> `getWorkspaceSessionsRepo` (dashboard uses this)

- Fields returned:
  - Full `Session` document is returned (`id` + spread of all fields from Firestore doc):
    - `workspaceId`, `userId`, `title`, `archived`, `createdAt`, `updatedAt`
    - `createdBy` object
    - counts (`openCount`, `resolvedCount`, `skippedCount`, `totalCount`, `feedbackCount`, `commentCount`, `viewCount`)
    - optional AI fields (`aiInsightSummary`, `aiInsightSummaryFeedbackCount`, `aiInsightSummaryUpdatedAt`)
- Heavy fields present:
  - Potentially large text field: `aiInsightSummary`
  - Nested object: `createdBy`
  - No feedback list, no comments array, no screenshots in session payload
- Estimated payload size:
  - Typical: ~0.5KB-2KB per session doc depending on title/summary fields
  - With limit 50: ~25KB-100KB typical; can exceed this if summaries are long
- Over-fetching issues:
  - Dashboard cards primarily need id/title/updatedAt/archive + counts; full session doc is still fetched
  - AI summary and non-card metadata are fetched even if unused on dashboard cards

#### `sessionsStore` (`lib/realtime/sessionsStore.ts`)

- Fields returned:
  - Also maps full `Session` document (`items: Session[]`)
- Heavy fields present:
  - Same as above (possible `aiInsightSummary`, nested `createdBy`)
  - No feedback list/comments/screenshot payload in this store itself
- Estimated payload size:
  - Potentially very large over time because query has no `limit`
  - Worst case grows with workspace session count (unbounded per workspace)
- Over-fetching issues:
  - Query listens to all sessions in workspace: `where("workspaceId","==",...)` without limit or projection
  - Realtime transfer cost can spike in large workspaces

#### `fetchSessions` (extension only, not dashboard page)

- Fields returned (from `/api/sessions`):
  - `id`, `title`, `updatedAt`, `openCount`, `resolvedCount`, `feedbackCount` (and route also includes `name`, `skippedCount`, `totalCount`, `archived`)
- Heavy fields present:
  - No feedback list
  - No comments
  - No screenshots
  - No nested objects
- Estimated payload size:
  - ~0.2KB-0.4KB per session
  - API route currently limits to 30 sessions => ~6KB-12KB typical JSON payload
- Over-fetching issues:
  - Low. This is comparatively optimized and bounded.

#### `/api/sessions` route

- Query:
  - `sessions` where `workspaceId == ...`, `orderBy(updatedAt desc)`, `limit(30)`
- Returned shape:
  - Lightweight mapped DTO, not full Firestore document
- Heavy fields present:
  - No nested heavy objects
  - No feedback list/comments/screenshots
- Over-fetching issues:
  - Minimal in route output; notable issue is route is not used by dashboard page for initial session list (dashboard uses direct Firestore full docs).

---

## 3) Realtime Listener Analysis

### All `onSnapshot()` occurrences identified

- `lib/realtime/sessionsStore.ts`
- `lib/realtime/workspaceStore.ts`
- `lib/realtime/feedbackStore.ts`
- `lib/repositories/commentsRepository.ts` (`listenToCommentsRepo`)
- `app/(app)/dashboard/insights/page.tsx` (workspace insights doc)
- `app/(app)/folders/[folderId]/page.tsx` (single folder doc)

### REALTIME LISTENER ANALYSIS

- Total listeners:
  - 6 listener definitions in repo
  - Core requested categories:
    - sessions: 1
    - workspace: 2 (workspace doc store + insights doc listener)
    - feedback: 2 (feedback list + comments thread listener)
    - other: 1 (single folder doc)

- Duplicate listeners:
  - `sessionsStore`, `workspaceStore`, and `feedbackStore` are singleton stores and avoid duplicate subscriptions for the same id (`if unsubscribe && currentId===normalizedId return`)
  - No direct duplicate `onSnapshot` registration found for same store/id path
  - Separate issue: duplicate auth subscriptions exist (`useAuthGuard` used in multiple shell components), but that is not `onSnapshot`

- Heavy queries:
  - **Sessions listener (high risk)**:
    - `query(collection("sessions"), where("workspaceId","==",workspaceId))`
    - No `limit`, no projection
    - Effectively listens to full workspace session collection
  - **Feedback listener (moderate)**:
    - `where("sessionId","==",...), orderBy("createdAt","desc"), limit(30)`
    - Bounded but each doc includes many metadata fields (`screenshotUrl`, `userAgent`, clarity metadata, etc.)
  - **Comments listener (moderate)**:
    - `where("sessionId","==",...), where("feedbackId","==",...), orderBy("createdAt"), limit(100)`

- Risk level:
  - Sessions listener: **High**
  - Feedback/comments listeners: **Medium**
  - Workspace doc listeners: **Low**

---

## 4) Render Blocking Analysis

### RENDER BLOCKING ANALYSIS

- Blocking components:
  - Dashboard sessions grid is blocked on `loading` from `useWorkspaceOverview`:
    - renders `<SessionsGridSkeleton />` until sessions resolve
  - Folders section is blocked on `foldersLoading`:
    - renders folder skeleton until folder query resolves

- Blocking hooks:
  - `useWorkspaceOverview`
    - waits for auth state callback
    - then sequential async chain (`getUserWorkspaceIdRepo` -> `getWorkspaceSessions`)
  - Folders `loadFolders()`
    - full collection fetch with no workspace filter

- Critical delays:
  - Session list first paint depends on Firestore latency + auth state + workspace-id lookup
  - Folder data load can be expensive because it reads full `folders` collection
  - API checks in shell (`/api/workspace/status`, `/api/billing/usage`) are non-blocking for dashboard content, but still consume startup bandwidth

- Clarification on billing/workspace waits:
  - Dashboard page does **not** block main content on billing usage or workspace usage
  - Those are loaded in shell/background and profile panel flows

---

## 5) Network Analysis (Code-Level Waterfall)

### Requests/RPCs triggered on dashboard load

- HTTP:
  - `GET /api/workspace/status` (workspace suspended guard)
  - `GET /api/billing/usage` (billing cache warmup)
- Firestore SDK RPCs:
  - `getDoc(users/{uid})` via `getUserWorkspaceIdRepo`
  - `getDocs(sessions query where workspaceId, orderBy updatedAt desc, limit 50)`
  - fallback `getDocs(sessions query where userId...)` only when workspace query returns empty
  - `getDocs(collection("folders"))` (unscoped full fetch)
- Auth-triggered transactional reads/writes:
  - `ensureUserWorkspaceLinkRepo` invoked by multiple `useAuthGuard` consumers in shell

### NETWORK ANALYSIS

- Total requests:
  - Baseline dashboard route startup: 2 HTTP + 3-5 Firestore operations (depending on fallback and auth guard side effects)

- Sequential dependencies:
  - Sessions chain is sequential:
    1. resolve workspace id (`users/{uid}`)
    2. fetch sessions for workspace
    3. optional fallback fetch by userId
  - This sequence blocks session grid final render.

- Parallelization issues:
  - Folder fetch runs in parallel with sessions load (good), but is an expensive unscoped query
  - Shell API calls run in parallel and are non-blocking (good), but add startup contention
  - Multiple `useAuthGuard` instances duplicate workspace-link ensure transaction work

---

## 6) Root Causes

### ROOT CAUSES (Top 5)

1. Dashboard session loading fetches **full Firestore session docs** (up to 50) instead of lightweight DTO fields needed for cards.
2. Folder loading uses `getDocs(collection("folders"))` **without workspace filtering**, causing potentially unbounded reads.
3. Session load path has **sequential dependency chain** (`auth -> workspaceId lookup -> sessions query`), increasing time-to-content.
4. Shell mounts trigger extra startup calls (`/api/workspace/status`, `/api/billing/usage`) and duplicated auth side effects, increasing initial network pressure.
5. Realtime sessions store query (`onSnapshot` on workspace sessions with no limit) is a high-risk path for large workspaces and future dashboard scalability.

---

## 7) Recommended Fixes (Do Not Implement)

### Lazy Loading Opportunities

- Defer non-critical shell checks (`/api/workspace/status`) until after first meaningful paint where acceptable.
- Keep profile/analytics (`/api/insights`) strictly on-demand (already good); maintain this pattern for other non-core data.
- Load folders after initial sessions paint or progressively hydrate folder metadata.

### Data Reduction

- Replace dashboard’s direct full-doc Firestore session fetch with lightweight server DTO endpoint (or a selective store contract) returning only card fields.
- Keep `/api/sessions` style payload shape for dashboard list use (bounded + normalized + minimal fields).
- Exclude `aiInsightSummary` and other non-card fields from initial dashboard list payload.

### Listener Optimization

- Add explicit `limit` and ordering to realtime sessions listener (or switch to paged snapshots where possible).
- Ensure feedback/comments listeners mount only when the corresponding panel is visible and unmount aggressively.
- Maintain singleton subscription guards; add diagnostics counters to detect accidental duplicate subscriptions.

### Render Improvements

- Split dashboard loading states into smaller islands:
  - show session grid shell immediately
  - stream/append folder metadata when available
- Pre-resolve workspace id once per app shell and share it (cache/context) to remove repeated lookup latency in page hooks.
- Reduce duplicate auth-side transaction work by consolidating `useAuthGuard` usage in shell and sharing auth state downstream.

---

## 8) Success Criteria Check

- Full visibility into dashboard performance: **Completed**
- Clear identification of over-fetching: **Completed**
- Clear identification of blocking renders: **Completed**
- Ready for precise optimization: **Completed**

