# Echly Phase 5 Session Engine Audit Report

**Date:** 2025-03-16  
**Scope:** Session Engine (session lifecycle, feedback items, pointer capture, screenshot capture, session resume, feedback timeline)  
**Goal:** Determine which Phase 5 features are implemented vs. missing. No code was modified.

---

## 1. Backend Session System

### 1.1 Session API (`/api/sessions`)

| Question | Finding |
|----------|---------|
| **Does POST /api/sessions create a session?** | **Yes.** `app/api/sessions/route.ts` POST handler calls `createSessionRepo(workspaceId, user.uid, null)` and returns `{ success: true, session: { id } }`. |
| **What fields exist in the session model?** | Session domain (`lib/domain/session.ts`): `id`, `workspaceId`, `userId`, `title`, `archived`, `createdAt`, `updatedAt`, `createdBy`, `viewCount`, `commentCount`, `aiInsightSummary`, `aiInsightSummaryFeedbackCount`, `aiInsightSummaryUpdatedAt`, `openCount`, `resolvedCount`, `skippedCount`, `feedbackCount`. |
| **Does it support pause/resume?** | **Backend:** No. There is no `paused` or `resumedAt` field. Pause/resume is **extension-only** (e.g. `sessionPaused` in `globalUIState`, persisted in `chrome.storage.local`). Backend PATCH supports `title` and `archived` only. |
| **Does it store userId and projectId?** | **userId:** Yes — stored and used for auth (e.g. `session.userId !== user.uid`). **projectId:** No — the model uses `workspaceId` (and legacy `userId`) for scope, not `projectId`. |

### 1.2 Session by ID (`/api/sessions/[id]`)

- **GET:** Returns session metadata (e.g. for Discussion context and extension “open in tab” URL).
- **PATCH:** Updates `title` and/or `archived`.
- **DELETE:** Permanently deletes session and associated feedback/comments.

**Classification: Session lifecycle (backend)** → **COMPLETE** for create/list/get/update/delete and workspace/user scoping. Pause/resume is intentionally client-only.

---

## 2. Feedback Storage System

### 2.1 Feedback API (`/api/feedback`)

| Question | Finding |
|----------|---------|
| **How are feedback items stored?** | Via `addFeedbackWithSessionCountersRepo()` (Firestore `feedback` collection). Payload includes: `title`, `description`, `suggestion`, `type`, `contextSummary`, `actionSteps`, `suggestedTags`, `url`, `viewportWidth`, `viewportHeight`, `userAgent`, `clientTimestamp`, `screenshotUrl`, clarity fields. |
| **Linked to sessionId?** | **Yes.** Every feedback document has `sessionId`; GET supports `?sessionId=ID` for paginated list; POST requires `sessionId` in body. |
| **Pointer coordinates?** | **No.** The feedback payload and `Feedback` / `StructuredFeedback` interfaces (`lib/domain/feedback.ts`) do **not** include `x`, `y`, `selector`, or `FeedbackAnchor`. `FeedbackAnchor` exists in the domain (selector, x, y) but is **not** persisted in the feedback document or returned by the API. |
| **Comments/text stored?** | **Yes.** `title`, `description`, `suggestion`, `actionSteps`, `contextSummary` are stored. Comments are in a separate comments system (referenced in session/feedback flows). |

### 2.2 Extension usage of feedback

- Background loads pointers for the tray via `GET /api/feedback?sessionId=...&limit=200` and maps to `{ id, title, actionSteps }` only — no coordinates or anchor.
- Content and background create feedback via POST with sessionId, title, description, actionSteps, screenshotUrl/screenshotId, metadata — no pointer/anchor fields sent.

**Classification: Feedback storage** → **COMPLETE** for session-scoped feedback and text/comment-related fields. **PARTIALLY IMPLEMENTED** for “pointer” use case: list and metadata exist; **pointer/anchor persistence and API are MISSING**.

---

## 3. Pointer System

### 3.1 Where pointers are used

- **Extension tray:** “Pointers” = list of feedback items (`id`, `title`, `actionSteps`) from `globalUIState.pointers` (synced from GET /api/feedback). No coordinates.
- **On-page markers:** `components/CaptureWidget/session/feedbackMarkers.ts` — markers are created **in-session** with `FeedbackMarkerData` (`id`, `x`, `y`, `element?`, `title?`). Coordinates come from `getBoundingClientRect()` at capture time.

### 3.2 How pointer coordinates are captured

- When the user clicks an element in session mode, the extension creates a marker with `createMarker(..., data)` where `data.x`/`data.y` are viewport coordinates (or derived from `data.element`). Stored **only in memory** in the `markers` array; **not** sent to the backend or persisted in feedback docs.

### 3.3 Session resume and pointers

- On **ECHLY_SET_ACTIVE_SESSION** (new or previous session), background fetches `GET /api/feedback?sessionId=...&limit=200` and sets `globalUIState.pointers` to `{ id, title, actionSteps }` per item. No x/y/selector.
- **ResumeSessionModal** uses `fetchSessions()` → `apiFetch("/api/sessions")`; on select it sends `ECHLY_SET_ACTIVE_SESSION` + `ECHLY_SESSION_MODE_START`. Feedback list is loaded, but **no markers are placed on the page** because the API does not return (and the backend does not store) pointer coordinates.

### 3.4 scrollToFeedback

- `lib/scrollToFeedback.ts` implements scroll-to-anchor using `FeedbackAnchor` (selector and/or x, y). **Not used** in the extension or in `app/(app)/dashboard` (grep: no references). Dashboard does not “jump to” feedback by anchor.

**Classification: Pointer capture** → **PARTIALLY IMPLEMENTED.** Capture and in-session markers work; **storage of coordinates/anchor and restoration on resume are MISSING**. No backend field or API for pointer/anchor.

---

## 4. Screenshot System

### 4.1 ECHLY_UPLOAD_SCREENSHOT and `/api/upload-screenshot`

| Question | Finding |
|----------|---------|
| **How are screenshots captured?** | Content captures via `CAPTURE_TAB` (background `chrome.tabs.captureVisibleTab`), then crop/context in content; upload via **ECHLY_UPLOAD_SCREENSHOT** to background, which POSTs to `/api/upload-screenshot`. |
| **Where are they stored?** | Backend: Firebase Storage path `sessions/{sessionId}/screenshots/{screenshotId}.png`. Screenshot record created/updated via `createScreenshotRepoSync` / `getScreenshotByIdRepo` (TEMP until attached). |
| **Linked to feedback items?** | **Yes.** POST /api/feedback accepts `screenshotId`; backend calls `updateScreenshotAttachedRepo(screenshotId, docRef.id)`. Content can PATCH `/api/tickets/:id` with `screenshotUrl` after upload. First ticket in a batch can carry `screenshotUrl` / `screenshotId`. |

### 4.2 Flow summary

- Upload: Content → ECHLY_UPLOAD_SCREENSHOT → background → POST /api/upload-screenshot (Bearer) → returns `{ url }`.
- Feedback: Ticket created with `screenshotId`/`screenshotUrl`; screenshot record marked ATTACHED. TEMP screenshots not attached are cleaned by a scheduled job.

**Classification: Screenshot capture** → **COMPLETE.** Capture, upload, storage path, and linking to feedback (screenshotId/screenshotUrl, ATTACHED) are implemented.

---

## 5. Extension Session State System

### 5.1 Variables in `background.ts`

| Variable | When set | Persisted |
|----------|----------|-----------|
| **activeSessionId** | Set on ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_END, endSessionFromIdle; cleared when session ends or set to null. | Yes — `chrome.storage.local` (`activeSessionId`, `sessionModeActive`, `sessionPaused`). |
| **sessionModeActive** | true on ECHLY_SET_ACTIVE_SESSION (when sessionId set), ECHLY_SESSION_MODE_START/PAUSE/RESUME; false on ECHLY_SESSION_MODE_END and endSessionFromIdle. | Yes. |
| **sessionPaused** | true on ECHLY_SESSION_MODE_PAUSE; false on ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_START, ECHLY_SESSION_MODE_RESUME; false on end. | Yes. |
| **sessionLoading** | true when ECHLY_SET_ACTIVE_SESSION receives a non-null sessionId; set false after async fetch of feedback + sessions completes (or on error). Not persisted. | No (in-memory only). |

### 5.2 Persistence and restore

- **Persist:** `persistSessionLifecycleState()` writes `activeSessionId`, `sessionModeActive`, `sessionPaused` to `chrome.storage.local`. Called on SESSION_MODE_START/PAUSE/RESUME and endSessionFromIdle.
- **Restore:** On worker load, IIFE runs `initializeSessionState()`: reads `activeSessionId`, `sessionModeActive`, `sessionPaused` from storage; repopulates `globalUIState` and `activeSessionId`. If `sessionModeActive && activeSessionId`, it fetches `GET /api/feedback?sessionId=...&limit=200` and sets `globalUIState.pointers`, then broadcasts. So **session state and feedback list are restored across worker restart**; pointer coordinates are still not stored/restored.

### 5.3 Cross-tab behavior

- One active session per extension instance. `ECHLY_GLOBAL_STATE` and `ECHLY_SESSION_STATE_SYNC` broadcast state to tabs; on tab activation, background sends ECHLY_GLOBAL_STATE and ECHLY_SESSION_STATE_SYNC so **sessions effectively persist across tabs** (same sessionId and pointers list).

**Classification: Session state in extension** → **COMPLETE.** Lifecycle flags, persistence, restore on worker restart, and cross-tab sync are implemented.

---

## 6. Session Resume (Extension UI)

### 6.1 “Previous Sessions” flow

- **ResumeSessionModal** is opened from the widget (e.g. “Previous Sessions”).
- **fetchSessions:** `apiFetch("/api/sessions")` (content’s apiFetch → token via background). Returns list of sessions (id, title, updatedAt, openCount, resolvedCount, feedbackCount).
- **hasPreviousSessions:** Set when widget opens by calling the same sessions API (e.g. `apiFetch("/api/sessions?limit=1")`) so the “Previous Sessions” entry point is shown only when sessions exist.
- **onPreviousSessionSelect(sessionId):** Sends `ECHLY_SET_ACTIVE_SESSION` with sessionId, then `ECHLY_SESSION_MODE_START`. Optionally fetches `GET /api/sessions/${sessionId}` for `session.url` and opens that tab via ECHLY_OPEN_TAB. **Feedback items:** Loaded by background in ECHLY_SET_ACTIVE_SESSION handler (GET /api/feedback?sessionId=...&limit=200 → `globalUIState.pointers`).

### 6.2 What is loaded on resume

- Session list: from GET /api/sessions.
- Session metadata (e.g. title, url): from GET /api/sessions and GET /api/sessions/:id.
- Feedback list for tray: yes — loaded into `globalUIState.pointers` and broadcast.
- On-page markers: **no** — pointers have no x/y/selector, so markers are not recreated on the page after resume.

**Classification: Session resume** → **PARTIALLY IMPLEMENTED.** Session list, selection, and feedback list for tray are complete. **Missing:** restoring markers on the page (requires persisted pointer/anchor and API support).

---

## 7. Session Timeline / UI Capabilities

### 7.1 Extension widget (tray)

- **Listing feedback items:** Yes — `state.pointers` drives the tray list (title, actionSteps, open/resolved counts, expand/collapse).
- **Jumping to feedback pointers:** Only for **markers created in the current session on this page** — clicking a marker focuses that ticket. When resuming, there are no markers, so no “jump to pointer” on page.
- **Screenshot thumbnails:** Tray list does **not** show screenshot thumbnails; it shows title and action steps only.

### 7.2 Dashboard session page (`app/(app)/dashboard/[sessionId]`)

- **Listing feedback items:** Yes — `useSessionFeedbackPaginated` and ticket list / execution view.
- **Jumping to feedback pointers:** **No** — `scrollToFeedback` / `FeedbackAnchor` are not used in the dashboard. No “scroll to location” or “go to pointer” for a ticket.
- **Screenshot display:** Yes — `screenshotUrl` on tickets; `isImageExpanded` and `selectedItem.screenshotUrl` used to show full image. No dedicated “thumbnails in timeline” list view; screenshots are shown in ticket detail.

**Classification: Feedback timeline** → **PARTIALLY IMPLEMENTED.** Listing feedback and viewing screenshot on detail exist. **Missing:** jump-to-pointer in extension (after resume) and in dashboard; thumbnail strip/timeline for screenshots in both extension and dashboard.

---

## 8. Architecture Completeness Summary

| Feature | Status | Notes |
|--------|--------|--------|
| **Session lifecycle** | **COMPLETE** | Backend: create, list, get, PATCH (title/archived), delete. Extension: start, pause, resume, end; state persisted and restored on worker restart. |
| **Feedback storage** | **COMPLETE** | Session-scoped feedback; title, description, actionSteps, screenshotUrl, metadata, clarity. No pointer/anchor fields. |
| **Pointer capture** | **PARTIALLY IMPLEMENTED** | In-session capture and markers (x, y) work; **not persisted**, not returned by API, not restored on resume. |
| **Screenshot capture** | **COMPLETE** | Capture, ECHLY_UPLOAD_SCREENSHOT, POST /api/upload-screenshot, storage, link to feedback (screenshotId/screenshotUrl, ATTACHED). |
| **Session resume** | **PARTIALLY IMPLEMENTED** | Previous sessions list, select session, load feedback list for tray, optional open session URL. **Missing:** on-page markers (no stored coordinates). |
| **Feedback timeline** | **PARTIALLY IMPLEMENTED** | List feedback in tray and dashboard; view screenshot in dashboard detail. **Missing:** jump-to-pointer (extension + dashboard); screenshot thumbnails in timeline/tray. |

---

## 9. Missing Phase 5 Components (Recommendations)

1. **Pointer/anchor persistence**
   - Add optional fields to feedback (e.g. `anchor: { selector?: string; x?: number; y?: number }` or equivalent) in domain, repository, and POST/GET /api/feedback.
   - When creating feedback from session click, send anchor (selector and/or x, y) and store it.

2. **Pointer restoration on resume**
   - Extension: When loading feedback for ECHLY_SET_ACTIVE_SESSION or initializeSessionState, if API returns anchor/pointer data, create markers (or at least enable “scroll to” from tray) so resume shows markers or allows jump-to-location.

3. **Jump to feedback location**
   - Extension tray: For each pointer with anchor, support “go to” that scrolls/highlights on page (e.g. using `scrollToFeedback(anchor)` or equivalent), including after resume.
   - Dashboard: Use `scrollToFeedback(anchor)` (or equivalent) when user selects a ticket that has anchor data, so the session view can scroll to the location (if the page context supports it).

4. **Screenshot thumbnails in timeline**
   - Optional: Show small screenshot thumbnails in the extension tray list and/or dashboard timeline for tickets that have `screenshotUrl`, for quicker visual scanning.

5. **Backend “pause” (optional)**
   - If product requires server-side pause (e.g. analytics or cross-device resume), add a `paused` or `resumedAt`-style field to the session model and PATCH; currently pause/resume is extension-only.

---

## 10. Messaging Reference (Verified)

| Message | Direction | Purpose |
|---------|-----------|---------|
| ECHLY_SET_ACTIVE_SESSION | Content → Background | Set active session; background fetches feedback + sessions and sets pointers. |
| ECHLY_PROCESS_FEEDBACK | Content → Background | Structure + create feedback via /api/structure-feedback and POST /api/feedback; append to pointers and broadcast. |
| ECHLY_UPLOAD_SCREENSHOT | Content → Background | Upload image to POST /api/upload-screenshot; respond with url. |
| ECHLY_GLOBAL_STATE | Background → All tabs | Broadcast global UI state (visible, sessionId, pointers, sessionPaused, etc.). |
| ECHLY_SESSION_STATE_SYNC | Background → Tab | Trigger content to request ECHLY_GET_GLOBAL_STATE and re-apply state (e.g. on tab activation). |

All of the above are present and used as described in the codebase.

---

*End of audit report.*
