# Minimize/Resume Bug Root Cause

## Reproduction Flow

1. **User opens session**  
   - Content mounts and calls `ECHLY_GET_GLOBAL_STATE` (`content.tsx`, mount `useEffect`).  
   - Background handler runs `rehydrateSession(sessionId)` when `isStateEmptyForSession()` or `shouldForceRehydrate()` (`background.ts` ~1117–1125).  
   - `rehydrateSession` sets `globalUIState.lastSyncedAt = Date.now()` on success (~319). First page: `GET /api/feedback?...&limit=20`.

2. **Feedback list loads; user scrolls**  
   - `CaptureWidget` near-bottom scroll sends `ECHLY_LOAD_MORE` (`lib/capture-engine/core/CaptureWidget.tsx` ~228–239).  
   - Background `loadMore()` appends pointers and updates `nextCursor` / `hasMore` (~407–451).  
   - **`lastSyncedAt` is never updated in `loadMore`** (grep: only `rehydrateSession` assigns it at ~319).

3. **User idles / minimizes (service worker may suspend)**  
   - **If MV3 service worker terminates**: all in-memory `globalUIState` is lost. On next wake, startup `initializeSessionState()` reads `activeSessionId` from `chrome.storage.local` and, when `activeSessionId != null && lastSyncedAt == null`, calls `rehydrateSession` (~601–606) — again **first page only** (`limit=20`).  
   - **If worker stays alive but user idles > 60s** (see below): `lastSyncedAt` still reflects the **last rehydrate**, not the last `loadMore`.

4. **User reopens extension / refocuses tab**  
   - **Tab switch / focus**: `chrome.tabs.onActivated` (~902–924) runs `rehydrateSession` when `shouldForceRehydrate()` is true (~907–908).  
   - **Tab visibility**: `content.tsx` fires `ECHLY_GET_GLOBAL_STATE` on `visibilitychange` when `!document.hidden` (~373–397) and again via `ensureVisibilityStateRefresh()` (~1324–1341). Background same handler (~1117–1125).  
   - **Icon reopen (same tab, no visibility change)**: `openWidgetInActiveTab()` (~847–879) calls `broadcastUIState()` but **does not** call `rehydrateSession` or `ECHLY_GET_GLOBAL_STATE` — React state updates only from that broadcast (`ECHLY_GLOBAL_STATE` messages). No time-based refresh on that path.

## What SHOULD happen

- After idle or worker restart, the tray should either **keep** the same loaded pages (persisted client state) or **reconcile** without surprising truncation.  
- “Stale” rehydration should track **last successful sync of list data**, including **pagination fetches**, not only full `rehydrateSession` runs.

## What ACTUALLY happens

1. **`lastSyncedAt` only moves on `rehydrateSession`**  
   - `loadMore()` never updates `lastSyncedAt` (`background.ts`: assignments only at ~319 and clears on failure / session end).  
   - So `shouldForceRehydrate()` (~267–271) becomes true **60 seconds after the last rehydrate**, even if the user loaded many extra pages seconds ago via `loadMore`.

2. **Forced rehydrate wipes paginated memory**  
   - When `ECHLY_GET_GLOBAL_STATE` or `tabs.onActivated` runs with `shouldForceRehydrate() === true`, `rehydrateSession` runs.  
   - It always calls `setRehydratingLoadingState(sessionId)` first (~298), which **clears** `globalUIState.pointers` and resets `nextCursor` / `hasMore` (~273–287), then fetches **only** the first page (`limit=20`, ~303–304).  
   - **Result**: Any items that were only present in memory from previous `loadMore` pages are **gone** — the list looks **incomplete** vs before minimize/resume.

3. **Service worker suspend**  
   - In-memory list is not persisted. Cold-start `rehydrateSession` repopulates **first page only** — same truncation symptom.

4. **Pagination “stops” (observed behavior)**  
   - During `setRehydratingLoadingState` + fetch, `isFetching` is true and `nextCursor`/`hasMore` are cleared until the first page returns — `loadMore()` early-returns on `globalUIState.isFetching || !hasMore || !nextCursor` (~420).  
   - After rehydrate completes, `nextCursor`/`hasMore` reflect **page 1**; user must scroll again. If they expected the prior cursor position or a continuous list, this presents as **pagination not continuing** from where they left off.  
   - `CaptureWidget` clears `isFetchingRef` when `sendMessage` **acknowledges** (~237–239), not when `loadMore()` finishes — UI “ready to scroll” can desync from background `isFetching`, but the **hard block** is the background guard + reset state above.

5. **Content sync**  
   - State is pushed via `ECHLY_GLOBAL_STATE` / `ECHLY_GET_GLOBAL_STATE` response; `normalizeGlobalState` requires `hasMore === true` strictly (`content.tsx` ~1286). That is consistent with the server payload when whole objects are sent; the dominant failure is **background resetting items**, not a missed event, when the above rehydrate runs.

## Root Cause (STRICT)

| Item | Detail |
|------|--------|
| **Exact file** | `echly-extension/src/background.ts` |
| **Exact functions** | `shouldForceRehydrate()` (~267–271), `rehydrateSession()` (~290–337), `setRehydratingLoadingState()` (~273–287), `loadMore()` (~407–477) |
| **Exact condition failing** | `shouldForceRehydrate()` uses `globalUIState.lastSyncedAt`, which is **only** updated inside `rehydrateSession` (~319), **not** after successful `loadMore`. Therefore the “staleness” clock ignores pagination activity. When `Date.now() - lastSyncedAt > REHYDRATION_STALE_MS` (60s), the next `ECHLY_GET_GLOBAL_STATE` or `chrome.tabs.onActivated` path calls `rehydrateSession`, which **clears pointers** in `setRehydratingLoadingState` and reloads **first page only** — **overwriting** the accumulated list. |
| **Secondary (worker lifecycle)** | Same file, `initializeSessionState()` (~587–621) + SW restart: in-memory pagination cannot survive; only `rehydrateSession` first page is restored. |

**Failure-path label**: **E** (async/lifecycle logic: rehydrate overwrites newer accumulated in-memory state) with **B** (after overwrite, canonical state is “correct” first page but wrong vs user’s prior scroll depth). **C** applies transiently while `isFetching` / empty cursor during rehydrate.

## Why previous phases did not fix it

- Hardening **pagination guards** or **loadMore** retries does not change the fact that **`rehydrateSession` is triggered on a stale timestamp that does not reflect `loadMore` activity**, so the list is still reset to page 1.  
- UI-only fixes (scroll listeners, `normalizeGlobalState`) do not stop **`setRehydratingLoadingState` from clearing `pointers`** when forced rehydrate runs.

## Confidence Level

**HIGH** — Behavior follows directly from static analysis: `lastSyncedAt` updates are confined to `rehydrateSession`; `loadMore` has no `lastSyncedAt` update; `shouldForceRehydrate` + `setRehydratingLoadingState` explain both **truncation** and **pagination guard** symptoms after resume.
