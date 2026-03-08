# Session Global State Refactor

## Summary

Session **pointers** (feedback/ticket list for the active session) are now owned and synchronized by the **background** script. All tabs receive the same pointers via `ECHLY_GLOBAL_STATE`, eliminating per-tab pointer state and fixing tray inconsistencies and missing cards across tabs.

## Previous Architecture (Removed)

- **Content script** stored pointers per tab in React state: `loadSessionWithPointers` (`{ sessionId, pointers }`).
- On `ECHLY_GLOBAL_STATE`, content compared `sessionId` to `previousSessionIdRef` / `loadedSessionIdRef` and, when the session changed, **fetched** `GET /api/feedback?sessionId=...&limit=200` and called `setLoadSessionWithPointers({ sessionId, pointers })`.
- On `ECHLY_FEEDBACK_CREATED`, content appended the new ticket to `loadSessionWithPointers.pointers` only if `sessionId === effectiveSessionId`.
- **Problems:** New tabs had no pointers until they ran the same fetch; pause/resume and timing could leave some tabs with stale or empty lists; tray could show different cards in different tabs.

## New Architecture

### 1. Global session state (background)

In **background.ts**, `globalUIState` includes:

- `pointers: StructuredFeedback[]` — the single source of truth for the session’s feedback list.

```ts
globalUIState = {
  visible,
  expanded,
  isRecording,
  sessionId,
  sessionModeActive,
  sessionPaused,
  pointers: [],  // added
}
```

### 2. When pointers are set

- **Feedback created:** On `ECHLY_PROCESS_FEEDBACK` success, the background appends the new ticket to `globalUIState.pointers` and calls `broadcastUIState()`. Tabs no longer append locally.
- **Session resume:** When `ECHLY_SET_ACTIVE_SESSION` runs with a `sessionId`, the background fetches `GET /api/feedback?sessionId=${sessionId}&limit=200`, assigns the result to `globalUIState.pointers`, then calls `broadcastUIState()`.
- **Session end:** In `ECHLY_SESSION_MODE_END`, the background sets `globalUIState.pointers = []` before broadcasting.

### 3. Pause / resume

- **Pause** (`ECHLY_SESSION_MODE_PAUSE`): Only sets `sessionPaused: true` and broadcasts. No feedback fetch; pointers stay in global state.
- **Resume** (`ECHLY_SESSION_MODE_RESUME`): Only sets `sessionPaused: false` and broadcasts. Pointers are already in global state.

### 4. Content script (per-tab pointer state removed)

- **Removed:** `loadSessionWithPointers`, `previousSessionIdRef`, `loadedSessionIdRef`, and all async feedback-loading logic tied to `ECHLY_GLOBAL_STATE` or `ECHLY_FEEDBACK_CREATED`.
- **Removed:** `ECHLY_FEEDBACK_CREATED` listener that appended tickets to local state.
- **Behavior:** Content receives `ECHLY_GLOBAL_STATE` and **always** overwrites its `globalState` (including `pointers`). No debounce or ignore; no per-tab fetch for pointers.
- **Widget:** Content passes `pointers={globalState.pointers ?? []}` (and `sessionId`, `globalSessionModeActive`, `globalSessionPaused`) into `CaptureWidget`. No `loadSessionWithPointers` or `onSessionLoaded` for the main flow.

### 5. Resume flow (content)

- **Before:** Content fetched `/api/feedback?sessionId=...`, called `setLoadSessionWithPointers({ sessionId, pointers })`, then sent `ECHLY_SESSION_MODE_START`.
- **After:** Content sends `ECHLY_SET_ACTIVE_SESSION` (background fetches feedback and sets `globalUIState.pointers`, then broadcasts), then `ECHLY_SESSION_MODE_START`. Optional: content still fetches session URL to open the tab.

### 6. CaptureWidget

- **New prop:** `pointers?: StructuredFeedback[]` — when provided (extension mode), the widget syncs its tray list from this prop (global state).
- **Hook:** In extension mode, an effect syncs `pointersProp` to internal `pointers` state so all tabs show the same list.
- **Session overlay:** Session mode is driven by `globalSessionModeActive` (and `sessionId`); it no longer depends on `loadSessionWithPointers`. `loadSessionWithPointers` remains supported for one-shot “Resume” flows if needed, but the primary source for the tray is `pointers` from global state.

## Verification Flows

1. **Start session** — Background sets session; pointers loaded on set/resume; all tabs get same state.
2. **Capture ticket** — Background appends to `globalUIState.pointers` and broadcasts; all tabs update.
3. **Open new tab** — Tab gets `ECHLY_GLOBAL_STATE` (on load or tab activation) with same `sessionId` and `pointers`; tray matches other tabs.
4. **Pause** — Only `sessionPaused` toggles; no fetch; pointers unchanged.
5. **Resume** — Only `sessionPaused` toggles; pointers already in global state.
6. **End** — Background clears `pointers` and session fields; all tabs clear tray.

**Expected:** All tabs show the same session bar and the same ticket tray at all times.

## Global Session Resync

Background push (`broadcastUIState` / `ECHLY_GLOBAL_STATE`) is **unreliable** in Chrome extensions (e.g. tabs that never received the message, or that were in the background when it fired). So tabs **actively resync** session state in two ways:

1. **Tab visibility** — In the content script (ContentApp), a `visibilitychange` listener runs when the tab becomes visible (`!document.hidden`). It requests `ECHLY_GET_GLOBAL_STATE` from the background and applies the response (normalized) to local state via `setHostVisibility` and `setGlobalState`. That way, if the user ended the session in another tab, this tab will see the update as soon as it is focused.
2. **Tab activation** — When the user switches to a tab, the background sends that tab `ECHLY_SESSION_STATE_SYNC`. The content message handler **always** handles it: it requests `ECHLY_GET_GLOBAL_STATE`, normalizes the state, then updates host visibility, calls `__ECHLY_APPLY_GLOBAL_STATE__` (which runs `setGlobalState`), and dispatches `ECHLY_GLOBAL_STATE`. This is never debounced or skipped.

Together, visibility + activation resync ensure that **all tabs end the session** even if they missed the original broadcast (e.g. Tab B opened after session start still sees session end when the user focuses it or when Tab A ended the session).

The widget (useCaptureWidget) also has a **defensive cleanup** effect: when `!globalSessionModeActive` or `!sessionId`, it sets session mode and paused to false, clears pending state, removes markers, and calls `removeCaptureRoot()`. So stale overlay/session UI cannot survive after the session has ended globally.

## Files Touched

| File | Changes |
|------|--------|
| **echly-extension/src/background.ts** | `globalUIState.pointers`; append on feedback create; fetch + set on `ECHLY_SET_ACTIVE_SESSION`; clear on `ECHLY_SESSION_MODE_END`. |
| **echly-extension/src/content.tsx** | `GlobalUIState.pointers`; remove `loadSessionWithPointers`, refs, and async fetch; always apply `ECHLY_GLOBAL_STATE`; pass `pointers={globalState.pointers}`; simplify `onResumeSessionSelect`. **Resync:** `visibilitychange` → `ECHLY_GET_GLOBAL_STATE` and apply state; `ECHLY_SESSION_STATE_SYNC` always fetches and applies (never debounce/skip). |
| **components/CaptureWidget/types.ts** | Add `pointers?: StructuredFeedback[]`. |
| **components/CaptureWidget/CaptureWidget.tsx** | Pass `pointers` into hook. |
| **components/CaptureWidget/hooks/useCaptureWidget.ts** | Accept `pointers`; effect to sync `pointersProp` to state; session overlay from `globalSessionModeActive` only. **Defensive cleanup:** when `!globalSessionModeActive` or `!sessionId`, clear session mode, overlay, and pending state. **Capture root singleton:** see below. |
| **components/CaptureWidget/CaptureLayer.tsx** | Extension: return `null` when `!sessionMode` or `!sessionId` so overlay never renders without a valid session. |

## Capture Root Singleton Protection

The extension must guarantee **only one** capture root (`#echly-capture-root`) per tab. Multiple roots can otherwise be created when:

- Tab activation triggers recovery
- Session resume or pause/resume runs
- Global state resync runs
- Extension visibility is toggled

**Guards added (session logic unchanged; only root lifecycle):**

1. **createCaptureRoot (useCaptureWidget.ts)**  
   - Exit if `captureRootRef.current` already exists (no second root).  
   - **Hard DOM check:** before creating, `document.getElementById("echly-capture-root")`. If an element exists (e.g. stale ref), assign it to `captureRootRef`, set state so the hook uses it, and return.  
   - Only create and append a new element when no ref and no DOM node exist.  
   - Debug log: `console.debug("ECHLY createCaptureRoot")` (and when skipping/reusing).

2. **removeCaptureRoot**  
   - If `captureRootRef.current` exists: call `.remove()` on it, then set ref to `null`.  
   - Also remove any DOM node with id `echly-capture-root` so no orphan remains.  
   - Debug log: `console.debug("ECHLY removeCaptureRoot")`.

3. **CaptureLayer.tsx**  
   - In extension mode, return `null` when `!sessionMode` or `!sessionId`, so the session overlay never renders without a valid session and the overlay is not shown on stale state.

Result: only one session recorder bar per tab, no duplicate overlays, and ending the session removes the bar everywhere. Debug logs confirm create/remove behavior.

## End Session Order Fix

The End button must **end the session globally before opening the dashboard tab**. Previously, the content script could open the dashboard first and then send `ECHLY_SESSION_MODE_END`; tab navigation then interrupted the message flow, so the session did not always end globally (recorder bar and tray could remain in other tabs).

**Correct order (content.tsx `onSessionModeEnd`):**

1. **End session first:** `await` `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" })` (wrapped in a Promise so the handler runs and the background completes the reset).
2. **Optional safety delay:** `await new Promise(r => setTimeout(r, 50))` so the background’s `broadcastUIState()` has time to reach all tabs.
3. **Then open dashboard:** `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url })` with the session’s dashboard URL.

Session termination therefore always happens before navigation. The background (already correct) performs on `ECHLY_SESSION_MODE_END`: `activeSessionId = null`, `globalUIState.sessionId = null`, `globalUIState.sessionModeActive = false`, `globalUIState.sessionPaused = false`, `globalUIState.pointers = []`, `chrome.storage.local.set(...)`, `broadcastUIState()`, and a follow-up `setTimeout(broadcastUIState, 150)`.

**Verify:** Start session → capture feedback → open second tab → click End. Dashboard tab opens, recorder bar disappears everywhere, tray clears everywhere, no session remains active.

## Session Lifecycle Enforcement

Session mode in the widget (recorder bar, overlay, tray) is controlled **exclusively** by `globalSessionModeActive`. The session must never auto-start from `sessionId`, `pointers`, `pointersProp`, or `loadSessionWithPointers`.

**Rules:**

- **Start:** Session mode can **only** start when `globalSessionModeActive === true`. Effects that show the overlay or call `createCaptureRoot()` must guard on `globalSessionModeActive === true` only.
- **Stop:** When `globalSessionModeActive === false`, the widget must always clear session state: `setSessionMode(false)`, `setSessionPaused(false)`, `removeCaptureRoot()`, and clear pending/saving state and markers.
- **Pointers** drive tray content only; they must never trigger session mode or overlay. Same for `loadSessionWithPointers` (Resume flow): it only updates the tray list and not the session lifecycle.

**Implementation (useCaptureWidget.ts):**

- One effect starts session mode only when `globalSessionModeActive === true` (no `sessionId` in the condition or deps).
- A dedicated safety effect runs when `!globalSessionModeActive`: it clears session mode, paused state, pending/saving state, markers, and removes the capture root. This ensures stale UI cannot resurrect the session after End.

**Expected behavior:** After the user clicks End Session, the recorder bar disappears and does not reappear unless the user clicks Start or Resume (which set `globalSessionModeActive` to true in the background).

## Dashboard URLs Do Not Auto-Activate Sessions

Dashboard URLs no longer auto-activate sessions. Visiting `/dashboard/{sessionId}` does **not** trigger `ECHLY_SET_ACTIVE_SESSION` or any extension session lifecycle. The dashboard page is **view-only** for session state. Sessions are only started via explicit user actions: **Start session** and **Resume session** (from the extension UI).

## Backward Compatibility

- **ECHLY_GET_GLOBAL_STATE** now returns `state.pointers`; content and `normalizeGlobalState` treat missing `pointers` as `[]`.
- **CaptureWidget** still accepts `loadSessionWithPointers` and `onSessionLoaded` for any legacy or one-shot use; the main extension path uses `pointers` from global state.
