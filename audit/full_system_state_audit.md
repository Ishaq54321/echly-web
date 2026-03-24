# 🔍 Full System State Audit

## 1. System Overview

- Extension data path is: `echly-extension/src/content.tsx` UI -> Chrome message bus -> `echly-extension/src/background.ts` `globalUIState` -> `/api/feedback` and `/api/feedback/counts` -> Firestore repositories in `lib/repositories/feedbackRepository.ts`.
- Dashboard data path is: `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` -> `useSessionFeedbackPaginated` -> `/api/feedback` + `/api/feedback/counts` -> same repositories.
- Both surfaces use mixed realtime + paginated API strategy:
  - Dashboard: realtime from `lib/realtime/feedbackStore.ts` (top 30 only) + API pagination.
  - Extension: background `globalUIState.pointers` + API pagination (`ECHLY_LOAD_MORE`) + local UI pointer state in `useCaptureWidget`.
- Session lifecycle in extension is managed in background memory + storage (`activeSessionId`, `sessionModeActive`, `sessionPaused`), while UI layers also keep local session state.
- Pagination cursor is string-based doc ID passed through API and persisted in extension background (`globalUIState.nextCursor`) or hook state (`cursor` in `useSessionFeedbackPaginated`).

## 2. Source of Truth Analysis

### What SHOULD be source of truth

- Session truth: backend session lifecycle and one runtime state owner.
- Feedback list truth: backend query result stream for a session.
- Cursor truth: server-issued cursor from latest successful page fetch for the same session/query.

### What ACTUALLY is

#### Session

- **Extension has at least 3 active truths**:
  - `globalUIState.sessionModeActive/sessionPaused/sessionId` in `echly-extension/src/background.ts`.
  - Persisted `chrome.storage.local` lifecycle keys (`activeSessionId`, `sessionModeActive`, `sessionPaused`).
  - Local React state in `useCaptureWidget` (`sessionMode`, `sessionPaused`, `sessionStatus`).
- These states are synchronized by events/messages, not by a single deterministic reducer.

#### Feedback list

- **Dashboard has multi-source canonical merge**:
  - Realtime top 30 from `lib/realtime/feedbackStore.ts`.
  - Paginated API pages in `useSessionFeedbackPaginated`.
  - Local optimistic mutations from `SessionPageClient.tsx` (`setFeedback` direct writes).
- **Extension has multi-source list**:
  - `globalUIState.pointers` in background.
  - `useCaptureWidget` local `pointers`.
  - `mergeWithPointerProtection` in `content.tsx` intentionally blocks empty updates for same session.

#### Pagination cursor

- Extension cursor: `globalUIState.nextCursor` in background.
- Dashboard cursor: `cursor` state in `useSessionFeedbackPaginated`.
- API trusts provided cursor ID existence (fetches doc by ID); it does not strongly validate cursor ownership context before use in query shaping.

## 3. Lifecycle Breakdown

### Initial load (works)

- Extension:
  - `ECHLY_SET_ACTIVE_SESSION` resets pagination/count state, fetches first page + counts + sessions title, sets cursor/hasMore.
  - UI receives `ECHLY_GLOBAL_STATE` and renders pointers/counts.
- Dashboard:
  - `useSessionFeedbackPaginated` subscribes realtime (`subscribeFeedbackSession`), sets initial list from realtime snapshot, seeds pagination via first page API call.

### After minimize (extension hidden)

- Minimize only flips visibility (`globalUIState.visible=false`, `expanded=false`); session remains active.
- Pointer list and cursor remain in background memory.
- On re-open, content often reuses existing state snapshot without forced first-page reload unless explicit session reset path runs.
- `mergeWithPointerProtection` can keep stale non-empty pointers when incoming state is empty for same session (prevents overwrite), which masks true state transitions.

### After idle

- Background idle timer (`SESSION_IDLE_TIMEOUT`) can force `endSessionFromIdle()` and clear state.
- Token validity path degrades over time:
  - `getValidToken()` only accepts in-memory non-expired token + dashboard session check.
  - If token expired, it throws `NOT_AUTHENTICATED`; it does **not** refresh token itself.
  - Multiple flows catch-and-suppress failures, leaving state unchanged and stale.
- Result: operations requiring API calls degrade silently while UI still displays prior local state.

### After resume

- Content attempts visibility resync (`visibilitychange` -> `ECHLY_GET_GLOBAL_STATE`), but state merge logic may preserve stale pointers.
- Pagination resume uses existing cursor state; no hard revalidation cycle is forced on resume/minimize return.
- Scroll-triggered loading in extension uses local `isFetchingRef`; callback-based unlock can stall if messaging flow misses callback timing in edge states.

## 4. Critical Failures Identified

### CF-1: No durable single source of truth for extension session/list state

- **Location**: `echly-extension/src/background.ts`, `echly-extension/src/content.tsx`, `lib/capture-engine/core/hooks/useCaptureWidget.ts`.
- **What breaks**: UI session/list state diverges from backend and from other tabs.
- **Why**: Parallel state owners (background memory, storage, content local state) synchronized by best-effort events.
- **When**: Tab switch, background worker restart, minimize/resume, long idle.

### CF-2: Stale-state protection explicitly keeps old pointers

- **Location**: `mergeWithPointerProtection` in `echly-extension/src/content.tsx`.
- **What breaks**: Empty or reset list updates for same session are ignored.
- **Why**: If previous pointers exist and incoming pointers are empty, previous list is retained.
- **When**: Pause/minimize/resume or any transition that temporarily publishes empty pointers.

### CF-3: Token refresh gap causes silent data-flow collapse over time

- **Location**: `getValidToken` + call sites in `echly-extension/src/background.ts`.
- **What breaks**: Pagination fetches, session hydration reloads, feedback actions requiring API become unreliable after token age.
- **Why**: `getValidToken()` does not refresh; it only validates in-memory token. Expiry leads to thrown errors that many paths swallow.
- **When**: After ~14 minutes token TTL window or service-worker lifecycle resets.

### CF-4: Pagination cursor lifecycle is weakly guarded against stale reuse

- **Location**: `loadMore()` in `echly-extension/src/background.ts`, `useSessionFeedbackPaginated` in dashboard hook, cursor decode in `lib/repositories/feedbackRepository.ts`.
- **What breaks**: Incomplete lists and blocked progress.
- **Why**:
  - Cursor is reused across lifecycle transitions without mandatory revalidation/fresh first-page checkpoint.
  - Extension loadMore hard-gates on `hasMore && nextCursor`; if these become inconsistent, fetching stops.
  - Dedupe can append zero items while cursor advances/flags fluctuate, yielding apparent dead-end.
- **When**: Resume after idle/minimize, or after out-of-band list mutations.

### CF-5: Dashboard hook combines realtime + pagination + optimistic mutations

- **Location**: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`, `SessionPageClient.tsx`.
- **What breaks**: Canonical order/coverage can desync from true server window.
- **Why**:
  - Realtime source capped at 30 (`REALTIME_LIMIT`), pagination source uncapped to 200 client cap, plus optimistic local insert/update.
  - `refetchFirstPage` appends into canonical list instead of hard replacing first-page slice.
- **When**: Long-running sessions, repeated edits/deletes, resumed views.

### CF-6: Multi-layer cache stack can override fresh server truth temporarily

- **Location**: `lib/client/requestCache.ts`, `lib/server/cache/feedbackCache.ts`, `sessionCountsStore`, extension counts cache.
- **What breaks**: User sees stale counts/list slices, then inconsistent UI behavior.
- **Why**: Caches at client (10s), server feedback first-page (30s), counts stores (5s/5min in different contexts) with independent invalidation semantics.
- **When**: Rapid session transitions, resume flows, write-after-read windows.

### CF-7: Extension "End Session" reliability depends on volatile synchronization

- **Location**: `endSession` in `useCaptureWidget.ts` + `ECHLY_SESSION_MODE_END` handling in `background.ts`.
- **What breaks**: User reports button appears nonfunctional in degraded states.
- **Why**:
  - End action is gated by local and global flags (`sessionModeRef`, `globalSessionModeActive`, `endPending`).
  - If local/global drift occurs, handler can short-circuit without visible failure.
  - Message send failures are generally swallowed.
- **When**: After idle/resume with stale mode flags or worker instability.

## 5. Pagination Integrity Audit

- `nextCursor` storage:
  - Extension: `globalUIState.nextCursor` (`background.ts`).
  - Dashboard: `cursor` state in `useSessionFeedbackPaginated`.
- Cursor staleness risk: **High**.
  - Cursor is carried over in long-lived UI/background state and not force-reset on every resume path.
  - Extension loadMore refuses to run when `nextCursor` null or `hasMore` false, even if list is incomplete.
- Cursor validation before reuse:
  - Repo loads cursor doc by ID (`getDoc(doc(db, "feedback", cursorId))`), then uses it for `startAfter`.
  - Validation is existence-based; ownership/query-shape consistency enforcement is weak.
- Old cursor blocking fetch:
  - Yes. If state says `hasMore=false` or cursor is null while list is partial, pagination halts.
  - Dedup + stale hasMore/cursor combinations can produce "cannot scroll to full dataset".

## 6. Session Integrity Audit

- Session ID staleness risk exists in extension due to:
  - `activeSessionId` memory + storage + content local session fields.
  - Multiple message-driven transitions (`SET_ACTIVE_SESSION`, `SESSION_MODE_*`, idle end).
- End session using old reference:
  - Possible in practice because content end action captures current state while background may already have transitioned.
- Silent failure vectors:
  - Many `sendMessage(...).catch(() => {})` calls suppress operational errors.
  - API/auth failures in background commonly fallback to no-op + old UI state persistence.

## 7. State Synchronization Issues

- Duplicated state:
  - Session mode flags duplicated across background, storage, content hook, and component local state.
  - Feedback lists duplicated across background pointers, content pointers, dashboard canonical list, realtime snapshot store.
  - Counts duplicated across backend session doc, `/api/feedback/counts`, dashboard `sessionCountsStore`, extension `countsBySessionId`, sessions cache counts.
- Desync points:
  - Event-driven sync on `visibilitychange` and runtime messages (non-transactional).
  - Pointer protection logic retaining stale lists.
  - Cache TTL mismatches between list and counts.
  - Optimistic writes not always reconciled by hard refetch.

## 8. Architectural Violations

- No single source of truth for session/list/pagination across runtime boundaries.
- State is intentionally "healed" by ad-hoc merges rather than deterministic reconciliation.
- Cache layering is excessive and non-unified (client + server + extension + local stores) with heterogeneous TTL/invalidation.
- Lifecycle management assumes message delivery and worker continuity that are not guaranteed in extension service worker model.
- Auth/session validity path is brittle for long-lived extension usage (in-memory token dependency).
- Realtime + pagination + optimistic writes without strict ownership contract leads to eventual inconsistency under idle/resume conditions.

## 9. Root Cause Hypothesis (Ranked)

1. **State ownership fragmentation in extension runtime (most likely)**  
   Background `globalUIState`, storage lifecycle, and content/local hook state drift over time; merge logic then preserves stale list data and stale mode flags.

2. **Token lifecycle degradation causes silent fetch failures after idle window**  
   `getValidToken()` does not refresh token; expiry/worker lifecycle leads to failed reload/pagination paths that quietly preserve stale UI.

3. **Cursor/hasMore state becomes stale and blocks further pagination**  
   Pagination gate conditions rely on persisted cursor flags without strict revalidation after minimize/idle/resume; incomplete datasets become terminal.

## 10. Confidence Level

- Root Cause 1 (state ownership fragmentation): **High**
- Root Cause 2 (token lifecycle degradation): **High**
- Root Cause 3 (stale cursor/hasMore gate): **Medium-High**

