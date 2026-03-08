# Echly Browser Extension — Architecture & UI Audit

**Scope:** Browser extension runtime and injected widget only. Excludes web dashboard, marketing pages, server infrastructure, and backend business logic not used by the extension UI.

**Audit type:** Analysis and documentation only. No code modifications.

---

## 1. Extension Overview

### 1.1 Manifest and entrypoints

| Asset | Location | Purpose |
|-------|----------|--------|
| **manifest.json** | `echly-extension/manifest.json` | MV3 manifest: permissions, content_scripts, background, action, web_accessible_resources |
| **Background** | `echly-extension/background.js` (built from `src/background.ts`) | Service worker: auth, tokens, global UI state, API proxy, screenshot upload |
| **Content script** | `echly-extension/content.js` (built from `src/content.tsx`) | Injected on `<all_urls>` at `document_idle`; mounts widget in shadow DOM |
| **Popup** | `echly-extension/popup.html` + `popup.js` (from `src/popup.tsx`) | Action popup: sign-in and toggle widget visibility |
| **Injected scripts** | None | All page UI is rendered by the content script inside a shadow root; no separate injected script bundle |

### 1.2 Permissions

- **identity** — Google OAuth (launchWebAuthFlow)
- **storage** — chrome.storage.local (tokens, session, UI state)
- **activeTab** — tab capture for screenshots
- **tabs** — query/sendMessage to all tabs for state broadcast
- **host_permissions:** `<all_urls>`, localhost:3000, echly-web.vercel.app, Firebase/Google auth domains

### 1.3 Build

- **Script:** `npm run build:extension` → `build:extension:css` + `build:extension:js`
- **CSS:** PostCSS from `app/globals.css` → `echly-extension/popup.css` (used by widget via link in shadow root)
- **JS:** `node esbuild-extension.mjs` builds:
  - `echly-extension/src/popup.tsx` → `popup.js`
  - `echly-extension/src/content.tsx` → `content.js` (alias `@/lib/authFetch` → `contentAuthFetch.ts`)
  - `echly-extension/src/background.ts` → `background.js`
- **Content script** bundles the full CaptureWidget tree from `components/CaptureWidget` and shared `lib/` (e.g. `captureContext`, `playShutterSound`, `playDoneClick`). Extension-only stubs: `next/image` → `echly-extension/stubs/next-image.tsx`, `@/lib/firebase` → `echly-extension/src/firebase.ts`.

### 1.4 Initialization and injection

1. **Load:** User installs/loads extension → background service worker starts; content script is registered for `<all_urls>`.
2. **Page load:** On each page, the browser injects `content.js` at `document_idle`.
3. **Content `main()`:** Runs once: creates a single host `#echly-shadow-host` (fixed bottom-right, initially `display:none`), attaches open shadow root, injects styles (link to `popup.css` + inline reset), creates `#echly-root` div, and mounts React with `<ContentApp widgetRoot={container} initialTheme={…} />`.
4. **ContentApp:** Fetches auth state and global state from background; if not authenticated, renders “Sign in from extension” (no widget). If authenticated, renders `<CaptureWidget … />` with extension-specific props (`extensionMode`, `onComplete`, session callbacks, etc.).
5. **Visibility:** Widget host is shown/hidden only when background sets `globalUIState.visible` and broadcasts `ECHLY_GLOBAL_STATE`; content script sets `host.style.display` from that state. No re-mount on toggle.

### 1.5 Extension ↔ page communication

- **Extension ↔ page:** The “page” is the same document as the content script. The widget runs in the content script context inside a shadow root. There is no separate injected script; the content script is the only extension code in the page. Communication with the page is therefore direct (same JS context): e.g. `document.body`, `document.elementsFromPoint`, `window.location`, `buildCaptureContext(window, element)`.
- **Content ↔ background:** `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`. Content sends: `ECHLY_GET_GLOBAL_STATE`, `ECHLY_GET_ACTIVE_SESSION`, `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_GET_TOKEN`, `ECHLY_GET_AUTH_STATE`, `ECHLY_OPEN_POPUP`, `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, session lifecycle (`ECHLY_SESSION_MODE_*`), `START_RECORDING`/`STOP_RECORDING`, `CAPTURE_TAB`, `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, `echly-api` (generic fetch proxy). Background sends to tabs: `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`.
- **Backend API:** Content script does not call the API with a token directly. It uses `apiFetch()` in `contentAuthFetch.ts`, which sends an `echly-api` message to the background; the background calls `getValidToken()` and performs `fetch(url, { headers: { Authorization: Bearer … } })`. Screenshot upload and fallback feedback submission use `ECHLY_UPLOAD_SCREENSHOT` and `ECHLY_PROCESS_FEEDBACK`, which also run in the background with the same token.

---

## 2. Extension Runtime Architecture

### 2.1 Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Background service worker** | Single source of truth for: auth (Firebase ID token, refresh, storage), global UI state (visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused). Handles: tab capture (`CAPTURE_TAB`), screenshot upload (`ECHLY_UPLOAD_SCREENSHOT`), fallback feedback pipeline (`ECHLY_PROCESS_FEEDBACK`), generic API proxy (`echly-api`). Broadcasts state to all tabs on change and on tab activation/creation. |
| **Content script** | One-time mount of shadow host and React app. Listens for `ECHLY_GLOBAL_STATE` (and `ECHLY_FEEDBACK_CREATED`, `ECHLY_TOGGLE`). Hydrates from background on load and on visibility change. Provides ContentApp: auth state, session list, create session, resume session, feedback pipeline (structure-feedback + feedback + ticket PATCH), clarity assistant UI. Renders CaptureWidget with extension-only props and ref for toggle. |
| **Injected widget UI** | CaptureWidget and children (sidebar, capture overlay, session overlay, feedback list). All UI lives under the content script’s shadow root; no separate “injected” script. |
| **Message passing** | Request/response via `chrome.runtime.sendMessage`; async handlers return `true` and call `sendResponse` later. Broadcast: background → all tabs `ECHLY_GLOBAL_STATE`; background → all tabs `ECHLY_FEEDBACK_CREATED` after creating a ticket. |

### 2.2 Data flow (high level)

- **User opens popup (authenticated):** Popup sends `ECHLY_TOGGLE_VISIBILITY` → background flips `visible` → broadcast `ECHLY_GLOBAL_STATE` → content sets host display and state → widget appears.
- **User clicks “Add feedback” (region flow):** Widget calls `handleAddFeedback` → createCaptureRoot (creates `#echly-capture-root` on document.body) → set state `focus_mode` → CaptureLayer shows RegionCaptureOverlay → user drags region → capture → getFullTabImage (message `CAPTURE_TAB`) → crop → buildCaptureContext → onAddVoice(cropped, context) → start voice → transcript → onComplete (content’s handleComplete) → apiFetch structure-feedback / feedback, upload screenshot via background, PATCH ticket.
- **User starts “Start New Feedback Session”:** Widget calls startSession → onCreateSession (content: POST /api/sessions) → onActiveSessionChange(sessionId) → content sends `ECHLY_SET_ACTIVE_SESSION` → background stores and broadcasts → onSessionModeStart() → content sends `ECHLY_SESSION_MODE_START` → background sets sessionModeActive, broadcast → all tabs create capture root and show SessionOverlay.
- **Session: click element on page:** SessionOverlay has click capture and highlighter → click → handleSessionElementClicked → CAPTURE_TAB → cropAroundElement → buildCaptureContext → setSessionFeedbackPending → SessionFeedbackPopup (voice or text) → submit → same pipeline (structure-feedback, feedback, upload, PATCH).

---

## 3. Widget UI Architecture

The injected UI is a single React tree under the content script: **ContentApp** → **CaptureWidget** (and optional clarity assistant overlay). No LauncherView/SessionTray/RecordingFloatingUI in this tree (those components exist in the repo but are not used by the extension).

### 3.1 Root and host

- **#echly-shadow-host:** Fixed, bottom-right, z-index 2147483647; created once by content `main()`; visibility = `display: block | none` from global state.
- **Shadow root:** Open; contains link to `popup.css`, inline reset, and `#echly-root` (data-theme, box-sizing).
- **#echly-root:** React root; React renders ContentApp then CaptureWidget (when authenticated).

### 3.2 ContentApp (content.tsx)

- **Unauthenticated:** Renders a single “Sign in from extension” button (opens popup via `ECHLY_OPEN_POPUP`).
- **Authenticated:** Renders optional **Clarity Assistant** modal (when clarity score ≤ 20 or needsClarification) and **CaptureWidget** with all extension props (sessionId, onComplete, widgetToggleRef, expanded, onExpandRequest/onCollapseRequest, theme, fetchSessions, onResumeSessionSelect, loadSessionWithPointers, session mode callbacks, etc.).

---

## 4. Component Hierarchy

```
ContentApp (content.tsx)
├── [optional] Clarity Assistant overlay (inline JSX)
└── CaptureWidget
    ├── ResumeSessionModal (extension only, when open)
    ├── CaptureLayer (portaled to #echly-capture-root when captureRootEl exists)
    │   ├── SessionOverlay (when sessionMode && extensionMode)
    │   │   ├── SessionControlPanel (Pause / Resume / End)
    │   │   ├── SessionFeedbackPopup (screenshot + voice/text input)
    │   │   └── “Click to add feedback” tooltip
    │   ├── Focus dim overlay (focus_mode / region_selecting)
    │   └── RegionCaptureOverlay (focus_mode / region_selecting, extensionMode)
    │       ├── Dim layer + selection rect + cutout
    │       ├── Hint: “Drag to capture area — ESC to cancel”
    │       └── Confirmation bar: Retake | Speak feedback
    ├── [optional] Floating trigger button (“Echly” / “Capture feedback”)
    └── [optional] Sidebar panel (echly-sidebar-container)
        ├── CaptureHeader (title, summary, theme toggle, close)
        ├── echly-sidebar-body
        │   ├── Feedback list (FeedbackItem per pointer)
        │   ├── Error message
        │   └── WidgetFooter (idle: Add feedback / Start session / Resume / Open previous)
        └── (no RecordingFloatingUI / LauncherView / SessionTray in this tree)
```

**CaptureLayer** is rendered via `createPortal(..., captureRoot)` so it lives in `#echly-capture-root` (on document.body), not inside the shadow DOM. This keeps overlay and markers in the same document as the page for correct hit-testing and full-tab capture.

---

## 5. Component Dependency Map

### 5.1 Extension entry and content

| Path | Role |
|------|------|
| `echly-extension/manifest.json` | Manifest |
| `echly-extension/src/background.ts` | Service worker |
| `echly-extension/src/content.tsx` | Content script; ContentApp + mount logic |
| `echly-extension/src/popup.tsx` | Popup UI |
| `echly-extension/src/contentAuthFetch.ts` | API from content: send to background (echly-api) |
| `echly-extension/src/contentScreenshot.ts` | generateFeedbackId, generateScreenshotId, uploadScreenshot (ECHLY_UPLOAD_SCREENSHOT) |
| `echly-extension/src/ocr.ts` | getVisibleTextFromScreenshot (Tesseract) for context enrichment |

### 5.2 Widget components (used by extension)

| Path | Role |
|------|------|
| `components/CaptureWidget/CaptureWidget.tsx` | Root widget; composes header, footer, capture layer, list, floating button |
| `components/CaptureWidget/types.ts` | CaptureWidgetProps, CaptureState, CaptureContext, Recording, etc. |
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | All capture/session/voice state and handlers |
| `components/CaptureWidget/CaptureHeader.tsx` | Sidebar header (title, summary, theme toggle, close) |
| `components/CaptureWidget/WidgetFooter.tsx` | Idle actions: Add feedback (web) or Start session / Resume / Open previous (extension) |
| `components/CaptureWidget/FeedbackItem.tsx` | Single feedback row (expand, edit, delete) |
| `components/CaptureWidget/CaptureLayer.tsx` | Portal wrapper: SessionOverlay, dim, RegionCaptureOverlay |
| `components/CaptureWidget/RegionCaptureOverlay.tsx` | Drag-to-select region, crop, context, “Speak feedback” |
| `components/CaptureWidget/SessionOverlay.tsx` | Session UI: highlighter, click capture, control panel, feedback popup |
| `components/CaptureWidget/SessionControlPanel.tsx` | Pause / Resume / End session |
| `components/CaptureWidget/SessionFeedbackPopup.tsx` | Screenshot preview + voice or text input |
| `components/CaptureWidget/ResumeSessionModal.tsx` | List sessions, select one to resume |
| `components/CaptureWidget/session/elementHighlighter.ts` | Hover highlight overlay (session mode) |
| `components/CaptureWidget/session/clickCapture.ts` | Capture-phase click → element (session mode) |
| `components/CaptureWidget/session/sessionMode.ts` | isSessionCaptureTarget, logSession |
| `components/CaptureWidget/session/cropAroundElement.ts` | getCropRegionForElement, cropScreenshotAroundElement |
| `components/CaptureWidget/session/feedbackMarkers.ts` | createMarker, updateMarker, removeMarker, removeAllMarkers |

### 5.3 Shared / lib (used by widget in extension)

| Path | Role |
|------|------|
| `lib/captureContext.ts` | buildCaptureContext, isEchlyElement, getDomPath, extractSubtreeText, extractNearbyText, extractVisibleText |
| `lib/playShutterSound.ts` | Shutter sound on capture |
| `lib/playDoneClick.ts` | Done click on finish voice |
| `lib/debug/echlyLogger.ts` | echlyLog |
| `lib/utils/logger.ts` | log |

### 5.4 Not used by extension widget

- **LauncherView, SessionTray, RecordingFloatingUI, ConfirmationCard** — Defined under `components/CaptureWidget/` but not imported in CaptureWidget or content; not part of the extension’s UI tree.
- **lib/authFetch.ts** — Replaced by `contentAuthFetch` in content script build via esbuild alias.
- **lib/feedback.ts** — getSessionFeedback used by useCaptureWidget for non-extension (dashboard) flow; extension uses content’s apiFetch for feedback list.

---

## 6. Screenshot / DOM Capture Pipeline

### 6.1 Overlay activation

- **Region capture:** User in extension clicks “Add feedback” (or equivalent) → `handleAddFeedback` (useCaptureWidget) → if extensionMode, only `createCaptureRoot()` + `setState("focus_mode")`; no immediate screenshot. CaptureLayer mounts (portaled to `#echly-capture-root`). When `extensionMode` and state is focus_mode or region_selecting, **RegionCaptureOverlay** is shown.
- **Session capture:** After “Start New Feedback Session”, background sets sessionModeActive and broadcasts. Content and all tabs run effect: setSessionMode(true), createCaptureRoot(); CaptureLayer shows **SessionOverlay** (element highlighter + click capture). No drag region; user clicks an element.

### 6.2 Pointer events and selection

**Region flow (RegionCaptureOverlay):**

- Full-screen dim div: `onMouseDown` → start selection (onSelectionStart → setState region_selecting), store start in ref.
- `onMouseMove` → update selection rect (min/max of start and current), min size 24px.
- `onMouseUp` (local or window) → if rect ≥ MIN_SIZE, set releasedRect and show confirmation bar (“Retake” | “Speak feedback”).
- Escape: clear selection or cancel overlay.

**Session flow:**

- **elementHighlighter:** mousemove (passive) → elementsFromPoint → first `isSessionCaptureTarget(el)` → getBoundingClientRect → update single overlay div position/size.
- **clickCapture:** document click (capture) → if enabled and target isSessionCaptureTarget → preventDefault, stopPropagation, onElementClicked(target).

### 6.3 Bounding boxes and crop

- **Region:** Selection rect is in viewport coordinates (clientX/clientY). Crop: `cropImageToRegion(fullImageDataUrl, region, dpr)` in RegionCaptureOverlay: Image onload, canvas with width/height = region size × dpr, drawImage with source rect (region × dpr), toDataURL("image/png").
- **Session:** `cropScreenshotAroundElement(fullImageDataUrl, element, padding)` uses `getCropRegionForElement`: element.getBoundingClientRect(), add padding, clamp to viewport; same `cropImageToRegion(..., region, dpr)`.

### 6.4 Screenshot generation

- **Full-tab image (extension):** Content sends `CAPTURE_TAB` to background. Background calls `chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" })`, returns data URL; sent back to content. Before calling, overlay is hidden: `captureTabWithoutOverlay()` in useCaptureWidget hides `#echly-capture-root` for the duration of the capture so the overlay is not in the screenshot.
- **Region flow:** After user confirms “Speak feedback”, overlay hides briefly (flash), then getFullTabImage() (CAPTURE_TAB), then crop to releasedRect, then buildCaptureContext at rect center (elementsFromPoint, skip Echly elements), then onAddVoice(cropped, context).
- **Session flow:** On click, getFullTabImage() then cropAroundElement(fullImage, element) then buildCaptureContext(window, element) then setSessionFeedbackPending({ screenshot: cropped, context }).

### 6.5 DOM context capture

- **buildCaptureContext(window, element)** (lib/captureContext.ts): url, scrollX/Y, viewport size, devicePixelRatio, capturedAt; domPath (getDomPath), nearbyText (extractNearbyText), subtreeText (extractSubtreeText), visibleText (extractVisibleText). All text helpers skip Echly UI (isEchlyElement). Element is the center of the region or the clicked element; if under pointer is Echly, walk up to first non-Echly.
- **OCR:** Content script can call getVisibleTextFromScreenshot(screenshot) (echly-extension/src/ocr.ts) and add result to context as visibleText before structure-feedback.

### 6.6 End-to-end (region) flow

1. User clicks Add feedback (extension) → createCaptureRoot, state focus_mode.
2. RegionCaptureOverlay: user drags → rect ≥ 24px → release → confirmation bar.
3. User clicks “Speak feedback” → playShutterSound, getFullTabImage (CAPTURE_TAB with overlay hidden), cropImageToRegion(rect, dpr), element at center, buildCaptureContext, onAddVoice(cropped, context).
4. handleRegionCaptured: new Recording with screenshot + context, startListening → voice_listening.
5. User speaks, clicks done → finishListening → onComplete(transcript, screenshot, callbacks, context) in content → structure-feedback, then POST /api/feedback, upload screenshot (background), PATCH ticket with screenshotUrl.

---

## 7. Feedback Composer System

### 7.1 Where feedback is composed

- **Region + voice:** After region capture, voice is started automatically; transcript is shown live; “Done” (finishListening) submits transcript + screenshot + context. No separate “composer” panel; the flow is overlay → voice → submit.
- **Session + voice/text:** After user clicks an element, SessionFeedbackPopup appears: screenshot preview, then “Describe the change” (voice) or “Type feedback” (text). Voice: startListening then “Save feedback”; text: textarea + “Save feedback”. Both call the same pipeline with transcript + pending.screenshot + pending.context.

### 7.2 Text input

- **SessionFeedbackPopup:** textarea, value/onChange, placeholder “Describe feedback”, submit when trimmed length &gt; 0.
- **Clarity assistant (content.tsx):** Textarea for editing unclear feedback; “Done” submits edited text via submitEditedFeedback (re-run structure-feedback then feedback).

### 7.3 Voice recording

- **useCaptureWidget:** Web Speech API (SpeechRecognition / webkitSpeechRecognition), continuous, interim results. startListening: getUserMedia(audio), AudioContext + Analyser for level, recognition.start(), state voice_listening. finishListening: recognition.stop(), use final transcript from recordings ref, validate length ≥ 5 chars, then onComplete(transcript, screenshot, callbacks, context).
- **SessionFeedbackPopup:** “Describe the change” sets mode voice and calls onRecordVoice (parent starts listening); “Save feedback” calls onDoneVoice (parent finishes and submits).

### 7.4 Screenshot preview

- **SessionFeedbackPopup:** Shows pending screenshot in a 16/10 box at top of the popup.
- **Region flow:** No preview before voice; screenshot is attached to the same recording and sent with transcript.

### 7.5 Submit action

- **Content handleComplete:** Ensures sessionId and user; generates feedbackId/screenshotId; starts upload promise; optionally runs OCR and enriches context. Calls apiFetch("/api/structure-feedback") with transcript + context. If clarityScore ≤ 20 or needsClarification (and not session mode), shows clarity assistant. Otherwise: if tickets from structure, POST /api/feedback for each (with screenshotId for first), then when upload resolves PATCH /api/tickets/:id with screenshotUrl. On success, callbacks.onSuccess(ticket); content also listens for ECHLY_FEEDBACK_CREATED to dispatch custom event for any tab.
- **Fallback (no tickets / structure failed):** Content can send ECHLY_PROCESS_FEEDBACK to background; background calls structure-feedback then feedback (same APIs) and broadcasts ECHLY_FEEDBACK_CREATED.

### 7.6 Data collected before send

- transcript (voice or text)
- screenshot (data URL, cropped region or element crop)
- context: url, scrollX/Y, viewport size, devicePixelRatio, domPath, nearbyText, subtreeText, visibleText (and optional OCR visibleText), capturedAt
- sessionId, screenshotId; upload runs in parallel; ticket is created first, then PATCH with screenshot URL when upload completes.

---

## 8. Extension State Management

### 8.1 Where state lives

- **Background (global):** In-memory + chrome.storage.local: tokenState (idToken, refreshToken, expiresAtMs, user), activeSessionId, globalUIState (visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused). Persisted: activeSessionId, sessionModeActive, sessionPaused; auth_*; rehydrated on startup.
- **Content (ContentApp):** React state: user, authChecked, theme, globalState (mirror of background), sessionIdOverride, loadSessionWithPointers, extensionClarityPending, showClarityAssistant, isEditingFeedback, editedTranscript. globalState is driven only by ECHLY_GLOBAL_STATE (and initial GET_GLOBAL_STATE). effectiveSessionId = sessionIdOverride ?? globalState.sessionId.
- **Widget (useCaptureWidget):** React state: recordings, activeRecordingId, isOpen, state (idle | focus_mode | region_selecting | voice_listening | processing | …), pointers, expandedId, editingId, editedTitle/Description, position, sessionMode, sessionPaused, pausePending, endPending, sessionFeedbackPending, captureRootEl, etc. Refs for drag, recognition, pipeline lock, session mode/paused, last clicked element.

### 8.2 Capture mode toggle

- **Show/hide widget:** Background globalUIState.visible. Popup or other trigger sends ECHLY_TOGGLE_VISIBILITY; background toggles and broadcasts. Content sets host display and globalState.visible.
- **Expand/collapse panel:** globalUIState.expanded. ECHLY_EXPAND_WIDGET / ECHLY_COLLAPSE_WIDGET; CaptureWidget is controlled: expanded prop = globalState.expanded, onExpandRequest/onCollapseRequest send messages. When entering capture flow, content calls onCollapseRequest so panel collapses during capture.

### 8.3 UI state transitions

- **Idle → focus_mode:** handleAddFeedback → createCaptureRoot, setState("focus_mode"). Extension does not take a full-page screenshot here; it shows region overlay.
- **focus_mode → region_selecting:** User starts drag in RegionCaptureOverlay; onSelectionStart sets state region_selecting.
- **region_selecting → voice_listening:** User releases valid rect, clicks “Speak feedback” → performCapture → onAddVoice(cropped, context) → handleRegionCaptured adds recording and startListening() → state voice_listening.
- **voice_listening → processing:** finishListening (user clicks done) → onComplete(...) → state processing (or in session mode state set to idle and pipeline runs async).
- **processing → idle/success:** On success: update pointers, clear recording, removeCaptureRoot, restoreWidget (and in extension collapse), set state idle; optional pillExiting animation.
- **Session:** sessionMode and sessionPaused come from global state; startSession sets sessionMode and creates capture root; pause/resume/end update global state and local sessionPaused, pausePending, endPending.

No Zustand or global Context for the widget; all state is React useState/useRef in ContentApp and useCaptureWidget.

---

## 9. Extension API Communication

### 9.1 Endpoints used by the extension

| Endpoint | Caller | When |
|----------|--------|------|
| **GET /api/feedback?sessionId=…&limit=50** | Content (apiFetch) | Load feedback list for session (hydrate pointers, resume session list) |
| **POST /api/sessions** | Content (apiFetch) | Create session (Start New Feedback Session) |
| **POST /api/structure-feedback** | Content (apiFetch) | Structure transcript + context before creating tickets; clarity score/rewrite |
| **POST /api/feedback** | Content (apiFetch) or Background (ECHLY_PROCESS_FEEDBACK) | Create ticket(s); body includes sessionId, title, description, type, contextSummary, actionSteps, suggestedTags, screenshotId, metadata, clarity fields |
| **PATCH /api/tickets/:id** | Content (apiFetch) | Update ticket (edit title/description; attach screenshotUrl after upload) |
| **POST /api/upload-screenshot** | Background only | ECHLY_UPLOAD_SCREENSHOT: body screenshotId, imageDataUrl, sessionId; returns url |
| **GET /api/sessions** | Content (apiFetch) | List sessions (Resume / Open previous) |

### 9.2 Data sent

- **structure-feedback:** `{ transcript, context? }` (context: url, viewport, scroll, domPath, nearbyText, subtreeText, visibleText, etc.).
- **feedback:** sessionId, title, description, type, contextSummary, actionSteps, suggestedTags, screenshotUrl (null on create), screenshotId (first ticket), metadata.clientTimestamp, clarityScore, clarityIssues, clarityConfidence, clarityStatus.
- **upload-screenshot:** screenshotId, imageDataUrl, sessionId.
- **tickets PATCH:** title, description, or screenshotUrl.

### 9.3 Trigger summary

- **On load / session active:** GET feedback for sessionId to show markers/list.
- **On “Start New Feedback Session”:** POST /api/sessions, then ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_START.
- **On “Resume” / “Open previous”:** GET /api/sessions and/or GET feedback for selected sessionId; ECHLY_SET_ACTIVE_SESSION; optionally ECHLY_SESSION_MODE_START.
- **On submit feedback:** POST structure-feedback → POST feedback (one or more) → background upload (ECHLY_UPLOAD_SCREENSHOT) or content upload via message → PATCH ticket with screenshotUrl.
- **On edit ticket:** PATCH /api/tickets/:id (title, description) from widget.
- **Token:** All content-originated API calls go through background (echly-api or ECHLY_UPLOAD_SCREENSHOT / ECHLY_PROCESS_FEEDBACK); background adds Bearer token via getValidToken().

---

## 10. Feedback Data Model

### 10.1 Client-side (extension) structures

- **CaptureContext (types.ts / captureContext):** url, scrollX, scrollY, viewportWidth, viewportHeight, devicePixelRatio, domPath, nearbyText, subtreeText, visibleText, capturedAt.
- **Recording (useCaptureWidget):** id, screenshot (data URL or null), transcript, structuredOutput (null until resolved), context, createdAt.
- **StructuredFeedback (types):** id, title, description, type.

### 10.2 Payload to backend

- **structure-feedback:** transcript, context (full CaptureContext plus any visibleText from OCR).
- **feedback (POST):** sessionId, title, description, type, contextSummary, actionSteps, suggestedTags, screenshotUrl (often null initially), screenshotId, metadata.clientTimestamp, clarityScore, clarityIssues, clarityConfidence, clarityStatus.
- **upload-screenshot:** screenshotId, imageDataUrl, sessionId → returns url; then PATCH ticket with that url.

### 10.3 Data collected before send (summary)

- **Screenshot:** Cropped region or element crop (data URL); uploaded separately; URL attached to first ticket via PATCH.
- **Transcript:** From voice (Web Speech API) or session text input (or clarity edited text).
- **Context:** URL, scroll, viewport, dpr, domPath, nearbyText, subtreeText, visibleText (page + optional OCR), capturedAt.
- **Session:** sessionId from effectiveSessionId (storage + content state).
- **Ids:** feedbackId/screenshotId generated client-side; ticket id from POST /api/feedback response.

---

## 11. Performance Critical Systems

### 11.1 Overlay rendering

- **#echly-capture-root** is on document.body; CaptureLayer is portaled there. Avoid moving the portal target or remounting the root unnecessarily; session mode relies on the same root across tabs.
- **RegionCaptureOverlay** updates selection rect on mousemove; state updates are frequent; keep the painted region (cutout + confirmation bar) cheap.
- **SessionOverlay:** elementHighlighter uses one DOM node and mousemove (passive); clickCapture is one capture listener. Both must stay lightweight to avoid input lag.

### 11.2 Screenshot capture

- **CAPTURE_TAB** is async; overlay is hidden only for the duration of the capture to avoid capturing the overlay. Do not remove or show overlay in a way that flashes or doubles capture.
- **cropImageToRegion** and **cropScreenshotAroundElement** load the full tab image into an Image, then draw to canvas. Large viewports or high DPR increase memory and CPU; consider keeping crop regions and canvas size bounded if redesigning.

### 11.3 DOM interaction

- **elementsFromPoint / elementFromPoint** and **getBoundingClientRect** are used for context and session click/highlight. Any change that alters the DOM under the pointer (e.g. overlay structure, z-index, pointer-events) can change the selected element or break highlighter/capture.
- **feedbackMarkers** append to #echly-marker-layer inside #echly-capture-root; scroll/resize listeners update marker positions. Removing or moving the capture root must tear down markers and listeners.

### 11.4 Widget injection timing

- **Single mount:** main() runs once; no re-injection. If the host or root is removed by a script or extension conflict, the widget will not reappear until reload.
- **Visibility:** Only display is toggled; React tree stays mounted. Heavy re-renders on global state (e.g. ECHLY_GLOBAL_STATE) could affect responsiveness; state updates are already scoped to the content script.

---

## 12. UI Redesign Safety Guide

### 12.1 SAFE TO CHANGE

- **Visual styles:** Colors, borders, shadows, typography, spacing, border-radius in CaptureHeader, WidgetFooter, FeedbackItem, SessionControlPanel, SessionFeedbackPopup, RegionCaptureOverlay (dim, hint, confirm bar), floating trigger, sidebar surface. Keep class names or data attributes that scripts might rely on (e.g. echly-*).
- **Layout:** Flex/grid of sidebar body, header layout, footer button layout, position of control panel (e.g. top center) as long as overlay and capture root remain on document.body and portaled to the same root.
- **Icons:** Replace Lucide or inline SVGs in header, FeedbackItem, SessionControlPanel, popup; ensure aria-labels stay for accessibility.
- **Copy:** All user-facing strings (hints, buttons, labels).

### 12.2 MODERATE RISK

- **Widget container:** #echly-shadow-host and #echly-root: position and size are fine to tweak; changing id or removing the host will break visibility and mount. Do not remove data-echly-ui or the single shadow root pattern.
- **Sidebar structure:** echly-sidebar-container, echly-sidebar-surface, echly-sidebar-header, echly-sidebar-body, echly-feedback-list — layout and class names used by CSS (including popup.css). Changing structure might require CSS and test updates; avoid renaming or removing refs (e.g. widgetRef, listScrollRef) used for drag and scroll.
- **Floating trigger:** Class and position are safe; ensure the button still calls onExpandRequest or handlers.setIsOpen(true) so expand/collapse and background state stay in sync.

### 12.3 HIGH RISK

- **CaptureLayer / #echly-capture-root:** Creation and lifecycle are in useCaptureWidget (createCaptureRoot, removeCaptureRoot). Portal target must remain document.body and the same div; removing or duplicating it breaks overlay and markers. Do not portal CaptureLayer into the shadow root (hit-testing and full-tab capture assume overlay in main document).
- **RegionCaptureOverlay:** Mouse down/move/up and the refs (startRef, selectionRectRef, releasedRect) drive the only region selection path. Changing event handling or the order of hide/capture/crop/context will break region capture. Keep MIN_SIZE, cropImageToRegion(fullImage, region, dpr), and the call to buildCaptureContext at rect center (and elementsFromPoint filtering with isEchlyElement).
- **SessionOverlay and session helpers:** elementHighlighter (overlay div, mousemove, getBoundingClientRect), clickCapture (capture-phase listener, isSessionCaptureTarget), and SessionFeedbackPopup (screenshot + voice/text) are tightly coupled. Changing what counts as a target (sessionMode.ts) or where the overlay is appended (capture root) can break session capture.
- **Pointer events and hit-testing:** Overlays use pointer-events and z-index (2147483645–2147483647). Changing stacking or pointer-events on the dim, cutout, or confirmation bar can make regions unselectable or clicks go to the page.
- **Screenshot pipeline:** getFullTabImage → CAPTURE_TAB; overlay hidden in captureTabWithoutOverlay; cropImageToRegion / cropScreenshotAroundElement; buildCaptureContext. Do not change the order (e.g. capture before hiding overlay) or the assumption that the overlay is in #echly-capture-root.
- **Message contracts:** ECHLY_* and echly-api payloads are the contract between content and background. Changing message types or payload shapes without updating both sides will break auth, visibility, session lifecycle, and API proxy.

### 12.4 Why these classifications

- **Safe:** Purely visual and layout; no message passing, no capture/context logic, no portal or root identity.
- **Moderate:** Structural but local to the widget; IDs and refs are used by the same component tree and by CSS. Risk is mostly regression in layout or refs.
- **High:** Capture, overlay, and messaging are cross-layer (content, background, document.body, portaled DOM). Bugs here cause wrong screenshots, wrong context, or broken capture/session flows.

---

**End of audit.** Use this document when redesigning the extension widget UI so that visual and layout changes can be applied safely without breaking capture, session mode, or API flows.
