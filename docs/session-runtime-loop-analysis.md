# Session Runtime Loop Analysis — Root Cause Report

**Date:** 2025-03-09  
**Scope:** Echly browser extension session lifecycle (read-only audit)  
**Bug:** END SESSION works (`sessionModeActive` becomes `false`) but after ~1–2 seconds the session starts again automatically.

---

## Section 1 — Session Start Triggers

All code paths that can set session mode active or start the session overlay:

| # | File | Function / location | Line | Conditions |
|---|------|---------------------|------|------------|
| 1 | `echly-extension/src/background.ts` | Message handler `ECHLY_SESSION_MODE_START` | 336 | Any content script sends `{ type: "ECHLY_SESSION_MODE_START" }`. Sets `globalUIState.sessionModeActive = true`, then `broadcastUIState()`. |
| 2 | `echly-extension/src/background.ts` | Message handler `ECHLY_SET_ACTIVE_SESSION` | 289 | Any message with `sessionId` (string or null). **Always sets `globalUIState.sessionModeActive = true`** and persists; then fetches pointers and `broadcastUIState()`. |
| 3 | `echly-extension/src/background.ts` | Message handler `ECHLY_SESSION_MODE_RESUME` | 357 | Content sends resume. Sets `sessionModeActive = true`, `sessionPaused = false`, `broadcastUIState()`. |
| 4 | `echly-extension/src/background.ts` | Message handler `ECHLY_SESSION_MODE_PAUSE` | 346 | Content sends pause. Sets `sessionModeActive = true`, `sessionPaused = true`, `broadcastUIState()`. |
| 5 | `echly-extension/src/content.tsx` | `onSessionModeStart` callback (widget prop) | 1261 | Widget calls it; sends `ECHLY_SESSION_MODE_START`. |
| 6 | `echly-extension/src/content.tsx` | Inside `startSession` flow (widget) | 703 | After `onCreateSession()` and `onActiveSessionChange(session.id)`, content passes `onSessionModeStart` which sends `ECHLY_SESSION_MODE_START`. |
| 7 | `echly-extension/src/content.tsx` | `onResumeSessionSelect` | 702 | User selects session to resume: sends `ECHLY_SET_ACTIVE_SESSION`, then `ECHLY_SESSION_MODE_START`. |
| 8 | `echly-extension/src/content.tsx` | `sendActiveSessionIfDashboard` effect | 226–241 | **When the page is app origin and path is `/dashboard/{sessionId}`**, sends `ECHLY_SET_ACTIVE_SESSION` with that `sessionId`. Runs on mount and on `popstate`. No check that session was just ended. |
| 9 | `components/CaptureWidget/hooks/useCaptureWidget.ts` | `startSession` | 956 | User clicks Start; requires `onCreateSession`, `onActiveSessionChange`; calls `onActiveSessionChange(session.id)` then `onSessionModeStart?.()`. |
| 10 | `components/CaptureWidget/hooks/useCaptureWidget.ts` | `resumeSession` | 1022 | Only calls `onSessionModeResume?.()`; does **not** call `setSessionMode(true)` or `createCaptureRoot()` itself. |
| 11 | `components/CaptureWidget/hooks/useCaptureWidget.ts` | Effect `[globalSessionModeActive, createCaptureRoot]` | 1067–1072 | When `globalSessionModeActive === true`: `setSessionMode(true)` and `createCaptureRoot()`. |
| 12 | `components/CaptureWidget/hooks/useCaptureWidget.ts` | Effect `[extensionMode, globalSessionModeActive, globalSessionPaused, ...]` | 1078–1105 | When `globalSessionModeActive === true` and `!captureRootRef.current`: `createCaptureRoot()`. When `globalSessionModeActive === false`: `removeCaptureRoot()`, etc. |
| 13 | `components/CaptureWidget/hooks/useCaptureWidget.ts` | Visibility effect | 1133–1147 | When `globalSessionModeActive === true` and tab becomes visible and `!captureRootRef.current`: `setSessionMode(true)`, `createCaptureRoot()`. |
| 14 | `components/CaptureWidget/hooks/useCaptureWidget.ts` | `handleAddFeedback` | 1303 | On “Add feedback” click: `createCaptureRoot()` then `setState("focus_mode")` (extension early-return; no session start here). |

**Critical for the bug:** Trigger **#2** (ECHLY_SET_ACTIVE_SESSION) and **#8** (sendActiveSessionIfDashboard) are the only ones that can fire **without** an explicit user “Start” or “Resume” in the current tab. **#8 runs when a tab’s URL is `/dashboard/{sessionId}`** — including the tab that is opened automatically after “End session”.

---

## Section 2 — ECHLY_SESSION_MODE_END Flow

Exact execution order from END button to background and back:

1. **Button click (widget)**  
   - **File:** `components/CaptureWidget/CaptureWidget.tsx`  
   - **Line:** 183–187  
   - **Code:** `onSessionEnd={() => { handlers.endSession(() => { setShowCommandScreen(true); onSessionEndCallback?.(); }); }}`  
   - User clicks “End session” in the session bar; `handlers.endSession` is called with an `afterEnd` callback.

2. **Widget handler**  
   - **File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
   - **Function:** `endSession` (lines 1031–1065)  
   - **Logic:** If not already ending, calls `onSessionModeEnd?.()` (and optionally waits for pipeline), then `afterEnd?.()`.  
   - **Content’s `onSessionModeEnd`** is the callback passed from content (see next step).

3. **Content callback (sends END, then opens tab)**  
   - **File:** `echly-extension/src/content.tsx`  
   - **Lines:** 1264–1278  
   - **Code:**  
     - Reads `sessionId` from `globalState.sessionId`.  
     - Sends `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }, callback)`.  
     - After response, waits 50 ms, then if `sessionId` exists sends `ECHLY_OPEN_TAB` with `url = ${APP_ORIGIN}/dashboard/${sessionId}`.  
   - So: **first** END is sent, **then** (after 50 ms) the dashboard tab is opened.

4. **Background handler**  
   - **File:** `echly-extension/src/background.ts`  
   - **Lines:** 369–385  
   - **Code:**  
     - Sets `activeSessionId = null`, `globalUIState.sessionId = null`, `globalUIState.sessionModeActive = false`, `globalUIState.sessionPaused = false`, `globalUIState.pointers = []`.  
     - Persists to storage (`activeSessionId`, `sessionModeActive`, `sessionPaused`).  
     - Calls `broadcastUIState()` then `setTimeout(broadcastUIState, 150)`.

5. **Broadcast**  
   - **File:** `echly-extension/src/background.ts`  
   - **Function:** `broadcastUIState()` (197–210)  
   - Sends `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to **all** tabs via `chrome.tabs.sendMessage(tab.id, ...)`.

6. **Content reaction**  
   - **File:** `echly-extension/src/content.tsx`  
   - Message listener (1396–1401): on `ECHLY_GLOBAL_STATE`, calls `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` and `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }))`.

7. **Widget reaction**  
   - **File:** `echly-extension/src/content.tsx`  
   - React state is updated via `setGlobalState(state)` (from the apply function), so `globalSessionModeActive` becomes `false`.  
   - **File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
   - Effects that depend on `globalSessionModeActive` run (1078–1105 and 1107–1119): `setSessionMode(false)`, `removeCaptureRoot()`, clear pending state, etc.  
   - Overlay is removed and session mode is off in the tab that ended the session.

**Summary:** END flow is correct: background clears state and broadcasts; content and widget react and tear down. The **restart** does not come from this path; it comes from the **newly opened dashboard tab** (see Section 9).

---

## Section 3 — Automatic Session Restore / Indirect Activation

Places where session mode can be turned on without the user explicitly clicking “Start” or “Resume” in the current tab:

| Location | File | Mechanism |
|----------|------|-----------|
| **Dashboard URL effect** | `echly-extension/src/content.tsx` 226–241 | On any page with origin app (localhost / echly-web) and path `/dashboard/{id}`, sends `ECHLY_SET_ACTIVE_SESSION` with that id. **No check for “session just ended”**. Runs on mount and `popstate`. |
| **Tab activation sync** | `echly-extension/src/background.ts` 213–225 | On `chrome.tabs.onActivated`, background sends **current** `globalUIState` and `ECHLY_SESSION_STATE_SYNC`. It does **not** set `sessionModeActive`; it only pushes existing state. So if state is already false, this does not restart. |
| **Visibility resync** | `echly-extension/src/content.tsx` 175–193 | On `visibilitychange` (tab visible), content requests `ECHLY_GET_GLOBAL_STATE` and applies it. Again, applies whatever background has; does not set sessionModeActive. |
| **ECHLY_SET_ACTIVE_SESSION** | `echly-extension/src/background.ts` 289–325 | **Only** place that sets `globalUIState.sessionModeActive = true` in background other than SESSION_MODE_START/PAUSE/RESUME. So any caller of `ECHLY_SET_ACTIVE_SESSION` can indirectly “restart” session mode. Callers: content `onActiveSessionChange`, `onResumeSessionSelect`, and **sendActiveSessionIfDashboard**. |

**Conclusion:** The only automatic path that can re-activate session after END is **sendActiveSessionIfDashboard** when a tab with URL `/dashboard/{sessionId}` loads (the tab opened by “End session”).

---

## Section 4 — createCaptureRoot() Call Sites

| File | Function / context | Line | Conditions |
|------|---------------------|------|------------|
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | `createCaptureRoot` definition | 349 | N/A (definition). |
| `useCaptureWidget.ts` | Effect deps `[globalSessionModeActive, createCaptureRoot]` | 1071 | `globalSessionModeActive === true` → `createCaptureRoot()`. |
| `useCaptureWidget.ts` | Effect deps `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot, removeCaptureRoot]` | 1086–1089 | `globalSessionModeActive === true` and `!captureRootRef.current` → `createCaptureRoot()`. |
| `useCaptureWidget.ts` | Effect deps `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot]` (visibility) | 1145 | Tab becomes visible, `globalSessionModeActive === true`, `!captureRootRef.current` → `createCaptureRoot()`. |
| `useCaptureWidget.ts` | `handleAddFeedback` | 1303 | User clicks “Add feedback”; always calls `createCaptureRoot()` then sets state to focus_mode. |

So the overlay is mounted again when **globalSessionModeActive** becomes true (from any source). After END, that happens when the background sets `sessionModeActive = true` again — which is done only by **ECHLY_SET_ACTIVE_SESSION** (or SESSION_MODE_START/RESUME/PAUSE). The culprit is the dashboard-tab sending **ECHLY_SET_ACTIVE_SESSION**.

---

## Section 5 — broadcastUIState() Triggers

**Definition:** `echly-extension/src/background.ts` lines 197–210. Sends current `globalUIState` to all tabs.

**Call sites:**

| Line | Trigger |
|------|--------|
| 68 | After background startup: restore `activeSessionId` from storage; set `sessionModeActive = false`; then `broadcastUIState()`. |
| 256 | ECHLY_TOGGLE_VISIBILITY. |
| 263 | ECHLY_EXPAND_WIDGET. |
| 270 | ECHLY_COLLAPSE_WIDGET. |
| 303 | ECHLY_SET_ACTIVE_SESSION (async branch: after setting pointers or when sessionId null). |
| 321 | ECHLY_SESSION_MODE_START. |
| 342 | ECHLY_SESSION_MODE_PAUSE. |
| 353 | ECHLY_SESSION_MODE_RESUME. |
| 381 | ECHLY_SESSION_MODE_END (immediate). |
| 382 | ECHLY_SESSION_MODE_END (delayed 150 ms). |
| 466 | START_RECORDING. |
| 472 | STOP_RECORDING. |
| 680 | Inside ECHLY_PROCESS_FEEDBACK success path (feedback created). |

**After session end:** Only ECHLY_SESSION_MODE_END (381, 382) runs. So the **content** that restarts the session is not “something else calling broadcastUIState”; it is **something setting globalUIState.sessionModeActive = true** (ECHLY_SET_ACTIVE_SESSION from the dashboard tab), which is then broadcast by the existing broadcastUIState() call inside that handler.

---

## Section 6 — Tab Activation Sync

- **chrome.tabs.onActivated** (background 213–225): Sends **current** `globalUIState` and `ECHLY_SESSION_STATE_SYNC` to the **activated** tab only.  
- **ECHLY_SESSION_STATE_SYNC** (content 1412–1422): Content requests `ECHLY_GET_GLOBAL_STATE` and applies the response, then dispatches `ECHLY_GLOBAL_STATE` so the widget gets it.  
- **ECHLY_GET_GLOBAL_STATE** (background 275–277): Returns a **copy** of current `globalUIState`.

So tab activation only **propagates** the current state; it does not **set** `sessionModeActive`. If the user switches to the tab that just opened (dashboard), that tab’s **load/mount** runs **sendActiveSessionIfDashboard**, which **sends ECHLY_SET_ACTIVE_SESSION** and therefore sets `sessionModeActive = true`. So the “tab activation” that matters is not the listener per se, but the **new tab’s URL** triggering the dashboard effect.

---

## Section 7 — useCaptureWidget Session-Mode Effects

All `useEffect` blocks in `useCaptureWidget.ts` that depend on `sessionMode`, `sessionPaused`, `sessionId`, or `globalSessionModeActive`:

| Lines | Deps | Behavior |
|-------|------|----------|
| 1067–1072 | `[globalSessionModeActive, createCaptureRoot]` | If `globalSessionModeActive === true`: `setSessionMode(true)` and `createCaptureRoot()`. Starts overlay when global says so. |
| 1078–1105 | `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot, removeCaptureRoot]` | Sync from global: if active, set local session mode and paused state, ensure root exists; if inactive, `setSessionMode(false)`, clear state, `removeCaptureRoot()`. |
| 1107–1119 | `[extensionMode, globalSessionModeActive, removeCaptureRoot]` | Safety: if `!globalSessionModeActive`, force session off and `removeCaptureRoot()`. |
| 1121–1131 | `[extensionMode, globalSessionModeActive, globalSessionPaused]` | When active and global paused is defined, sync local `sessionPaused`. |
| 1133–1147 | `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot]` | Visibility: when tab becomes visible and global is active and no capture root, recreate root and set session mode. |

So the widget is **fully driven by `globalSessionModeActive`**. When it becomes true again (from background), these effects re-mount the overlay. They do not independently “decide” to start; they only react to global state.

---

## Section 8 — Runtime Event Timeline (Start → Capture → End → Restart)

Simulated sequence with approximate times:

| Time | Event |
|------|--------|
| T+0 ms | User clicks “End session”. Widget calls `endSession()` → `onSessionModeEnd()`. |
| T+~10 ms | Content sends `ECHLY_SESSION_MODE_END` to background. |
| T+~30 ms | Background clears `activeSessionId`, `sessionModeActive`, `sessionPaused`, `pointers`; persists; calls `broadcastUIState()`. |
| T+~50 ms | Content (and other tabs) receive `ECHLY_GLOBAL_STATE` with `sessionModeActive: false`. Widget effects run: `setSessionMode(false)`, `removeCaptureRoot()`. Session appears ended. |
| T+~50 ms | Content’s onSessionModeEnd continues: after 50 ms delay, sends `ECHLY_OPEN_TAB` with `dashboard/${sessionId}`. |
| T+~60 ms | Background opens new tab (dashboard page). |
| T+150 ms | Background’s `setTimeout(broadcastUIState, 150)` runs (second broadcast of same cleared state). |
| T+~200–1200 ms | New dashboard tab loads. Content script runs in that tab. |
| T+~200–1200 ms | React mounts. Effect `sendActiveSessionIfDashboard` runs (226–241): pathname is `/dashboard/{sessionId}` → sends `ECHLY_SET_ACTIVE_SESSION` with that `sessionId`. |
| T+~200–1200 ms | Background receives `ECHLY_SET_ACTIVE_SESSION`: sets `globalUIState.sessionModeActive = true`, `sessionId`, fetches pointers, `broadcastUIState()`. |
| T+~200–1200 ms | All tabs (including the one where user ended the session) receive `ECHLY_GLOBAL_STATE` with `sessionModeActive: true`. Widget effects run: `setSessionMode(true)`, `createCaptureRoot()`. **Session “restarts”.** |

So the **~1–2 s** delay is the time for the new dashboard tab to load and its content script to run the dashboard effect. That effect is what triggers the restart.

---

## Section 9 — Root Cause

**What causes `sessionModeActive` to become true again:**

- **File:** `echly-extension/src/content.tsx`  
- **Function:** Effect that calls `sendActiveSessionIfDashboard` (and the function itself).  
- **Line:** 226–241 (effect), 227–237 (function body).  
- **Exact line that triggers restart:** The `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: segments[1] }, () => {})` call at **234–236**.

**Condition that triggers it:**

1. Page origin is app (e.g. `http://localhost:3000` or `https://echly-web.vercel.app`).  
2. Pathname is `/dashboard/{sessionId}` (e.g. `/dashboard/abc123`).  
3. The effect runs on mount (and on `popstate`).  

After “End session”, the content script opens a tab to exactly that URL. When that tab loads, the content script runs in it, React mounts, and this effect runs with no notion that the session was just ended. It therefore sends `ECHLY_SET_ACTIVE_SESSION` with the same session id, and the background sets `sessionModeActive = true` and broadcasts, so the session restarts in all tabs.

---

## Section 10 — Debug Report Summary

### Session lifecycle (high level)

- **Start:** User starts or resumes session → content sends `ECHLY_SESSION_MODE_START` and/or `ECHLY_SET_ACTIVE_SESSION` → background sets `sessionModeActive = true` and broadcasts → widget effects run → `createCaptureRoot()`, overlay shown.  
- **End:** User clicks End → content sends `ECHLY_SESSION_MODE_END` → background sets `sessionModeActive = false`, clears session, broadcasts → widget effects run → `removeCaptureRoot()`, overlay removed.  
- **Restart (bug):** New tab opened to `/dashboard/{sessionId}` → that tab’s content script runs `sendActiveSessionIfDashboard` → `ECHLY_SET_ACTIVE_SESSION` → background sets `sessionModeActive = true` and broadcasts → all tabs show session again.

### Event timeline (simplified)

- END click → END message → background clears state → broadcast (and 150 ms later again).  
- 50 ms after END, content opens dashboard tab.  
- When dashboard tab loads (~200–1200 ms), its effect sends `ECHLY_SET_ACTIVE_SESSION` → session restarts.

### Session restart trigger

- **Message:** `ECHLY_SET_ACTIVE_SESSION` with `sessionId` = the session that was just ended.  
- **Sender:** Content script in the **newly opened dashboard tab** (`/dashboard/{sessionId}`).  
- **Handler:** Background sets `globalUIState.sessionModeActive = true` and broadcasts.

### Root cause (one sentence)

Opening the dashboard tab after “End session” causes that tab’s “dashboard session page” effect to run; it sends `ECHLY_SET_ACTIVE_SESSION` with the same session id, which sets session mode active again globally and restarts the session in all tabs.

---

*No code was modified; this document only explains current behavior.*
