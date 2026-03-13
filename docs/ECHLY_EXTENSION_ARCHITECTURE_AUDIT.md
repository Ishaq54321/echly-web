# Echly Browser Extension — Architecture Audit Report

**Audit type:** Read-only architecture analysis  
**Scope:** Echly Chrome extension codebase  
**No code was modified, refactored, or deleted.**

---

## 1. Extension Folder Structure

The extension lives at **`echly-extension/`** (sibling to the main app). Built outputs (`background.js`, `content.js`, `popup.js`) are produced from TypeScript/React sources; the extension also depends on shared code from the repo root (`lib/`, `components/CaptureWidget`).

```
echly-extension/
├── manifest.json           # MV3 manifest; permissions, content_scripts, background, action
├── background.js           # Built from src/background.ts
├── content.js              # Built from src/content.tsx (bundles CaptureWidget + deps)
├── popup.js                # Built from src/popup.tsx
├── popup.html              # Popup shell; loads popup.js, popup.css
├── popup.css               # Popup + widget styles (also web_accessible for content)
├── popup-overrides.css     # Popup overrides
├── input.css               # Tailwind/input styles (if used in build)
├── extension-fonts.css     # Font face definitions
├── README.md               # Setup (OAuth, build, load unpacked)
├── assets/
│   ├── Echly_logo.svg
│   └── Echly_logo_launcher.svg
├── fonts/
│   ├── PlusJakartaSans-Bold.woff2
│   ├── PlusJakartaSans-Medium.woff2
│   ├── PlusJakartaSans-Regular.woff2
│   └── PlusJakartaSans-SemiBold.woff2
├── stubs/
│   └── next-image.tsx      # Stub for next/image so CaptureWidget bundles without Next
└── src/
    ├── background.ts       # Service worker: auth, token, session, API proxy, capture
    ├── content.tsx         # Content script: shadow root, React app, CaptureWidget, messaging
    ├── popup.tsx           # Popup UI: auth check, login, toggle visibility
    ├── contentAuthFetch.ts # authFetch / apiFetch: proxy API through background (echly-api)
    ├── contentScreenshot.ts# generateFeedbackId, generateScreenshotId, uploadScreenshot (→ background)
    ├── screenshotUpload.ts # Firebase Storage upload (used by web app; extension uses API upload)
    ├── api.ts              # Direct apiFetch with Firebase auth (extension uses contentAuthFetch)
    ├── auth.ts             # Firebase + chrome.identity sign-in (background owns login flow)
    ├── firebase.ts         # Firebase app/auth/db/storage init (shared config from lib)
    └── ocr.ts              # Tesseract.js OCR on screenshot (content script; fail-silent, max 2000 chars)
```

**Shared code (outside echly-extension):**

- **`lib/`** — `firebase/config`, `utils/logger`, `debug/echlyLogger`, `captureContext` (buildCaptureContext, getDomPath, etc.)
- **`components/CaptureWidget/`** — Full widget: hooks (useCaptureWidget), session (elementHighlighter, clickCapture, cropAroundElement, feedbackMarkers, sessionMode), RegionCaptureOverlay, UI components. Used by content script via path alias `@/components/CaptureWidget`.

---

## 2. Manifest Analysis

**File:** `echly-extension/manifest.json`

| Field | Value |
|-------|--------|
| **manifest_version** | 3 |
| **name** | Echly |
| **version** | 1.0 |
| **description** | Capture screenshots and submit feedback |

### Permissions

- **`identity`** — Used for `chrome.identity.launchWebAuthFlow` (Google Sign-In).
- **`storage`** — `chrome.storage.local` for auth tokens, session state, global UI state.
- **`activeTab`** — Access to the current tab (e.g. for capture).
- **`tabs`** — `chrome.tabs.query`, `chrome.tabs.sendMessage`, `chrome.tabs.create` for cross-tab state and capture.

### OAuth2

- **client_id:** Google OAuth2 client (Chrome app type).
- **scopes:** `profile`, `email`.

### host_permissions

- **`<all_urls>`** — Content script and API/capture can run on any page.
- **`http://localhost:3000/*`** — Echly backend (API base).
- **`https://echly-web.vercel.app/*`** — Production app.
- **`https://*.firebaseapp.com/*`**, **`https://www.gstatic.com/*`**, **`https://securetoken.googleapis.com/*`**, **`https://www.googleapis.com/*`**, **`https://apis.google.com/*`** — Firebase Auth and Google APIs.

### Content scripts

- **matches:** `["<all_urls>"]`
- **js:** `["content.js"]`
- **run_at:** `document_idle` — Injected after DOM is ready, not blocking.

### Background

- **service_worker:** `background.js` (single script).

### Action / popup

- **action.default_popup:** `popup.html` — Clicking the extension icon opens the popup.

### web_accessible_resources

- **popup.css**, **assets/Echly_logo.svg**, **assets/Echly_logo_launcher.svg**, **PlusJakartaSans** fonts.
- **matches:** `["<all_urls>"]` — Content script can load these in shadow DOM (e.g. `chrome.runtime.getURL("popup.css")`).

---

### Plain-language summary

1. **When the extension loads**  
   The service worker (`background.js`) starts when the browser loads the extension. It initializes session state from `chrome.storage.local`, restores token state, and sets up a single `chrome.runtime.onMessage` listener. It does not inject into pages by itself.

2. **When content scripts inject**  
   On **every** page load matching `<all_urls>`, the browser injects `content.js` at **document_idle**. The content script creates a single shadow host (`#echly-shadow-host`), mounts the React app (including CaptureWidget), and listens for messages. Visibility of the widget is controlled by the background (e.g. `ECHLY_GLOBAL_STATE.visible`), not by injection logic.

3. **Domains the extension can run on**  
   Content script runs on **all URLs** (`<all_urls>`). The backend and Google/Firebase calls are allowed by host_permissions (localhost, Vercel, Firebase, Google).

4. **Browser permissions**  
   **identity** (Google Sign-In), **storage** (persist tokens and session), **activeTab** (current tab), **tabs** (all tabs for broadcast and capture). No declarativeNetRequest or scripting permissions.

---

## 3. Extension Components

| Component | File(s) | Purpose | When it runs | Communicates with |
|-----------|---------|---------|--------------|-------------------|
| **Background script** | `background.ts` → `background.js` | Single source of truth for auth, tokens, session, and global UI state. Handles login (Google ID token → Firebase IDP exchange), token refresh, session idle timeout (30 min), and all Echly API calls (feedback, sessions, upload-screenshot, structure-feedback). Performs tab capture (`CAPTURE_TAB`). | Service worker lifecycle; stays alive for message handling. | Content scripts (broadcasts `ECHLY_GLOBAL_STATE`, `ECHLY_RESET_WIDGET`; receives all request types). Popup (auth, toggle). Chrome storage, Chrome identity, fetch to API and Firebase. |
| **Content script** | `content.tsx` → `content.js` | Thin UI layer: creates one shadow host, mounts React (ContentApp) with CaptureWidget. Syncs state only from background. Handles auth state for “Sign in from extension”, theme, session/feedback list, and the full capture pipeline (voice/region/session mode). | After page load at `document_idle`; one mount per page. | Background (sendMessage for token, auth, session, capture, upload, API proxy). CaptureWidget (same JS context). Window/document events (visibilitychange, ECHLY_* custom events). |
| **Popup** | `popup.tsx` + `popup.html` | Login-only UI. If not authenticated: show “Continue with Google”. If authenticated: call toggle visibility and close. | When user clicks the extension icon. | Background only (ECHLY_GET_AUTH_STATE, ECHLY_START_LOGIN, ECHLY_TOGGLE_VISIBILITY). |
| **Capture utilities** | `contentScreenshot.ts`, `ocr.ts`; shared: `lib/captureContext.ts`, `components/CaptureWidget/session/*`, `RegionCaptureOverlay`, `lib/captureContext` | **contentScreenshot:** IDs and screenshot upload via message to background. **ocr.ts:** Tesseract.js in content script for visible text from image (fail-silent, 2k chars). **CaptureWidget/session:** Element highlighter, click capture, crop around element, feedback markers. **captureContext:** buildCaptureContext, getDomPath, subtree/nearby/visible text. | When user starts capture (region or session click); OCR runs during pipeline before structure-feedback. | Content → background (ECHLY_UPLOAD_SCREENSHOT). Rest is in-page (DOM, canvas crop). |
| **API utilities** | `contentAuthFetch.ts` | `apiFetch()` / `authFetch()`: build request, send as `echly-api` message to background; background adds Bearer token and performs fetch; returns Response-like object to content. | When content or CaptureWidget needs to call Echly API (sessions, feedback, structure-feedback, tickets PATCH, etc.). | Content → background (echly-api); background → Echly backend (fetch). |
| **Shared helpers** | `lib/utils/logger`, `lib/debug/echlyLogger`, `lib/firebase/config` | Logging and Firebase config used by background and content (via bundler). | Whenever code paths run. | None (logging only; config is static). |

**Note:** `api.ts` and `auth.ts` in the extension use Firebase Auth directly (e.g. `auth.currentUser.getIdToken()`). The main flows use **background** for auth (identity + token exchange/refresh) and **contentAuthFetch** for API from content. Popup and content get auth state via messages (`ECHLY_GET_AUTH_STATE`, etc.), not via `api.ts`/`auth.ts` in the content context.

---

## 4. Message Passing Architecture

All extension messaging uses **one-way request/response** via `chrome.runtime.sendMessage` and `chrome.runtime.onMessage`. There are **no** `chrome.runtime.connect` long-lived ports in the codebase.

### Direction: Popup → Background

- **ECHLY_GET_AUTH_STATE** — Popup asks for auth; background responds `{ authenticated, user }`.
- **ECHLY_START_LOGIN** / **ECHLY_SIGN_IN** / **LOGIN** — Popup triggers login; background runs `chrome.identity.launchWebAuthFlow`, exchanges Google ID token for Firebase tokens, stores in `chrome.storage.local`, responds `{ success, user }` or `{ success: false, error }`.
- **ECHLY_TOGGLE_VISIBILITY** — Popup toggles global widget visibility; background updates `globalUIState.visible` and broadcasts.

### Direction: Content → Background

- **ECHLY_GET_GLOBAL_STATE** — Content requests current session/visibility/pointers; background responds `{ state }`.
- **ECHLY_GET_AUTH_STATE** — Content checks if user is signed in.
- **ECHLY_GET_TOKEN** — Content (or background’s own async work) requests a valid Bearer token; background returns `{ token }` or `{ error: "NOT_AUTHENTICATED" }`.
- **ECHLY_OPEN_POPUP** — Content asks to open popup (e.g. new tab) for sign-in.
- **ECHLY_TOGGLE_VISIBILITY**, **ECHLY_EXPAND_WIDGET**, **ECHLY_COLLAPSE_WIDGET** — Content updates global UI state; background broadcasts.
- **ECHLY_SET_ACTIVE_SESSION** — Content sets active session; background loads feedback list and session title, persists, broadcasts.
- **ECHLY_SESSION_MODE_START/PAUSE/RESUME/END**, **ECHLY_SESSION_ACTIVITY** — Session lifecycle; background updates state and resets idle timer.
- **ECHLY_FEEDBACK_CREATED**, **ECHLY_TICKET_UPDATED**, **ECHLY_SESSION_UPDATED** — Content notifies background so `globalUIState.pointers` and session title stay in sync.
- **START_RECORDING** / **STOP_RECORDING** — Content notifies recording state.
- **CAPTURE_TAB** — Content requests full-tab screenshot; background calls `chrome.tabs.captureVisibleTab(sender.tab.windowId)` and responds `{ success, screenshot }`.
- **ECHLY_UPLOAD_SCREENSHOT** — Content sends image data URL + sessionId + screenshotId; background POSTs to `/api/upload-screenshot` with Bearer token and responds `{ url }` or `{ error }`.
- **ECHLY_PROCESS_FEEDBACK** — Content sends transcript + optional screenshot/context; background calls structure-feedback and feedback APIs, then broadcasts ECHLY_FEEDBACK_CREATED and responds with ticket or error.
- **echly-api** — Generic API proxy: content sends `{ url, method, headers, body, token? }`; background fetches with Bearer token and returns `{ ok, status, headers, body }`.

### Direction: Background → Content

- **ECHLY_GLOBAL_STATE** — Broadcast to all tabs (and on tab activation/creation) with `globalUIState` (visible, expanded, sessionId, sessionTitle, sessionModeActive, sessionPaused, pointers, captureMode, etc.).
- **ECHLY_RESET_WIDGET** — Sent to all tabs when session ends or idle timeout; content resets widget state.
- **ECHLY_FEEDBACK_CREATED** — After background creates feedback (e.g. ECHLY_PROCESS_FEEDBACK), broadcast to tabs with ticket + sessionId so UI can update.
- **ECHLY_SESSION_STATE_SYNC** — On tab activation; content then requests **ECHLY_GET_GLOBAL_STATE** to refresh.

### Content script ↔ Web page

- Content does **not** use `postMessage` to the page’s own window/frames. It uses **window custom events** only for its own React tree and listeners:
  - **ECHLY_GLOBAL_STATE** — Content listener applies state to React state and host visibility.
  - **ECHLY_TOGGLE_WIDGET** — Toggle handler.
  - **ECHLY_RESET_WIDGET** — Reset and collapse.
  - **ECHLY_FEEDBACK_CREATED** — Detail with ticket/sessionId.
- So: “Content Script ↔ Web App” is **internal** (content script’s DOM and events). The host page does not receive Echly protocol messages.

### Message flow (step-by-step)

1. **User opens popup** → Popup sends **ECHLY_GET_AUTH_STATE** → Background reads tokenState from memory/storage → Responds → If not authenticated, user clicks “Continue with Google” → **ECHLY_START_LOGIN** → Background runs OAuth flow, exchanges token, stores it, responds → Popup sends **ECHLY_TOGGLE_VISIBILITY** and closes.
2. **User on any page** → Content already injected, hidden by default → Background sends **ECHLY_GLOBAL_STATE** (e.g. after toggle) → Content shows tray.
3. **User starts capture** → Content/CaptureWidget requests **CAPTURE_TAB** → Background runs `chrome.tabs.captureVisibleTab` → Returns data URL → Content crops/uses it and collects context, then either uses **apiFetch** (contentAuthFetch → **echly-api**) for structure-feedback + feedback, or **ECHLY_UPLOAD_SCREENSHOT** for upload and **ECHLY_PROCESS_FEEDBACK** for fallback processing.
4. **Session mode** → Content sends **ECHLY_SET_ACTIVE_SESSION** → Background fetches feedback + sessions, broadcasts **ECHLY_GLOBAL_STATE** → Content shows pointers and session UI. On feedback create, content sends **ECHLY_FEEDBACK_CREATED** → Background appends to pointers and broadcasts again.

---

## 5. Capture System Architecture

### 5.1 How the extension identifies the element

- **Region mode:** User draws a region in `RegionCaptureOverlay`; the overlay uses canvas and returns a cropped image and optional element (e.g. from `elementsFromPoint`) for context.
- **Session (click) mode:**  
  - **elementHighlighter:** On `mousemove`, uses `document.elementsFromPoint(x, y)` and filters with **isSessionCaptureTarget** (excludes body, Echly UI, shadow host, inputs, contenteditable). A single overlay div shows a blue outline around the topmost valid element.  
  - **clickCapture:** Capture-phase `click` listener; if target is **isSessionCaptureTarget**, prevents default and calls `onElementClicked(element)`.

So “identify element” = **elementsFromPoint** + **isSessionCaptureTarget** (and in session mode, **clickCapture** to confirm the element).

### 5.2 How the screenshot is captured

- **Full-tab screenshot:** Content sends **CAPTURE_TAB** to background. Background calls `chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" })` and returns the data URL to content.
- **Hiding UI for capture:** Before requesting **CAPTURE_TAB**, CaptureWidget uses **hideEchlyUI** (lib/CaptureWidget/hideEchlyUI) to temporarily hide Echly UI nodes, then **restoreEchlyUI** after capture so the screenshot does not include the widget.
- **Region crop:** In content, after receiving the full-tab data URL, either:
  - **RegionCaptureOverlay** path: user-selected region → `cropImageToRegion(fullImage, region, dpr)` (canvas) → cropped data URL; optional **buildCaptureContext(window, element)** for context.
  - **Session click path:** `getFullTabImage()` (which uses **CAPTURE_TAB**), then **detectVisualContainer(element)** and **clampRect** → **cropImageToRegion(fullImage, safeRect, dpr)** → cropped image; **buildCaptureContext(window, element)** for DOM path, subtree/nearby/visible text.

So: **screenshot** = background’s `captureVisibleTab` → content; **crop** = in content via canvas (RegionCaptureOverlay / cropAroundElement logic).

### 5.3 How metadata is collected

- **buildCaptureContext(window, element)** (lib/captureContext.ts) produces:
  - **url**, **scrollX/Y**, **viewportWidth/Height**, **devicePixelRatio**, **capturedAt**
  - **domPath** — CSS-like path (getDomPath); skips Echly elements
  - **subtreeText** — text in element subtree (capped)
  - **nearbyText** — text from parent/siblings
  - **visibleText** — viewport text (excluding Echly)
- **OCR:** In content, **getVisibleTextFromScreenshot(imageDataUrl)** (ocr.ts) runs Tesseract.js on the (optionally cropped) image; result is merged into context as **visibleText** (or equivalent) for the structure-feedback payload.
- **Session mode:** The clicked element is stored (e.g. **lastSessionClickedElementRef**) and passed into **buildCaptureContext**; crop is around **detectVisualContainer(element)**.

### 5.4 How the screenshot is attached to feedback

- Content generates **screenshotId** (and feedback id) in content script.
- **Upload:** Content calls **uploadScreenshot(screenshot, sessionId, screenshotId)** (contentScreenshot.ts) → sends **ECHLY_UPLOAD_SCREENSHOT** to background → background POSTs to **/api/upload-screenshot** (Bearer token, JSON body with screenshotId, imageDataUrl, sessionId) → backend returns **url** → background responds to content with **url**.
- **Feedback creation:** Content creates the feedback ticket first (via **apiFetch** to **/api/structure-feedback** and **/api/feedback**, or via **ECHLY_PROCESS_FEEDBACK**). The first ticket gets **screenshotId** (and optionally screenshotUrl when available). After **uploadPromise** resolves, content **PATCH**es **/api/tickets/:id** with **screenshotUrl** so the ticket is linked to the stored image.

End-to-end: **click/region → full-tab capture (CAPTURE_TAB) → crop + context in content → optional OCR → upload (ECHLY_UPLOAD_SCREENSHOT) in parallel with structure/feedback → create ticket → attach screenshot URL to ticket via PATCH.**

---

## 6. Communication With Echly Web App (Backend)

### APIs the extension calls

All backend calls from the extension go to **API_BASE** (`http://localhost:3000` in code; production would use another base). Token is **Bearer &lt;firebase-id-token&gt;** from the background (getValidToken / refresh when needed).

| Endpoint | Method | Caller | Purpose |
|----------|--------|--------|---------|
| **/api/sessions** | GET | Background, Content (apiFetch) | List sessions (e.g. for active session dropdown, “previous sessions”). |
| **/api/sessions** | POST | Content (apiFetch) | Create session. |
| **/api/sessions/:id** | GET | Content | Get session (e.g. URL for “open in tab”). |
| **/api/sessions/:id** | PATCH | Content | Update session title. |
| **/api/feedback** | GET | Background | List feedback for a session (when setting active session or restoring state). |
| **/api/feedback** | POST | Background (ECHLY_PROCESS_FEEDBACK), Content (apiFetch) | Create feedback ticket (title, description, actionSteps, screenshotUrl/screenshotId, context, metadata). |
| **/api/structure-feedback** | POST | Background (fallback), Content (apiFetch) | Structure transcript + context into tickets (AI); returns tickets, clarityScore, etc. |
| **/api/upload-screenshot** | POST | Background (ECHLY_UPLOAD_SCREENSHOT) | Upload image data URL; returns URL. |
| **/api/tickets/:id** | PATCH | Content (apiFetch) | Attach screenshotUrl to ticket after upload. |
| **/api/tickets/:id** | DELETE | Content (apiFetch) | Delete ticket. |

**External (non-Echly):**

- **identitytoolkit.googleapis.com** — Exchange Google ID token for Firebase tokens (background).
- **securetoken.googleapis.com** — Refresh Firebase ID token (background).

### Full flow: Browser page → extension → Echly backend

1. User captures feedback (voice/region/session) on a page.
2. Content script has transcript + (optional) screenshot + context. It gets a token either implicitly via **apiFetch** (which sends **echly-api** to background; background calls getValidToken()) or explicitly for upload (**ECHLY_UPLOAD_SCREENSHOT**).
3. **apiFetch** path: Content sends **echly-api** with url, method, headers, body → Background adds **Authorization: Bearer &lt;token&gt;** and **fetch(url, …)** → Response body/status/headers returned to content. So structure-feedback and feedback POSTs from content go: Content → Background → Echly backend.
4. **ECHLY_UPLOAD_SCREENSHOT**: Content → Background with imageDataUrl, sessionId, screenshotId → Background POSTs to **/api/upload-screenshot** with Bearer token → Backend returns URL → Background responds to content.
5. **ECHLY_PROCESS_FEEDBACK**: Content → Background with transcript, context, optional screenshotUrl/screenshotId → Background calls **/api/structure-feedback** then **/api/feedback** (and may create multiple tickets) → Background broadcasts **ECHLY_FEEDBACK_CREATED** and responds to content.

So: **page stays in browser; extension (content + background) is the only client talking to the Echly backend.** The “web app” in the audit means the Echly backend API; the in-browser “web app” (e.g. dashboard) is a separate consumer of the same APIs.

---

## 7. Authentication Model

### How the extension obtains the auth token

- **Login:** User clicks “Continue with Google” in popup (or equivalent). Popup sends **ECHLY_START_LOGIN** (or **ECHLY_SIGN_IN** / **LOGIN**) to background. Background:
  1. Builds Google OAuth URL (response_type=id_token, scope openid email profile, redirect_uri = chrome.identity.getRedirectURL()).
  2. Calls **chrome.identity.launchWebAuthFlow({ url, interactive: true })**.
  3. Reads **id_token** from the redirect URL hash.
  4. Exchanges it with **identitytoolkit.googleapis.com/v1/accounts:signInWithIdp** (postBody with id_token, providerId google.com, returnSecureToken). Response contains **idToken**, **refreshToken**, **expiresIn**, **localId**, **displayName**, **email**, **photoUrl**.
  5. Stores in memory and **chrome.storage.local** (auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user). No Firebase Auth SDK in the background; token exchange is HTTP only.

- **Refresh:** When a token is needed, background uses **getValidToken()**: if current idToken exists and now &lt; expiresAtMs - 30s, return it; else use **refreshToken** with **securetoken.googleapis.com/v1/token** (grant_type=refresh_token) and update stored tokens and expiresAtMs.

### How the token is attached to API requests

- **Background:** All background-originated fetch calls (sessions, feedback, upload-screenshot, structure-feedback) use **getValidToken()** and set **Authorization: Bearer &lt;token&gt;**.
- **Content:** Content does not hold tokens. It uses **contentAuthFetch** (apiFetch), which sends an **echly-api** message; the background adds the Bearer token and performs the fetch.

### How authentication persists

- **chrome.storage.local**: auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user. Survives extension reload and browser restart.
- On service worker startup, background reads these keys and restores **tokenState** so subsequent getValidToken() and message handlers use the same identity.

---

## 8. Performance & Stability Review (Risks Only)

- **No MutationObserver/ResizeObserver in extension or CaptureWidget** — Not a risk; no heavy DOM observation from the extension itself.
- **Single global mousemove listener (elementHighlighter)** — Runs on every mousemove when session mode is active; could be costly on very busy pages. Listener is removed on detach.
- **Single global click listener (clickCapture, capture phase)** — One document-level listener when session capture is active; cleanup on detach.
- **Screenshot size** — Full-tab PNG data URLs can be large; they are sent via sendMessage and in POST bodies. Large viewports or high DPR increase memory and network.
- **OCR in content script** — Tesseract.js runs in the content script; loading and running it can be heavy on low-end devices. Implementation is fail-silent and does not block the main pipeline indefinitely.
- **Broadcast to all tabs** — On every global state change, background calls **chrome.tabs.query({})** and **sendMessage** to every tab. Tabs without content script or with errors are ignored (catch), but the loop runs for all tabs.
- **Session idle timer** — One setTimeout(30 min); cleared and reset on activity. No accumulation.
- **Multiple listeners in content** — Content registers: ECHLY_TOGGLE_WIDGET, ECHLY_RESET_WIDGET, ECHLY_GLOBAL_STATE (custom events), visibilitychange, and chrome.runtime.onMessage. All have cleanup in useEffect/return or are long-lived by design. **ECHLY_GLOBAL_STATE** is applied on every broadcast; no debounce (by design for consistency).
- **Potential duplicate work** — When structure-feedback returns tickets, content can create feedback via apiFetch and also notify background (ECHLY_FEEDBACK_CREATED); when structure fails, content falls back to ECHLY_PROCESS_FEEDBACK (background does structure + create). No obvious leak, but two code paths for “create ticket” could be a source of duplicate tickets if not carefully coordinated.
- **Marker layer and scroll/resize** — feedbackMarkers sets up one scroll (capture) and one resize listener; they call updateMarkerPositions for all markers. Teardown when markers are removed. Reasonable as long as marker count is low.

---

## 9. Security Review

- **Permissions scope:** **&lt;all_urls&gt;** and **tabs** allow the extension to run on and access any tab. This is required for “capture feedback on any site” but is broad; host_permissions also include specific backend and Firebase hosts.
- **Content script domain access:** Content runs in an isolated world on every page; it can read and manipulate the page DOM and has access to the extension’s origin (e.g. chrome.runtime.getURL). It does not inject scripts into the page’s world; no eval or script injection into page context observed.
- **Token handling:** Tokens live in background memory and **chrome.storage.local** (extension-local, not accessible to the page). Content never receives the raw token for API calls; it proxies through background. Token is sent only in request headers to the Echly backend and to Google/Firebase.
- **Cross-origin messaging:** The extension does not use postMessage to page scripts; only chrome.runtime messaging and window custom events inside the content script. So no cross-origin messaging to arbitrary page origins.
- **Injection risks:** Popup and content load extension resources (HTML, JS, CSS). Content injects a shadow root and its own DOM; no innerHTML from page content used for UI. Capture context (domPath, text) is derived from the page DOM for API payloads; if the backend or AI pipeline does not sanitize, that could be a downstream concern, but the extension itself does not inject page content into scripts.
- **Firebase config in repo:** `lib/firebase/config.ts` (and manifest oauth2 client_id) contain public config (apiKey, client_id). These are intended to be public for client-side use; backend must enforce auth via validated Firebase ID tokens.

---

## 10. Extension Lifecycle

High-level step-by-step:

1. **User installs extension**  
   Chrome loads the extension; service worker (`background.js`) starts. Background reads auth and session state from **chrome.storage.local**, initializes **globalUIState**, and registers **chrome.runtime.onMessage** and **chrome.tabs.onActivated** / **chrome.tabs.onCreated** listeners. No UI on the page yet.

2. **User opens a website**  
   For the tab’s URL (any URL), Chrome injects **content.js** at **document_idle**. Content runs **main()**: creates **#echly-shadow-host** (fixed, bottom-right, initially hidden), attaches shadow root, injects styles and **#echly-root**, mounts React (**ContentApp**). It registers **chrome.runtime.onMessage**, requests **ECHLY_GET_GLOBAL_STATE** from background, and applies state (visibility, session, pointers). Tray stays hidden until visibility is toggled on.

3. **Capture widget appears**  
   User clicks extension icon → popup opens. If not logged in, user signs in (background OAuth + token exchange). Popup sends **ECHLY_TOGGLE_VISIBILITY** and closes. Background sets **globalUIState.visible = true** and broadcasts **ECHLY_GLOBAL_STATE** to all tabs. Content script receives it, sets host visible and updates React state → CaptureWidget tray appears. User can expand/collapse via messages that update **globalUIState.expanded** and broadcast.

4. **User captures feedback**  
   User starts a new session (or resumes one) → **ECHLY_SET_ACTIVE_SESSION** / **ECHLY_SESSION_MODE_START**. For voice/region: user selects region or starts voice → **CAPTURE_TAB** → background captures tab → content crops and builds context, runs OCR if needed, then **apiFetch** to structure-feedback and feedback (or **ECHLY_UPLOAD_SCREENSHOT** + PATCH ticket). For session click mode: highlighter and click capture are active → user clicks element → same capture + crop + context → user speaks → submit → same API flow. **ECHLY_FEEDBACK_CREATED** (and **ECHLY_TICKET_UPDATED** / **ECHLY_SESSION_UPDATED**) keep background and tabs in sync.

5. **Data is sent to Echly**  
   All persistence goes through the Echly backend: sessions (GET/POST/PATCH), feedback (GET/POST), structure-feedback (POST), upload-screenshot (POST), tickets (PATCH/DELETE). Background holds the Bearer token and either performs fetch (background-initiated) or proxies content’s **echly-api** requests. Content never sends tokens to the page; the page does not talk to the backend directly from the extension’s perspective.

**Lifecycle diagram (text):**

```
Install → Background starts → Load storage (auth, session)
                                    ↓
Open any page → Content injects (idle) → Create shadow host → Mount React → Request ECHLY_GET_GLOBAL_STATE
                                    ↓
User clicks icon → Popup → ECHLY_GET_AUTH_STATE → [If not auth] ECHLY_START_LOGIN → OAuth → Token stored
                                    ↓
Popup → ECHLY_TOGGLE_VISIBILITY → Background broadcasts ECHLY_GLOBAL_STATE → Content shows tray
                                    ↓
User captures (voice/region/session) → CAPTURE_TAB → crop + context (+ OCR) → apiFetch / ECHLY_UPLOAD_SCREENSHOT / ECHLY_PROCESS_FEEDBACK
                                    ↓
Background or Content (via background) → fetch(Echly API) with Bearer token → Backend stores feedback/session/screenshot
                                    ↓
Background broadcasts ECHLY_FEEDBACK_CREATED / ECHLY_GLOBAL_STATE → Content updates pointers and UI
```

---

## 11. Summary for New Engineers

- **One background service worker** holds auth (Google → Firebase token exchange/refresh), session state, and global UI state; it proxies all Echly API calls and does tab capture.
- **One content script** on all URLs: single shadow host, React app, CaptureWidget. Visibility and session state come only from background via messages.
- **Popup** is for login and toggling widget visibility; no other UI.
- **Messaging:** Request/response only (sendMessage/onMessage). No long-lived ports. Background broadcasts state to all tabs on changes and on tab activation.
- **Capture:** Background captures tab; content crops and builds context (DOM path, text, OCR). Upload and feedback creation go through background (or content via echly-api). Screenshot is attached to ticket by PATCH after upload.
- **Auth:** Tokens live in background and storage; content never sees them; every API call is authenticated by the background.
- **Risks:** Broad permissions, mousemove/click on all pages when session mode is on, large screenshots and OCR in content script, broadcast to all tabs. Security: tokens and API only in extension/backend; no injection of page scripts by the extension.

---

**Report generated as read-only audit. No code was modified.**  
**Location of this report:** `docs/ECHLY_EXTENSION_ARCHITECTURE_AUDIT.md`
