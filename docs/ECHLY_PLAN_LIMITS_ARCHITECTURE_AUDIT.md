# Echly Plan Limits Architecture Audit

**Purpose:** Map how subscription plan limits (e.g. `max_sessions`) flow through the system and why admin updates to plan limits do not apply immediately.

**Audit date:** 2025-03-17

---

## 1. Architecture Overview

### High-level flow

- **Plans** are defined in two places:
  1. **Code:** `lib/billing/plans.ts` — static `PLANS` and `DEFAULT_PRICES` (fallback/defaults).
  2. **Database:** Firestore collection `plans` — admin-editable plan documents (id = plan key: free, starter, business, enterprise).

- **Workspaces** have:
  - `billing.plan` (plan id).
  - **`entitlements`** — a **stored copy** of plan-derived limits (`maxSessions`, `maxMembers`, `insightsAccess`, etc.). This is the **effective source** used for enforcement.

- **Session limit enforcement** happens only at **session creation**: `POST /api/sessions` loads the workspace, gets effective entitlements, and calls `checkPlanLimit(workspace, "maxSessions", currentSessionCount)` before creating a session. No pruning of existing sessions when limits are reduced.

- **Why admin plan changes don’t apply immediately:**  
  Admin edits in the **Plans** page update the Firestore **`plans`** collection only. The **effective limit** for each workspace is `workspace.entitlements.maxSessions ?? catalog[plan].maxSessions`. Because **workspace.entitlements** are set at workspace creation (from code) or when **set_plan** is run (from catalog at that time), they **override** the catalog. So changing the plan catalog does **not** update any existing workspace’s limit until that workspace’s entitlements are updated (e.g. via **set_plan** or **override_session_limit** per workspace).

---

## 2. Plan Storage

### 2.1 Database schema (Firestore)

- **Collection:** `plans`  
  - Document IDs: `free`, `starter`, `business`, `enterprise`.  
  - Fields (see `lib/admin/types.ts`): `name`, `priceMonthly`, `priceYearly`, `maxSessions`, `maxMembers`, `insightsEnabled`.

- **Collection:** `workspaces`  
  - Each document has:
    - `billing.plan` (string).
    - `entitlements`: `{ maxSessions?, maxMembers?, insightsAccess?, ... }` — **stored copy** of limits (and overrides).

There is no separate `subscription_plan` or `plan_limits` table; plan definitions live in `plans`, and per-workspace effective limits live in `workspaces.entitlements`.

### 2.2 ORM / model and types

| Location | Purpose |
|----------|---------|
| `lib/billing/plans.ts` | `PlanId`, `PlanConfig`, `PLANS` (static defaults), `DEFAULT_PRICES`, `UPGRADE_PLAN`. |
| `lib/admin/types.ts` | `PlanDoc` (Firestore plan document shape). |
| `lib/domain/workspace.ts` | `Workspace` type including `billing.plan` and `entitlements` (maxSessions, maxMembers, etc.). |
| `lib/billing/getPlanCatalog.ts` | `PlanCatalogEntry`, `PlanCatalog`; builds catalog from Firestore `plans` + code defaults. |

### 2.3 Structure of plan limits

- **Plan-level (catalog):** For each plan id, limits are: `maxSessions`, `maxMembers`, `insightsEnabled` (and pricing). `null` means unlimited.
- **Workspace-level (effective):** `getWorkspaceEntitlements(workspace)` returns:
  - `maxSessions` = `workspace.entitlements?.maxSessions ?? catalog[plan].maxSessions`
  - `maxMembers` = `workspace.entitlements?.maxMembers ?? catalog[plan].maxMembers`
  - `insightsAccess` = same pattern.

So **workspace.entitlements** take precedence over the plan catalog. The catalog is used only when the workspace has no stored value for that field.

---

## 3. Session Limit Enforcement

### 3.1 Where session limits are checked

| File | Logic |
|------|--------|
| `app/api/sessions/route.ts` (POST) | Resolves workspace → gets `currentSessionCount` via `getWorkspaceSessionCountRepo(workspaceId)` → calls `checkPlanLimit({ workspace, metric: "maxSessions", currentUsage: currentSessionCount })` → on `PLAN_LIMIT_REACHED` returns 403 with `planLimitReachedBody(err)`. Only on success calls `createSessionRepo(...)`. |
| `lib/billing/checkPlanLimit.ts` | `checkPlanLimit(params)`: gets entitlements via `getWorkspaceEntitlements(params.workspace)`, reads `entitlements[params.metric]` (e.g. maxSessions), compares to `params.currentUsage`; if over limit, throws `PlanLimitError` with code `PLAN_LIMIT_REACHED`. |
| `lib/billing/getWorkspaceEntitlements.ts` | Returns effective limits: `workspace.entitlements` overrides, else plan catalog (from `getPlanCatalog()`). |

No other code paths enforce session limits (e.g. no `checkSessionLimit`, `sessionQuota` elsewhere for creation).

### 3.2 Request flow (session creation)

1. **Client** (dashboard or extension) sends `POST /api/sessions` with auth (cookie or extension Bearer token).
2. **Auth:** `requireAuth(req)` (cookie or extension token verification).
3. **Workspace resolution:** `resolveWorkspaceForUser(user.uid)` → `getUserWorkspaceIdRepo(uid)` → `getWorkspace(workspaceId)` → `assertWorkspaceActive(workspace)`.
4. **Limit check:** `getWorkspaceSessionCountRepo(workspaceId)` → `checkPlanLimit({ workspace, metric: "maxSessions", currentUsage })` → inside that, `getWorkspaceEntitlements(workspace)` (which uses **workspace.entitlements** first, then catalog).
5. If limit not reached: `createSessionRepo(workspaceId, user.uid, null)` → Firestore transaction (create session doc + increment workspace usage).
6. Response: `{ success: true, session: { id } }` or 403 with `{ error: "PLAN_LIMIT_REACHED", message, upgradePlan }`.

So the **only** place that enforces `max_sessions` is **POST /api/sessions**; the plan/limit used there is loaded via **workspace** (from DB) and **getWorkspaceEntitlements** (workspace.entitlements then catalog).

---

## 4. Caching Locations

### 4.1 Server-side plan catalog cache

| Location | Behavior |
|----------|----------|
| `lib/billing/getPlanCatalog.ts` | In-memory `cachedCatalog` and `lastFetchTime`. TTL = 60 seconds (`CACHE_TTL_MS = 60_000`). `getPlanCatalog()` returns cache if within TTL, else fetches from Firestore `plans` and updates cache. `invalidatePlanCatalogCache()` clears cache (called after admin PATCH plans). |

So: plan catalog is cached for up to 60s; after admin PATCH, cache is invalidated so the next request gets fresh catalog. This only affects the “fromPlan” path when **workspace.entitlements** does not define the limit.

### 4.2 Workspace document

- **Not cached** in API routes. Each `POST /api/sessions` calls `resolveWorkspaceForUser` → `getWorkspace(workspaceId)` → fresh `getDoc` from Firestore. So the workspace (and its `entitlements`) are read from DB on every request.

### 4.3 JWT / tokens (no plan limits)

| Token | Location | Contents |
|-------|----------|----------|
| Session cookie (`echly_session`) | `lib/server/session.ts` | Signed payload: `uid`, `email`, `name`. No plan or limits. |
| Extension token | `app/api/extension/session/route.ts` | Payload: `uid`, `email`, `type: "extension"`. No plan or limits. |

So plan limits are **not** embedded in JWTs; they are computed on the server from workspace + catalog.

### 4.4 Client-side (dashboard)

| Location | Behavior |
|----------|----------|
| `lib/authFetch.ts` | Caches Firebase ID token (for API calls) by expiry; no plan/limits. |
| `lib/hooks/useBillingUsage.ts` | Fetches `/api/billing/usage` and subscribes to `listenToWorkspace(workspaceId, () => refetch())`. So when the **workspace** doc changes in Firestore, limits/usage refetch. No local cache of limits; display comes from API. |
| `lib/hooks/usePlanCatalog.ts` | Fetches `/api/plans/catalog` on mount; used for display (e.g. settings). No persistence; refetch on mount only. |

So dashboard limits are not “cached” in a way that would block admin updates; they refetch when the workspace doc changes or on load.

### 4.5 Extension

- Extension calls `POST /api/sessions` with Bearer token; it does **not** store or check plan limits locally. Limit is enforced entirely by the backend. No `chrome.storage` or in-memory cache of limits for session creation.

### 4.6 Summary of caching impact

- **Plan catalog:** 60s server cache; invalidated on admin PATCH plans. Only used when workspace has no stored entitlement for that limit.
- **Effective limit:** Comes from **workspace.entitlements** (stored on workspace doc) first, then catalog. Workspace is read from DB per request (no server cache). So the main reason limits “don’t update” is **workspace.entitlements** not being updated when the admin changes the plan catalog, not JWT or extension cache.

---

## 5. Root Cause: Why Plan Limit Updates Do Not Apply Immediately

### 5.1 Intended vs actual behavior

- **Intended:** Changing plan limits in the admin dashboard (e.g. changing “max sessions” for the Free plan) should apply to all workspaces on that plan.
- **Actual:** The limit used at session creation is **workspace.entitlements.maxSessions ?? catalog[plan].maxSessions**. Workspace documents have **entitlements** set at creation (from code) or when **set_plan** is run (from catalog at that time). The admin **Plans** page only updates the **`plans`** collection; it does **not** update any **workspace.entitlements**.

So:

1. **Workspace-stored entitlements override the catalog.**  
   So long as `workspace.entitlements.maxSessions` is set (which it is for all workspaces created with default doc or after set_plan), the catalog value is ignored.

2. **Admin “Plans” flow only updates the catalog.**  
   PATCH `/api/admin/plans` updates Firestore `plans` and invalidates the plan catalog cache. It does **not** update any `workspaces` document. So no workspace’s effective limit changes.

3. **Plan catalog cache (60s)** can delay updates only when a workspace has **no** stored entitlement for that metric. In practice, workspaces do have stored entitlements, so (1) and (2) are the dominant cause.

### 5.2 Root cause statement

**Root cause:** Effective session limits are determined by **workspace.entitlements** (and only fall back to the plan catalog when a value is missing). When an admin changes plan definitions in the **Plans** page, only the **plan catalog** (`plans` collection) is updated. **No workspace documents are updated.** Therefore, existing workspaces keep their previously stored entitlements and the new plan limits do not apply until each workspace’s entitlements are updated (e.g. by running **set_plan** or **override_session_limit** for that workspace).

---

## 6. Correct Architecture (Target)

### 6.1 Principle

- **Database as source of truth:** For enforcement, the backend should derive limits from the database on every relevant request, without relying on stale copies stored on workspace documents for “plan definition” changes.
- **Session creation flow** should be:
  1. Request session creation.
  2. Backend loads workspace from DB (for plan id and any explicit overrides).
  3. Backend loads **current** plan limits from the plan catalog (or a single source of truth) from DB.
  4. Backend computes effective limit (explicit workspace override if present, else plan definition from DB).
  5. Backend counts active sessions from DB.
  6. Backend enforces limit and returns response.

So: plan definition changes (e.g. in `plans` collection) should affect all workspaces on that plan **without** requiring per-workspace entitlement updates, unless the workspace has an explicit override.

### 6.2 Recommended direction

- **Option A (minimal change):** Keep storing **overrides** on the workspace (e.g. `entitlements.maxSessions` only when admin sets an override). For non-overridden fields, **always** use the **current** plan catalog from DB (with short TTL or no cache for limit checks). So: effective limit = `workspace.entitlements.maxSessions ?? catalog[plan].maxSessions`, but catalog is always fresh (or very short TTL) for the enforcement path, and catalog is updated by admin Plans page. Then “change plan limit in admin” applies on next request for all workspaces without overrides.
- **Option B (clearer model):** Treat workspace as holding only **overrides** (e.g. `overrideSessionLimit: number | null`). Effective limit = override if set, else catalog[plan].maxSessions. Same as A but with clearer naming and no “synced copy” of full entitlements from plan.
- **Option C (full derivation):** Do not store plan-derived limits on workspace at all. Always compute from plan catalog by workspace.billing.plan; store only explicit overrides (e.g. “unlimited sessions” or “custom cap”). Then plan catalog changes apply immediately for all workspaces; only overrides need to be stored and invalidated when needed.

All of these make the **plan catalog** (DB) the source of truth for plan definitions and make **workspace** only carry overrides, so admin plan changes apply immediately except where an override exists.

---

## 7. Implementation Plan (High-Level)

### 7.1 Files to touch

- `lib/billing/getWorkspaceEntitlements.ts` — logic for effective limit (catalog vs override).
- `lib/billing/getPlanCatalog.ts` — optional: reduce or remove TTL for the enforcement path, or add a “no cache” path for limit checks.
- `lib/domain/workspace.ts` / `lib/repositories/workspacesRepository.ts` — if moving to “overrides only”, adjust shape and updates.
- `app/api/admin/plans/route.ts` — already invalidates catalog; optionally trigger workspace entitlement refresh if you keep a “synced copy” model during transition.
- `app/api/admin/workspaces/actions/route.ts` — ensure override_session_limit / set_plan only write overrides or a clear “synced from catalog” semantics.

### 7.2 Logic to change

- **Entitlement resolution:** Ensure that for “maxSessions” (and similarly other limits), the value used is **override from workspace if present, else current plan catalog from DB**. Today the catalog is already used as fallback, but workspace.entitlements are populated for all workspaces (so they always “win”). Either:
  - Stop populating/storing plan-derived defaults on workspace (only store overrides), or
  - When admin updates plan catalog, either invalidate cache and ensure enforcement path uses catalog when there is no explicit override (e.g. treat “not set” as “use catalog” and only write to workspace on set_plan or explicit override).
- **Cache:** For the code path that serves `checkPlanLimit` / session creation, either:
  - Use a very short TTL or no cache for `getPlanCatalog()`, or
  - Call `invalidatePlanCatalogCache()` on PATCH admin/plans (already done) and ensure workspace.entitlements are not used as “synced copy” for plan defaults (only for overrides).

### 7.3 New/updated flow

1. **Admin updates plan (PATCH /api/admin/plans):**  
   Update `plans` collection, call `invalidatePlanCatalogCache()`. No need to update all workspaces if effective limit is “override ?? catalog” and overrides are only set when admin explicitly sets them.

2. **Session creation (POST /api/sessions):**  
   Unchanged flow, but effective limit = workspace override (if any) else **current** catalog[workspace.billing.plan]. So either:
   - Don’t store catalog-derived defaults on workspace (only overrides), or
   - Treat “no override” as “use catalog” and only write overrides to workspace (set_plan could still sync for backward compat, but “default” workspaces would rely on catalog).

3. **Billing/usage API:**  
   Continue to use same effective limit (override ?? catalog) so UI shows correct limits and usage.

---

## 8. Test Plan (Verification Checklist)

Use this to verify that plan limit updates apply immediately and that the extension and dashboard behave correctly.

### 8.1 Prerequisites

- Admin user, test workspace on a plan with a known session limit (e.g. Free with max 3 sessions).
- Ability to create sessions from dashboard and from extension.

### 8.2 Steps

1. **Baseline**
   - Note current plan and max_sessions for the test workspace (from admin or settings/billing).
   - Create sessions until at limit; confirm next creation returns 403 and (if implemented) plan limit message in UI/extension.

2. **Admin: change plan limit (catalog)**
   - In admin dashboard, open Plans and increase max_sessions for the plan (e.g. Free: 3 → 5). Save.
   - **Expected (after fix):** Without logging out or re-saving the workspace, create a new session (dashboard and/or extension). New session should be created (new limit applies).
   - **Current (before fix):** New session creation may still fail with limit reached until workspace entitlements are updated (e.g. set_plan for that workspace).

3. **Admin: decrease limit**
   - Decrease max_sessions (e.g. 5 → 2). Save.
   - Create a new session until at new limit; next creation should return 403.
   - Existing sessions above the new limit should remain (no automatic deletion).

4. **Override_session_limit (per-workspace)**
   - In admin, set override_session_limit for the test workspace to a specific number (or unlimited).
   - Create sessions from dashboard and extension; behavior should match the override.
   - Remove override (if supported); behavior should fall back to plan catalog.

5. **Extension**
   - With limit reached, trigger “Start new session” from extension; expect 403 and, if implemented, limit message in extension UI.
   - After raising limit (catalog or override), create session from extension; expect success and new session id.

6. **Dashboard**
   - Settings/billing (or equivalent) should show updated limits and usage after catalog or override change, especially with `useBillingUsage` and workspace listener (refetch on workspace change).

7. **Cache**
   - After changing plan in admin, within 60s, create session and confirm new limit applies (if catalog cache is shortened or bypassed for enforcement).

---

## 9. Reference: Key File Locations

| Concern | File(s) |
|---------|--------|
| Plan model (code) | `lib/billing/plans.ts` |
| Plan Firestore types | `lib/admin/types.ts` (PlanDoc) |
| Workspace type / entitlements | `lib/domain/workspace.ts` |
| Plan catalog (fetch + cache) | `lib/billing/getPlanCatalog.ts` |
| Effective entitlements | `lib/billing/getWorkspaceEntitlements.ts` |
| Session limit check | `lib/billing/checkPlanLimit.ts` |
| Session creation API | `app/api/sessions/route.ts` (POST) |
| Workspace resolution | `lib/server/resolveWorkspaceForUser.ts` |
| Workspace CRUD | `lib/repositories/workspacesRepository.ts` |
| Session repo (create, count) | `lib/repositories/sessionsRepository.ts` |
| Admin: update plan catalog | `app/api/admin/plans/route.ts` (PATCH) |
| Admin: workspace actions (set_plan, override_session_limit) | `app/api/admin/workspaces/actions/route.ts` |
| Admin: owner update-plan | `app/api/admin/update-plan/route.ts` |
| Extension token | `app/api/extension/session/route.ts` |
| Extension createSession | `echly-extension/src/content.tsx` (createSession → POST /api/sessions) |
| 403 plan limit body | `lib/billing/planLimitResponse.ts` |
| Billing usage API | `app/api/billing/usage/route.ts` |
| Dashboard billing hook | `lib/hooks/useBillingUsage.ts` |

---

*End of audit.*
