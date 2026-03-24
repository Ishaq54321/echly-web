# Fix: stale rehydration vs pagination (freshness model)

## Problem

`lastSyncedAt` was updated only inside `rehydrateSession()`, while `loadMore()` appended pages without moving the freshness clock. The previous `shouldForceRehydrate()` logic treated the list as stale after ~60s, which could trigger `rehydrateSession()` and clear `pointers` via `setRehydratingLoadingState()`, wiping valid paginated state (e.g. after tab switches or `ECHLY_GET_GLOBAL_STATE`).

## Changes (implementation: `echly-extension/src/background.ts`)

### 1. Update freshness on pagination

After a successful `loadMore()` fetch (same `try` block as pointer/cursor updates), the background now sets:

- `globalUIState.lastSyncedAt = Date.now()`
- `globalUIState.lastPaginationAt = Date.now()`

So pagination activity is treated as a sync, not only full rehydrates.

### 2. `shouldForceRehydrate(sessionIdForRehydrate: string)`

**Removed:** wall-clock staleness as the sole reason to rehydrate (`Date.now() - lastSyncedAt > 60s`).

**Now** a forced rehydrate runs only when:

- There is **no in-memory list** for the session (`sessionId == null` or `pointers.length === 0`), **or**
- **Session mismatch**: `globalUIState.sessionId != null` and differs from `sessionIdForRehydrate`.

Tab activation and `ECHLY_GET_GLOBAL_STATE` use this predicate so a healthy paginated list is not torn down just because time passed.

### 3. `isStateEmptyForSession()`

**Removed** `lastSyncedAt == null` from the empty predicate. “Empty” is defined only by missing session id or zero pointers, so a list that exists only from pagination (with both timestamps maintained) is not misclassified as empty.

### 4. Safe rehydration mode (`RehydrateMode`)

`setRehydratingLoadingState(sessionId, mode)` supports:

| Mode              | Clears `pointers` / counts / cursors |
|-------------------|--------------------------------------|
| `cold` (default)  | Yes                                  |
| `forced_recovery` | Yes (loadMore recovery path)         |
| `stale_soft`      | No — keeps list, sets loading flags  |

`rehydrateSession(sessionId, mode)`:

- Uses `cold` for normal entry points (unchanged default).
- Uses `forced_recovery` from `retryRehydrateWithBackoff()` after `loadMore` failures.
- On **failure**, `stale_soft` does **not** clear pointers or timestamps; other modes keep the previous “clear on error” behavior.

No caller passes `stale_soft` yet; the mode exists so time-based or future soft refresh can refresh without flashing an empty list.

### 5. Stronger model: `lastPaginationAt` + `lastActivityAt`

- **`lastPaginationAt`**: set on each successful `loadMore()`; cleared when a full `rehydrateSession` succeeds (fresh first page) or when session/global state is reset.
- **`effectiveFreshnessAt()`**: `Math.max(lastSyncedAt ?? 0, lastPaginationAt ?? 0)` for internal use.
- **`lastActivityAt`** (in `getCanonicalGlobalState()`): same max, exposed as `null` when both are unset.

## Success criteria (checklist)

- Paginated lists are not cleared solely because `lastSyncedAt` aged while pages were loaded via `loadMore()`.
- Rehydrate does not destroy valid data when the session id matches and `pointers.length > 0`.
- Minimizing/reopening the tray or syncing global state no longer forces a destructive refresh for a warm, non-empty list.
- False “stale” detection from time alone is removed from `shouldForceRehydrate()`.

## Follow-up (optional)

- Wire a **soft refresh** path (e.g. background timer or user action) that calls `rehydrateSession(id, "stale_soft")` if product requirements need eventual consistency without wiping the UI.
