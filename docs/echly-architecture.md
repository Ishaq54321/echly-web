# Echly Architecture Overview

This document is the **master architecture reference** for the Echly codebase. It is written for AI assistants and engineers who need to understand how the product works, where logic lives, and how to safely modify the system.

---

## 1. Product Purpose

**Echly** is a browser-based **visual feedback and collaboration tool**. Users capture feedback (screenshots, annotations, voice, or text) from web pages via a browser extension, organize it in **sessions**, discuss it in **threads**, and track resolution. The web app provides a **dashboard** (sessions, folders), **session viewer** (feedback list + detail + comments), **Discussion** (cross-session conversations), **Insights** (analytics), and **Settings**.

**Core value:** Replace back-and-forth emails and scattered screenshots with structured, session-based feedback that stays attached to context (screenshot, URL, viewport) and can be resolved with comments.

---

## 2. Core Features

- **Visual feedback capture** — Screenshot (full page or region) with optional annotations; captured from the extension.
- **Screenshot annotations** — Pins and regions on screenshots; comments can be pin, text, or general.
- **Feedback threads** — Each feedback item has a comment thread; resolve/open and optional attachments.
- **Issue tracking** — Feedback has status (open / resolved / skipped), type, title, description, action steps, suggested tags (from AI).
- **Sessions** — Containers for feedback (e.g. “Sprint 1 review”). Sessions have title, archived flag, denormalized counts (openCount, resolvedCount, commentCount, etc.).
- **Insights analytics** — Issues captured, replies made, sessions reviewed, time saved; activity trends, issue type distribution, most active sessions, response speed, heatmap.
- **Workspace management** — Workspaces (owner, members, settings); sessions and feedback are scoped by workspace (with legacy userId fallback).
- **Browser extension** — Captures screenshots, starts/pauses/ends sessions, submits feedback via app API; auth via Firebase in background script; widget (CaptureWidget) in content script.

---

## 3. Main Product Surfaces

| Surface | Route(s) | Purpose |
|--------|----------|---------|
| **Dashboard** | `/dashboard` | Library: sessions list, folders, search, new session/folder, drag session to folder. |
| **Session viewer** | `/dashboard/[sessionId]` | Single session: feedback list (ticket list), feedback detail (screenshot, metadata, comments), execution mode (skip/resolve), command center blocks. |
| **Session overview** | `/dashboard/[sessionId]/overview` | Overview tab for a session. |
| **Sessions (list)** | `/dashboard/sessions` | Alternate sessions list view. |
| **Discussion** | `/discussion` | All feedback conversations across sessions: project/session list, discussion list, thread view. |
| **Insights** | `/dashboard/insights` | Analytics: time saved, issues/replies trends, issue types, most active sessions, response speed, heatmap. |
| **Settings** | `/settings` | User/workspace settings. |
| **Auth** | `/login`, `/signup` | Login and signup (auth layout). |
| **Onboarding** | `/onboarding`, `/onboarding/activate` | Onboarding and activation. |
| **Folders** | `/folders/[folderId]` | Folder detail (sessions in folder). |

---

## 4. Project Structure

```
/app
  /(app)                    # Authenticated app shell (GlobalRail, FloatingUtilityActions, ErrorBoundary)
    layout.tsx              # App layout: GlobalRail + main + FloatingUtilityActions
    /dashboard
      page.tsx              # Main dashboard: workspace card, folders, sessions grid/table, search
      /insights
        page.tsx            # Insights: fetches /api/insights, renders metric cards + charts
      /sessions
        page.tsx            # Sessions list page
      /[sessionId]
        page.tsx            # Session entry; loads SessionPageClient
        SessionPageClient.tsx # Session viewer: ticket list, execution view, comment panel, feedback detail
        /overview
          page.tsx          # Session overview tab
    /discussion
      page.tsx              # Discussion: DiscussionList, DiscussionThread, resize panels
    /folders
      /[folderId]
        page.tsx            # Folder page
    /settings
      page.tsx              # Settings page
  /(auth)
    layout.tsx              # Auth layout (font only)
    /login
      page.tsx
    /signup
      page.tsx
  /onboarding
    layout.tsx
    page.tsx
    /activate
      page.tsx
  /api
    /feedback
      route.ts              # GET (list by session or workspace), POST (create)
    /feedback/counts
      route.ts
    /insights
      route.ts              # GET: requireAuth → computeInsights(userId)
    /sessions
      route.ts              # Sessions CRUD
    /sessions/[id]
      route.ts
    /structure-feedback
      route.ts              # AI structuring + clarity guard
    /session-insight
      route.ts              # Session-level AI summary
    /upload-screenshot
      route.ts
    /upload-attachment
      route.ts
    /tickets/[id]
      route.ts
    /cron/cleanup-temp-screenshots
      route.ts

/components
  /auth           # AuthLayout, AuthCard
  /dashboard      # SessionsHeader, FolderCard, SessionsTableView, MoveSessionsModal,
                  # DragGhostChip, ToastContext, DragSessionContext, WorkspaceCard,
                  # RenameFolderModal, DeleteSessionModal, ShareSessionModal, etc.
  /layout         # GlobalRail, FloatingUtilityActions, DashboardHeader, AppLayoutClient
  /layout/operating-system  # TicketList, ExecutionView, ExecutionModeLayout, CommentPanel,
                           # SignalStream, FourZoneLayout, FeedbackCommandPanel, etc.
  /session        # FeedbackSidebar, SessionHeader, feedbackDetail/* (FeedbackDetail, ScreenshotBlock, etc.)
  /insights       # ActivityTrendChart, IssueTypeDonutChart, MostActiveSessionsBarChart,
                  # ResponseSpeedTrendChart, FeedbackHeatmap
  /discussion     # DiscussionList, DiscussionThread, DiscussionFeed, DiscussionPanel, etc.
  /CaptureWidget  # CaptureWidget (main), CaptureHeader, FeedbackItem, RegionCaptureOverlay,
                  # SessionControlPanel, VoiceCapturePanel, etc.
  /ui             # Button, Modal, Avatar, Toast, Card, Tag, Switch, etc.
  /skeleton       # SessionsTableSkeleton, FolderSkeleton, SessionsGridSkeleton, SessionCardSkeleton
  /command-center # AIExecutiveSummaryBlock, PriorityRadarBlock, RiskBlock, SignalHeatmapBlock, etc.
  /comments       # CommentThread, CommentItem, CommentInput
  /providers      # ThemeProvider
  /demo           # DemoGuide, ExtensionPopup, DemoFeedbackDashboard, etc.
  /onboarding     # StepIndicator, WorkspaceForm
  /modals         # MoveToFolderModal
  ErrorBoundary.tsx
  ImageViewer.tsx

/lib
  /domain         # TypeScript interfaces: session, feedback, workspace, comment, signal, feedback-display
  /repositories   # Firestore access: sessionsRepository, feedbackRepository, commentsRepository,
                  # workspacesRepository, usersRepository, screenshotsRepository
  /analytics      # computeInsights.ts — all Insights metrics from Firestore
  /server         # auth (requireAuth, verifyIdToken), serializeFeedback, pipelineStages, etc.
  /firebase       # initializeApp, auth, db, storage; config in firebase/config
  /hooks          # useAuthGuard, etc.
  /tickets        # generateTicketTitle
  /intelligence   # velocityAnalyzer
  /utils          # time (formatRelativeTime), logger
  /debug          # echlyLogger
  authFetch.ts    # Client: get id token from Firebase Auth, call API with Bearer
  sessions.ts     # createSession, getWorkspaceSessions, getUserSessions, updateSessionTitle, etc.
  feedback.ts     # addFeedback (wraps repo), getSessionFeedbackCounts
  capture.ts
  screenshot.ts
  viewerId.ts

/echly-extension
  manifest.json
  popup.html, popup.js, popup.css   # Extension popup (login / toggle visibility)
  src/
    background.ts    # Service worker: auth, token, session lifecycle, ECHLY_* messages, screenshot upload
    content.tsx      # Content script: mounts CaptureWidget, listens for ECHLY_VISIBILITY / session state
    contentScreenshot.ts  # generateFeedbackId, uploadScreenshot (sends to background)
    screenshotUpload.ts  # Firebase Storage upload (sessions/{sessionId}/feedback/{feedbackId}/{ts}.png)
    popup.tsx        # Popup UI: auth state, Continue with Google, toggle visibility
    auth.ts          # Extension auth helpers
    api.ts           # API client for extension
    contentAuthFetch.ts
    ocr.ts           # getVisibleTextFromScreenshot (tesseract)
  assets/, fonts/
  README.md

/public
  Echly_logo.svg, illustrations/, assets/
```

---

## 5. Frontend Architecture

### Framework and routing

- **Next.js 16** (App Router). React 19.
- **Routes:** File-based under `app/`. Route groups: `(app)` = main app with sidebar; `(auth)` = login/signup.
- **Key routes:** `/dashboard`, `/dashboard/[sessionId]`, `/dashboard/insights`, `/discussion`, `/settings`, `/login`, `/signup`, `/folders/[folderId]`.

### Layout system

- **Root layout** — Wraps entire app.
- **`app/(app)/layout.tsx`** — Renders `GlobalRail` (sidebar nav), main content area, `FloatingUtilityActions`, and `ErrorBoundary`. All authenticated pages under `(app)` share this.
- **`app/(auth)/layout.tsx`** — Font only; no rail.
- **GlobalRail** — Side nav: Dashboard, Discussion, Sessions, Insights, Settings; workspace switcher; uses `useAuthGuard` and redirects unauthenticated users.

### Component architecture

- **Pages** are thin; they use hooks for data and compose components.
- **Shared UI** in `components/ui` (Button, Modal, Avatar, Toast, Card, etc.).
- **Feature components** in `components/dashboard`, `components/session`, `components/insights`, `components/discussion`, `components/layout/operating-system`, `components/CaptureWidget`, etc.
- **State:** React state and context (e.g. ToastContext, DragSessionContext). No global Redux; server state is fetched via `authFetch` to Next.js API routes or directly from Firestore in client (e.g. dashboard folders).

### Styling

- **Tailwind CSS v4.** Config in `tailwind.config.ts` (colors, shadows, borderRadius, transitionDuration).
- **Design tokens:** primary, brand.accent, semantic (system, insight, success, danger), shadow levels, card radius.
- **Global styles** in `app/globals.css`; dashboard-specific classes (e.g. `.dashboard-workspace-section`) and keyframes there.

---

## 6. Major Pages

### Dashboard (`/dashboard`)

- **Purpose:** Library home: list sessions, folders, search, create session/folder, move sessions into folders (drag or modal).
- **Components:** `WorkspaceCard`, `SessionsHeader`, `FolderCard`, `SessionsTableView` or grid, `MoveSessionsModal`, `DragGhostChip`, `ToastProvider`, `DragSessionProvider`; skeletons: `SessionsGridSkeleton`, `FolderSkeleton`.
- **Data:** `useWorkspaceOverview(viewMode)` loads sessions (and feedback counts) via `getUserSessions` / `getWorkspaceSessions` and `getSessionFeedbackCounts`. Folders loaded from Firestore `folders` (getDocs, addDoc, updateDoc, deleteDoc) in the page. Root sessions = sessions not in any folder; filtered by search and sorted by `updatedAt`.

### Session viewer (`/dashboard/[sessionId]`)

- **Purpose:** View one session: ticket list, feedback detail (screenshot, metadata, action steps, comments), execution mode (resolve/skip), command center blocks (AI summary, priority radar, risk, momentum, etc.).
- **Components:** `SessionPageClient` uses `TicketList`, `ExecutionView`, `ExecutionModeLayout`, `CommentPanel` from `layout/operating-system`; feedback detail uses `FeedbackDetail`, `ScreenshotWithPins`, `ActivityThread`, etc. from `session/feedbackDetail`. Data hooks: `useSessionFeedbackPaginated`, `useFeedbackDetailController`.
- **Data:** Session from Firestore (getDoc). Feedback list via `GET /api/feedback?sessionId=...` (paginated). Comments and feedback updates via API or Firestore. Structure-feedback and session-insight from `/api/structure-feedback` and `/api/session-insight`.

### Discussion (`/discussion`)

- **Purpose:** Inbox of feedback conversations across all sessions. List conversations, select one, view thread (comments, attachments).
- **Components:** `DiscussionList`, `DiscussionThread`, `DiscussionFeed`, `DiscussionPanel`, `ResizeHandle`, `DiscussionSkeleton`.
- **Data:** `GET /api/feedback?conversationsOnly=true` (no sessionId) returns feedback that has comments; list and thread data from that plus session names. Comment added updates local state for reply count without full reload.

### Insights (`/dashboard/insights`)

- **Purpose:** Product usage analytics and value metrics (issues captured, replies, time saved, trends, distributions).
- **Components:** Metric cards (time saved, issues, replies, sessions reviewed, resolved discussions), `ActivityTrendChart`, `IssueTypeDonutChart`, `MostActiveSessionsBarChart`, `ResponseSpeedTrendChart`, `FeedbackHeatmap` (all dynamic-imported for client-only charts).
- **Data:** `GET /api/insights` → `requireAuth` then `computeInsights(user.uid)`. All metrics computed in `lib/analytics/computeInsights.ts` from Firestore (feedback, comments, sessions).

### Settings (`/settings`)

- **Purpose:** User and workspace settings.
- **Components:** Settings-specific UI.
- **Data:** User/workspace from auth and Firestore as needed.

---

## 7. Domain Models

Located in `lib/domain/`. Used across app and API.

### Session (`lib/domain/session.ts`)

- **Fields:** id, workspaceId?, userId?, title, archived?, createdAt?, updatedAt?, createdBy?, viewCount?, commentCount?, aiInsightSummary?, aiInsightSummaryFeedbackCount?, aiInsightSummaryUpdatedAt?, openCount?, resolvedCount?, skippedCount?, feedbackCount?.
- **Purpose:** Container for feedback; denormalized counts for list views and insights.
- **Relationships:** Belongs to workspace (or legacy user); has many Feedback.

### Feedback (`lib/domain/feedback.ts`)

- **Fields:** id, workspaceId?, sessionId, userId?, title, description, suggestion?, type, isResolved, isSkipped?, createdAt, commentCount?, lastCommentPreview?, lastCommentAt?, contextSummary?, actionSteps?, suggestedTags?, url?, viewportWidth?, viewportHeight?, userAgent?, clientTimestamp?, screenshotUrl?, clarityScore?, clarityStatus?, clarityIssues?, clarityConfidence?, clarityCheckedAt?.
- **Purpose:** One visual/issue item (ticket). Status: open | resolved | skipped (`getTicketStatus()`).
- **Relationships:** Belongs to Session; has many Comments. StructuredFeedback is the input shape for creation (title, description, type, screenshotUrl, actionSteps, etc.).

### Workspace (`lib/domain/workspace.ts`)

- **Fields:** id, name, logoUrl, ownerId, members, createdAt?, updatedAt?, appearance (logoOnFeedbackScreen, accentColor, removeEchlyBranding), notifications (email.*), automations (autoCreateTicketOnFeedback), permissions (allowGuestComments), ai (actionStepsEnabled), integrations (slack, linear, jira, zapier), billing (plan, billingCycle, seats, stripe*), entitlements.
- **Purpose:** Tenant for sessions and feedback; settings and billing.

### Comment (`lib/domain/comment.ts`)

- **Fields:** id, workspaceId?, sessionId, feedbackId, userId, userName, userAvatar, message, createdAt, type? (pin | text | general), position? (pin), textRange? (text), threadId?, resolved?, attachment?.
- **Purpose:** Single reply or thread root; pin comments have position on screenshot.
- **Relationships:** Belongs to Feedback.

### Signal (`lib/domain/signal.ts`)

- **Fields:** id, sessionId, title, impactScore, urgency, confidencePercent, clusterLabel, status, ownerId?, ownerName?, timeDecayHours?, resolutionVelocity?, createdAt, clientTimestamp, updatedAt, isResolved, suggestedTags?, contextSummary?.
- **Purpose:** Feedback represented in “signal stream” / command center (impact, urgency, risk). `feedbackToSignal()` converts Feedback-like items to Signal when AI scoring not yet available.

### feedback-display (`lib/domain/feedback-display.ts`)

- **Purpose:** Display-only status/priority (Open, In Progress, Blocked, Resolved; Low–Critical). `statusFromResolved()`, `defaultPriority()`.

---

## 8. Data Layer

### Database

- **Firebase Firestore.** Collections: `sessions`, `feedback`, `comments`, `folders`, `workspaces`, users (or equivalent). Screenshots stored in **Firebase Storage** at `sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png`.
- **Auth:** Firebase Auth (Google and others). ID tokens verified in API via `lib/server/auth.ts` (jose, JWKS from Google).

### Where queries happen

- **Repositories** (`lib/repositories/*`): All Firestore reads/writes. Examples: `sessionsRepository` (getSessionByIdRepo, getUserSessionsRepo, getWorkspaceSessionsRepo, createSessionRepo, updateSessionTitleRepo, etc.), `feedbackRepository` (addFeedbackRepo, addFeedbackWithSessionCountersRepo, getSessionFeedbackPageWithStringCursorRepo, getWorkspaceFeedbackAllRepo, getWorkspaceFeedbackWithCommentsRepo, getSessionFeedbackCountsRepo), `commentsRepository`, `workspacesRepository`, `usersRepository`, `screenshotsRepository`.
- **API routes** call repositories or high-level lib (e.g. `lib/sessions`, `lib/feedback`). `computeInsights` in `lib/analytics/computeInsights.ts` queries `feedback`, `comments`, `sessions` directly with Firestore (where userId, createdAt, etc.).
- **Client** sometimes reads Firestore directly (e.g. dashboard folders: getDocs(collection(db, "folders"))), and sometimes calls API (e.g. `authFetch("/api/feedback?sessionId=...")`, `authFetch("/api/insights")`).

### Data fetching (client)

- **authFetch** (`lib/authFetch.ts`): Gets Firebase ID token, sets `Authorization: Bearer <token>`, optional timeout. Used for all app→API calls. In extension, `window.__ECHLY_API_BASE__` can set API base.
- **Hooks:** `useWorkspaceOverview` (dashboard), `useSessionFeedbackPaginated`, `useFeedbackDetailController` (session page), `useAuthGuard` (auth + redirect).
- **Insights:** Single fetch to `/api/insights` on load; response is full `InsightsData`.

### Mutations

- **Feedback create:** Extension or app → `POST /api/feedback` with StructuredFeedback; API uses `addFeedbackWithSessionCountersRepo` (transaction with session counter increments). Screenshot: extension uploads to Storage (background), passes URL in payload; or app uses `/api/upload-screenshot`.
- **Feedback update (resolve/skip/etc.):** PATCH/update via API or repository (updateDoc on `feedback` and session counters as needed).
- **Comments:** Added via API or repository; commentCount and lastCommentAt updated on feedback doc.
- **Sessions:** Create via `createSession` (repo); update title/archived via repo; folders updated with updateDoc/deleteDoc in dashboard.
- **Session counters:** Updated in transactions when feedback is added/resolved/skipped (feedbackRepository, sessionsRepository).

---

## 9. Browser Extension

### How the extension is built

- **Build:** `npm run build:extension` (postcss for popup.css, esbuild for JS). Popup and content script consume shared components (e.g. CaptureWidget) via bundling.
- **Manifest:** Standard Chrome extension with background (service worker), content script, popup; host permissions and scripting as needed.

### Auth and visibility

- **Popup:** Login-only. If not authenticated, shows “Continue with Google”; if authenticated, closes and toggles widget visibility. Auth state and login handled in **background** (Firebase Auth); popup sends `ECHLY_GET_AUTH_STATE`, `ECHLY_START_LOGIN`, `ECHLY_TOGGLE_VISIBILITY`.
- **Background** holds token state (idToken, refreshToken, expiresAt), responds to content script token requests so content script can call app API with Bearer token.
- **Content script** receives `ECHLY_VISIBILITY` and session state (sessionId, sessionTitle, sessionModeActive, sessionPaused, pointers). Tray visibility: show when visible or session active or paused.

### Screenshot capture and upload

- **Capture:** Content script uses CaptureWidget; full page or region capture produces image (e.g. html2canvas or similar). Extension-specific helpers in `contentScreenshot.ts`: `generateFeedbackId()`, `generateScreenshotId()`, `uploadScreenshot(imageDataUrl, sessionId, screenshotId)` which sends `ECHLY_UPLOAD_SCREENSHOT` to background.
- **Background** receives `ECHLY_UPLOAD_SCREENSHOT`, uploads to Firebase Storage via `echly-extension/src/screenshotUpload.ts` (path: `sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png`), returns URL to content script. Feedback can be created with temp id first and screenshot attached when URL is ready (TEMP → ATTACHED).

### Session lifecycle

- **Background** tracks `activeSessionId`, `sessionModeActive`, `sessionPaused`; persists to chrome.storage.local. Session idle timeout (e.g. 30 min) ends session and broadcasts `ECHLY_RESET_WIDGET` to tabs.
- **Content script** creates or resumes session via API (e.g. POST sessions, or resume existing); on start/pause/end sends messages to background so global state and tray stay in sync. When feedback is created via API, content notifies background (`ECHLY_FEEDBACK_CREATED`) so `pointers` (tray list) updates.

### Communication with the app

- **API:** Content script and background call app API at `API_BASE` (e.g. localhost:3000) with Bearer token from background. Create session, create feedback, structure-feedback, upload attachment, etc.
- **Session/ticket sync:** App session page can broadcast `ECHLY_TICKET_UPDATED` to extension so tray reflects updated title/action steps/type.

---

## 10. Key Flows

### Feedback capture flow (extension)

1. User opens extension popup; if not logged in, signs in with Google (background).
2. User toggles widget visible; content script shows CaptureWidget.
3. User starts a session (new or resume); background sets activeSessionId and session state.
4. User captures (screenshot/region or voice/text). Screenshot uploaded via background to Storage; URL obtained.
5. Optionally structure-feedback API is called (AI title, description, action steps, clarity); if clarity low, user can edit and retry.
6. POST /api/feedback with StructuredFeedback (including screenshotUrl); API creates feedback and increments session counters.
7. Content script notifies background (ECHLY_FEEDBACK_CREATED); tray shows new ticket.

### Feedback capture flow (app)

1. User on session page can add feedback (e.g. paste or upload screenshot, enter text).
2. Upload screenshot via /api/upload-screenshot if needed; then POST /api/feedback with StructuredFeedback.
3. Session and list refresh; new item appears in ticket list.

### Discussion flow

1. User opens /discussion. App fetches GET /api/feedback?conversationsOnly=true.
2. List shows feedback items that have comments; user selects one.
3. Thread view loads comments for that feedback; user can add comment (and attachment via /api/upload-attachment).
4. On add comment, local state updates reply count; optional refetch of thread.

### Insights flow

1. User opens /dashboard/insights. Page calls authFetch("/api/insights").
2. API requireAuth → computeInsights(user.uid). computeInsights queries Firestore (feedback, comments, sessions) for lifetime and last-30-days, aggregates counts, builds trend arrays, response speed, heatmap, etc.
3. Response returned as InsightsData; page renders metric cards and charts (ActivityTrendChart, IssueTypeDonutChart, MostActiveSessionsBarChart, ResponseSpeedTrendChart, FeedbackHeatmap).

---

## 11. Insights System

**Entry:** `GET /api/insights` → `requireAuth` → `computeInsights(user.uid)` in `lib/analytics/computeInsights.ts`.

**Data:** Firestore collections `feedback`, `comments`, `sessions`. Queries filtered by `userId` and optionally `createdAt >= windowStart` (30-day window). Limits: FEEDBACK_QUERY_LIMIT (2000), COMMENTS_QUERY_LIMIT (3000), SESSIONS_QUERY_LIMIT (500).

**Metrics computed:**

- **issuesCaptured** — Count of feedback docs (lifetime and last 30 days).
- **repliesMade** — Count of comments (lifetime and last 30 days).
- **sessionsReviewed** — Count of sessions (lifetime and last 30 days).
- **timeSavedHours** — issuesCaptured × TIME_SAVED_PER_TICKET_MINUTES (5) / 60; lifetime and last 30 days.
- **resolvedDiscussions** — Count of feedback with status "resolved".
- **mostCommentedSessions** — Top 3 sessions by comment count (from feedback commentCount aggregated by session).
- **mostReportedIssueTypes** — Top 4 issue types by count.
- **responseSpeed** — averageFirstReply (first comment time minus feedback createdAt, averaged), averageResolutionTime (lastCommentAt − createdAt for resolved with comments); formatted as strings (e.g. "~2h 5m").
- **timeSaved** — Lifetime minutes and formatted string (e.g. "2h 30m").
- **issuesPerDay / repliesPerDay** — Daily buckets (date → issues, replies) for last 30 days.
- **issueTypeDistribution** — Each type with count and percentage (for donut).
- **mostActiveSessions** — Top 5 sessions by feedback count.
- **responseSpeedTrend** — Weekly buckets of average first-reply time (ms).
- **feedbackHeatmap** — Counts by dayOfWeek (0–6) and hourOfDay (0–23).

All of these are computed inside `computeInsights`; no other file computes Insights metrics. Default empty snapshot returned on error.

---

## 12. Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4 |
| **Backend / API** | Next.js Route Handlers (app/api) |
| **Auth** | Firebase Auth (Google, etc.); API: Bearer token verified with jose + JWKS |
| **Database** | Firebase Firestore |
| **Storage** | Firebase Storage (screenshots, attachments) |
| **Extension** | Chrome extension (manifest v3): background (service worker), content script, popup; Firebase in background |
| **Charts** | Recharts (Insights) |
| **Other** | framer-motion, html2canvas, tesseract.js (OCR), wavesurfer.js, react-countup, jose (JWT) |

---

## 13. Component Index (Key Components)

| Component | Location | Purpose |
|-----------|-----------|---------|
| **GlobalRail** | layout/GlobalRail.tsx | Sidebar nav (Dashboard, Discussion, Sessions, Insights, Settings), workspace block |
| **FloatingUtilityActions** | layout/FloatingUtilityActions.tsx | Floating action buttons (e.g. quick actions) |
| **SessionsHeader** | dashboard/SessionsHeader.tsx | Title, tabs (Sessions/Archived), New Folder, New Session |
| **FolderCard** | dashboard/FolderCard.tsx | Folder row: name, session count, menu (Rename, Move sessions, Share, Delete), drag-drop target |
| **SessionsTableView** | dashboard/SessionsTableView.tsx | Table of sessions: name, status, feedback/open/replies, activity bar, updated |
| **MoveSessionsModal** | dashboard/MoveSessionsModal.tsx | Modal to move one or many sessions into a folder |
| **DragGhostChip** | dashboard/DragGhostChip.tsx | Floating chip shown while dragging a session |
| **ToastContext / useToast** | dashboard/context/ToastContext.tsx | Toast notifications (e.g. "Session moved to …") |
| **DragSessionProvider / useDragSession** | dashboard/context/DragSessionContext.tsx | Drag state for session→folder |
| **TicketList** | layout/operating-system/TicketList.tsx | List of feedback items in session (open/resolved/skipped, select, keyboard) |
| **ExecutionView / ExecutionModeLayout** | layout/operating-system/ExecutionView.tsx, ExecutionModeLayout.tsx | Execution mode: resolve/skip, canvas, ticket list |
| **CommentPanel** | layout/operating-system/CommentPanel.tsx | Comment thread and composer for selected feedback |
| **FeedbackDetail** | session/feedbackDetail/FeedbackDetail.tsx | Full feedback view: header, screenshot, description, action steps, activity thread |
| **ScreenshotWithPins** | session/feedbackDetail/ScreenshotWithPins.tsx | Screenshot with pin comments overlay |
| **ActivityTrendChart** | insights/ActivityTrendChart.tsx | Line/area chart: issues and replies per day |
| **IssueTypeDonutChart** | insights/IssueTypeDonutChart.tsx | Donut: issue type distribution |
| **MostActiveSessionsBarChart** | insights/MostActiveSessionsBarChart.tsx | Bar chart: top sessions by issue count |
| **ResponseSpeedTrendChart** | insights/ResponseSpeedTrendChart.tsx | Trend of average first-reply time by week |
| **FeedbackHeatmap** | insights/FeedbackHeatmap.tsx | Heatmap: feedback count by day-of-week × hour |
| **CaptureWidget** | CaptureWidget/CaptureWidget.tsx | Extension/widget: capture modes (voice/text), session control, feedback list, submit |
| **RegionCaptureOverlay** | CaptureWidget/RegionCaptureOverlay.tsx | Region selection for screenshot |
| **DiscussionList** | discussion/DiscussionList.tsx | List of conversations (feedback with comments) |
| **DiscussionThread** | discussion/DiscussionThread.tsx | Single conversation thread (comments, reply, attachments) |
| **ErrorBoundary** | ErrorBoundary.tsx | Catches React errors in app layout |

---

## 14. Safe Modification Guidelines (for AI / engineers)

- **Domain types:** Change only in `lib/domain/`; then fix repositories and API that read/write these shapes.
- **Insights:** All metric logic lives in `lib/analytics/computeInsights.ts`. Changing metrics or windows = change only there (and any type exports). UI in `app/(app)/dashboard/insights/page.tsx` and `components/insights/*` only consumes the API response.
- **Feedback create path:** Ensure both API (`POST /api/feedback`) and extension use the same StructuredFeedback shape and that `addFeedbackWithSessionCountersRepo` is used so session counters stay correct.
- **Session counters:** Prefer repository transactions (feedback + session doc) over ad-hoc updateDoc so open/resolved/feedback counts don’t drift.
- **Extension ↔ app:** Keep message types (`ECHLY_*`) and payload shapes documented; background is single source of truth for token and session state.
- **Auth:** API routes that need user must call `requireAuth(req)` and use returned `uid` (and workspace via `getUserWorkspaceIdRepo` when needed).
- **Routing:** Add new app pages under `app/(app)/` to keep GlobalRail; use `useAuthGuard` on pages that require login.

---

*End of architecture document.*
