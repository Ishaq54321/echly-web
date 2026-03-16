# Echly Full Platform Architecture Report

**Goal:** Produce a full technical report explaining how the entire system works so that the capture system can be safely refactored into a shared engine used by both the Chrome extension and the web dashboard. Analysis and documentation only—no code was modified.

**Audit date:** 2025-03-17

---

## SECTION 1 — Repository Structure

### Project layout

```
echly/
├── app/                    # Next.js App Router (dashboard, auth, admin, API)
├── components/             # React UI (CaptureWidget, dashboard, billing, layout)
├── lib/                    # Shared logic (billing, repos, server, domain, hooks)
├── echly-extension/        # Chrome extension (content, background, popup assets)
├── public/                 # Static assets (fonts, logos)
├── docs/                   # Architecture and audit docs
├── firestore.indexes.json
├── firebase.json
├── package.json
├── tailwind.config.ts
└── esbuild-extension.mjs   # Extension build (content/background bundle)
```

### Major folders

| Folder | Responsibility |
|--------|----------------|
| **app/** | Next.js routes: `(app)/` dashboard/folders/settings/insights, `(auth)/` login, `admin/` plans/customers/usage, `api/` all REST endpoints. Layouts and page components. |
| **app/api/** | API route handlers: sessions, feedback, billing, extension/session, admin, auth, upload-screenshot, structure-feedback, etc. |
| **app/(app)/** | Authenticated app: dashboard (session list, folders), session detail pages, folders, settings, insights. Uses Firebase auth and authFetch. |
| **app/(auth)/** | Login and auth layout. |
| **app/admin/** | Admin dashboard: plans CRUD, workspaces/customers, usage, migrate entitlements. requireAdmin. |
| **components/** | Reusable UI: `CaptureWidget/` (full capture flow), `billing/`, `dashboard/`, `layout/`, `discussion/`, etc. |
| **components/CaptureWidget/** | Capture widget: main component, footer, resume modal, hooks (useCaptureWidget), types, feedback list, session controls, capture layer, microphone/OCR-related UI. |
| **lib/** | Core logic: `billing/` (plans, entitlements, limits), `repositories/` (sessions, feedback, workspaces, users, comments, screenshots), `server/` (auth, extensionAuth, session, CORS, resolveWorkspaceForUser), `domain/`, `hooks/`, `utils/`, `admin/`, `graph/` (instructionGraphEngine), `ai/`. |
| **lib/repositories/** | Firestore access: sessionsRepository, feedbackRepository, workspacesRepository, usersRepository, commentsRepository, screenshotsRepository. |
| **lib/billing/** | Plan catalog, workspace entitlements, plan limit check, usage, plan state for UI. |
| **lib/server/** | Auth (requireAuth, verifyExtensionToken), session cookie, extension token, CORS, resolveWorkspaceForUser. |
| **lib/hooks/** | useBillingUsage, usePlanCatalog, etc. |
| **echly-extension/** | Chrome MV3 extension: `src/` (content.tsx, background.ts, api.ts, auth.ts, sessionRelay.ts, contentAuthFetch.ts, contentScreenshot.ts, ocr.ts), `utils/apiFetch.ts`, `manifest.json`, `sessionRelay.js`, assets, fonts, popup.css. |

### Key files (reference)

- **API routes:** `app/api/sessions/route.ts`, `app/api/extension/session/route.ts`, `app/api/billing/usage/route.ts`, `app/api/feedback/route.ts`, `app/api/structure-feedback/route.ts`, `app/api/admin/plans/route.ts`, `app/api/admin/workspaces/actions/route.ts`.
- **Repositories:** `lib/repositories/sessionsRepository.ts`, `lib/repositories/feedbackRepository.ts`, `lib/repositories/workspacesRepository.ts`.
- **Billing:** `lib/billing/plans.ts`, `lib/billing/getPlanCatalog.ts`, `lib/billing/getWorkspaceEntitlements.ts`, `lib/billing/checkPlanLimit.ts`, `lib/billing/getWorkspaceUsage.ts`.
- **Auth:** `lib/server/auth.ts` (requireAuth), `lib/server/extensionAuth.ts` (verifyExtensionToken), `lib/server/session.ts` (getSessionUser).
- **Extension:** `echly-extension/src/content.tsx`, `echly-extension/src/background.ts`, `echly-extension/src/api.ts`, `echly-extension/utils/apiFetch.ts`.

---

## SECTION 2 — Extension Architecture

### Overview

The extension uses a **Loom-style** flow: user clicks the extension icon → tray opens in the active tab. Auth is via dashboard session; the content script never holds credentials. All API calls from content go through the background script, which attaches a short-lived extension token.

### Content script (`echly-extension/src/content.tsx`)

- **Role:** Ultra-thin UI layer. Injected when needed; single mount per page.
- **Injection:** Not in manifest `content_scripts`. Background injects via `chrome.scripting.executeScript` when opening the widget or on tab activation/update when `echlyActive` is true.
- **Mount:** One shadow host `#echly-shadow-host` (fixed bottom-right). Inside shadow DOM: `#echly-root` with React root. `ContentApp` wraps `CaptureWidget`. Styles: `popup.css` + minimal reset in shadow root.
- **Visibility:** Controlled by background. Content receives `ECHLY_GLOBAL_STATE`; `visible`/`sessionModeActive`/`sessionPaused` determine tray visibility. Content does not own visibility state.
- **Auth:** When widget opens, content asks background `ECHLY_GET_AUTH_STATE`. If not authenticated, content can send `ECHLY_TRIGGER_LOGIN`; background opens auth broker tab. Content never holds tokens; all fetches go through background via `echly-api` message (which uses `api.ts` → background → Bearer token).

### Background service worker (`echly-extension/src/background.ts`)

- **Role:** Single source of truth for auth, extension token, global UI state, session lifecycle, and all Echly API calls from the extension.
- **Token:** In-memory only (`extensionToken`, `extensionTokenExpiresAt`). Obtained via auth broker: open `/extension-auth` tab → page posts token via postMessage → sessionRelay content script forwards `ECHLY_EXTENSION_TOKEN` to background. TTL 14 min (backend issues 15 min).
- **Storage:** `chrome.storage.local`: `echlyActive`, `activeSessionId`, `sessionModeActive`, `sessionPaused`. No token in storage.
- **Session lifecycle:** 30-minute idle timeout; on timeout or explicit end, background clears session, broadcasts `ECHLY_RESET_WIDGET` to all tabs.
- **API:** All content-originated API calls go through background: content sends `echly-api` (or specific types like `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`); background calls `getValidToken()` then `apiFetch()` from `echly-extension/utils/apiFetch.ts` (Bearer token, credentials: include).

### Popup

- **Manifest:** No popup HTML/JS in the current manifest; `action` has only `default_title` and `default_icon`. Extension icon click is handled in background via `chrome.action.onClicked`.
- **Flow:** Click → background toggles tray (open/close) or runs auth + open widget. No separate popup UI in the audited code.

### Injected UI

- **Where:** One `div#echly-shadow-host` appended to `document.body` (after body exists). Shadow root contains the React app; CaptureWidget is rendered inside `ContentApp`.
- **Styles:** `popup.css` and a small reset loaded in shadow root. Page-level style `echly-page-scroll-restore` ensures `html, body { overflow: auto !important }` so host page scroll is not locked.

### Message types (extension)

| Message | Direction | Purpose |
|---------|-----------|---------|
| **ECHLY_OPEN_PREVIOUS_SESSIONS** | BG → content (or content internal) | Open Previous Sessions modal |
| **ECHLY_SET_ACTIVE_SESSION** | Content → BG | Set active session ID; BG loads pointers and session title, persists, broadcasts |
| **ECHLY_SESSION_MODE_START** | Content → BG | Session mode started (after new or resumed session) |
| **ECHLY_SESSION_MODE_PAUSE / RESUME / END** | Content → BG | Pause/resume/end session mode |
| **ECHLY_SESSION_ACTIVITY** | Content → BG | Reset 30-min idle timer |
| **ECHLY_GET_AUTH_STATE** | Content/Popup → BG | Returns `{ authenticated, user }` (BG hydrates from token or dashboard session) |
| **ECHLY_TRIGGER_LOGIN** | Content → BG | Open auth broker (getExtensionToken) |
| **ECHLY_GET_GLOBAL_STATE** | Content → BG | Returns `{ state: globalUIState }` |
| **ECHLY_OPEN_WIDGET** | (from icon/popup) → BG | Verify session, set tray open, inject content, send ECHLY_OPEN_WIDGET to tab |
| **ECHLY_CLOSE_WIDGET** | BG → content | Hide tray; BG clears echlyActive |
| **ECHLY_GLOBAL_STATE** | BG → tabs | Broadcast visible/expanded/sessionId/pointers/captureMode/etc. |
| **ECHLY_EXPAND_WIDGET / ECHLY_COLLAPSE_WIDGET** | Content → BG | Update expanded, broadcast |
| **ECHLY_START_SESSION** | → BG | BG forwards to active tab as ECHLY_START_SESSION → content runs createSession flow |
| **ECHLY_FEEDBACK_CREATED / ECHLY_TICKET_UPDATED / ECHLY_SESSION_UPDATED** | Content → BG | Sync pointers/session title; BG broadcasts |
| **ECHLY_GET_TOKEN / ECHLY_GET_EXTENSION_TOKEN** | Content → BG | Return valid Bearer token or error |
| **ECHLY_VERIFY_DASHBOARD_SESSION** | Content → BG | POST /api/extension/session (credentials: include); return valid |
| **ECHLY_PROCESS_FEEDBACK** | Content → BG | BG calls structure-feedback + feedback APIs, then broadcasts ECHLY_FEEDBACK_CREATED |
| **ECHLY_UPLOAD_SCREENSHOT** | Content → BG | BG POST /api/upload-screenshot with token |
| **echly-api** | Content → BG | Generic API proxy: BG adds Bearer, fetches, returns response |
| **ECHLY_EXTENSION_TOKEN** | Session relay (extension-auth page) → BG | Token + user from dashboard; BG stores, closes auth tab, opens widget |
| **ECHLY_OPEN_TAB / ECHLY_OPEN_DASHBOARD / ECHLY_OPEN_BILLING** | Content → BG | Open URL in new tab |
| **ECHLY_RESET_WIDGET** | BG → tabs | On session end or idle; content resets/collapses |
| **ECHLY_SESSION_STATE_SYNC** | BG → content (tab activation) | Content then requests ECHLY_GET_GLOBAL_STATE to resync |
| **START_RECORDING / STOP_RECORDING** | Content → BG | Set globalUIState.isRecording, broadcast |
| **CAPTURE_TAB** | Content → BG | BG captures tab screenshot (chrome.tabs.captureVisibleTab) |

### Full message flow examples

**Widget open (icon click):**

1. User clicks extension icon → `chrome.action.onClicked` in background.
2. Background: if tray open → close (set echlyActive false, send ECHLY_CLOSE_WIDGET to tab). Else verify dashboard session (POST /api/extension/session with credentials).
3. If session invalid → clear token, optionally focus existing auth tab or open auth broker.
4. If valid → set trayOpen true, globalUIState.visible/expanded true, broadcast. ensureContentScriptInjected(activeTabId), then send ECHLY_OPEN_WIDGET to tab.
5. Content: on ECHLY_OPEN_WIDGET → setHostVisibility(true), dispatch ECHLY_OPEN_WIDGET custom event. ContentApp already has state from ECHLY_GET_GLOBAL_STATE; tray shows.

**Start Session (extension):**

1. User clicks "Start Session" in widget → ensureAuthenticated() (ECHLY_GET_AUTH_STATE); if not auth, ECHLY_TRIGGER_LOGIN.
2. Widget triggers createSession() (content): apiFetch("/api/sessions", POST). Request goes to background via echly-api → background getValidToken() + fetch with Bearer.
3. API returns 200 + { session: { id } } or 403 PLAN_LIMIT_REACHED.
4. Content: on success → onActiveSessionChange(sessionId) → ECHLY_SET_ACTIVE_SESSION to background. Content also sends ECHLY_SESSION_MODE_START, onExpandRequest().
5. Background: ECHLY_SET_ACTIVE_SESSION → set activeSessionId, load feedback + session title via API, update globalUIState.pointers/sessionTitle, persist to chrome.storage, broadcast ECHLY_GLOBAL_STATE.
6. Content: receives ECHLY_GLOBAL_STATE → setGlobalState (merge pointers); React re-renders with session and ticket list.

### How CaptureWidget is mounted (extension)

1. Background opens widget → ensureContentScriptInjected(tabId) runs `content.js` in tab if not already loaded (checks `window.__ECHLY_WIDGET_LOADED__`).
2. Content script `main()`: if `__ECHLY_WIDGET_LOADED__` true, return. Else set flag, create `#echly-shadow-host`, append to body (after body exists via waitForBody), then mountReactApp(host).
3. mountReactApp: attach shadow root, inject styles, create `#echly-root`, createRoot(container), reactRoot.render(<ContentApp widgetRoot={container} initialTheme={…} />).
4. ContentApp holds all extension-specific state (user, globalState from BG, sessionLimitReached, clarity assistant, feedback jobs). It renders <CaptureWidget ... /> with props from that state and handlers that call chrome.runtime.sendMessage.

### React root injection

- **Element:** `#echly-shadow-host` (in page document) → shadow root → `#echly-root` (React root).
- **Single mount:** Guarded by `window.__ECHLY_WIDGET_LOADED__`; one host per page.

### Auth in the extension

- **Dashboard session first:** Background verifies session with POST `/api/extension/session` (credentials: include). If 401, not authenticated.
- **Extension token:** Obtained only when needed. getExtensionToken(): if valid token in memory and not expired, return it. Else open `/extension-auth` tab; that page (dashboard) checks session cookie and POSTs to `/api/extension/session` to get extensionToken, then postMessage to window; sessionRelay.js (content script on extension-auth) sends ECHLY_EXTENSION_TOKEN to background.
- **Content script:** Never has token. All API calls: content → chrome.runtime.sendMessage("echly-api", …) or specific types → background runs apiFetch with Bearer token.

### Extension token lifecycle

1. **Obtain:** User has valid dashboard session → open extension-auth → page gets extensionToken from POST /api/extension/session (cookie) → postMessage → sessionRelay → ECHLY_EXTENSION_TOKEN → background stores in memory, sets expiry (now + 14 min).
2. **Use:** Content requests go to background; background getValidToken() returns token or throws NOT_AUTHENTICATED. apiFetch (in background) sends Authorization: Bearer &lt;token&gt;.
3. **Invalidate:** On 401 from API, background utils/apiFetch sets extensionToken = null and sends ECHLY_AUTH_INVALID. Token not persisted; broker tab can be reopened to get a new one.

### `/api/extension/session`

- **File:** `app/api/extension/session/route.ts`
- **Method:** POST. No body. Session from cookie (getSessionUser(request)).
- **Response:** 200 + { extensionToken, user: { uid, email } }. Token is JWT (HS256, 15m expiry), payload { uid, email, type: "extension" }. Secret from EXTENSION_TOKEN_SECRET.
- **Auth:** Session cookie only (dashboard login). Used by extension auth broker page and by background to verify session (credentials: include).

---

## SECTION 3 — Capture Widget System

### Components

| Component | Role |
|-----------|------|
| **CaptureWidget** (`CaptureWidget.tsx`) | Main container. Uses useCaptureWidget; renders header, feedback list, footer, CaptureLayer, ResumeSessionModal, MicrophonePanel, SessionLimitUpgradeView. Handles expanded/collapsed, session mode, home vs session view. |
| **WidgetFooter** | Idle-state actions: extension mode → "Start Session" + "Previous Sessions"; non-extension → "Capture feedback". |
| **ResumeSessionModal** | Lists sessions from fetchSessions(); filter by time; onSelectSession(sessionId). Extension: checkAuth before fetch; onOpenLogin. |
| **SessionLimitUpgradeView** | Shown when sessionLimitReached is set (POST /api/sessions returned 403 PLAN_LIMIT_REACHED). |
| **CaptureHeader, FeedbackItem, CaptureLayer, MicrophonePanel** | Header, single feedback card, capture overlay layer, mic selector/recording UI. |

### State management

- **useCaptureWidget** (hooks/useCaptureWidget.ts): Holds capture state (idle, focus_mode, region_selecting, voice_listening, processing, etc.), pointers (feedback list), isOpen, sessionMode, highlightTicketId. Handlers: toggleOpen, startCapture, submit, delete, update, session mode start/pause/resume/end. For extension: onCreateSession, onActiveSessionChange, ensureAuthenticated, loadSessionWithPointers, etc.
- **Content (extension):** ContentApp state: user, globalState (from background), sessionLimitReached, feedbackJobs, extensionClarityPending, openResumeModalFromMessage, theme. globalState is applied from ECHLY_GLOBAL_STATE; pointers are merged with protection when session unchanged (e.g. pause → minimize → resume).

### Props flow (extension)

- **From ContentApp to CaptureWidget:** sessionId (effectiveSessionId), userId, extensionMode=true, captureMode, onComplete (handleComplete), onDelete, onUpdate, widgetToggleRef, onRecordingChange, expanded, onExpandRequest, onCollapseRequest, fetchSessions, hasPreviousSessions, onPreviousSessionSelect, pointers (globalState.pointers), sessionLoading, sessionTitleProp, onSessionTitleChange, isProcessingFeedback, feedbackJobs, onCreateSession, onActiveSessionChange, ensureAuthenticated, verifySessionBeforeSessions, onTriggerLogin, globalSessionModeActive, globalSessionPaused, onSessionModeStart/Pause/Resume/End/Activity, captureRootParent (widgetRoot), launcherLogoUrl, openResumeModal, onResumeModalClose, sessionLimitReached.

### How the widget opens

- **Extension:** Background sets visible/expanded and sends ECHLY_OPEN_WIDGET to tab. Content shows host and passes expanded to CaptureWidget. User can also collapse; ECHLY_COLLAPSE_WIDGET updates global state.
- **Dashboard:** Not used in the same way; dashboard uses session list and session detail pages. CaptureWidget in extension is the only “floating” widget usage in the audited code.

### How sessions are loaded

- **Extension:** On ECHLY_SET_ACTIVE_SESSION background fetches GET /api/feedback?sessionId=… and GET /api/sessions, sets globalUIState.pointers and sessionTitle, broadcasts. Content receives ECHLY_GLOBAL_STATE and sets globalState (pointers/sessionTitle). CaptureWidget receives pointers prop. For "Previous Sessions", content fetchSessions() = apiFetch("/api/sessions"), then ResumeSessionModal shows list; on select, onPreviousSessionSelect(sessionId) → ECHLY_SET_ACTIVE_SESSION + ECHLY_SESSION_MODE_START, optional ECHLY_OPEN_TAB(session.url).

### Feedback tray

- **Pointers:** List of StructuredFeedback (id, title, actionSteps, type). In extension, from globalState.pointers (synced from background). Shown in sidebar when session is active or paused.
- **Jobs:** feedbackJobs (processing/failed) shown as cards; completed jobs removed and ticket appears in pointers. handleComplete in content enqueues job, runs pipeline (structure-feedback → feedback POST, upload screenshot, PATCH ticket), then notifies background ECHLY_FEEDBACK_CREATED.

### Recorder state

- **Extension:** Recording state in background (globalUIState.isRecording). Content sends START_RECORDING / STOP_RECORDING; background broadcasts. Content also onRecordingChange callback to CaptureWidget. Voice capture runs in content (MicrophonePanel); screenshot via CAPTURE_TAB to background or content upload path.

### Trace: user click → session creation → capture start → session selection

1. User clicks "Start Session" → ensureAuthenticated → createSession() in content (POST /api/sessions via echly-api). 200 → { id }. Content: onActiveSessionChange(id), ECHLY_SESSION_MODE_START, onExpandRequest.
2. Background: ECHLY_SET_ACTIVE_SESSION (from onActiveSessionChange) → load pointers and title, broadcast. Content: state has sessionId and pointers; widget shows session view.
3. User clicks "Previous Sessions" → open ResumeSessionModal, fetchSessions() (GET /api/sessions). User selects session → onPreviousSessionSelect(sessionId) → ECHLY_SET_ACTIVE_SESSION(sessionId), ECHLY_SESSION_MODE_START; optional open tab to session URL. Background loads pointers for that session, broadcasts.
4. User captures feedback (voice/region) → handleComplete → structure-feedback, then POST /api/feedback (or ECHLY_PROCESS_FEEDBACK for fallback path), upload screenshot, PATCH ticket, notifyFeedbackCreated(ECHLY_FEEDBACK_CREATED) → background updates pointers and broadcasts.

---

## SECTION 4 — Session System

### Creation

- **API (enforced):** POST /api/sessions. requireAuth → resolveWorkspaceForUser → getWorkspaceSessionCountRepo(workspaceId) → checkPlanLimit(workspace, "maxSessions", count) → createSessionRepo(workspaceId, user.uid, null). Returns { success: true, session: { id } } or 403 with planLimitReachedBody.
- **Repository:** `createSessionRepo` in `lib/repositories/sessionsRepository.ts`. Transaction: add session doc (workspaceId, userId, title "Untitled Session", createdAt/updatedAt, createdBy, viewCount/commentCount/openCount/resolvedCount/feedbackCount 0) and increment workspace usage.sessionsCreated.

### Storage

- **Collection:** `sessions`. Fields: workspaceId, userId, title, createdAt, updatedAt, createdBy, viewCount, commentCount, openCount, resolvedCount, feedbackCount, archived (optional). Session doc ID is auto-generated.

### Active session count

- **getWorkspaceSessionCountRepo(workspaceId):** Counts sessions where workspaceId match, minus count where archived === true. So active count = total − archived. Used only in POST /api/sessions for checkPlanLimit.

### Archived sessions

- **Archiving:** updateSessionArchivedRepo(sessionId, true). List queries filter by archived (getWorkspaceSessionsRepo / getUserSessionsRepo with archivedOnly / includeArchived). Active count excludes archived; archiving does not delete.

### Session lifecycle

- **Create:** POST /api/sessions → createSessionRepo (one doc + usage increment).
- **Update:** updateSessionTitleRepo, updateSessionArchivedRepo, updateSessionUpdatedAtRepo, incrementSessionCommentCountRepo, updateSessionAiInsightSummaryRepo.
- **View tracking:** recordSessionViewIfNewRepo (sessionViews/{sessionId}/views/{viewerId}), increments session.viewCount once per viewer.
- **Delete:** deleteSessionRepo: delete feedback and comments for session, delete sessionViews subcollection, delete session doc.

### Session status fields

- **Open/resolved:** feedbackCount, openCount, resolvedCount on session doc; detailed counts from getSessionFeedbackCounts (feedback repository).
- **archived:** boolean; when true session excluded from “active” count and can be listed in “archived” views.

---

## SECTION 5 — Billing / Plan Limits

### Plan catalog

- **Code:** `lib/billing/plans.ts`: PlanId, PlanConfig (maxSessions, maxMembers, insightsAccess), PLANS, DEFAULT_PRICES, UPGRADE_PLAN.
- **Runtime:** `lib/billing/getPlanCatalog.ts`: buildDefaultCatalog() from PLANS + DEFAULT_PRICES, then getDocs(collection(db, "plans")) and merge Firestore fields into catalog. No in-code TTL cache in the current getPlanCatalog (each call reads Firestore; other docs may reference a 60s cache elsewhere). Returns PlanCatalog keyed by PlanId.

### Workspace entitlements

- **getWorkspaceEntitlements(workspace):** Plan = workspace.billing?.plan ?? "free". Catalog = getPlanCatalog(). Entry = catalog[plan] ?? catalog.free. fromCatalog = { maxSessions, maxMembers, insightsAccess }. overrides = workspace.entitlements. Per field: overrides?.maxSessions !== undefined ? overrides.maxSessions : fromCatalog.maxSessions (same for maxMembers, insightsAccess). So entitlements are override-only.

### Limit overrides

- **Admin:** POST /api/admin/workspaces/actions with override_session_limit or grant_unlimited_sessions updates workspace.entitlements.maxSessions (number or null). getWorkspaceEntitlements uses these when defined.

### Plan resolution logic

- **checkPlanLimit(workspace, metric, currentUsage):** getWorkspaceEntitlements(workspace) → limit = entitlements[metric]. If limit == null return. If currentUsage < limit return. Else throw PlanLimitError (PLAN_LIMIT_REACHED, upgradePlan).
- **getWorkspacePlanState:** getWorkspace, getPlanCatalog, getWorkspaceEntitlements, getWorkspaceUsage → planId, limits, usage, permissions (e.g. canCreateSession).

### Trace: admin plan edit → Firestore → getPlanCatalog → getWorkspaceEntitlements → checkPlanLimit → session creation

1. Admin edits plan → PATCH /api/admin/plans → setDoc(plans, id, payload). (If invalidatePlanCatalogCache exists elsewhere it is called.)
2. getPlanCatalog() reads Firestore `plans` and merges with code defaults.
3. getWorkspaceEntitlements(workspace) uses catalog[workspace.billing.plan] and workspace.entitlements overrides.
4. POST /api/sessions: getWorkspaceSessionCountRepo → currentUsage; checkPlanLimit(workspace, "maxSessions", currentUsage) uses getWorkspaceEntitlements; if over limit throws; else createSessionRepo.

### Fields controlling limits

- **Plan (catalog):** maxSessions, maxMembers, insightsEnabled (from Firestore `plans` or code PLANS).
- **Workspace:** billing.plan (plan id), entitlements.maxSessions, entitlements.maxMembers, entitlements.insightsAccess (overrides). usage.sessionsCreated, usage.members for current usage.

---

## SECTION 6 — Dashboard Architecture

### Routing (app/(app))

- **dashboard/page.tsx:** Main sessions list; useWorkspaceOverview; folders; SessionsHeader (New Session, New Folder); handleCreateSession from useWorkspaceOverview.
- **dashboard/[sessionId]/:** Session detail (SessionPageClient).
- **folders/[folderId]/page.tsx:** Folder view; handleCreateSession uses authFetch POST /api/sessions then adds session to folder and navigates to /dashboard/{sessionId}.
- **settings/, insights/:** Settings and insights pages.

### Session creation button

- **SessionsHeader:** "New Session" calls onNewSession → in dashboard page, handleCreateSession from useWorkspaceOverview.
- **useWorkspaceOverview.handleCreateSession:** authFetch("/api/sessions", { method: "POST" }). On 403 PLAN_LIMIT_REACHED (or WORKSPACE_SUSPENDED) calls onPlanLimitReached with message/upgradePlan; dashboard shows UpgradeModal. On success, refreshSessions and optionally router.push(/dashboard/{sessionId}) (not in the default handleCreateSession; caller can navigate).
- **CommandCenterHeader / layout:** "New Session" can link or call similar create flow.

### Workspace overview

- **useWorkspaceOverview:** Auth via onAuthStateChanged; loadSessionsAndCounts(uid) → getWorkspaceSessions or getUserSessions, getSessionFeedbackCounts per session. sessionsWithCounts, handleCreateSession, updateSession, removeSession. View mode "all" | "archived".

### Billing usage meter

- **useBillingUsage:** Fetches GET /api/billing/usage (authFetch), refetches when workspace listener fires. Data: plan, limits, usage (activeSessions, members, etc.).
- **UsageMeter:** Displays usage vs limits (e.g. sessions, members). UpgradeModal when limit reached.

### Trace: click "New Session" → API → session creation → navigation

1. User clicks "New Session" (e.g. SessionsHeader) → onNewSession() → handleCreateSession(onPlanLimitReached).
2. handleCreateSession: authFetch("/api/sessions", { method: "POST" }). 403 → onPlanLimitReached (UpgradeModal). 200 → data.session.id; refreshSessions(); caller may navigate (e.g. folders page does router.push(`/dashboard/${sessionId}`)).
3. POST /api/sessions (see Section 4) enforces limit and createSessionRepo.

### Dashboard vs extension capture flow

- **Dashboard:** No floating CaptureWidget on pages. User creates session from dashboard UI (POST /api/sessions), then opens session detail page. Feedback is submitted from session/discussion UI and APIs, not from the same in-page capture widget as the extension.
- **Extension:** CaptureWidget is in content script; session created via same POST /api/sessions from content (via background). Capture (voice/region), structure-feedback, feedback POST, upload screenshot happen in extension context; state and pointers synced via background and ECHLY_GLOBAL_STATE.

---

## SECTION 7 — Firestore Schema

| Collection | Purpose | Key fields | Read/Write |
|------------|---------|------------|------------|
| **plans** | Plan catalog (admin-editable) | id (free/starter/business/enterprise), name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled | Admin GET/PATCH plans; getPlanCatalog |
| **workspaces** | Workspace and billing | name, logoUrl, ownerId, members, billing.{ plan, billingCycle, seats, stripeCustomerId, stripeSubscriptionId, suspended }, entitlements.{ maxSessions, maxMembers, insightsAccess }, usage.{ sessionsCreated, feedbackCreated, members }, appearance, notifications, automations, permissions, ai, integrations, createdAt, updatedAt | workspacesRepository; admin workspaces/actions; getWorkspaceUsage |
| **sessions** | Session records | workspaceId, userId, title, createdAt, updatedAt, createdBy, viewCount, commentCount, openCount, resolvedCount, feedbackCount, archived?, aiInsightSummary? | sessionsRepository (create, get, update, delete, count) |
| **users** | User profiles | email, name, workspaceId, … | usersRepository; admin; auth |
| **feedback** | Tickets/feedback items | sessionId, title, description, status, … | feedbackRepository |
| **comments** | Comments on feedback | feedbackId, sessionId, … | commentsRepository |
| **folders** | Folder metadata | name, sessionIds[] | Dashboard dashboard/page, folders/[folderId] (client + Firestore) |
| **screenshots** | Screenshot metadata | (screenshotId, etc.) | screenshotsRepository |
| **sessionViews** | Subcollection sessions/{id}/views | sessionViews/{sessionId}/views/{viewerId}, viewedAt | sessionsRepository (recordSessionViewIfNewRepo) |
| **adminLogs** | Admin audit trail | adminId, action, workspaceId?, metadata?, timestamp | adminLogs.ts from admin API routes |
| **instructionGraphs** | Per-session instruction graph | instructionGraphs/{sessionId}/nodes/{nodeKey}; entity, intent, mentionCount, actions, tickets, averageConfidence | lib/graph/instructionGraphEngine.ts (after ticket persistence) |

Relationships: workspaces.ownerId → users; sessions.workspaceId → workspaces, sessions.userId → users; feedback.sessionId → sessions; comments reference feedback/session; folders.sessionIds reference session IDs.

---

## SECTION 8 — API Surface

| Endpoint | Auth | Authorization | Side effects | DB |
|----------|------|----------------|--------------|-----|
| GET/POST /api/sessions | requireAuth (Bearer or cookie) | resolveWorkspaceForUser | POST: createSessionRepo, workspace usage increment | sessions, workspaces |
| GET/PATCH/DELETE /api/sessions/[id] | requireAuth | — | Update/delete session, feedback/comments cleanup | sessions, feedback, comments, sessionViews |
| POST /api/extension/session | Session cookie | — | None | — |
| GET /api/billing/usage | requireAuth | resolveWorkspaceForUser | — | workspaces, getWorkspaceSessionCountRepo, getWorkspaceUsage |
| GET /api/plans/catalog | Public (no auth) | — | — | plans (getPlanCatalog) |
| GET/PATCH /api/admin/plans | requireAdmin | — | PATCH: setDoc plans, adminLogs, invalidatePlanCatalogCache | plans, adminLogs |
| GET /api/admin/workspaces | requireAdmin | — | — | workspaces, users |
| POST /api/admin/workspaces/actions | requireAdmin | — | set_plan, override_session_limit, suspend, etc. | workspaces |
| GET /api/admin/usage | requireAdmin | — | — | workspaces, session count |
| POST /api/admin/update-plan | requireAuth | workspace.ownerId === user.uid | updateWorkspacePlanRepo | workspaces |
| POST /api/admin/migrate-workspace-entitlements | requireAdmin | — | Migrate entitlements to overrides | workspaces |
| POST /api/feedback | requireAuth | — | Create feedback, update session, instruction graph | feedback, sessions, instructionGraphs |
| GET /api/feedback, GET /api/feedback/counts | requireAuth | — | — | feedback |
| PATCH/DELETE /api/tickets/[id] | requireAuth | — | Update/delete feedback | feedback |
| POST /api/structure-feedback | requireAuth | — | AI only (no direct write) | — |
| POST /api/upload-screenshot | requireAuth | — | Upload to storage, screenshot doc | screenshots, storage |
| GET /api/auth/session | — | — | Session from cookie | — |
| POST /api/auth/logout | — | — | Clear session | — |
| GET /api/workspace/status | requireAuth | — | — | workspaces |
| GET /api/insights, /api/session-insight | requireAuth | — | — | feedback, comments, sessions |
| POST /api/cron/cleanup-temp-screenshots | Cron | — | Cleanup | screenshots/storage |

requireAuth: Bearer (Firebase ID or extension JWT) or session cookie. requireAdmin: admin claim/check via adminAuth.

---

## SECTION 9 — Authentication System

### Firebase Auth

- **Dashboard login:** Login page uses Firebase Auth (e.g. Google). On success, create session cookie (e.g. via API that sets echly_session). getSessionUser(request) reads that cookie and returns { uid, email }.
- **ID token:** requireAuth in lib/server/auth.ts: if Authorization Bearer, first verify as Firebase ID token (jwtVerify with Firebase JWKS), else verify as extension token (verifyExtensionToken). If no Bearer, getSessionUser(request) from cookie.

### Session cookies

- **Usage:** Dashboard uses session cookie for authFetch (credentials: include). Extension auth broker page loads in same origin (or configured app origin); POST /api/extension/session with credentials: include returns extension JWT.

### Extension token flow

1. **Obtain:** Background needs token → open /extension-auth tab. Page has session cookie → POST /api/extension/session → receives { extensionToken, user }. Page postMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user }). sessionRelay.js (content on extension-auth) sends to background. Background stores token (memory), closes tab, opens widget.
2. **Use:** Content never has token. All API calls go to background; background getValidToken() then apiFetch with Authorization: Bearer <extensionToken>.
3. **Verify:** Background can verify dashboard session without token by POST /api/extension/session (credentials: include); 401 = not logged in.

### Trace: dashboard login → extension auth → API authorization

1. User logs in on dashboard → Firebase Auth + session cookie set.
2. User opens extension → background verifies session (POST /api/extension/session with cookie). If valid, background opens /extension-auth to get token; page reads cookie, POSTs same endpoint, gets JWT, postMessage → background stores token.
3. Extension API calls: content → background → fetch with Bearer extensionToken. API requireAuth: verifyExtensionToken(token) → uid, email; resolveWorkspaceForUser(uid); proceed.

---

## SECTION 10 — Shared Logic

### Already reusable

- **CaptureWidget component:** Lives in components/CaptureWidget; accepts both extension and non-extension props (extensionMode, pointers, onCreateSession, etc.). Core capture flow (state machine, feedback list, footer, resume modal) is environment-agnostic if callbacks are provided.
- **Types:** components/CaptureWidget/types.ts (StructuredFeedback, CaptureContext, CaptureWidgetProps, etc.) are shared.
- **Billing utilities:** lib/billing/* (plans, getPlanCatalog, getWorkspaceEntitlements, checkPlanLimit, getWorkspaceUsage) are server-side but used by both dashboard and API that extension calls. No extension-specific code.
- **Session APIs:** POST/GET /api/sessions are used by both dashboard and extension. Session repository and domain types are shared.
- **Auth:** requireAuth accepts both Firebase and extension token; same API surface for dashboard (cookie or Bearer) and extension (Bearer from background).

### Could become shared capture engine

- **Capture flow logic:** useCaptureWidget state machine and handlers (start capture, submit, session mode). The “engine” could be: state + handlers + types, with environment-specific adapters for: (1) session create (API vs in-memory), (2) feedback submit (authFetch vs content → background → apiFetch), (3) pointers source (prop from parent vs global state from background), (4) recording (browser vs extension messaging).
- **Feedback pipeline:** structure-feedback + feedback POST + upload screenshot + PATCH ticket. Same API endpoints; only the transport (who calls them: dashboard authFetch vs extension background apiFetch) differs.
- **ResumeSessionModal + fetchSessions:** Modal and session list logic are shared; only fetchSessions implementation differs (authFetch vs apiFetch via background).

---

## SECTION 11 — Environment Dependencies

### Extension-only

- **chrome.runtime:** sendMessage, onMessage, getURL; used in content and background.
- **chrome.tabs:** query, sendMessage, create, update, remove, captureVisibleTab, get; background.
- **chrome.storage.local:** get, set; background (echlyActive, activeSessionId, sessionModeActive, sessionPaused).
- **chrome.action.onClicked:** background.
- **chrome.scripting.executeScript:** background (inject content script).
- **Window flag:** __ECHLY_WIDGET_LOADED__, __ECHLY_APPLY_GLOBAL_STATE__, __ECHLY_MESSAGE_LISTENER__ (content).
- **Shadow DOM mount:** Content script creates host and shadow root; CaptureWidget can receive captureRootParent to mount capture layer in same shadow root.

### Browser / dashboard only

- **window, document, document.body:** Used in content and in Next.js client components. Dashboard does not inject into arbitrary pages.
- **Firebase Auth (client):** onAuthStateChanged, auth.currentUser, authFetch with cookie/Bearer from Firebase ID token in dashboard.
- **Firestore client (browser):** getDocs, doc, updateDoc, etc. in dashboard pages (e.g. folders, workspace overview). Extension does not use Firestore directly; all data via API.

### What would need an environment adapter

- **Session create:** Dashboard/extension both call POST /api/sessions; adapter would be “fetch with auth” (authFetch vs background proxy with extension token).
- **Feedback submit / structure-feedback / upload:** Same APIs; adapter = “authenticated fetch” (cookie/Bearer in app vs Bearer in background).
- **Pointers/session state:** Extension: from background via messages. Dashboard: could be from React state/API or Firestore listener. Adapter = “get session + pointers” and “notify on update”.
- **Recording / screenshot:** Extension: CAPTURE_TAB in background, content handles voice. Dashboard: browser MediaRecorder and canvas/crop in page. Adapter = “get audio stream” and “get screenshot”.
- **Mount container:** Extension: captureRootParent = shadow root container. Dashboard: body or a dedicated div. Adapter = “get root element for capture overlay”.

---

## SECTION 12 — Data Flow Diagrams

### 1. Session creation

```
User (Extension)                          User (Dashboard)
     |                                           |
     v                                           v
ContentApp createSession()              handleCreateSession()
     |                                           |
     v                                           v
chrome.runtime.sendMessage("echly-api",   authFetch("/api/sessions", POST)
  { url: "/api/sessions", method: "POST" })
     |                                           |
     v                                           v
Background getValidToken()                     Cookie / Bearer
     |                                           |
     v                                           v
fetch(API_BASE + "/api/sessions",              Same API
  Authorization: Bearer <extensionToken>)            |
     |                                           v
     +------------------+-------------------> POST /api/sessions
                        |                        requireAuth
                        |                        resolveWorkspaceForUser
                        |                        getWorkspaceSessionCountRepo
                        |                        checkPlanLimit(maxSessions)
                        |                        createSessionRepo
                        v
                  Firestore: sessions + workspace.usage
                        |
                        v
                  Response { session: { id } } or 403 PLAN_LIMIT_REACHED
```

### 2. Capture start (extension)

```
User clicks "Start Session" in widget
     |
     v
ensureAuthenticated() -> ECHLY_GET_AUTH_STATE
     |
     v
createSession() -> echly-api POST /api/sessions -> 200 + id
     |
     v
onActiveSessionChange(id) -> ECHLY_SET_ACTIVE_SESSION
     |
     v
Background: set activeSessionId, fetch /api/feedback?sessionId, /api/sessions
     |
     v
Background: globalUIState.pointers, sessionTitle; persist; broadcast ECHLY_GLOBAL_STATE
     |
     v
Content: setGlobalState; ECHLY_SESSION_MODE_START -> Background
     |
     v
Widget shows session view with pointers; user can capture (voice/region).
```

### 3. Feedback submission

```
User submits (voice/region) -> handleComplete(transcript, screenshot, callbacks, context)
     |
     v
Content: job enqueue; uploadScreenshot (optional); POST /api/structure-feedback (via echly-api)
     |
     v
If tickets.length > 0: for each ticket POST /api/feedback (via echly-api); PATCH /api/tickets/:id screenshotUrl
     |
     v
notifyFeedbackCreated(ticket) -> ECHLY_FEEDBACK_CREATED to background
     |
     v
Background: globalUIState.pointers = [ticket, ...]; broadcast ECHLY_GLOBAL_STATE
     |
     v
Content: merge pointers; widget re-renders list.
```

### 4. Extension auth

```
User opens extension (icon click)
     |
     v
Background: verifyDashboardSession() = POST /api/extension/session (credentials: include)
     |
     +-- 401 -> clear token; open /extension-auth (or focus existing auth tab)
     |       |
     |       v
     |   Extension-auth page: has cookie -> POST /api/extension/session -> { extensionToken, user }
     |       |
     |       v
     |   postMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user })
     |       |
     |       v
     |   sessionRelay.js -> chrome.runtime.sendMessage(ECHLY_EXTENSION_TOKEN)
     |       |
     +------> Background: store token (memory), close auth tab, open widget
     |
     +-- 200 -> token valid or not needed yet; open widget
```

### 5. Plan limit enforcement

```
POST /api/sessions
     |
     v
requireAuth -> resolveWorkspaceForUser -> getWorkspace(workspaceId)
     |
     v
getWorkspaceSessionCountRepo(workspaceId)  -->  active count = total - archived
     |
     v
getWorkspaceEntitlements(workspace)
     |
     v
  plan = workspace.billing?.plan ?? "free"
  catalog = getPlanCatalog()  -->  Firestore "plans" + code defaults
  limit = workspace.entitlements?.maxSessions ?? catalog[plan].maxSessions
     |
     v
checkPlanLimit(workspace, "maxSessions", currentUsage)
  if currentUsage >= limit -> throw PLAN_LIMIT_REACHED
     |
     v
createSessionRepo(workspaceId, userId, null)  -->  transaction: add session, increment usage.sessionsCreated
```

---

## SECTION 13 — Refactor Risk Map

### Tight couplings

- **ContentApp and CaptureWidget:** ContentApp holds many extension-only handlers (chrome.runtime.sendMessage for session mode, recording, expand/collapse, auth). CaptureWidget receives them as props; moving CaptureWidget to a shared package would require either (1) keeping a thin “extension host” that provides these props, or (2) introducing an adapter interface so the shared widget only depends on callbacks.
- **useCaptureWidget and CaptureWidget:** Hook holds capture state and handlers; some handlers are extension-specific (onCreateSession, onActiveSessionChange). Shared engine would need to accept these as optional callbacks or an adapter.
- **Feedback pipeline in content:** handleComplete in content.tsx contains the full pipeline (structure-feedback, feedback POST, upload, PATCH, ECHLY_FEEDBACK_CREATED). Duplicated logic for “submit anyway” and clarity assistant. Extracting to a shared “submitFeedback” would reduce duplication but must work with both authFetch and extension proxy.

### Extension-only logic

- **chrome.runtime.sendMessage / onMessage:** All extension flows depend on this. Shared code must not reference chrome; adapters in extension host must translate “session start”, “feedback created”, “expand/collapse” into messages.
- **globalUIState and ECHLY_GLOBAL_STATE:** Content derives widget state from background. Shared widget should receive “sessionId, pointers, expanded, sessionModeActive, …” as props/callback updates, not listen to custom events or chrome messages.
- **captureRootParent (shadow root):** Extension mounts capture layer in shadow root. Dashboard would use body or a div. Shared component should accept a “root ref” or “container” prop, not assume DOM environment.
- **launcherLogoUrl (chrome.runtime.getURL):** Extension-only. Shared UI could accept optional logo URL prop.

### Dashboard-only assumptions

- **authFetch and Firebase auth:** Dashboard assumes browser context with cookie and/or Firebase ID token. Shared engine must not call authFetch directly; it should call an injected “fetchWithAuth” or equivalent.
- **No global “tray” state:** Dashboard does not have a single global tray across tabs. Shared widget used on dashboard might be per-page and not need ECHLY_GLOBAL_STATE-style sync.

### Global variables

- **window.__ECHLY_WIDGET_LOADED__:** Prevents duplicate content script mount. Not relevant to shared widget code; remains in extension content bootstrap.
- **window.__ECHLY_APPLY_GLOBAL_STATE__:** Set by ContentApp for background to push state. Extension-only; shared widget should not rely on this.
- **echlyEventDispatcher (content):** Used for ECHLY_OPEN_PREVIOUS_SESSIONS. Extension-only; modal open could be a callback in shared API.

### Summary risk

- **High:** Moving CaptureWidget into a shared package without an adapter layer would pull in chrome and content-specific state. Recommended: extract “core” capture state machine + UI that receives all environment-specific behavior via props/context/adapters; keep extension-specific message handling and state sync in the extension host (ContentApp and background).

---

## SECTION 14 — Shared Capture Engine Feasibility

### Feasibility

**Yes.** The capture system can be extracted into a shared module used by both dashboard and extension, provided:

1. **Abstraction boundaries:** The shared module exposes: (a) capture state and handlers (useCaptureWidget-like), (b) CaptureWidget UI that receives sessionId, pointers, callbacks (onComplete, onDelete, onUpdate, onCreateSession, onExpandRequest, etc.), and (c) types (StructuredFeedback, CaptureContext, CaptureWidgetProps). It must not import chrome, Firebase (client), or assume a single “global” tray state.
2. **Environment adapters:** (1) **Session:** “createSession(): Promise<{ id } | limitReached>” — extension: POST via background; dashboard: authFetch POST. (2) **Fetch:** “authenticatedFetch(url, options)” — extension: send to background (echly-api); dashboard: authFetch. (3) **Pointers/session state:** Extension: from background via props; dashboard: from API or local state. (4) **Recording/screenshot:** Extension: CAPTURE_TAB + content voice; dashboard: MediaRecorder + canvas. (5) **Mount:** Optional captureRootParent; extension passes shadow root child; dashboard passes null or a div.
3. **Where the shared code lives:** A package or path (e.g. `packages/capture-engine` or `lib/capture-engine`) containing: CaptureWidget.tsx, WidgetFooter, ResumeSessionModal, useCaptureWidget, types, FeedbackItem, CaptureHeader, CaptureLayer, MicrophonePanel, SessionLimitUpgradeView. Dependencies: React, and possibly a small “context” or “adapter” interface so the widget never calls chrome or authFetch directly.

### Safest migration strategy

1. **Introduce adapter interface (no move yet):** Define a small interface in the current repo, e.g. `CaptureEnvironment`: { createSession, fetchWithAuth, getPointers, onPointersUpdate?, getSessionId, getExpanded, onExpandRequest, onCollapseRequest, … }. ContentApp and (future) dashboard host implement this. CaptureWidget and useCaptureWidget accept this via context or props. Refactor ContentApp to use the interface so that CaptureWidget only talks to the interface.
2. **Extract shared package:** Move CaptureWidget, hooks, types, and subcomponents to the new package. Depend only on React and the adapter interface type. No chrome, no authFetch, no Firestore.
3. **Extension host:** In echly-extension, keep content.tsx and background.ts. ContentApp (or a new “ExtensionCaptureHost”) implements CaptureEnvironment using chrome.runtime.sendMessage and state from ECHLY_GLOBAL_STATE. Renders `<CaptureWidget … />` from the shared package with props from the adapter.
4. **Dashboard host (optional):** Add a dashboard page or embed that implements CaptureEnvironment using authFetch and local/session state. Renders the same CaptureWidget from the shared package.
5. **Pipeline extraction (optional):** Move “submit feedback” pipeline (structure-feedback → feedback POST → upload → PATCH) into a shared function that takes “authenticatedFetch” and callbacks; content and dashboard call it with their fetch implementation.

Do not implement the refactor in this audit; the above is the analysis and recommended strategy only.

---

**End of report.**
