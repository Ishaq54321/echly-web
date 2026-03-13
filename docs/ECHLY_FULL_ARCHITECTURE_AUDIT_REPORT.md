# Echly — Full Architecture Audit Report

**Date:** March 14, 2025  
**Scope:** Entire Echly codebase (read-only analysis; no code modified).

---

## SECTION 1 — Project Structure

### Root Folders

| Folder | Purpose |
|--------|---------|
| `app/` | Next.js 16 App Router: pages, layouts, API routes |
| `components/` | React UI components (dashboard, session, layout, billing, admin, demo, etc.) |
| `lib/` | Core logic: auth, billing, repositories, domain models, AI pipeline, server helpers |
| `server/` | Express-style middleware (e.g. `verifyFirebaseToken`) — not used by Next.js API routes |
| `echly-extension/` | Browser extension: popup, content script, background, assets |
| `public/` | Static assets (fonts, illustrations, SVGs) |
| `scripts/` | One-off/build scripts (e.g. `force-extension-light-css.mjs`, `test-structure-feedback.ts`) |

### Major Modules

- **`app/(app)/`** — Main app layout and pages: dashboard, sessions, folders, discussion, settings, insights, session detail.
- **`app/(auth)/`** — Auth pages: login, signup.
- **`app/admin/`** — Admin dashboard: usage, customers, plans (admin layout gates with `/api/admin/me`).
- **`app/onboarding/`** — Onboarding and activate (demo) flows.
- **`app/api/`** — All Next.js API route handlers (see Section 2).

### API Routes (location only; details in Section 2)

- `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`
- `app/api/feedback/route.ts`, `app/api/feedback/counts/route.ts`
- `app/api/tickets/[id]/route.ts`
- `app/api/billing/usage/route.ts`
- `app/api/plans/catalog/route.ts`
- `app/api/workspace/status/route.ts`
- `app/api/admin/me/route.ts`, `app/api/admin/plans/route.ts`, `app/api/admin/workspaces/route.ts`, `app/api/admin/workspaces/actions/route.ts`, `app/api/admin/update-plan/route.ts`, `app/api/admin/usage/route.ts`
- `app/api/insights/route.ts`, `app/api/session-insight/route.ts`
- `app/api/structure-feedback/route.ts`
- `app/api/upload-screenshot/route.ts`, `app/api/upload-attachment/route.ts`
- `app/api/cron/cleanup-temp-screenshots/route.ts`

### Components

- **Layout:** `GlobalRail`, `FloatingUtilityActions`, `AppLayoutClient`, `DashboardHeader`, `AdminLayout`, operating-system layout (FourZoneLayout, ContextPanel, TicketList, etc.).
- **Dashboard:** `WorkspaceCard`, `FolderCard`, `SessionsHeader`, `SessionsTableView`, `MoveSessionsModal`, `DragSessionContext`, `ToastContext`, `CommandCenterHeader`, skeletons.
- **Session/Feedback:** `SessionHeader`, `FeedbackDetail`, `FeedbackContent`, `ActivityThread`, `ActivityComposer`, `ExecutionModeActionSteps`, etc.
- **Billing:** `UpgradeModal`, `UsageMeter`.
- **Discussion:** `DiscussionList`, `DiscussionThread`, `DiscussionPanel`, `DiscussionFeed`, `TicketDetailsPanel`, `AttachmentUploadModal`.
- **Capture widget:** `CaptureWidget`, `CaptureHeader`, `SessionContext`, `FeedbackList`, `useCaptureWidget`, etc.
- **Demo/Onboarding:** `DemoGuide`, `DemoArrow`, `ExtensionPopup`, `WorkspaceForm`, `StepIndicator`.
- **Workspace:** `WorkspaceSuspendedGuard`.

### Hooks

- **`lib/hooks/useBillingUsage.ts`** — Fetches `/api/billing/usage`, subscribes to workspace via `listenToWorkspace`, refetches on workspace change.
- **`lib/hooks/usePlanCatalog.ts`** — Client-side Firestore `onSnapshot(collection(db, "plans"))` with fallback from code defaults.
- **`lib/hooks/useAuthGuard.ts`** — Uses auth state and `clearAuthTokenCache`.

### Repositories

- **`lib/repositories/usersRepository.ts`** — User CRUD, `getUserWorkspaceIdRepo`, `ensureUserWorkspaceLinkRepo`, `getUserByIdRepo`.
- **`lib/repositories/workspacesRepository.ts`** — Workspace CRUD, `getWorkspace`, `listenToWorkspace`, `updateWorkspacePlanRepo`.
- **`lib/repositories/sessionsRepository.ts`** — Session CRUD, `getWorkspaceSessionCountRepo`, `getWorkspaceSessionsRepo`, `getUserSessionsRepo`, view tracking, delete cascade.
- **`lib/repositories/feedbackRepository.ts`** — Feedback CRUD, pagination, counts, session counters.
- **`lib/repositories/commentsRepository.ts`** — Comments CRUD, session-scoped queries.
- **`lib/repositories/screenshotsRepository.ts`** — Screenshot records (TEMP/ATTACHED), temp cleanup query.

### Domain Models

- **`lib/domain/workspace.ts`** — `Workspace`, `WorkspaceDoc`, `defaultWorkspaceDoc`.
- **`lib/domain/session.ts`** — `Session`, `SessionCreatedBy`.
- **`lib/domain/feedback.ts`** — `Feedback`, `StructuredFeedback`, `TicketStatus`, `getTicketStatus`.
- **`lib/domain/comment.ts`** — `Comment`, `CommentAttachment`, `CommentPosition`, etc.
- **`lib/domain/signal.ts`**, **`lib/domain/feedback-display.ts`** — Supporting types.

### Utilities

- **`lib/utils/`** — `logger`, `time`, `date`, `formatCommentDate`.
- **`lib/authFetch.ts`** — Authenticated fetch with token cache, timeout, redirect on `WORKSPACE_SUSPENDED`.
- **`lib/querySafety.ts`** — `assertQueryLimit` for repository queries.
- **`lib/scrollToFeedback.ts`**, **`lib/playDoneClick.ts`**, **`lib/playShutterSound.ts`**, **`lib/highlightElement.ts`** — UI/UX helpers.

### Admin Modules

- **`lib/admin/adminLogs.ts`** — `logAdminAction` writes to `adminLogs` collection.
- **`lib/admin/types.ts`** — `PlanDoc`, `AdminLogDoc`.
- **`lib/server/requireAdmin.ts`** — `requireAdmin(userId)` (used by `/api/admin/me`).
- **`lib/server/adminAuth.ts`** — `requireAdmin(request)`, `isAdminUser(uid)` (used by other admin APIs).

### Billing Modules

- **`lib/billing/plans.ts`** — `PlanId`, `PLANS`, `DEFAULT_PRICES`, `UPGRADE_PLAN`.
- **`lib/billing/getPlanCatalog.ts`** — Server-side plan catalog from Firestore with in-memory cache and TTL.
- **`lib/billing/getWorkspaceEntitlements.ts`** — Resolves workspace entitlements from catalog + stored overrides.
- **`lib/billing/getWorkspacePlanState.ts`** — Central plan state (limits, usage, permissions).
- **`lib/billing/getWorkspaceUsage.ts`** — Session count + member count for a workspace.
- **`lib/billing/checkPlanLimit.ts`** — Throws when limit reached (used at session creation).
- **`lib/billing/planLimitResponse.ts`** — Response body for limit-reached API.
- **`lib/billing/updateWorkspacePlan.ts`** — Wrapper around `updateWorkspacePlanRepo` (for dev/testing; APIs call repo directly).

---

## SECTION 2 — API Architecture

### Summary Table

| Route | Purpose | Auth | DB reads | DB writes | Dependencies |
|-------|---------|------|----------|-----------|--------------|
| **GET/POST /api/sessions** | List / create sessions | requireAuth | users, workspaces, sessions (list/count) | sessions, workspaces (usage) | checkPlanLimit, assertWorkspaceActive |
| **GET/PATCH/DELETE /api/sessions/[id]** | Get/update/delete session | requireAuth | sessions, users, workspaces | sessions | assertWorkspaceActive |
| **GET/POST /api/feedback** | List (paginated) / create feedback | requireAuth | sessions, feedback, workspaces | feedback, sessions (counters), screenshots | assertWorkspaceActive, serializeTicket |
| **GET /api/feedback/counts** | Counts for one session | requireAuth | sessions, feedback (counts), workspaces | — | assertWorkspaceActive |
| **GET/PATCH/DELETE /api/tickets/[id]** | Get/update/delete ticket | requireAuth | feedback, sessions, users, workspaces | feedback, sessions (counters/updatedAt) | assertWorkspaceActive, serializeTicket |
| **GET /api/billing/usage** | Plan, usage, limits | requireAuth (optional fallback) | users, workspaces, sessions (count) | — | getWorkspacePlanState, getWorkspaceEntitlements |
| **GET /api/plans/catalog** | Public plan catalog | None | — (server uses getPlanCatalog) | — | getPlanCatalog |
| **GET /api/workspace/status** | Suspended status | requireAuth | users, workspaces | — | — |
| **GET /api/admin/me** | Is current user admin | requireAuth | users (isAdmin) | — | requireAdmin(uid) from requireAdmin.ts |
| **GET/PATCH /api/admin/plans** | List/update plan docs | requireAdmin (adminAuth) | plans | plans | adminLogs, invalidatePlanCatalogCache |
| **GET /api/admin/workspaces** | List all workspaces + owner | requireAdmin | workspaces, users, sessions (count per ws) | — | — |
| **POST /api/admin/workspaces/actions** | set_plan, suspend, resume, etc. | requireAdmin | workspaces | workspaces | updateWorkspacePlanRepo, adminLogs |
| **POST /api/admin/update-plan** | Owner self-service plan change | requireAuth | workspaces | workspaces (via repo) | updateWorkspacePlanRepo, owner check |
| **GET /api/admin/usage** | Aggregate platform usage | requireAdmin | workspaces, sessions (count per ws) | — | — |
| **GET /api/insights** | User analytics | requireAuth | workspaces, feedback, comments, sessions | — | computeInsights, assertWorkspaceActive |
| **POST /api/session-insight** | AI session summary | requireAuth | sessions, feedback | sessions (aiInsightSummary) | OpenAI, assertWorkspaceActive |
| **POST /api/structure-feedback** | Voice/transcript → structured ticket | requireAuth | workspaces | — | runFeedbackPipeline, assertWorkspaceActive |
| **POST /api/upload-screenshot** | Upload screenshot for session | requireAuth | sessions, workspaces, screenshots | Storage, screenshots (create) | assertWorkspaceActive |
| **POST /api/upload-attachment** | Discussion file upload | requireAuth | — | Storage | — |
| **GET/POST /api/cron/cleanup-temp-screenshots** | Delete old TEMP screenshots | CRON_SECRET | screenshots | screenshots, Storage | — |

### Authentication

- **requireAuth (lib/server/auth.ts):** JWT verification via Firebase (jose + JWKS). Returns 401 if missing/invalid token.
- **requireAdmin (lib/server/adminAuth.ts):** requireAuth + Firestore `users/{uid}.isAdmin === true`. Used by admin/plans, admin/workspaces, admin/workspaces/actions, admin/usage.
- **requireAdmin (lib/server/requireAdmin.ts):** Takes `userId` (not Request). Used only by `/api/admin/me`; checks `getUserByIdRepo` and `user.isAdmin`. Inconsistent with other admin routes which use `adminAuth.requireAdmin(req)`.

### Database Reads/Writes (high level)

- **Reads:** users, workspaces, sessions, feedback, comments, plans, adminLogs, screenshots, sessionViews (for delete).
- **Writes:** users, workspaces, sessions, feedback, comments, plans, adminLogs, screenshots; Firebase Storage for uploads.

---

## SECTION 3 — Firestore Data Model

### Collections

| Collection | Schema / Fields | Relationships | Read/Write APIs |
|------------|-----------------|--------------|-----------------|
| **users** | uid, name, email, photoURL, workspaceId, isAdmin, createdAt, updatedAt, role?, companySize? | 1:1 workspace (via workspaceId) | Auth flow, onboarding, admin/me, admin/workspaces (owner lookup); usersRepository |
| **workspaces** | id (doc id), name, logoUrl, ownerId, members[], appearance, notifications, automations, permissions, ai, integrations, billing (plan, billingCycle, seats, stripe*, suspended), entitlements (maxSessions, maxMembers, insightsAccess, …), usage (sessionsCreated, feedbackCreated, members), createdAt, updatedAt | 1:N sessions, 1:N feedback (via workspaceId); owner → users | All workspace-aware APIs; workspacesRepository; admin/workspaces, admin/workspaces/actions |
| **sessions** | id (doc id), workspaceId, userId, title, archived, createdAt, updatedAt, createdBy, viewCount, commentCount, openCount, resolvedCount, skippedCount, feedbackCount, aiInsightSummary*, aiInsightSummaryFeedbackCount, aiInsightSummaryUpdatedAt | N:1 workspaces; 1:N feedback, 1:N comments; sessionViews subcollection | sessions API, feedback API, session-insight, upload-screenshot; sessionsRepository |
| **sessionViews/{sessionId}/views/{viewerId}** | viewedAt | N:1 sessions | recordSessionViewIfNew; delete on session delete |
| **feedback** | id, workspaceId, sessionId, userId, title, description, type, status, isResolved, isSkipped, createdAt, lastCommentAt, commentCount, … (contextSummary, actionSteps, suggestedTags, screenshotUrl, clarity*) | N:1 sessions, N:1 workspaces | feedback API, tickets API, insights, session-insight; feedbackRepository |
| **comments** | id, workspaceId, sessionId, feedbackId, userId, userName, userAvatar, message, type, position, textRange, threadId, resolved, attachment, createdAt | N:1 feedback, N:1 sessions | Comments (via commentsRepository); computeInsights |
| **plans** | Document ids: free, starter, business, enterprise. name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled | Referenced by workspaces.billing.plan and entitlements | getPlanCatalog, admin/plans, usePlanCatalog (client listener) |
| **screenshots** | id, status (TEMP|ATTACHED), createdAt, feedbackId?, storagePath | Optional N:1 feedback | upload-screenshot, feedback POST (updateScreenshotAttachedRepo), cron cleanup; screenshotsRepository |
| **adminLogs** | adminId, action, workspaceId?, metadata?, timestamp | — | adminLogs.logAdminAction (write only); no read API in app |

### Indexes (inferred)

- sessions: (workspaceId, updatedAt desc), (workspaceId, archived, updatedAt desc), (userId, updatedAt desc).
- feedback: (sessionId, …) for pagination/counts; (workspaceId) for discussion feed.
- comments: (sessionId, …) and/or (feedbackId, …) for recent comments.

---

## SECTION 4 — Workspace Architecture

### Workspace Creation

- **Onboarding:** User signs up → `ensureUserWorkspaceLinkRepo` (in auth/onboarding flow) creates or links user to workspace. If no workspace exists, transaction creates `workspaces/{workspaceId}` via `defaultWorkspaceDoc` and sets `users/{uid}.workspaceId`. Alternatively, `createWorkspaceRepo` is used with explicit name/logo (onboarding form); caller then sets user’s workspaceId.
- **Default workspace:** One workspace per user; `workspaceId` defaults to `user.uid` when not set.

### Workspace Membership

- Stored as `workspaces.members` array. Used for member count in billing/usage and admin views. No separate membership table; no invite/role APIs in scope.

### Workspace Billing

- **Plan:** `workspaces.billing.plan` (free | starter | business | enterprise).
- **Entitlements:** `workspaces.entitlements` (maxSessions, maxMembers, insightsAccess, …). Can be overridden by admin (e.g. override_session_limit, grant_unlimited_sessions) without changing plan.
- **Suspension:** `workspaces.billing.suspended` (boolean). Set by admin actions; enforced by `assertWorkspaceActive` in product APIs and by `WorkspaceSuspendedGuard` + `/api/workspace/status` on the client.

### Workspace Entitlements

- Resolved by `getWorkspaceEntitlements(workspace)`: merges Firestore plan catalog (with code fallback) and `workspace.entitlements`. Used by billing/usage API and by `checkPlanLimit` at session creation.

### Workspace Suspension

- Admin calls POST `/api/admin/workspaces/actions` with `action: "suspend"` or `"resume"`. Updates `workspaces/{id}.billing.suspended`. All product APIs that load workspace call `assertWorkspaceActive(workspace)` and return 403 with `WORKSPACE_SUSPENDED` body. Client `authFetch` redirects to `/workspace-suspended` on 403 + that error.

### Workspace Usage

- **Counters:** `workspaces.usage.sessionsCreated`, `feedbackCreated`, `members`. Incremented in transactions when creating session/feedback.
- **Active session count:** From `getWorkspaceSessionCountRepo` (sessions where workspaceId = X minus archived). Used for limit checks and billing/usage API.

### Data Flow

- **Repositories:** `getWorkspace(workspaceId)`, `listenToWorkspace(workspaceId, callback)` (used by settings page and useBillingUsage).
- **Billing resolver:** `getWorkspaceEntitlements` + `getWorkspacePlanState` use workspace doc + plan catalog + `getWorkspaceSessionCountRepo` / members length.
- **APIs:** Almost every product API resolves workspace via `getUserWorkspaceIdRepo` → `getWorkspace(workspaceId)` → `assertWorkspaceActive(workspace)`.
- **UI:** `useBillingUsage` subscribes to workspace and refetches `/api/billing/usage` when workspace changes. Settings page uses `listenToWorkspace` for live workspace state. `WorkspaceSuspendedGuard` polls `/api/workspace/status`.

---

## SECTION 5 — Billing System

### Plan Catalog

- **Server:** `getPlanCatalog()` in `lib/billing/getPlanCatalog.ts` reads Firestore `plans` collection, merges with code defaults (PLANS + DEFAULT_PRICES), caches in memory with TTL 60s. `invalidatePlanCatalogCache()` called after admin PATCH plans.
- **Client:** `/api/plans/catalog` returns array for public pricing/limits; `usePlanCatalog` subscribes directly to Firestore `plans` and builds same shape with code fallbacks.

### Plan Resolver

- **getWorkspaceEntitlements(workspace):** Returns effective limits (maxSessions, maxMembers, insightsAccess) from catalog + workspace.entitlements.
- **getWorkspacePlanState(workspaceId):** Returns planId, pricing, limits, usage (sessions, members), permissions (canCreateSession, canInviteMember). Used by `/api/billing/usage` when available.

### Workspace Entitlements

- Stored on workspace; admin can override (e.g. maxSessions = null for unlimited). Session creation uses `checkPlanLimit` which uses `getWorkspaceEntitlements`. Limit enforced only at create; reducing limit does not delete existing sessions.

### Plan Overrides

- Admin actions: `set_plan` (syncs entitlements from catalog), `override_session_limit`, `grant_unlimited_sessions`. All update `workspaces` and log to adminLogs.

### Session Limits

- Enforced in POST `/api/sessions`: `getWorkspaceSessionCountRepo` → `checkPlanLimit(workspace, "maxSessions", currentUsage)`. On PLAN_LIMIT_REACHED, returns 403 with body from `planLimitReachedBody`.

### Billing Usage API

- GET `/api/billing/usage`: requireAuth, then get workspace; if suspended returns 403; else returns plan, usage (activeSessions, sessionsCreated, members), limits. Prefers `getWorkspacePlanState` when available for canonical shape.

### Propagation: Admin → Firestore → Resolver → APIs → UI

- **Admin:** PATCH `/api/admin/plans` updates `plans` docs and invalidates server plan cache. POST `/api/admin/workspaces/actions` (set_plan, override_session_limit, etc.) updates `workspaces`.
- **Firestore:** `plans` and `workspaces` are source of truth.
- **Resolver:** getPlanCatalog (server) and getWorkspaceEntitlements / getWorkspacePlanState read Firestore (+ cache).
- **APIs:** Session creation uses checkPlanLimit; billing/usage returns resolver output.
- **UI:** useBillingUsage refetches on workspace change; usePlanCatalog listens to `plans`; UpgradeModal and UsageMeter consume usage/limits.

---

## SECTION 6 — Admin System

### Admin Authentication

- **Gate:** GET `/api/admin/me` returns `{ isAdmin: true }` only if user is authenticated and `requireAdmin(uid)` (from `lib/server/requireAdmin.ts`) succeeds — i.e. user doc has `isAdmin: true`. Admin layout uses this to show/hide admin nav and redirect.
- **API protection:** Other admin routes use `requireAdmin(req)` from `lib/server/adminAuth.ts` (Request-based, Firestore isAdmin check). So there are two different `requireAdmin` implementations (signatures and modules).

### Admin APIs

- **GET /api/admin/me** — Auth + isAdmin check (requireAdmin(uid)).
- **GET/PATCH /api/admin/plans** — List/update plan documents; PATCH merges into Firestore and logs to adminLogs, invalidates plan cache.
- **GET /api/admin/workspaces** — All workspaces with owner email/name and session count per workspace.
- **POST /api/admin/workspaces/actions** — set_plan, grant_unlimited_sessions, override_session_limit, reset_usage, suspend, resume.
- **POST /api/admin/update-plan** — Owner-only plan change (workspace.ownerId === user.uid); calls updateWorkspacePlanRepo.
- **GET /api/admin/usage** — Aggregate: totalWorkspaces, free/paid counts, totalSessions, totalFeedbackCaptured (iterates all workspaces, calls getWorkspaceSessionCountRepo per workspace).

### Plans Management

- Admin can edit plan name, prices, maxSessions, maxMembers, insightsEnabled. Stored in `plans` collection; server catalog and client use these values with code defaults as fallback.

### Customer Management

- Admin customers page lists workspaces via GET admin/workspaces; actions (plan change, suspend, etc.) via POST admin/workspaces/actions.

### Usage Analytics

- GET /api/admin/usage returns platform-wide counts; no per-workspace time-series in this API.

### Suspension System

- Admin suspend/resume updates `workspaces.{id}.billing.suspended`. assertWorkspaceActive in all product APIs blocks access and returns 403; client redirects to workspace-suspended page.

### How Admin Actions Affect Product

- **set_plan / update-plan:** Change billing.plan and sync entitlements → session limit and billing/usage reflect new plan.
- **override_session_limit / grant_unlimited_sessions:** Change entitlements only → immediate effect on limit checks and billing API.
- **reset_usage:** Zeroes usage counters (sessionsCreated, feedbackCreated); does not delete sessions.
- **suspend / resume:** Product APIs and UI treat workspace as blocked or allowed.

---

## SECTION 7 — Client Data Flow

### useBillingUsage

- On mount (when enabled): subscribes to auth state; then gets workspaceId (getUserWorkspaceIdRepo); subscribes to workspace via `listenToWorkspace(workspaceId, () => refetch())`; calls `refetch()` which GETs `/api/billing/usage`. So: one Firestore listener per workspace + one API call on init and on every workspace doc change. Plan/limit changes from admin are reflected when workspace doc changes.

### Workspace Listeners

- **useBillingUsage:** listenToWorkspace → refetch billing.
- **Settings page:** listenToWorkspace(workspaceId, setWorkspace) for live workspace settings.

### API Fetch Patterns

- **authFetch:** Used everywhere for authenticated calls. Adds Bearer token, handles timeout, on 403 with WORKSPACE_SUSPENDED redirects to /workspace-suspended.
- **Session/ticket flows:** SessionPageClient and hooks call authFetch for sessions, feedback, tickets, structure-feedback, session-insight. Multiple calls per page (list, counts, single ticket, etc.).

### React State Flow

- Dashboard: useWorkspaceOverview (sessions list, create session), useCommandCenterData; session page: useSessionFeedbackPaginated, useFeedbackDetailController, useFeedback (structure-feedback). Data is fetched per route/page; no global store; some duplication (e.g. same ticket fetched in list and detail).

### Duplicate Fetches

- **Session + workspace:** Many APIs first get user → getUserWorkspaceIdRepo → getWorkspace. Same workspace can be read repeatedly in one request chain (e.g. feedback route gets session then workspace).
- **Billing usage:** Fetched once by useBillingUsage; if multiple components need it, they may each rely on the same hook (no duplication if single provider), but any extra direct calls to /api/billing/usage would duplicate.
- **Feedback list + counts:** useSessionFeedbackPaginated fetches list and separately counts (or uses session.openCount/resolvedCount). Counts can be from session doc or from GET /api/feedback/counts.

### Unnecessary Re-renders

- listenToWorkspace in useBillingUsage triggers refetch on any workspace change; refetch updates state and re-renders. If workspace doc is updated often (e.g. usage counters), this could cause frequent re-renders for billing UI. Counters are on workspace but billing/usage API also uses getWorkspaceSessionCountRepo, so workspace.usage changes might not need to trigger refetch for “limits” view — depends on product intent.

### Inefficient Listeners

- **usePlanCatalog:** Real-time listener on entire `plans` collection. Plans change rarely; could be replaced with GET /api/plans/catalog and optional refetch or long TTL.
- **useBillingUsage:** Listener on single workspace doc is appropriate for plan/entitlement changes; refetch on every change is simple but may be more than needed if only non-billing fields change.

---

## SECTION 8 — Duplicate Logic

### 1. serializeSession

- **Locations:** `app/api/sessions/route.ts` and `app/api/sessions/[id]/route.ts` each define an identical `serializeSession(session)` (timestamp to ISO). Not shared.
- **Recommendation:** Move to shared module (e.g. `lib/server/serializeSession.ts` or next to serializeFeedback) and use in both routes.

### 2. serializeFeedback (local) vs serializeTicket

- **Feedback route:** Defines local `serializeFeedback(item)` for list/detail (createdAt/lastCommentAt to seconds). Also uses `serializeTicket` from `lib/server/serializeFeedback.ts` for single ticket response.
- **Tickets route:** Uses only `serializeTicket`. So “feedback” list uses a different serialization than “ticket” single; intentional for list shape but two code paths for similar data.

### 3. Plan definitions and catalog building

- **PLAN_ORDER:** Repeated in `app/api/plans/catalog/route.ts`, `lib/hooks/usePlanCatalog.ts` (same array).
- **PLAN_NAMES / buildDefaultCatalog:** In `lib/billing/getPlanCatalog.ts` (server) and `lib/hooks/usePlanCatalog.ts` (client): same PLAN_NAMES map and similar buildDefaultCatalog + merge-from-Firestore logic. Client duplicates server catalog logic.
- **Recommendation:** Single PLAN_ORDER (and optionally PLAN_NAMES) in `lib/billing/plans.ts`; client could use /api/plans/catalog instead of Firestore listener to avoid duplicating catalog merge logic.

### 4. Workspace resolution + assertWorkspaceActive

- **Pattern:** In almost every product API: getUserWorkspaceIdRepo → getWorkspace → assertWorkspaceActive. Repeated in sessions, sessions/[id], feedback, feedback/counts, tickets, upload-screenshot, session-insight, structure-feedback, insights, billing/usage, workspace/status. No shared helper that “resolve workspace for user and throw if suspended.”
- **Recommendation:** e.g. `getWorkspaceForUser(uid)` or `requireWorkspace(req)` that returns workspace or throws 403 with WORKSPACE_SUSPENDED body.

### 5. Session ownership / workspace check

- **Sessions [id] and tickets [id]:** After loading session/ticket, code resolves workspaceId (session.workspaceId ?? session.userId ?? getUserWorkspaceIdRepo…) then getWorkspace + assertWorkspaceActive. Session/ticket ownership is still checked by userId (session.userId === user.uid or ticket.userId === user.uid). So “forbidden” is by ownership, not by workspace membership. Logic is repeated across routes.

### 6. requireAdmin (two implementations)

- **lib/server/requireAdmin.ts:** `requireAdmin(userId: string)` — used by GET /api/admin/me only. Uses getUserByIdRepo, throws on !user or !user.isAdmin.
- **lib/server/adminAuth.ts:** `requireAdmin(request: Request)` — used by all other admin routes. Calls requireAuth(request) then Firestore isAdmin check. Same concept, different signatures and modules; easy to misuse (e.g. passing uid to one that expects Request).

---

## SECTION 9 — Dead Code

### Unused Components

- **components/modals/MoveToFolderModal.tsx** — Not imported anywhere. Dashboard and folders use `MoveSessionsModal` from `components/dashboard/MoveSessionsModal.tsx`. MoveToFolderModal appears to be an older or alternate implementation and is dead.
- **components/ui/ProductPreview.tsx** — No imports found in codebase. Dead unless used by a non-TS path or future feature.
- **components/ui/EchlyButton.tsx** — No imports found. Dead; other components use `Button` or inline styling.

### Unused Utilities / Modules

- **lib/billing/updateWorkspacePlan.ts** — Exports `updateWorkspacePlan(workspaceId, newPlan)`. No production code imports it; admin and update-plan routes call `updateWorkspacePlanRepo` directly. The file is a thin wrapper documented for “dev/testing”; can be removed or kept as a dev helper.
- **server/middleware/verifyFirebaseToken.ts** — Express middleware for Firebase token. Next.js API routes use `lib/server/auth.ts` (requireAuth). If there is no Express server in use, this middleware is dead.

### Unused APIs

- All listed API routes are referenced from app or extension (or cron). No clearly unused API route.

### Unused Types

- No systematic scan of exported types; likely some types in domain or components are only used internally. MoveToFolderModal’s props type is effectively dead with the component.

---

## SECTION 10 — Performance Risks

### 1. Admin usage: N+1 session counts

- GET /api/admin/usage iterates all workspace docs and for each calls `getWorkspaceSessionCountRepo(workspaceId)`. Each call runs two Firestore count queries (all sessions for workspace, archived sessions). For W workspaces this is 2W count queries. Should scale with workspace count.
- **Mitigation:** Consider batching or a single aggregation (e.g. maintained counter on workspace or periodic job that writes counts to workspace or a summary collection).

### 2. Admin workspaces list: N+1 owner and N+1 session count

- GET /api/admin/workspaces fetches all workspaces, then per workspace: getDoc(users, ownerId) and getWorkspaceSessionCountRepo(workspaceId). Same N+1 pattern.
- **Mitigation:** Batch user reads; consider caching or storing denormalized session count / owner email on workspace for admin list.

### 3. Multiple getWorkspace() calls per request

- Several APIs (e.g. feedback, tickets) load session then workspace, or load workspace more than once in the same handler. Extra read latency and cost.
- **Mitigation:** Resolve workspace once per request and pass through or use a small helper.

### 4. usePlanCatalog: Real-time listener on plans

- Client subscribes to entire `plans` collection. Plan docs change rarely; listener adds ongoing connection and re-renders on any change. Simpler and lighter to poll GET /api/plans/catalog or use SWR with long TTL.

### 5. useBillingUsage: Refetch on every workspace change

- Any update to workspace doc (including usage counters) triggers refetch. If usage is updated frequently, this can cause many GET /api/billing/usage calls. Billing/usage API already recomputes session count server-side, so refetch on every workspace change may be more than needed for “plan and limits” display.

### 6. computeInsights: Large query limits

- computeInsights uses high limits (e.g. 2000 feedback, 3000 comments, 500 sessions). Single GET /api/insights can be heavy for large workspaces. Consider pagination or capped aggregations.

### 7. Session insight: Up to 200 feedback items

- POST /api/session-insight fetches up to 200 feedback items and sends condensed text to OpenAI. Acceptable for a single request but heavy for very large sessions.

### 8. No request-level caching

- getPlanCatalog has in-memory cache with TTL. getWorkspace and other repo calls have no short-term request cache, so repeated reads in one request pay full Firestore cost.

### 9. Extension and web both call same APIs

- Extension uses fetch with Bearer token to same routes. Same backend load and patterns; no extra client-side duplication beyond normal usage.

---

## SECTION 11 — Security Audit

### Admin API Protection

- **Strong:** Admin routes (except /api/admin/me) use requireAdmin(req) from adminAuth, which verifies JWT and Firestore isAdmin. Only users with isAdmin can call these.
- **Weakness:** GET /api/admin/me uses a different requireAdmin(uid) and does not use the same Request-based flow; behavior is correct but having two implementations increases risk of mistake (e.g. a new admin route using the wrong one).
- **Recommendation:** Unify admin check: e.g. all admin routes use adminAuth.requireAdmin(req), and /api/admin/me call it and return { isAdmin: true }.

### Workspace Authorization

- **Current:** Most APIs resolve workspace from the authenticated user (getUserWorkspaceIdRepo). Session and ticket access are then gated by (1) session/ticket belonging to that workspace (or legacy userId match) and (2) assertWorkspaceActive. So a user can only act in their own workspace (or on resources they “own” by userId when workspace is not used).
- **Gap:** Session and ticket mutations check “session.userId === user.uid” or “ticket.userId === user.uid”, not “user is member of session’s/ticket’s workspace”. In a multi-member workspace, only the creator can edit/delete that session/ticket. This may be intentional (creator-only) but is a product/security design choice; if “any workspace member” should be allowed, authorization should be workspace-membership based.

### Billing Protection

- Session creation is correctly gated by checkPlanLimit and workspace active. Billing/usage API returns data for the user’s workspace only. Plan changes: admin-only (set_plan, override) or owner-only (update-plan). No obvious bypass.

### Suspension Enforcement

- assertWorkspaceActive is used in all product APIs that load workspace. Suspended workspace gets 403 and client redirects to /workspace-suspended. No observed bypass.

### Cron Protection

- /api/cron/cleanup-temp-screenshots checks CRON_SECRET (Bearer or x-cron-secret header). If CRON_SECRET is not set, the route still runs (no auth). Recommendation: require CRON_SECRET in production so unset env means 401.

### Token and Secrets

- Firebase project ID is hardcoded in lib/server/auth.ts. JWKS URL is public. No API keys or CRON_SECRET in repo (assumed env). Ensure .env and secrets are not committed.

---

## SECTION 12 — Code Quality

### Large Files

- **app/(app)/dashboard/[sessionId]/SessionPageClient.tsx** — Very large (1200+ lines): session layout, feedback list, ticket detail, structure-feedback submit, session-insight, keyboard nav, etc. Good candidate for splitting into smaller components or hooks.
- **lib/repositories/feedbackRepository.ts** — Large (600+ lines): many functions and query variants. Could be split by concern (CRUD vs counts vs pagination) or kept as single repo with clearer sections.
- **lib/analytics/computeInsights.ts** — Large (500+ lines): multiple metrics and queries. Could extract per-metric helpers or submodules.

### Overly Complex Modules

- **SessionPageClient:** Combines routing state, feedback list, ticket detail, capture flow, and API calls. Hard to test and reason about. Suggest extracting: useSessionPageData, TicketDetailPanel, FeedbackListPanel, and keep SessionPageClient as composition.
- **useCaptureWidget (CaptureWidget/hooks):** Long hook with many responsibilities; similar extraction of sub-hooks or state machines would help.

### Poor Separation of Concerns

- **API routes:** Each route inlines “get user → get workspace → assert active → do action”. Repeated pattern could be a middleware or helper (e.g. withWorkspace(req, handler)).
- **Plan catalog:** Logic duplicated between server (getPlanCatalog) and client (usePlanCatalog). Single source of truth (e.g. API + optional client cache) would simplify.

### Inconsistent Naming

- “Ticket” vs “Feedback”: APIs use both (/api/feedback vs /api/tickets/:id). Domain uses Feedback; UI uses “ticket” in places. Serializer is serializeTicket. Acceptable but could be aligned for clarity.

### requireAdmin Inconsistency

- Two modules and two signatures (userId vs Request) for the same concept; see Section 8.

---

## SECTION 13 — Dependency Analysis

### Dependencies (package.json)

- **Runtime:** next 16.1.6, react 19.2.3, firebase ^12.10.0, framer-motion, html2canvas, jose, lucide-react, openai, react-countup, recharts, tesseract.js, wavesurfer.js, next-themes.
- **Dev:** tailwind 4, postcss, types (node, react, chrome, express), esbuild, eslint, typescript.

### Unused Packages (suspected)

- **@types/express:** Used by server/middleware (verifyFirebaseToken). If Express server is not used in production, this and the middleware file could be removed together.
- **tesseract.js / wavesurfer.js:** Not verified in this audit; worth checking if still used (e.g. OCR, waveform UI). If unused, remove to reduce bundle size.

### Duplicate Functionality

- **next-themes** and **@fontsource** / **@fontsource-variable:** Both used; no overlap. Plus Jakarta Sans appears in both variable and static; could consolidate to one.

### Heavy Libraries

- **recharts:** Used for insights/dashboard charts. Reasonable for analytics.
- **framer-motion:** Used for animations. Moderate size.
- **tesseract.js:** Heavy if used; confirm necessity.
- **html2canvas:** Used for screenshots/capture; expected.

---

## SECTION 14 — Overall Architecture Summary

### Strengths

- Clear separation: repositories (Firestore), domain models, server auth, billing resolver, API routes.
- Workspace and billing model support plan overrides and suspension; enforcement is consistent (assertWorkspaceActive, checkPlanLimit at create).
- Single source of truth for plans (Firestore + code fallback); catalog cache and invalidation on admin update.
- Admin actions are logged (adminLogs); admin routes protected by isAdmin.
- Client uses authFetch with token cache and centralized redirect on suspension.

### Weaknesses

- Duplicate logic: serializeSession, plan catalog building (server + client), two requireAdmin implementations, repeated workspace-resolution pattern in APIs.
- Some dead code: MoveToFolderModal, ProductPreview, EchlyButton, updateWorkspacePlan wrapper, possibly Express middleware.
- Performance: N+1 in admin usage and admin workspaces list; no request-level caching for workspace/plan; usePlanCatalog listener may be heavier than needed.
- Large, multi-responsibility files: SessionPageClient, feedbackRepository, computeInsights.
- Authorization model (userId vs workspace membership) for sessions/tickets is strict (creator-only); document if intentional.

### Maintainability Rating: **6.5/10**

- Structure is understandable and domain-focused. Duplication and two requireAdmin paths hurt. Large components and repos will be harder to change safely.

### Performance Rating: **6/10**

- Single-workspace flows are acceptable. Admin analytics and list endpoints do not scale well with many workspaces. Client could reduce listeners and refetches.

### Security Rating: **7.5/10**

- Auth and admin checks are in place; suspension and plan limits enforced. Cron should require secret when set; admin API surface could be unified to reduce human error.

---

## SECTION 15 — Refactoring Opportunities (Suggestions Only)

### 1. Remove Duplication

- Extract **serializeSession** to a shared module and use in both session API routes.
- Introduce **requireWorkspaceForUser(uid)** (or withWorkspace middleware) that returns workspace or throws 403 with WORKSPACE_SUSPENDED; use it in all product APIs to replace repeated getUserWorkspaceIdRepo → getWorkspace → assertWorkspaceActive.
- Unify **requireAdmin**: use only adminAuth.requireAdmin(req) everywhere; have /api/admin/me call it and return { isAdmin: true }. Remove or deprecate requireAdmin(userId) in requireAdmin.ts.
- **Plan catalog:** Keep server as single source; client could call GET /api/plans/catalog with SWR or similar and remove usePlanCatalog’s Firestore listener and duplicate buildDefaultCatalog/merge logic. Optionally export PLAN_ORDER from plans.ts and use in API and client.

### 2. Improve Performance

- **Admin usage:** Avoid N+1 getWorkspaceSessionCountRepo. Options: store denormalized activeSessionCount on workspace (updated in transaction with session create/archive/delete), or run a single aggregation (e.g. Cloud Function or batch query) and cache result.
- **Admin workspaces list:** Batch getDoc(users, ownerId) and consider storing last known session count or owner email on workspace for list view.
- **usePlanCatalog:** Replace Firestore listener with GET /api/plans/catalog and refetch on window focus or after admin plan update (e.g. invalidate from admin UI).
- **useBillingUsage:** Consider refetching only when workspace.entitlements or workspace.billing change (e.g. by comparing in listener or by having backend expose a “billing version” or lastUpdated for billing fields) to avoid refetch on every usage counter update.

### 3. Simplify Architecture

- **SessionPageClient:** Split into smaller components (e.g. SessionShell, FeedbackListContainer, TicketDetailContainer) and hooks (useSessionData, useTicketActions, useStructureFeedback). Keep route page thin.
- **feedbackRepository:** Group functions (e.g. create/update/delete, counts, pagination) and consider splitting into feedbackRepository + feedbackCountsRepository or keep one file with clear section comments.
- **Cron:** Require CRON_SECRET when env is set; return 401 if secret is configured but missing in request.
- **Dead code:** Remove or archive MoveToFolderModal, ProductPreview, EchlyButton if not planned for use. Remove or clearly mark as dev-only updateWorkspacePlan wrapper and Express verifyFirebaseToken if no Express server is used.

### 4. Security and Consistency

- Document that session/ticket edit/delete is “creator-only” (userId) and that workspace.members is not used for this. If product should allow “any workspace member,” add membership checks and align APIs.
- Unify admin authentication (single requireAdmin) and document how to grant admin (users.{uid}.isAdmin).

### 5. Types and Naming

- Consider aliasing “ticket” to “feedback” (or vice versa) in API and UI for consistency; or keep both but document the mapping in one place.

---

**End of Report.** No code was modified; this document is analysis and recommendation only.
