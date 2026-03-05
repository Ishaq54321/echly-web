# Echly Chrome Extension — Complete Technical Overview

This document is a **read-only** technical analysis of the Echly Chrome extension. It is intended for product architects designing new features (e.g. “Session Feedback Mode”) without modifying or breaking the current system.

---

## SECTION 1 — Extension Architecture Overview

### Manifest and version

- **Manifest version:** 3  
- **Extension name:** Echly  
- **Version:** 1.0  
- **Description:** Capture screenshots and submit feedback  

### Components

| Component | Role |
|-----------|------|
| **Background** | Service worker: `background.js` (built from `src/background.ts`). Handles auth, token refresh, global UI state, screenshot capture, upload, and feedback processing. |
| **Content script** | Single script: `content.js` (built from `src/content.tsx`). Injected on **all URLs** at `document_idle`. Renders the widget inside a shadow root and wires it to the background. |
| **Popup** | `popup.html` loads `popup.js` (built from `src/popup.tsx`). Used for sign-in and toggling widget visibility. |
| **Widget UI** | React app rendered **inside the content script’s shadow DOM**. Implemented by shared app components (`CaptureWidget`, etc.) and driven by `content.tsx`. |

### Messaging between layers

- **Popup → Background:** `chrome.runtime.sendMessage` (e.g. `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_START_LOGIN`).
- **Background → All tabs:** `chrome.tabs.query` + `chrome.tabs.sendMessage` to broadcast `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`, etc.
- **Content → Background:** `chrome.runtime.sendMessage` (e.g. `ECHLY_GET_TOKEN`, `CAPTURE_TAB`, `ECHLY_PROCESS_FEEDBACK`, `ECHLY_UPLOAD_SCREENSHOT`, `echly-api`).
- **Content (widget) state:** Content script listens for `chrome.runtime.onMessage` and forwards state via `window.dispatchEvent` (CustomEvents: `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`, `ECHLY_TOGGLE_WIDGET`). The React tree subscribes to these events.

### Full flow when the extension loads on a webpage

1. **Page load**  
   Chrome injects the content script (`content.js`) when the document reaches `document_idle` (matches: `<all_urls>`).

2. **Single mount**  
   `main()` in `content.tsx` runs once:
   - Creates a single host div `#echly-shadow-host` (fixed, bottom-right, `z-index: 2147483647`, initially `display: none`).
   - Appends it to `document.documentElement`.
   - Creates an open shadow root, injects styles (link to `popup.css` + minimal reset), creates `#echly-root`, and mounts the React app via `createRoot` → `ContentApp`.

3. **Initial state sync**  
   - `syncInitialGlobalState(host)` sends `ECHLY_GET_GLOBAL_STATE` to the background and, from the response, sets the host’s `display` and dispatches `ECHLY_GLOBAL_STATE` so the widget reflects visibility/expanded/recording/sessionId.
   - `ensureMessageListener(host)` registers a one-time `chrome.runtime.onMessage` listener that updates host visibility and re-dispatches `ECHLY_GLOBAL_STATE` or `ECHLY_FEEDBACK_CREATED` / `ECHLY_TOGGLE_WIDGET`.

4. **Auth**  
   Content app requests `ECHLY_GET_AUTH_STATE`. If not authenticated, it shows “Sign in from extension” (which sends `ECHLY_OPEN_POPUP`). Auth is performed only in the popup (Google OAuth → token exchange in background).

5. **Visibility**  
   User opens the extension popup → if already authenticated, popup sends `ECHLY_TOGGLE_VISIBILITY` and closes. Background flips `globalUIState.visible` and broadcasts `ECHLY_GLOBAL_STATE` to all tabs. Content script receives it and sets the host to `display: block` and re-dispatches the event so the widget shows.

### How the widget is injected

- **Where:** A single `<div id="echly-shadow-host">` is appended to `document.documentElement` by the content script.
- **How:** The content script attaches an **open shadow root** to that div, adds a `<link rel="stylesheet" href="chrome-extension://.../popup.css">` and a small reset style block, then a container `#echly-root` with `data-theme` and `data-echly-ui="true"`. React’s `createRoot(container).render(<ContentApp ... />)` runs once.
- **Isolation:** Widget styles are isolated by the shadow DOM; `popup.css` is loaded inside the shadow root. The host has `pointer-events: auto` so the widget remains clickable.
- **No iframe:** The widget runs in the page context (content script + shadow DOM), so it can use the DOM (e.g. for capture root, `elementsFromPoint`) and the Web Speech API in the page’s context.

---

## SECTION 2 — Feedback Capture Flow (Current)

End-to-end flow in **extension mode** (region capture + voice):

1. **User clicks “Capture feedback”**  
   - **File:** `CaptureWidget.tsx` (floating button) → `handlers.handleAddFeedback` from `useCaptureWidget.ts`.  
   - **Behavior:** In extension mode, `handleAddFeedback` does **not** take a full-page screenshot here. It sets `widgetOpenBeforeCapture`, collapses the panel (`setIsOpenState(false)`), calls `createCaptureRoot()`, and sets state to `focus_mode`, then returns.

2. **Focus mode + region selection**  
   - **Files:** `CaptureLayer.tsx`, `RegionCaptureOverlay.tsx`.  
   - **Behavior:** A dim overlay is shown. User drags to draw a rectangle. On mouse up (with minimum size), the rect is stored (`releasedRect`). User sees “Retake” / “Speak feedback”.

3. **User clicks “Speak feedback”**  
   - **File:** `RegionCaptureOverlay.tsx` → `performCapture(targetRect)`.  
   - **Behavior:** Plays shutter sound, requests full tab image via `getFullTabImage()` (content → background `CAPTURE_TAB`), crops to the selected region with `cropImageToRegion()`, gets element at center with `document.elementsFromPoint()`, builds context with `buildCaptureContext(window, element)` from `lib/captureContext.ts`, then calls `onAddVoice(cropped, context)`.

4. **Recording created; voice starts**  
   - **File:** `useCaptureWidget.ts` → `handleRegionCaptured(croppedDataUrl, context)`.  
   - **Behavior:** Creates a new `Recording` (id, screenshot, transcript `""`, context), appends to `recordings`, sets `activeRecordingId`, calls `startListening()`.

5. **Voice recording**  
   - **File:** `useCaptureWidget.ts` → `startListening()`.  
   - **Behavior:** `navigator.mediaDevices.getUserMedia({ audio: true })`, creates `AudioContext` and analyser for level, starts `SpeechRecognition` (Web Speech API). State → `voice_listening`. Interim/final results update the active recording’s `transcript` in state.

6. **User clicks “Done” (finish)**  
   - **File:** `useCaptureWidget.ts` → `finishListening()`.  
   - **Behavior:** Stops recognition, reads active recording’s `transcript` and `screenshot`/`context`. In extension mode, calls `onComplete(transcript, screenshot, { onSuccess, onError }, context)`.

7. **Content script processes completion**  
   - **File:** `content.tsx` → `handleComplete()`.  
   - **Behavior:** Optional OCR on screenshot (`getVisibleTextFromScreenshot`), enriches context with `visibleText` and `url`. Calls `uploadScreenshot()` (content → background `ECHLY_UPLOAD_SCREENSHOT`) to get a `screenshotUrl`. Then either:
     - Calls `apiFetch("/api/structure-feedback", { transcript, context })` (content script uses `contentAuthFetch` → background `echly-api` with token), or
     - Sends `ECHLY_PROCESS_FEEDBACK` to background with `{ transcript, screenshotUrl, sessionId, context }` (e.g. when clarity is low or fallback).
   - **Clarity / fallback:** If structure-feedback returns low clarity or needs clarification, the extension shows the “clarity assistant” UI and may later submit via `ECHLY_PROCESS_FEEDBACK` or direct `apiFetch("/api/feedback", ...)`.

8. **Backend structure + tickets**  
   - **File (backend):** `app/api/structure-feedback/route.ts` → `runFeedbackPipeline()`.  
   - **Behavior:** Returns `{ success, tickets, clarityScore, ... }`. Extension may create one or more feedback items from `tickets`.

9. **Create feedback (tickets)**  
   - **Files:** `content.tsx` (loop over tickets, `apiFetch("/api/feedback", body)`) or **background** (for `ECHLY_PROCESS_FEEDBACK`: `fetch(API_BASE + "/api/structure-feedback")` then `fetch(API_BASE + "/api/feedback")` per ticket).  
   - **Behavior:** POST to `/api/feedback` with `sessionId`, `title`, `description`, `type`, `screenshotUrl` (for first ticket), `actionSteps`, `suggestedTags`, etc. Backend returns `{ success, ticket: { id, title, description, type } }`.

10. **UI update**  
    - **File:** `useCaptureWidget.ts` (onSuccess).  
    - **Behavior:** New ticket is prepended to `pointers`, recording is removed, pill exits, capture root is removed, widget restores to idle. Background may broadcast `ECHLY_FEEDBACK_CREATED` so other tabs can react.

**Summary table**

| Step | Primary files |
|------|----------------|
| Click “Capture feedback” | `CaptureWidget.tsx`, `useCaptureWidget.ts` |
| Region overlay | `CaptureLayer.tsx`, `RegionCaptureOverlay.tsx` |
| Screenshot + context | Background (`CAPTURE_TAB`), `RegionCaptureOverlay` (crop, `buildCaptureContext`) |
| Voice recording | `useCaptureWidget.ts` (Web Speech API, MediaStream) |
| Transcript + upload | `content.tsx` (`handleComplete`), `contentScreenshot.ts`, background (`ECHLY_UPLOAD_SCREENSHOT`) |
| Structure + create tickets | `content.tsx` (apiFetch), `background.ts` (ECHLY_PROCESS_FEEDBACK), `app/api/structure-feedback`, `app/api/feedback` |

---

## SECTION 3 — Screenshot System

### Library / API

- **Chrome API:** `chrome.tabs.captureVisibleTab(windowId, { format: "png" })`.  
- **No html2canvas in extension path:** Full-tab capture is done only in the **background** (service worker) via this API. The content script never captures the tab directly; it requests capture via messaging.

### Which script triggers capture

- **Requester:** Content script (widget). When a region is confirmed, `RegionCaptureOverlay.performCapture()` calls `getFullTabImage()` from `useCaptureWidget.ts`.  
- **Implementation of getFullTabImage:** Sends `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })`.  
- **Executor:** Background script (`background.ts`). On `CAPTURE_TAB`, it calls `chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" })` and replies with `{ success: true, screenshot: dataUrl }` or `{ success: false }`.

### Temporary storage

- Screenshot is kept in memory as a **data URL string** (base64 PNG):
  - In the content script: passed into `handleRegionCaptured` → stored in the active `Recording.screenshot`.
  - After region capture: full image is cropped in the content script via canvas (`cropImageToRegion` in `RegionCaptureOverlay.tsx`); the **cropped** data URL is stored in the recording.
- No disk or extension local storage is used for the image; it is either uploaded or discarded.

### Sending to backend

- **Upload path:** Content script calls `uploadScreenshot(screenshot, sessionId, feedbackId)` in `contentScreenshot.ts`, which sends `ECHLY_UPLOAD_SCREENSHOT` to the background with `imageDataUrl`, `sessionId`, `feedbackId`.  
- **Background:** Gets a valid token, then `POST ${API_BASE}/api/upload-screenshot` with body `{ imageDataUrl, sessionId, feedbackId }`. Backend uploads to Firebase Storage and returns `{ url }`.  
- **Usage:** The returned `url` is attached to the first ticket when creating feedback via `/api/feedback` (e.g. `screenshotUrl: i === 0 ? screenshotUrl : null`).

---

## SECTION 4 — Voice Capture System

### APIs used

- **Web Speech API (Speech Recognition):**  
  - `window.SpeechRecognition` or `window.webkitSpeechRecognition`.  
  - Configured with `continuous: true`, `interimResults: true`, `lang: "en-US"`.  
  - Used only for **transcription** (speech → text). No server-side STT in the extension; all recognition is in-browser.
- **MediaRecorder:** Not used.  
- **getUserMedia:** Used only for **audio level** visualization: `navigator.mediaDevices.getUserMedia({ audio: true })` → `AudioContext` → `createAnalyser()` → `createMediaStreamSource(stream)` → analyser. Level is read in a `requestAnimationFrame` loop and stored as `listeningAudioLevel`.

### Start / stop recording

- **Start:** `useCaptureWidget.ts` → `startListening()`. Gets microphone stream, creates AudioContext/analyser, calls `recognitionRef.current.start()`, sets state to `voice_listening`.  
- **Stop:** `finishListening()` calls `recognitionRef.current.stop()`, then uses the current `transcript` from the active recording and proceeds to `onComplete(...)`.  
- **Cancel:** `discardListening()` stops recognition, clears the active recording, sets state to `cancelled`, removes capture root, restores widget.

### Transcription flow

- Recognition is created once in a `useEffect` and stored in `recognitionRef`.  
- `onresult`: concatenates `event.results[i][0].transcript` from `resultIndex` to end, updates the active recording’s `transcript` in state via `setRecordings(prev => prev.map(...))`.  
- `onend`: if state is not `processing` or `success`, sets state back to `idle`.  
- Final transcript is whatever is in the active `Recording.transcript` when the user clicks “Done”.

### Where transcript is stored before sending

- In React state: `recordings` array, on the active `Recording` (identified by `activeRecordingId`).  
- When the user finishes, `finishListening` reads `recordingsRef.current`, finds the active recording, and passes `active.transcript` (and screenshot/context) to `onComplete`. The transcript is then sent in the body of `POST /api/structure-feedback` and optionally in `ECHLY_PROCESS_FEEDBACK` payload; it is not persisted in extension storage before send.

---

## SECTION 5 — Context Collection

Context is built when a **region** is captured (extension flow). The same types and helpers are used by the web app.

### Source file

- **Primary:** `lib/captureContext.ts`.  
- **Types:** `CaptureContext` in `lib/captureContext.ts` and `components/CaptureWidget/types.ts` (url, scroll, viewport, domPath, nearbyText, subtreeText, visibleText, capturedAt).

### Fields and functions

| Concept | Function | Description |
|--------|----------|-------------|
| **DOM path** | `getDomPath(el)` | CSS-like path from element to body (tag, id, first class, nth-child), max depth 12. Skips Echly UI. |
| **Nearby text** | `extractNearbyText(el)` / `getNearbyText(el)` | Parent, siblings, children text; aria-label/placeholder; ~800 chars. |
| **Subtree text** | `extractSubtreeText(el)` / `getSubtreeText(el)` | Visible text in element’s subtree (TreeWalker), ~2000 chars. |
| **Visible text** | `extractVisibleText(win)` | Visible nodes in viewport (viewport rect filter), ~1500 chars. |
| **Viewport / scroll** | Inside `buildCaptureContext` | `win.scrollX`, `win.scrollY`, `win.innerWidth`, `win.innerHeight`, `win.devicePixelRatio`. |
| **Echly filter** | `isEchlyElement(node)` | Excludes nodes with id/class/data-echly-ui or inside Echly shadow roots so context never includes widget UI. |

### Where context is built and used

- **Built:** `RegionCaptureOverlay.performCapture()`: after cropping, gets element at region center via `document.elementsFromPoint(centerX, centerY)`, then `buildCaptureContext(window, element)` from `lib/captureContext.ts`.  
- **Passed:** `onAddVoice(cropped, context)` → `handleRegionCaptured` → stored on `Recording.context`.  
- **Sent to API:** In `content.tsx` `handleComplete`, context is merged with `visibleText` (from OCR when available) and `url`, then sent in `structureBody.context` to `/api/structure-feedback` and in `ECHLY_PROCESS_FEEDBACK` payload.

### Visible text from screenshot (OCR)

- **File:** `echly-extension/src/ocr.ts`.  
- **Function:** `getVisibleTextFromScreenshot(imageDataUrl)`. Uses `tesseract.js` in the content script to extract text from the screenshot; result is trimmed and capped at 2000 chars. This is merged into context as `visibleText` in `handleComplete` when available.

---

## SECTION 6 — Widget UI

### Entry point

- **Content script:** `echly-extension/src/content.tsx`.  
- **Mount:** `main()` creates `#echly-shadow-host`, calls `mountReactApp(host)` which creates shadow root, injects styles, creates `#echly-root`, and runs `createRoot(container).render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />)`.

### UI framework

- **React** (with DOM `createRoot`). Shared components live in `components/CaptureWidget/` (e.g. `CaptureWidget.tsx`, `CaptureLayer.tsx`, `RegionCaptureOverlay.tsx`, `RecordingCapsule.tsx`, `CaptureHeader.tsx`, `WidgetFooter.tsx`, `FeedbackItem.tsx`, etc.).

### State management

- **React state only** (useState/useRef in `ContentApp` and `useCaptureWidget`).  
- **Global UI state** (visible, expanded, isRecording, sessionId) is **owned by the background**; content script receives it via `chrome.runtime.onMessage` → `ECHLY_GLOBAL_STATE` and re-dispatches as a CustomEvent. The widget subscribes and calls `setGlobalState(s)`. So: background is source of truth for visibility/expanded/recording/session; widget is source of truth for capture flow, recordings, and feedback list.

### Communication with content script

- Widget lives **inside** the content script’s React tree. It does not send Chrome messages directly; the **content script** (ContentApp) does:
  - `chrome.runtime.sendMessage` for token, auth, toggle, expand/collapse, recording start/stop, capture tab, upload screenshot, process feedback, echly-api.
  - `chrome.runtime.onMessage` is registered once in the content script; when it receives `ECHLY_GLOBAL_STATE` or `ECHLY_FEEDBACK_CREATED` / `ECHLY_TOGGLE_WIDGET`, it updates the host’s display and/or dispatches CustomEvents that the React tree listens to.
- So: widget ↔ content script = same process (React callbacks); content script ↔ background = Chrome messaging.

---

## SECTION 7 — Messaging System

### Content script

- **Sends:** `chrome.runtime.sendMessage(...)` for:  
  `ECHLY_OPEN_POPUP`, `ECHLY_GET_GLOBAL_STATE`, `ECHLY_GET_AUTH_STATE`, `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, `START_RECORDING`, `STOP_RECORDING`, `CAPTURE_TAB`, `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, `echly-api`.  
- **Listens:** `chrome.runtime.onMessage.addListener` (single listener in `ensureMessageListener`). Handles:  
  - `ECHLY_GLOBAL_STATE` → set host display, dispatch CustomEvent `ECHLY_GLOBAL_STATE`.  
  - `ECHLY_FEEDBACK_CREATED` → dispatch CustomEvent `ECHLY_FEEDBACK_CREATED`.  
  - `ECHLY_TOGGLE` → dispatch CustomEvent `ECHLY_TOGGLE_WIDGET`.  
- **CustomEvents:** Window listeners in ContentApp for `ECHLY_GLOBAL_STATE`, `ECHLY_TOGGLE_WIDGET`.

### Background script

- **Listens:** `chrome.runtime.onMessage.addListener`. Handles all request types listed above (toggle, expand/collapse, get state, get token, auth, session, CAPTURE_TAB, ECHLY_UPLOAD_SCREENSHOT, ECHLY_PROCESS_FEEDBACK, echly-api, etc.).  
- **Sends to tabs:** `chrome.tabs.query({})` then `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state })` or `ECHLY_FEEDBACK_CREATED` (broadcast). Used after visibility/expand/collapse/session/recording changes and after a ticket is created from ECHLY_PROCESS_FEEDBACK.

### Popup

- **Sends:** `ECHLY_GET_AUTH_STATE`, `ECHLY_START_LOGIN` (or `ECHLY_SIGN_IN` / `LOGIN`), `ECHLY_TOGGLE_VISIBILITY`.  
- **Does not listen** for tab messages; it either closes after login/toggle or shows the sign-in UI.

### Async responses

- Handlers that perform async work (e.g. token, capture, upload, process feedback, echly-api) use an async callback and `return true` so the message channel stays open until `sendResponse(...)` is called.

---

## SECTION 8 — API Communication

### Endpoints used by the extension

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload-screenshot` | POST | Upload screenshot data URL; returns Firebase Storage URL. |
| `/api/structure-feedback` | POST | Run AI pipeline on transcript + context; returns tickets, clarity, etc. |
| `/api/feedback` | POST | Create one feedback (ticket) for a session. |

Base URL is configured in the extension as `API_BASE` (e.g. `http://localhost:3000` in background and contentAuthFetch).

### Auth

- **Extension → Backend:** `Authorization: Bearer <firebase-id-token>`.  
- **Token source:** Content script uses `contentAuthFetch` → background `echly-api` which calls `getValidToken()` and adds the header. Background’s own fetch calls (upload, structure-feedback, feedback) also use `getValidToken()`.

### Request payloads

**POST /api/upload-screenshot**  
- Body: `{ imageDataUrl: string, sessionId: string, feedbackId: string }`.  
- Returns: `{ url: string }` or `{ error: string }`.

**POST /api/structure-feedback**  
- Body: `{ transcript: string, context?: { url?, viewportWidth?, viewportHeight?, domPath?, nearbyText?, subtreeText?, visibleText?, ... } }`.  
- Returns: `{ success, tickets: [{ title, description, suggestedTags, actionSteps }], clarityScore?, clarityIssues?, suggestedRewrite?, confidence?, needsClarification?, verificationIssues?, ... }`.

**POST /api/feedback**  
- Body: `{ sessionId, title, description, type, contextSummary?, actionSteps?, suggestedTags?, screenshotUrl?, metadata?, clarityScore?, clarityStatus?, ... }`.  
- Returns: `{ success, ticket: { id, title, description, type } }` (or error).

### Packaging screenshot, transcript, and context

- **Screenshot:** Uploaded first via `ECHLY_UPLOAD_SCREENSHOT` → `/api/upload-screenshot`; the returned `url` is sent in the first ticket’s `screenshotUrl` in POST /api/feedback.  
- **Transcript:** Sent in POST /api/structure-feedback as `transcript`; structure-feedback returns tickets whose title/description are used in POST /api/feedback.  
- **Context:** Sent in POST /api/structure-feedback as `context` (url, viewport, domPath, nearbyText, subtreeText, visibleText, etc.). Optional OCR `visibleText` is merged in the content script before calling structure-feedback.

---

## SECTION 9 — Permissions

From `echly-extension/manifest.json`:

| Permission | Purpose |
|------------|---------|
| `identity` | Google OAuth (launchWebAuthFlow, getRedirectURL). |
| `storage` | Persist auth tokens and activeSessionId in chrome.storage.local. |
| `activeTab` | Required for `chrome.tabs.captureVisibleTab` when the user invokes the extension (e.g. from the popup / current tab). |
| `tabs` | Query and send messages to all tabs (broadcast state), and for captureVisibleTab. |

**host_permissions:** `<all_urls>`, `http://localhost:3000/*`, `https://echly-web.vercel.app/*`, Firebase and Google auth/API hosts.

**Not in manifest:**  
- **Microphone:** Not declared. The widget uses `getUserMedia({ audio: true })` and the Web Speech API in the **page context** (content script). The browser will prompt for microphone access for the page’s origin when the user starts capture.  
- **scripting:** Not used; content script is injected via manifest only.

---

## SECTION 10 — Click Interception

### Current behavior

The extension **does not** intercept or capture arbitrary page clicks (e.g. “click an element to attach feedback to it”).  

- **Clicks it does handle:**  
  - Clicks on the widget (floating button, panel, clarity assistant, etc.).  
  - Mouse down/move/up on the **region selection overlay** (drag to select a rectangle).  
- **No document-level click listener** that captures target element for feedback. The “target” for context is derived from the **released selection rectangle** via `elementsFromPoint(centerX, centerY)` at capture time, not from a prior click.

### Where click interception could be implemented safely

- **Option A — Capture layer:** In a dedicated “element pick” mode, add a single `document` or `captureRoot` listener for `click` (or mousedown) when the overlay is visible. On click:  
  - `event.preventDefault()` / `event.stopPropagation()` if the intent is to consume the click and not let it hit the page.  
  - Resolve `event.target` to a non-Echly element (e.g. walk up until `!isEchlyElement(el)`), then call `buildCaptureContext(window, element)`, take a screenshot (full or region around element), and start voice or open a minimal form.  
- **Option B — Capture root:** When the capture root (`#echly-capture-root`) exists, attach the listener to the capture layer container so it’s clear that only “capture mode” is intercepting.  
- **Risks to manage:** Not double-firing (e.g. widget button vs page), not breaking native page behavior (e.g. links, buttons). Using a **capture-phase** listener and checking that the click is not inside the widget (e.g. not inside `#echly-shadow-host` or `[data-echly-ui]`) would keep interception scoped and avoid conflicts with existing widget clicks.

---

## SECTION 11 — File Map

| File | Responsibility |
|------|----------------|
| **echly-extension** | |
| `manifest.json` | Manifest v3, permissions, content_scripts, background, popup, host_permissions. |
| `background.js` | Built from `src/background.ts`; service worker, auth, tokens, global state, CAPTURE_TAB, upload, process feedback, echly-api. |
| `content.js` | Built from `src/content.tsx`; injects widget, ContentApp, handleComplete, messaging. |
| `popup.js` | Built from `src/popup.tsx`; sign-in UI, toggle visibility. |
| `popup.html` | Loads popup.css and popup.js. |
| `popup.css` | Widget + popup styles (from PostCSS build). |
| `src/background.ts` | Source for background service worker. |
| `src/content.tsx` | Content script entry, shadow host, ContentApp, handleComplete, clarity UI. |
| `src/popup.tsx` | Popup React app (auth + toggle). |
| `src/contentAuthFetch.ts` | apiFetch/authFetch that proxy through background (echly-api) with token. |
| `src/contentScreenshot.ts` | generateFeedbackId, uploadScreenshot (ECHLY_UPLOAD_SCREENSHOT). |
| `src/ocr.ts` | getVisibleTextFromScreenshot (tesseract.js). |
| `src/api.ts` | API_BASE, apiFetch for non-extension (Firebase auth in context). |
| `src/firebase.ts` | Firebase app/storage (extension-specific). |
| **Shared / app** | |
| `components/CaptureWidget/CaptureWidget.tsx` | Main widget shell, capture vs sidebar, footer. |
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | Capture state machine, recording list, speech recognition, getFullTabImage, handleRegionCaptured, handleAddFeedback. |
| `components/CaptureWidget/CaptureLayer.tsx` | Portal into capture root, dim overlay, RegionCaptureOverlay. |
| `components/CaptureWidget/RegionCaptureOverlay.tsx` | Region drag, crop, buildCaptureContext, onAddVoice. |
| `components/CaptureWidget/types.ts` | CaptureContext, Recording, CaptureState, CaptureWidgetProps. |
| `lib/captureContext.ts` | buildCaptureContext, getDomPath, extractSubtreeText, extractNearbyText, extractVisibleText, isEchlyElement. |
| `app/api/upload-screenshot/route.ts` | POST upload screenshot, Firebase Storage. |
| `app/api/structure-feedback/route.ts` | POST structure-feedback, runFeedbackPipeline. |
| `app/api/feedback/route.ts` | GET/POST feedback (list, create ticket). |

---

## SECTION 12 — Risks (for a “Session Feedback Mode” or similar)

Risks to consider when adding a feature that lets users click elements, auto-capture screenshot + context, record voice, and create tickets without reopening the full capture flow:

| Risk | Mitigation |
|------|------------|
| **Interfering with page clicks** | New click handling should be gated on a clear “feedback mode” (e.g. only when overlay/capture root is active). Use capture phase and ignore clicks inside `[data-echly-ui]` or the shadow host. Optionally use a short delay or “click to enable page click capture” so normal navigation isn’t broken. |
| **CSS / overlay conflicts** | Reuse the same capture root and z-index strategy (e.g. 2147483645–2147483647) and avoid new global styles. Keep new UI inside the existing shadow DOM or capture root. |
| **Extension permission limits** | captureVisibleTab requires the tab to be active and may fail on chrome:// or restricted origins. Microphone is not in the manifest; ensure prompts and errors are clear. New flows that need more host permissions should be documented. |
| **Performance: large DOM** | buildCaptureContext already limits subtree/nearby/visible text length. For “click an element” flows, continue to use a single target element and the same limits to avoid heavy TreeWalker on huge pages. |
| **Double submission / race** | submissionLock in content.tsx prevents overlapping handleComplete. Any new path that creates tickets should use the same lock or a shared queue. |
| **State consistency** | Recording/session/visibility are split between background and content. New “quick feedback” flows should update the same global state (e.g. recording) if the UI shows it, and use the same activeSessionId. |
| **Clarity / fallback** | If the new flow sends short or vague transcripts, structure-feedback may return needsClarification or low clarity. Decide whether to show the same clarity assistant or a simplified “submit anyway” path. |

---

## SECTION 13 — Performance

| Area | Notes |
|------|--------|
| **Screenshot latency** | `captureVisibleTab` is synchronous from the caller’s perspective but can take 100–500ms on large pages. Cropping and canvas.toDataURL add work in the content script. A “Session Feedback Mode” that captures on click may want a short delay or loading state before starting voice. |
| **Large DOM** | `buildCaptureContext` uses TreeWalker and getBoundingClientRect with character limits (2000 subtree, 800 nearby, 1500 visible). Very large DOMs can still cause noticeable work; consider keeping region or element scope narrow. |
| **OCR** | `getVisibleTextFromScreenshot` runs Tesseract in the content script after capture. It’s async and can be slow on large images; it’s already non-blocking (handleComplete awaits it but doesn’t block the main capture flow). |
| **Repeated API calls** | structure-feedback is called once per submission; live title fetch (liveStructureFetch) is debounced (e.g. 1800ms). Multiple rapid “quick feedback” submissions could hit rate limits (structure-feedback has per-uid rate limiting). |
| **Broadcast to all tabs** | `broadcastUIState()` and feedback-created broadcast send a message to every tab; harmless but many open tabs could add small overhead. |
| **Background service worker** | MV3 service worker can suspend. Long async chains (upload → structure → multiple feedback POSTs) are already in one listener with async callback; ensure no critical state is lost if the worker restarts (e.g. tokens are in storage). |

---

*End of technical overview. No code was modified; this document is for analysis and design only.*
