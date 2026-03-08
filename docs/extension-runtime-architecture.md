# Echly Chrome Extension — Full Architecture & Runtime Analysis

**Purpose:** Read-only diagnosis of widget flow, extension refresh behavior, session lifecycle, race conditions, and message loops. No code was modified.

**Scope:** Extension folder (`echly-extension/`), content script, background, popup, and shared CaptureWidget components.

---

## SECTION 1 — Extension File Structure

### 1.1 popup.html

| Aspect | Description |
|--------|-------------|
| **Role** | Entry HTML for the extension action popup. Loaded when the user clicks the extension icon. |
| **Responsibility** | Declares viewport (400px × min 200px), loads `popup.css` and Google Fonts, provides `#root` for React, and loads `popup.js`. |
| **Messages sent** | None directly; React in `popup.js` sends messages. |
| **Messages listened to** | None. |

---

### 1.2 popup.tsx (built as popup.js)

| Aspect | Description |
|--------|-------------|
| **Role** | Popup UI: login gate. If not authenticated, shows "Continue with Google"; if authenticated, toggles widget visibility and closes immediately. |
| **Responsibility** | On mount: `getAuthState()` via `ECHLY_GET_AUTH_STATE`. If authenticated → `toggleVisibility()` then `window.close()`. Login button sends `ECHLY_START_LOGIN`. |
| **Messages sent** | `ECHLY_GET_AUTH_STATE`, `ECHLY_START_LOGIN`, `ECHLY_TOGGLE_VISIBILITY`. |
| **Messages listened to** | None (callback-based only). |

---

### 1.3 background.ts (built as background.js)

| Aspect | Description |
|--------|-------------|
| **Role** | Service worker: single source of truth for auth tokens, global UI state, and session lifecycle. Proxies API calls with Bearer token. |
| **Responsibility** | Holds `globalUIState` (visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused) and `activeSessionId`. Restores from `chrome.storage.local` on load; persists session-related keys on change. Broadcasts state to all tabs via `ECHLY_GLOBAL_STATE`. Handles tab activation/creation by pushing state to the active/new tab. |
| **Messages sent** | `ECHLY_GLOBAL_STATE` (to all tabs or single tab on activation/creation), `ECHLY_RESET_WIDGET` (to all tabs when visibility toggled to true), `ECHLY_FEEDBACK_CREATED` (to all tabs after successful ECHLY_PROCESS_FEEDBACK). |
| **Messages listened to** | All request types: `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, `ECHLY_GET_GLOBAL_STATE`, `ECHLY_GET_ACTIVE_SESSION`, `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_SESSION_MODE_*`, `ECHLY_GET_TOKEN`, `ECHLY_GET_AUTH_STATE`, `ECHLY_OPEN_POPUP`, `ECHLY_START_LOGIN`/`ECHLY_SIGN_IN`/`LOGIN`, `START_RECORDING`, `STOP_RECORDING`, `CAPTURE_TAB`, `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, `echly-api`. |

---

### 1.4 content.tsx (built as content.js)

| Aspect | Description |
|--------|-------------|
| **Role** | Content script injected on all URLs. Thin shell: creates one host element, attaches shadow DOM, mounts React (ContentApp). Visibility and global state are driven by background. |
| **Responsibility** | Single host `#echly-shadow-host` (fixed bottom-right). On Chrome messages: set host display, dispatch CustomEvents so React can update. Request initial state on mount and on `visibilitychange`. Dashboard detection: when origin is app and path is `/dashboard/[sessionId]`, send `ECHLY_SET_ACTIVE_SESSION` (on load, popstate, and every 2s). |
| **Messages sent** | `ECHLY_OPEN_POPUP`, `ECHLY_GET_GLOBAL_STATE`, `ECHLY_GET_AUTH_STATE`, `ECHLY_SET_ACTIVE_SESSION` (dashboard), `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, `ECHLY_SESSION_MODE_START/PAUSE/RESUME/END`, `ECHLY_SET_ACTIVE_SESSION` (session actions), `ECHLY_PROCESS_FEEDBACK`, `START_RECORDING`, `STOP_RECORDING`. |
| **Messages listened to** | Single `chrome.runtime.onMessage` (guarded by `window.__ECHLY_MESSAGE_LISTENER__`): `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`, `ECHLY_TOGGLE`, `ECHLY_RESET_WIDGET`. For `ECHLY_GLOBAL_STATE`: set host display and dispatch CustomEvent. For `ECHLY_RESET_WIDGET`: dispatch CustomEvent. |

---

### 1.5 contentAuthFetch.ts

| Aspect | Description |
|--------|-------------|
| **Role** | Content script API layer: no direct Firebase/token access. All fetches go through the background. |
| **Responsibility** | `authFetch()` / `apiFetch()`: build URL, then `chrome.runtime.sendMessage({ type: "echly-api", url, method, headers, body })`. Background adds Bearer token and performs fetch; response returned to content. |
| **Messages sent** | `echly-api` (with url, method, headers, body). |
| **Messages listened to** | None. |

---

### 1.6 CaptureWidget.tsx (in components/CaptureWidget)

| Aspect | Description |
|--------|-------------|
| **Role** | Main widget UI: sidebar/panel, feedback list, capture flow, session overlay. Used by both web app and extension; `extensionMode` and `loadSessionWithPointers` drive extension-specific behavior. |
| **Responsibility** | Renders command screen vs session view via `showCommandScreen` and `showSessionButtons`. Uses `useCaptureWidget` for state (pointers, capture state, session mode). Portals CaptureLayer into `#echly-capture-root`. On extension: shows WidgetFooter with Start New / Resume / Previous; collapse/expand via `onExpandRequest`/`onCollapseRequest`. |
| **Messages sent** | `ECHLY_GET_ACTIVE_SESSION` (Resume Session button). No Chrome messages from this file otherwise; parent (content) sends session/expand/collapse messages. |
| **Messages listened to** | None. Receives props from ContentApp (content.tsx). |

---

### 1.7 useCaptureWidget.ts (in components/CaptureWidget/hooks)

| Aspect | Description |
|--------|-------------|
| **Role** | Hook that owns capture flow state, pointers, session mode, voice, and capture root lifecycle. |
| **Responsibility** | State: pointers, capture state (idle, focus_mode, region_selecting, voice_listening, processing), sessionMode, sessionPaused, etc. When `loadSessionWithPointers` is set (extension), applies pointers and calls `onSessionLoaded`. Syncs `initialPointers`/sessionId from parent when not extension load. Creates/removes `#echly-capture-root`. Sends `CAPTURE_TAB` via optional `getFullTabImage` (injected by content). |
| **Messages sent** | None directly; `getFullTabImage` is passed from content and internally uses `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })` (in content.tsx / CaptureWidget wrapper). |
| **Messages listened to** | None. |

---

### 1.8 WidgetFooter.tsx

| Aspect | Description |
|--------|-------------|
| **Role** | Footer of the widget panel: primary and secondary actions. |
| **Responsibility** | In extension mode: "Start New Feedback Session", "Resume Session", "Previous Sessions". Buttons disabled when not idle or when capture disabled. Resume disabled when no active session or no `onResumeSession`. |
| **Messages sent** | None. |
| **Messages listened to** | None. |

---

### 1.9 FeedbackItem.tsx

| Aspect | Description |
|--------|-------------|
| **Role** | Single feedback/ticket card in the list. |
| **Responsibility** | Renders title, action steps, expand/collapse, edit, delete. Calls `onUpdate`, `onDelete`, `onExpandChange` from parent. |
| **Messages sent** | None. |
| **Messages listened to** | None. |

---

## SECTION 2 — Message System

### 2.1 Chrome runtime message usage

- **chrome.runtime.sendMessage** — Used by: popup (popup.tsx), content (content.tsx), contentAuthFetch (contentAuthFetch.ts), CaptureWidget (CaptureWidget.tsx for ECHLY_GET_ACTIVE_SESSION), useCaptureWidget (via content’s getFullTabImage / pipeline).
- **chrome.runtime.onMessage** — Used by: background (background.ts), content (content.tsx, single listener in `ensureMessageListener`).
- **chrome.tabs.sendMessage** — Used by: background only (broadcast to tabs or single tab on activation/creation).

### 2.2 Message types: sender, receiver, state impact

| Message | Sender | Receiver | State modified |
|--------|--------|----------|----------------|
| **ECHLY_TOGGLE_VISIBILITY** | Popup | Background | visible flipped; if visible: expanded/session cleared, storage updated, ECHLY_RESET_WIDGET to all tabs; then broadcast. |
| **ECHLY_GLOBAL_STATE** | Background | All tabs (content) | Content: host display, React globalState (visible, expanded, sessionId, sessionModeActive, sessionPaused, isRecording). |
| **ECHLY_RESET_WIDGET** | Background | All tabs (content) | Content: CustomEvent → ContentApp clears loadSessionWithPointers, expanded, increments widgetResetKey (CaptureWidget remounts). |
| **ECHLY_GET_GLOBAL_STATE** | Content | Background | None (response only). Background responds with `{ state: globalUIState }`. |
| **ECHLY_GET_ACTIVE_SESSION** | Content (CaptureWidget Resume button) | Background | None (response only). Background responds with `{ sessionId }`. |
| **ECHLY_SET_ACTIVE_SESSION** | Content (session create/resume, dashboard), Web app (dashboard page) | Background | activeSessionId, globalUIState.sessionId, sessionModeActive=true, sessionPaused=false; persisted; broadcast. |
| **ECHLY_SESSION_MODE_START** | Content | Background | sessionModeActive=true, sessionPaused=false, sessionId=activeSessionId; persist; broadcast. |
| **ECHLY_SESSION_MODE_PAUSE** | Content | Background | sessionModeActive=true, sessionPaused=true; persist; broadcast. |
| **ECHLY_SESSION_MODE_RESUME** | Content | Background | sessionModeActive=true, sessionPaused=false; persist; broadcast. |
| **ECHLY_SESSION_MODE_END** | Content | Background | activeSessionId=null, sessionModeActive/sessionPaused/sessionId cleared; persist; broadcast. |
| **ECHLY_PROCESS_FEEDBACK** | Content | Background | Background calls structure-feedback + feedback API; on success can broadcast ECHLY_FEEDBACK_CREATED. No direct global UI state change. |
| **ECHLY_GET_AUTH_STATE** | Popup, Content | Background | None (response only). |
| **ECHLY_START_LOGIN** / **ECHLY_SIGN_IN** / **LOGIN** | Popup | Background | Token state in background; no global UI state. |
| **ECHLY_EXPAND_WIDGET** | Content | Background | globalUIState.expanded = true; broadcast. |
| **ECHLY_COLLAPSE_WIDGET** | Content | Background | globalUIState.expanded = false; broadcast. |
| **ECHLY_OPEN_POPUP** | Content | Background | Opens popup tab; no state. |
| **ECHLY_FEEDBACK_CREATED** | Background | All tabs (content) | Content dispatches CustomEvent; widget can highlight new ticket. |
| **ECHLY_TOGGLE** | (Optional) | Content | Content dispatches ECHLY_TOGGLE_WIDGET CustomEvent. |
| **CAPTURE_TAB** | Content (via getFullTabImage) | Background | None; response is screenshot data URL. |
| **ECHLY_UPLOAD_SCREENSHOT** | Content | Background | No global state; uploads image, returns URL. |
| **echly-api** | contentAuthFetch | Background | No global state; proxy fetch with token. |
| **START_RECORDING** / **STOP_RECORDING** | Content | Background | isRecording in globalUIState; broadcast. |

---

## SECTION 3 — Global State Flow

### 3.1 Source of truth

- **Location:** `echly-extension/src/background.ts`: in-memory `globalUIState` and `activeSessionId`.
- **Persisted:** `chrome.storage.local`: `activeSessionId`, `sessionModeActive`, `sessionPaused`. Not persisted: `visible`, `expanded`, `isRecording` (reset on restart to false/false/false).

### 3.2 Fields

| Field | Origin | Restored from storage | Broadcast | Modified when |
|-------|--------|------------------------|-----------|---------------|
| **visible** | background | No | ECHLY_GLOBAL_STATE | ECHLY_TOGGLE_VISIBILITY. |
| **expanded** | background | No | ECHLY_GLOBAL_STATE | ECHLY_EXPAND_WIDGET, ECHLY_COLLAPSE_WIDGET; also set false when visibility toggled to true. |
| **sessionId** | background | Yes (via activeSessionId) | ECHLY_GLOBAL_STATE | ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_* (synced from activeSessionId), ECHLY_SESSION_MODE_END / ECHLY_TOGGLE_VISIBILITY (cleared). |
| **sessionModeActive** | background | Yes | ECHLY_GLOBAL_STATE | ECHLY_SET_ACTIVE_SESSION (true), ECHLY_SESSION_MODE_* (true/false), ECHLY_TOGGLE_VISIBILITY (false when visible). |
| **sessionPaused** | background | Yes | ECHLY_GLOBAL_STATE | ECHLY_SESSION_MODE_PAUSE (true), ECHLY_SESSION_MODE_START/RESUME (false), ECHLY_SESSION_MODE_END / ECHLY_TOGGLE_VISIBILITY (false). |

### 3.3 Restore and broadcast

- **On background load:** `chrome.storage.local.get(["activeSessionId", "sessionModeActive", "sessionPaused"], ...)` → set `activeSessionId`, `globalUIState.sessionId`, `sessionModeActive`, `sessionPaused` → `broadcastUIState()`.
- **Broadcast:** `broadcastUIState()` runs `chrome.tabs.query({}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })))`.
- **Tab activation/creation:** `chrome.tabs.onActivated` and `chrome.tabs.onCreated` send `ECHLY_GLOBAL_STATE` to the active/new tab only.

Content does not persist global state; it only applies what it receives (host display + React `globalState`). Content also has a “prevent session restore” effect that can **overwrite** local React state (set sessionModeActive/sessionId to false/null) when `globalState.sessionModeActive` and `globalState.sessionId` are set but `loadSessionWithPointers` is not — without notifying the background, which can cause state ping-pong (see Section 9).

---

## SECTION 4 — Widget Lifecycle

### 4.1 Extension icon click

1. Popup opens (popup.html → popup.js).
2. PopupApp mounts → `getAuthState()` (ECHLY_GET_AUTH_STATE).
3. If authenticated: `toggleVisibility()` (ECHLY_TOGGLE_VISIBILITY) → `window.close()`.
4. Background: flip `visible`; if visible → clear session state, persist, send ECHLY_RESET_WIDGET to all tabs, then `broadcastUIState()` (ECHLY_GLOBAL_STATE to all tabs).
5. Content: on ECHLY_RESET_WIDGET → dispatch CustomEvent → ContentApp: setLoadSessionWithPointers(null), setGlobalState(…expanded: false), setWidgetResetKey(k => k+1). On ECHLY_GLOBAL_STATE → set host display, setGlobalState(s).

### 4.2 Popup mount

- Popup has no subscription to content or background state. It only requests auth once and then either shows login or toggles and closes. No ongoing listener.

### 4.3 Visibility toggle

- Handled in background on ECHLY_TOGGLE_VISIBILITY. When turning visible, background also sends ECHLY_RESET_WIDGET and then ECHLY_GLOBAL_STATE. Content updates host display and React state from ECHLY_GLOBAL_STATE; ECHLY_RESET_WIDGET forces widget reset (key increment).

### 4.4 Widget mount

1. **main()** (content.tsx): Once per document, create `#echly-shadow-host` if missing, append to document.documentElement, call `mountReactApp(host)`.
2. **mountReactApp:** Attach shadow root, inject styles, create container `#echly-root`, `createRoot(container).render(<ContentApp ...>)`.
3. ContentApp mounts → effects request ECHLY_GET_AUTH_STATE and ECHLY_GET_GLOBAL_STATE; listen for CustomEvents (ECHLY_GLOBAL_STATE, ECHLY_RESET_WIDGET, ECHLY_TOGGLE_WIDGET).
4. ContentApp renders `<CaptureWidget key={widgetResetKey} ... />`. So widget **remounts** whenever `widgetResetKey` changes (e.g. after ECHLY_RESET_WIDGET).

### 4.5 Widget reset

- Trigger: ECHLY_RESET_WIDGET (from background when visibility toggled to true).
- Content: CustomEvent handler sets `setLoadSessionWithPointers(null)`, `setGlobalState(prev => ({ ...prev, expanded: false }))`, `setWidgetResetKey(k => k + 1)`.
- **widgetResetKey:** Used as React `key` on CaptureWidget so the widget is unmounted and remounted with fresh internal state (pointers, capture state, etc.).
- **Host element:** Single div `#echly-shadow-host`; display toggled via `style.display` from global state. No re-creation.
- **Shadow DOM:** Created once in `mountReactApp`; React root lives inside it; no re-attach on reset, only CaptureWidget remount due to key change.

### 4.6 Widget unmount

- CaptureWidget unmounts when `widgetResetKey` changes (new instance mounted) or when ContentApp unmounts (e.g. host removed, which is not done in current design). When CaptureWidget unmounts, useCaptureWidget cleanup runs (e.g. removeCaptureRoot unless extension session mode is active).

---

## SECTION 5 — Session Lifecycle

### 5.1 Start New Session

1. User clicks "Start New Feedback Session" in WidgetFooter.
2. Content: `handlers.startSession()` (from useCaptureWidget) → typically `onCreateSession()` from ContentApp → `createSession()` (POST /api/sessions) → on success `onActiveSessionChange(newSessionId)` → `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId })` and `setSessionIdOverride(newSessionId)`.
3. Background: sets activeSessionId, globalUIState.sessionId, sessionModeActive=true, sessionPaused=false; persists; broadcasts.
4. Content: CaptureWidget may then open capture flow (depends on startSession implementation). Session mode overlay may start; content sends ECHLY_SESSION_MODE_START.
5. Background: ECHLY_SESSION_MODE_START → sessionModeActive=true, sessionPaused=false; persist; broadcast.
6. **Components that react:** ContentApp (effectiveSessionId), CaptureWidget (sessionId prop, globalSessionModeActive), useCaptureWidget (session mode overlay, pointers).

### 5.2 Resume Session

1. User clicks "Resume Session" (or selects from modal). Content: `onResumeSessionSelect(sessionId)` or `handleResumeActiveSession()` (ECHLY_GET_ACTIVE_SESSION then onResumeSessionSelect with stored id).
2. Content: ECHLY_SET_ACTIVE_SESSION(sessionId), setSessionIdOverride(sessionId), fetch `/api/feedback?sessionId=...`, setLoadSessionWithPointers({ sessionId, pointers }), ECHLY_SESSION_MODE_START.
3. Background: ECHLY_SET_ACTIVE_SESSION → update and persist and broadcast; ECHLY_SESSION_MODE_START → sessionModeActive=true, etc.; broadcast.
4. **Components that react:** useCaptureWidget effect sees loadSessionWithPointers → setPointers(pointers), onSessionLoaded() → content clears loadSessionWithPointers. CaptureWidget sets showCommandScreen(false). Session overlay appears.

### 5.3 Pause Session

1. User pauses in session overlay. Content: `onSessionModePause()` → ECHLY_SESSION_MODE_PAUSE.
2. Background: sessionModeActive=true, sessionPaused=true; persist; broadcast.
3. **Components that react:** ContentApp globalState.sessionPaused; CaptureWidget/useCaptureWidget sessionPaused; overlay shows paused UI.

### 5.4 End Session

1. User ends session in overlay. Content: `handlers.endSession(onSessionEndCallback)` where callback is `() => { setShowCommandScreen(true); onSessionEndCallback?.() }` and onSessionEndCallback is `setSessionIdOverride(null)`.
2. Content also sends ECHLY_SESSION_MODE_END (from widget’s onSessionModeEnd).
3. Background: ECHLY_SESSION_MODE_END → activeSessionId=null, sessionModeActive/sessionPaused/sessionId cleared; persist; broadcast.
4. **Components that react:** ContentApp effectiveSessionId becomes null; CaptureWidget showCommandScreen true; background and content session state cleared.

---

## SECTION 6 — Auto-Restore Logic

### 6.1 Where session state is restored

- **Background:** On load, `chrome.storage.local.get(["activeSessionId", "sessionModeActive", "sessionPaused"], ...)` restores into `globalUIState` and `activeSessionId`, then calls `broadcastUIState()`. So every tab receives ECHLY_GLOBAL_STATE with the last session id and session mode flags.
- **Content:** No code that fetches `/api/feedback?sessionId=...` and sets `loadSessionWithPointers` based only on `globalState.sessionId` / `globalState.sessionModeActive`. Resume is explicit (Resume Session or modal). So there is **no automatic load of ticket list** from stored session id in content.

### 6.2 “Prevent session restore” effect (content.tsx)

```ts
React.useEffect(() => {
  if (!globalState.sessionModeActive) return;
  if (!globalState.sessionId) return;
  if (loadSessionWithPointers) return;
  setLoadSessionWithPointers(null);
  setGlobalState((prev) => ({ ...prev, sessionModeActive: false, sessionId: null }));
}, [globalState.sessionModeActive, globalState.sessionId, loadSessionWithPointers]);
```

- **Intent:** If background says “session active” but the user never explicitly resumed (no loadSessionWithPointers), clear local session state so the widget doesn’t show as “in session” without tickets.
- **Side effect:** Content’s React state is forced to sessionModeActive=false, sessionId=null. The **background is not updated**. So the next time background sends ECHLY_GLOBAL_STATE (e.g. visibilitychange or tab activation), content gets sessionId/sessionModeActive again, this effect runs again, and content clears again → potential **ping-pong** between “has session” (from background) and “no session” (from this effect). See Section 9.

### 6.3 loadSessionWithPointers

- **Set when:** User explicitly resumes: `onResumeSessionSelect(sessionId)` fetches feedback and calls `setLoadSessionWithPointers({ sessionId, pointers })`. Not set by storage or by background broadcast.
- **Cleared when:** ECHLY_RESET_WIDGET handler, onSessionLoaded() (after useCaptureWidget applies it), beforeunload, and the “prevent session restore” effect (setLoadSessionWithPointers(null) in that effect is redundant with the setGlobalState clear).

---

## SECTION 7 — Pointer State

### 7.1 Location

- **pointers / setPointers:** In `components/CaptureWidget/hooks/useCaptureWidget.ts`, `useState<StructuredFeedback[]>(initialPointers ?? [])`. Returned in hook state and used by CaptureWidget to render the feedback list.

### 7.2 When pointers are set

- Initial: `initialPointers` (from parent) or from `loadSessionWithPointers.pointers` in the effect that runs when `loadSessionWithPointers` is set (extension resume).
- Sync from session: Effect with `[sessionId, initialPointers]` loads feedback via `getSessionFeedback(sessionId)` when not extension load path and sessionId present.
- After feedback created: In pipeline onSuccess (and similar paths) `setPointers(prev => [{ id, title, actionSteps, type }, ...prev])`.
- Session feedback submit success: `setPointers(prev => [...])` adding the new ticket.

### 7.3 When pointers are cleared

- Widget reset: Remount via `widgetResetKey` gives a new CaptureWidget instance with fresh `useState`, so pointers reset to initial (e.g. [] when loadSessionWithPointers was cleared).
- End session / clear in hook: Some paths call `setPointers([])` (e.g. clear or end-session flows inside useCaptureWidget).

### 7.4 What triggers UI card rendering

- CaptureWidget renders `state.pointers.map(p => <FeedbackItem key={p.id} ... />)`. So any setPointers that updates the hook state triggers re-render of the list. ECHLY_FEEDBACK_CREATED CustomEvent can be used to add/highlight a ticket if content subscribes and updates pointers or highlight state.

---

## SECTION 8 — Command Screen Logic

### 8.1 Where it’s controlled

- **CaptureWidget.tsx:** `showCommandScreen` is local state (default true). `showSessionButtons = !hasTickets && state.state === "idle"`. The command screen (WidgetFooter with Start New / Resume / Previous) is shown when `showSessionButtons` is true (and the panel is open).

### 8.2 When these buttons appear

- **Start New Feedback Session:** Shown in extension mode when WidgetFooter is rendered; WidgetFooter is rendered when `showSessionButtons` is true. `showSessionButtons = !hasTickets && state.state === "idle"`. So: no pointers and idle state.
- **Resume Session:** Shown when `showResumeButton` is true and `onResumeSession` is passed. `showResumeButton = hasStoredSession` (effectiveSessionId truthy). So when there is an active session id (from background or sessionIdOverride).
- **Previous Sessions:** Shown when `showPreviousButton && fetchSessions && onResumeSessionSelect`. `showPreviousButton = hasPreviousSessions` (from content’s API check when widget is visible).

### 8.3 What conditions hide them

- **showSessionButtons false:** When there are tickets (`hasTickets`) or state is not idle (e.g. in capture flow). So as soon as pointers exist or user is in a flow, the three buttons are hidden.
- **showCommandScreen false:** Set when loadSessionWithPointers is applied (effect in CaptureWidget: `if (loadSessionWithPointers?.sessionId) setShowCommandScreen(false)`). So after resume, the widget shows session view (list + overlay) instead of the command screen. Set back to true when user ends session (`onSessionEnd` callback).

### 8.4 Interaction with pointers

- Command screen (three buttons) is shown when there are no pointers and idle. When user starts or resumes a session, pointers may be set (resume loads them); then hasTickets becomes true and showSessionButtons becomes false, so the footer switches from command buttons to the feedback list view. So pointers and session state together drive whether the user sees “Start New / Resume / Previous” vs the list.

---

## SECTION 9 — Refresh Loop Diagnosis

### 9.1 Visibility listener

- **Location:** content.tsx `ensureVisibilityStateRefresh()`. Listens to `document.visibilitychange`; when `!document.hidden` it sends `ECHLY_GET_GLOBAL_STATE` and then sets host visibility and dispatches ECHLY_GLOBAL_STATE CustomEvent (via normalizeGlobalState + setHostVisibility + dispatchGlobalState).
- **Loop risk:** Each time the tab becomes visible, one request and one dispatch. That updates React state once. It does not by itself cause a loop (no sendMessage from inside the response handler that would trigger another visibility change). So: **no loop from visibility alone**, but it does cause **repeated sync** on every tab focus, which can re-apply background state (including session) and re-trigger the “prevent session restore” effect if conditions match.

### 9.2 “Prevent session restore” effect vs broadcast (ping-pong)

- **Scenario:** Background has session restored from storage (sessionId set, sessionModeActive true). It broadcasts ECHLY_GLOBAL_STATE. Content sets globalState(s). Content’s effect runs: sessionModeActive and sessionId are set, loadSessionWithPointers is null → effect sets setGlobalState(prev => ({ ...prev, sessionModeActive: false, sessionId: null })). So content’s React state no longer has session. Later: user switches tab or tab becomes visible → background sends ECHLY_GLOBAL_STATE again (or content requests it) → content sets globalState(s) again with sessionId/sessionModeActive → effect runs again and clears again. So we get **repeated clear → receive → clear** as long as background keeps sending session state and content keeps “correcting” it. That can look like repeated updates/refresh and inconsistent UI (sometimes showing session, sometimes not). **Root cause:** Content unilaterally clears session state without telling the background; background remains the source of truth and keeps re-sending.

### 9.3 Dashboard interval

- **Location:** content.tsx: `setInterval(sendActiveSessionIfDashboard, 2000)`. When origin is app and path is `/dashboard/[sessionId]`, it sends `ECHLY_SET_ACTIVE_SESSION(sessionId)` every 2 seconds.
- **Effect:** Background updates activeSessionId and broadcasts ECHLY_GLOBAL_STATE to all tabs every 2s while user is on a dashboard session page. So all tabs get state updates every 2s; content and widget re-render. Not a strict “loop” but **repeated global state broadcasts** and potential interaction with the “prevent session restore” effect on other tabs.

### 9.4 ECHLY_GET_GLOBAL_STATE on mount

- ContentApp has an effect with empty deps that runs once on mount and sends ECHLY_GET_GLOBAL_STATE. Single request, no loop. Same for ECHLY_GET_AUTH_STATE.

### 9.5 Conclusion on refresh/repeated updates

- **No infinite message loop** (no A→B→A→B that never stops). Possible causes of “extension repeatedly refreshing” or flicker:
  1. **Ping-pong** between background (sending session) and content “prevent session restore” effect (clearing session in React only).
  2. **Dashboard 2s interval** causing frequent ECHLY_SET_ACTIVE_SESSION and thus broadcast to all tabs.
  3. **visibilitychange** causing ECHLY_GET_GLOBAL_STATE and re-apply of state on every tab focus, amplifying the above.

---

## SECTION 10 — Build vs Source Mismatch

### 10.1 Verification

- **background.js:** Minified; contains the same logic as background.ts: ECHLY_TOGGLE_VISIBILITY clears session and sends ECHLY_RESET_WIDGET; storage keys and message types match. **No evidence of outdated logic** in the sampled portion.
- **content.js:** Very large minified bundle (React, ContentApp, CaptureWidget, etc.). Contains strings like ECHLY_GLOBAL_STATE, ECHLY_RESET_WIDGET, SHADOW_HOST_ID-style behavior, and createRoot/render. **Assumed built from content.tsx** (and shared components). Without a full diff, we assume it is the built output of the current source; any behavioral bugs are more likely from logic (e.g. effect order, race with broadcast) than from an old build.
- **popup.js:** Large; assumed built from popup.tsx. Same as above: no direct evidence of mismatch; popup flow is simple (auth → toggle → close).

### 10.2 Recommendation

- Ensure the extension is built from the same repo/commit as the one analyzed (e.g. run the same build that produces content.js, background.js, popup.js). If symptoms persist, compare message flow and effect order in source rather than assuming a stale build.

---

## SECTION 11 — Output Report

### 11.1 System architecture diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ECHLY EXTENSION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  POPUP (popup.html + popup.js)                                              │
│    • Mount → ECHLY_GET_AUTH_STATE                                           │
│    • If auth → ECHLY_TOGGLE_VISIBILITY → window.close()                     │
│    • If not auth → ECHLY_START_LOGIN on button click                        │
└────────────────────────────────┬──────────────────────────────────────────┘
                                 │ chrome.runtime.sendMessage
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKGROUND (background.js) — Service worker                                 │
│    • globalUIState + activeSessionId (source of truth)                      │
│    • chrome.storage.local: activeSessionId, sessionModeActive, sessionPaused│
│    • On message: update state, persist, broadcast ECHLY_GLOBAL_STATE        │
│    • ECHLY_TOGGLE_VISIBILITY(visible) → ECHLY_RESET_WIDGET to all tabs     │
│    • tabs.onActivated / onCreated → ECHLY_GLOBAL_STATE to that tab          │
└────────────────────────────────┬──────────────────────────────────────────┘
                                 │ chrome.tabs.sendMessage (all tabs or one)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTENT (content.js) — Injected per tab                                     │
│    • Single host #echly-shadow-host → shadow DOM → React (ContentApp)       │
│    • onMessage: ECHLY_GLOBAL_STATE → host display + CustomEvent             │
│    • onMessage: ECHLY_RESET_WIDGET → CustomEvent → reset key + clear load   │
│    • syncInitialGlobalState + visibilitychange → ECHLY_GET_GLOBAL_STATE     │
│    • Dashboard: setInterval(2s) + popstate → ECHLY_SET_ACTIVE_SESSION         │
└────────────────────────────────┬──────────────────────────────────────────┘
                                 │ props + callbacks
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CAPTURE WIDGET (CaptureWidget.tsx + useCaptureWidget.ts)                    │
│    • key={widgetResetKey} → remount on reset                                │
│    • pointers, session mode, capture flow                                    │
│    • Start New / Resume / Previous → content callbacks → messages           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Message flow diagram

```
Popup                    Background                     Content (all tabs)
  |                           |                                  |
  | ECHLY_GET_AUTH_STATE       |                                  |
  |-------------------------->|                                  |
  |<--------------------------|                                  |
  |                           |                                  |
  | ECHLY_TOGGLE_VISIBILITY    |                                  |
  |-------------------------->|                                  |
  |                           | ECHLY_RESET_WIDGET                |
  |                           |--------------------------------->|
  |                           | ECHLY_GLOBAL_STATE                |
  |                           |--------------------------------->|
  |                           |                                  |
  |                           |     Content: ECHLY_GET_GLOBAL_STATE
  |                           |<---------------------------------|
  |                           |--------------------------------->| state
  |                           |                                  |
  |                           |     Content: ECHLY_SET_ACTIVE_SESSION
  |                           |<---------------------------------|
  |                           | persist + ECHLY_GLOBAL_STATE      |
  |                           |--------------------------------->|
  |                           |                                  |
  |                           |     Content: ECHLY_SESSION_MODE_*
  |                           |<---------------------------------|
  |                           | persist + ECHLY_GLOBAL_STATE     |
  |                           |--------------------------------->|
```

### 11.3 Widget lifecycle diagram

```
main()
  → create #echly-shadow-host (once)
  → mountReactApp(host) → shadow root, #echly-root, createRoot().render(ContentApp)
ContentApp mount
  → ECHLY_GET_AUTH_STATE, ECHLY_GET_GLOBAL_STATE (once)
  → subscribe: ECHLY_GLOBAL_STATE, ECHLY_RESET_WIDGET, ECHLY_TOGGLE_WIDGET
  → render <CaptureWidget key={widgetResetKey} ... />

User clicks extension icon (auth)
  → ECHLY_TOGGLE_VISIBILITY
  → background: visible=true, clear session, ECHLY_RESET_WIDGET → all tabs
  → content: ECHLY_RESET_WIDGET → setWidgetResetKey(k+1), clear loadSessionWithPointers
  → ECHLY_GLOBAL_STATE → host display block, setGlobalState
  → CaptureWidget remounts (new key) → fresh pointers, idle, showCommandScreen true
```

### 11.4 Session lifecycle diagram

```
Start:  Content onCreateSession → POST /api/sessions → ECHLY_SET_ACTIVE_SESSION(id)
        → background persist + broadcast → ECHLY_SESSION_MODE_START → broadcast

Resume: Content onResumeSessionSelect → ECHLY_SET_ACTIVE_SESSION → fetch feedback
        → setLoadSessionWithPointers({ sessionId, pointers }) → ECHLY_SESSION_MODE_START
        → useCaptureWidget applies pointers, onSessionLoaded clears loadSessionWithPointers

Pause:  Content ECHLY_SESSION_MODE_PAUSE → background sessionPaused=true, broadcast

Resume (from pause): ECHLY_SESSION_MODE_RESUME → sessionPaused=false, broadcast

End:    Content onSessionModeEnd + endSession callback
        → ECHLY_SESSION_MODE_END → background clear session, persist, broadcast
        → setShowCommandScreen(true), setSessionIdOverride(null)
```

### 11.5 Root causes of current bugs

1. **Incorrect widget flow / session reappearing after open**
   - Background restores session from storage on load and broadcasts it. When user opens extension, ECHLY_TOGGLE_VISIBILITY correctly clears session and sends ECHLY_RESET_WIDGET. If content’s “prevent session restore” effect runs in a bad order (e.g. after ECHLY_GLOBAL_STATE from a previous broadcast or from visibility), or if another tab’s state is applied, the widget can briefly show or re-show session state. The **ping-pong** (Section 9.2) can make visibility flicker or show wrong screen.

2. **Extension repeatedly refreshing**
   - **Dashboard 2s interval:** Sends ECHLY_SET_ACTIVE_SESSION every 2s on dashboard session page → broadcast to all tabs → every tab re-renders.
   - **visibilitychange:** Every tab focus triggers ECHLY_GET_GLOBAL_STATE and re-apply of state → can re-trigger “prevent session restore” and cause repeated updates.
   - **Ping-pong:** Content clearing session in React while background keeps sending session state → repeated state updates.

3. **Session lifecycle bugs**
   - **effectiveSessionId** = sessionIdOverride ?? globalState.sessionId. If background has session but content has cleared it locally (prevent-restore effect), effectiveSessionId can flip between null and non-null as ECHLY_GLOBAL_STATE and the effect alternate.
   - **showResumeButton** = hasStoredSession (effectiveSessionId). So resume button can appear/disappear with the same ping-pong.
   - End session clears background and content’s sessionIdOverride; if storage or broadcast is delayed, another tab or a later broadcast could briefly show old session.

4. **Race conditions**
   - **Order:** ECHLY_RESET_WIDGET and ECHLY_GLOBAL_STATE are sent in sequence from background, but content handles them asynchronously. If ECHLY_GLOBAL_STATE is processed before ECHLY_RESET_WIDGET, React state can have session; then ECHLY_RESET_WIDGET runs and clears loadSessionWithPointers and increments key. So widget remounts with clean state, but there can be a frame where old state is visible.
   - **Tab activation:** When switching tabs, background pushes ECHLY_GLOBAL_STATE to the new tab. If that tab’s content had previously “prevented” restore and cleared session, it now receives session again and may clear again on next effect run.

5. **Message loops**
   - No closed loop where A sends to B and B immediately sends back to A in a way that never stops. The “loop” is behavioral: **repeated broadcast (or GET_GLOBAL_STATE) → content applies state → effect clears session → next broadcast → repeat.**

### 11.6 Files responsible for issues

| Issue | Files |
|-------|--------|
| Ping-pong / wrong session visibility | content.tsx (effect that clears session without notifying background) |
| Repeated broadcasts / refresh | content.tsx (setInterval 2s dashboard, visibilitychange); background.ts (broadcast on every tab activation/creation) |
| Widget showing wrong screen after open | content.tsx (order of ECHLY_RESET_WIDGET vs ECHLY_GLOBAL_STATE handling; prevent-restore effect) |
| Session state inconsistency | background.ts (restore from storage and broadcast on load); content.tsx (local override of session state) |

### 11.7 Recommended minimal fixes (do not implement here)

1. **Remove or relax “prevent session restore” effect**  
   Either remove the effect that sets `setGlobalState(prev => ({ ...prev, sessionModeActive: false, sessionId: null }))`, or make it only run once on mount (e.g. ref guard) so it doesn’t keep clearing every time globalState has session. Alternatively, when content wants “no session” on open, have background clear session (e.g. on ECHLY_TOGGLE_VISIBILITY we already clear; ensure no other path restores and re-broadcasts before content has applied reset).

2. **Ensure ECHLY_RESET_WIDGET is applied before ECHLY_GLOBAL_STATE on open**  
   In background, when handling ECHLY_TOGGLE_VISIBILITY and visible becomes true: send ECHLY_RESET_WIDGET to all tabs and **wait** for them to process (or use a short delay) before calling broadcastUIState(), so content always applies reset before the new global state. Or have content, on ECHLY_RESET_WIDGET, ignore the next ECHLY_GLOBAL_STATE that has session (e.g. ignore once with a ref).

3. **Reduce dashboard interval or scope**  
   Replace setInterval(2000) with a single run on load + popstate, or only send ECHLY_SET_ACTIVE_SESSION when pathname actually changes, to avoid broadcasting every 2s to all tabs.

4. **Throttle or gate visibility sync**  
   On visibilitychange, only request ECHLY_GET_GLOBAL_STATE if the tab was hidden for more than a threshold (e.g. 1s) or if we don’t already have the same state, to cut down re-applies and effect re-runs.

5. **Single source of truth**  
   Decide whether “no session on widget open” is enforced only by ECHLY_TOGGLE_VISIBILITY + ECHLY_RESET_WIDGET (background + content reset), and remove any content-only clearing of session state that contradicts background. If content must override, add a message to background to clear session so the next broadcast doesn’t re-send it.

---

*End of report. No code was modified.*
