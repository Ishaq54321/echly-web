# Echly Extension — Runtime Architecture Root Cause Report

**Purpose:** Read-only diagnostic audit of the Echly browser extension to identify root causes of session synchronization and ticket loading failures. **No code was modified.**

**Symptoms investigated:**
1. Session state does not carry across tabs
2. If a session ends in one tab, other tabs still show it as active
3. Recorder bar does not stay synchronized across tabs
4. Session cards (tickets) are not updated in other tabs
5. Opening a previous session does not load all cards belonging to that session
6. Resume button does not correctly bind to the most recent active session
7. Extension UI sometimes reflects outdated session state

---

## SECTION 1 — Extension Entrypoints

### manifest.json

- **Manifest version:** 3
- **Entrypoints:**
  - **Background:** `background.js` (service worker). Built from `echly-extension/src/background.ts`.
  - **Content scripts:** Single entry `content.js`, matches `<all_urls>`, `run_at: "document_idle"`. Built from `echly-extension/src/content.tsx`.
  - **Action popup:** `popup.html` (default popup for the extension icon). Renders `popup.tsx`.
- **Permissions:** `identity`, `storage`, `activeTab`, `tabs`
- **Host permissions:** `<all_urls>`, `http://localhost:3000/*`, `https://echly-web.vercel.app/*`, Firebase/Google auth domains

### background.ts

- **Initialization:** Loaded once when the extension loads. Runs top-level code immediately:
  1. `chrome.storage.local.get(["activeSessionId"], ...)` restores `activeSessionId` and sets `globalUIState.sessionId`, then sets `sessionModeActive`/`sessionPaused` to `false` and calls `broadcastUIState()`.
  2. `chrome.storage.local.get([...auth keys], ...)` restores token state.
  3. Registers `chrome.tabs.onActivated` and `chrome.tabs.onCreated` to push `ECHLY_GLOBAL_STATE` to the activated/created tab.
  4. Registers `chrome.runtime.onMessage.addListener` for all extension messages.
- **Role:** Single source of truth for auth tokens, `globalUIState` (visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused), and `activeSessionId`. Persists session lifecycle to `chrome.storage.local`. Broadcasts state to tabs; handles API proxy (`echly-api`), feedback processing (`ECHLY_PROCESS_FEEDBACK`), and session lifecycle messages.

### content.tsx

- **Initialization:** Injected into every matching page at `document_idle`. `main()` runs once:
  1. Creates or reuses `#echly-shadow-host` div, appends to `document.documentElement`.
  2. Calls `mountReactApp(host)` → creates shadow root, injects styles, creates `#echly-root`, renders `<ContentApp>` via `createRoot`.
  3. Calls `ensureMessageListener(host)` (single `chrome.runtime.onMessage` listener).
  4. Calls `syncInitialGlobalState(host)` (requests `ECHLY_GET_GLOBAL_STATE` from background and applies it).
  5. Calls `ensureVisibilityStateRefresh()` (on `document.visibilitychange` when tab becomes visible, re-requests global state).
- **Role:** Thin UI layer; does not own session state. Renders `<CaptureWidget>` inside shadow DOM. Applies global state from background via messages and CustomEvents. Owns `sessionIdOverride` and `loadSessionWithPointers` for the current tab only.

### popup.tsx

- **Initialization:** Loaded when user clicks the extension icon. `createRoot(rootEl).render(<PopupApp />)`. On mount, `PopupApp` calls `getAuthState()` (sends `ECHLY_GET_AUTH_STATE`). If authenticated, it calls `toggleVisibility()` and `window.close()`; otherwise shows "Continue with Google".
- **Role:** Login-only. Sends `ECHLY_GET_AUTH_STATE`, `ECHLY_START_LOGIN`, and `ECHLY_TOGGLE_VISIBILITY`. Does not subscribe to global session state.

### Communication summary

- **Popup ↔ Background:** `chrome.runtime.sendMessage` (popup → background). No content involvement.
- **Content ↔ Background:** Content uses `chrome.runtime.sendMessage` for requests; background uses `chrome.tabs.sendMessage(tabId, ...)` to push state to specific tabs. Content has one `chrome.runtime.onMessage` listener that dispatches CustomEvents so the React tree (which runs inside the content script) can update.
- **Tab-to-tab:** No direct messaging. All cross-tab consistency is via background: background updates `globalUIState` and calls `broadcastUIState()` (or sends to one tab on activation/creation).

---

## SECTION 2 — Global Session State

### Where sessionId is stored

| Location | Variable | Scope |
|----------|----------|--------|
| background.ts | `activeSessionId` (module-level) | In-memory; source of truth for "current session" in background |
| background.ts | `globalUIState.sessionId` | Mirrored from `activeSessionId`; sent in every `ECHLY_GLOBAL_STATE` |
| chrome.storage.local | `activeSessionId` | Persisted; restored on background load |
| content.tsx (ContentApp) | `globalState.sessionId` | React state; set from `ECHLY_GLOBAL_STATE` payloads |
| content.tsx (ContentApp) | `sessionIdOverride` | React state; set when user selects session (dashboard URL or Resume picker) |
| content.tsx | `effectiveSessionId = sessionIdOverride ?? globalState.sessionId` | Derived; used for API calls and passed to CaptureWidget as `sessionId` prop |

### Where it is persisted

- **Background:** `chrome.storage.local.set({ activeSessionId, sessionModeActive, sessionPaused })` in:
  - `persistSessionLifecycleState()` (called from ECHLY_SESSION_MODE_START/PAUSE/RESUME)
  - ECHLY_SET_ACTIVE_SESSION handler
  - ECHLY_SESSION_MODE_END handler
  - ECHLY_TOGGLE_VISIBILITY handler (when opening widget: **clears** activeSessionId and session flags)
- **Content:** No persistence. `sessionIdOverride` and `globalState` are in-memory only; `globalState` is overwritten by every `ECHLY_GLOBAL_STATE` message.

### Where it is broadcast

- **broadcastUIState()** (background): `chrome.tabs.query({}, (tabs) => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })))`. Failures are swallowed (`.catch(() => {})`).
- **Tab activation:** `chrome.tabs.onActivated` → `chrome.tabs.sendMessage(activeInfo.tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`.
- **Tab creation:** `chrome.tabs.onCreated` → `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`. For newly created tabs, the content script may not be injected yet, so this send often fails.

### Lifecycle of sessionId / sessionModeActive / sessionPaused

1. **Background load:** Restores `activeSessionId` from storage; sets `globalUIState.sessionId` to that value; sets `globalUIState.sessionModeActive` and `sessionPaused` to `false`; broadcasts.
2. **User sets active session (e.g. Resume or dashboard):** Content sends `ECHLY_SET_ACTIVE_SESSION` with `sessionId` → background sets `activeSessionId`, `globalUIState.sessionId`, `sessionModeActive = true`, `sessionPaused = false`, persists, broadcasts.
3. **Session start/pause/resume:** ECHLY_SESSION_MODE_START/PAUSE/RESUME update `globalUIState.sessionModeActive` and `sessionPaused`, copy `globalUIState.sessionId = activeSessionId`, persist, broadcast. They do **not** change `activeSessionId`.
4. **Session end:** ECHLY_SESSION_MODE_END sets `activeSessionId = null`, `globalUIState.sessionId = null`, `sessionModeActive = false`, `sessionPaused = false`, persists, broadcasts.
5. **Widget open (ECHLY_TOGGLE_VISIBILITY when visible becomes true):** Background sets `sessionModeActive = false`, `sessionPaused = false`, `sessionId = null`, `activeSessionId = null`, persists, sends `ECHLY_RESET_WIDGET` to all tabs, then broadcasts. So **every time the user opens the extension, the stored "active session" is cleared.**

---

## SECTION 3 — Message Bus

All messages observed in the codebase:

| Message | Sender | Receiver | State mutations | UI effects |
|---------|--------|----------|------------------|------------|
| **ECHLY_GLOBAL_STATE** | Background | Content (all tabs or single tab) | None in sender; receiver applies `state` to host visibility and React `globalState` | Content: setHostVisibility(state.visible), setGlobalState(state). Widget gets globalSessionModeActive, globalSessionPaused, sessionId from props. |
| **ECHLY_SET_ACTIVE_SESSION** | Content | Background | Background: activeSessionId, globalUIState.sessionId, sessionModeActive=true, sessionPaused=false; persist; broadcast | All tabs receive ECHLY_GLOBAL_STATE with new sessionId/sessionModeActive. |
| **ECHLY_GET_ACTIVE_SESSION** | (any) | Background | None | Caller gets { sessionId } from storage. Not used by content script in current code. |
| **ECHLY_SESSION_MODE_START** | Content | Background | sessionModeActive=true, sessionPaused=false, globalUIState.sessionId=activeSessionId; persist; broadcast | Tabs get updated state; widget can show session overlay. |
| **ECHLY_SESSION_MODE_PAUSE** | Content | Background | sessionModeActive=true, sessionPaused=true; persist; broadcast | Recorder bar shows "Session paused". |
| **ECHLY_SESSION_MODE_RESUME** | Content | Background | sessionModeActive=true, sessionPaused=false; persist; broadcast | Recorder bar shows "Session started". |
| **ECHLY_SESSION_MODE_END** | Content | Background | activeSessionId=null, sessionId=null, sessionModeActive=false, sessionPaused=false; persist; broadcast | All tabs should show no session; overlay closes. |
| **ECHLY_FEEDBACK_CREATED** | Background | Content (all tabs) | None | Content dispatches CustomEvent "ECHLY_FEEDBACK_CREATED". **No React component in the extension subscribes to this event to update pointers or highlight.** |
| **ECHLY_PROCESS_FEEDBACK** | Content | Background | None in background state; background creates ticket(s) via API | On success, background broadcasts ECHLY_FEEDBACK_CREATED; content does not add ticket to list. |
| **ECHLY_RESET_WIDGET** | Background | Content (all tabs) | None in background | Content: CustomEvent → ContentApp clears loadSessionWithPointers, sets expanded false, increments widgetResetKey (CaptureWidget remounts). |
| **ECHLY_EXPAND_WIDGET** | Content | Background | globalUIState.expanded = true; broadcast | All tabs get expanded state. |
| **ECHLY_COLLAPSE_WIDGET** | Content | Background | globalUIState.expanded = false; broadcast | All tabs get collapsed state. |
| **ECHLY_TOGGLE_VISIBILITY** | Popup | Background | visible toggled; if visible→true: sessionId/activeSessionId/sessionModeActive/sessionPaused cleared, ECHLY_RESET_WIDGET to all tabs; broadcast | Widget shows/hides; on open, session state and tray reset. |
| **ECHLY_GET_GLOBAL_STATE** | Content | Background | None | Caller gets current globalUIState; content uses on mount and on visibilitychange. |
| **ECHLY_GET_AUTH_STATE** | Popup/Content | Background | None | Caller gets auth state. |
| **ECHLY_OPEN_POPUP** | Content | Background | None | Background opens popup in new tab. |
| **ECHLY_OPEN_TAB** | Content | Background | None | Background opens URL in new tab. |
| **START_RECORDING** | Content | Background | globalUIState.isRecording = true; broadcast | — |
| **STOP_RECORDING** | Content | Background | globalUIState.isRecording = false; broadcast | — |
| **CAPTURE_TAB** | Content | Background | None | Background captures visible tab, returns screenshot. |
| **ECHLY_UPLOAD_SCREENSHOT** | Content | Background | None | Background uploads image, returns URL. |
| **echly-api** | Content | Background | None | Background performs fetch with token, returns response. |

---

## SECTION 4 — Global State Broadcast

### broadcastUIState() (background.ts)

- **When it runs:** After any mutation of `globalUIState` or session lifecycle: ECHLY_TOGGLE_VISIBILITY, ECHLY_EXPAND_WIDGET, ECHLY_COLLAPSE_WIDGET, ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_* (start/pause/resume/end), START_RECORDING, STOP_RECORDING. Also once on background load (after restoring from storage).
- **What it does:** `chrome.tabs.query({}, (tabs) => { tabs.forEach(tab => { if (tab.id) chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState }).catch(() => {}); }); });`
- **Which tabs receive:** Every tab returned by `chrome.tabs.query({})`. Tabs where the content script is not loaded (e.g. chrome://, edge://, or tab just created before injection) will cause `sendMessage` to reject; the error is ignored, so those tabs never get the update.
- **How content applies state:** The content script’s single `chrome.runtime.onMessage` listener (in `ensureMessageListener`) runs in the page context. On `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state`:
  1. Sets host visibility: `setHostVisibility(state.visible)`.
  2. Calls `(window as any).__ECHLY_APPLY_GLOBAL_STATE__?.(state)` (set by ContentApp in a useEffect) to update React state.
  3. Dispatches `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }))`.
  ContentApp also has a `window.addEventListener("ECHLY_GLOBAL_STATE", handler)` that, unless `ignoreNextGlobalState.current` is true, calls `setHostVisibility(s.visible)` and `setGlobalState(s)`. So state is applied both via the optional callback and via the CustomEvent listener.

---

## SECTION 5 — Content Script State

### React state variables (ContentApp)

- **user, authChecked, theme:** Auth and theme; not session source of truth.
- **globalState:** `{ visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused }`. Updated only from background (ECHLY_GLOBAL_STATE or ECHLY_GET_GLOBAL_STATE). **Derived only from background; no local source of truth.**
- **sessionIdOverride:** Set when user selects a session (dashboard URL or Resume picker). Cleared by `onSessionEnd` (widget callback) and on `beforeunload`. Not cleared by ECHLY_GLOBAL_STATE.
- **loadSessionWithPointers:** `{ sessionId, pointers } | null`. Set in `onResumeSessionSelect` after fetching `/api/feedback?sessionId=...&limit=50`; cleared by `onSessionLoaded` and on ECHLY_RESET_WIDGET (and beforeunload).
- **widgetResetKey:** Incremented on ECHLY_RESET_WIDGET to force CaptureWidget remount.
- **hasPreviousSessions:** Set from `/api/sessions?limit=1` when widget becomes visible.
- **effectiveSessionId:** `sessionIdOverride ?? globalState.sessionId`. Used for API calls and as CaptureWidget `sessionId` prop.

### How globalState is updated

1. **On mount:** `chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, (response) => { if (response?.state) { setHostVisibility(...); setGlobalState(response.state); } });`
2. **On ECHLY_GLOBAL_STATE message:** Listener calls `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` and dispatches CustomEvent; ContentApp’s event handler calls `setGlobalState(s)` (unless `ignoreNextGlobalState.current` is true, then it resets the flag and returns).
3. **On tab visibility change:** When document becomes visible, content sends ECHLY_GET_GLOBAL_STATE and applies response via `setHostVisibility` and `dispatchGlobalState(normalized)` (CustomEvent), which ContentApp’s listener handles and updates state.

### Widget visibility

- **Host visibility:** `#echly-shadow-host` display is `block` when `globalState.visible`, `none` otherwise (`setHostVisibility(globalState.visible)`).
- **Expanded/collapsed:** Passed to CaptureWidget as `expanded={globalState.expanded}`; widget also receives `onExpandRequest` / `onCollapseRequest` which send ECHLY_EXPAND_WIDGET / ECHLY_COLLAPSE_WIDGET to background.

### How content reacts to ECHLY_GLOBAL_STATE

- Message listener: set host visibility, call `__ECHLY_APPLY_GLOBAL_STATE__?.(state)`, dispatch CustomEvent.
- ContentApp listener: if not ignoring, `setHostVisibility(s.visible)` and `setGlobalState(s)`.

### How content reacts to ECHLY_RESET_WIDGET

- Content has a **window** listener for the CustomEvent "ECHLY_RESET_WIDGET" (dispatched by the same message listener when it receives ECHLY_RESET_WIDGET from background). Handler: `ignoreNextGlobalState.current = true`; `setLoadSessionWithPointers(null)`; `setGlobalState(prev => ({ ...prev, expanded: false }))`; `setWidgetResetKey(k => k + 1)`.

---

## SECTION 6 — Widget State

### CaptureWidget / useCaptureWidget state variables

- **pointers:** List of ticket/card items (StructuredFeedback[]). Set from `initialPointers`, from `loadSessionWithPointers.pointers` when that prop is set (extension), from pipeline onSuccess (new ticket), or cleared on end session / reset.
- **expandedId:** Ticket id whose card is expanded in the list. Set when user expands a card or clicks a marker; cleared on pause and in some flows.
- **highlightTicketId:** Temporary highlight after a new ticket is created. Set then cleared after timeout.
- **editingId:** Ticket id currently in edit mode. Set/cleared by user.
- **sessionMode:** True when the widget should show the session overlay (click-to-capture). Set when `globalSessionModeActive && sessionId` or when `globalSessionModeActive && loadSessionWithPointers`; cleared when `globalSessionModeActive === false`.
- **sessionPaused:** Drives "Session paused" vs "Session started" in the recorder bar. Synced from `globalSessionPaused` when in extension mode and session is active.

### How each state changes during capture / pause / resume / end

- **Capture (session mode):** User clicks element → sessionFeedbackPending set → voice/text submit → onComplete (sessionMode: true) → onSuccess → setPointers(prev => [newTicket, ...prev]), setHighlightTicketId, clear sessionFeedbackPending. sessionMode stays true; sessionPaused unchanged.
- **Pause:** User clicks Pause → content sends ECHLY_SESSION_MODE_PAUSE → background sets sessionPaused=true, broadcasts → content setGlobalState → widget gets globalSessionPaused=true → useCaptureWidget effect sets sessionPaused(true), setPausePending(false), setExpandedId(null), setHighlightTicketId(null).
- **Resume:** User clicks Resume → content sends ECHLY_SESSION_MODE_RESUME → background sets sessionPaused=false, broadcasts → widget gets globalSessionPaused=false → useCaptureWidget effect sets sessionPaused(false).
- **End:** User clicks End → widget calls onSessionModeEnd → content sends ECHLY_OPEN_TAB (dashboard URL if sessionId present) and ECHLY_SESSION_MODE_END → background clears activeSessionId, sessionId, sessionModeActive, sessionPaused; persists; broadcasts. Content receives ECHLY_GLOBAL_STATE with sessionId=null, sessionModeActive=false → setGlobalState. Widget receives globalSessionModeActive=false → useCaptureWidget effect: setSessionMode(false), setSessionPaused(false), clear pending/timeouts, removeCaptureRoot(), removeAllMarkers(). Content onSessionEnd callback: setSessionIdOverride(null). loadSessionWithPointers is not cleared by this path (only by ECHLY_RESET_WIDGET or onSessionLoaded); but widget remount is not triggered by end, so pointers in widget may remain until next open/reset.

---

## SECTION 7 — Session Lifecycle

### Start Session

1. User clicks "Start New Feedback Session" in widget.
2. useCaptureWidget `startSession`: if extensionMode, calls `onCreateSession()` then `onActiveSessionChange(session.id)` then `onSessionModeStart?.()`.
3. Content: createSession() → apiFetch POST /api/sessions → get session id; onActiveSessionChange → chrome.runtime.sendMessage(ECHLY_SET_ACTIVE_SESSION, sessionId); setSessionIdOverride(newSessionId); onSessionModeStart → chrome.runtime.sendMessage(ECHLY_SESSION_MODE_START).
4. Background: ECHLY_SET_ACTIVE_SESSION sets activeSessionId, globalUIState.sessionId, sessionModeActive=true, sessionPaused=false, persists, broadcastUIState(). ECHLY_SESSION_MODE_START sets sessionModeActive=true, sessionPaused=false, globalUIState.sessionId=activeSessionId, persist, broadcast.
5. Widget: useCaptureWidget effect sees globalSessionModeActive && sessionId → setSessionMode(true), createCaptureRoot(); another effect sees loadSessionWithPointers (not set for "start new") but globalSessionModeActive true and sessionId set → can set sessionMode true and create overlay. Recorder bar appears; user can click elements to add feedback.

### Resume Session

1. User clicks "Resume" (or picks session from modal). Content onResumeSessionSelect(sessionId): sendMessage(ECHLY_SET_ACTIVE_SESSION, sessionId); setSessionIdOverride(sessionId); apiFetch GET /api/feedback?sessionId=...&limit=50; setLoadSessionWithPointers({ sessionId, pointers }); sendMessage(ECHLY_SESSION_MODE_START); optionally ECHLY_OPEN_TAB(session URL).
2. Background: ECHLY_SET_ACTIVE_SESSION and ECHLY_SESSION_MODE_START as above; broadcast.
3. Widget: loadSessionWithPointers effect → setPointers(pointers), onSessionLoaded() (content clears loadSessionWithPointers); globalSessionModeActive effect → setSessionMode(true), setSessionPaused(globalSessionPaused). CaptureWidget effect → setShowCommandScreen(false). Overlay and ticket list show.

### Pause Session

1. User clicks Pause in recorder bar. Widget handlers.pauseSession() → (after optional pipeline wait) onSessionModePause?.().
2. Content: sendMessage(ECHLY_SESSION_MODE_PAUSE).
3. Background: sessionModeActive=true, sessionPaused=true, globalUIState.sessionId=activeSessionId, persist, broadcast.
4. All tabs receive ECHLY_GLOBAL_STATE with sessionPaused=true. Widget effect sets sessionPaused(true), setPausePending(false), setExpandedId(null), setHighlightTicketId(null).

### End Session

1. User clicks End. Widget handlers.endSession(afterEnd) → (after optional pipeline wait) onSessionModeEnd?.(); afterEnd sets setShowCommandScreen(true), onSessionEndCallback() (content setSessionIdOverride(null)).
2. Content: if globalState.sessionId, sendMessage(ECHLY_OPEN_TAB, dashboard URL); sendMessage(ECHLY_SESSION_MODE_END).
3. Background: activeSessionId=null, globalUIState.sessionId=null, sessionModeActive=false, sessionPaused=false, persist, broadcast.
4. All tabs: receive ECHLY_GLOBAL_STATE; setGlobalState clears session state. Widget effect with globalSessionModeActive=false runs: setSessionMode(false), removeCaptureRoot, removeAllMarkers, etc. Other tabs that never receive the message (e.g. no content script) keep showing old UI until they next get state (e.g. on tab switch).

---

## SECTION 8 — Session Card Loading

### setPointers (useCaptureWidget)

- **Where:** `components/CaptureWidget/hooks/useCaptureWidget.ts`. `const [pointers, setPointers] = useState<StructuredFeedback[]>(initialPointers ?? [])`.
- **When set:**
  1. **Initial/load:** If `initialPointers != null`, effect sets pointers to that. In extension, when `loadSessionWithPointers` is set, effect runs: `setPointers(loadSessionWithPointers.pointers ?? [])` and `onSessionLoaded?.()`.
  2. **New ticket:** Pipeline onSuccess (and session feedback onSuccess) calls `setPointers(prev => [{ id, title, actionSteps, type }, ...prev])`.
  3. **Delete:** deletePointer → onDelete then `setPointers(prev => prev.filter(p => p.id !== id))`.
  4. **Edit:** saveEdit / updatePointer update the matching item in pointers.
  5. **End session / reset:** endSession finalizeEnd calls setPointers([]); resetSession calls setPointers([]).

### loadSessionWithPointers (content → widget)

- **When set:** Only in `onResumeSessionSelect` in content.tsx: after fetching feedback, `setLoadSessionWithPointers({ sessionId, pointers })`. pointers come from `apiFetch(\`/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=50\`)` then `(json.feedback ?? []).map(...)`.
- **API endpoint:** GET `/api/feedback?sessionId=<id>&limit=50`. Implemented by the web app backend; content calls it via `apiFetch` (contentAuthFetch → background `echly-api` with token).
- **Why some sessions load empty trays:** (1) **Limit 50:** Sessions with more than 50 feedback items only load the first 50. (2) **API/network error:** On catch, content sets `setLoadSessionWithPointers({ sessionId, pointers: [] })`, so the tray shows empty. (3) **Wrong sessionId:** If effectiveSessionId or the passed sessionId is wrong or not authorized, the API may return empty or fail.

---

## SECTION 9 — Cross-Tab Synchronization

### Whether content receives ECHLY_GLOBAL_STATE

- **Intended:** Yes. Background calls `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })` for every tab (in broadcast) and for the active tab on activation and for the new tab on creation.
- **Failure cases:** (1) Tab where content script is not loaded (e.g. chrome://, extension pages, or tab created before injection): sendMessage fails and is ignored, so that tab never gets updates. (2) Tab that hasn’t loaded the listener yet: the first broadcast could race with `ensureMessageListener`; once the listener is registered, later broadcasts work.

### Whether React state updates correctly

- When the message is received, the listener dispatches a CustomEvent and optionally calls `__ECHLY_APPLY_GLOBAL_STATE__`. ContentApp listens for the CustomEvent and calls `setGlobalState(s)`. So React state should update. A possible issue is **ignoreNextGlobalState**: if ECHLY_RESET_WIDGET runs and the next event is ECHLY_GLOBAL_STATE, the ContentApp handler for the CustomEvent may skip the update once (ignoreNextGlobalState.current = true was set by the reset handler). So one broadcast can be dropped after a reset.

### Whether sessionId conflicts exist

- **activeSessionId** (background) is the single persisted "active session". **sessionIdOverride** (content, per tab) overrides what the widget uses in that tab: `effectiveSessionId = sessionIdOverride ?? globalState.sessionId`. So in one tab the user can have sessionIdOverride set (e.g. from Resume), while globalState.sessionId might be the same or different. When ECHLY_SESSION_MODE_END runs, background clears globalState.sessionId and broadcasts; content sets globalState from that, but sessionIdOverride is only cleared in the tab that called onSessionEnd (setSessionIdOverride(null)). So in other tabs, sessionIdOverride remains whatever it was (often null). So no direct "conflict" in the sense of two IDs fighting; the main issue is that **on widget open we clear activeSessionId in background**, so all tabs see sessionId=null and Resume cannot show the last session.

---

## SECTION 10 — Session ID Ownership

| Name | Location | Meaning |
|------|----------|--------|
| **globalState.sessionId** | content.tsx (ContentApp React state) | Copy of background’s sessionId from last ECHLY_GLOBAL_STATE (or ECHLY_GET_GLOBAL_STATE). |
| **effectiveSessionId** | content.tsx | `sessionIdOverride ?? globalState.sessionId`. Used for API and as widget sessionId prop. |
| **activeSessionId** | background.ts (module) | Background’s current session; persisted in storage; mirrored to globalUIState.sessionId. |
| **storedSessionId** | — | Not a variable name; "stored" refers to chrome.storage.local `activeSessionId`. |
| **currentSessionIdRef** | — | Not present in codebase. |
| **lastActiveSessionId** | — | Not present in codebase. |
| **sessionIdOverride** | content.tsx (ContentApp) | Per-tab override set when user selects a session (dashboard or Resume); cleared on session end in that tab and on beforeunload. |

**Interaction:** Background owns `activeSessionId` and broadcasts it as `globalUIState.sessionId`. Content receives that into `globalState.sessionId`. Content can override with `sessionIdOverride` so that `effectiveSessionId` is that override when set. When the user opens the widget (ECHLY_TOGGLE_VISIBILITY with visible→true), background sets `activeSessionId = null` and `globalUIState.sessionId = null` and broadcasts, so all tabs see no session and the Resume button has no "stored" session to bind to.

---

## SECTION 11 — UI State Machine

High-level widget UI states and transitions:

1. **Command screen** — Initial view: three buttons (Start New, Resume, Open Previous). Shown when `showCommandScreen` is true and no session overlay. `showCommandScreen` is set true on session end (onSessionEnd callback) and by CaptureHeader "Show command screen"; set false when `loadSessionWithPointers?.sessionId` is set (user resumed).
2. **Session active (recorder bar)** — Session overlay visible; "Session started" with Pause/End. Reached when globalSessionModeActive && (sessionId or loadSessionWithPointers); useCaptureWidget sets sessionMode true and createCaptureRoot.
3. **Session paused** — Same overlay; "Session paused" with Resume/End. globalSessionPaused true.
4. **Capture mode** — focus_mode, region_selecting, voice_listening, processing. Shown when user is in a capture flow (Add feedback or session click + voice).
5. **Ticket list** — Sidebar open with list of pointers. Shown when effectiveIsOpen && showSidebar (and not in capture flow and not in session overlay only).
6. **Ticket edit mode** — One card in edit (editingId set). Entered by user; exit by save or cancel.

**Transitions:** Command screen → (Start New / Resume / Open Previous) → session active or ticket list. Session active ↔ Session paused via Pause/Resume. Session active → End → Command screen (and content clears sessionIdOverride). Capture mode can be entered from sidebar or from session overlay; exit to idle and optionally close overlay. Ticket list visibility follows expanded state and capture state.

---

## SECTION 12 — Race Conditions

### ECHLY_RESET_WIDGET vs ECHLY_GLOBAL_STATE

- **Sequence on widget open:** Background handles ECHLY_TOGGLE_VISIBILITY: clears session state, then sends ECHLY_RESET_WIDGET to all tabs, then calls broadcastUIState(). So order is: ECHLY_RESET_WIDGET, then ECHLY_GLOBAL_STATE. Content handles RESET: sets ignoreNextGlobalState = true, clears loadSessionWithPointers, increments widgetResetKey (remount), sets expanded false. Then content receives ECHLY_GLOBAL_STATE. If the CustomEvent for ECHLY_GLOBAL_STATE is handled and ignoreNextGlobalState is true, ContentApp skips setGlobalState once and sets ignoreNextGlobalState = false. So the first global state after reset can be dropped. That state has sessionId=null anyway (we just cleared it), so the main effect is that one broadcast might not apply; the next one (e.g. on tab activation) would.

### ECHLY_GLOBAL_STATE vs session restoration

- Content does **not** have an effect that "restores" session by fetching feedback when globalState.sessionModeActive && globalState.sessionId. So there is no race of "restore effect vs broadcast". The only "restore" is explicit Resume (loadSessionWithPointers).

### Pointer updates vs ECHLY_FEEDBACK_CREATED

- When feedback is created via the content pipeline, the tab that submitted gets onSuccess and updates pointers locally. When feedback is created via background (ECHLY_PROCESS_FEEDBACK), background broadcasts ECHLY_FEEDBACK_CREATED; content only dispatches a CustomEvent. **No component in the extension subscribes to ECHLY_FEEDBACK_CREATED to update pointers or highlight.** So other tabs never add the new ticket; the only tab that has it is the one that ran the content path and got onSuccess. So there is no race between two updaters; the issue is missing subscriber.

---

## SECTION 13 — Root Cause Analysis

### 1. Session not syncing across tabs

- **Cause:** (1) **Broadcast failures ignored:** `chrome.tabs.sendMessage(tab.id, ...).catch(() => {})` hides errors. Tabs without a loaded content script (e.g. chrome://, or tab just created) never get ECHLY_GLOBAL_STATE. (2) **New tab timing:** On tab creation, background sends ECHLY_GLOBAL_STATE immediately; content script may not be injected yet, so the message fails. That tab only gets state when the user activates it (onActivated sends again).
- **File:** `echly-extension/src/background.ts` (broadcastUIState, onCreated).
- **Function:** `broadcastUIState`, `chrome.tabs.onCreated` listener.
- **Condition:** Any tab where sendMessage fails (no listener or not yet injected).

### 2. Session ending not reflected in other tabs

- **Cause:** Same as (1): if a tab never receives ECHLY_GLOBAL_STATE (e.g. content script not loaded or message failed), it never updates globalState and keeps showing old sessionModeActive/sessionId. Also, after ECHLY_RESET_WIDGET, ContentApp’s handler sets ignoreNextGlobalState so the next ECHLY_GLOBAL_STATE can be skipped—if that was the "session ended" state, that tab would keep old state until the next broadcast.
- **File:** `echly-extension/src/background.ts` (broadcast), `echly-extension/src/content.tsx` (ignoreNextGlobalState in ECHLY_RESET_WIDGET handler).
- **Function:** broadcastUIState; ContentApp window listener for ECHLY_RESET_WIDGET and ECHLY_GLOBAL_STATE.
- **Condition:** Tab doesn’t receive ECHLY_GLOBAL_STATE, or receives it but ECHLY_GLOBAL_STATE is skipped due to ignoreNextGlobalState.

### 3. Session cards not updating (in other tabs)

- **Cause:** Background broadcasts ECHLY_FEEDBACK_CREATED to all tabs after creating a ticket (e.g. via ECHLY_PROCESS_FEEDBACK). Content script only dispatches a CustomEvent "ECHLY_FEEDBACK_CREATED"; no React component in the extension listens for that event to call setPointers or add the ticket to the list. So only the tab that created the ticket (and got onSuccess from the content pipeline) shows the new card; other tabs do not.
- **File:** `echly-extension/src/content.tsx` (message listener dispatches event only; no subscriber that updates pointers).
- **Function:** ensureMessageListener (dispatches ECHLY_FEEDBACK_CREATED); ContentApp/CaptureWidget do not subscribe to ECHLY_FEEDBACK_CREATED to update pointers.
- **Condition:** Ticket created (especially via background path); any tab other than the one that submitted and got onSuccess.

### 4. Previous sessions loading incomplete data

- **Cause:** (1) **Hard limit 50:** Content fetches `/api/feedback?sessionId=...&limit=50`. Sessions with more than 50 items only load the first 50. (2) **Error path:** If the request fails, content sets `setLoadSessionWithPointers({ sessionId, pointers: [] })`, so the tray is empty.
- **File:** `echly-extension/src/content.tsx`.
- **Function:** onResumeSessionSelect (apiFetch GET /api/feedback?sessionId=...&limit=50).
- **Condition:** Session has >50 feedback items, or API/network error.

### 5. Resume button malfunction

- **Cause:** When the user opens the extension (clicks icon), popup calls ECHLY_TOGGLE_VISIBILITY. Background sets `globalUIState.visible = true` and then **explicitly clears** activeSessionId, sessionId, sessionModeActive, sessionPaused and persists null/false, then sends ECHLY_RESET_WIDGET and broadcasts. So the "most recent active session" is wiped on every widget open. The Resume button visibility is `showResumeButton = hasStoredSession = Boolean(sessionId)` where sessionId is the widget’s sessionId prop (effectiveSessionId). effectiveSessionId = sessionIdOverride ?? globalState.sessionId. After open, globalState.sessionId is null (we just broadcast it), and sessionIdOverride is null in tabs that didn’t resume. So the Resume button has no session to bind to and may not show or may show a stale override from that tab only.
- **File:** `echly-extension/src/background.ts`.
- **Function:** ECHLY_TOGGLE_VISIBILITY handler (when globalUIState.visible becomes true).
- **Condition:** User opens extension (toggle visibility to true); design intentionally clears session to "prevent automatic session restore," but it also removes the last active session so Resume cannot offer it.

---

## SECTION 14 — Output Report Summary

### System architecture (high level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Chrome Extension Contexts                          │
├─────────────────────────────────────────────────────────────────────────┤
│  POPUP (popup.html)          BACKGROUND (service worker)                   │
│  ┌─────────────────┐         ┌─────────────────────────────────────┐   │
│  │ PopupApp        │  msg     │ activeSessionId, globalUIState        │   │
│  │ - getAuthState  │ ──────► │ storage.local (activeSessionId,       │   │
│  │ - toggleVisibility       │   sessionModeActive, sessionPaused)   │   │
│  │ - startLogin    │         │ broadcastUIState() → all tabs         │   │
│  └────────┬────────┘         │ onActivated/onCreated → 1 tab         │   │
│           │                  └──────────────────┬────────────────────┘   │
│           │                                     │ sendMessage            │
│           │                                     ▼                         │
│  CONTENT (each tab)         ┌─────────────────────────────────────────┐  │
│  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ main(): host, mountReactApp(ContentApp), ensureMessageListener,   │  │  │
│  │         syncInitialGlobalState, ensureVisibilityStateRefresh     │  │  │
│  │ ContentApp: globalState, sessionIdOverride, loadSessionWithPointers│  │  │
│  │   effectiveSessionId = sessionIdOverride ?? globalState.sessionId │  │  │
│  │   CaptureWidget(sessionId=effectiveSessionId, globalSessionModeActive, ...) │
│  │ useCaptureWidget: pointers, sessionMode, sessionPaused, ...       │  │  │
│  └─────────────────────────────────────────────────────────────────┘  │  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Message flow (session end → other tabs)

```
Tab A (user clicks End)
  → onSessionModeEnd()
  → sendMessage(ECHLY_OPEN_TAB, url), sendMessage(ECHLY_SESSION_MODE_END)
Background
  → activeSessionId = null, globalUIState.sessionId = null, sessionModeActive = false, sessionPaused = false
  → chrome.storage.local.set(...)
  → broadcastUIState() → chrome.tabs.sendMessage(every tab, ECHLY_GLOBAL_STATE)
Tab B, C, ...
  → onMessage(ECHLY_GLOBAL_STATE) → setHostVisibility, __ECHLY_APPLY_GLOBAL_STATE__?, dispatch CustomEvent
  → ContentApp listener → setGlobalState(state) [unless ignoreNextGlobalState]
  → CaptureWidget props globalSessionModeActive=false, globalSessionPaused=false
  → useCaptureWidget effect → setSessionMode(false), removeCaptureRoot, ...
```

### Widget state machine (simplified)

```
[Command screen]  ←── End session ── [Session active] ←→ [Session paused]
       │                   ▲                │                    │
       │ Start/Resume      │                │ Pause              │ Resume
       │ Open Previous     │                ▼                    │
       ▼                   │         [Capture mode] (focus_mode, region_selecting,
[Session active] ──────────┘          voice_listening, processing)
       │
       │ loadSessionWithPointers set
       ▼
[Ticket list] (sidebar + pointers)
       │
       │ expand card / edit
       ▼
[Ticket edit mode]
```

### Session lifecycle (messages)

```
Start:  ECHLY_SET_ACTIVE_SESSION(sessionId) → ECHLY_SESSION_MODE_START
Resume: ECHLY_SET_ACTIVE_SESSION(sessionId) → (fetch feedback) → setLoadSessionWithPointers → ECHLY_SESSION_MODE_START
Pause:  ECHLY_SESSION_MODE_PAUSE
Resume: ECHLY_SESSION_MODE_RESUME
End:    ECHLY_OPEN_TAB(dashboard URL) → ECHLY_SESSION_MODE_END
        → background clears activeSessionId, sessionId, sessionModeActive, sessionPaused; persist; broadcast
```

### Root causes (concise)

| # | Symptom | Root cause |
|---|---------|------------|
| 1 | Session not syncing across tabs | broadcastUIState() sendMessage failures are ignored; some tabs (no content script or not yet injected) never get ECHLY_GLOBAL_STATE. |
| 2 | Session end not reflected in other tabs | Same: tabs that don’t receive ECHLY_GLOBAL_STATE keep old state; optionally one broadcast dropped after ECHLY_RESET_WIDGET (ignoreNextGlobalState). |
| 3 | Session cards not updating in other tabs | ECHLY_FEEDBACK_CREATED is only dispatched as CustomEvent; no listener in the extension adds the ticket to pointers in other tabs. |
| 4 | Previous sessions load incomplete | limit=50 on GET /api/feedback; on error content sets pointers to []. |
| 5 | Resume button wrong / missing | ECHLY_TOGGLE_VISIBILITY (on widget open) clears activeSessionId and globalUIState.sessionId and persists; so there is no "last session" for Resume to bind to. |

### Recommended minimal fixes

1. **Resume button / last session:** In ECHLY_TOGGLE_VISIBILITY, when making the widget visible, do **not** clear `activeSessionId` or `globalUIState.sessionId`. Only clear `sessionModeActive` and `sessionPaused` (and optionally send ECHLY_RESET_WIDGET so the widget shows the command screen without clearing the stored session). Persist so that `activeSessionId` remains for the Resume button. Optionally, have content or widget call ECHLY_GET_ACTIVE_SESSION when showing the command screen so Resume can use it if UI state was ever out of sync.

2. **Cards in other tabs:** In content (ContentApp) or in a wrapper that has access to setPointers, subscribe to the CustomEvent "ECHLY_FEEDBACK_CREATED". In the handler, if detail.sessionId matches effectiveSessionId (or current globalState.sessionId), add detail.ticket to the widget’s pointers (e.g. via a callback from ContentApp to CaptureWidget, or by storing pointers in content and passing down). Ensure only one source updates pointers (e.g. don’t double-add if the same tab also got onSuccess).

3. **Cross-tab sync reliability:** (a) On tab activation, always send ECHLY_GLOBAL_STATE (already done). (b) When document becomes visible, content already re-requests ECHLY_GET_GLOBAL_STATE; keep that. (c) Optionally log or handle sendMessage failures in broadcastUIState instead of swallowing them, so that restricted tabs are known. (d) Consider not skipping the next ECHLY_GLOBAL_STATE after ECHLY_RESET_WIDGET (or only skip if the state is redundant), so that the "session ended" broadcast is never dropped.

4. **Incomplete session load:** (a) Increase limit (e.g. 100 or 200) or paginate when loading session feedback. (b) On fetch error, show an error state instead of setting pointers to [] so the user knows the load failed.

5. **Session ID ownership:** Keep a single source of truth in the background (activeSessionId). Ensure ECHLY_TOGGLE_VISIBILITY does not clear it if the goal is to show "Resume last session." Document that sessionIdOverride in content is a per-tab override for "session I’m viewing" and is cleared on session end in that tab.

---

*End of report. No code was modified; this document is diagnostic only.*
