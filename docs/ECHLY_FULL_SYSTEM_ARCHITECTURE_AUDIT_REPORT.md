# Echly Full System Architecture Audit Report

**Goal:** Map how Admin Dashboard, Backend APIs, Database, and App Dashboard interact. Identify all sources of truth for Plans, Billing, Session limits, Workspace entitlements, Usage, and Admin configuration. No code was modified—analysis and code references only.

**Audit date:** 2025-03-17

---

## 1. System Architecture Overview

### Major subsystems

| Subsystem | Location | Role |
|-----------|----------|------|
| **Admin Dashboard** | `app/admin/*`, `components/admin/*` | Plans CRUD, workspace actions (set_plan, override_session_limit, suspend, etc.), usage stats, customer list |
| **Backend API routes** | `app/api/*` | Auth, sessions (list/create), billing/usage, plans catalog, admin plans/workspaces/actions/usage, extension token |
| **Database** | Firestore | Collections: `plans`, `workspaces`, `sessions`, `users`, `feedback`, `comments`, `folders`, `screenshots`, `sessionViews`, `adminLogs` |
| **App Dashboard** | `app/(app)/dashboard/*`, `app/(app)/settings/*`, `app/(app)/folders/*` | Session list, create session (via API or direct repo), usage meters, plan selection |
| **Chrome extension** | `echly-extension/src/*` | Auth via POST `/api/extension/session`, session create via POST `/api/sessions`, feedback submit; no local limit enforcement |
| **Billing system** | `lib/billing/*` | Plan catalog (Firestore + code defaults), entitlements resolution, plan limit check, plan state for UI |
| **Session system** | `lib/repositories/sessionsRepository.ts`, `app/api/sessions/route.ts`, `lib/sessions.ts` | Create/list/update/delete sessions; limit enforced only on POST `/api/sessions` |

### Communication flow (high level)

```
Admin Dashboard (browser)
  → authFetch("/api/admin/plans") GET/PATCH
  → Backend API (requireAdmin) → Firestore "plans" (read/write)
  → PATCH calls invalidatePlanCatalogCache()

Admin Dashboard (customers)
  → authFetch("/api/admin/workspaces") GET
  → authFetch("/api/admin/workspaces/actions") POST (set_plan, override_session_limit, …)
  → Backend → Firestore "workspaces" (read + updateDoc entitlements/billing)

App Dashboard (create session)
  → authFetch("/api/sessions", { method: "POST" })  [dashboard, extension]
  → Backend: resolveWorkspaceForUser → getWorkspace → checkPlanLimit → createSessionRepo
  → Firestore "sessions" + workspace usage increment

App Dashboard (folders – create session) ⚠️
  → createSession(workspaceId, uid, createdBy) from lib/sessions (client bundle)
  → createSessionRepo() in browser → Firestore "sessions" directly
  → NO checkPlanLimit — bypasses API and session limit

Billing/limits display
  → GET /api/billing/usage (requireAuth)
  → getWorkspacePlanState(workspaceId) → getPlanCatalog + getWorkspaceEntitlements + getWorkspaceUsage
  → Returns plan, limits, usage to UI

Plan catalog (public/display)
  → GET /api/plans/catalog → getPlanCatalog() → Firestore "plans" + code defaults (cached 60s)
```

---

## 2. Database Schema Map

### Firestore collections

| Collection | Schema fields (key) | Read by | Written by |
|------------|---------------------|---------|------------|
| **plans** | Document IDs: `free`, `starter`, `business`, `enterprise`. Fields: `name`, `priceMonthly`, `priceYearly`, `maxSessions`, `maxMembers`, `insightsEnabled` (`lib/admin/types.ts` PlanDoc) | `lib/billing/getPlanCatalog.ts`, `app/api/admin/plans/route.ts` (GET) | `app/api/admin/plans/route.ts` (PATCH via setDoc merge) |
| **workspaces** | `name`, `logoUrl`, `ownerId`, `members[]`, `billing.{ plan, billingCycle, seats, stripeCustomerId, stripeSubscriptionId, suspended }`, `entitlements.{ maxSessions?, maxMembers?, insightsAccess?, … }`, `usage.{ sessionsCreated, feedbackCreated, members }`, `appearance`, `notifications`, `automations`, `permissions`, `ai`, `integrations`, `createdAt`, `updatedAt` | `lib/repositories/workspacesRepository.ts` (getWorkspace, listenToWorkspace), `app/api/admin/workspaces/route.ts`, `app/api/admin/workspaces/actions/route.ts`, `app/api/admin/usage/route.ts`, `lib/billing/getWorkspaceUsage.ts`, `lib/admin/migrateWorkspaceEntitlementsToOverrides.ts` | `lib/repositories/workspacesRepository.ts` (create, updateWorkspace*, updateWorkspacePlanRepo), `app/api/admin/workspaces/actions/route.ts` (updateDoc entitlements/billing/usage) |
| **sessions** | `workspaceId`, `userId`, `title`, `createdAt`, `updatedAt`, `createdBy`, `viewCount`, `commentCount`, `openCount`, `resolvedCount`, `feedbackCount`, `archived?` | `lib/repositories/sessionsRepository.ts` (getWorkspaceSessionsRepo, getWorkspaceSessionCountRepo, getSessionByIdRepo, getUserSessionsRepo), `app/api/sessions/route.ts` (GET), feedback/discussion code | `lib/repositories/sessionsRepository.ts` (createSessionRepo, updateDoc, deleteDoc), called from `app/api/sessions/route.ts` (POST) and from **client** `app/(app)/folders/[folderId]/page.tsx` via `lib/sessions.ts` → createSessionRepo |
| **users** | `email`, `name`, `workspaceId`, … | `lib/repositories/usersRepository.ts`, `app/api/admin/workspaces/route.ts`, `lib/server/adminAuth.ts` | `lib/repositories/usersRepository.ts` |
| **feedback** | (per feedback doc) | `lib/repositories/feedbackRepository.ts`, `lib/analytics/computeInsights.ts`, discussion components | `lib/repositories/feedbackRepository.ts` |
| **comments** | (per comment doc) | `lib/repositories/commentsRepository.ts`, `lib/analytics/computeInsights.ts` | `lib/repositories/commentsRepository.ts` |
| **folders** | `name`, `sessionIds[]` | `app/(app)/dashboard/page.tsx`, `app/(app)/folders/[folderId]/page.tsx` | `app/(app)/dashboard/page.tsx`, `app/(app)/folders/[folderId]/page.tsx` |
| **screenshots** | (per screenshot doc) | `lib/repositories/screenshotsRepository.ts` | `lib/repositories/screenshotsRepository.ts` |
| **sessionViews** | Subcollection `views` under sessionId | `lib/repositories/sessionsRepository.ts` | `lib/repositories/sessionsRepository.ts` |
| **adminLogs** | `adminId`, `action`, `workspaceId?`, `metadata?`, `timestamp` | — | `lib/admin/adminLogs.ts` (from admin API routes) |

---

## 3. Plan / Billing Code Map

Files that reference plan, plans, billing, subscription, limit, entitlement, usage, maxSessions, maxMembers:

| File | Purpose | Reads limits | Writes limits | Caches limits |
|------|---------|--------------|---------------|---------------|
| `lib/billing/plans.ts` | PlanId, PlanConfig, PLANS, DEFAULT_PRICES, UPGRADE_PLAN (code defaults) | — | — | N/A (static) |
| `lib/billing/getPlanCatalog.ts` | Build catalog from Firestore `plans` + code defaults | Yes (Firestore + PLANS) | No | Yes (in-memory, TTL 60s) |
| `lib/billing/getWorkspaceEntitlements.ts` | Effective limits: workspace.entitlements override else catalog | Yes | No | No |
| `lib/billing/getWorkspacePlanState.ts` | Plan state (limits, usage, permissions) for UI | Yes (catalog + entitlements + usage) | No | No |
| `lib/billing/checkPlanLimit.ts` | Throw PLAN_LIMIT_REACHED if usage >= limit | Yes (via getWorkspaceEntitlements) | No | No |
| `lib/billing/planLimitResponse.ts` | JSON body for 403 plan limit / plan required | No | No | No |
| `lib/billing/getWorkspaceUsage.ts` | Session count + member count for workspace | No (usage only) | No | No |
| `app/api/admin/plans/route.ts` | GET/PATCH plans (admin) | Yes (Firestore) | Yes (Firestore setDoc) | No |
| `app/api/admin/update-plan/route.ts` | POST update workspace plan (owner only) | Yes (getPlanCatalog) | Yes (updateWorkspacePlanRepo) | No |
| `app/api/admin/workspaces/actions/route.ts` | set_plan, override_session_limit, grant_unlimited_sessions, etc. | Yes (getWorkspace) | Yes (updateDoc workspaces) | No |
| `app/api/billing/usage/route.ts` | GET plan, usage, limits for current user | Yes (getWorkspacePlanState, getWorkspaceEntitlements) | No | No |
| `app/api/plans/catalog/route.ts` | GET public plan catalog | Yes (getPlanCatalog) | No | No (server cache in getPlanCatalog) |
| `app/api/sessions/route.ts` | GET list sessions; POST create session (enforces limit) | Yes (checkPlanLimit → getWorkspaceEntitlements) | No (createSessionRepo writes session) | No |
| `lib/repositories/workspacesRepository.ts` | getWorkspace, updateWorkspacePlanRepo, etc. | No | Yes (billing.plan, not entitlements in updateWorkspacePlanRepo) | No |
| `lib/domain/workspace.ts` | Workspace type (billing, entitlements) | — | — | No |
| `lib/admin/types.ts` | PlanDoc type for Firestore plans | — | — | No |
| `lib/hooks/useBillingUsage.ts` | Fetch /api/billing/usage, refetch on workspace listener | Yes (via API) | No | Client state only |
| `lib/hooks/usePlanCatalog.ts` | Fetch /api/plans/catalog on mount | Yes (via API) | No | Client state only |
| `components/billing/UsageMeter.tsx` | Display usage vs limits from useBillingUsage | Yes (display) | No | No |
| `components/billing/UpgradeModal.tsx` | Upgrade prompt UI | — | No | No |
| `components/CaptureWidget/SessionLimitUpgradeView.tsx` | Extension: show when 403 PLAN_LIMIT_REACHED | — | No | No |
| `app/admin/plans/page.tsx` | Admin UI: edit plans, PATCH /api/admin/plans | No (sends full plan) | No (API writes) | No |
| `app/admin/customers/page.tsx` | Admin UI: workspaces list, actions (set_plan, override, etc.) | No | No (API writes) | No |
| `app/admin/usage/page.tsx` | Admin UI: platform usage stats | No (API returns stats) | No | No |
| `app/(app)/settings/page.tsx` | Billing tab: usePlanCatalog, display plans | Yes (display) | No | No |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | handleCreateSession → POST /api/sessions, handle 403 | Yes (API enforces) | No | No |
| `lib/admin/migrateWorkspaceEntitlementsToOverrides.ts` | One-off: migrate workspace entitlements to override-only | Yes (getPlanCatalog) | Yes (workspaces) | No |
| `echly-extension/src/content.tsx` | createSession() → POST /api/sessions, handle 403 limitReached | Yes (API response) | No | No |
| `lib/server/assertWorkspaceActive.ts` | Throw if workspace suspended | No (billing.suspended) | No | No |

---

## 4. All Sources of Truth for Plan Limits

| Source | Where defined | Where used | Priority |
|--------|----------------|------------|----------|
| **Code defaults (PLANS)** | `lib/billing/plans.ts`: `PLANS`, `DEFAULT_PRICES` | `lib/billing/getPlanCatalog.ts` (buildDefaultCatalog), `app/api/admin/plans/route.ts` (defaultPlanDoc) | Fallback when Firestore plan doc missing or field missing |
| **Firestore `plans` collection** | Admin PATCH `/api/admin/plans` → setDoc(plans, id, payload) | `getPlanCatalog()` (fetchCatalogFromFirestore), admin GET `/api/admin/plans` | Overrides code defaults per plan id |
| **Workspace `entitlements`** | Admin actions: override_session_limit, grant_unlimited_sessions; historically set_plan could write limits (now only billing.plan) | `getWorkspaceEntitlements(workspace)`: if `entitlements.maxSessions` (etc.) !== undefined, use it; else use catalog[plan] | Override > catalog > code |
| **Plan catalog (runtime)** | `getPlanCatalog()`: Firestore `plans` merged with buildDefaultCatalog() | `getWorkspaceEntitlements`, `getWorkspacePlanState`, `checkPlanLimit`, `/api/billing/usage`, `/api/plans/catalog`, admin update-plan response | Single runtime view of plan limits (with 60s cache) |
| **Environment config** | Not used for plan limits | — | — |

**Priority order for effective limit:**  
1) `workspace.entitlements.maxSessions` (if !== undefined)  
2) `catalog[workspace.billing.plan].maxSessions` (from getPlanCatalog)  
3) Code default from PLANS (inside buildDefaultCatalog)

---

## 5. Admin Dashboard Flow

### UI → API → Firestore

| Flow | UI file | API route | Firestore |
|------|---------|-----------|-----------|
| **Plans page: load** | `app/admin/plans/page.tsx` → authFetch GET `/api/admin/plans` | `app/api/admin/plans/route.ts` GET: getDocs(plans), merge with code defaults | Read: `plans` |
| **Plans page: save** | Same page → PATCH `/api/admin/plans` body `{ id, name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled }` | PATCH: setDoc(plans, id, payload), logAdminAction, **invalidatePlanCatalogCache()** | Write: `plans`, `adminLogs` |
| **Customers: list** | `app/admin/customers/page.tsx` → GET `/api/admin/workspaces` | GET: getDocs(workspaces), getDoc(users) per owner, getWorkspaceSessionCountRepo | Read: `workspaces`, `users`, `sessions` (count) |
| **Customers: set_plan** | Same → POST `/api/admin/workspaces/actions` body `{ workspaceId, action: "set_plan", plan }` | updateWorkspacePlanRepo(workspaceId, plan) | Write: `workspaces` (billing.plan only) |
| **Customers: override_session_limit** | Same → body `{ workspaceId, action: "override_session_limit", sessionLimit }` | updateDoc(workspaces, workspaceId, { "entitlements.maxSessions": sessionLimit }) | Write: `workspaces` |
| **Customers: grant_unlimited_sessions** | Same → action "grant_unlimited_sessions" | updateDoc(…, "entitlements.maxSessions": null) | Write: `workspaces` |
| **Customers: suspend, resume** | Same → actions suspend, resume | updateDoc billing.suspended | Write: `workspaces` |
| **Usage page** | `app/admin/usage/page.tsx` → GET `/api/admin/usage` | getDocs(workspaces), getWorkspaceSessionCountRepo per workspace | Read: `workspaces`, `sessions` (count) |

---

## 6. Backend Plan Resolution Flow

### getPlanCatalog

- **File:** `lib/billing/getPlanCatalog.ts`
- **Logic:** buildDefaultCatalog() from PLANS + DEFAULT_PRICES → fetchCatalogFromFirestore() (getDocs(plans)) → merge Firestore fields into base (only if field !== undefined). Return cached value if now - lastFetchTime < 60_000; else fetch and set cache. invalidatePlanCatalogCache() clears cache (called after admin PATCH plans).

### getWorkspaceEntitlements

- **File:** `lib/billing/getWorkspaceEntitlements.ts`
- **Logic:** plan = workspace.billing?.plan ?? "free". catalog = await getPlanCatalog(). entry = catalog[plan] ?? catalog.free. fromCatalog = { maxSessions, maxMembers, insightsAccess } from entry. overrides = workspace.entitlements. Return { maxSessions: overrides?.maxSessions !== undefined ? overrides.maxSessions : fromCatalog.maxSessions, … } (same for maxMembers, insightsAccess). So entitlements are **override-only**; missing field uses catalog.

### getWorkspacePlanState

- **File:** `lib/billing/getWorkspacePlanState.ts`
- **Logic:** getWorkspace(workspaceId), getPlanCatalog(), getWorkspaceEntitlements(workspace), getWorkspaceUsage(workspaceId). planId from workspace.billing.plan. limits = { maxSessions, maxMembers } from entitlements. permissions = { canCreateSession: limits.maxSessions === null \|\| sessions < limits.maxSessions, canInviteMember: … }. Returns { planId, pricing, limits, usage, permissions }.

### checkPlanLimit

- **File:** `lib/billing/checkPlanLimit.ts`
- **Logic:** entitlements = await getWorkspaceEntitlements(workspace). limit = entitlements[metric]. If limit == null return. If currentUsage < limit return. Else throw PlanLimitError (PLAN_LIMIT_REACHED, upgradePlan from UPGRADE_PLAN).

### Overrides

- Admin can set workspace.entitlements.maxSessions (or null for unlimited) via override_session_limit or grant_unlimited_sessions. getWorkspaceEntitlements uses these only when !== undefined; otherwise catalog is used. So admin plan catalog changes apply to workspaces that have no override; overrides always win.

### Caching

- getPlanCatalog: in-memory cache 60s; invalidated on admin PATCH plans. No cache for getWorkspaceEntitlements or getWorkspacePlanState (they call getPlanCatalog and workspace from DB).

---

## 7. Session Enforcement Flow

### Where sessions are created

1. **POST /api/sessions**  
   - **File:** `app/api/sessions/route.ts`  
   - Flow: requireAuth → resolveWorkspaceForUser → getWorkspaceSessionCountRepo(workspaceId) → checkPlanLimit(workspace, "maxSessions", currentSessionCount) → on success createSessionRepo(workspaceId, user.uid, null). On PLAN_LIMIT_REACHED return 403 with planLimitReachedBody(err).  
   - **Limit enforced here.**

2. **Dashboard (main)**  
   - **File:** `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`  
   - handleCreateSession: authFetch("/api/sessions", { method: "POST" }). Handles 403 PLAN_LIMIT_REACHED and shows upgrade callback.  
   - **Uses API → enforced.**

3. **Extension**  
   - **File:** `echly-extension/src/content.tsx`  
   - createSession(): apiFetch("/api/sessions", { method: "POST", … }). If 403 and data.error === "PLAN_LIMIT_REACHED", returns { limitReached: true, message, upgradePlan }; else returns { id: data.session.id }.  
   - **Uses API → enforced.**

4. **Folders page (create session)**  
   - **File:** `app/(app)/folders/[folderId]/page.tsx` (client component)  
   - handleCreateSession: workspaceId = getUserWorkspaceIdRepo(currentUser.uid) ?? currentUser.uid; then **createSession(workspaceId, currentUser.uid, createdBy)** from `lib/sessions.ts`.  
   - **File:** `lib/sessions.ts`  
   - createSession calls createSessionRepo(workspaceId, userId, createdBy).  
   - In the **client bundle**, this runs in the browser and calls Firestore (createSessionRepo in sessionsRepository) **directly**. There is **no** call to POST /api/sessions and **no** checkPlanLimit.  
   - **Limit NOT enforced — architecture conflict.**

### maxSessions enforcement summary

- **Enforced only in:** POST /api/sessions (app/api/sessions/route.ts).
- **Bypassed when:** Creating a session from the folders page (client-side createSession → createSessionRepo).

---

## 8. Dashboard Limit Display Flow

### Data path

1. **useBillingUsage** (`lib/hooks/useBillingUsage.ts`): On auth, get workspaceId (getUserWorkspaceIdRepo), then listenToWorkspace(workspaceId, () => refetch()). refetch = authFetch("/api/billing/usage"). Sets data from JSON (plan, usage, limits).
2. **GET /api/billing/usage** (`app/api/billing/usage/route.ts`): requireAuth → resolveWorkspaceForUser → getWorkspacePlanState(workspaceId). If planState exists, return { plan, limits, usage }. Else fallback: getWorkspaceSessionCountRepo, getWorkspaceEntitlements, return { plan, usage, limits }.
3. **UsageMeter** (`components/billing/UsageMeter.tsx`): useBillingUsage() → displays data.usage.activeSessions / data.limits.maxSessions, data.usage.members / data.limits.maxMembers.
4. **usePlanCatalog** (`lib/hooks/usePlanCatalog.ts`): fetch("/api/plans/catalog") on mount → used in settings billing tab for plan cards and comparison (plan.maxSessions, plan.insightsEnabled, etc.).

So: limits reach the UI via GET /api/billing/usage → getWorkspacePlanState → getWorkspaceEntitlements + getPlanCatalog. No client-side limit cache that would block admin updates; workspace listener triggers refetch when workspace doc changes.

---

## 9. Extension Flow

### Session creation

- Extension content script (`echly-extension/src/content.tsx`) defines createSession(): POST to `/api/sessions` with apiFetch (Bearer token from background). Response: 200 + { success, session: { id } } or 403 + { error: "PLAN_LIMIT_REACHED", message, upgradePlan }. On 403, UI shows SessionLimitUpgradeView and upgrade CTA.
- **Limits are enforced on the backend only;** extension does not enforce limits locally. It only reflects API 403 and shows upgrade UI.

### Auth

- Background verifies dashboard session via POST `/api/extension/session` (credentials: include). Extension token is obtained from auth broker page (dashboard). All API calls use that token; session creation is always through POST /api/sessions.

---

## 10. Duplicate Logic / Architecture Conflicts

### A. Multiple session-creation paths

- **Conflict:** Sessions can be created via (1) POST /api/sessions (dashboard, extension) and (2) client-side createSession() on the folders page (lib/sessions → createSessionRepo). Path (2) **bypasses checkPlanLimit** and can exceed maxSessions.
- **Why it causes bugs:** Users can create sessions over the plan limit by using “New session” from a folder, while the same user would get 403 when using the main dashboard or extension.

### B. Two sources for “plan limits” (intended design, but cache nuance)

- **Design:** Catalog (Firestore + code) is source of truth; workspace.entitlements are overrides only. getWorkspaceEntitlements and admin PATCH + invalidatePlanCatalogCache are consistent.
- **Nuance:** getPlanCatalog has a 60s TTL. For 60s after an admin plan change, requests that use cached catalog see old limits unless workspace has an override. For workspaces without overrides, limit checks (e.g. at session creation) can use stale catalog until cache refresh or invalidate.

### C. Duplicate “plan list” merge logic

- **Conflict:** Admin GET `/api/admin/plans` builds plan list with defaultPlanDoc(id) and merges stored doc (stored?.maxSessions !== undefined ? stored.maxSessions : base.maxSessions). getPlanCatalog has buildDefaultCatalog() and fetchCatalogFromFirestore() with similar merge. Two places maintain “Firestore + code default” merge; must stay in sync.

### D. Owner-only vs admin-only plan update

- **POST /api/admin/update-plan:** Requires auth; only workspace owner can change plan (workspace.ownerId === user.uid). Updates billing.plan via updateWorkspacePlanRepo.
- **POST /api/admin/workspaces/actions** with action "set_plan": Requires requireAdmin. So: owner can change own workspace plan via update-plan; admin can change any workspace plan via actions. Two routes for “set plan”; different auth.

### E. Unused / redundant

- **lib/sessions.ts createSession:** Used by folders page only; it does not enforce limits. Either all session creation should go through an API that calls checkPlanLimit, or createSession (when used from client) should be removed and folders page should use POST /api/sessions.

---

## 11. System Diagram (Full Flow)

```
Admin edits plan (Plans page)
  → PATCH /api/admin/plans
  → setDoc(Firestore "plans", id, payload)
  → invalidatePlanCatalogCache()

Database (Firestore)
  ← plans (read by getPlanCatalog)
  ← workspaces (read by getWorkspace, getWorkspaceEntitlements uses workspace.entitlements)

Backend plan resolution
  → getPlanCatalog() [cache 60s or fresh after invalidate]
  → getWorkspaceEntitlements(workspace) [override else catalog]
  → checkPlanLimit(workspace, "maxSessions", currentUsage) in POST /api/sessions

Session enforcement
  → POST /api/sessions: resolveWorkspaceForUser → checkPlanLimit → createSessionRepo
  → Folders page: createSession() → createSessionRepo (no checkPlanLimit) ⚠️

Dashboard display
  → useBillingUsage → GET /api/billing/usage → getWorkspacePlanState
  → UsageMeter shows usage vs limits
  → usePlanCatalog → GET /api/plans/catalog for settings billing

Extension
  → createSession() in content → POST /api/sessions (enforced)
  → On 403 PLAN_LIMIT_REACHED → SessionLimitUpgradeView
```

---

## 12. Code Dumps (Relevant Categories)

### Plan definitions

```1:50:lib/billing/plans.ts
/**
 * Plan definitions for SaaS billing. Limits are flexible; change here without rewriting call sites.
 * null means unlimited.
 */
export type PlanId = "free" | "starter" | "business" | "enterprise";

export interface PlanConfig {
  maxSessions: number | null;
  maxMembers: number | null;
  insightsAccess: boolean;
}

export const DEFAULT_PRICES: Record<PlanId, { priceMonthly: number; priceYearly: number }> = {
  free: { priceMonthly: 0, priceYearly: 0 },
  starter: { priceMonthly: 19, priceYearly: 190 },
  business: { priceMonthly: 99, priceYearly: 990 },
  enterprise: { priceMonthly: 299, priceYearly: 2990 },
};

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { maxSessions: 3, maxMembers: 1, insightsAccess: false },
  starter: { maxSessions: 20, maxMembers: 5, insightsAccess: true },
  business: { maxSessions: null, maxMembers: 20, insightsAccess: true },
  enterprise: { maxSessions: null, maxMembers: null, insightsAccess: true },
};

export const UPGRADE_PLAN: Record<PlanId, PlanId | null> = {
  free: "starter", starter: "business", business: "enterprise", enterprise: null,
};
```

### Billing logic (entitlements + limit check)

- **getWorkspaceEntitlements:** `lib/billing/getWorkspaceEntitlements.ts` (full file ~37 lines) — plan from workspace, catalog from getPlanCatalog, return overrides ?? catalog per field.
- **checkPlanLimit:** `lib/billing/checkPlanLimit.ts` (full file ~42 lines) — getWorkspaceEntitlements, compare currentUsage to limit, throw PlanLimitError.
- **getWorkspacePlanState:** `lib/billing/getWorkspacePlanState.ts` (full file ~71 lines) — workspace, catalog, entitlements, usage → limits + permissions.

### Admin plan editing APIs

- **GET/PATCH plans:** `app/api/admin/plans/route.ts` — GET getDocs(plans) + merge defaults; PATCH setDoc(plans, id, payload), logAdminAction, invalidatePlanCatalogCache().
- **Workspace actions:** `app/api/admin/workspaces/actions/route.ts` — set_plan → updateWorkspacePlanRepo; grant_unlimited_sessions / override_session_limit → updateDoc(entitlements.maxSessions); suspend, resume → updateDoc.

### Session enforcement API

- **POST /api/sessions:** `app/api/sessions/route.ts` (lines 77–129) — resolveWorkspaceForUser, getWorkspaceSessionCountRepo, checkPlanLimit(maxSessions), on success createSessionRepo, on PLAN_LIMIT_REACHED return 403 planLimitReachedBody.

### Dashboard usage API

- **GET /api/billing/usage:** `app/api/billing/usage/route.ts` — requireAuth, resolveWorkspaceForUser, getWorkspacePlanState(workspaceId); if present return { plan, limits, usage }; else fallback with getWorkspaceSessionCountRepo + getWorkspaceEntitlements.

### Workspace entitlement logic

- **getWorkspaceEntitlements:** `lib/billing/getWorkspaceEntitlements.ts` — see above; override-only semantics.
- **updateWorkspacePlanRepo:** `lib/repositories/workspacesRepository.ts` (lines 137–151) — updateDoc(workspaces, workspaceId, { "billing.plan": newPlan, updatedAt }). Does not write entitlements.

### Plan catalog logic

- **getPlanCatalog:** `lib/billing/getPlanCatalog.ts` — buildDefaultCatalog from PLANS/DEFAULT_PRICES, fetchCatalogFromFirestore getDocs(plans) merge, cache 60s, invalidatePlanCatalogCache().
- **GET /api/plans/catalog:** `app/api/plans/catalog/route.ts` — getPlanCatalog(), return plans array.

---

## 13. Recommended Clean Architecture

### Single source of truth for plan limits

- **Keep:** Firestore `plans` as admin-editable source; code `PLANS`/`DEFAULT_PRICES` only as defaults when Firestore doc or field is missing.
- **Keep:** workspace.entitlements as **override-only** (no stored copy of full plan limits); getWorkspaceEntitlements(workspace) as the single resolver for effective limits.
- **Optional:** Shorten or remove getPlanCatalog TTL for the code path used by checkPlanLimit so admin plan changes apply on next request without relying only on invalidatePlanCatalogCache (e.g. 0 TTL for limit-check path or a dedicated “no cache” call).

### Admin dashboard updates propagate instantly

- **Already:** PATCH plans calls invalidatePlanCatalogCache(); workspace listener in useBillingUsage triggers refetch when workspace doc changes. So dashboard and usage UI get new limits after refresh or workspace update.
- **Recommendation:** Ensure all session creation goes through one path that uses getWorkspaceEntitlements so catalog + overrides are the only inputs.

### Dashboard and extension always read the same values

- **Already:** Both use GET /api/billing/usage (or catalog) and POST /api/sessions; backend uses getWorkspaceEntitlements. So when both use the API, they see the same limits.
- **Fix:** Remove the second creation path so they also **enforce** the same limits.

### Concrete recommendations

1. **Remove client-side session creation that bypasses the API**  
   - **File to change:** `app/(app)/folders/[folderId]/page.tsx`.  
   - **Action:** Replace createSession(workspaceId, currentUser.uid, createdBy) with authFetch("/api/sessions", { method: "POST" }), then use returned session id and add it to the folder (and handle 403 PLAN_LIMIT_REACHED like useWorkspaceOverview).  
   - **Optional:** Stop exporting createSession for client use from `lib/sessions.ts` (or make it a server-only helper that is never called from client code). Do not call createSessionRepo from the client.

2. **Single API for creating sessions**  
   - All session creation (dashboard, folders, extension) should go through POST /api/sessions so checkPlanLimit is always run. No direct createSessionRepo from the browser.

3. **Consider reducing or bypassing plan catalog cache for limit checks**  
   - Option A: Add getPlanCatalogNoCache() used only by checkPlanLimit (or by POST /api/sessions).  
   - Option B: Lower CACHE_TTL_MS for getPlanCatalog so admin plan changes propagate within a few seconds even without PATCH invalidate.

4. **Keep one merge logic for “plan doc + code default”**  
   - Prefer getPlanCatalog (and its buildDefaultCatalog + fetchCatalogFromFirestore) as the single implementation. Admin GET /api/admin/plans could call getPlanCatalog() and return that, instead of reimplementing merge in the route (or document that both must stay in sync).

5. **Document owner vs admin plan change**  
   - Keep POST /api/admin/update-plan (owner) and POST /api/admin/workspaces/actions set_plan (admin) but document in code or API docs when to use which (self-serve vs support).

6. **No files to remove**  
   - Keep lib/billing/plans.ts, getPlanCatalog, getWorkspaceEntitlements, checkPlanLimit, getWorkspacePlanState, planLimitResponse, getWorkspaceUsage. Keep admin and billing API routes. Remove only the **usage** of createSession (from lib/sessions) in the folders client page and replace with API call; the function can remain for server-side use if needed elsewhere.

---

**End of report.**
