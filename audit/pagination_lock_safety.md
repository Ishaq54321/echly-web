# Pagination Lock Safety Audit

## Failure Behavior
- In `loadMore()`, any exception in the fetch path enters the `catch` block and sets:
  - `globalUIState.nextCursor = null`
  - `globalUIState.hasMore = false`
- `isFetching` is then reset to `false` in `finally`.
- After that failure, `loadMore()` is hard-gated by:
  - `if (globalUIState.isFetching || !globalUIState.hasMore || !globalUIState.nextCursor) return;`
- Result: all later `ECHLY_LOAD_MORE` calls are no-ops until some other code path restores both `hasMore === true` and `nextCursor` to a non-empty string.

## Recovery Paths
- `rehydrateSession(sessionId)` is the only runtime path that can repopulate pagination from backend response:
  - sets `nextCursor` from `feedbackJson.nextCursor` (or `null`)
  - sets `hasMore` from `feedbackJson.hasMore === true`
- Triggers that can call `rehydrateSession()`:
  - `ECHLY_GET_GLOBAL_STATE` handler, but only when:
    - `isStateEmptyForSession()` is true, OR
    - `shouldForceRehydrate()` is true (`lastSyncedAt` older than 60s)
  - `chrome.tabs.onActivated` listener, only when `shouldForceRehydrate()` is true (>60s stale)
  - token/auth update messages:
    - `ECHLY_EXTENSION_TOKEN`
    - `ECHLY_SET_EXTENSION_TOKEN`
  - session lifecycle actions:
    - `ECHLY_SET_ACTIVE_SESSION` (start/resume/select session)
  - service worker cold start init:
    - `initializeSessionState()` calls `rehydrateSession()` when persisted `activeSessionId` exists and in-memory state is cold.

## Deadlock Scenario
- Can system get stuck? **YES**
- Worst case:
  1. User scrolls and triggers `ECHLY_LOAD_MORE`
  2. `loadMore()` fails once -> `nextCursor = null`, `hasMore = false`
  3. User scrolls again -> background receives `ECHLY_LOAD_MORE`, but `loadMore()` immediately returns due to guard (`!hasMore || !nextCursor`)
- Why this is a lock risk:
  - There is no retry or self-recovery in `loadMore()`.
  - Recovery depends on separate events invoking `rehydrateSession()`.
  - Rehydrate is not continuously scheduled; it is event-driven.
  - If those events do not occur (or rehydrate attempts fail), pagination remains disabled indefinitely for that running state.

## Final Verdict

❌ **UNSAFE (can permanently lock pagination)**

Reason (strict): a single `loadMore()` failure deterministically disables pagination, and re-enablement is contingent on external trigger paths that are not guaranteed to run. Therefore, code does **not** guarantee automatic recovery, and stuck pagination is possible.
