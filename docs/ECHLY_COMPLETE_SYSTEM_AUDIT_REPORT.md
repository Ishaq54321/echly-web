# Echly — Complete System Audit Report

**Scope:** Plans, billing, workspace entitlements, session limits, admin dashboard, session creation, Firestore reads/writes.  
**Constraint:** Analysis only; no code or file changes.

---

## 1. System Architecture Overview

### Subsystems and communication

| Subsystem | Role | Communicates with |
|-----------|------|-------------------|
| **Admin dashboard** | Edit plan docs (Firestore `plans`), workspace actions (set plan, overrides, suspend). Auth via session cookie + `requireAdmin`. | Backend API (`/api/admin/plans`, `/api/admin/workspaces`, `/api/admin/workspaces/actions`) → Firestore `plans`, `workspaces`, `adminLogs`. |
| **Backend API routes** | Auth (Firebase ID token, extension token, or session cookie), resolve workspace, enforce limits, read/write Firestore. | Firestore (plans, workspaces, sessions, users, feedback, etc.); called by app, extension, admin. |
| **Firestore** | Persistence for plans, workspaces, sessions, users, feedback, comments, folders, screenshots, adminLogs, sessionViews, instructionGraphs. | Read/written by API routes and by some **client** code (dashboard: folders; sessions page: folders read). |
| **App dashboard** | Web app: dashboard, folders, settings, billing UI. Uses `authFetch` (Firebase ID token or session). | Backend API (sessions, billing/usage, plans/catalog, feedback, etc.); **direct Firestore** for folders (getDocs, addDoc, updateDoc, deleteDoc). |
| **Chrome extension** | Widget: create session, list sessions, submit feedback. Auth via extension token from `/api/extension/session` (dashboard session → JWT). | Backend API only (no direct Firestore). All calls go through background script with `Authorization: Bearer <extensionToken>`. |
| **Billing system** | Plan catalog (code + Firestore), entitlements (catalog + workspace overrides), usage (session/member counts). | `lib/billing/*`: getPlanCatalog, getWorkspaceEntitlements, getWorkspacePlanState, checkPlanLimit. Used by API routes and indirectly by UI. |
| **Session system** | Create/list/update/delete sessions. Creation only via `POST /api/sessions`; limit enforced there. | `lib/repositories/sessionsRepository`: createSessionRepo, getWorkspaceSessionCountRepo, etc. Used only by API. |

### Example flows

- **Admin plan change**  
  Admin UI → `PATCH /api/admin/plans` → `setDoc(ref, payload, { merge: true })` on `plans/{id}`. No cache; next `getPlanCatalog()` reads Firestore and merges with code defaults.

- **App dashboard session creation**  
  Dashboard or folders page → `authFetch("/api/sessions", { method: "POST" })` → `POST /api/sessions` → `resolveWorkspaceForUser` → `checkPlanLimit` → `createSessionRepo` → Firestore `sessions` + `workspaces` (usage increment).

- **Extension session creation**  
  Content script → `apiFetch("/api/sessions", { method: "POST" })` → background adds Bearer token → same `POST /api/sessions` → same limit check and repo.

- **Dashboard limit display**  
  `useBillingUsage` → `authFetch("/api/billing/usage")` → backend uses `getWorkspacePlanState` (which uses `getWorkspaceEntitlements` + catalog) → returns `limits.maxSessions` etc. → UsageMeter / ProfileCommandPanel.

---

## 2. Firestore Schema Map

### Collections (and subcollections)

| Collection | Fields (key ones) | Read by | Write by |
|------------|-------------------|---------|----------|
| **plans** | name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled | `lib/billing/getPlanCatalog.ts`, `app/api/admin/plans/route.ts` (GET) | `app/api/admin/plans/route.ts` (PATCH → setDoc merge) |
| **workspaces** | name, ownerId, members, billing.plan, billing.suspended, entitlements.maxSessions, entitlements.maxMembers, entitlements.insightsAccess, usage.*, updatedAt, ... | workspacesRepository (getWorkspace, listenToWorkspace), getWorkspaceUsage, admin routes, migrateWorkspaceEntitlementsToOverrides | workspacesRepository (setDoc, updateDoc), admin/workspaces/actions (updateDoc), sessionsRepository (createSessionRepo: usage increment), migrateWorkspaceEntitlementsToOverrides |
| **sessions** | workspaceId, userId, title, archived, createdAt, updatedAt, createdBy, viewCount, commentCount, openCount, resolvedCount, feedbackCount | sessionsRepository (getWorkspaceSessionsRepo, getWorkspaceSessionCountRepo, getSessionRepo, etc.), feedbackRepository, resolveAllOpenFeedbackInSession, SessionPageClient (getDoc), analytics | sessionsRepository (createSessionRepo via addDoc/set, updateDoc, deleteDoc), feedbackRepository (sessionRef) |
| **users** | workspaceId (linked workspace), ... | usersRepository, adminAuth, admin/workspaces (getDoc for owner) | usersRepository (setDoc, updateDoc) |
| **feedback** | sessionId, workspaceId, status, ... | feedbackRepository, DiscussionFeed, useSessionFeedbackPaginated, resolveAllOpenFeedbackInSession, computeInsights | feedbackRepository (setDoc, addDoc, updateDoc, deleteDoc), resolveAllOpenFeedbackInSession |
| **comments** | sessionId, ... | commentsRepository, computeInsights | commentsRepository (updateDoc, deleteDoc) |
| **folders** | name, sessionIds (array), ... | app/(app)/dashboard/page.tsx (getDocs), app/(app)/dashboard/sessions/page.tsx (getDocs), app/(app)/folders/[folderId]/page.tsx (getDoc, onSnapshot, updateDoc) | app/(app)/dashboard/page.tsx (addDoc, updateDoc, deleteDoc), app/(app)/folders/[folderId]/page.tsx (updateDoc) — **client-side** |
| **screenshots** | sessionId, ... | screenshotsRepository | screenshotsRepository |
| **adminLogs** | adminId, action, workspaceId?, metadata?, timestamp | — | lib/admin/adminLogs.ts (addDoc) |
| **sessionViews** | (subcollection: sessions/{id}/views/{viewerId}) | sessionsRepository (getDoc, getDocs for delete flow) | sessionsRepository (setDoc, deleteDoc) |
| **instructionGraphs** | — (collection); subcollection **nodes** per sessionId | lib/graph/instructionGraphEngine.ts | lib/graph/instructionGraphEngine.ts |

### Client-side Firestore usage

- **Dashboard** (`app/(app)/dashboard/page.tsx`): `getDocs(collection(db, "folders"))`, `addDoc(collection(db, "folders"), ...)`, `updateDoc`, `deleteDoc` on folders.
- **Folders page** (`app/(app)/folders/[folderId]/page.tsx`): `getDoc`, `onSnapshot`, `updateDoc` on `doc(db, "folders", folderId)` (and target folder for move).
- **Sessions page** (`app/(app)/dashboard/sessions/page.tsx`): `getDocs(collection(db, "folders"))` (read-only).

Plans, workspaces, sessions, and billing are **not** written by the client; only folders are written from the app (and only by dashboard + folder page).

---

## 3. Plan Sources

### Where plan limits are defined

1. **Code defaults — `lib/billing/plans.ts`**
   - `PlanId`: `"free" | "starter" | "business" | "enterprise"`.
   - `PLANS`: static `PlanConfig` (maxSessions, maxMembers, insightsAccess) per plan.
   - `DEFAULT_PRICES`: priceMonthly, priceYearly.
   - Used as base in `getPlanCatalog()` and in admin GET/PATCH (defaultPlanDoc).

2. **Firestore `plans` collection**
   - Documents: `free`, `starter`, `business`, `enterprise`.
   - Fields: name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled.
   - Written by: `PATCH /api/admin/plans` (setDoc merge).
   - Read by: `getPlanCatalog()` (getDocs) and GET `/api/admin/plans`.

3. **Workspace overrides — `workspaces/{id}.entitlements`**
   - Optional overrides: `maxSessions`, `maxMembers`, `insightsAccess`.
   - Written by: admin workspace actions `override_session_limit`, `grant_unlimited_sessions` (and migration script).
   - Not a “plan definition”; they override the plan-derived value for that workspace only.

### How sources interact

- **getPlanCatalog()** (used everywhere for “plan” limits):
  - Builds catalog from code `PLANS` + `DEFAULT_PRICES` (buildDefaultCatalog).
  - Fetches Firestore `plans` and merges: for each plan id, if Firestore has a value for a field (e.g. maxSessions), it overrides the code default; otherwise keeps code default.
  - So: **Firestore plans override code defaults**; code is fallback and structure.
- **Effective limit for a workspace**:
  - Plan catalog (above) gives per-plan limits.
  - `getWorkspaceEntitlements(workspace)` returns: `workspace.entitlements.maxSessions ?? catalog[plan].maxSessions` (and same for maxMembers, insightsAccess).
  - So: **workspace overrides override catalog**; catalog is default per plan.

There is no separate “plan catalog cache”; every call to `getPlanCatalog()` hits Firestore. Admin plan changes therefore apply on next backend read (no cache invalidation needed).

---

## 4. Session Creation Paths

### Single backend path

All session creation goes through **POST /api/sessions**:

- **App dashboard (main)**  
  - Client: `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` → `handleCreateSession` → `authFetch("/api/sessions", { method: "POST" })`.  
  - API: `app/api/sessions/route.ts` POST → `resolveWorkspaceForUser` → `getWorkspaceSessionCountRepo` → `checkPlanLimit(workspace, "maxSessions", currentSessionCount)` → on success `createSessionRepo(workspaceId, user.uid, null)`.

- **Folders page**  
  - Client: `app/(app)/folders/[folderId]/page.tsx` → `handleCreateSession` → `authFetch("/api/sessions", { method: "POST" })`.  
  - API: same as above.

- **Extension**  
  - Client: `echly-extension/src/content.tsx` → `createSession()` → `apiFetch("/api/sessions", { method: "POST", ... })` (token from background).  
  - API: same POST handler; extension auth via `verifyExtensionToken` in `requireAuth`.

So there is **one** session creation path: POST /api/sessions. **checkPlanLimit** always runs before createSessionRepo (when workspace is present). createSessionRepo is only called from this route (no other callers).

### Repository

- `lib/repositories/sessionsRepository.ts`: `createSessionRepo(workspaceId, userId, createdBy)`.
  - Writes one new doc in `sessions` and updates `workspaces/{workspaceId}` with `usage.sessionsCreated` increment in a transaction.

---

## 5. Limit Enforcement Flow

### Effective session limit formula

1. **Workspace plan**  
   `plan = workspace.billing?.plan ?? "free"` (PlanId).

2. **getPlanCatalog()**  
   Returns catalog: for each PlanId, maxSessions (and other fields) from code defaults merged with Firestore `plans` docs (Firestore overrides code when present).

3. **getWorkspaceEntitlements(workspace)**  
   - Catalog entry for `plan`: `fromCatalog.maxSessions = catalog[plan].maxSessions`.  
   - Override: `overrides = workspace.entitlements`.  
   - Effective: `maxSessions = overrides?.maxSessions !== undefined ? overrides.maxSessions : fromCatalog.maxSessions`.

4. **checkPlanLimit({ workspace, metric: "maxSessions", currentUsage })**  
   - Calls `getWorkspaceEntitlements(workspace)` → gets effective `maxSessions`.  
   - If limit is `null` → unlimited, return.  
   - If `currentUsage < limit` → return.  
   - Else throw PlanLimitError (PLAN_LIMIT_REACHED, upgradePlan from `UPGRADE_PLAN[plan]`).

5. **Current usage**  
   `getWorkspaceSessionCountRepo(workspaceId)`: count of sessions with `workspaceId` minus count where `archived === true` (active sessions).

So: **effective limit = workspace.entitlements.maxSessions ?? catalog[workspace.billing.plan].maxSessions**, and enforcement is **current active session count < that limit**.

---

## 6. Admin Plan Flow

### How plan changes reach Firestore and backend

1. **Admin UI**  
   `app/admin/plans/page.tsx`: loads plans via GET `/api/admin/plans`, user edits fields (e.g. maxSessions), clicks Save → PATCH `/api/admin/plans` with `{ id, name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled }`.

2. **PATCH /api/admin/plans**  
   `app/api/admin/plans/route.ts`: requireAdmin, parse body, build payload (only defined fields), `setDoc(doc(db, "plans", id), payload, { merge: true })`, then logAdminAction to `adminLogs`.

3. **No cache**  
   Plans are not cached. `getPlanCatalog()` reads Firestore every time. So after PATCH, the next backend call that uses getPlanCatalog (e.g. getWorkspaceEntitlements, GET /api/billing/usage, POST /api/sessions) sees the new values.

4. **Dashboard seeing new limits**  
   `useBillingUsage` calls GET `/api/billing/usage`, which uses `getWorkspacePlanState` → getWorkspaceEntitlements → getPlanCatalog. So updated plan limits show on next usage fetch. `useBillingUsage` also subscribes to workspace via `listenToWorkspace(workspaceId, () => refetch())`, so workspace changes (e.g. plan or overrides) trigger refetch; plan-only changes rely on refetch or next load.

---

## 7. Workspace Overrides (entitlements)

### How overrides are written

- **Admin customers UI**  
  `app/admin/customers/page.tsx`: “Override session limit” → `runAction(selected.id, "override_session_limit", { sessionLimit: number | null })`; “Grant unlimited” → `runAction(selected.id, "grant_unlimited_sessions", {})`.  
  Both call POST `/api/admin/workspaces/actions` with `{ workspaceId, action, ...body }`.

- **POST /api/admin/workspaces/actions**  
  `app/api/admin/workspaces/actions/route.ts`:  
  - `grant_unlimited_sessions`: `updateDoc(ref, { "entitlements.maxSessions": null, updatedAt })`.  
  - `override_session_limit`: `updateDoc(ref, { "entitlements.maxSessions": sessionLimit, updatedAt })`.  
  Comments state: only updates entitlements; does not delete sessions; limit enforced only at POST /api/sessions.

### How overrides affect limits

- In **getWorkspaceEntitlements**:  
  `maxSessions = overrides?.maxSessions !== undefined ? overrides.maxSessions : fromCatalog.maxSessions`.  
  So an explicit `entitlements.maxSessions` (including `null` for “unlimited”) overrides the plan catalog for that workspace. If admin never sets an override, only catalog applies.

---

## 8. Dashboard Limit Display

### Flow

1. **useBillingUsage** (`lib/hooks/useBillingUsage.ts`)  
   - On auth + workspace: subscribes to `listenToWorkspace(workspaceId, () => refetch())` and calls `authFetch("/api/billing/usage")`.  
   - Returns `{ data, loading, error, refetch }`; `data` has `plan`, `usage` (activeSessions, sessionsCreated, members), `limits` (maxSessions, maxMembers).

2. **GET /api/billing/usage**  
   - `resolveWorkspaceForUser` → then either:
     - Prefer `getWorkspacePlanState(workspaceId)` and return its `planId`, `limits`, `usage`, or  
     - Fallback: `getWorkspaceSessionCountRepo`, `getWorkspaceEntitlements(workspace)` and build same shape.  
   - Limits in response are always from entitlements (catalog + overrides), so UI shows the same effective limits used for enforcement.

3. **UsageMeter**  
   `components/billing/UsageMeter.tsx`: uses `useBillingUsage()`, displays `data.usage.activeSessions` / `data.limits.maxSessions` and members.

4. **ProfileCommandPanel**  
   Uses `useBillingUsage`, shows limit (e.g. “3 / 3 sessions”) and unlimited state.

5. **UpgradeModal**  
   Uses `useBillingUsage({ enabled: open })`, uses `usageData.limits?.maxSessions` for upgrade messaging.

So the UI receives limit values only from the backend via GET `/api/billing/usage`, which uses the same entitlement resolution as session creation.

---

## 9. Extension Flow

### Auth

- Extension does not use Firebase Auth in the client. User logs in on the **web app**; session cookie (`echly_session`) is set.
- To use the extension: user opens dashboard (or a dedicated tab), then extension obtains an **extension token**:
  - Background calls POST `/api/extension/session` with `credentials: "include"` (cookie sent).
  - Backend uses `getSessionUser(request)`; if valid, issues a short-lived JWT (extension token) and returns it.
  - If no session, backend returns 401; extension can open `/extension-auth` broker page; user logs in there; broker page POSTs for token and postMessages it to extension; extension stores token and closes tab.
- API calls from content script: `apiFetch` (in content) uses `authFetch`, which asks background for token via `ECHLY_GET_EXTENSION_TOKEN` and sends `Authorization: Bearer <token>`. Backend `requireAuth` accepts either Firebase ID token or extension token (`verifyExtensionToken`).

### Session creation and limit enforcement

- Content script `createSession()` calls `apiFetch("/api/sessions", { method: "POST", ... })`. Request goes to background (echly-api), which adds Bearer token and forwards to POST `/api/sessions`. Same handler runs: resolveWorkspaceForUser (by uid from extension token), checkPlanLimit, createSessionRepo. So **limit enforcement is identical** to the app.
- On 403 with `error: "PLAN_LIMIT_REACHED"`, extension shows upgrade UI in tray (`sessionLimitReached`); response includes `message` and `upgradePlan`.

### Other API usage

- GET `/api/sessions` (list), GET `/api/sessions?limit=1` (has sessions?), GET `/api/sessions/:id` (session details), PATCH `/api/sessions/:id` (e.g. title), and feedback/ticket endpoints — all go through same auth and backend; no direct Firestore in extension.

---

## 10. Architecture Conflicts and Issues

### Multiple plan sources (intended layering)

- **Not a conflict:** Code defaults + Firestore `plans` are merged intentionally (Firestore overrides code). Workspace `entitlements` override catalog. So there are two layers (catalog vs overrides), not two competing “sources of truth” for the same thing. The only nuance: if Firestore `plans` is empty or fails, code defaults are used and limits still work.

### Multiple session creation paths (unified)

- **No conflict:** All creation goes through POST /api/sessions; checkPlanLimit and createSessionRepo are in one place. Dashboard, folders page, and extension all call the same endpoint.

### Client-side Firestore writes

- **Present:** Dashboard and folders page write **folders** (addDoc, updateDoc, deleteDoc, arrayUnion/arrayRemove) directly from the client. Plans, workspaces, sessions, and billing are not written by the client. Impact: folder data can be modified without going through backend auth/checks; if folder rules are loose, that could be a consistency or security concern. Not duplicate logic for limits.

### Overrides and catalog

- **Override semantics:** If admin sets `override_session_limit` to a number (or grant_unlimited_sessions → null), that value wins over catalog. If admin later changes catalog maxSessions for the plan, workspaces **with** an override keep their override until admin clears or changes it. So “overrides blocking catalog changes” is by design: overrides are per-workspace and take precedence. No bug, but behavior should be clear (e.g. in admin UI: “this workspace has a custom limit”).

### Duplicate APIs

- **GET plans:**  
  - GET `/api/admin/plans` (admin): returns plans for admin UI (Firestore + code defaults).  
  - GET `/api/plans/catalog`: returns catalog for app (e.g. settings/pricing).  
  Both ultimately use the same Firestore `plans` + code; admin uses its own merge in the route, app uses getPlanCatalog(). Slight duplication of “merge with code defaults” (admin route vs getPlanCatalog) but same data source.

- **Workspace plan update:**  
  - POST `/api/admin/workspaces/actions` with `action: "set_plan"` → updateWorkspacePlanRepo.  
  - POST `/api/admin/update-plan` (body: workspaceId, newPlan) → same updateWorkspacePlanRepo.  
  Two entry points for “set workspace plan”; both write only `billing.plan`. Redundant but not conflicting.

### Unused / migration logic

- **migrateWorkspaceEntitlementsToOverrides / migrate-workspace-entitlements:**  
  Script/API to remove redundant entitlement fields that duplicated catalog values (so catalog is single source and overrides are explicit). After migration, no duplicate storage of “plan default” on workspace.

### Summary table

| Issue | Severity | Notes |
|-------|----------|--------|
| Client-side folder writes | Low | Only folders; limits/plans/sessions not affected. |
| Two “set plan” APIs | Low | Redundant; consider deprecating one. |
| Admin vs public plan merge logic | Low | Same Firestore; minor code duplication. |
| Overrides vs catalog | None | By design; overrides win. |

---

## 11. Real Execution Flow (Diagram)

```
Admin plan change (maxSessions)
    ↓
Admin UI: PATCH /api/admin/plans { id, maxSessions, ... }
    ↓
Firestore: setDoc(plans/{id}, payload, { merge: true })
    ↓
(No cache; next backend read uses new data)

Backend plan resolution (any request that needs limits)
    ↓
getPlanCatalog() → getDocs(plans) + merge with PLANS
    ↓
getWorkspaceEntitlements(workspace) → catalog[plan].maxSessions or workspace.entitlements.maxSessions
    ↓
Session creation (user clicks “New session” in app or extension)
    ↓
POST /api/sessions
    ↓
resolveWorkspaceForUser → getWorkspace(workspaceId)
getWorkspaceSessionCountRepo(workspaceId)  ← active session count
checkPlanLimit(workspace, "maxSessions", currentUsage)
    ↓
getWorkspaceEntitlements(workspace) → limit
if limit != null && currentUsage >= limit → 403 PLAN_LIMIT_REACHED
else createSessionRepo(workspaceId, userId, null)
    ↓
Firestore: add session doc, update workspaces/{id} usage.sessionsCreated
    ↓
Limit display (dashboard)
    ↓
useBillingUsage → GET /api/billing/usage
    ↓
getWorkspacePlanState → getWorkspaceEntitlements → limits
    ↓
Response: { plan, usage, limits: { maxSessions, maxMembers } }
    ↓
UsageMeter / ProfileCommandPanel render used vs limit
```

---

## 12. Key File References

| Concern | Files |
|--------|--------|
| Plan definitions (code) | `lib/billing/plans.ts` (PlanId, PLANS, DEFAULT_PRICES, UPGRADE_PLAN) |
| Plan catalog (runtime) | `lib/billing/getPlanCatalog.ts` (Firestore read + merge with PLANS) |
| Workspace entitlement resolver | `lib/billing/getWorkspaceEntitlements.ts` (catalog + workspace.entitlements) |
| Session limit enforcement | `lib/billing/checkPlanLimit.ts`; used only in `app/api/sessions/route.ts` (POST) |
| Session repository (create + count) | `lib/repositories/sessionsRepository.ts` (createSessionRepo, getWorkspaceSessionCountRepo) |
| Admin plan editing | `app/admin/plans/page.tsx`, `app/api/admin/plans/route.ts` (GET/PATCH, Firestore plans) |
| Admin workspace overrides | `app/admin/customers/page.tsx` (runAction), `app/api/admin/workspaces/actions/route.ts` (grant_unlimited_sessions, override_session_limit) |
| Billing usage API | `app/api/billing/usage/route.ts` (getWorkspacePlanState / getWorkspaceEntitlements + usage) |
| Dashboard limit UI | `lib/hooks/useBillingUsage.ts`, `components/billing/UsageMeter.tsx`, `components/layout/ProfileCommandPanel.tsx` |
| Session creation API | `app/api/sessions/route.ts` (GET list, POST create with checkPlanLimit) |
| Workspace resolution | `lib/server/resolveWorkspaceForUser.ts`, `lib/repositories/workspacesRepository.ts` (getWorkspace), `lib/repositories/usersRepository.ts` (getUserWorkspaceIdRepo) |

---

## 13. Architecture Quality (Scores)

| Area | Score (1–5) | Notes |
|------|-------------|--------|
| **Billing architecture** | 4 | Single catalog (code + Firestore), clear override layer, getWorkspaceEntitlements used consistently. Minor: two “set plan” endpoints. |
| **Session enforcement** | 5 | One creation path (POST /api/sessions), checkPlanLimit always before createSessionRepo, no client-side session creation. |
| **Admin dashboard** | 4 | Plans and workspace actions clearly hit API → Firestore; no cache to invalidate. |
| **Firestore usage** | 3 | Client writes to folders only; plans/workspaces/sessions are server-only. Documented client Firestore use would help. |
| **API design** | 4 | Auth (Bearer + cookie) and workspace resolution are centralized; billing/usage and sessions are consistent. Small redundancy in admin plan/workspace APIs. |

---

## 14. Recommended Minimal Fixes

No rewrites; minimal, safe improvements:

1. **Single source of truth for plan limits**  
   Already achieved: effective limit = `workspace.entitlements.maxSessions ?? catalog[plan].maxSessions`, with catalog = code defaults + Firestore `plans`. No change required. Optional: document in one place (e.g. getWorkspaceEntitlements or a short ADR) that “plan defaults live in code + Firestore plans; workspace overrides live in workspace.entitlements.”

2. **Single path for session creation**  
   Already single path (POST /api/sessions). No change.

3. **Clear separation plan defaults vs overrides**  
   Already clear in code and domain (workspace.entitlements as overrides only). Optional: in admin customers UI, show when a workspace has an override (e.g. “Custom limit: 10” vs “Plan limit: 20”) to avoid confusion.

4. **No duplicated logic**  
   - Consider having GET `/api/admin/plans` call getPlanCatalog() (or a shared helper) instead of reimplementing “Firestore + code defaults” in the route, so merge logic lives in one place.  
   - Consider deprecating one of POST `/api/admin/update-plan` or `action: "set_plan"` in `/api/admin/workspaces/actions` and directing all “set plan” traffic through one endpoint.

5. **No unnecessary new files**  
   No new files recommended; only small refactors (optional shared plan merge, optional admin UX for overrides).

6. **Client Firestore**  
   Optional: add a short comment or doc listing which collections are written from the client (folders) and that plans/workspaces/sessions/billing are server-only, to avoid future accidental client writes on limits.

---

**End of audit.**
