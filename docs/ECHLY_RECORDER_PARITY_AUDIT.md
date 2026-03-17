# ECHLY Full Recorder Parity Audit

**Goal:** Identify why the dashboard recorder is not identical to the extension recorder and what is required to make it a 100% functional copy.

**Scope:** Analysis only. No code modifications.

---

## SECTION 1 — Extension Recorder Architecture

### Entry point

- **File:** `echly-extension/src/content.tsx`
- **Flow:** Content script runs when injected (e.g. when user clicks extension icon). `main()` runs once (`window.__ECHLY_WIDGET_LOADED__` guard), creates `#echly-shadow-host`, waits for `document.body`, then:
  1. Appends host to `document.body`
  2. `mountReactApp(host)` → attaches shadow root, injects styles, creates `#echly-root` inside shadow DOM, runs `createRoot(container).render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />)`
  3. `ensureMessageListener(host)` → registers `chrome.runtime.onMessage` for `ECHLY_GLOBAL_STATE`, `ECHLY_START_SESSION`, `ECHLY_OPEN_PREVIOUS_SESSIONS`, etc.
  4. Requests initial global state via `ECHLY_GET_GLOBAL_STATE` and applies visibility

### ContentApp

- **Component:** `ContentApp` in `content.tsx` (same file)
- **State:** Holds `globalState` (from background: `visible`, `expanded`, `sessionId`, `sessionModeActive`, `sessionPaused`, `pointers`, `captureMode`, etc.), `theme`, `hasPreviousSessions`, `openResumeModalFromMessage`, `sessionLimitReached`, `feedbackJobs`, auth state, clarity-assistant state.
- **Sync:** `globalState` is **only** derived from background:
  - Listeners: `ECHLY_GLOBAL_STATE` custom event (from message listener), `ECHLY_START_SESSION_REQUEST`, `ECHLY_OPEN_PREVIOUS_SESSIONS`, `ECHLY_RESET_WIDGET`, etc.
  - On mount and tab visibility: `ECHLY_GET_GLOBAL_STATE` → normalize → dispatch `ECHLY_GLOBAL_STATE` so React applies state.
- **Session creation:** `createSession()` calls `apiFetch("/api/sessions", { method: "POST" })`; on success returns `{ id }`; on 403 PLAN_LIMIT_REACHED returns `{ limitReached, message, upgradePlan }`.
- **Environment:** Instantiates `ExtensionCaptureEnvironment` with `createSession`, `authenticatedFetch: apiFetch`, `notifyFeedbackCreated` (sends `ECHLY_FEEDBACK_CREATED` to background).

### How the widget mounts

1. **Host:** `#echly-shadow-host` (fixed, bottom-right, z-index 2147483647), default `display: none`, `pointer-events: none`, `visibility: hidden`.
2. **Visibility:** Driven by `setHostVisibilityFromState(globalState)` → `getShouldShowTray(state)` = `state.visible === true || state.sessionModeActive === true || state.sessionPaused === true`.
3. **React tree:** `ContentApp` → (optional clarity assistant overlay) → **CaptureWidget** with full extension props (see Section 4).

### State flow to CaptureWidget

- **Session ID:** `effectiveSessionId` = `globalState.sessionId` (from background).
- **Pointers:** `globalState.pointers` (from background; content also calls `notifyFeedbackCreated` so background adds to `pointers` and broadcasts).
- **Expanded:** `globalState.expanded` (background sets on expand/collapse messages).
- **Session mode:** `globalState.sessionModeActive`, `globalState.sessionPaused` (background sets on ECHLY_SESSION_MODE_*).
- **Capture mode:** `globalState.captureMode` (background sets on ECHLY_SET_CAPTURE_MODE).

### WidgetFooter and Start / Previous Sessions

- **WidgetFooter** is rendered inside **CaptureWidget** when `!sessionLimitReached && showHomeScreen`.
- **showHomeScreen** = `!sessionModeActive` = `!(globalSessionModeActive === true || globalSessionPaused === true)`.
- In extension mode, WidgetFooter shows two buttons:
  - **Start Session:** `onClick` → `onStartSession`. In CaptureWidget, `onStartSession` is set to a function that calls `chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" })` when `extensionMode` is true (see Section 2).
  - **Previous Sessions:** `onClick` → `onOpenPreviousSession`. In CaptureWidget, `onOpenPreviousSession` = `handlePreviousSessions` when `extensionMode && showPreviousButton && fetchSessions && onPreviousSessionSelect`. `handlePreviousSessions` opens the resume modal and sends `ECHLY_OPEN_PREVIOUS_SESSIONS` to background.

### Extension recorder pipeline (diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKGROUND (background.js)                                                 │
│  - Holds global state: sessionId, sessionModeActive, sessionPaused,        │
│    pointers, captureMode, visible, expanded                                  │
│  - Listens: ECHLY_START_SESSION, ECHLY_OPEN_PREVIOUS_SESSIONS,              │
│    ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_*, ECHLY_SET_CAPTURE_MODE    │
│  - Broadcasts: ECHLY_GLOBAL_STATE to all tabs                                │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ chrome.tabs.sendMessage(activeTab, ...)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTENT (content.tsx)                                                       │
│  - ensureMessageListener: receives ECHLY_GLOBAL_STATE, ECHLY_START_SESSION,  │
│    ECHLY_OPEN_PREVIOUS_SESSIONS → dispatch CustomEvents                      │
│  - ContentApp: useState(globalState) ← ECHLY_GLOBAL_STATE events             │
│  - ContentApp: ECHLY_START_SESSION_REQUEST → createSession() →              │
│    onActiveSessionChange(id) → ECHLY_SESSION_MODE_START → onExpandRequest()  │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ props
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CaptureWidget (lib/capture-engine/core/CaptureWidget.tsx)                    │
│  - useCaptureWidget(sessionId, pointers, globalSessionModeActive,            │
│    onSessionModeStart, ..., environment)                                     │
│  - extensionMode=true → WidgetFooter: Start Session / Previous Sessions      │
│  - Start Session click → chrome.runtime.sendMessage(ECHLY_START_SESSION)     │
│  - Previous Sessions click → handlePreviousSessions (modal + message)        │
│  - Voice/Write tiles → setMode() → chrome.runtime.sendMessage(ECHLY_SET_    │
│    CAPTURE_MODE)                                                             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  WidgetFooter (lib/capture-engine/core/WidgetFooter.tsx)                     │
│  - extensionMode: two buttons [Start Session] [Previous Sessions]             │
│  - onStartSession, onOpenPreviousSession from CaptureWidget                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 2 — Extension Event Handlers

### Start Session

| Item | Detail |
|------|--------|
| **Handler name** | In CaptureWidget: `onStartSession` passed to WidgetFooter. When `extensionMode` is true it is the inline: `() => { if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) { chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" }); } }` |
| **File** | `lib/capture-engine/core/CaptureWidget.tsx` (lines 357–364) |
| **What it calls** | `chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" })` only. No direct call to `handlers.startSession` in extension mode. |
| **Background** | background.js: on `ECHLY_START_SESSION` → `chrome.tabs.query(activeTab)` → `chrome.tabs.sendMessage(t[0].id, { type: "ECHLY_START_SESSION" })`. |
| **Content** | content.tsx message listener: on `ECHLY_START_SESSION` → `window.dispatchEvent(new CustomEvent("ECHLY_START_SESSION_REQUEST"))`. ContentApp effect: on `ECHLY_START_SESSION_REQUEST` → `createSession()` → on success `onActiveSessionChange(result.id)` + `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" })` + `onExpandRequest()`. |

### Previous Sessions

| Item | Detail |
|------|--------|
| **Handler name** | `handlePreviousSessions` in CaptureWidget, passed as `onOpenPreviousSession` to WidgetFooter. |
| **File** | `lib/capture-engine/core/CaptureWidget.tsx` (lines 186–195, 362–366, 488–491) |
| **What it does** | Sets `setOpeningPrevious(true)`, `setResumeModalOpen(true)`, then `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })`. |
| **chrome.runtime.sendMessage** | Yes: `ECHLY_OPEN_PREVIOUS_SESSIONS` (to notify background; content also listens for this message to open modal from other triggers). |
| **Condition** | `onOpenPreviousSession` is only passed when `extensionMode && showPreviousButton && fetchSessions && onPreviousSessionSelect`. `showPreviousButton` = `Boolean(hasPreviousSessions)`. So if `hasPreviousSessions` is false (e.g. not passed), the button is not wired. |

### Voice (mode tile)

| Item | Detail |
|------|--------|
| **Handler name** | Voice tile `onClick` / `onKeyDown`: if `captureMode !== "voice"` then `setMode("voice")`, else `setMicDropdownOpen(true)`. |
| **setMode** | `function setMode(mode: "voice" \| "text") { if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) { chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode }); } }` |
| **File** | `lib/capture-engine/core/CaptureWidget.tsx` (lines 202–206, 411–421) |
| **What it calls** | Only `chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode })`. |
| **Background** | background.js: `ECHLY_SET_CAPTURE_MODE` → sets `i.captureMode = t`, `a.captureMode = t`, `o()` (broadcast ECHLY_GLOBAL_STATE). Content receives new state and passes `captureMode={globalState.captureMode}` to CaptureWidget. |

### Write (mode tile)

| Item | Detail |
|------|--------|
| **Handler name** | Write tile `onClick` / `onKeyDown`: `setMode("text")`. |
| **File** | Same as Voice; `setMode("text")`. |
| **What it calls** | Same: `chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode: "text" })`. |

---

## SECTION 3 — Extension Session Lifecycle

### createSession

- **Trigger:** Not by a direct user click in the widget. Triggered when content receives **ECHLY_START_SESSION** from background and dispatches **ECHLY_START_SESSION_REQUEST**; ContentApp’s effect then runs and calls `createSession()`.
- **Component:** ContentApp in `content.tsx` (local function `createSession()`, line ~556).
- **Implementation:** `apiFetch("/api/sessions", { method: "POST", ... })` → returns `{ id }` or `{ limitReached, message, upgradePlan }` or null.

### ECHLY_SET_ACTIVE_SESSION

- **Trigger:** After successful `createSession()` in content: `onActiveSessionChange(result.id)` which does `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId })`. Also when user selects a session in Previous Sessions: `onPreviousSessionSelect(sessionId)` → same message.
- **Component:** ContentApp (`onActiveSessionChange`) and CaptureWidget’s `onPreviousSessionSelect` callback from ContentApp.
- **Background:** Sets `d = sessionId`, `i.sessionId`, `i.sessionModeActive = true`, loads feedback and session title, broadcasts state.

### ECHLY_SESSION_MODE_START

- **Trigger:** ContentApp after createSession success: `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" })`. Also when selecting a previous session: `onPreviousSessionSelect` sends it.
- **Component:** ContentApp.
- **Background:** Sets `i.sessionModeActive = true`, `i.sessionPaused = false`, `i.sessionId = d`, persists, broadcasts. useCaptureWidget in CaptureWidget sees `globalSessionModeActive === true` → creates capture root, sets session mode, shows session overlay.

### ECHLY_SESSION_ACTIVITY

- **Trigger:** useCaptureWidget’s `handleSessionElementClicked` calls `onSessionActivity?.()`. In extension, ContentApp passes `onSessionActivity={() => chrome.runtime.sendMessage({ type: "ECHLY_SESSION_ACTIVITY" })}`.
- **Component:** CaptureWidget (handlers from useCaptureWidget) → environment/callback from ContentApp.
- **Background:** Resets 30-minute idle timeout (`k()`).

### ECHLY_SESSION_MODE_END

- **Trigger:** User ends session in CaptureLayer/SessionOverlay → `handlers.endSession()` → `onSessionModeEnd?.()`. ContentApp passes `onSessionModeEnd` that sends `ECHLY_SESSION_MODE_END` then optionally opens dashboard tab.
- **Component:** CaptureWidget → ContentApp callback.
- **Background:** Clears session, sets sessionModeActive false, broadcasts, sends ECHLY_RESET_WIDGET to all tabs.

---

## SECTION 4 — Extension Widget Props

Exact props passed to **CaptureWidget** inside ContentApp (`content.tsx` ~lines 876–932):

| Prop name | Type | Purpose |
|-----------|------|---------|
| key | number | widgetResetKey (reset on ECHLY_RESET_WIDGET) |
| sessionId | string | effectiveSessionId ?? "" |
| userId | string | user.uid |
| extensionMode | boolean | true |
| captureMode | "voice" \| "text" | globalState.captureMode ?? "voice" |
| onComplete | function | handleComplete (structure + feedback + notifyFeedbackCreated) |
| onDelete | function | handleDelete (apiFetch DELETE ticket) |
| onUpdate | function | handleUpdate (apiFetch PATCH + ECHLY_TICKET_UPDATED) |
| widgetToggleRef | ref | widgetToggleRef |
| onRecordingChange | function | sends START_RECORDING / STOP_RECORDING |
| expanded | boolean | globalState.expanded |
| onExpandRequest | function | chrome ECHLY_EXPAND_WIDGET |
| onCollapseRequest | function | chrome ECHLY_COLLAPSE_WIDGET, clear sessionLimitReached |
| captureDisabled | boolean | false |
| theme | "dark" \| "light" | theme |
| onThemeToggle | function | toggles theme, applyThemeToRoot |
| fetchSessions | function | apiFetch /api/sessions |
| hasPreviousSessions | boolean | from state (set when visible and /api/sessions?limit=1 has data) |
| onPreviousSessionSelect | function | ECHLY_SET_ACTIVE_SESSION + ECHLY_SESSION_MODE_START + optional ECHLY_OPEN_TAB |
| pointers | array | globalState.pointers ?? [] |
| sessionLoading | boolean | globalState.sessionLoading ?? false |
| sessionTitleProp | string | globalState.sessionTitle ?? undefined |
| onSessionTitleChange | function | PATCH session + ECHLY_SESSION_UPDATED |
| isProcessingFeedback | boolean | local state |
| feedbackJobs | array | local state (job queue) |
| onSessionEnd | function | () => {} |
| onCreateSession | function | createSession |
| onActiveSessionChange | function | chrome ECHLY_SET_ACTIVE_SESSION |
| ensureAuthenticated | function | chrome ECHLY_GET_AUTH_STATE / ECHLY_TRIGGER_LOGIN |
| verifySessionBeforeSessions | function | chrome ECHLY_VERIFY_DASHBOARD_SESSION |
| onTriggerLogin | function | chrome ECHLY_TRIGGER_LOGIN |
| globalSessionModeActive | boolean | globalState.sessionModeActive ?? false |
| globalSessionPaused | boolean | globalState.sessionPaused ?? false |
| onSessionModeStart | function | chrome ECHLY_SESSION_MODE_START |
| onSessionModePause | function | chrome ECHLY_SESSION_MODE_PAUSE |
| onSessionModeResume | function | chrome ECHLY_SESSION_MODE_RESUME |
| onSessionActivity | function | chrome ECHLY_SESSION_ACTIVITY |
| onSessionModeEnd | function | chrome ECHLY_SESSION_MODE_END + optional ECHLY_OPEN_TAB |
| captureRootParent | HTMLElement | widgetRoot (shadow root’s first child) |
| launcherLogoUrl | string | chrome.runtime.getURL("assets/Echly_logo_launcher.svg") |
| openResumeModal | boolean | openResumeModalFromMessage |
| onResumeModalClose | function | setOpenResumeModalFromMessage(false) |
| sessionLimitReached | object \| null | { message, upgradePlan } or null |
| environment | CaptureEnvironment | ExtensionCaptureEnvironment instance |

---

## SECTION 5 — Extension Widget State Machine (useCaptureWidget)

### States (CaptureState)

- **idle** — No capture; sidebar can show home (mode tiles + footer) or session list.
- **focus_mode** — Capture root created; dim overlay or region selection.
- **region_selecting** — User dragging region.
- **voice_listening** — Recording voice (Web Speech API).
- **processing** — Waiting for onComplete (structure + feedback).
- **success** — Brief success state.
- **cancelled** — User cancelled.
- **error** — e.g. mic permission denied.

### State transitions

| From | To | Controlled by |
|------|----|----------------|
| idle | focus_mode | startCapture() or handleAddFeedback() (dashboard “Capture feedback”); extension starts session via message, then overlay when sessionMode) |
| focus_mode | region_selecting | handleRegionSelectStart() (user starts drag in RegionCaptureOverlay) |
| region_selecting | voice_listening | handleRegionCaptured() → startListening() |
| voice_listening | processing | finishListening() (recognition stop, transcript length ≥ 5) |
| voice_listening | idle | finishListening() (transcript too short), or recognition onend (manual stop), or discardListening() |
| processing | idle | onComplete callbacks (onSuccess: removeCaptureRoot, restoreWidget; onError: setState("voice_listening")) |
| * | cancelled | handleCancelCapture(), discardListening() (Escape) |
| * | error | startListening() catch (mic denied), handleAddFeedback() catch |

### Functions controlling transitions

- **startCapture:** idle → focus_mode; creates capture root, setState("focus_mode"). Used by dashboard “Capture feedback”; extension uses session flow instead.
- **handleAddFeedback:** idle → focus_mode (and in non-extension continues to capture + startListening).
- **startSession:** (in useCaptureWidget) when not extensionMode uses environment.createSession(), setActiveSession, startSessionMode, onSessionViewRequested; when extensionMode uses onCreateSession, onActiveSessionChange, onSessionModeStart. In extension, Start Session button does **not** call startSession; it sends ECHLY_START_SESSION, and content runs createSession + callbacks.
- **createCaptureRoot / removeCaptureRoot:** When globalSessionModeActive is true (extension), createCaptureRoot; when false and extensionMode, removeCaptureRoot.
- **Sync from global state:** useEffect with [globalSessionModeActive, globalSessionPaused] sets sessionMode, sessionPaused, endPending, etc., and clears pending when session ends.

---

## SECTION 6 — Dashboard Recorder Architecture

### Host component

- **File:** `app/(app)/dashboard/components/DashboardCaptureHost.tsx`
- **Usage:** Dashboard page renders `<DashboardCaptureHost open={captureOpen} onClose={() => setCaptureOpen(false)} />`. `captureOpen` is toggled by “New Session” (e.g. SessionsHeader `onNewSession` → `setCaptureOpen(true)`).

### Mounting

1. **Condition:** Renders only when `mounted && open` (useEffect sets mounted true; open from props).
2. **Portal:** `createPortal(<div id="echly-dashboard-capture-root">...</div>, document.body)`.
3. **Container:** A single div fixed bottom-right (bottom: 24px, right: 24px, zIndex: 999999).
4. **Child:** One **CaptureWidget** with props listed below. No shadow DOM; no ContentApp; no background messaging.

### Props passed to CaptureWidget (dashboard)

| Prop | Value |
|------|--------|
| sessionId | sessionId (local state; set by createSession or onPreviousSessionSelect) |
| userId | "" |
| environment | useMemo CaptureEnvironment (see Section 8) |
| extensionMode | **true** |
| fetchSessions | authFetch("/api/sessions") → json.sessions |
| onPreviousSessionSelect | (id) => setSessionId(id) |
| onComplete | onComplete (structure-feedback + upload + api/feedback) |
| onDelete | authFetch DELETE /api/tickets/:id |
| expanded | open (prop) |
| onCollapseRequest | onClose (prop) |
| captureRootParent | document.body |

### Comparison with extension: missing or different props

| Prop | Extension | Dashboard | Note |
|------|-----------|-----------|------|
| sessionId | globalState.sessionId | Local sessionId | OK (different source) |
| userId | user.uid | "" | Missing real userId (optional for parity) |
| captureMode | globalState.captureMode | **Not passed** (default "voice") | **Missing:** no way to switch Voice/Write; setMode() only sends chrome message |
| onRecordingChange | START_RECORDING/STOP_RECORDING | **Not passed** | Optional |
| expanded | globalState.expanded | open | OK |
| onExpandRequest | ECHLY_EXPAND_WIDGET | **Not passed** | N/A (no launcher) |
| fetchSessions | apiFetch /api/sessions | authFetch /api/sessions | OK |
| hasPreviousSessions | Set from /api/sessions?limit=1 when visible | **Not passed** (default false) | **Missing:** Previous Sessions button not shown or not wired |
| onPreviousSessionSelect | ECHLY_SET_ACTIVE_SESSION + ECHLY_SESSION_MODE_START + open tab | setSessionId(id) only | **Incomplete:** no session mode start, no open tab |
| pointers | globalState.pointers | **Not passed** | **Missing:** list comes from useCaptureWidget loading by sessionId (non-extension path); extension never auto-loads by sessionId so this is different; dashboard should pass pointers or keep loading by sessionId |
| sessionLoading | globalState.sessionLoading | **Not passed** | **Missing** (default false) |
| sessionTitleProp | globalState.sessionTitle | **Not passed** | **Missing** |
| onSessionTitleChange | PATCH + ECHLY_SESSION_UPDATED | **Not passed** | **Missing** |
| onCreateSession | createSession | **Not passed** | **Missing:** Start Session in extension goes through message; dashboard must call createSession + setActiveSession + startSessionMode |
| onActiveSessionChange | ECHLY_SET_ACTIVE_SESSION | **Not passed** | **Missing:** dashboard should set sessionId (and any global state) |
| ensureAuthenticated | chrome auth check | **Not passed** | Dashboard assumed authenticated |
| verifySessionBeforeSessions | ECHLY_VERIFY_DASHBOARD_SESSION | **Not passed** | **Missing** for ResumeSessionModal |
| onTriggerLogin | ECHLY_TRIGGER_LOGIN | **Not passed** | **Missing** (modal “Open Login”) |
| globalSessionModeActive | globalState.sessionModeActive | **Not passed** (undefined) | **Critical:** always falsy → showHomeScreen always true, session overlay never shown, CaptureLayer returns null when extensionMode && (!sessionMode \|\| !sessionIdProp) |
| globalSessionPaused | globalState.sessionPaused | **Not passed** | **Missing** |
| onSessionModeStart | ECHLY_SESSION_MODE_START | **Not passed** | **Missing:** environment.startSessionMode is stub (no-op) |
| onSessionModePause | ECHLY_SESSION_MODE_PAUSE | **Not passed** | **Missing** |
| onSessionModeResume | ECHLY_SESSION_MODE_RESUME | **Not passed** | **Missing** |
| onSessionActivity | ECHLY_SESSION_ACTIVITY | **Not passed** | **Missing** (environment.reportActivity is no-op) |
| onSessionModeEnd | ECHLY_SESSION_MODE_END + open tab | **Not passed** | **Missing:** environment.endSessionMode only clears sessionId |
| launcherLogoUrl | extension URL | **Not passed** | N/A |
| openResumeModal | openResumeModalFromMessage | **Not passed** | **Missing** if we want message-driven open |
| onResumeModalClose | setOpenResumeModalFromMessage(false) | **Not passed** | **Missing** |
| sessionLimitReached | state | **Not passed** | **Missing** (createSession 403 not propagated to widget) |
| widgetToggleRef | ref | **Not passed** | N/A |
| onUpdate | handleUpdate | **Not passed** | Ticket edits use authFetch in useCaptureWidget |
| isProcessingFeedback | state | **Not passed** | **Missing** |
| feedbackJobs | state | **Not passed** | **Missing** |

---

## SECTION 7 — Dashboard Event Wiring

### Why “Start Session” does nothing

1. **WidgetFooter** receives `onStartSession` from CaptureWidget.
2. In **CaptureWidget** (lines 357–364), when `extensionMode` is true, `onStartSession` is set to:
   - `() => { if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) { chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" }); } }`
3. In the **dashboard** there is no `chrome.runtime`, so this function runs but does nothing (no message sent, no session created).
4. The **extension** flow is: click → background → content ECHLY_START_SESSION_REQUEST → ContentApp createSession() → onActiveSessionChange → ECHLY_SESSION_MODE_START. The dashboard never calls createSession or sets session mode from the button.

**Missing connection:** When extensionMode is true but chrome is unavailable (dashboard), CaptureWidget should use the same logic as non-extension: call `handlers.startSession` (which uses environment.createSession, environment.setActiveSession, environment.startSessionMode) and the host must provide `globalSessionModeActive === true` (and related state) so that the overlay and session UI appear. Currently the dashboard does not pass `onStartSession` that runs that flow, and does not maintain or pass `globalSessionModeActive`.

### Why “Previous Sessions” does nothing (or doesn’t show)

1. **onOpenPreviousSession** is only passed to WidgetFooter when `extensionMode && showPreviousButton && fetchSessions && onPreviousSessionSelect` (CaptureWidget lines 488–491).
2. **showPreviousButton** = `Boolean(hasPreviousSessions)`. Dashboard does **not** pass `hasPreviousSessions`; default is false, so **showPreviousButton is false** and **onOpenPreviousSession is undefined**.
3. WidgetFooter’s Previous Sessions button has `onClick={previousDisabled ? undefined : onOpenPreviousSession}`. So either the button is not shown (if WidgetFooter hides it when no handler) or it is disabled/does nothing. In WidgetFooter, when extensionMode both buttons are rendered; Previous uses onOpenPreviousSession. So the button is visible but onClick is undefined → **no-op**.
4. Even if we passed hasPreviousSessions true and wired the button, **handlePreviousSessions** does `setResumeModalOpen(true)` (which would work) and then `chrome.runtime.sendMessage("ECHLY_OPEN_PREVIOUS_SESSIONS")` (no-op on dashboard). So opening the modal would work if onOpenPreviousSession were passed; selecting a session would call onPreviousSessionSelect(id) which on dashboard only does setSessionId(id) and does not start “session mode” (overlay, etc.).

**Missing connections:**

- Pass **hasPreviousSessions** (e.g. from fetchSessions().length > 0 or a dedicated check).
- Ensure **onOpenPreviousSession** is the same handler (open modal); can be handlePreviousSessions without the chrome message, or a wrapper that only opens the modal.
- When user selects a session, **onPreviousSessionSelect** should also trigger the equivalent of session mode start (so overlay and session UI appear); dashboard needs local “session mode” state and pass globalSessionModeActive/globalSessionPaused.

### Why “Voice” / “Write” do nothing

1. Voice and Write tiles call **setMode("voice")** or **setMode("text")** (CaptureWidget lines 202–206, 411–421).
2. **setMode** only does `chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode })`. On the dashboard there is no chrome → **no-op**.
3. **captureMode** prop to CaptureWidget comes from the extension’s globalState (updated by background). Dashboard does not pass captureMode (default "voice") and has no state to update when the user clicks Voice/Write.

**Missing connections:**

- Dashboard (or CaptureWidget when environment is present and chrome is not) must maintain **captureMode** state (e.g. in DashboardCaptureHost) and pass it into CaptureWidget.
- When user clicks Voice or Write, either:
  - Call a callback passed from the host (e.g. onCaptureModeChange(mode)) and host updates captureMode state and passes it back, or
  - In CaptureWidget, when extensionMode and no chrome, call a new environment method (e.g. setCaptureMode(mode)) and/or use local state for captureMode when environment is provided and chrome is not.

---

## SECTION 8 — Capture Environment Adapter

### CaptureEnvironment interface (lib/capture-engine/CaptureEnvironment.ts)

All methods are defined in the interface. Below we mark implementation status for Extension vs Dashboard.

### ExtensionCaptureEnvironment (lib/capture-engine/ExtensionCaptureEnvironment.ts)

| Function | Implemented | Notes |
|----------|-------------|--------|
| createSession | Yes | Delegates to deps.createSession (content’s createSession) |
| authenticatedFetch | Yes | Delegates to deps.authenticatedFetch (apiFetch) |
| notifyFeedbackCreated | Yes | Sends ECHLY_FEEDBACK_CREATED |
| setActiveSession | Yes | chrome.runtime.sendMessage ECHLY_SET_ACTIVE_SESSION |
| startSessionMode | Yes | chrome.runtime.sendMessage ECHLY_SESSION_MODE_START |
| pauseSessionMode | Yes | chrome.runtime.sendMessage ECHLY_SESSION_MODE_PAUSE |
| resumeSessionMode | Yes | chrome.runtime.sendMessage ECHLY_SESSION_MODE_RESUME |
| endSessionMode | Yes | chrome.runtime.sendMessage ECHLY_SESSION_MODE_END |
| reportActivity | Yes | chrome.runtime.sendMessage ECHLY_SESSION_ACTIVITY |
| expandWidget | Yes | chrome.runtime.sendMessage ECHLY_EXPAND_WIDGET |
| collapseWidget | Yes | chrome.runtime.sendMessage ECHLY_COLLAPSE_WIDGET |
| openLogin | Yes | chrome.runtime.sendMessage ECHLY_TRIGGER_LOGIN |
| openDashboard | Yes | chrome.runtime.sendMessage ECHLY_OPEN_TAB |
| captureTabScreenshot | Yes | chrome.runtime.sendMessage CAPTURE_TAB |

### Dashboard (DashboardCaptureHost useMemo environment)

| Function | Implemented | Notes |
|----------|-------------|--------|
| createSession | Yes | authFetch POST /api/sessions; setSessionId; returns limitReached on 403 |
| authenticatedFetch | Yes | authFetch |
| notifyFeedbackCreated | Yes | () => {} (no-op) |
| setActiveSession | Yes | setSessionId(id) |
| startSessionMode | No (stub) | async () => {} |
| pauseSessionMode | No (stub) | async () => {} |
| resumeSessionMode | No (stub) | async () => {} |
| endSessionMode | Partial | setSessionId("") only; no broadcast or navigation |
| reportActivity | No (stub) | async () => {} |
| expandWidget | No (stub) | () => {} |
| collapseWidget | No (stub) | () => {} |
| openLogin | Yes | window.location.href = "/login" |
| openDashboard | Yes | window.location.href = url |
| captureTabScreenshot | Yes | Canvas of window inner dimensions, white fill, toDataURL |

**Summary:** Dashboard environment has working createSession, setActiveSession, authenticatedFetch, openLogin, openDashboard, captureTabScreenshot. All “session mode” and “widget visibility” methods are no-op stubs. For parity, the dashboard host must implement startSessionMode / pauseSessionMode / resumeSessionMode / endSessionMode (and optionally reportActivity) by updating local state that is passed as globalSessionModeActive / globalSessionPaused and by wiring onSessionModeEnd (e.g. navigate to session). expandWidget/collapseWidget can remain no-op if the dashboard does not use a launcher.

---

## SECTION 9 — UI Rendering Differences

### Layout

- **Extension:** Widget lives inside shadow DOM (#echly-shadow-host → #echly-root). Capture root (#echly-capture-root) is created by useCaptureWidget and appended to **captureRootParent** = widgetRoot (inside shadow DOM). Tray is fixed bottom-right; position can be dragged (state.position).
- **Dashboard:** Widget rendered in a portal into document.body; container div #echly-dashboard-capture-root (fixed bottom-right, z-index 999999). Capture root is created by useCaptureWidget and appended to **captureRootParent** = document.body. No shadow DOM; no drag.

### Components rendered

- **Extension:** CaptureWidget receives globalSessionModeActive true when in session → showSessionSidebar true, showHomeScreen false after start session → session list or empty state; CaptureLayer shows SessionOverlay when sessionMode && globalSessionModeActive && sessionId. Mode tiles and WidgetFooter (Start / Previous) only when showHomeScreen (i.e. when not in session).
- **Dashboard:** globalSessionModeActive is undefined → showHomeScreen is always true, sessionModeActive always false → mode tiles and footer always visible; ticket list only when !extensionMode or sessionModeActive (so effectively not in extension mode path). CaptureLayer: `if (extensionMode && (!sessionMode || !sessionIdProp)) return null` → when extensionMode and (no session or no sessionId), CaptureLayer returns **null**. So on dashboard with extensionMode true, until sessionId is set and “session mode” is conceptually on, CaptureLayer is null. After Start Session we need sessionId and “session mode” state to be true for overlay to show.

### Props

- Already covered in Section 6 (missing/different props). Notable: theme, sessionLimitReached, feedbackJobs, isProcessingFeedback, sessionTitleProp, onSessionTitleChange, launcherLogoUrl, openResumeModal, onResumeModalClose.

### CSS

- **Extension:** popup.css and reset injected into shadow root; host page gets only a small “scroll restore” style. Styles are isolated in shadow DOM.
- **Dashboard:** Uses app/global CSS and any Tailwind; no shadow DOM, so same CSS as rest of app. Class names (echly-*) are the same; layout and z-index may differ if app CSS overrides.

### extensionMode behavior

- **Extension:** extensionMode true; globalSessionModeActive and globalSessionPaused from background; captureMode from background; Start Session sends message; Previous Sessions opens modal and sends message; Voice/Write send ECHLY_SET_CAPTURE_MODE; CaptureLayer shows overlay only when sessionMode && sessionId; createCaptureRoot when globalSessionModeActive.
- **Dashboard:** extensionMode true but no chrome; globalSessionModeActive/globalSessionPaused undefined → showHomeScreen always true, CaptureLayer returns null (extensionMode && (!sessionMode || !sessionId)); Start/Previous/Voice/Write all no-op or unwired. So the dashboard shows the same “shell” (mode tiles + footer) but no session flow and no overlay.

---

## SECTION 10 — CaptureLayer Mounting

### CaptureLayer.tsx (lib/capture-engine/core/CaptureLayer.tsx)

- **Portal:** Content is rendered with `createPortal(captureContent, portalTarget)` where `portalTarget = captureRootParent ?? captureRoot`. So overlay content is portaled into captureRootParent if provided, else into captureRoot.
- **Early return:** `if (extensionMode && (!sessionMode || !sessionIdProp)) return null`. So in extension mode, CaptureLayer renders nothing unless both sessionMode is true and sessionIdProp is set. Session mode is set in useCaptureWidget from globalSessionModeActive; sessionIdProp is the sessionId prop passed to CaptureWidget.

### RegionCaptureOverlay

- Used inside CaptureLayer when `showRegionOverlay` = `!showSessionOverlay && (state === "focus_mode" || state === "region_selecting")`. So region overlay is for the “single capture” flow (focus_mode → region_selecting). Session overlay is for session feedback mode (click on page elements).
- **Portal:** Same as CaptureLayer; content is portaled to captureRootParent ?? captureRoot. No separate “captureRootParent” prop on RegionCaptureOverlay; it receives getFullTabImage, onAddVoice, onCancel, onSelectionStart from CaptureLayer.

### captureRootParent usage

- **Extension:** captureRootParent = widgetRoot (shadow root container). Capture root #echly-capture-root is created by useCaptureWidget and appended to captureRootParent (so inside shadow DOM). CaptureLayer portals into portalTarget = captureRootParent ?? captureRoot, so into the same shadow DOM.
- **Dashboard:** captureRootParent = document.body. Capture root is appended to document.body. Portal target is document.body. So overlay and capture root both live on document.body; z-index 999999 on the host container and 2147483645 on capture root (in useCaptureWidget createCaptureRoot) should stack correctly.

### Z-index behavior

- useCaptureWidget createCaptureRoot: capture root div has zIndex "2147483645", pointer-events none. Marker layer 2147483644. CaptureWidget sidebar container (extensionMode): zIndex 2147483647. Dashboard host div: zIndex 999999. So on dashboard the host is 999999 and the capture root (when created) is 2147483645; the capture root would appear above the host. When globalSessionModeActive is never true on dashboard, createCaptureRoot is only called from startCapture (idle → focus_mode). But on dashboard, Start Session does not call startCapture and does not set globalSessionModeActive, so the capture root is never created for “session” flow, and for the single-capture flow startCapture is only invoked when extensionMode is false (WidgetFooter “Capture feedback” uses handlers.startCapture when !extensionMode, and when extensionMode it uses onStartSession which is the chrome message). So on dashboard with extensionMode true, the capture root is never created, and CaptureLayer returns null. Z-index is therefore irrelevant until the dashboard implements session mode and/or uses startCapture for the “single capture” path.

---

## SECTION 11 — Root Cause Analysis

### Why Start Session button does nothing

1. **CaptureWidget.tsx** (lines 357–364): In extension mode, `onStartSession` passed to WidgetFooter is:
   - `() => { if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) { chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" }); } }`
2. On the dashboard, `chrome` is undefined or does not have runtime, so the callback runs but sends no message and does not call any other logic (e.g. createSession or handlers.startSession).
3. The extension path never calls `handlers.startSession` from the Start Session button; it relies on the message chain (background → content → ECHLY_START_SESSION_REQUEST → createSession + ECHLY_SESSION_MODE_START). The dashboard has no background/content, so that chain does not exist.
4. **Conclusion:** Start Session on the dashboard must either (a) call the same logic as the extension’s content script (createSession → setActiveSession → startSessionMode) and the host must set something equivalent to globalSessionModeActive so the overlay and session UI appear, or (b) CaptureWidget must treat “extensionMode but no chrome” as “use environment + host state” and call handlers.startSession when the button is clicked. File references: `lib/capture-engine/core/CaptureWidget.tsx` (onStartSession branch for extensionMode), `app/(app)/dashboard/components/DashboardCaptureHost.tsx` (no onStartSession override, no globalSessionModeActive, environment.startSessionMode is no-op).

### Why Previous Sessions button does nothing

1. **CaptureWidget.tsx** (lines 133, 488–491): `showPreviousButton = Boolean(hasPreviousSessions)`. `onOpenPreviousSession` is passed only when `extensionMode && showPreviousButton && fetchSessions && onPreviousSessionSelect`. Dashboard does not pass `hasPreviousSessions` (default false), so `showPreviousButton` is false and `onOpenPreviousSession` is undefined.
2. **WidgetFooter.tsx** (lines 47–48): Previous Sessions button uses `onClick={previousDisabled ? undefined : onOpenPreviousSession}`. So when onOpenPreviousSession is undefined, click does nothing.
3. **Conclusion:** Dashboard must pass `hasPreviousSessions` (e.g. derived from fetchSessions or a dedicated API) so that onOpenPreviousSession is defined. Optionally, handle session selection so that after selecting a session the dashboard enters “session mode” (equivalent to ECHLY_SESSION_MODE_START) and passes globalSessionModeActive. File references: `lib/capture-engine/core/CaptureWidget.tsx` (hasPreviousSessions default, onOpenPreviousSession condition), `lib/capture-engine/core/WidgetFooter.tsx` (onClick), `app/(app)/dashboard/components/DashboardCaptureHost.tsx` (hasPreviousSessions not passed).

### Why Voice / Write buttons do nothing

1. **CaptureWidget.tsx** (lines 202–206): `setMode(mode)` only calls `chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode })`. On the dashboard this is a no-op.
2. **CaptureWidget** receives `captureMode` from props. In the extension it comes from globalState (updated by background after ECHLY_SET_CAPTURE_MODE). Dashboard does not pass captureMode (default "voice") and does not update it when the user clicks Voice or Write.
3. **Conclusion:** Either (a) the dashboard holds captureMode state and passes it to CaptureWidget, and CaptureWidget in “extensionMode but no chrome” calls a host callback (e.g. onCaptureModeChange) when the tiles are clicked, or (b) CaptureWidget detects absence of chrome and uses local state or environment for captureMode and updates it on tile click. File references: `lib/capture-engine/core/CaptureWidget.tsx` (setMode, captureMode prop, Voice/Write tile onClick), `app/(app)/dashboard/components/DashboardCaptureHost.tsx` (captureMode not passed).

---

## SECTION 12 — Required Fix List

Each item: **file** | **function / location** | **change required** (no code written; description only).

1. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | Component state and CaptureWidget props | Add local state for: sessionModeActive (or globalSessionModeActive equivalent), globalSessionPaused, captureMode, hasPreviousSessions, sessionLimitReached (from createSession 403), optional sessionTitle, optional feedbackJobs/isProcessingFeedback. Pass these and the callbacks below to CaptureWidget so behavior matches extension.

2. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | environment useMemo | Implement startSessionMode: set local “session mode active” state to true so it can be passed as globalSessionModeActive. Implement pauseSessionMode / resumeSessionMode: set local session paused state and pass as globalSessionPaused. Implement endSessionMode: set session mode inactive, clear sessionId, optionally navigate to dashboard/session URL. Optionally implement reportActivity (no-op or future idle timeout). Keep createSession, setActiveSession, authenticatedFetch, openLogin, openDashboard, captureTabScreenshot as-is or enhance as needed.

3. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | CaptureWidget props | Pass globalSessionModeActive and globalSessionPaused (from local state updated by environment.startSessionMode/pauseSessionMode/resumeSessionMode/endSessionMode). Pass captureMode and a way to update it (e.g. onCaptureModeChange callback or rely on CaptureWidget handling when chrome is absent). Pass hasPreviousSessions (e.g. after first fetchSessions or a dedicated check). Pass onSessionModeStart, onSessionModePause, onSessionModeResume, onSessionActivity, onSessionModeEnd (can delegate to environment or local state updates). Pass sessionLimitReached when createSession returns limitReached. Pass onCreateSession (createSession), onActiveSessionChange (setSessionId + any state). Pass ensureAuthenticated and onTriggerLogin if Previous Sessions modal should support auth. Pass verifySessionBeforeSessions for modal. Pass sessionTitleProp and onSessionTitleChange if session title is shown and editable. Pass loadSessionWithPointers or equivalent when user selects a previous session (and ensure pointers are loaded for that session). Pass feedbackJobs and isProcessingFeedback if job queue UI is desired.

4. **lib/capture-engine/core/CaptureWidget.tsx** | onStartSession for extensionMode | When extensionMode is true, if chrome.runtime?.sendMessage is not available (e.g. dashboard), call handlers.startSession instead of sending ECHLY_START_SESSION, so that environment.createSession, environment.setActiveSession, environment.startSessionMode are used and the host can set globalSessionModeActive. Alternatively, require the host to pass an explicit onStartSession that does this (and do not override it with the chrome-only branch when chrome is absent).

5. **lib/capture-engine/core/CaptureWidget.tsx** | setMode (Voice/Write) | When extensionMode is true but chrome.runtime?.sendMessage is not available, update capture mode via a host-provided callback (e.g. onCaptureModeChange prop) or via environment (e.g. environment.setCaptureMode(mode) if added to CaptureEnvironment), and/or use local state for captureMode when running without chrome so the tiles show selected state and SessionOverlay receives the correct mode.

6. **lib/capture-engine/core/CaptureWidget.tsx** | onOpenPreviousSession / handlePreviousSessions | When extensionMode is true and onOpenPreviousSession is used without chrome (dashboard), handlePreviousSessions should still open the modal (setResumeModalOpen(true)); the chrome.runtime.sendMessage can be guarded so it is only called when chrome exists. Ensure DashboardCaptureHost passes hasPreviousSessions and onPreviousSessionSelect so that onOpenPreviousSession is defined and the modal opens. When user selects a session, onPreviousSessionSelect on dashboard should set sessionId and also trigger “session mode” (equivalent to ECHLY_SESSION_MODE_START) so globalSessionModeActive becomes true and overlay/session UI appear.

7. **lib/capture-engine/ExtensionCaptureEnvironment.ts** | (optional) | No change required for extension. If CaptureWidget is to call environment for capture mode when chrome is absent, add setCaptureMode(mode) to CaptureEnvironment and implement it in Dashboard host’s environment (and no-op in ExtensionCaptureEnvironment). Otherwise, capture mode can be handled entirely by host state + props.

8. **lib/capture-engine/CaptureEnvironment.ts** | (optional) | If using environment for capture mode: add optional setCaptureMode?(mode: "voice" | "text"): void to the interface and document that when provided it is used in extensionMode when chrome is not available.

9. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | fetchSessions and hasPreviousSessions | Compute hasPreviousSessions (e.g. from fetchSessions().then(s => s.length > 0) or /api/sessions?limit=1) and pass to CaptureWidget so the Previous Sessions button is shown and wired.

10. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | createSession 403 handling | When createSession returns limitReached, set sessionLimitReached state and pass it to CaptureWidget so the upgrade view is shown instead of session controls.

11. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | loadSessionWithPointers / pointers | When user selects a session from Previous Sessions, load feedback for that session (e.g. authFetch /api/feedback?sessionId=...) and pass pointers to CaptureWidget (e.g. via loadSessionWithPointers or by passing pointers prop and keeping sessionId in sync). Ensure session mode is started so CaptureLayer and session overlay are shown.

12. **lib/capture-engine/core/useCaptureWidget.ts** | createCaptureRoot effect | When extensionMode is true, capture root is created when globalSessionModeActive is true. For dashboard, the host must set globalSessionModeActive to true when “Start Session” or “Previous Session” selection has started session mode, so that createCaptureRoot runs and CaptureLayer receives a root and can render (and no longer returns null from the extensionMode && (!sessionMode || !sessionIdProp) check once sessionMode and sessionId are set).

13. **lib/capture-engine/core/CaptureLayer.tsx** | Early return | No change required; the condition `extensionMode && (!sessionMode || !sessionIdProp) return null` is correct. Dashboard must ensure that when in “session mode” it passes sessionId and that useCaptureWidget sets sessionMode (from globalSessionModeActive) so CaptureLayer renders the session overlay.

14. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | ResumeSessionModal | Ensure extensionMode && fetchSessions && onPreviousSessionSelect are all true (hasPreviousSessions and onOpenPreviousSession already covered). Pass verifySessionBeforeSessions and onTriggerLogin so the modal can show login-required UI and open login when needed. Pass openResumeModal and onResumeModalClose if message-driven open is desired; otherwise opening via button is enough.

15. **app/(app)/dashboard/components/DashboardCaptureHost.tsx** | onComplete and notifyFeedbackCreated | Optionally call environment.notifyFeedbackCreated in onComplete success path so that if the dashboard later adds a “global pointers” or job queue, it can stay in sync. Today dashboard environment’s notifyFeedbackCreated is no-op; this is acceptable if pointers are loaded by sessionId in useCaptureWidget (non-extension path).

---

**End of report.** Goal: dashboard recorder is a pixel-perfect functional copy of the extension recorder; the fixes above address the missing state, missing props, chrome-only handlers, and environment stubs that currently prevent that.
