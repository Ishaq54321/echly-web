# Echly — Complete Technical Context for Chrome Extension Capture System

**Purpose:** Extract complete technical context so an external architect can design the Chrome extension architecture correctly.  
**Date:** 2025-03-01.

---

---------------------------------------------------------
## 1️⃣ AUTHENTICATION SYSTEM
---------------------------------------------------------

**What authentication system is being used?**
- **Firebase Authentication** (Google Sign-In only). No NextAuth, no custom JWT, no cookie-based session server.
- Initialization: `lib/firebase.ts` — `getAuth(app)` from `firebase/auth`.
- Login: `app/login/page.tsx` — `signInWithPopup(auth, new GoogleAuthProvider())`. No `saveUserToFirestore` call in the login page (that function exists in `lib/firestore.ts` and is used to ensure a user doc in Firestore; it is not invoked in the current login flow in the repo).

**How are sessions stored?**
- Firebase Auth keeps the session in the browser (internal state + optional persistence). No server-side session store. No session cookies for the Next.js app. Route protection is done client-side via `onAuthStateChanged(auth, ...)`; unauthenticated users are redirected to `/login` (e.g. in `useWorkspaceOverview`, session page).

**Are tokens accessible client-side?**
- Yes. Firebase Auth ID tokens and refresh tokens are managed by the Firebase JS SDK client-side. The app does not expose a custom API that returns tokens; the extension would use the same Firebase SDK (e.g. in an offscreen or popup context) and call `auth.currentUser.getIdToken()` to get an ID token for the current user.

**Is there an API token system?**
- No. There is no custom API key or Bearer token system for the Next.js API routes. The Next.js API routes do **not** validate Firebase ID tokens or any other auth.

**How does the frontend authenticate API requests?**
- It does **not**. All requests to `/api/*` are unauthenticated:
  - `GET /api/feedback`, `GET/PATCH /api/tickets/:id`, `PATCH/DELETE /api/sessions/:id`, `POST /api/structure-feedback` are called with `fetch(...)` and no `Authorization` header or cookie. The web app relies on **same-origin** usage (user is already on the app and has passed client-side auth checks) and does not implement server-side API auth.

**Are there protected API routes?**
- No. None of the API route handlers in `app/api/` check authentication or authorization. Any client that can reach the API base URL can call these endpoints with only the required parameters (e.g. `sessionId`, `id`).

**How would an external client (like a Chrome extension) authenticate?**
- **Current state:** The extension could call the same API routes without any token; the only “protection” is that the API is intended to be used from the same origin. There is no built-in path for “external client with token.”
- **To support the extension properly:** You would need to:
  1. Add auth to API routes (e.g. verify Firebase ID token in a middleware or in each route).
  2. Have the extension obtain an ID token via Firebase Auth (e.g. using Firebase JS in the extension) and send it as `Authorization: Bearer <idToken>` (or equivalent).
  3. Ensure CORS allows the extension’s origin (or use a different strategy; see Section 8 and 10).

---

---------------------------------------------------------
## 2️⃣ FEEDBACK DATA MODEL
---------------------------------------------------------

**Full schema for Feedback entity**

Defined in **`lib/domain/feedback.ts`** (TypeScript interfaces). Persistence is **Firebase Firestore**; there is no Prisma or other ORM.

**Domain type `Feedback` (output from repo / API):**

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Firestore document ID |
| `sessionId` | string | Parent session |
| `userId` | string | Creator's Firebase UID |
| `title` | string | |
| `description` | string | |
| `suggestion` | string | Optional, default "" in mapping |
| `type` | string | e.g. "Feedback", or first suggestedTag |
| `isResolved` | boolean | Derived from `status === "resolved"` in repo |
| `priority` | FeedbackPriority | "low" \| "medium" \| "high" \| "critical", default "medium" |
| `createdAt` | Timestamp \| null | Firestore serverTimestamp at creation |
| `contextSummary` | string \| null | |
| `actionItems` | string[] \| null | |
| `impact` | string \| null | |
| `suggestedTags` | string[] \| null | |
| `url` | string \| null | Page URL at capture time |
| `viewportWidth` | number \| null | |
| `viewportHeight` | number \| null | |
| `userAgent` | string \| null | |
| `clientTimestamp` | number \| null | Client-side timestamp (ms) |
| `screenshotUrl` | string \| null | Firebase Storage download URL |

**Firestore document shape (written by `feedbackPayload` in `lib/repositories/feedbackRepository.ts`):**

- Collection: `feedback`.
- Stored fields: `sessionId`, `userId`, `title`, `description`, `suggestion` (default ""), `type`, `status` ("open" | "resolved" — not `isResolved`), `priority`, `createdAt` (serverTimestamp), `contextSummary`, `actionItems`, `impact`, `suggestedTags`, `url`, `viewportWidth`, `viewportHeight`, `userAgent`, `clientTimestamp`, `screenshotUrl`.

**Screenshot/image fields:**
- `screenshotUrl`: single optional string (Firebase Storage download URL). No separate “images” array. One screenshot per feedback item in the model; the first ticket in a structured batch gets the screenshot, others get `null`.

**Relationships:**
- **Session:** Feedback belongs to one session via `sessionId`. Session is in collection `sessions`; no formal FK in code, enforced by usage and (if any) Firestore rules.
- **Workspace:** There is no separate “Workspace” entity in the schema. “Workspace” in the UI is the set of sessions for the current user (`userId` on Session).

**Where defined:**
- Types: `lib/domain/feedback.ts`.
- Firestore writes/reads: `lib/repositories/feedbackRepository.ts` (addFeedbackRepo, updateFeedbackRepo, getSessionFeedbackPageRepo, getFeedbackByIdRepo, etc.).
- API serialization: `app/api/feedback/route.ts` (GET), `app/api/tickets/[id]/route.ts` (GET/PATCH) — they serialize `Feedback` for JSON (e.g. Timestamp → seconds or ISO string).

---

---------------------------------------------------------
## 3️⃣ SESSION / WORKSPACE MODEL
---------------------------------------------------------

**Full schema**

Defined in **`lib/domain/session.ts`**. Persistence: Firestore collection `sessions`.

**Session:**

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Firestore document ID |
| `userId` | string | Owner's Firebase UID |
| `title` | string | Default "Untitled Session" at creation |
| `archived` | boolean | Optional; archived sessions filtered out in getUserSessionsRepo |
| `createdAt` | Timestamp \| null | |
| `updatedAt` | Timestamp \| null | |
| `createdBy` | SessionCreatedBy \| null | { id, firstName, lastName, avatarUrl? } set at creation |
| `viewCount` | number | Loom-style unique view count (one per viewer per session) |
| `commentCount` | number | Total comments across feedback in this session |

**Relationship to Feedback:**
- One session has many feedback documents (`feedback.sessionId === session.id`). Feedback is in collection `feedback`; no subcollection. Session deletion cascades to feedback (and comments, view records) in repo code — `deleteSessionRepo` in `lib/repositories/sessionsRepository.ts`.

**Permissions / ownership:**
- No explicit “role” or “permission” fields. Ownership is by `userId`: only the session owner is allowed to see the session in the app (session page checks `data.userId !== currentUser.uid` and redirects). Session list is filtered by `userId` in `getUserSessionsRepo`. There is no sharing or collaborator model in the schema; “Share” in the UI only copies the session URL to clipboard.

**Other related collections:**
- `sessionViews/{sessionId}/views/{viewerId}` — one doc per viewer per session for view counting.
- `users` — optional user profile (ensureUserRepo in `lib/repositories/usersRepository.ts`); not required for core feedback/session flows.

---

---------------------------------------------------------
## 4️⃣ FILE / IMAGE STORAGE
---------------------------------------------------------

**Where are screenshots stored?**
- **Firebase Storage** (same Firebase project as Firestore: `lib/firebase.ts` — `getStorage(app)`). Bucket: `echly-b74cc.firebasestorage.app` (from config).

**How are files uploaded?**
- **Client-side only.** No Next.js API route for uploads. The web app uses `lib/screenshot.ts`: `uploadScreenshot(imageDataUrl, sessionId, feedbackId)` which uses Firebase Storage SDK `uploadString(..., "data_url", { contentType: "image/png" })` and then `getDownloadURL`. The image is a data URL (e.g. from `lib/capture.ts` which produces `image/webp`; the path uses `.png` — see below).

**Which API endpoint handles uploads?**
- None. Uploads go directly from the browser to Firebase Storage. The extension would need to do the same (Firebase Storage from the extension with valid auth) or you would add a new API route that accepts multipart/base64 and writes to Storage (and then returns the URL).

**Path format:**
- `sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png`  
- In `lib/screenshot.ts` the ref is built with `ref(storage, path)` and `contentType: "image/png"` is set even though `lib/capture.ts` uses `canvas.toDataURL("image/webp", 0.9)`; the data_url is still accepted by Storage.

**Max file size limits:**
- Not defined in code. Firebase Storage has its own default limits (e.g. 32 MB per object for client SDK). No app-level check.

**Pre-signed upload logic:**
- No. The client uses the Firebase SDK with the logged-in user; security (if any) is via Firebase Storage security rules, not pre-signed URLs in the app code.

---

---------------------------------------------------------
## 5️⃣ API STRUCTURE
---------------------------------------------------------

All relevant API routes live under **`app/api/`**. No authentication or authorization is performed in any of them.

---

### **GET /api/feedback**

- **File:** `app/api/feedback/route.ts`
- **Purpose:** Paginated list of feedback for a session (cursor-based).
- **Request:** GET with query params:  
  - `sessionId` (required),  
  - `cursor` (optional, opaque string — last doc id for next page),  
  - `limit` (optional, 1–50, default 20).
- **Response:**  
  `{ feedback: Feedback[], nextCursor: string | null, hasMore: boolean, total?: number, activeCount?: number, resolvedCount?: number }`  
  `total`, `activeCount`, `resolvedCount` only on first page (when cursor empty).
- **Auth:** None.

---

### **GET /api/tickets/:id**

- **File:** `app/api/tickets/[id]/route.ts`
- **Purpose:** Single feedback (ticket) by id.
- **Request:** GET, path param `id` = feedback document id.
- **Response:** `{ success: boolean, ticket?: Feedback (serialized), error?: string }`. 404 if not found.
- **Auth:** None.

---

### **PATCH /api/tickets/:id**

- **File:** `app/api/tickets/[id]/route.ts`
- **Purpose:** Update feedback. Body can include: `title`, `description`, `actionItems`, `suggestedTags`, `isResolved`.
- **Request:** PATCH, JSON body: `{ title?, description?, actionItems?, suggestedTags?, isResolved? }`.
- **Response:** `{ success: boolean, ticket?: Feedback (serialized), error?: string }`.
- **Side effect:** `updateSessionUpdatedAtRepo(sessionId)` called after update.
- **Auth:** None.

---

### **POST /api/feedback (create feedback)**

- **Does not exist.** Feedback is created only via the Firebase client: `addFeedback()` in `lib/feedback.ts` → `addFeedbackRepo()` in `lib/repositories/feedbackRepository.ts` (Firestore `addDoc`/`setDoc`). The web app never POSTs to an API to create feedback.

---

### **PATCH /api/sessions/:id**

- **File:** `app/api/sessions/[id]/route.ts`
- **Purpose:** Update session title and/or archived.
- **Request:** PATCH, JSON body: `{ title?: string, archived?: boolean }`.
- **Response:** `{ success: boolean, session?: Session (serialized), error?: string }`.
- **Auth:** None.

---

### **DELETE /api/sessions/:id**

- **File:** `app/api/sessions/[id]/route.ts`
- **Purpose:** Permanently delete session and all its feedback, comments, and view records (server-side repo).
- **Response:** `{ success: true }` or error.
- **Auth:** None.

---

### **POST /api/structure-feedback**

- **File:** `app/api/structure-feedback/route.ts`
- **Purpose:** AI structuring of raw feedback text into tickets (titles, actionItems, suggestedTags, etc.). Uses OpenAI (env: `OPENAI_API_KEY`).
- **Request:** POST, JSON body: `{ transcript: string }`.
- **Response:** `{ success: boolean, tickets: Array<...>, error?: string }`. Tickets have title, contextSummary, actionItems, impact, suggestedPriority, suggestedTags.
- **Auth:** None.

---

### **Upload screenshot**

- No API route. Screenshots are uploaded from the client directly to Firebase Storage via `lib/screenshot.ts` (`uploadScreenshot`).

---

### **Get session list**

- No API route. Session list is read from Firestore on the client: `getUserSessions(uid, max)` → `getUserSessionsRepo` in `lib/repositories/sessionsRepository.ts`. The dashboard uses this inside `useWorkspaceOverview` after `onAuthStateChanged`.

---

**Summary table**

| Operation | Method + Path | Auth | Request shape | Response shape |
|-----------|----------------|------|----------------|----------------|
| List feedback (paginated) | GET /api/feedback | None | Query: sessionId, cursor?, limit? | feedback[], nextCursor, hasMore, total?, activeCount?, resolvedCount? |
| Get one feedback | GET /api/tickets/:id | None | Path: id | success, ticket |
| Update feedback | PATCH /api/tickets/:id | None | JSON: title?, description?, actionItems?, suggestedTags?, isResolved? | success, ticket |
| Create feedback | — | — | No API; client uses Firestore | — |
| Upload screenshot | — | — | No API; client uses Firebase Storage | — |
| List sessions | — | — | No API; client uses Firestore | — |
| Update session | PATCH /api/sessions/:id | None | JSON: title?, archived? | success, session |
| Delete session | DELETE /api/sessions/:id | None | — | success |
| Structure feedback (AI) | POST /api/structure-feedback | None | JSON: transcript | success, tickets, error? |

---

---------------------------------------------------------
## 6️⃣ STATE MANAGEMENT
---------------------------------------------------------

- **No global store:** No Redux, Zustand, or React Context for data. State is local to pages/hooks.
- **Feedback state:**
  - **Session page:** `useSessionFeedbackPaginated(sessionId)` keeps `feedback` in React state, loads first page via `GET /api/feedback`, then “load more” via same API with `cursor`. Refetch of first page via `refetchFirstPage()`. No Firestore realtime listener for the list.
  - **Detail panel:** Selected feedback detail comes from `GET /api/tickets/:id` and is stored in `detailTicket`; it is the source of truth for the selected item (not derived from the list state).
  - **Capture flow:** `useFeedback` (dashboard session page) and the session page’s `handleTranscript` both create feedback via `addFeedback(...)` (Firestore) and then update local state: `setFeedback(prev => [...created, ...prev])` and optionally `refetchFeedbackFirstPage()`.
- **Optimistic UI:** Partial. For example, after PATCH ticket, the response is used to update `detailTicket` and `feedback` in state. After creating feedback, new items are prepended without waiting for a full refetch. No formal “optimistic then rollback” pattern.
- **Refetch after mutation:** Yes for list: after resolving or after creating feedback, `refetchFeedbackFirstPage()` is sometimes called to sync totals/counts. Detail is updated from PATCH response rather than refetch.
- **Sessions:** Loaded once in `useWorkspaceOverview` (getUserSessions + getSessionFeedbackCounts); `refreshSessions` and local updates (updateSession, removeSession) manage state. No API for sessions.

---

---------------------------------------------------------
## 7️⃣ CAPTURE LOGIC (CURRENT IMPLEMENTATION)
---------------------------------------------------------

**Where is screenshot logic implemented?**
- **`lib/capture.ts`** — single exported function `captureScreenshot(): Promise<string | null>`.
- **`lib/screenshot.ts`** — `generateFeedbackId()`, `uploadScreenshot(imageDataUrl, sessionId, feedbackId): Promise<string>` (download URL).

**Does it use html2canvas or native browser APIs?**
- **Native browser APIs only.** Implementation uses:
  - `navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })` (screen/tab/window picker),
  - a `<video>` element to play the stream,
  - a `<canvas>` to draw the video frame and then `canvas.toDataURL("image/webp", 0.9)`.
- **html2canvas** is in `package.json` but **is not imported or used** anywhere in the codebase. So current capture is **not** DOM-based; it is **display media** (user-selected screen/tab/window).

**Is cropping implemented?**
- No. The full selected source is drawn to the canvas at `video.videoWidth` / `video.videoHeight` with no crop or selection UI.

**Is capture tightly coupled to React components?**
- **Partly.** `captureScreenshot` itself is a pure async function with no React or DOM dependency (except `navigator` and `document.createElement`). It is invoked from:
  - **`components/CaptureWidget/hooks/useCaptureWidget.ts`:** `handleAddFeedback` dynamically imports `@/lib/capture` and calls `captureScreenshot()`, then pushes the result into a recording and starts voice. So the **trigger** is React (CaptureWidget), but the **capture function** is reusable.
- The rest of the flow (upload, structuring, creating feedback) is in the session page and useFeedback: they depend on `sessionId`, `session.userId`, and the Firestore/Storage SDK. So the **pipeline** (capture → upload → structure → addFeedback) is tied to the web app’s session and auth context.

**What functions are reusable?**
- **Reusable as-is (no React):**
  - `lib/capture.ts` — `captureScreenshot()` (in extension you’d still use getDisplayMedia; Chrome extension may use different APIs for visible tab capture, e.g. `chrome.tabs.captureVisibleTab`).
  - `lib/screenshot.ts` — `generateFeedbackId()`, `uploadScreenshot(...)` (if the extension has Firebase Auth and Storage initialized with same config).
- **Reusable only with same backend/context:**
  - `addFeedback` in `lib/feedback.ts` (Firestore + updateSessionUpdatedAt) — extension could call it if it runs in a context where Firebase is initialized and user is logged in.
- **Not reusable without change:**
  - `useCaptureWidget` and `CaptureWidget` — React and app-specific (session, onComplete, onDelete). The extension would implement its own UI and flow but can reuse the same capture/upload/addFeedback concepts.

---

---------------------------------------------------------
## 8️⃣ ENVIRONMENT CONFIGURATION
---------------------------------------------------------

**Base API URL**
- The app uses relative URLs for API calls: `fetch("/api/feedback?...")`, `fetch("/api/tickets/${id}")`, etc. So the base URL is the same origin as the deployed app (e.g. `https://<vercel-project>.vercel.app` or custom domain). There is no `NEXT_PUBLIC_API_URL` or similar in the repo.

**Environment variables relevant to API**
- **Server-side only:** `OPENAI_API_KEY` — used in `app/api/structure-feedback/route.ts` for OpenAI. No env vars in code for Firebase (config is hardcoded in `lib/firebase.ts`).
- **Firebase config** in `lib/firebase.ts` is in source (not env): apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId.

**CORS**
- No custom CORS headers or config in the codebase. Next.js default behavior: same-origin only for API routes unless middleware or route handlers add CORS. So **cross-origin requests (e.g. from a Chrome extension’s service worker or offscreen document with a different origin) will be subject to browser CORS;** if the extension calls the app’s API from a non-same-origin context, the server may not send CORS headers and the extension could be blocked.

**Middleware that could block extension requests**
- **No `middleware.ts`** in the project root. So no Next.js middleware runs. The only thing that could “block” the extension is CORS (browser enforcing response headers) or missing auth if you later add auth and the extension doesn’t send a token.

---

---------------------------------------------------------
## 9️⃣ DEPLOYMENT ENVIRONMENT
---------------------------------------------------------

- **Hosting:** Not committed (no `vercel.json`). Stack (Next.js 16, Node) is typical for **Vercel**; not confirmed in repo.
- **Database:** **Firebase Firestore** and **Firebase Storage** (and Firebase Auth). No separate SQL/Postgres; no Prisma.
- **Rate limiting:** None in app code. Vercel and Firebase have their own limits (e.g. Firestore read/write, Storage, serverless invocations).
- **Request restrictions:** None in code. If the app is behind a firewall or WAF, that would be external.

---

---------------------------------------------------------
## 🔟 SECURITY CONSIDERATIONS
---------------------------------------------------------

- **CSRF:** No CSRF tokens or double-submit cookies. The app relies on same-origin requests and no cookie-based auth for API; Firebase Auth uses its own mechanisms. If you add cookies or session cookies for the API, you’d need to consider CSRF for the extension.
- **SameSite cookies:** Not used for API auth (no API cookies). Firebase Auth SDK may use cookies for persistence; that’s SDK default, not customized in the repo.
- **Are API routes restricted by origin?** No. Any origin can call the API; there is no `Access-Control-Allow-Origin` or origin check in the routes.
- **Would a Chrome extension be blocked by CORS?**  
  - **From a content script:** Requests to the app’s origin from a content script are same-origin if the script is injected on the same domain; if the script runs on a different site and calls the app’s API, the request is cross-origin and CORS applies — the server doesn’t send CORS headers today, so the browser may block.  
  - **From the extension’s own origin (e.g. chrome-extension://id):** Requests to the Next.js origin are cross-origin; without `Access-Control-Allow-Origin` including the extension origin, the browser will block. So **yes, the extension can be blocked by CORS** unless you add CORS for the extension origin or use a different approach (e.g. native messaging, or the extension opening the app in a tab and communicating via postMessage).

---

---------------------------------------------------------
## Chrome Extension Feasibility Notes
---------------------------------------------------------

### What changes are required

1. **Authentication for API**
   - Add verification of Firebase ID token (or equivalent) for at least: GET/PATCH feedback/tickets, PATCH/DELETE sessions, POST structure-feedback. Without this, anyone who knows a `sessionId` or ticket `id` can read/update/delete.
   - Extension: obtain ID token (e.g. `auth.currentUser.getIdToken()`) and send `Authorization: Bearer <token>` (or a custom header your API accepts). Optionally short-lived API keys for the extension, but then you need a key issuance flow tied to the user.

2. **CORS**
   - If the extension calls the Next.js API from its own origin, add CORS headers (e.g. in middleware or in each route) allowing the extension origin (`chrome-extension://<id>`) or a fixed set of origins. Alternatively, use a content script on the app’s origin to proxy requests (same-origin to app, then no CORS), or an offscreen page on the app’s origin if the extension can load the app in an iframe (with same-origin and postMessage).

3. **Create feedback from the extension**
   - Today feedback is created only via Firestore from the web client. Options:
     - **A)** Extension uses Firebase SDK (Firestore + Storage) with the same config and same user auth; then it can call `addFeedbackRepo`-equivalent and `uploadScreenshot` directly (no new API). You must ensure Firebase Security Rules allow the extension’s context (e.g. same project, same auth).
     - **B)** Add a **POST /api/feedback** (and optionally **POST /api/upload-screenshot** or return a signed URL) that accepts a Bearer token, validates it, and creates the feedback (and uploads to Storage server-side or returns a signed URL). The extension then uses only HTTPS + token, which is often easier for extensions than bundling the full Firebase SDK.

4. **Session list for extension**
   - There is no GET /api/sessions. The extension either:
     - Uses Firestore from the extension (same as web) with Firebase Auth, or
     - You add **GET /api/sessions** that returns the current user’s sessions (with auth required).

5. **Capture in the extension**
   - **Tab capture:** Use `chrome.tabs.captureVisibleTab()` for the current tab; no getDisplayMedia needed. You get a data URL or blob that you can upload the same way (Firebase Storage or new API).
   - **Full screen/window:** In extension context, getDisplayMedia may be limited; Chrome provides capture APIs for extensions. So the **logic** (capture → upload → create feedback) can be reused, but the **capture API** may differ (e.g. `chrome.tabs.captureVisibleTab` + optional cropping UI in the extension).

6. **Base URL**
   - Introduce something like `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_API_URL` so the extension knows where to send API requests in all environments (dev/staging/prod).

### What risks exist

- **No API auth today:** Anyone with a session/ticket id can read/update/delete. This is a direct risk for multi-tenant or shared links; fixing it is required before treating the extension as a first-class client.
- **Firebase config in source:** If the repo is public or shared, consider moving Firebase config to env and restricting Firestore/Storage rules so only your app and extension (with valid auth) can access data.
- **CORS:** Extension requests from `chrome-extension://` will fail until CORS or an alternative (e.g. in-app proxy) is in place.
- **Token lifetime:** ID tokens expire; the extension must refresh (Firebase SDK handles this if you use it) or you must implement refresh and retry in the extension.

### What must be modified

- **Backend:** Add auth to API routes (token verification); add CORS for the extension origin; optionally add POST /api/feedback and GET /api/sessions (and possibly upload endpoint or signed URL) so the extension doesn’t have to use Firestore/Storage directly.
- **Extension:** Implement auth (Firebase in extension or token exchange), use the new/updated API with Bearer token, and use Chrome capture APIs for screenshots (and optional crop). If you keep using Firestore/Storage from the extension, ensure Security Rules and CORS (for Storage) allow the extension context.

### What can be reused

- **Data models:** `Feedback`, `Session`, `StructuredFeedback` (and related types) — same schema and semantics.
- **Capture concept:** Same pipeline: capture image → optional AI structure → upload image → create feedback with metadata. Only the capture source (getDisplayMedia vs captureVisibleTab) and possibly upload endpoint differ.
- **AI structuring:** POST /api/structure-feedback can be called from the extension once auth and CORS are in place; request/response shape stays the same.
- **IDs and paths:** `generateFeedbackId()`, Storage path `sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png` can stay; extension can use the same IDs and paths if it talks to the same Firestore/Storage.

### What must be decoupled

- **Capture from React:** Already mostly decoupled (`captureScreenshot` is in `lib/capture.ts`). The extension will have its own UI and flow; it should not depend on CaptureWidget or useCaptureWidget. Reuse only the capture/upload/feedback **logic** (and possibly shared types/constants in a shared package or copy).
- **Session/feedback creation from “current page” context:** On the web, capture happens on the app’s session page with known `sessionId` and `userId`. In the extension, the user may capture from any tab; you must decide how to associate feedback with a session (e.g. “current session” selector, default session, or “new session” from extension). That product/UX decision drives whether the extension needs GET /api/sessions and how it gets `sessionId`/`userId`.
- **Firebase SDK vs REST API:** For a clean extension story, prefer “extension talks to your API with a token” over “extension uses Firebase SDK directly,” unless you want to ship and maintain the full Firebase SDK in the extension and align Security Rules for both web and extension. Decoupling here means defining a small, stable API surface (create feedback, upload screenshot, list sessions, list feedback) that the extension uses via fetch + Bearer token.

---

*End of technical context document.*
