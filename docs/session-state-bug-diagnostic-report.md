# Echly Extension — Session State Bug: Diagnostic Architecture Report

**Task:** READ-ONLY architecture trace. No code changes.

**Problem:** Start Session → dashboard opens in new tab; tray stays on home; captured feedback flashes then tray reverts to home. Backend stores feedback correctly; bug is UI/session state sync.

---

## 1. SESSION CREATION FLOW

### Start Session → function called → API → sessionId → where stored

| Step | Location | What happens |
|------|----------|--------------|
| 1 | User clicks "Start Session" | `WidgetFooter` → `onStartSession` (from `handlers.startSession`) |
| 2 | `useCaptureWidget.ts` ~1053 | `startSession()` runs: guards on idle, no existing session; calls `onCreateSession()` |
| 3 | `content.tsx` ~458 `createSession` | `apiFetch("/api/sessions", { method: "POST", body: "{}" })` → backend creates session |
| 4 | `content.tsx` ~462–464 | Response: `json.session.id`; then **immediately** `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url: \`${APP_ORIGIN}/dashboard/${session.id}\` })` — opens dashboard in **new tab** |
| 5 | `content.tsx` ~464 | Returns `{ id: json.session.id }` to caller (no await on open-tab) |
| 6 | `useCaptureWidget.ts` ~1059–1064 | If `session?.id`: `onActiveSessionChange(session.id)` → content sends `ECHLY_SET_ACTIVE_SESSION`; `setPointers([])`; `onSessionModeStart()`; `onSessionViewRequested()` |
| 7 | `content.tsx` ~451–453 | `onActiveSessionChange` → `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId })` |
| 8 | `content.tsx` ~853 | `onSessionModeStart` → `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" })` |
| 9 | `background.ts` ~326–369 | Handles `ECHLY_SET_ACTIVE_SESSION`: sets `activeSessionId`, `globalUIState.sessionId`, `sessionModeActive`, persists to `chrome.storage.local`, fetches feedback for tray, then `broadcastUIState()` |
| 10 | `background.ts` ~377–386 | Handles `ECHLY_SESSION_MODE_START`: sets `sessionModeActive`, `sessionId`, `expanded`, `persistSessionLifecycleState()`, `broadcastUIState()` |

**SessionId storage after creation:**

- **Background (in-memory):** `activeSessionId`, `globalUIState.sessionId`
- **Chrome storage:** `chrome.storage.local` keys: `activeSessionId`, `sessionModeActive`, `sessionPaused`
- **Content (derived):** `globalState.sessionId` from background via `ECHLY_GLOBAL_STATE` or `ECHLY_GET_GLOBAL_STATE` (no local source of truth)

**Design issue in creation flow:** `createSession` opens the dashboard tab before the widget has notified the background. The background is only updated when `startSession` later calls `onActiveSessionChange(session.id)` and `onSessionModeStart()`. So ordering is: create session → open new tab → return → then set active session in background.

---

## 2. SESSION STATE STORAGE

### Where `activeSessionId` / session UI state lives

| Store | What is stored | Used by |
|-------|----------------|---------|
| **Background in-memory** | `activeSessionId` (string \| null); `globalUIState` (sessionId, sessionModeActive, sessionPaused, pointers, visible, expanded, etc.) | Single source of truth for UI state; broadcast to tabs |
| **Chrome storage (persist)** | `chrome.storage.local`: `activeSessionId`, `sessionModeActive`, `sessionPaused` (and auth keys) | Restored only on **background script (re)start** via `initializeSessionState()` |
| **Content script (React state)** | `globalState` in `ContentApp` (including `sessionId`, `sessionModeActive`, `sessionPaused`, `pointers`) | **Derived only** — set by `ECHLY_GLOBAL_STATE` events and `ECHLY_GET_GLOBAL_STATE` response; comment in content: "No local source of truth" |
| **CaptureWidget** | `sessionId` and `globalSessionModeActive` / `globalSessionPaused` passed as props from content’s `globalState`; `showCommandScreen` is local state (true = home, false = session view) | Renders home vs session view and tray visibility |

**Conclusion:** The **authoritative** session state is background in-memory (`activeSessionId` + `globalUIState`). Content and UI only reflect what the background broadcasts or returns on request. Persistence is `chrome.storage.local`; it is **only read** in `initializeSessionState()` when the background script runs (including on wake).

---

## 3. UI RENDER LOGIC (HOME vs SESSION)

### Condition that controls Home screen vs Session screen

**Tray visibility (should the tray be shown at all):**

- **content.tsx** ~46–48 `getShouldShowTray(state)`:
  - `state.visible === true || state.sessionModeActive === true || state.sessionPaused === true`
- **CaptureWidget.tsx** ~99–102:
  - `shouldShowTray = globalSessionModeActive === true || globalSessionPaused === true`
  - `showSessionSidebar = extensionMode && shouldShowTray`

So the tray is shown when the widget is “open” and either visibility is toggled on or session mode is active/paused.

**Home vs Session *content* inside the tray:**

- **CaptureWidget.tsx** ~55: `showCommandScreen` (useState, default `true`).
  - `true` → show “Select feedback mode” (voice/text) + footer with **Start Session** / **Previous Sessions** (home).
  - `false` → show session view (ticket list, capture UI).
- **When it’s set to false (session view):**
  - ~79: `onSessionViewRequested: extensionMode ? () => setShowCommandScreen(false) : undefined` — called from `startSession` after create + set active session.
  - ~151–154: When `loadSessionWithPointers?.sessionId` is set (e.g. after “Previous Sessions”).
- **When it’s set to true (home):**
  - On “End Session” (~236–238): `handlers.endSession(() => { setShowCommandScreen(true); ... })`.
  - **Not** set to true when receiving a broadcast with `sessionModeActive: false` — so a spurious “session ended” broadcast can leave the user in session layout but with empty list and home-like buttons (see below).

**What the user sees as “home”:**

- **CaptureWidget.tsx** ~105–106: `showSessionButtons = !hasTickets && state.state === "idle"`.
- When `showSessionButtons` is true (no tickets, idle), the UI shows the mode tiles and footer with “Start Session” / “Previous Sessions”.
- So “revert to home” = either `showCommandScreen` becomes true, or the tray shows an empty session (pointers cleared) so `showSessionButtons` is true and the same buttons appear.

**Exact condition for “session view” (tray in session mode):**

- Tray shows session content when: `showCommandScreen === false` **and** `globalSessionModeActive === true` (or paused). Session *content* (ticket list) also depends on `pointers` / `sessionId` from `globalState`; if a broadcast sends `sessionModeActive: false` or empty pointers, the UI shows the home-like buttons again even if `showCommandScreen` was false.

---

## 4. MESSAGE PASSING (CONTENT ↔ BACKGROUND ↔ UI)

### Content → Background

- `ECHLY_GET_GLOBAL_STATE` — content asks for current state (mount, visibilitychange).
- `ECHLY_SET_ACTIVE_SESSION` — set active session and enter session mode (async: fetch feedback then broadcast).
- `ECHLY_SESSION_MODE_START` / `PAUSE` / `RESUME` / `END`, `ECHLY_SESSION_ACTIVITY`.
- `ECHLY_OPEN_TAB` — open dashboard (or other URL).
- `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`.
- `ECHLY_PROCESS_FEEDBACK` — fallback when structure fails; background creates ticket and broadcasts.
- `echly-api` — content API calls (e.g. structure-feedback, feedback) go through background for token; **this wakes the service worker**.

### Background → Content

- `ECHLY_GLOBAL_STATE` — `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })` (broadcast to all tabs or on tab activated/created).
- `ECHLY_SESSION_STATE_SYNC` — tells content to request `ECHLY_GET_GLOBAL_STATE` again (used on tab activation).
- `ECHLY_FEEDBACK_CREATED` — when a ticket is created (e.g. via `ECHLY_PROCESS_FEEDBACK`).
- `ECHLY_TOGGLE`, `ECHLY_RESET_WIDGET`.

### Content handler that can reset session state

**content.tsx** ~159–168:

```ts
React.useEffect(() => {
  const handler = (e: CustomEvent<{ state: GlobalUIState }>) => {
    const s = e.detail?.state;
    if (!s) return;
    echlyLog("CONTENT", "global state received", s);
    setHostVisibility(getShouldShowTray(s));
    setGlobalState(s);  // overwrites entire state, including sessionId, sessionModeActive, pointers
  };
  window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  ...
}, []);
```

So any time the content script receives `ECHLY_GLOBAL_STATE` (from `chrome.runtime.onMessage` and then a local `CustomEvent`), it **overwrites** `globalState` with the payload. If that payload has `sessionModeActive: false` or `sessionId: null`, the UI switches to “no session” / home.

**content.tsx** ~896–902: when `msg.type === "ECHLY_GLOBAL_STATE"` the listener applies state and dispatches the same to the React tree via the custom event above. So the **event that can reset the UI to home** is the delivery of `ECHLY_GLOBAL_STATE` with `sessionModeActive: false` (and/or empty pointers).

---

## 5. SESSION RESET CAUSE (ROOT CAUSE)

### What causes the UI to revert to home after feedback is captured

**Root cause: background script re-runs on wake and re-initializes session mode to false, then broadcasts that state.**

1. **Chrome MV3 service worker lifecycle**  
   When the background script is suspended and then woken (e.g. by a message from content), the script is **run from the top again**. So all top-level code runs, including the IIFE that calls `initializeSessionState()` and `broadcastUIState()`.

2. **When the background wakes**  
   Capturing feedback triggers `apiFetch(...)` in content, which sends `echly-api` messages to the background (for `/api/structure-feedback`, `/api/feedback`, etc.). That **wakes the service worker**.

3. **initializeSessionState()** — **background.ts** ~104–114:

```ts
async function initializeSessionState(): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(["activeSessionId"], (result: { activeSessionId?: string }) => {
      const stored = result.activeSessionId;
      activeSessionId = typeof stored === "string" ? stored : null;
      globalUIState.sessionId = activeSessionId;
      globalUIState.sessionModeActive = false;   // ← always false
      globalUIState.sessionPaused = false;      // ← always false
      resolve();
    });
  });
}

(async () => {
  await initializeSessionState();
  broadcastUIState();   // ← sends this re-initialized state to all tabs
})();
```

- It **only** reads `activeSessionId` from storage.
- It **never** reads `sessionModeActive` or `sessionPaused` from storage, even though they are persisted in `persistSessionLifecycleState()` and in `ECHLY_SET_ACTIVE_SESSION`.
- It **always** sets `globalUIState.sessionModeActive = false` and `globalUIState.sessionPaused = false`.

4. **Result**  
   On every wake, the background broadcasts `globalUIState` with `sessionModeActive: false` (and `sessionPaused: false`). Content receives `ECHLY_GLOBAL_STATE` and overwrites local state. So:

   - Tray may stay visible if `visible` is true, but `globalSessionModeActive` becomes false.
   - Session view logic and `shouldShowTray` no longer see an active session; the list can appear empty (pointers are also re-initialized to `[]` in the initial `globalUIState` when the script re-runs).
   - The UI shows the home screen (Start Session / Previous Sessions).

5. **Why feedback “flashes” then disappears**  
   Right after capture, content may briefly show the new ticket (e.g. from local callback or a prior correct broadcast). Then the next background wake (e.g. from a later `echly-api` or tab activation) runs the top-level IIFE, re-initializes session mode to false and pointers to initial empty state, broadcasts, and content overwrites state → tray reverts to home and list empties.

**Exact lines responsible:**

- **background.ts** ~104–114: `initializeSessionState()` sets `globalUIState.sessionModeActive = false` and `sessionPaused = false` without reading them from storage.
- **background.ts** ~116–119: Top-level IIFE runs on every script start (including wake), calls `initializeSessionState()` then `broadcastUIState()`.
- **content.tsx** ~159–168: Handler applies incoming `ECHLY_GLOBAL_STATE` unconditionally, so the re-initialized (wrong) state replaces the correct in-memory session state in the UI.

---

## 6. PROPOSED FIX (MINIMAL, NO CHANGES TO CAPTURE/OCR/AI/SCREENSHOT)

**Goal:** After “Start Session” → create session, set active session, keep extension UI in session mode. No change to capture pipeline, OCR, AI, or screenshot.

**Fix: make initialization restore full session lifecycle from storage so a wake does not overwrite active session mode.**

1. **Persist and restore session lifecycle in background**
   - In `initializeSessionState()`:
     - Read from `chrome.storage.local`: `activeSessionId`, **`sessionModeActive`**, **`sessionPaused`** (same keys already written by `persistSessionLifecycleState()` and `ECHLY_SET_ACTIVE_SESSION`).
     - Set `globalUIState.sessionId` from `activeSessionId` as now.
     - Set `globalUIState.sessionModeActive` and `globalUIState.sessionPaused` from storage (default to `false` only when keys are missing).
   - Optionally: when restoring `sessionModeActive === true` and `activeSessionId` is set, load pointers from the API (same as in `ECHLY_SET_ACTIVE_SESSION`) so the tray shows the correct list after wake.

2. **No change to**
   - Content script (it should keep “single source of truth from background”).
   - Capture, OCR, AI, screenshot, or `app/api/structure-feedback/route.ts`.

3. **Optional UX improvement**
   - In `content.tsx` `createSession`, after creating the session and opening the dashboard tab, **also** call `onActiveSessionChange(session.id)` and session-mode start from content (or ensure the widget’s `startSession` runs before the new tab steals focus), so that even if the background hasn’t been woken yet, the first wake sees a consistent persisted state. This does not change the root cause but can make “Start Session” feel more robust.

**Result:** When the service worker wakes (e.g. after capture), it will restore `sessionModeActive` and `sessionPaused` from storage and broadcast the correct session state, so the tray stays in session view and does not revert to home.

---

## File reference summary

| Area | Files |
|------|--------|
| Extension entrypoints | `echly-extension/src/content.tsx`, `background.ts`, `popup.tsx` |
| Session creation (content) | `content.tsx` ~458–471 `createSession`, ~451–453 `onActiveSessionChange` |
| Session state (background) | `background.ts` ~13, ~33–51, ~94–119, ~326–369, ~377–386, ~424–434 |
| UI home vs session | `CaptureWidget/CaptureWidget.tsx` ~55, ~79, ~98–102, ~151–154, ~347; `useCaptureWidget.ts` ~1053–1071, ~1168–1213 |
| State sync / reset | `content.tsx` ~146–168, ~896–902; `background.ts` ~116–119, ~246–261, ~276–284 |
| Capture pipeline | `useCaptureWidget.ts`, `RegionCaptureOverlay.tsx` — unchanged by fix |
| API | `app/api/structure-feedback/route.ts` — unchanged by fix |
