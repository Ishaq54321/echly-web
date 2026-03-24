# Fresh System Reanalysis (From Zero)

Date: 2026-03-24  
Scope: Full repository read-only architecture reanalysis from scratch

## 1) Full Codebase Scan

## Repository structure (functional map)

- `app/`: Next.js App Router UI and server API routes (`app/api/**/route.ts`)
- `components/`: shared React components (dashboard, session views, capture-related UI)
- `lib/`: core client/server logic (hooks, repos, capture engine, auth/fetch wrappers, state stores, cache)
- `echly-extension/`: Chrome extension sources + built bundles + manifest
- `scripts/`: operational and maintenance scripts
- `utils/`: shared helpers

## Extension runtime ownership

### Background script

- `echly-extension/src/background.ts`
  - MV3 service worker, central runtime authority.
  - Owns global extension UI/session state, auth token state, pagination state, and message routing.
  - Hydrates/persists selected lifecycle flags with Chrome storage.

### Content script

- `echly-extension/src/content.tsx`
  - Injects shadow DOM host and mounts React UI.
  - Receives runtime messages, mirrors background state, dispatches local UI events.
  - Initiates create-feedback and pagination requests via background message channel.

### Page-to-extension relay

- `echly-extension/src/sessionRelay.ts`
  - Bridges `window.postMessage` (`ECHLY_OPEN_RECORDER`) to extension runtime message (`OPEN_RECORDER`).

### Manifest wiring

- `echly-extension/manifest.json`
  - `background.service_worker = background.js`
  - `content_scripts` inject `content.js` at `document_start` on `<all_urls>`
  - Permissions include `storage`, `scripting`, `activeTab`

### Build wiring for extension

- `esbuild-extension.mjs`
  - Bundles `src/background.ts` -> `background.js`
  - Bundles `src/content.tsx` -> `content.js`

## UI components and hooks (core)

### Capture UI / extension-facing UI

- `lib/capture-engine/core/CaptureWidget.tsx`: widget list, scroll-triggered pagination, session controls.
- `lib/capture-engine/core/hooks/useCaptureWidget.ts`: start/pause/resume/end session control flow.

### Dashboard/session UI and hooks

- `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`: dashboard pagination + realtime merge.
- `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts`: selected feedback/detail behavior.
- `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`: workspace/session summary state and cache hydration.

## API layer

### Extension clients

- `echly-extension/src/api.ts`: content-to-background fetch proxy (`echly-api` path).
- `echly-extension/src/contentAuthFetch.ts`: content-side auth fetch helper.
- `echly-extension/utils/apiFetch.ts`: background-side authenticated fetch wrapper.

### Web app client

- `lib/authFetch.ts`: authenticated fetch with token cache and timeout/error handling.

### Server route surface (selected flow-critical)

- `app/api/extension/session/route.ts`: extension token/session broker.
- `app/api/sessions/route.ts`: session creation/listing.
- `app/api/feedback/route.ts`: paginated feedback list endpoint.
- `app/api/feedback/post.ts`: feedback create endpoint.
- `app/api/feedback/counts/route.ts`: counts endpoint.
- `app/api/upload-screenshot/route.ts`: screenshot upload.

## Storage usage (high-level inventory)

- Extension persisted storage: `chrome.storage.local`, `chrome.storage.session`
- Browser persisted storage: `localStorage`, `sessionStorage`
- App/extension in-memory stores: module singletons, React state, in-flight dedupe maps
- Server in-memory caches: workspace cache, first-page feedback cache, counts cache
- Durable backend source: Firestore docs + repository transactions

---

## 2) Runtime Architecture (from startup to active operation)

## How extension starts

1. Browser loads extension manifest runtime.
2. Service worker (`background.ts`) starts, restores persisted flags (`echlyActive`, session flags), initializes session state, and broadcasts baseline UI state.
3. Content script (`content.tsx`) auto-injects in pages, creates hidden shadow host, mounts React app, installs message listener.
4. Optional relay (`sessionRelay.ts`) listens for page-level recorder requests and forwards to background.

## How UI is injected

1. User action (toolbar click or page relay) reaches background.
2. Background ensures content script exists in target tab (inject if needed).
3. Background sends open-widget message (`ECHLY_OPEN_WIDGET`).
4. Content script reveals host, dispatches internal open event, and requests/receives authoritative global state sync from background.

## How state flows at runtime

- Background is the authoritative state owner for extension runtime UI/session state.
- Content script mirrors/derives visible UI state from background broadcasts (`ECHLY_GLOBAL_STATE`).
- Dashboard app maintains independent page-local and shared module-level state stores, synchronized through API + Firestore realtime.
- Both dashboard and extension consume the same feedback API cursor contract for pagination.

---

## 3) State Model (all discovered state domains)

## A) Extension-authoritative state

Owner: `echly-extension/src/background.ts`

- `globalUIState` (tray open, expanded/collapsed, active session, feedback pointers, counts, pagination cursor/flags, fetching flags)
- in-memory auth/token fields (`extensionToken`, expiry, cached user)
- in-memory dedupe/ownership sets for feedback creation jobs
- auxiliary caches (session counts cache with TTL)

Mutation sources:
- Runtime message handlers (`ECHLY_SET_ACTIVE_SESSION`, `ECHLY_LOAD_MORE`, `ECHLY_FEEDBACK_CREATED`, `ECHLY_SESSION_MODE_*`, etc.)
- Auth flows (`ECHLY_GET_EXTENSION_TOKEN`, login trigger paths)

Persistence:
- Partial lifecycle fields persisted to `chrome.storage.local` (`echlyActive`, `activeSessionId`, `sessionModeActive`, `sessionPaused`)
- Feedback completion dedupe flags in `chrome.storage.session`
- Remaining transient fields are in-memory only and reset on service worker restart.

## B) Extension content UI state

Owner: `echly-extension/src/content.tsx` + React tree

- local mirrored global state snapshot for rendering
- transient UI interaction flags
- theme preference in `localStorage` (`widget-theme`)

Mutation:
- Runtime message receipts
- Local UI actions
- Hard resync requests to background

Persistence:
- Theme persists; most content-state does not.

## C) Dashboard/app in-memory stores

Representative stores:

- `lib/state/sessionCountsStore.ts`: per-session counts map + listeners
- `lib/realtime/feedbackStore.ts`: realtime feedback snapshot
- `lib/realtime/sessionsStore.ts`: realtime session list snapshot
- `lib/realtime/workspaceStore.ts`: realtime workspace snapshot
- `lib/store/billingStore.ts`: billing snapshot store
- request dedupe maps (`countsRequestStore`, `fetchCountsDedup`, request cache in `lib/client/requestCache.ts`)

Mutation:
- Hook effects and API responses
- Firestore snapshot callbacks
- optimistic mutation paths (create/update/delete impacts)

Persistence:
- None (memory only)

## D) Browser persisted app state

- `sessionStorage`: session/folder list cache, execution scroll memory
- `localStorage`: pinned session IDs, session/folder count caches, viewer ID

Mutation:
- Hook mount/read-before-fetch, post-fetch writes, UI pin/scroll actions

Persistence:
- Survives reload according to storage type.

## E) Server in-memory cache state

- `lib/server/cache/workspaceCache.ts` (workspace TTL cache)
- `lib/server/cache/feedbackCache.ts` (first-page feedback cache)
- `lib/server/cache/feedbackCountsCache.ts` (counts cache)
- route-local `workspaceByIdCache` in `app/api/feedback/post.ts`

Mutation:
- Route reads populate caches; mutation routes invalidate selectively.

Persistence:
- Process-local only (lost on restart, not shared across instances).

## F) Durable system-of-record state

- Firestore documents for sessions, feedback, workspace
- Repository transaction functions maintain denormalized counters

Mutation:
- API route handlers + repository functions

Persistence:
- Durable backend.

---

## 4) Data Flow Trace (session start -> fetch -> pagination -> end)

## Session start

1. Capture UI requests auth state from background.
2. On authenticated path, session creation request sent to `/api/sessions`.
3. On success, UI sends `ECHLY_SET_ACTIVE_SESSION`.
4. Background sets active session + mode flags, clears stale pointer/pagination state, fetches initial feedback + counts (+ session title metadata), then broadcasts global state.
5. UI sends/receives mode-start synchronization (`ECHLY_SESSION_MODE_START`) and begins active capture lifecycle.

## Feedback fetch

- Initial fetch: background (extension path) requests `/api/feedback?sessionId=...&limit=20`.
- Counts fetch: `/api/feedback/counts?sessionId=...`.
- Create-feedback path:
  1. Upload screenshot (`/api/upload-screenshot`) if needed.
  2. Submit feedback (`/api/feedback` post handler).
  3. On success, background updates pointer list/counts and rebroadcasts.

## Pagination

- Triggered by near-bottom scroll:
  - Extension: `CaptureWidget` -> `ECHLY_LOAD_MORE` -> background `loadMore()`
  - Dashboard: hook sentinel/scroll trigger -> direct `/api/feedback` call
- Request includes `cursor` and `limit`.
- Response returns `feedback[]`, `nextCursor`, `hasMore`.
- Client merges deduped items into canonical list, updates cursor/flags.

## Session end

1. UI sends `ECHLY_SESSION_MODE_END` (or idle timeout ends session).
2. Background clears timers/session identifiers/pointers/pagination and count state.
3. Background persists null lifecycle state to Chrome storage and broadcasts reset/global updates to tabs.

---

## 5) Pagination System (from scratch)

## Cursor mechanics

- Cursor is an opaque feedback document id at API boundary.
- Repository resolves cursor id to snapshot and performs query with `startAfter`.
- API response returns next cursor id and has-more boolean.

## Next-page loading behavior

### Extension path

- Requires all gates true: `!isFetching && hasMore && nextCursor`.
- `loadMore()` fetches next page, maps to pointer model, dedupes by id, appends, updates cursor and flags, rebroadcasts state.

### Dashboard path

- Triggered by scroll-threshold + IntersectionObserver sentinel (after user scrolls).
- Hook fetches next page, appends unseen IDs, keeps canonical sort order, updates cursor/flags.
- Client-side cap (`FEEDBACK_LOAD_CAP`) can stop further loading.

## Where it can fail

- Invalid/missing cursor can reset effective paging position.
- Missing Firestore index can fail query.
- Auth/workspace checks can block paging (401/403/500).
- Empty error handling in extension `loadMore()` can suppress visible error feedback.
- Gate state drift (`nextCursor`/`hasMore`/`isFetching`) can stall pagination.
- API first-page cache can serve stale data windows.
- Dual trigger paths can race without proper lock; guards exist but still rely on consistent state.

---

## 6) Storage + Cache (what, when written/read, staleness risk)

## What is stored

- Extension lifecycle/session flags in `chrome.storage.local`
- Extension per-feedback completion flags in `chrome.storage.session`
- Widget theme, viewer id, pinned IDs, count hints in `localStorage`
- Session/folder lists and scroll positions in `sessionStorage`
- Multiple in-memory caches (client and server) for counts, requests, billing, feedback pages, workspace docs

## Write timing

- On extension lifecycle transitions (open/start/pause/resume/end)
- On feedback creation completion and count adjustments
- On hook mount/fetch completion for dashboard caches
- On UI interactions (pin toggle, scroll position updates)
- On server route reads/mutations (cache fill + selective invalidation)

## Read timing

- Extension worker startup hydration from Chrome storage
- Content mount/global-state resync
- Dashboard hook initialization (storage-first, then network/realtime)
- API routes read in-memory caches before backend calls

## Staleness/consistency risks

- Non-namespaced localStorage keys can leak stale values across workspace/user contexts.
- Process-local caches diverge across tabs/workers/instances.
- First-page feedback cache invalidation may not cover every mutation path.
- Extension service worker restart drops transient in-memory state.
- Dedupe maps and in-flight caches depend on clean promise lifecycle; hangs can block refresh.

---

## 7) Message Flow (sender -> receiver -> effect)

## UI visibility + global sync

- background -> content: `ECHLY_OPEN_WIDGET` -> reveal tray
- background -> content: `ECHLY_CLOSE_WIDGET` -> hide tray
- content -> background: `ECHLY_EXPAND_WIDGET` / `ECHLY_COLLAPSE_WIDGET` -> mutate global expansion state
- content -> background: `ECHLY_GET_GLOBAL_STATE` -> request snapshot
- background -> content: `ECHLY_GLOBAL_STATE` -> authoritative state broadcast
- background -> content: `ECHLY_SESSION_STATE_SYNC` -> force resync cycle

## Auth/session broker

- content -> background: `GET_AUTH_STATE` / `ECHLY_GET_AUTH_STATE` -> auth response
- content -> background: `ECHLY_GET_EXTENSION_TOKEN` -> token acquisition
- content -> background: `ECHLY_TRIGGER_LOGIN` -> open/focus login flow
- web page broker -> extension path: `ECHLY_EXTENSION_TOKEN` -> background stores token and continues open flow

## Session lifecycle

- content -> background: `ECHLY_SET_ACTIVE_SESSION` -> set active session + initial fetch
- content -> background: `ECHLY_SESSION_MODE_START` -> activate mode/timers
- content -> background: `ECHLY_SESSION_MODE_PAUSE` / `ECHLY_SESSION_MODE_RESUME` -> lifecycle toggle
- content -> background: `ECHLY_SESSION_ACTIVITY` -> reset idle timeout
- content -> background: `ECHLY_SESSION_MODE_END` -> teardown and reset

## Feedback pipeline

- content -> background: `ECHLY_UPLOAD_SCREENSHOT` -> upload endpoint call
- content -> background: `ECHLY_CREATE_FEEDBACK` -> create feedback endpoint call
- content -> background: `ECHLY_FEEDBACK_CREATED` -> prepend/update pointer + counts
- content -> background: `ECHLY_LOAD_MORE` -> pagination fetch
- content/dashboard -> background: `ECHLY_TICKET_UPDATED` -> pointer metadata updates

## External page trigger relay

- page JS -> content relay (`window.postMessage: ECHLY_OPEN_RECORDER`) -> background `OPEN_RECORDER` -> open widget flow

---

## 8) Failure Modes (fresh, comprehensive list)

## Startup/runtime failures

- Service worker cold-start loses transient in-memory state before full hydration.
- Content script not injected/injection denied on target tab.
- Shadow host mount failures or duplicate mount race conditions.
- Message listener not ready when first open/state messages arrive.

## Auth/session failures

- Extension token acquisition failure from broker endpoint.
- Token expiry/invalid token during API calls.
- Login trigger path opens tab but no completion callback/token propagation.
- Session create succeeds server-side but local activation message fails.

## Message-channel failures

- Runtime message delivery failure (`lastError`, tab gone, receiver absent).
- Broadcast ordering issues causing stale mirrored content state.
- Relay `postMessage` ignored due to origin/source mismatch.
- Incomplete resync after missed message windows.

## Data/pagination failures

- Invalid cursor or stale cursor leading to duplicate/skipped pages.
- Missing backend index for cursor query.
- Pagination gate flags stuck (`isFetching` true, `nextCursor` null with `hasMore` true).
- Silent pagination errors (empty catch path) hide broken load-more.
- Realtime + pagination merge drift (ordering and dedupe edge cases).
- Client load cap reached before user expectation of complete history.

## Storage/cache failures

- Stale first-page feedback cache after mutation path not invalidated.
- Counts cache divergence between optimistic UI and backend truth.
- Non-namespaced localStorage keys produce cross-workspace stale views.
- In-flight dedupe map retained after hung request blocks retries.
- Multi-instance server cache inconsistency.

## Consistency and concurrency failures

- Simultaneous tab actions mutate shared extension state unexpectedly.
- Ownership/processing dedupe maps out-of-sync after worker restart.
- Feedback create idempotency flags written/read inconsistently.
- Session end teardown races with in-flight create/load-more operations.

## API/backend failures

- 401/403/500 response handling leaves partial local state.
- Workspace suspended/access revoked mid-session.
- Firestore transient/network errors during list/create/count operations.
- Denormalized counter drift requiring recount/repair path.

## UX-observable failure symptoms

- Widget visible but disconnected from authoritative state.
- Feedback appears created locally but not reflected in canonical list/counts.
- Infinite spinner or no-load on pagination boundary.
- Session appears active after backend/session authority ended.

---

## Notes on Method

- This analysis was rebuilt from repository inspection only, without relying on prior assumptions.
- No code changes were made as part of this reanalysis.
