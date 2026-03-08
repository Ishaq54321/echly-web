# Echly Chrome Extension — Runtime and Behavior Audit

**Purpose:** Document how the extension works internally so another AI or engineer can safely modify behavior without breaking the system. **Read-only analysis; no code was modified.**

---

## SECTION 1 — Authentication Flow

### Overview

The extension uses **two auth-related code paths**; only one is used at runtime for the popup and content script:

- **Runtime path (used):** `background.ts` — Google OAuth via `chrome.identity.launchWebAuthFlow`, token exchange with Firebase Identity Toolkit REST API, tokens stored in `chrome.storage.local` and in-memory in the background script. Popup and content never hold tokens; they ask the background via messages.
- **Unused in extension flow:** `auth.ts` + `firebase.ts` — Firebase Auth (web-extension) with `signInWithCredential`. The popup does **not** call `signInWithGoogle()` from `auth.ts`; it sends `ECHLY_START_LOGIN` to the background, which performs the OAuth flow itself.

### How login is triggered

1. User opens the extension popup (`popup.html` → `popup.tsx`).
2. On load, `PopupApp` runs `getAuthState()` (sends `ECHLY_GET_AUTH_STATE` to background).
3. If **not** authenticated: UI shows "Continue with Google". Clicking it calls `startLogin()` which sends `ECHLY_START_LOGIN` (or `ECHLY_SIGN_IN` / `LOGIN` — all handled the same in background) to the background.
4. If **already** authenticated: popup immediately calls `toggleVisibility()` and `window.close()`.

### Google OAuth flow

- **Initiator:** Background script (`background.ts`), in the handler for `ECHLY_START_LOGIN` / `ECHLY_SIGN_IN` / `LOGIN`.
- **Steps:**
  1. Build auth URL: `https://accounts.google.com/o/oauth2/v2/auth` with `client_id`, `response_type=id_token`, `redirect_uri=chrome.identity.getRedirectURL()`, `scope=openid email profile`, `nonce=<UUID>`.
  2. `chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, callback)`.
  3. User signs in in Google’s page; redirects back to extension with hash fragment containing `id_token`.
  4. Background parses `id_token` from the redirect URL hash (`parseHashParam(responseUrl, "id_token")`).
  5. **Token exchange:** Background calls Firebase Identity Toolkit: `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=<API_KEY>` with body `{ postBody: "id_token=...&providerId=google.com", requestUri: "http://localhost", returnIdpCredential: true, returnSecureToken: true }`.
  6. Response contains `idToken`, `refreshToken`, `expiresIn`, `localId`, `displayName`, `email`, `photoUrl`. Background maps these to internal `StoredUser` and token state.

### Token storage location

- **In-memory (background):** `tokenState` object: `idToken`, `refreshToken`, `expiresAtMs`, `user`.
- **Persisted:** `chrome.storage.local` keys: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`. Updated by `setTokenState()` whenever token state changes.
- **On load:** Background runs `chrome.storage.local.get(["auth_idToken", "auth_refreshToken", "auth_expiresAtMs", "auth_user"], ...)` and repopulates `tokenState`. No other script has direct access to tokens.

### How auth state is retrieved

- **Popup:** Sends `ECHLY_GET_AUTH_STATE`. Background responds with `{ authenticated: !!tokenState.refreshToken, user: tokenState.user }`. No token string is sent.
- **Content script:** On mount, sends `ECHLY_GET_AUTH_STATE` and sets local `user` state for UI (e.g. show "Sign in from extension" when null). For API calls, content does **not** get a token; it uses `contentAuthFetch` → `echly-api` message so the background adds the token to requests.

### How auth is shared between popup and content

- **Popup:** Only talks to background (get auth state, start login, toggle visibility). No direct channel to content.
- **Content:** Gets auth state from background via `ECHLY_GET_AUTH_STATE`. All API requests go through background via `apiFetch` → `authFetch` → `echly-api`; background calls `getValidToken()` and attaches `Authorization: Bearer <token>` to the fetch. So auth is "shared" only in the sense that the background is the single source of truth and the only place that ever sees the token.

### Token refresh behavior

- **Function:** `getValidToken()` in `background.ts`.
- **Logic:** If current time is before `expiresAtMs - 30_000` ms and `idToken` exists, return it. Otherwise, if `refreshToken` exists, call `refreshIdToken(refreshToken)` which does `POST https://securetoken.googleapis.com/v1/token?key=<API_KEY>` with `grant_type=refresh_token` and `refresh_token=...`. Response gives new `id_token`, `refresh_token`, `expires_in`. Background updates `tokenState` and `chrome.storage.local` via `setTokenState()` and returns the new `idToken`. If no refresh token, throws `NOT_AUTHENTICATED`.
- **Used:** Before every authenticated API call (e.g. in `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, and when handling `echly-api`).

### Full login lifecycle (summary)

1. User opens popup → background reports auth state.
2. If not logged in, user clicks "Continue with Google" → background runs `launchWebAuthFlow` → user signs in at Google → redirect with `id_token` → background exchanges with Identity Toolkit → `setTokenState()` writes to memory and `chrome.storage.local`.
3. Popup receives success → toggles visibility, closes.
4. Content script (any tab): can call `ECHLY_GET_AUTH_STATE` to show user or "Sign in from extension"; all API calls go through background with automatic token attachment and refresh.

---

## SECTION 2 — Global Extension State

The extension keeps a single global UI state in the **background script** and broadcasts it to all tabs. Content script is the only consumer; popup does not subscribe to this state.

### State object (in `background.ts`)

```ts
globalUIState = {
  visible: boolean;      // widget shown/hidden
  expanded: boolean;     // widget tray open/closed
  isRecording: boolean;  // in capture flow (voice_listening, etc.)
  sessionId: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
}
```

Also: `activeSessionId` (module-level) is the current session id; it is mirrored into `globalUIState.sessionId`.

### Where each state is stored

| State               | In-memory (background)     | Persisted (chrome.storage.local)     |
|---------------------|----------------------------|--------------------------------------|
| visible             | `globalUIState.visible`    | No                                   |
| expanded            | `globalUIState.expanded`  | No                                   |
| isRecording         | `globalUIState.isRecording` | No                                |
| sessionModeActive   | `globalUIState.sessionModeActive` | Yes, key `sessionModeActive` |
| sessionPaused        | `globalUIState.sessionPaused`  | Yes, key `sessionPaused`        |
| activeSessionId     | `activeSessionId` (+ `globalUIState.sessionId`) | Yes, key `activeSessionId` |

Persistence is done in `persistSessionLifecycleState()` which sets `activeSessionId`, `sessionModeActive`, `sessionPaused`. On load, background does `chrome.storage.local.get(["activeSessionId", "sessionModeActive", "sessionPaused"], ...)` and restores those into `activeSessionId` and `globalUIState`, then `broadcastUIState()`.

### When state changes and which messages trigger it

- **visible:** Toggled by `ECHLY_TOGGLE_VISIBILITY` (e.g. from popup after login). Background flips `globalUIState.visible`, then `broadcastUIState()`.
- **expanded:** `ECHLY_EXPAND_WIDGET` sets `globalUIState.expanded = true`; `ECHLY_COLLAPSE_WIDGET` sets it `false`. Both broadcast.
- **isRecording:** `START_RECORDING` sets `globalUIState.isRecording = true` (and requires `activeSessionId`); `STOP_RECORDING` sets it `false`. Both broadcast.
- **activeSessionId / sessionId:**  
  - `ECHLY_SET_ACTIVE_SESSION` sets `activeSessionId` and `globalUIState.sessionId`, persists, broadcasts.  
  - `ECHLY_SESSION_MODE_END` clears `activeSessionId` and `globalUIState.sessionId`, persists, broadcasts.  
  - Session start/pause/resume messages keep `activeSessionId`/`sessionId` as-is but update session-mode flags.
- **sessionModeActive / sessionPaused:**  
  - `ECHLY_SESSION_MODE_START`: `sessionModeActive = true`, `sessionPaused = false`, persist, broadcast.  
  - `ECHLY_SESSION_MODE_PAUSE`: `sessionModeActive = true`, `sessionPaused = true`, persist, broadcast.  
  - `ECHLY_SESSION_MODE_RESUME`: `sessionModeActive = true`, `sessionPaused = false`, persist, broadcast.  
  - `ECHLY_SESSION_MODE_END`: both false, persist, broadcast.

### How it is broadcast

- `broadcastUIState()` runs `chrome.tabs.query({}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })))`.  
- Also: `chrome.tabs.onActivated` and `chrome.tabs.onCreated` push `ECHLY_GLOBAL_STATE` to the active/new tab so new or switched tabs get current state immediately.

---

## SECTION 3 — Message Bus

All message types observed in the codebase, with sender, receiver, payload, and side effects.

| Message type              | Sender   | Receiver  | Payload | Side effects |
|---------------------------|----------|-----------|---------|--------------|
| ECHLY_GET_AUTH_STATE      | Popup, Content | Background | None | Background responds `{ authenticated, user }`. |
| ECHLY_GET_GLOBAL_STATE    | Content  | Background | None | Background responds `{ state: globalUIState }`. |
| ECHLY_GET_ACTIVE_SESSION  | Content (CaptureWidget) | Background | None | Background responds `{ sessionId }`. |
| ECHLY_TOGGLE_VISIBILITY   | Popup    | Background | None | Flips globalUIState.visible, broadcast ECHLY_GLOBAL_STATE. |
| ECHLY_EXPAND_WIDGET       | Content  | Background | None | globalUIState.expanded = true, broadcast. |
| ECHLY_COLLAPSE_WIDGET     | Content  | Background | None | globalUIState.expanded = false, broadcast. |
| ECHLY_SET_ACTIVE_SESSION  | Content, App dashboard | Background | sessionId: string | Sets activeSessionId + globalUIState.sessionId, persist, broadcast. |
| ECHLY_SESSION_MODE_START  | Content  | Background | None | sessionModeActive = true, sessionPaused = false, persist, broadcast. |
| ECHLY_SESSION_MODE_PAUSE  | Content  | Background | None | sessionModeActive = true, sessionPaused = true, persist, broadcast. |
| ECHLY_SESSION_MODE_RESUME | Content  | Background | None | sessionModeActive = true, sessionPaused = false, persist, broadcast. |
| ECHLY_SESSION_MODE_END    | Content  | Background | None | activeSessionId = null, sessionModeActive/sessionPaused = false, persist, broadcast. |
| ECHLY_OPEN_POPUP          | Content  | Background | None | chrome.tabs.create({ url: popup.html }). |
| ECHLY_START_LOGIN / ECHLY_SIGN_IN / LOGIN | Popup | Background | None | Runs Google OAuth + token exchange, setTokenState, responds { success, user } or { success: false, error }. |
| ECHLY_GET_TOKEN           | (internal) | Background | None | Async: getValidToken(), respond { token } or { error: "NOT_AUTHENTICATED" }. |
| START_RECORDING           | Content  | Background | None | If activeSessionId set: isRecording = true, broadcast; else respond { ok: false, error }. |
| STOP_RECORDING            | Content  | Background | None | isRecording = false, broadcast. |
| CAPTURE_TAB               | Content  | Background | None (sender.tab used) | Async: chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }), respond { success, screenshot } or { success: false }. |
| ECHLY_UPLOAD_SCREENSHOT   | Content  | Background | imageDataUrl, sessionId, screenshotId | Async: getValidToken(), POST /api/upload-screenshot, respond { url } or { error }. |
| ECHLY_PROCESS_FEEDBACK    | Content  | Background | payload: { transcript, screenshotUrl?, screenshotId?, sessionId, context? } | Async: getValidToken(), POST structure-feedback, then POST /api/feedback per ticket; on success broadcast ECHLY_FEEDBACK_CREATED to all tabs; respond { success, ticket } or { success: false, error }. |
| echly-api                 | Content (contentAuthFetch) | Background | url, method?, headers?, body?, token? | Async: fetch with Authorization from token ?? getValidToken(); respond { ok, status, headers, body }. |
| ECHLY_GLOBAL_STATE        | Background | Content (all tabs) | state: GlobalUIState | Content listener updates host visibility and dispatches CustomEvent "ECHLY_GLOBAL_STATE" so React state updates. |
| ECHLY_FEEDBACK_CREATED    | Background | Content (all tabs) | ticket, sessionId | Content dispatches CustomEvent "ECHLY_FEEDBACK_CREATED". |
| ECHLY_TOGGLE              | (optional) | Content | None | Content dispatches CustomEvent "ECHLY_TOGGLE_WIDGET". |

**Content script message handling:** A single `chrome.runtime.onMessage.addListener` in `content.tsx` (in `ensureMessageListener`) handles `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`, and `ECHLY_TOGGLE`. For `ECHLY_GLOBAL_STATE` it sets the shadow host’s `style.display` from `state.visible` and dispatches the CustomEvent so the React tree (which listens for `ECHLY_GLOBAL_STATE` on `window`) can update.

---

## SECTION 4 — Widget Lifecycle

### Page load → content script mount

- **Manifest:** Content script is injected (e.g. via `content_scripts` in `manifest.json`) on the specified URLs (typically all or match pattern).
- **Entry:** `content.tsx` runs `main()` at load.
- **main():**
  1. Looks for existing `#echly-shadow-host` in the document.
  2. If not found: creates a `div`, sets `id="echly-shadow-host"`, positions it fixed bottom-right, `z-index: 2147483647`, `display: none`, appends to `document.documentElement`.
  3. Calls `mountReactApp(host)` once for that host.
  4. Calls `ensureMessageListener(host)` (single global listener for ECHLY_GLOBAL_STATE, ECHLY_FEEDBACK_CREATED, ECHLY_TOGGLE).
  5. Calls `syncInitialGlobalState(host)` (ECHLY_GET_GLOBAL_STATE → set host visibility and dispatch ECHLY_GLOBAL_STATE).
  6. Calls `ensureVisibilityStateRefresh()` (on `document.visibilitychange` when tab becomes visible, re-request ECHLY_GET_GLOBAL_STATE and sync).

### Shadow root creation

- **mountReactApp(host):**
  1. `host.attachShadow({ mode: "open" })`.
  2. `injectShadowStyles(shadowRoot)`: adds `<link id="echly-styles" href="popup.css">` and a style with `SHADOW_RESET` for `:host` and `#echly-root`.
  3. Creates a div with `id="echly-root"`, `data-theme` and `data-echly-ui`, appends to shadow root.
  4. `createRoot(container).render(<ContentApp widgetRoot={container} initialTheme={...} />)`.

### Widget render

- **ContentApp** (inside shadow DOM): Renders either "Sign in from extension" (if !user) or `<CaptureWidget ... />` with all extension props. Theme, auth, and global state (visible, expanded, sessionId, sessionModeActive, sessionPaused) come from React state that is updated from ECHLY_GLOBAL_STATE and ECHLY_GET_AUTH_STATE.

### Visibility toggle

- **Source of truth:** Background `globalUIState.visible`.
- **Toggle:** Popup (or any sender) sends `ECHLY_TOGGLE_VISIBILITY`. Background flips `visible` and broadcasts `ECHLY_GLOBAL_STATE` to all tabs.
- **Content:** In `ensureMessageListener`, when message type is `ECHLY_GLOBAL_STATE`, content sets `host.style.display = msg.state.visible ? "block" : "none"` and dispatches the CustomEvent. Inside ContentApp, a listener on `window` for `ECHLY_GLOBAL_STATE` also calls `setHostVisibility(s.visible)` and `setGlobalState(s)` so React re-renders with correct expanded/session state.

### Expand / collapse

- **Source of truth:** Background `globalUIState.expanded`.
- **Expand:** Content sends `ECHLY_EXPAND_WIDGET` (e.g. from widget footer or when entering capture). Background sets `expanded = true`, broadcasts.
- **Collapse:** Content sends `ECHLY_COLLAPSE_WIDGET`. Background sets `expanded = false`, broadcasts.
- **Content:** ContentApp passes `expanded={globalState.expanded}` and `onExpandRequest` / `onCollapseRequest` to CaptureWidget. CaptureWidget is controlled by this when in extension mode; it also sends collapse when entering capture flow so the tray doesn’t cover the overlay.

### Event flow (concise)

1. Page load → content script runs → main() → create or get host → mountReactApp → shadow root + React (ContentApp → CaptureWidget).
2. ensureMessageListener + syncInitialGlobalState + visibility refresh ensure host visibility and React state stay in sync with background.
3. User toggles extension icon → popup opens → ECHLY_GET_AUTH_STATE → if authenticated, ECHLY_TOGGLE_VISIBILITY → background flips visible → broadcast ECHLY_GLOBAL_STATE → content sets host display and dispatches event → React updates, widget appears.
4. User expands/collapses tray → content sends ECHLY_EXPAND_WIDGET or ECHLY_COLLAPSE_WIDGET → background updates expanded and broadcasts → content receives ECHLY_GLOBAL_STATE → React state updated, tray opens/closes.

---

## SECTION 5 — Capture Flow

End-to-end from "Start New Feedback Session" through ticket creation.

### Idle

- Widget shows command screen (e.g. "Start New Feedback Session", "Open previous session", "Capture feedback"). No capture root; state is `idle`.

### focus_mode

- User clicks "Start New Feedback Session" (or equivalent). In `useCaptureWidget`, `handleAddFeedback` runs (when `state === "idle"`):
  - Sets `widgetOpenBeforeCapture = isOpen`, `setIsOpenState(false)`.
  - `createCaptureRoot()`: creates `#echly-capture-root` on `document.body`, sets `captureRootEl` / `captureRootReady`.
  - `setState("focus_mode")`.
  - **Extension only:** If `extensionMode`, it returns here; the overlay (region or session) is shown and user either selects a region or (in session mode) clicks an element. **Web app:** After focus_mode it immediately takes a full-page screenshot and goes to voice_listening.

### region_selecting (extension, non-session)

- CaptureLayer shows RegionCaptureOverlay when `extensionMode` and state is `focus_mode` or `region_selecting`. User drags a rectangle. `handleRegionSelectStart` sets state to `region_selecting`. When user releases, RegionCaptureOverlay calls `getFullTabImage()` (see Screenshot system), then `cropImageToRegion(fullImage, targetRect, dpr)`, builds context with `buildCaptureContext`, then `onAddVoice(croppedDataUrl, context)` → `handleRegionCaptured`.

### Region captured

- `handleRegionCaptured(croppedDataUrl, context)`:
  - Creates a new recording entry (id, screenshot, transcript "", context), appends to `recordings`, sets `activeRecordingId`, calls `startListening()` → state becomes `voice_listening`.

### Screenshot captured (session mode)

- In session mode, user clicks an element. `handleSessionElementClicked(element)` runs:
  - `getFullTabImage()` (CAPTURE_TAB), then `cropScreenshotAroundElement(fullImage, element)`, `buildCaptureContext(window, element)`, sets `sessionFeedbackPending = { screenshot: cropped, context }`. SessionFeedbackPopup is shown with the cropped image; user can "Record voice" or "Type feedback".

### Voice recording

- **Start:** `startListening()`: requests microphone, creates AudioContext + Analyser for level meter, calls `recognitionRef.current.start()` (Web Speech API), `setState("voice_listening")`. Interim and final results are written into the active recording’s `transcript` via `recognition.onresult`.
- **Stop:** User clicks Done → `finishListening()`: sets `manualStopRef.current = true`, `recognitionRef.current.stop()`, then (if transcript length ≥ 5) either continues to processing (extension) or calls `onComplete(...)` (see below).

### Transcript created

- Transcript is the `activeRecording.transcript` after the user stops. It is passed into the feedback pipeline along with screenshot (data URL or null) and context.

### Processing

- **Extension path:** `onComplete` is `handleComplete` from `content.tsx`. It:
  - Uses `submissionLock` to prevent double submit.
  - Starts OCR: `getVisibleTextFromScreenshot(screenshot)` (async).
  - Generates `screenshotId`, starts `uploadScreenshot(...)` (ECHLY_UPLOAD_SCREENSHOT) without awaiting.
  - Builds `enrichedContext` (url, visibleText from OCR or context, etc.).
  - Calls `apiFetch("/api/structure-feedback", { body: JSON.stringify({ transcript, context: enrichedContext }) })` (proxied via background with token).
  - Depending on response:
    - If clarityScore ≤ 20 or needsClarification with no tickets: show Clarity Assistant (see Section 10), release lock, return.
    - If success and tickets: for each ticket POST to `/api/feedback` (via apiFetch), then attach screenshot URL when upload promise resolves via PATCH `/api/tickets/:id` with `screenshotUrl`. Calls `callbacks.onSuccess(ticket)` or `onError()`.
  - If structure fails or no tickets: can send `ECHLY_PROCESS_FEEDBACK` to background to create a single fallback ticket; background does structure-feedback + feedback API and responds; content then patches screenshot URL for the first ticket.
- **Session mode:** Same `handleComplete` with `options.sessionMode: true`; clarity assistant is skipped; feedback is submitted and marker is updated on success.

### Ticket creation

- Tickets are created by POST `/api/feedback` (from content via apiFetch or from background in ECHLY_PROCESS_FEEDBACK). First ticket gets `screenshotId`; when ECHLY_UPLOAD_SCREENSHOT resolves, content (or background) PATCHes `/api/tickets/:id` with `screenshotUrl`. Background may broadcast `ECHLY_FEEDBACK_CREATED` so all tabs can show the new ticket.

### Functions involved (in order for a typical region flow)

1. `handleAddFeedback` (useCaptureWidget) — enter focus_mode, create capture root.
2. `createCaptureRoot` — create #echly-capture-root.
3. CaptureLayer / RegionCaptureOverlay — user drags; `performCapture` → `getFullTabImage` → `cropImageToRegion` → `buildCaptureContext` → `onAddVoice`.
4. `handleRegionCaptured` — add recording, `startListening`.
5. `startListening` — getUserMedia, SpeechRecognition.start, set state voice_listening.
6. `finishListening` — stop recognition, validate transcript length, call `onComplete(transcript, screenshot, callbacks, context)`.
7. In content: `handleComplete` — OCR, uploadScreenshot, apiFetch structure-feedback, then apiFetch POST /api/feedback, then PATCH /api/tickets/:id with screenshotUrl when upload resolves.
8. Markers: in session mode, `createMarker` / `updateMarker` (feedbackMarkers.ts); list updated via `setPointers` / loadSessionWithPointers.

---

## SECTION 6 — Screenshot System

### How CAPTURE_TAB works

- **Sender:** Content script (from `getFullTabImage()` in useCaptureWidget). Sends `{ type: "CAPTURE_TAB" }` via `chrome.runtime.sendMessage`. No payload; background uses `sender.tab` to get the tab.
- **Receiver:** Background. Handler runs `chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, callback)`. Result is a data URL string. Responds `{ success: true, screenshot: dataUrl }` or `{ success: false }`. Capture runs in the background’s context so it captures the tab’s visible view (excluding browser chrome), not the content script’s DOM.

### How overlay is hidden during capture

- In useCaptureWidget, `captureTabWithoutOverlay(capture)` wraps the capture call:
  - Gets `#echly-capture-root` (the overlay container). Saves `previousDisplay = overlay.style.display`, sets `overlay.style.display = "none"`, then `requestAnimationFrame` once, then runs `capture()` (which triggers the sendMessage for CAPTURE_TAB). In a `finally` block it restores `overlay.style.display = previousDisplay`. So the overlay is hidden only for the brief moment when the background runs captureVisibleTab; the content script has already hidden the overlay before the message is sent, so the next paint in the tab does not include the overlay. Note: the actual screenshot is taken by the background from the tab’s current frame; the content script hiding the overlay ensures that when the user sees the next frame after the async round-trip, the overlay is back.

### How region cropping works

- **Full image:** From CAPTURE_TAB (data URL of full visible tab).
- **Region:** In RegionCaptureOverlay, user selects a rectangle (x, y, w, h) in CSS pixels. `cropImageToRegion(fullImageDataUrl, region, dpr)` (RegionCaptureOverlay.tsx): loads image into an Image, uses a canvas to draw the region with source coordinates scaled by dpr (`sx, sy, sw, sh = region * dpr`), then `canvas.toDataURL("image/png")`.
- **Session mode (element crop):** `cropScreenshotAroundElement(fullImage, element, padding)` (cropAroundElement.ts): computes `getCropRegionForElement(element, padding)` (element’s getBoundingClientRect with padding, clamped to viewport), then calls `cropImageToRegion(fullImage, region, dpr)`.

### How screenshot data is passed to APIs

- **Upload:** Content calls `uploadScreenshot(imageDataUrl, sessionId, screenshotId)` which sends `ECHLY_UPLOAD_SCREENSHOT` to background. Background POSTs to `/api/upload-screenshot` with JSON body `{ screenshotId, imageDataUrl, sessionId }` and Bearer token. Server returns `{ url }`; background responds with `{ url }` or `{ error }`. Content does not send the data URL to structure-feedback or feedback APIs; it sends optional `screenshotUrl` (after upload) and `screenshotId` for the first ticket.
- **Feedback creation:** Tickets are created with `screenshotUrl: null` and `screenshotId` for the first ticket. When the upload promise resolves, content (or background) PATCHes the ticket with `screenshotUrl: url`.

---

## SECTION 7 — Voice Pipeline

### How voice recording begins

- **Normal/region flow:** After region is captured, `handleRegionCaptured` calls `startListening()`. Alternatively, from "Capture feedback" (full page) in web app, capture runs and then `startListening()`.
- **Session mode:** User clicks element → sessionFeedbackPending is set → SessionFeedbackPopup shows → user clicks "Record voice" → `handleSessionStartVoice()` creates a new recording with pending screenshot/context, sets activeRecordingId, calls `startListening()`.

### How audio is captured

- `startListening()` (useCaptureWidget): `navigator.mediaDevices.getUserMedia({ audio: true })` → MediaStream stored in `mediaStreamRef`. An AudioContext is created, AnalyserNode (fftSize 256) is fed from `createMediaStreamSource(stream)`. The same stream is not fed to the recognition; the Web Speech API uses the browser’s own capture. The Analyser is used only for the level meter (getByteFrequencyData in a requestAnimationFrame loop) while state is `voice_listening`.

### How transcript is generated

- `SpeechRecognition` (or `webkitSpeechRecognition`) is created once in a useEffect; `continuous = true`, `interimResults = true`, `lang = "en-US"`. On `onresult`, the handler concatenates all result items’ `transcript` and updates the active recording’s `transcript` in state. So the transcript is the concatenation of all segments (interim + final) for that recording session.

### How transcript enters feedback processing

- When the user clicks Done, `finishListening()` runs. It gets the active recording’s `transcript`. If length &lt; 5 characters it skips the pipeline and resets to idle. Otherwise it calls `onComplete(transcript, screenshot, callbacks, context)` (and in session mode passes `sessionMode: true`). `onComplete` in content.tsx is `handleComplete`, which runs OCR, upload, structure-feedback, then feedback creation and optional PATCH for screenshot (see Section 5 and 8).

---

## SECTION 8 — Feedback Creation

### contentAuthFetch / apiFetch

- **contentAuthFetch.ts:** `apiFetch(path, options)` builds full URL with API_BASE, then calls `authFetch(url, options)`. `authFetch` sends `{ type: "echly-api", url, method, headers, body }` to the background. Background uses `getValidToken()` (or optional token in request), adds Authorization header, runs fetch, responds with `{ ok, status, headers, body }`. So all content-originated API calls are authenticated by the background.

### structure-feedback call

- **From content:** After voice is done, `handleComplete` calls `apiFetch("/api/structure-feedback", { method: "POST", body: JSON.stringify({ transcript, context: enrichedContext }) })`. Context includes url, visibleText (from OCR or existing), viewport, domPath, nearbyText, subtreeText, etc.
- **From background (fallback):** When content sends `ECHLY_PROCESS_FEEDBACK` with payload, background does `POST /api/structure-feedback` with `{ transcript, context }` (or just transcript). Response is parsed for `success`, `tickets`, `error`; if no tickets, background may create one fallback ticket and then create feedback via POST /api/feedback.

### Ticket creation API

- **POST /api/feedback:** Body includes sessionId, title, description, type, contextSummary, actionSteps, suggestedTags, screenshotUrl (often null initially), screenshotId (for first ticket), metadata. Returns ticket with id, title, description, type. Content or background sends this request for each ticket returned by structure-feedback (or one fallback).

### Screenshot upload API

- **POST /api/upload-screenshot:** Called by background on `ECHLY_UPLOAD_SCREENSHOT` with body `{ screenshotId, imageDataUrl, sessionId }`, Bearer token. Server stores the image and returns `{ url }`. Content starts this upload early (in handleComplete) and does not await it before calling structure-feedback and creating tickets.

### PATCH ticket with screenshot

- After the upload promise resolves, content (or background) calls `apiFetch(\`/api/tickets/${ticketId}\`, { method: "PATCH", body: JSON.stringify({ screenshotUrl: url }) })` so the ticket is updated with the final screenshot URL. This is done for the first ticket only when multiple are created.

### Full API pipeline (summary)

1. structure-feedback (POST) with transcript + context → tickets + optional clarity fields.
2. For each ticket: POST /api/feedback → ticket id.
3. In parallel/after: POST /api/upload-screenshot (from content via ECHLY_UPLOAD_SCREENSHOT) → url.
4. When url is available: PATCH /api/tickets/:id with { screenshotUrl: url } for the first ticket.

---

## SECTION 9 — Session Mode

### How session mode starts

- User clicks "Start New Feedback Session" in extension. `startSession()` in useCaptureWidget runs: if extensionMode and onCreateSession/onActiveSessionChange exist, it calls `onCreateSession()` (content’s `createSession` → POST /api/sessions), then `onActiveSessionChange(session.id)` (sends ECHLY_SET_ACTIVE_SESSION), clears pointers, then `onSessionModeStart()` (sends ECHLY_SESSION_MODE_START). Background sets sessionModeActive true, sessionPaused false, persists, broadcasts. Content’s CaptureWidget receives globalSessionModeActive from global state; useCaptureWidget’s useEffect syncs: when globalSessionModeActive is true it sets sessionMode true, sessionPaused from global state, and ensures capture root is created (createCaptureRoot). CaptureLayer then shows SessionOverlay because sessionMode && extensionMode.

### Element hover (highlighter)

- **elementHighlighter.ts:** `attachElementHighlighter(container, { getActive })` creates a single fixed div (outline + semi-transparent fill), appends to container. On `mousemove`, if `getActive()` is true it calls `getElementUnderPoint(e.clientX, e.clientY)` which uses `document.elementsFromPoint` and returns the first element that passes `isSessionCaptureTarget(el)`. If the element under the cursor changes, it updates the overlay’s position/size to the element’s getBoundingClientRect(). So the highlight follows the hovered element. SessionOverlay passes `getActive` that is true when sessionMode && !sessionPaused && !sessionActionPending && !sessionFeedbackPending.

### Element selection (click capture)

- **clickCapture.ts:** `attachClickCapture(container, { enabled, onElementClicked })` adds a capture-phase listener on document for "click". When enabled() is true and the click target (or ancestor) passes `isSessionCaptureTarget`, it prevents default, stops propagation, and calls `onElementClicked(target)`. SessionOverlay enables this when session is active and not paused and no feedback popup is showing. So only valid DOM elements (not Echly UI, not inputs/contenteditable) trigger the callback.

### Element screenshots

- When `onElementClicked` runs, it is `handleSessionElementClicked(element)` in useCaptureWidget: gets full tab image via `getFullTabImage()`, then `cropScreenshotAroundElement(fullImage, element)` (padding 40px), builds context with `buildCaptureContext(window, element)`, sets `sessionFeedbackPending = { screenshot: cropped, context }`. SessionFeedbackPopup is rendered with that screenshot; user can record voice or type text.

### Markers on page

- **feedbackMarkers.ts:** Markers are DOM nodes in `#echly-marker-layer` (inside #echly-capture-root). `createMarker(captureLayerContainer, data, options)` creates a numbered circle (e.g. "1", "2") at a position (or at element center via getCenterFromElement), with scroll/resize listeners to keep position correct. Session mode: after user submits voice, a placeholder marker is created with "Saving feedback…"; when the pipeline succeeds, `updateMarker(placeholderId, { id: ticket.id, title: ticket.title })` is called. Markers are removed on session end or when the capture root is removed.

### sessionMode.ts and isSessionCaptureTarget

- **sessionMode.ts:** Exports `logSession`, `isSessionCaptureTarget(element)`. The latter returns false for body, Echly elements (isEchlyElement), elements inside #echly-shadow-host, input/textarea/select, and contenteditable. Used by elementHighlighter and clickCapture to decide which elements can be highlighted and clicked.

---

## SECTION 10 — Clarity Assistant

### How clarityScore is calculated

- The **backend** (structure-feedback API) returns optional fields: `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence`. The extension does not compute clarityScore; it only reads the API response. In content.tsx, `data.clarityScore` is used (with fallback to 100 if missing).

### When clarity assistant appears

- In `handleComplete` (content.tsx), after structure-feedback returns:
  - **Not in session mode:** If `data.success` and `clarityScore <= 20`: pending state is set with tickets, screenshotId, uploadPromise, transcript, clarityScore, clarityIssues, suggestedRewrite, confidence, callbacks; `setShowClarityAssistant(true)` and `submissionLock` is released. No ticket is created yet.
  - Also: If `data.success` and `needsClarification` and `tickets.length === 0`: same flow, using `verificationIssues` or clarityIssues. So the clarity assistant appears when the backend says feedback is unclear (low score) or needs clarification with no tickets.

### What options the user has

- **Card UI:** "Quick suggestion" title, message that feedback may be unclear, optional example rewrite. A textarea shows the current (or edited) transcript.
- **Edit feedback:** User clicks "Edit feedback" → `setIsEditingFeedback(true)` → user can change `editedTranscript` in the textarea.
- **Done (after edit):** Submits with `submitEditedFeedback(pending, editedTranscript)` (re-runs structure-feedback on edited text, then POST /api/feedback for each ticket, PATCH screenshot when upload resolves).
- **Submit anyway:** Submits without editing via `submitPendingFeedback(pending)` (if tickets exist, POST feedback for each; if no tickets, sends ECHLY_PROCESS_FEEDBACK to background to create one ticket).
- **Use suggestion:** There is also a path that uses `suggestedRewrite` (handleExtensionClarityUseSuggestion) to re-structure and submit.

### How feedback is edited before submission

- User edits the textarea (`editedTranscript`). On "Done", `submitEditedFeedback(pending, editedTranscript)` is called: POST /api/structure-feedback with `{ transcript: trimmed, context: pending.context }`, then for each returned ticket POST /api/feedback, then when upload resolves PATCH /api/tickets/:id with screenshotUrl. So the edited text replaces the original transcript for structure and ticket creation.

---

## SECTION 11 — OCR System

### When OCR runs

- In content.tsx `handleComplete`, after the user finishes voice and before calling structure-feedback, the code runs `getVisibleTextFromScreenshot(screenshot ?? null)` (from ocr.ts). It is awaited and the result is merged into context as `visibleText`. So OCR runs once per feedback submission, on the screenshot data URL (full or cropped).

### What text is extracted

- **ocr.ts:** `getVisibleTextFromScreenshot(imageDataUrl)` uses Tesseract.js: `Tesseract.createWorker("eng")`, `worker.recognize(imageDataUrl)`, then `worker.terminate()`. Returns `data.text`: trimmed, whitespace collapsed, then sliced to max 2000 characters. On any error it returns "" (fail-silent).

### How it contributes to context

- The result is set as `context.visibleText` (and in enrichedContext for structure-feedback). The structure-feedback API uses context (url, viewport, domPath, nearbyText, subtreeText, visibleText) to improve title/description and clarity. So OCR gives the AI visible text from the screenshot when DOM-based visibleText is not available or as supplement.

---

## SECTION 12 — State Machine (Capture Flow)

Simplified states and transitions:

```
idle
  → (Start New Feedback / Capture feedback) → focus_mode

focus_mode (extension)
  → (User drags region) → region_selecting
  → (User clicks element in session mode) → [sessionFeedbackPending set; state can stay focus_mode or voice_listening when recording]

region_selecting
  → (User releases selection → capture → add recording) → voice_listening
  → (Cancel) → cancelled → (cleanup) → idle

voice_listening
  → (User clicks Done, transcript ≥ 5 chars) → processing
  → (User clicks Done, transcript < 5 chars) → idle
  → (Recognition ends unexpectedly) → idle
  → (Escape) → cancelled → idle

processing
  → (Success) → success (brief) → idle (+ remove capture root, restore widget)
  → (Error) → voice_listening (retry) or error state

Session mode:
  idle + sessionMode
  → (Click element) → sessionFeedbackPending set; user can Record voice → voice_listening
  → (Done voice) → processing (async) → marker updated, sessionFeedbackPending cleared, state idle
```

**Transitions in code:** `setState(...)` in useCaptureWidget; CAPTURE_FLOW_STATES = ["focus_mode", "region_selecting", "voice_listening", "processing"]. Idle, cancelled, error, success are outside that list and allow closing/collapsing the overlay.

---

## SECTION 13 — Error Handling

### API failure handling

- **contentAuthFetch / echly-api:** If `chrome.runtime.lastError` or missing response, Promise rejects. If response has status/body, caller (content) checks res.ok and response body. In handleComplete, structure or feedback failures are caught; callbacks.onError() is called, submissionLock released, and in some paths ECHLY_PROCESS_FEEDBACK is sent as fallback.
- **Background (ECHLY_PROCESS_FEEDBACK, ECHLY_UPLOAD_SCREENSHOT):** On fetch errors or non-ok responses, sendResponse({ success: false, error: message }) or { error }. No automatic retry.

### Screenshot failure

- **CAPTURE_TAB:** Background responds { success: false }. Content’s getFullTabImage rejects; RegionCaptureOverlay performCapture or handleSessionElementClicked catch and call onCancel() or return without setting sessionFeedbackPending.
- **captureTabWithoutOverlay:** If capture() throws, overlay display is still restored in finally.

### Voice failure

- **Microphone permission denied:** startListening catch sets errorMessage "Microphone permission denied.", state "error", removeCaptureRoot, restoreWidget.
- **Recognition onend (unexpected):** If manualStopRef is false and state is voice_listening, setState("idle") so user can retry.

### Auth expiration

- **getValidToken():** If no refreshToken, throws "NOT_AUTHENTICATED". In echly-api handler, that message is caught and sendResponse({ ok: false, status: 401, body: "Not authenticated" }). Content’s authFetch receives non-ok response; callers (handleComplete, etc.) see failed fetch and can call onError(). Popup does not automatically re-open; user would need to open popup again and re-login if token was cleared.

---

## SECTION 14 — Performance Notes

- **Heavy OCR usage:** Tesseract.js runs in the content script once per submission on the screenshot (full or cropped). Large or high-DPR images can make this slow and CPU-heavy; worker.terminate() is called so worker is not kept alive.
- **Large bundle size:** content.js is a single bundled file (e.g. 4000+ lines); includes React, CaptureWidget, OCR dependency. Could affect injection time and memory on many tabs.
- **Repeated renders:** React state in ContentApp and useCaptureWidget can trigger many re-renders (global state, recordings, session mode, sessionFeedbackPending). No explicit memoization of the whole widget tree beyond normal React patterns.
- **Memory during capture:** Full-tab screenshot data URLs can be large (e.g. 1–3 MB). They are held in component state (recordings, sessionFeedbackPending) until submission and cleanup. Multiple recordings in one session keep multiple data URLs in memory.
- **Broadcast to all tabs:** broadcastUIState() sends a message to every tab; tabs without content script or with errors will have sendMessage rejected (caught with .catch(() => {})). No impact on correctness but many tabs could mean many no-op sends.
- **Session markers:** Scroll and resize listeners are added per marker layer; updateMarkerPositions runs on each scroll/resize. Many markers could add overhead on scroll-heavy pages.

---

## SECTION 15 — Final Summary

**High-level product flow:**

1. **User opens extension** (clicks icon) → Popup opens. If not logged in, user clicks "Continue with Google" → background runs Google OAuth and Firebase Identity Toolkit exchange → tokens stored in background and chrome.storage.local. Popup toggles widget visibility and closes.
2. **Widget appears** on the page (content script already injected; host was created with display:none). Background broadcasts visible=true so the host becomes visible and the CaptureWidget is shown in the shadow root.
3. **User starts feedback** by choosing "Start New Feedback Session" (creates session, sets active session, enters session mode) or "Capture feedback" (enters focus_mode). In extension, focus_mode shows either a region-drag overlay or session overlay (click elements). User either selects a region or clicks an element; in session mode a cropped screenshot and context are stored and a voice/text popup is shown.
4. **Screenshot is captured** via CAPTURE_TAB (overlay hidden briefly). Image is full tab or cropped to region/element. Upload is started asynchronously (ECHLY_UPLOAD_SCREENSHOT) and not awaited before AI step.
5. **User speaks feedback** (or types in session popup). Web Speech API produces a transcript; user clicks Done. If transcript is too short, flow resets; otherwise pipeline runs.
6. **System structures feedback:** Content (or background as fallback) calls structure-feedback API with transcript and context (URL, viewport, DOM path, nearby text, OCR visibleText). If clarity is low or clarification needed, Clarity Assistant is shown and user can edit or submit anyway. Otherwise, for each returned ticket, POST /api/feedback creates the ticket.
7. **Ticket is created** with optional screenshotUrl (null at first). When upload completes, PATCH /api/tickets/:id sets screenshotUrl. In session mode, a marker is placed on the page and the list is updated. Background may broadcast ECHLY_FEEDBACK_CREATED so other tabs can refresh.

**In one sentence:** User signs in via popup (background OAuth), opens the widget on any page, starts a session or single capture, selects region or element, records voice (or types), and the extension structures the feedback via API, creates tickets, uploads the screenshot, and attaches it to the first ticket—with an optional clarity step when the backend flags unclear feedback.

This document should allow an engineer or AI to safely modify extension behavior (e.g. new messages, different capture flow, or clarity rules) without reading the entire codebase.
