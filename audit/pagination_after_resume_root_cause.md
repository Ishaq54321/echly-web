# Pagination After Resume Root Cause

## What works

- **Initial list load**: First time the session list mounts with tickets, `hasTickets` (and related deps) change, so the scroll `useEffect` in `CaptureWidget` runs, finds `listScrollRef.current`, and attaches the scroll listener. Near-bottom scroll sends `ECHLY_LOAD_MORE` to the background; `loadMore()` runs when `hasMore` / `nextCursor` / `!isFetching` allow it.
- **New feedback after resume**: Creation and global state updates do not depend on the list’s scroll listener; background broadcasts `ECHLY_GLOBAL_STATE` / content applies props, so new items still appear.
- **Background pagination state**: `loadMore()` in `background.ts` is logically consistent: it early-returns only when `isFetching`, `!hasMore`, or `!nextCursor` (or no `sessionId`). That is not the primary failure mode for “after minimize” in this codebase path.

## What breaks after minimize

- User **closes the tray** (Loom-style: extension icon toggles `visible` / `expanded` off) or otherwise collapses the widget so **`expanded` becomes false**.
- The **session panel and the scrollable list unmount** because they are gated by `showPanel`, and `showPanel === effectiveIsOpen && (showSidebar || showSessionSidebar)` with `effectiveIsOpen === expanded` in extension mode (`CaptureWidget.tsx`).
- On **reopen**, `expanded` is true again, a **new** `.echly-feedback-list-scroll` node is mounted and `listScrollRef` points to it.
- The scroll `useEffect` **does not run again** because its dependency array does **not** include `expanded`, `effectiveIsOpen`, or `showPanel`, and the values it *does* include (`hasTickets`, `sessionModeActive`, `sessionLoading`, etc.) are usually **unchanged** across minimize/reopen.
- Result: **no `scroll` listener on the new DOM node** → **`ECHLY_LOAD_MORE` is never sent** when the user scrolls after resume.

## Exact failure point

- **Layer**: Content / UI (React), not background guards.
- **Mechanism**: Stale `useEffect` subscription after conditional unmount/remount of the scroll container without a dependency that changes on tray open/close.
- **Symptom**: After resume, scrolling the list does not trigger the handler; background `loadMore` logging / network pagination never runs because the message is not sent.

## File + function responsible

| Area | Location |
|------|-----------|
| Scroll listener + `ECHLY_LOAD_MORE` send | `lib/capture-engine/core/CaptureWidget.tsx` — `useEffect` starting ~line 201 (dependencies ~lines 252–259) |
| List mount gate (scroll ref only exists when panel open) | Same file — `showPanel` (~152), conditional block with `ref={listScrollRef}` (~484–525) |
| Tray open/close → `expanded` | `echly-extension/src/background.ts` — `chrome.action.onClicked` when `trayOpen` (sets `visible` / `expanded` false) and `openRecorderUI` / `openWidgetInActiveTab` when opening |
| Content state sync | `echly-extension/src/content.tsx` — `ECHLY_GLOBAL_STATE` / `ECHLY_GET_GLOBAL_STATE` (these refresh props; they do not reattach the scroll listener) |

## Why previous fix didn’t solve it

- **Freshness / rehydrate fixes** address **background** list/cursor correctness and when to refetch. They do not recreate the **DOM scroll subscription** in `CaptureWidget` when the tray UI unmounts and remounts with the same React state deps.
- The failure is **orthogonal**: pagination state can be correct in the service worker and in props, while the UI never fires `ECHLY_LOAD_MORE` because the listener was removed on unmount and never reattached.

## Confidence level

**High.** The conditional render removes the scroll container when the tray closes; the effect cleanup removes the listener; reopening mounts a new element but the effect’s dependency list does not include the prop that toggles that mount (`expanded` / panel visibility), so React intentionally skips re-running the effect. That matches “works until minimize, broken after reopen” with list and new feedback still updating via other paths.

## Failure category (from requested list)

- **A) Scroll not firing** — Yes: `scroll` events are not handled on the post-resume list node.
- **B) loadMore not triggered** — Yes, as a consequence of (A); not because `IntersectionObserver` (extension path uses scroll + `sendMessage`, not the dashboard `IntersectionObserver` hook).
- **C) loadMore blocked by guard** — Not the primary issue; would require `ECHLY_LOAD_MORE` to be sent and background to reject (not observed as the first failure).
- **D) State mismatch content vs background** — Not required to explain the bug; props can still carry correct `hasMore` / `nextCursor`.
- **E) Message sync failure** — No; global state sync can work while the scroll path stays dead.

---

**Remediation direction (for implementers):** Include the factor that controls whether the scroll container exists (e.g. `expanded` / `effectiveIsOpen` / `showPanel`) in the scroll effect’s dependency array, or use a ref+callback pattern that rebinds when the list node mounts (e.g. ref callback + `useLayoutEffect` keyed on mount). Optionally align `isFetchingRef` with background `feedback.isFetching` if double-fires become an issue; that is separate from this root cause.
