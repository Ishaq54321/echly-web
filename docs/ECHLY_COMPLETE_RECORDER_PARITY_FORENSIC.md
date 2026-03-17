# ECHLY Complete Recorder Parity Forensic Audit

**Goal:** Perform a complete forensic comparison between the extension recorder and the dashboard recorder so the dashboard recorder can be made 100% pixel-identical and behavior-identical to the extension recorder.

**Scope:** Analysis only. No code modifications.

**Output:** This document. Exhaustive and detailed.

---

## SECTION 1 — Extension Recorder Runtime Architecture

### Entry point and execution flow

- **File:** `echly-extension/src/content.tsx`
- **Invocation:** Content script is injected when the user opens the tray (e.g. extension icon click). Background uses `chrome.scripting.executeScript` to inject `content.js` if not already loaded (checked via `window.__ECHLY_WIDGET_LOADED__`).

### main()

1. **Guard:** `if (window.__ECHLY_WIDGET_LOADED__) return;` then `window.__ECHLY_WIDGET_LOADED__ = true`.
2. **Host lookup/create:** `let host = document.getElementById(SHADOW_HOST_ID)`. If missing:
   - `host = document.createElement("div")`, `host.id = "echly-shadow-host"`, `data-echly-ui="true"`.
   - Inline styles: `position: fixed`, `bottom: 24px`, `right: 24px`, `width: auto`, `height: auto`, `zIndex: 2147483647`, `display: none`, `pointerEvents: none`, `visibility: hidden`.
3. **Body wait:** `waitForBody(cb)` uses `MutationObserver` on `document.documentElement` until `document.body` exists, then:
   - `document.body.appendChild(host)`.
   - `mountReactApp(host)`.
   - `ensureMessageListener(host)`.
   - `chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, ...)` and apply normalized state (visibility + dispatch `ECHLY_GLOBAL_STATE`).
4. If host already existed: `ensureMessageListener(host)`, `syncInitialGlobalState(host)`.
5. **Global setup:** `ensureVisibilityStateRefresh()` (visibilitychange → ECHLY_GET_GLOBAL_STATE), `ensureScrollDebugListeners()`.

### Shadow host creation

- **Location:** Inside `mountReactApp(host)`.
- **Steps:**
  1. `injectPageStyles()` — adds `#echly-page-scroll-restore` style to `document.head`: `html, body { overflow: auto !important; }`.
  2. `shadowRoot = host.attachShadow({ mode: "open" })`.
  3. `injectShadowStyles(shadowRoot)`:
     - `<link id="echly-styles" rel="stylesheet" href={chrome.runtime.getURL("popup.css")}>` (only if not already present).
     - `<style id="echly-reset">` with `SHADOW_RESET`:
       - `:host { all: initial; }`
       - `#echly-root { all: initial; box-sizing: border-box; }`
       - `#echly-root * { box-sizing: border-box; }`
       - `#echly-capture-root { pointer-events: none !important; }`
  4. Container: `document.createElement("div")`, `id = ROOT_ID` ("echly-root"), `data-echly-ui="true"`, `style.all = "initial"`, `boxSizing = border-box`, `pointerEvents = auto`, `width/height = auto`, `data-theme = getPreferredTheme()`.
  5. `shadowRoot.appendChild(container)`.
  6. `createRoot(container).render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />)`.

### Capture root creation (extension)

- **Not in content.tsx.** The capture root is created by **useCaptureWidget** in `lib/capture-engine/core/hooks/useCaptureWidget.ts`.
- When `globalSessionModeActive` is true (and extensionMode): `createCaptureRoot()` runs.
- **Logic:** If `captureRootRef.current` already set, return. Else look for `document.getElementById("echly-capture-root")`. If found (e.g. in shadow DOM), reuse and set `pointer-events: none`. If not found: `captureEl = document.createElement("div")`, `id = "echly-capture-root"`, `style.pointerEvents = "none"`, `style.zIndex = "2147483645"`, `parent = captureRootParent ?? document.body`. **In extension, `captureRootParent` is the shadow root container (`widgetRoot` = `#echly-root`).** So `#echly-capture-root` is appended **inside the shadow DOM**.
- **Marker layer (extension):** When `extensionMode && globalSessionModeActive`, a div `id="echly-marker-layer"` is created and appended to **document.body** (so it is in the page, not shadow), with `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: 2147483644`. This allows `getElementById` and scroll/resize to work for markers on the page.

### How styles are isolated

- **Shadow DOM:** All React UI (ContentApp → CaptureWidget → sidebar, footer, mode tiles) renders inside the shadow root. The only styles that apply are:
  1. `popup.css` loaded via `<link>` in the shadow root (Tailwind + echly-* component styles).
  2. The inline `SHADOW_RESET` style.
- **Page styles do not penetrate** the shadow boundary. The host page’s global CSS does not affect the widget.
- **Capture root:** Lives inside shadow DOM; receives portal content (CaptureLayer → SessionOverlay, RegionCaptureOverlay). Portal target in CaptureLayer is `captureRootParent ?? captureRoot` → in extension, both are inside shadow DOM, so overlay styles come from popup.css.

### Runtime architecture diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PAGE (any tab)                                                                   │
│  document.body                                                                   │
│    └── #echly-shadow-host (fixed, bottom-right, z 2147483647)                     │
│          └── #shadow-root (open)                                                  │
│                ├── <link href="popup.css">                                        │
│                ├── <style> SHADOW_RESET (#echly-capture-root pointer-events:none)│
│                └── #echly-root (data-theme, data-echly-ui)                        │
│                      └── React Root → ContentApp(widgetRoot=#echly-root)          │
│                            ├── [optional] Clarity assistant overlay               │
│                            └── CaptureWidget(captureRootParent=#echly-root, …)    │
│                                  └── useCaptureWidget creates #echly-capture-root  │
│                                        as child of #echly-root (shadow)            │
│  document.body                                                                   │
│    └── #echly-marker-layer (when session active; z 2147483644, pointer-events:none)│
└─────────────────────────────────────────────────────────────────────────────────┘

Background (service worker)
  → ECHLY_GLOBAL_STATE, ECHLY_START_SESSION, ECHLY_OPEN_PREVIOUS_SESSIONS, etc.
  → chrome.tabs.sendMessage(tabId, …) to each tab
Content (content.tsx)
  → chrome.runtime.onMessage → setHostVisibility / dispatch ECHLY_GLOBAL_STATE custom event
  → ContentApp useState(globalState) ← ECHLY_GLOBAL_STATE event + mergeWithPointerProtection
  → CaptureWidget receives sessionId, pointers, expanded, captureMode, globalSessionModeActive, …
```

---

## SECTION 2 — Extension Global State Machine

### globalState structure (background + content)

Defined in `echly-extension/src/background.ts` as `globalUIState` and mirrored in content as `GlobalUIState` in `content.tsx`:

| Field | Type | Origin | Description |
|-------|------|--------|-------------|
| visible | boolean | Background | Tray opened by user (icon click / OPEN_WIDGET). |
| expanded | boolean | Background | Panel open (true) or minimized to launcher (false). |
| isRecording | boolean | Background | START_RECORDING / STOP_RECORDING. |
| sessionId | string \| null | Background | Active session ID from ECHLY_SET_ACTIVE_SESSION or create flow. |
| sessionTitle | string \| null | Background | From API when loading session or ECHLY_SESSION_UPDATED. |
| sessionModeActive | boolean | Background | Session started and not ended (ECHLY_SESSION_MODE_START, ECHLY_SESSION_MODE_END). |
| sessionPaused | boolean | Background | ECHLY_SESSION_MODE_PAUSE / ECHLY_SESSION_MODE_RESUME. |
| sessionLoading | boolean | Background | True while loading pointers after ECHLY_SET_ACTIVE_SESSION. |
| pointers | StructuredFeedback[] | Background | Feedback list; updated by ECHLY_FEEDBACK_CREATED, ECHLY_TICKET_UPDATED, ECHLY_SET_ACTIVE_SESSION load. |
| captureMode | "voice" \| "text" | Background | ECHLY_SET_CAPTURE_MODE. |

### Where these states originate

- **Background** is the single source of truth. It updates `globalUIState` in response to messages (ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_*, ECHLY_FEEDBACK_CREATED, ECHLY_SET_CAPTURE_MODE, etc.) and persists session lifecycle to `chrome.storage.local` (activeSessionId, sessionModeActive, sessionPaused). On startup it calls `initializeSessionState()` which reads storage and optionally reloads pointers from API.

### How they propagate to the widget

1. **Broadcast:** `broadcastUIState()` in background does `chrome.tabs.query({}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })))`.
2. **Content message listener:** In `ensureMessageListener(host)` (content.tsx), on `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state`: `setHostVisibilityFromState(state)`, `window.__ECHLY_APPLY_GLOBAL_STATE__?.(state)`, `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }))`.
3. **ContentApp state:** ContentApp has `const [globalState, setGlobalState] = useState<GlobalUIState>(...)`. It listens for:
   - `ECHLY_GLOBAL_STATE` custom event → `setGlobalState(prev => mergeWithPointerProtection(prev, s))` and `setHostVisibilityFromState(s)`.
   - On mount: `chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, response => setGlobalState(mergeWithPointerProtection(prev, state)))`.
   - On `visibilitychange`: when tab visible, request `ECHLY_GET_GLOBAL_STATE` and apply normalized state (visibility + setGlobalState with merge).
4. **CaptureWidget props:** ContentApp passes to CaptureWidget: `sessionId={effectiveSessionId}`, `pointers={globalState.pointers}`, `expanded={globalState.expanded}`, `captureMode={globalState.captureMode}`, `globalSessionModeActive={globalState.sessionModeActive}`, `globalSessionPaused={globalState.sessionPaused}`, `sessionLoading={globalState.sessionLoading}`, `sessionTitleProp={globalState.sessionTitle}`.

### mergeWithPointerProtection

- **Purpose:** Avoid overwriting a valid pointer list with empty when the session has not changed (e.g. Pause → Minimize → Resume).
- **Logic:** If `prev.sessionId === next.sessionId` and `prev.pointers` has length > 0 and `next.pointers` is empty, return `{ ...next, pointers: prev.pointers }`; else return `next`.

### State update pipeline summary

- **Background → Content:** `broadcastUIState()` or one-off `sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state })`. Also on tab activated/updated/created.
- **Content → Widget:** React state in ContentApp derived only from background; props to CaptureWidget are from that state.
- **Content → Background:** Content sends ECHLY_FEEDBACK_CREATED, ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_*, ECHLY_EXPAND_WIDGET, ECHLY_COLLAPSE_WIDGET, ECHLY_SET_CAPTURE_MODE, ECHLY_SESSION_UPDATED, ECHLY_TICKET_UPDATED, etc. Background updates globalUIState and calls broadcastUIState().

---

## SECTION 3 — Extension Event Pipeline

### Start Session

| Item | Detail |
|------|--------|
| Handler name | (Content) handler for `ECHLY_START_SESSION_REQUEST`; (Widget) `onStartSession` → `chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" })` |
| File | content.tsx (effect listening for ECHLY_START_SESSION_REQUEST); background.ts (ECHLY_START_SESSION) |
| Trigger | User clicks "Start Session" in WidgetFooter → CaptureWidget calls onStartSession → content sends ECHLY_START_SESSION. Background receives, sends ECHLY_START_SESSION to active tab. Content receives ECHLY_START_SESSION in message listener, dispatches ECHLY_START_SESSION_REQUEST. ContentApp effect runs createSession(). |
| chrome.runtime | Content → background: ECHLY_START_SESSION. Background → active tab: ECHLY_START_SESSION. After createSession() success: ECHLY_SESSION_MODE_START, onExpandRequest → ECHLY_EXPAND_WIDGET. |
| Downstream | createSession() → POST /api/sessions; on success onActiveSessionChange(id), ECHLY_SESSION_MODE_START, onExpandRequest(); on 403 setSessionLimitReached. |

### Previous Sessions

| Item | Detail |
|------|--------|
| Handler name | handlePreviousSessions (CaptureWidget), ECHLY_OPEN_PREVIOUS_SESSIONS listener (content + background) |
| File | CaptureWidget.tsx (handlePreviousSessions); content.tsx (chrome.runtime.onMessage ECHLY_OPEN_PREVIOUS_SESSIONS, effect ECHLY_OPEN_PREVIOUS_SESSIONS → setOpenResumeModalFromMessage(true)); background.ts (ECHLY_OPEN_PREVIOUS_SESSIONS → sendMessage to active tab) |
| Trigger | User clicks "Previous Sessions" → setResumeModalOpen(true), chrome.runtime.sendMessage(ECHLY_OPEN_PREVIOUS_SESSIONS). Or popup/other UI sends ECHLY_OPEN_PREVIOUS_SESSIONS → background forwards to active tab → content can set openResumeModalFromMessage. |
| chrome.runtime | Content sends ECHLY_OPEN_PREVIOUS_SESSIONS (optional); background receives ECHLY_OPEN_PREVIOUS_SESSIONS, sends to active tab. Content message listener for ECHLY_OPEN_PREVIOUS_SESSIONS: ECHLY_GET_AUTH_STATE then dispatch ECHLY_OPEN_PREVIOUS_SESSIONS custom event; ContentApp also has echlyEventDispatcher("ECHLY_OPEN_PREVIOUS_SESSIONS") → setOpenResumeModalFromMessage(true). |
| Downstream | ResumeSessionModal opens; onSelectSession → onPreviousSessionSelect(sessionId) → ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_START, optional apiFetch session URL and ECHLY_OPEN_TAB. |

### Voice (capture mode + recording)

| Item | Detail |
|------|--------|
| Handler name | setMode("voice") (CaptureWidget); startListening / finishListening (useCaptureWidget); onRecordingChange (content) |
| File | CaptureWidget.tsx (setMode → chrome.runtime.sendMessage ECHLY_SET_CAPTURE_MODE); useCaptureWidget.ts (startListening, finishListening); content.tsx (onRecordingChange → START_RECORDING / STOP_RECORDING) |
| Trigger | User selects Voice tile or toggles header → setMode("voice") → ECHLY_SET_CAPTURE_MODE. User starts voice (region "Speak feedback" or session element click) → startListening → recognition.start(), setState("voice_listening"). finishListening → recognition.stop(), onComplete(…) with callbacks. |
| chrome.runtime | ECHLY_SET_CAPTURE_MODE (mode: "voice"). START_RECORDING (when recording starts) / STOP_RECORDING (when stops) → background sets globalUIState.isRecording, broadcastUIState. |
| Downstream | Background updates captureMode and isRecording; content passes onRecordingChange to CaptureWidget so useCaptureWidget calls onRecordingChange(true/false) based on capture flow state. |

### Write (text mode)

| Item | Detail |
|------|--------|
| Handler name | setMode("text") |
| File | CaptureWidget.tsx (setMode); SessionOverlay → TextFeedbackPanel → onSaveText |
| Trigger | User selects Write tile or header toggle → setMode("text"). In session mode, element click opens TextFeedbackPanel; user submits text → onSaveText(transcript) → handleSessionFeedbackSubmit. |
| chrome.runtime | ECHLY_SET_CAPTURE_MODE (mode: "text"). |
| Downstream | globalUIState.captureMode = "text"; SessionOverlay shows TextFeedbackPanel instead of VoiceCapturePanel when sessionFeedbackPending. |

### Session End

| Item | Detail |
|------|--------|
| Handler name | onSessionModeEnd (content); endSession (useCaptureWidget) |
| File | content.tsx (onSessionModeEnd callback passed to CaptureWidget); useCaptureWidget.ts (endSession) |
| Trigger | User clicks End Session in SessionControlPanel → onSessionEnd() → handlers.endSession(() => { setShowCommandScreen(true); onSessionEndCallback(); }) → onSessionModeEnd(). Content’s onSessionModeEnd: chrome.runtime.sendMessage(ECHLY_SESSION_MODE_END), then after 50ms ECHLY_OPEN_TAB to dashboard session URL. |
| chrome.runtime | ECHLY_SESSION_MODE_END. Background clears activeSessionId, globalUIState session fields and pointers, storage, broadcastUIState, then ECHLY_RESET_WIDGET to all tabs. |
| Downstream | All tabs receive ECHLY_RESET_WIDGET → ContentApp handler sets expanded false and widgetResetKey++; removeCaptureRoot when globalSessionModeActive becomes false; removeAllMarkers(). |

### Pause / Resume

| Item | Detail |
|------|--------|
| Handler name | onSessionModePause, onSessionModeResume (content); pauseSession, resumeSession (useCaptureWidget) |
| File | content.tsx (passes callbacks that send ECHLY_SESSION_MODE_PAUSE / RESUME); useCaptureWidget.ts (pauseSession waits for pipeline if needed then onSessionModePause; resumeSession → onSessionModeResume) |
| Trigger | SessionControlPanel Pause → onSessionPause() → handlers.pauseSession(), onExpandRequest(). Resume → onSessionResume() → handlers.resumeSession(). |
| chrome.runtime | ECHLY_SESSION_MODE_PAUSE, ECHLY_SESSION_MODE_RESUME. Background sets sessionPaused, persistSessionLifecycleState(), broadcastUIState(), resetSessionIdleTimer(). |
| Downstream | Content globalState.sessionPaused updates; CaptureWidget and useCaptureWidget sync sessionPaused; pointer list preserved (mergeWithPointerProtection). |

### Capture submission (feedback created)

| Item | Detail |
|------|--------|
| Handler name | handleComplete (content); notifyFeedbackCreated (content); ECHLY_FEEDBACK_CREATED (background) |
| File | content.tsx (handleComplete, notifyFeedbackCreated); background.ts (ECHLY_FEEDBACK_CREATED) |
| Trigger | After /api/feedback (or ECHLY_PROCESS_FEEDBACK) creates a ticket, content calls notifyFeedbackCreated(firstCreated). |
| chrome.runtime | notifyFeedbackCreated → chrome.runtime.sendMessage({ type: "ECHLY_FEEDBACK_CREATED", ticket }). Background: globalUIState.pointers = [pointer, ...], resetSessionIdleTimer(), broadcastUIState(). Background also sends ECHLY_FEEDBACK_CREATED to all tabs (with ticket, sessionId) so content can dispatch custom event for any local use. |
| Downstream | All tabs get updated pointers via ECHLY_GLOBAL_STATE; tray list updates. |

---

## SECTION 4 — Extension UI Tree

Exact DOM structure rendered by the extension recorder (inside shadow root, under #echly-root).

### CaptureWidget (extensionMode true)

- **ResumeSessionModal** (when showResumeModal) — fetchSessions, onSelectSession, theme, checkAuth, onOpenLogin.
- **CaptureLayer** (when captureRootEl) — portaled to captureRoot (or captureRootParent). Contains:
  - SessionOverlay (when showSessionOverlay) — session controls, VoiceCapturePanel or TextFeedbackPanel when sessionFeedbackPending.
  - echly-focus-overlay (when showDimOverlay) — fixed inset 0, dim, crosshair.
  - RegionCaptureOverlay (when showRegionOverlay) — drag-to-select, confirm bar.
- **echly-floating-trigger-wrapper** (when showFloatingButton):
  - button.echly-floating-trigger.echly-launcher (when launcherLogoUrl) or .echly-floating-trigger with text "Echly" / "Capture feedback".
  - img.echly-launcher-logo (if launcher).
- **showPanel** (when effectiveIsOpen && (showSidebar || showSessionSidebar)):
  - Optional **echly-backdrop** (only when !extensionMode; extension does not render backdrop).
  - **echly-sidebar-container** (ref=widgetRef, extension: position fixed, state.position or bottom 24px right 24px, z 2147483647):
    - Optional **MicrophonePanel** (extensionMode && voice && micDropdownOpen).
    - **echly-sidebar-surface** (data-theme):
      - **CaptureHeader** (close, session title/ticket count, theme toggle, mode toggle, home).
      - **echly-sidebar-body** (or session limit upgrade body):
        - Session loading state (spinner + "Loading session...").
        - **echly-feedback-list** (processing/failed jobs + FeedbackItem list).
        - **echly-empty-session-state** ("No feedback yet...").
        - **echly-mode-container** (when extensionMode && showHomeScreen): echly-mode-header-block (echly-ai-powered, echly-mode-header), Voice and Write **echly-mode-tile** .echly-mode-card.
        - **echly-sidebar-error** (if state.errorMessage).
      - **echly-command-divider** (when !sessionLimitReached && showHomeScreen).
      - **WidgetFooter** (when !sessionLimitReached && showHomeScreen): **echly-command-actions** with **echly-start-session-btn** ("Start Session"), **echly-previous-session-btn** ("Previous Sessions" / "Opening...").

### CaptureLayer portal target

- Portal target = `captureRootParent ?? captureRoot`. Extension: captureRootParent = widgetRoot (#echly-root), so overlay and region UI are rendered inside the shadow DOM.

### Session sidebar / home screen

- **showSessionSidebar** = extensionMode && (globalSessionModeActive || globalSessionPaused). **showHomeScreen** = !(globalSessionModeActive || globalSessionPaused). So either session view (ticket list / empty / loading) or home (mode tiles + footer).

### Feedback pointers

- Rendered as **FeedbackItem** in **echly-feedback-list**; each item keyed by p.id, with onUpdate, onDelete, highlightTicketId, onExpandChange.

---

## SECTION 5 — Extension CSS System

### Shadow DOM CSS isolation

- **:host { all: initial; }** — resets the host element.
- **#echly-root** — all: initial, box-sizing: border-box; descendants * { box-sizing: border-box; }.
- **#echly-capture-root { pointer-events: none !important; }** — so page scroll/wheel pass through; overlay children use pointer-events: auto where needed.

### popup.css

- Loaded inside shadow root via `<link rel="stylesheet" href={chrome.runtime.getURL("popup.css")}>`. Contains Tailwind and all `.echly-*` component classes used by CaptureWidget, CaptureHeader, WidgetFooter, mode tiles, voice pill, session overlay, feedback list, etc. Key layout values (from audit):
  - .echly-sidebar-container: width 360px, max-height 520px, padding 6px.
  - .echly-sidebar-surface: border-radius 28px, padding 24px 20px, backdrop-filter, border, box-shadow.
  - .echly-sidebar-body: max-height 360px, overflow-y auto, gap 20px.
  - .echly-mode-tile: border-radius 14px, padding 16px.
  - .echly-command-actions: display flex, gap 12px.
  - .echly-start-session-btn, .echly-previous-session-btn: flex 1, height 48px, border-radius 10px.
  - .echly-floating-trigger-wrapper: position fixed, bottom 24px, right 24px.
  - .echly-launcher: width 3.5rem, height 3.5rem.
  - .echly-voice-pill: bottom 32px, height 48px, border-radius 14px, z-index 2147483647.
  - Theme: #echly-root[data-theme="dark"] / [data-theme="light"] and .dark / .light selectors for colors.

### Tailwind classes

- Used in CaptureWidget and children (e.g. list scroll, layout). All compiled into popup.css; no separate Tailwind build in page context.

### Component styles

- All echly-* classes live in popup.css; no inline style overrides for layout except where explicitly set in JSX (e.g. extension position fixed with state.position, CaptureLayer overlay positions).

### Z-index layering (extension)

- Host: 2147483647.
- #echly-capture-root: 2147483645 (inside shadow).
- echly-marker-layer (on body): 2147483644.
- Region overlay / Session overlay: 999999, 2147483645 as needed; voice pill 2147483647.
- Sidebar container (extension): 2147483647.

### Capture overlay stacking

- CaptureLayer uses createPortal(captureContent, portalTarget). portalTarget = captureRootParent ?? captureRoot. Content order: SessionOverlay, echly-focus-overlay (dim), RegionCaptureOverlay. All portaled into same root; stacking by DOM order and z-index on children (e.g. RegionCaptureOverlay #echly-overlay z-index 999999).

---

## SECTION 6 — Extension Capture Overlay System

### CaptureLayer.tsx

- **File:** `lib/capture-engine/core/CaptureLayer.tsx`
- **Behavior:** When extensionMode && (!sessionMode || !sessionIdProp) returns null. So in extension, overlay only shows when sessionMode and sessionIdProp are set.
- **showSessionOverlay** = sessionMode && extensionMode && globalSessionModeActive && sessionIdProp.
- **showRegionOverlay** = !showSessionOverlay && (state === "focus_mode" || state === "region_selecting").
- **showDimOverlay** = !showSessionOverlay && !showRegionOverlay && (focus_mode || region_selecting) — in practice when session overlay is shown, dim is not; when region flow is active, region overlay is shown so dim is not duplicated.
- **Portal:** captureContent is portaled to `portalTarget = captureRootParent ?? captureRoot`. Extension: captureRootParent is widgetRoot (#echly-root), so overlay renders inside shadow DOM.

### RegionCaptureOverlay.tsx

- **File:** `components/CaptureWidget/RegionCaptureOverlay.tsx`
- **Creation:** Rendered by CaptureLayer when showRegionOverlay. No separate creation; part of CaptureLayer portal.
- **Portal target:** Same as CaptureLayer (capture root inside shadow).
- **Behavior:** Full-screen #echly-overlay .echly-region-overlay (position fixed, inset 0, z 999999). Dim layer (crosshair, pointer-events), hint "Drag to capture area — ESC to cancel", cutout with box-shadow, confirmation bar "Retake" / "Speak feedback". onAddVoice(croppedDataUrl, context) → handleRegionCaptured in useCaptureWidget → startListening.
- **Event interception:** Mouse down/move/up on dim layer; Escape and visibilitychange cancel. pointer-events: auto on dim and confirm bar; cutout pointer-events: none.

### SessionOverlay.tsx

- **File:** `components/CaptureWidget/SessionOverlay.tsx`
- **Creation:** Rendered by CaptureLayer when showSessionOverlay (sessionMode && extensionMode && globalSessionModeActive && sessionIdProp).
- **Portal:** createPortal(content, captureRoot). So SessionOverlay content (dim layer when sessionFeedbackPending, cursor layer, SessionControlPanel, VoiceCapturePanel / TextFeedbackPanel) is rendered into captureRoot (inside shadow in extension).
- **Event interception:** attachElementHighlighter and attachClickCapture are called with captureRoot; getActive() considers sessionMode, !sessionPaused, !sessionActionPending, sessionFeedbackPending == null. Click capture calls onElementClicked(element) → handleSessionElementClicked. Body cursor set to COMMENT_CURSOR when sessionCursorActive.
- **pointer-events:** Dim layer and panels have pointer-events as needed; cursor layer pointer-events: none.

### Capture root behavior

- **Creation:** useCaptureWidget createCaptureRoot() when globalSessionModeActive (and extension). Parent = captureRootParent ?? document.body → extension: captureRootParent = widgetRoot, so root is inside shadow.
- **Removal:** removeCaptureRoot when !globalSessionModeActive (and extension). Extension keeps root while session is active across tabs.

### Event interception and pointer-events

- #echly-capture-root has pointer-events: none so wheel/scroll pass to page. Overlay divs and buttons use pointer-events: auto. Session highlighter and click capture run in page context; markers layer is pointer-events: none so clicks hit page then click capture handles.

---

## SECTION 7 — Extension Pointer Synchronization

### ECHLY_FEEDBACK_CREATED

- **Content:** After creating a ticket (handleComplete flow), content calls `notifyFeedbackCreated(firstCreated)` → `chrome.runtime.sendMessage({ type: "ECHLY_FEEDBACK_CREATED", ticket: { id, title, actionSteps, type } })`.
- **Background:** In background.ts, ECHLY_FEEDBACK_CREATED handler: builds `pointer` from ticket, `globalUIState.pointers = [pointer, ...globalUIState.pointers]`, resetSessionIdleTimer(), broadcastUIState(). Optionally also sends to all tabs `{ type: "ECHLY_FEEDBACK_CREATED", ticket, sessionId }` for any tab-local handling.
- **Content message listener:** If msg.type === "ECHLY_FEEDBACK_CREATED" and msg.ticket and msg.sessionId, content dispatches custom event ECHLY_FEEDBACK_CREATED (detail: ticket, sessionId). ContentApp does not use this for setState; it relies on ECHLY_GLOBAL_STATE which already includes updated pointers from broadcast.

### Background pointer updates

- **Sources:** (1) ECHLY_FEEDBACK_CREATED — prepend one pointer. (2) ECHLY_TICKET_UPDATED — map pointers, replace matching id. (3) ECHLY_SET_ACTIVE_SESSION — replace with API feedback list. (4) ECHLY_SESSION_MODE_END — pointers = []. After each update, broadcastUIState().

### ECHLY_GLOBAL_STATE broadcast

- broadcastUIState() sends { type: "ECHLY_GLOBAL_STATE", state: globalUIState } to every tab. Content applies with mergeWithPointerProtection and setGlobalState; setHostVisibilityFromState.

### CaptureWidget pointer update

- CaptureWidget receives pointers={globalState.pointers}. useCaptureWidget has effect: when extensionMode && pointersProp !== undefined, pointersPropRef.current = pointersProp, setPointers(pointersProp). So the tray list is always driven by background state.

---

## SECTION 8 — Extension Cross-Tab Behavior

### ECHLY_GLOBAL_STATE broadcast

- On every global state change, background calls broadcastUIState() → sendMessage to all tabs. So every open tab gets the same sessionId, sessionModeActive, sessionPaused, pointers, captureMode, visible, expanded.

### Session persistence

- activeSessionId, sessionModeActive, sessionPaused stored in chrome.storage.local. On startup, initializeSessionState() reads them and optionally fetches pointers from API; then broadcastUIState(). So after restart or new tab, tabs receive current session state.

### Pointer synchronization

- Pointers live only in background; all tabs receive the same list via ECHLY_GLOBAL_STATE. No per-tab pointer list.

### Session lifecycle across tabs

- **Start:** User starts session in one tab (ECHLY_START_SESSION → that tab’s content createSession → ECHLY_SESSION_MODE_START). Background sets sessionModeActive, sessionId, broadcast. All tabs show session sidebar and create #echly-capture-root (when their content script runs and gets state).
- **Tab switch:** tabs.onActivated → ensureContentScriptInjected(activeInfo.tabId), then sendMessage ECHLY_GLOBAL_STATE and ECHLY_SESSION_STATE_SYNC. Tab visibility change in content also requests ECHLY_GET_GLOBAL_STATE and reapplies. So the active tab always has latest state.
- **New tab:** tabs.onCreated → sendMessage ECHLY_GLOBAL_STATE (may fail if script not injected yet). tabs.onUpdated (status complete) + echlyActive → ensureContentScriptInjected, sendMessage ECHLY_GLOBAL_STATE. So new tabs get state once content is there.
- **End:** ECHLY_SESSION_MODE_END → background clears state, broadcast, then ECHLY_RESET_WIDGET to all tabs. Each tab’s ContentApp resets widget (expand false, key++); useCaptureWidget removeCaptureRoot, removeAllMarkers.

---

## SECTION 9 — Dashboard Recorder Runtime Architecture

### File and entry

- **File:** `app/(app)/dashboard/components/DashboardCaptureHost.tsx`
- **Usage:** Dashboard page (`app/(app)/dashboard/page.tsx`) has `<DashboardCaptureHost open={captureOpen} onClose={() => setCaptureOpen(false)} />`. captureOpen is toggled by "New Session" (onNewSession → setCaptureOpen(true)).

### Lifecycle

1. **Mount:** useState(mounted false); useEffect sets setMounted(true). So after first paint, mounted is true.
2. **Conditional render:** `if (!mounted || !open) return null`. So when open is false or before mount, nothing is rendered.
3. **Portal:** When open and mounted, `createPortal(<div id="echly-dashboard-capture-root" className="echly-dashboard-host" ...><CaptureWidget ... /></div>, document.body)`. So the host is portaled to **document.body**, not inside any shadow root.

### Mounting

- No shadow DOM. The host div is appended to document.body via React createPortal. CaptureWidget renders as a normal React subtree under that div. No waitForBody; the dashboard page already has body.

### Portal usage

- createPortal(hostDiv, portalRoot) with portalRoot = document.body. So the entire dashboard recorder UI (sidebar, floating button, CaptureLayer portal target) lives in document body. useCaptureWidget createCaptureRoot uses captureRootParent ?? document.body; Dashboard passes captureRootParent={document.body}, so #echly-capture-root is appended to **document.body** (same as dashboard host), not inside a shadow root.

### State management

- All state is local React: sessionId, sessionModeActive, sessionPaused, captureMode, hasPreviousSessions, pointers, sessionTitle, sessionLoading, sessionLimitReached. No chrome.runtime; no broadcast. environment is a useMemo that wraps authFetch and these setters (createSession → setSessionId, setSessionModeActive(true), etc.; setActiveSession → setSessionId; startSessionMode → setSessionModeActive(true); pause/resume/end → setSessionPaused / setSessionModeActive(false), clear session id/title/pointers). loadPointers(sessionId) and loadSessionTitle(sessionId) run in useEffect when sessionId changes.

### Environment adapter usage

- **environment** implements CaptureEnvironment: createSession (POST /api/sessions, on 403 setSessionLimitReached, else setSessionId, setSessionModeActive(true)), authenticatedFetch (authFetch), notifyFeedbackCreated (no-op), setActiveSession (setSessionId), startSessionMode (setSessionModeActive(true)), pause/resume/endSessionMode (setSessionPaused / setSessionModeActive false + clear state), reportActivity (no-op), expandWidget/collapseWidget (no-op), openLogin (window.location /login), openDashboard (window.location), captureTabScreenshot (canvas of window size, white fill — placeholder). useCaptureWidget uses environment for createSession, setActiveSession, startSessionMode, etc., when present; no chrome.runtime calls.

---

## SECTION 10 — Dashboard State Machine

### States the dashboard host implements

- sessionId (useState "")
- sessionModeActive (useState false)
- sessionPaused (useState false)
- captureMode (useState "voice")
- hasPreviousSessions (useState false)
- pointers (useState [])
- sessionTitle (useState "")
- sessionLoading (useState false)
- sessionLimitReached (useState null)

### Comparison table

| State | Extension source | Dashboard source | Missing or implemented |
|-------|------------------|------------------|-------------------------|
| visible | Background (tray open) | N/A (open prop from page) | Dashboard uses parent `open`; no “tray visible across tabs”. |
| expanded | Background (ECHLY_EXPAND/COLLAPSE) | Passed as `expanded={open}` | Implemented via prop; no cross-tab expand. |
| isRecording | Background (START/STOP_RECORDING) | Not tracked | Missing: dashboard does not maintain or pass isRecording. |
| sessionId | Background (ECHLY_SET_ACTIVE_SESSION, create) | Local setSessionId from environment | Implemented locally. |
| sessionTitle | Background (API load, ECHLY_SESSION_UPDATED) | loadSessionTitle(sessionId) + onSessionTitleChange | Implemented locally. |
| sessionModeActive | Background (ECHLY_SESSION_MODE_*) | setSessionModeActive from environment | Implemented locally. |
| sessionPaused | Background (ECHLY_SESSION_MODE_PAUSE/RESUME) | setSessionPaused from environment | Implemented locally. |
| sessionLoading | Background (during ECHLY_SET_ACTIVE_SESSION load) | setSessionLoading in onPreviousSessionSelect | Implemented (only during previous-session load). |
| pointers | Background (ECHLY_FEEDBACK_CREATED, ECHLY_SET_ACTIVE_SESSION, ECHLY_TICKET_UPDATED) | loadPointers(sessionId) + onComplete → loadPointers | Implemented locally; no cross-tab sync. |
| captureMode | Background (ECHLY_SET_CAPTURE_MODE) | handleCaptureModeChange → setCaptureMode | Implemented locally. |

---

## SECTION 11 — Dashboard Event Pipeline

### Start Session

- **Dashboard:** User clicks Start Session → onStartSession from CaptureWidget. In extensionMode with environment, useCaptureWidget startSession uses environment.createSession(), environment.setActiveSession(session.id), environment.startSessionMode(). So DashboardCaptureHost environment.createSession does POST, setSessionId(id), setSessionModeActive(true). No chrome.runtime; no forwarding to “active tab”.

### Previous Sessions

- **Dashboard:** onPreviousSessionSelect(id) → setSessionId(id), setSessionModeActive(true), setSessionLoading(true), loadPointers(id), then setSessionLoading(false). No ECHLY_OPEN_PREVIOUS_SESSIONS; modal is opened by user click (handlePreviousSessions sets setResumeModalOpen(true)). No message from popup.

### Voice / Write

- **Dashboard:** setMode in CaptureWidget: when chrome.runtime is unavailable, onCaptureModeChange?.(mode). Dashboard passes onCaptureModeChange={handleCaptureModeChange} → setCaptureMode(mode). So voice/text switching is implemented locally.

### Capture submit

- **Dashboard:** onComplete in DashboardCaptureHost: ensureSessionId(), structure-feedback and feedback POST via environment.authenticatedFetch, then callbacks.onSuccess(ticket), loadPointers(currentSessionId). No ECHLY_FEEDBACK_CREATED; no broadcast. Pointers update only in this host’s state.

### Divergence summary

- **Extension:** Start Session goes through background → active tab → createSession in content; state broadcast to all tabs. Previous Sessions can be opened via message; pointers and session state are global. Capture submit notifies background → broadcast.
- **Dashboard:** All actions are local. No background, no cross-tab, no ECHLY_* messages. Session and pointers are single-component state.

---

## SECTION 12 — Dashboard UI Tree

### Full DOM tree (dashboard)

- **document.body** (portal root)
  - **#echly-dashboard-capture-root.echly-dashboard-host** (position fixed, bottom 24px, right 24px, z 999999)
    - **CaptureWidget** (same component as extension, extensionMode=true)
      - Same logical structure: ResumeSessionModal, CaptureLayer (portal to captureRoot), floating trigger, sidebar container, etc.
      - **captureRootParent** = document.body → so #echly-capture-root is created as child of **document.body** (by useCaptureWidget), not inside a shadow root.
      - **#echly-marker-layer** (when session active): in useCaptureWidget, when !extensionMode the marker layer is appended inside #echly-capture-root; when extensionMode it is on document.body. So dashboard with extensionMode=true still creates marker layer on document.body (same as extension).

### Structural differences from extension

1. **No shadow host:** Dashboard has no #echly-shadow-host or #echly-root. Everything is under #echly-dashboard-capture-root in the light DOM.
2. **Capture root parent:** Extension: #echly-capture-root is inside #echly-root (shadow). Dashboard: #echly-capture-root is under document.body (sibling to #echly-dashboard-capture-root or under it depending on DOM order; createCaptureRoot does parent.appendChild(captureEl), parent = document.body).
3. **CSS scope:** Dashboard is subject to app globals.css and any other page CSS; extension widget is isolated in shadow DOM with popup.css only.
4. **Backdrop:** CaptureWidget renders echly-backdrop when !extensionMode; dashboard passes extensionMode=true so no backdrop (matches extension).
5. **Launcher:** Dashboard does not pass launcherLogoUrl; CaptureWidget shows text "Echly" for extensionMode without launcher URL (extension passes chrome.runtime.getURL("assets/Echly_logo_launcher.svg")).
6. **Theme:** Dashboard does not pass theme or onThemeToggle; CaptureWidget may use defaults (theme default "dark" in props).

---

## SECTION 13 — Pixel-Level Layout Comparison

### Spacing, margins, padding

- **Extension:** popup.css in shadow: .echly-sidebar-container padding 6px; .echly-sidebar-surface padding 24px 20px, border-radius 28px; .echly-sidebar-body gap 20px; .echly-command-divider margin-top 14px; .echly-mode-tile padding 16px; .echly-command-actions gap 12px.
- **Dashboard:** Same classes used; styles must come from globals.css. If globals.css duplicates popup.css values for .echly-* then layout can match; any difference in rules or cascade (e.g. Tailwind or app overrides) will change spacing.

### Font sizes, button sizes, border radius

- **Extension:** popup.css defines .echly-sidebar-title 20px, .echly-mode-card-title 14px, .echly-start-session-btn / .echly-previous-session-btn height 48px, border-radius 10px; .echly-sidebar-surface border-radius 28px; .echly-mode-tile border-radius 14px.
- **Dashboard:** Relies on globals.css. App globals.css contains many of the same .echly-* rules (see grep); exact pixel match depends on whether every rule is copied and whether selectors (e.g. #echly-root[data-theme]) apply. Dashboard host does not set data-theme on a wrapper #echly-root; theme may be applied via .dark / .light on body or a parent, so selector differences can cause mismatches.

### Icon alignment

- Same components (lucide-react); alignment is from same flex/gap classes. Any difference would come from CSS cascade (e.g. different line-height or font-size affecting inline icons).

### Overlay positioning

- **Extension:** Overlays portaled into shadow #echly-capture-root; position fixed relative to viewport; z-index 2147483645 on root, 999999 on region overlay.
- **Dashboard:** Overlays portaled into #echly-capture-root on document.body; same component code. If capture root is under a transformed/stacking context node in the app layout, positioning could differ; z-index 999999 vs app’s 999999 may stack differently if app uses high z-indices.

### Z-index stacking

- **Extension:** Host 2147483647; capture root 2147483645; marker layer 2147483644. All in same stacking context (shadow or body).
- **Dashboard:** Host wrapper has zIndex 999999 (style in DashboardCaptureHost). So dashboard host is 999999, not 2147483647. Capture root in useCaptureWidget is 2147483645; if it’s a sibling of the host div, stacking order depends on DOM order. Potential difference: dashboard host z-index is lower than extension host.

### List of differences (concise)

1. **Host z-index:** Extension 2147483647 vs dashboard 999999.
2. **Theme/root selector:** Extension #echly-root[data-theme] in shadow; dashboard may not have #echly-root, so theme selectors in globals might not apply the same.
3. **CSS source:** Extension: only popup.css + reset in shadow. Dashboard: globals.css + any app/Tailwind; possible overrides or missing rules.
4. **Launcher:** Extension shows logo image; dashboard shows text "Echly" (no launcherLogoUrl).
5. **Capture root location:** Extension inside shadow; dashboard on body — can affect stacking and any “contain”/overflow from parent.

---

## SECTION 14 — CSS Isolation Differences

### Extension shadow DOM CSS

- Widget and overlays live in shadow root. Only popup.css and SHADOW_RESET apply. Page CSS does not affect the widget. No leakage out; no leakage in.

### Dashboard CSS cascade

- Dashboard recorder is in the light DOM under body. It is affected by:
  - app/globals.css (imported in layout) — includes #echly-root, .echly-* rules and theme tokens.
  - Any other global styles, Tailwind utilities, or layout styles that apply to body or children.
- **Leakage in:** Global selectors (e.g. `body .some-class`, `input { }`) can change widget appearance. If globals.css uses #echly-root[data-theme] but the dashboard host is #echly-dashboard-capture-root and does not wrap content in #echly-root, those theme rules may not apply, causing color/font mismatches.
- **Leakage out:** Widget styles are scoped by class names (.echly-*); they don’t intentionally target page content. So no “out” leakage.

### Style leakage summary

- **Into widget:** Possible if app has broad rules (e.g. all buttons, all inputs). Theme and font variables (--echly-font, --text-primary, etc.) must be defined and applied in the same way; if dashboard layout doesn’t provide #echly-root or data-theme, theme blocks in globals may not apply.
- **From widget:** Minimal; echly-* classes are specific. Risk is high specificity in globals (e.g. #echly-root ...) that don’t match dashboard DOM and thus don’t apply, yielding different look.

---

## SECTION 15 — Overlay Behavior Comparison

### Capture root creation

- **Extension:** createCaptureRoot() appends #echly-capture-root to captureRootParent (widgetRoot = #echly-root in shadow). So root is inside shadow DOM.
- **Dashboard:** captureRootParent = document.body; #echly-capture-root is appended to document.body. Same timing: when globalSessionModeActive (dashboard: sessionModeActive) becomes true.

### Overlay portal target

- **Extension:** portalTarget = captureRootParent ?? captureRoot → widgetRoot (shadow). SessionOverlay and RegionCaptureOverlay render inside shadow.
- **Dashboard:** portalTarget = document.body (captureRoot) or same; overlays render on body. So overlay DOM is in the page, not in a shadow root.

### Z-index layering

- **Extension:** Capture root 2147483645; overlays inside it use 999999, etc. Marker layer on body 2147483644. Host 2147483647.
- **Dashboard:** Capture root 2147483645 on body; host 999999. If host and capture root are siblings, order depends on DOM order. Same overlay z-indices inside capture root.

### Pointer event blocking

- **Extension:** #echly-capture-root has pointer-events: none (SHADOW_RESET and createCaptureRoot). Overlay panels and buttons use auto. Page scroll works.
- **Dashboard:** useCaptureWidget sets captureEl.style.pointerEvents = "none" on the created div. Same intent. If dashboard page has a full-screen overlay or high z-index element, interaction could differ.

---

## SECTION 16 — Session Lifecycle Comparison

### Session creation

- **Extension:** User clicks Start Session → ECHLY_START_SESSION → background forwards to active tab → content createSession() → POST /api/sessions → onActiveSessionChange(id) → ECHLY_SESSION_MODE_START → onExpandRequest(). Background sets activeSessionId, sessionModeActive, sessionId, expanded, persistSessionLifecycleState(), broadcastUIState(). All tabs get new session.
- **Dashboard:** User clicks Start Session → startSession (useCaptureWidget) → environment.createSession() → POST, setSessionId(id), setSessionModeActive(true). No broadcast; single component state.

### Session activation (resume previous)

- **Extension:** User selects session from modal → onPreviousSessionSelect(sessionId) → ECHLY_SET_ACTIVE_SESSION. Background loads pointers and session title from API, sets globalUIState, broadcast. Optional ECHLY_OPEN_TAB(session URL).
- **Dashboard:** onPreviousSessionSelect(id) → setSessionId(id), setSessionModeActive(true), setSessionLoading(true), loadPointers(id), setSessionLoading(false). No cross-tab; no open tab to URL.

### Session end

- **Extension:** onSessionModeEnd → ECHLY_SESSION_MODE_END. Background clears session and pointers, storage, broadcast, ECHLY_RESET_WIDGET to all tabs. Content onSessionModeEnd also opens dashboard tab (ECHLY_OPEN_TAB) after 50ms.
- **Dashboard:** onSessionModeEnd → setSessionModeActive(false), setSessionPaused(false), setSessionId(""), setSessionTitle(""), setPointers([]). No broadcast, no reset widget event, no open dashboard URL (could be added in onClose or a callback).

### Pointer loading

- **Extension:** Pointers loaded in background on ECHLY_SET_ACTIVE_SESSION (and on startup if session restored). Content receives pointers only via ECHLY_GLOBAL_STATE. No per-tab fetch for list.
- **Dashboard:** loadPointers(sessionId) in host when sessionId changes; also after onComplete (loadPointers(currentSessionId)). So pointers are fetched in the host and passed as props.

### Divergence summary

- **Dashboard** has no cross-tab state, no broadcast, no ECHLY_RESET_WIDGET, no post-end “open dashboard session URL”. Session and pointer lifecycle are local only.

---

## SECTION 17 — Cross-Tab Behavior Comparison

### Why extension tray works across tabs

- **Single source of truth:** Background holds sessionId, sessionModeActive, sessionPaused, pointers, captureMode, visible, expanded.
- **Injection on demand:** When tray is open (echlyActive), tabs.onActivated and tabs.onUpdated call ensureContentScriptInjected(tabId) so every tab gets the content script.
- **Broadcast on every change:** broadcastUIState() sends full state to all tabs. So every tab’s ContentApp gets the same state.
- **Visibility:** getShouldShowTray(state) keeps tray visible when visible || sessionModeActive || sessionPaused, so minimized tray stays visible on all tabs during a session.
- **Capture root and markers:** Each tab creates its own #echly-capture-root (in that tab’s shadow) and marker layer when globalSessionModeActive; overlays are per-tab, state is shared.

### Why dashboard tray does not

- **No background:** There is no cross-tab process. Dashboard is one page; there are no “other tabs” to sync.
- **Single page:** By definition the dashboard recorder only exists on the dashboard page. So “cross-tab” is N/A unless the product adds multiple windows or workers and explicit sync.

### Missing architecture pieces to replicate cross-tab in dashboard

- To replicate “same session and pointers everywhere” across multiple dashboard tabs/windows you would need:
  1. A shared store (e.g. server session, or shared worker / BroadcastChannel) that holds sessionId, sessionModeActive, sessionPaused, pointers, captureMode.
  2. Each “tab” or window subscribing to that store and deriving UI state from it.
  3. Any mutation (start session, add feedback, pause, end) updating the store and notifying subscribers.
  4. Optional: URL or session storage so that opening a new tab to “dashboard” joins the same session.

---

## SECTION 18 — Capture Mode Behavior

### Voice vs text switching (extension)

- User clicks Voice or Write tile (or header toggle) → setMode("voice" | "text") → chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode }). Background sets globalUIState.captureMode, broadcast. CaptureWidget receives captureMode from ContentApp globalState. SessionOverlay shows VoiceCapturePanel or TextFeedbackPanel based on captureMode when sessionFeedbackPending.

### Voice vs text switching (dashboard)

- setMode → onCaptureModeChange(mode) (no chrome) → handleCaptureModeChange → setCaptureMode(mode). CaptureWidget receives captureMode prop from host state. Same SessionOverlay logic; only the source of captureMode differs (local state vs background).

### Pipeline (extension)

- ECHLY_SET_CAPTURE_MODE → background → broadcast → content setGlobalState → CaptureWidget captureMode prop → useCaptureWidget and CaptureLayer → SessionOverlay captureMode → Voice vs Text panel.

### Pipeline (dashboard)

- setMode → onCaptureModeChange → setCaptureMode → CaptureWidget captureMode prop → same downstream. No broadcast.

---

## SECTION 19 — Root Cause Summary

Every functional and presentational difference between extension and dashboard recorder, with file references.

1. **No shadow DOM (dashboard)**  
   - **Cause:** Dashboard mounts via createPortal to document.body; no host.attachShadow.  
   - **Files:** DashboardCaptureHost.tsx (createPortal to body); content.tsx (mountReactApp with shadow).

2. **Capture root on body (dashboard)**  
   - **Cause:** captureRootParent={document.body} and no shadow root.  
   - **Files:** DashboardCaptureHost.tsx (captureRootParent={document.body}); content.tsx (widgetRoot = #echly-root in shadow passed as captureRootParent).

3. **CSS from globals vs popup in shadow**  
   - **Cause:** Dashboard uses app globals.css; extension uses popup.css only inside shadow.  
   - **Files:** app/globals.css, app/layout.tsx (import globals); content.tsx (injectShadowStyles with popup.css).

4. **No #echly-root / data-theme on host (dashboard)**  
   - **Cause:** Host is #echly-dashboard-capture-root; no #echly-root wrapper. Theme selectors in globals target #echly-root[data-theme].  
   - **Files:** DashboardCaptureHost.tsx; globals.css (#echly-root[...]).

5. **Host z-index 999999 vs 2147483647**  
   - **Cause:** Dashboard host style sets zIndex: 999999.  
   - **Files:** DashboardCaptureHost.tsx (style).

6. **No launcher logo (dashboard)**  
   - **Cause:** launcherLogoUrl not passed.  
   - **Files:** DashboardCaptureHost.tsx (missing prop); content.tsx (launcherLogoUrl from chrome.runtime.getURL).

7. **No theme / onThemeToggle (dashboard)**  
   - **Cause:** theme and onThemeToggle not passed; CaptureWidget defaults theme "dark".  
   - **Files:** DashboardCaptureHost.tsx (missing props); content.tsx (theme state, onThemeToggle, getPreferredTheme).

8. **No feedbackJobs / isProcessingFeedback (dashboard)**  
   - **Cause:** Extension handleComplete uses feedbackJobs and isProcessingFeedback for multi-job UI; dashboard onComplete does not maintain a job queue or pass these.  
   - **Files:** content.tsx (feedbackJobs state, isProcessingFeedback, job queue); DashboardCaptureHost.tsx (onComplete does not push to jobs).

9. **No notifyFeedbackCreated broadcast (dashboard)**  
   - **Cause:** environment.notifyFeedbackCreated is no-op; no cross-tab or global list update.  
   - **Files:** DashboardCaptureHost.tsx (environment.notifyFeedbackCreated = () => {}); content.tsx (notifyFeedbackCreated → ECHLY_FEEDBACK_CREATED).

10. **No onRecordingChange (dashboard)**  
    - **Cause:** Extension uses START_RECORDING/STOP_RECORDING and onRecordingChange for global isRecording. Dashboard does not pass onRecordingChange.  
    - **Files:** content.tsx (onRecordingChange); DashboardCaptureHost.tsx (not passed).

11. **No onSessionEnd callback to open dashboard URL (dashboard)**  
    - **Cause:** Extension onSessionModeEnd opens dashboard session URL via ECHLY_OPEN_TAB. Dashboard onSessionModeEnd only clears state.  
    - **Files:** content.tsx (onSessionModeEnd with ECHLY_OPEN_TAB); DashboardCaptureHost.tsx (onSessionModeEnd only clears state).

12. **No ECHLY_RESET_WIDGET / widget reset key (dashboard)**  
    - **Cause:** Extension resets widget on session end via ECHLY_RESET_WIDGET (expand false, key++). Dashboard has no equivalent.  
    - **Files:** content.tsx (ECHLY_RESET_WIDGET listener, widgetResetKey); background (ECHLY_SESSION_MODE_END → ECHLY_RESET_WIDGET).

13. **Pointers and session state are local (dashboard)**  
    - **Cause:** No background; state is React state in DashboardCaptureHost.  
    - **Files:** DashboardCaptureHost.tsx (useState for all); background.ts + content.tsx (global state + broadcast).

14. **Previous session load and session URL (dashboard)**  
    - **Cause:** Extension can ECHLY_OPEN_TAB(session.url) when resuming; dashboard onPreviousSessionSelect does not navigate.  
    - **Files:** content.tsx (onPreviousSessionSelect with apiFetch session URL and ECHLY_OPEN_TAB); DashboardCaptureHost (onPreviousSessionSelect only sets session and loadPointers).

15. **openResumeModal / onResumeModalClose (dashboard)**  
    - **Cause:** Extension can open resume modal via message (ECHLY_OPEN_PREVIOUS_SESSIONS); dashboard only opens modal on user click. No openResumeModal/onResumeModalClose passed.  
    - **Files:** content.tsx (openResumeModalFromMessage, onResumeModalClose); DashboardCaptureHost (not passed).

16. **captureTabScreenshot (dashboard)**  
    - **Cause:** Dashboard environment.captureTabScreenshot returns a white canvas data URL (placeholder). Extension uses CAPTURE_TAB from background (real tab screenshot).  
    - **Files:** DashboardCaptureHost.tsx (environment.captureTabScreenshot); ExtensionCaptureEnvironment + background (CAPTURE_TAB).

17. **Idle timeout and ECHLY_SESSION_ACTIVITY (dashboard)**  
    - **Cause:** Extension has 30-min idle timeout and ECHLY_SESSION_ACTIVITY to reset it. Dashboard onSessionActivity is no-op; no idle timeout.  
    - **Files:** background.ts (SESSION_IDLE_TIMEOUT, resetSessionIdleTimer, ECHLY_SESSION_ACTIVITY); DashboardCaptureHost (onSessionActivity = () => {}).

---

## SECTION 20 — Complete Fix Plan

Each item: file, function (or area), required change. No implementation; specification only.

1. **DashboardCaptureHost.tsx — host wrapper**  
   - Add a wrapper that provides shadow DOM: create a host div, attachShadow, inject styles (same reset + load or inline a copy of popup.css or a dashboard-specific bundle), create #echly-root with data-theme, mount CaptureWidget inside that root. Portal the host to document.body so the rest of the app is unchanged.  
   - **Required change:** Mount CaptureWidget inside a shadow root with #echly-root and the same style isolation as content.tsx.

2. **DashboardCaptureHost.tsx — captureRootParent**  
   - Pass captureRootParent as the shadow root’s #echly-root element (or the container that receives #echly-capture-root) so that #echly-capture-root is created inside the shadow DOM, not on document.body.  
   - **Required change:** captureRootParent = ref to #echly-root inside the new shadow host.

3. **DashboardCaptureHost.tsx — CSS**  
   - Ensure all styles that apply to the extension widget (popup.css + SHADOW_RESET) are loaded into the dashboard shadow root. Either inject the same popup.css URL (if served by app) or bundle the same rules into a style that is injected into the shadow root.  
   - **Required change:** Shadow root must receive the same CSS as the extension (popup.css equivalent + reset).

4. **DashboardCaptureHost.tsx — theme**  
   - Add theme state (e.g. from localStorage or user preference), set data-theme on #echly-root, and pass theme and onThemeToggle to CaptureWidget.  
   - **Required change:** theme and onThemeToggle props; #echly-root has data-theme.

5. **DashboardCaptureHost.tsx — host z-index**  
   - Set the host (or shadow host) z-index to 2147483647 to match the extension.  
   - **Required change:** style or class so host z-index is 2147483647.

6. **DashboardCaptureHost.tsx — launcherLogoUrl**  
   - Pass launcherLogoUrl to CaptureWidget (e.g. static asset URL for the same logo used in extension).  
   - **Required change:** launcherLogoUrl prop.

7. **DashboardCaptureHost.tsx — feedbackJobs and isProcessingFeedback**  
   - Maintain a feedback job queue in host state (processing/failed per submit). Pass feedbackJobs and isProcessingFeedback to CaptureWidget; in onComplete, add a job on start, remove/update on success/error.  
   - **Required change:** feedbackJobs state, isProcessingFeedback derived or state; pass both to CaptureWidget; onComplete integrates with job queue.

8. **DashboardCaptureHost.tsx — notifyFeedbackCreated**  
   - If a shared/store layer is added for parity (e.g. refresh list from server), call it from environment.notifyFeedbackCreated after a ticket is created (e.g. refetch pointers or push to shared list). For strict “single-page” parity without cross-tab, ensure at least that the local pointers list is updated (already done via loadPointers); for API parity with extension, notifyFeedbackCreated could trigger loadPointers or a callback.  
   - **Required change:** environment.notifyFeedbackCreated implementation that keeps pointer list in sync (e.g. loadPointers or append to local state).

9. **DashboardCaptureHost.tsx — onRecordingChange**  
   - Optional for strict parity: add local isRecording state and pass onRecordingChange that sets it (and use it in UI if needed). Extension uses it for background; dashboard may only need it if UI shows a global “recording” indicator.  
   - **Required change:** If targeting full parity, add onRecordingChange callback that updates host state (e.g. setRecording(bool)).

10. **DashboardCaptureHost.tsx — onSessionModeEnd**  
    - In onSessionModeEnd (or onClose when session ends), open the dashboard session URL (e.g. window.location.href = `/dashboard/${sessionId}` or router.push) before or after clearing state, to match extension’s ECHLY_OPEN_TAB behavior.  
    - **Required change:** onSessionModeEnd (or equivalent) navigates to dashboard session page when session ends.

11. **DashboardCaptureHost.tsx — widget reset on session end**  
    - When session ends, force widget to reset (e.g. expand false, or remount key) so that expand/collapse and internal state match post-end behavior of extension (ECHLY_RESET_WIDGET).  
    - **Required change:** On session end, set expanded to false and/or increment a key on the CaptureWidget so it resets.

12. **DashboardCaptureHost.tsx — openResumeModal / onResumeModalClose**  
    - If the product wants “open previous sessions from elsewhere” (e.g. from a header button), add openResumeModal state and onResumeModalClose; pass them to CaptureWidget. Otherwise document that dashboard only opens the modal on click.  
    - **Required change:** For parity with extension’s message-driven modal open: add openResumeModal and onResumeModalClose and pass to CaptureWidget.

13. **DashboardCaptureHost.tsx — captureTabScreenshot**  
    - Replace the placeholder (white canvas) with a real capture: use a library or browser API to capture the current view (e.g. html2canvas, or same approach as extension if running in a context that allows it). If the dashboard is the “page” being captured, document.body or a specific node can be drawn to canvas.  
    - **Required change:** environment.captureTabScreenshot returns a real screenshot of the dashboard (or the relevant area), not a white image.

14. **DashboardCaptureHost.tsx — onSessionActivity**  
    - If implementing idle timeout for dashboard: add a session idle timer (e.g. 30 min) and reset it in onSessionActivity. Pass onSessionActivity from useCaptureWidget (it already calls it on element click); implement reportActivity in environment to reset the timer and end session on timeout.  
    - **Required change:** Optional: environment.reportActivity and a local idle timer that calls endSessionMode on timeout; onSessionActivity passed and used.

15. **DashboardCaptureHost.tsx — onPreviousSessionSelect and session URL**  
    - If “open session URL” is desired when resuming: in onPreviousSessionSelect, fetch session (e.g. GET /api/sessions/:id), get session.url if present, and navigate (e.g. router.push(session.url) or window.location).  
    - **Required change:** Optional: after setSessionId and loadPointers, if session has a URL, navigate to it.

16. **app/globals.css (or dashboard-specific CSS)**  
    - Ensure every .echly-* and #echly-root rule used by the widget is either (a) redundant because the widget is now in a shadow root with its own CSS, or (b) still correct when the dashboard host uses a shadow root with #echly-root and data-theme. If styles are moved into the shadow bundle, remove or narrow globals so they don’t conflict.  
    - **Required change:** Align theme and layout rules with shadow-DOM widget (or remove duplicates and rely on shadow CSS only).

17. **useCaptureWidget.ts — marker layer (dashboard)**  
    - When extensionMode is true and capture root is inside shadow DOM, marker layer must still be on document.body (so getElementById and scroll/resize work). useCaptureWidget already creates marker layer on body for extensionMode. For dashboard with shadow DOM, ensure capture root is inside shadow and marker layer remains on body; no change if captureRootParent is the shadow container.  
    - **Required change:** Verify marker layer stays on document.body when dashboard uses shadow root; adjust only if current logic puts it inside shadow (current code: extensionMode → body; !extensionMode → inside capture root).

18. **CaptureWidget / CaptureLayer**  
    - No change required for parity if DashboardCaptureHost provides the same props and captureRootParent as the extension content script. Ensure CaptureLayer portal target and showSessionOverlay/showRegionOverlay conditions are unchanged.  
    - **Required change:** None unless props or behavior differ; then align with extension.

19. **Session lifecycle (dashboard)**  
    - Implement session end navigation, optional idle timeout, and optional session URL on resume as above.  
    - **Required change:** As in items 10, 11, 14, 15.

20. **Cross-tab (dashboard)**  
    - To fully replicate extension cross-tab behavior, introduce a shared store (server session + polling or BroadcastChannel/localStorage + storage event) and have each “tab” or window subscribe; update store on session/pointer changes and derive UI state from it. This is a larger architectural change.  
    - **Required change:** Design and implement shared session/pointer state across tabs or windows if product requires it.

---

## FINAL RESULT

This report contains:

- **Sections 1–8:** Extension recorder runtime, state machine, event pipeline, UI tree, CSS, overlay system, pointer sync, cross-tab behavior.
- **Sections 9–12:** Dashboard recorder runtime, state, events, UI tree and comparison.
- **Sections 13–18:** Pixel/layout, CSS isolation, overlay, session lifecycle, cross-tab, and capture mode comparison.
- **Section 19:** Root cause summary with file references for every identified difference.
- **Section 20:** Fix plan with file, function/area, and required change for each item (no code written).

Using this document, the dashboard recorder can be made **100% pixel-identical and behavior-identical** to the extension recorder by implementing the listed changes and ensuring shadow DOM, CSS, props, and lifecycle match the extension as specified.

**END**
