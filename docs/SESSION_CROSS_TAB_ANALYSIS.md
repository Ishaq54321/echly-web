# Echly Chrome Extension — Session Cross-Tab Analysis

**Purpose:** Diagnostic and architectural analysis of how feedback sessions propagate across browser tabs and why the capture overlay does not automatically activate in other tabs when a session starts. **No code changes.**

---

## PART 1 — Session state source

### Where each state is stored and managed

| State | Stored in | Managed by |
|-------|-----------|------------|
| **sessionMode** | React component state only | `useCaptureWidget.ts`: `useState(false)` (line 130). Not in extension storage, not in background, not in URL. |
| **activeSessionId** | 1) Background script memory (`activeSessionId`), 2) `chrome.storage.local` key `activeSessionId`, 3) `globalUIState.sessionId` in background | `echly-extension/src/background.ts`: read on load from storage (lines 42–48), updated on `ECHLY_SET_ACTIVE_SESSION` (212–216), written to storage (216). |
| **sessionPaused** | React component state only | `useCaptureWidget.ts`: `useState(false)` (line 131). Not in extension storage, not in background. |

### Exact files

- **sessionMode / sessionPaused:**  
  `components/CaptureWidget/hooks/useCaptureWidget.ts` (and duplicated path `components\CaptureWidget\...`).  
  Consumed by: `CaptureWidget.tsx`, `CaptureLayer.tsx`, `SessionOverlay.tsx`, `SessionControlPanel.tsx`.

- **activeSessionId:**  
  `echly-extension/src/background.ts` (module-level variable + `chrome.storage.local` + `globalUIState.sessionId`).  
  Content script gets it only indirectly via **global UI state** (see below).

### Summary by storage type

- **React component state:** `sessionMode`, `sessionPaused` (per tab, inside content script’s React tree).
- **Extension storage (`chrome.storage.local`):** `activeSessionId` (and auth keys). No `sessionMode` or `sessionPaused` in storage.
- **Background script memory:** `activeSessionId`, `globalUIState` (including `sessionId`). No `sessionMode` or `sessionPaused`.
- **Message passing:** `globalUIState` (visible, expanded, isRecording, **sessionId**) is sent to tabs via `ECHLY_GLOBAL_STATE`. Session “mode” (on/off) and “paused” are **not** sent.
- **URL state:** Not used for these session flags.

---

## PART 2 — Trace: “Start New Feedback Session”

### Flow from UI to background and content

1. **CaptureWidget.tsx**  
   - Footer shows “Start New Feedback Session” when `extensionMode` is true.  
   - `WidgetFooter.tsx`: button `onClick={onStartSession}` (aria-label "Start New Feedback Session").  
   - `CaptureWidget.tsx` (line 253): `onStartSession={extensionMode ? handlers.startSession : undefined}`.

2. **useCaptureWidget.ts — startSession**  
   - `startSession` (lines 757–771):
     - Guard: `if (stateRef.current !== "idle" || sessionModeRef.current) return;`
     - If `extensionMode && onCreateSession && onActiveSessionChange`:
       - `const session = await onCreateSession();` → **creates session via API**
       - `if (!session?.id) return;`
       - `onActiveSessionChange(session.id);` → **notifies parent and background**
     - Then: `setSessionMode(true); setSessionPaused(false); setSessionFeedbackPending(null); createCaptureRoot();`  
   - So: **session is created via POST /api/sessions** (in content), then **activeSessionId is set in background and storage**, then **only this tab** sets `sessionMode`/`sessionPaused` and creates the capture root.

3. **Content script (content.tsx) — onCreateSession / onActiveSessionChange**  
   - `createSession` (536–545): `apiFetch("/api/sessions", { method: "POST", ... })` → **yes, POST /api/sessions**.  
   - `onActiveSessionChange` (547–550):  
     - `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId })`  
     - `setSessionIdOverride(newSessionId)` (local React state in this tab).

4. **Background (background.ts)**  
   - On `ECHLY_SET_ACTIVE_SESSION`:  
     - `activeSessionId = request.sessionId ?? null`  
     - `globalUIState.sessionId = activeSessionId`  
     - `chrome.storage.local.set({ activeSessionId })`  
     - `broadcastUIState()`  
   - `broadcastUIState()` (174–183): `chrome.tabs.query({}, ...)` then for each tab `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`.  
   - So **activeSessionId is stored** in background memory and `chrome.storage.local`; **all tabs** receive `ECHLY_GLOBAL_STATE` with the new `sessionId`. They do **not** receive any “session started” or “sessionMode” flag.

5. **Content script in other tabs**  
   - `ensureMessageListener` (content.tsx 1199–1217): `chrome.runtime.onMessage.addListener` for `ECHLY_GLOBAL_STATE`.  
   - On message: sets host visibility from `msg.state.visible` and dispatches `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: msg.state } }))`.  
   - `ContentApp` has `React.useEffect` listening for `ECHLY_GLOBAL_STATE` and calling `setGlobalState(s)`.  
   - So other tabs **only** update `globalState` (visible, expanded, isRecording, **sessionId**). No code in content or CaptureWidget sets `sessionMode` or `sessionPaused` from this message.  
   - The only way another tab enters session mode in the current design is **Resume**: `loadSessionWithPointers` is set (e.g. from “Resume” session picker), and `useCaptureWidget` has an effect (795–803) that calls `setSessionMode(true)` etc. when `loadSessionWithPointers` is set. That is **not** triggered by “Start New Feedback Session” in another tab.

### Answers

1. **Does it create a session via POST /api/sessions?**  
   **Yes.** Content’s `createSession` calls `apiFetch("/api/sessions", { method: "POST", ... })`; background does not call the sessions API for this.

2. **Where is activeSessionId stored?**  
   - Background: in-memory `activeSessionId` and `globalUIState.sessionId`.  
   - Persisted: `chrome.storage.local` key `activeSessionId`.  
   - Propagated to tabs: inside `globalUIState` via `ECHLY_GLOBAL_STATE` (message only; no separate storage read in content for this flow).

3. **How does the content script know a session started?**  
   - In the **tab where the user clicked “Start”**: the content script’s React code runs `startSession` → `onCreateSession()` → `onActiveSessionChange(session.id)` and the same hook sets `setSessionMode(true)` and `createCaptureRoot()`. So that tab “knows” because it initiated the action.  
   - In **other tabs**: they only receive `ECHLY_GLOBAL_STATE` with updated `sessionId`. There is no message or storage field that means “session mode just started” or “enable capture overlay.” So other tabs do **not** know that a session “started” in the sense of entering session/capture mode.

### Chain summary

- **User click** → `WidgetFooter` `onStartSession` → `handlers.startSession` (useCaptureWidget).  
- **startSession** → `onCreateSession()` (content’s `createSession`) → POST `/api/sessions` → `onActiveSessionChange(session.id)` → `chrome.runtime.sendMessage(ECHLY_SET_ACTIVE_SESSION)` + `setSessionIdOverride`.  
- **Background** → sets `activeSessionId` and `globalUIState.sessionId`, writes `chrome.storage.local`, then `broadcastUIState()` → `chrome.tabs.sendMessage(..., ECHLY_GLOBAL_STATE)`.  
- **Same tab** → also runs `setSessionMode(true)`, `setSessionPaused(false)`, `createCaptureRoot()` in the same `startSession` call.  
- **Other tabs** → only handle `ECHLY_GLOBAL_STATE` and update `globalState` (including `sessionId`); no handler sets `sessionMode` or triggers overlay activation.

---

## PART 3 — Cross-tab propagation

### Mechanisms in use

- **chrome.runtime.sendMessage**  
  - Content → background: e.g. `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_GET_GLOBAL_STATE`, `ECHLY_TOGGLE_VISIBILITY`, `START_RECORDING`, `STOP_RECORDING`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, `ECHLY_OPEN_POPUP`, etc.

- **chrome.tabs.sendMessage**  
  - Background → each tab: used inside `broadcastUIState()` to send `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to every tab.  
  - Also used after feedback creation: background sends `ECHLY_FEEDBACK_CREATED` to all tabs.

- **chrome.runtime.onMessage**  
  - In background: handles all request types above.  
  - In content: `ensureMessageListener` (content.tsx) registers a listener for `ECHLY_GLOBAL_STATE` and `ECHLY_FEEDBACK_CREATED` (and `ECHLY_TOGGLE`).

- **chrome.storage**  
  - **Read:** background reads `activeSessionId` (and auth) from `chrome.storage.local` on load.  
  - **Write:** background writes `activeSessionId` on `ECHLY_SET_ACTIVE_SESSION`.  
  - **chrome.storage.onChanged:** **not used**. Content scripts do not subscribe to storage changes; they rely on messages.

- **Background broadcast**  
  - **Yes.** `broadcastUIState()` is called after: `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, `ECHLY_SET_ACTIVE_SESSION`, `START_RECORDING`, `STOP_RECORDING`.  
  - It sends the **same** `globalUIState` object to all tabs: `{ visible, expanded, isRecording, sessionId }`. No `sessionMode` or `sessionPaused`.

So: **cross-tab propagation of “active session” is done via `chrome.tabs.sendMessage(ECHLY_GLOBAL_STATE)` from the background.** Only the fields in `globalUIState` are propagated; session mode and paused state are not part of that object.

---

## PART 4 — Widget appearing in other tabs

The widget (floating button + panel) appears in other tabs because:

1. **Widget is always injected**  
   - Content script runs in every tab (manifest). `main()` in content.tsx creates a single host (`SHADOW_HOST_ID`), mounts the React app once, and ensures a message listener. So the widget UI exists in every tab.

2. **Widget visibility follows background global state**  
   - Visibility is not driven by “session started” in that tab. It is driven by `globalState.visible`.  
   - On load: `syncInitialGlobalState(host)` asks background `ECHLY_GET_GLOBAL_STATE` and sets `host.style.display = state.visible ? "block" : "none"` and dispatches `ECHLY_GLOBAL_STATE` so React’s `globalState` has the same values.  
   - On updates: when background calls `broadcastUIState()`, each tab’s listener receives `ECHLY_GLOBAL_STATE` and (in `ensureMessageListener`) sets `h.style.display = msg.state.visible ? "block" : "none"` and dispatches the event so `ContentApp`’s `globalState` stays in sync.  
   - So if the user has toggled the widget visible (e.g. from popup or one tab), `globalUIState.visible` is true and all tabs show the widget. New tabs also get this on load via `syncInitialGlobalState`.

3. **SessionId in global state**  
   - `effectiveSessionId` in content is `sessionIdOverride ?? globalState.sessionId`. So after “Start New Feedback Session” in one tab, background broadcasts the new `sessionId`; other tabs get the same `sessionId` in `globalState` and can show the same “active session” in the UI (e.g. for “Resume” or labels). So the **widget** can show “we have an active session” in every tab, but that does not turn on **capture mode** in those tabs.

So: **the widget appears in other tabs because it is injected in every tab and its visibility (and sessionId) comes from background global state (message passing + initial sync).** It does **not** appear because of session mode or overlay logic; those are separate and local to each tab’s React state.

---

## PART 5 — Why capture does not activate in other tabs

- **sessionMode is not propagated**  
  - `sessionMode` lives only in `useCaptureWidget` React state. It is set to `true` only in the tab where `startSession` ran (or where `loadSessionWithPointers` is set for Resume).  
  - `ECHLY_GLOBAL_STATE` does not include `sessionMode` or `sessionPaused`; background does not store them. So other tabs never receive “session mode on.”

- **Capture overlay activation depends on local state**  
  - `CaptureLayer` shows the session overlay when `showSessionOverlay = sessionMode && extensionMode` (CaptureLayer.tsx 65).  
  - `SessionOverlay` renders and enables hover/click when `captureActive = sessionMode && !sessionPaused && sessionFeedbackPending == null` (SessionOverlay.tsx 51).  
  - So overlay activation is **purely** from props coming from `useCaptureWidget` state (`sessionMode`, `sessionPaused`, `sessionFeedbackPending`). In other tabs those remain default (`sessionMode=false`, `sessionPaused=false`), so the condition is never true.

- **Content scripts do not receive a “session start” event**  
  - They receive `ECHLY_GLOBAL_STATE` with updated `sessionId` only. There is no message type like “SESSION_MODE_STARTED” or “ENABLE_CAPTURE_OVERLAY.”  
  - So no code path in other tabs sets `sessionMode` to `true` when another tab starts a session.

**Exact condition for capture overlay to be active:**  
`sessionMode && !sessionPaused && sessionFeedbackPending == null` (and `sessionMode && extensionMode` for showing the session overlay at all). In other tabs, `sessionMode` is always false after a session start in another tab, so this condition is never met.

---

## PART 6 — Overlay activation architecture

### Files involved

- **content.tsx** — Mounts React app; passes `effectiveSessionId`, `createSession`, `onActiveSessionChange`, `loadSessionWithPointers`, etc. Does not set session mode from messages.  
- **CaptureWidget.tsx** — Uses `useCaptureWidget`, passes `state.sessionMode`, `state.sessionPaused`, etc. to `CaptureLayer`.  
- **useCaptureWidget.ts** — Holds `sessionMode` / `sessionPaused` state; `startSession` sets them and calls `createCaptureRoot()`.  
- **CaptureLayer.tsx** — Decides whether to show `SessionOverlay` (`sessionMode && extensionMode`) and passes through session props.  
- **SessionOverlay.tsx** — Renders session UI and attaches highlighter/click capture when `sessionMode && !sessionPaused && sessionFeedbackPending == null`.

### What triggers overlay activation

- **In the tab where the user clicks “Start New Feedback Session”:**  
  - `startSession` runs → `setSessionMode(true)`, `setSessionPaused(false)`, `createCaptureRoot()`.  
  - That updates React state → `CaptureLayer` gets `sessionMode=true` → `SessionOverlay` mounts and `captureActive` is true → highlighter and click capture are attached, “Click to add feedback” tooltip and session control panel appear.

- So the **event** that triggers overlay activation is the **local** call to `setSessionMode(true)` (and related state) inside `startSession` in that tab only.

### Why it only activates in the original tab

- Overlay visibility and behavior are 100% driven by React state in `useCaptureWidget` (`sessionMode`, `sessionPaused`, `sessionFeedbackPending`).  
- That state is updated only by:  
  - `startSession` (and only in the tab where it ran), or  
  - `loadSessionWithPointers` effect (Resume flow in the tab that chose “Resume”).  
- No message or storage update from the background or from another tab sets `sessionMode` or `sessionPaused` in other tabs. So overlay activation stays local to the tab that started (or resumed) the session.

### What would be required for other tabs to activate

- Other tabs need to set `sessionMode=true` (and `sessionPaused=false`, and ensure a capture root exists) when a session is started elsewhere. Options:  
  1. **Extend global state and broadcast:** Add something like `sessionModeActive: boolean` (and optionally `sessionPaused`) to `globalUIState`, set it in background when the originating tab calls a new message (e.g. “ECHLY_SESSION_MODE_STARTED” / “ECHLY_SESSION_MODE_ENDED”), and broadcast via existing `ECHLY_GLOBAL_STATE`. Content script would need to map that into props or state that CaptureWidget/useCaptureWidget use to set `sessionMode`/`sessionPaused`.  
  2. **New message type:** Background sends a dedicated message (e.g. `ECHLY_SESSION_MODE_CHANGED`) to all tabs with `{ sessionMode, sessionPaused }` when the tab that started the session notifies the background. Content script listens and updates some state that drives CaptureWidget (e.g. a “remote session mode” that useCaptureWidget or content passes in and uses like `loadSessionWithPointers` for Resume).  
  3. **Storage + onChanged:** Persist “session mode active” (and maybe paused) in `chrome.storage.local`, have background update it when session starts/ends/pauses, and have content scripts subscribe with `chrome.storage.onChanged` and update local React state.  
- In all cases, the content script (or CaptureWidget) must have a code path that sets **local** `sessionMode` (and `sessionPaused`) from the propagated source, and ensure `createCaptureRoot()` (or equivalent) runs so the overlay has a root. Today that path does not exist for “session started in another tab.”

---

## PART 7 — System diagram (session state flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ POPUP (optional; can toggle visibility, open for auth)                       │
│   → chrome.runtime.sendMessage(ECHLY_TOGGLE_VISIBILITY / etc.)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKGROUND (background.ts)                                                   │
│   • activeSessionId (memory) + chrome.storage.local["activeSessionId"]     │
│   • globalUIState = { visible, expanded, isRecording, sessionId }            │
│   • NO sessionMode / sessionPaused                                          │
│   On ECHLY_SET_ACTIVE_SESSION:                                               │
│     set activeSessionId, globalUIState.sessionId, storage → broadcastUIState │
│   broadcastUIState() → chrome.tabs.sendMessage(every tab, ECHLY_GLOBAL_STATE)│
└─────────────────────────────────────────────────────────────────────────────┘
         │                                    │
         │ ECHLY_GLOBAL_STATE                 │ ECHLY_GET_GLOBAL_STATE (on load)
         ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTENT SCRIPT (content.tsx) — one instance per tab                          │
│   • ensureMessageListener: onMessage(ECHLY_GLOBAL_STATE) → set host display,  │
│     dispatch window CustomEvent ECHLY_GLOBAL_STATE                           │
│   • ContentApp: listens ECHLY_GLOBAL_STATE → setGlobalState(s)               │
│   • globalState = { visible, expanded, isRecording, sessionId }                │
│   • effectiveSessionId = sessionIdOverride ?? globalState.sessionId           │
│   • Passes to CaptureWidget: sessionId, onCreateSession, onActiveSessionChange│
│   • Does NOT set sessionMode/sessionPaused from messages                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ WIDGET (CaptureWidget.tsx + useCaptureWidget.ts) — per-tab React state       │
│   • sessionMode, sessionPaused = useState in useCaptureWidget (local only)   │
│   • startSession: onCreateSession() → POST /api/sessions;                    │
│     onActiveSessionChange(id) → ECHLY_SET_ACTIVE_SESSION;                     │
│     setSessionMode(true); setSessionPaused(false); createCaptureRoot();      │
│   • Only this tab’s startSession sets sessionMode true                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAPTURE LAYER (CaptureLayer.tsx → SessionOverlay.tsx)                        │
│   • showSessionOverlay = sessionMode && extensionMode                        │
│   • captureActive = sessionMode && !sessionPaused && !sessionFeedbackPending│
│   • Other tabs: sessionMode=false → overlay never shown / active              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Summary:**  
- **activeSessionId** flows: Content (createSession + onActiveSessionChange) → Background (memory + storage) → all tabs (ECHLY_GLOBAL_STATE).  
- **sessionMode / sessionPaused** do not leave the tab where “Start” (or Resume) was clicked; they are not in background, storage, or messages, so the capture overlay never activates in other tabs.

---

## PART 8 — Conclusions (no fixes, analysis only)

### How the current system works

- One tab starts a session: it creates a session via POST /api/sessions, notifies the background with `ECHLY_SET_ACTIVE_SESSION`, and sets its own React state `sessionMode=true`, `sessionPaused=false`, and creates the capture root.  
- Background stores `activeSessionId` in memory and `chrome.storage.local`, updates `globalUIState.sessionId`, and broadcasts `ECHLY_GLOBAL_STATE` to all tabs.  
- All tabs share the same **session id** (via global state) and the same **widget visibility** (via global state).  
- **Session “mode” (capture overlay on/off) and “paused” are not shared;** they exist only in the React state of the tab that started or resumed the session.

### Why the widget appears across tabs

- The widget is injected in every tab. Its visibility is controlled by `globalState.visible`, which comes from the background (initial sync + broadcast). So when the widget is toggled visible, all tabs show it.  
- After a session is started, `globalState.sessionId` is updated in every tab, so the widget can show “active session” everywhere. That is independent of capture overlay activation.

### Why capture does not activate across tabs

- Capture overlay activation is gated by **local** `sessionMode && !sessionPaused` (and no pending feedback).  
- Only the tab that runs `startSession` (or the Resume flow) sets `sessionMode=true`. Other tabs never receive or derive “session mode on,” so the condition is never true and the overlay never activates.

### Architectural change needed for Loom-style behavior

- To get “start session in one tab → capture overlay active in all tabs” (Loom-style), the extension would need to:  
  1. **Represent “session mode active” (and optionally “paused”) in a shared place:** e.g. extend `globalUIState` in the background or add a new message/storage contract.  
  2. **Have the tab that starts the session notify the background** that session mode is on (and later off/paused).  
  3. **Have the background broadcast** that state to all tabs (same as current broadcast, or a dedicated message).  
  4. **Have every content script** (or CaptureWidget) **drive local overlay state** from that broadcast (e.g. set `sessionMode`/`sessionPaused` from the message or from storage), and ensure the capture root exists when entering session mode.  
- So the change is: **add a shared notion of “session mode active” (and optionally paused) that the background broadcasts, and have each tab’s content script/CaptureWidget set local session mode state from it so that the existing overlay condition `sessionMode && !sessionPaused` is true in every tab.**

This document is analysis only; no implementation changes were made.
