# Echly SaaS — Admin & Billing System Audit Report

**Purpose:** Technical documentation of how Admin dashboard actions propagate through the system, and identification of inconsistencies between Admin and the product dashboard.  
**Scope:** Analysis and documentation only — no code was modified.

---

## SECTION 1 — ADMIN DASHBOARD STRUCTURE

### Route map

| Route | File location | React component | API routes used | Firestore collections | Mutations |
|-------|----------------|-----------------|------------------|------------------------|-----------|
| `/admin` | `app/admin/page.tsx` | Default page (static) | None | None | None |
| `/admin/plans` | `app/admin/plans/page.tsx` | `AdminPlansPage` | `GET /api/admin/plans`, `PATCH /api/admin/plans` | `plans` (read + write) | `setDoc` on `plans/{id}` (merge) |
| `/admin/customers` | `app/admin/customers/page.tsx` | `AdminCustomersPage` | `GET /api/admin/workspaces`, `POST /api/admin/workspaces/actions` | `workspaces` (read via API), `users` (read for owner info) | `updateDoc` on `workspaces/{id}` (plan, entitlements, usage, billing.suspended) |
| `/admin/usage` | `app/admin/usage/page.tsx` | `AdminUsagePage` | `GET /api/admin/usage` | `workspaces` (read), sessions count via repo | None (read-only) |
| `/admin/features` | `app/admin/features/page.tsx` | `AdminFeaturesPage` | `GET /api/admin/feature-flags`, `PATCH /api/admin/feature-flags` | `featureFlags` (read + write) | `setDoc` on `featureFlags/{id}` (merge) |

### Layout and auth

- **Layout:** `app/admin/layout.tsx` — uses `useAuthGuard`, then `authFetch("/api/admin/me")` to get `{ isAdmin }`. If not admin, redirects to `/dashboard`. Renders `AdminLayout`.
- **Sidebar:** `components/admin/AdminLayout.tsx` — nav links: Dashboard, Plans, Customers, Usage, Feature Flags.
- **Admin check:** `GET /api/admin/me` uses `lib/server/requireAdmin.ts` (takes `uid`); other admin APIs use `lib/server/adminAuth.ts` `requireAdmin(req)` (takes `Request`). Both ultimately check Firestore `users/{uid}.isAdmin === true`.

---

## SECTION 2 — ADMIN API ROUTES

| Route path | File path | Methods | Firestore read | Firestore write | Services / repos |
|------------|-----------|---------|-----------------|------------------|-------------------|
| `/api/admin/me` | `app/api/admin/me/route.ts` | GET | `users` (via requireAdmin) | — | `requireAuth`, `requireAdmin(uid)` from `lib/server/requireAdmin.ts` |
| `/api/admin/plans` | `app/api/admin/plans/route.ts` | GET, PATCH | `plans` | `plans` (setDoc merge) | `lib/billing/plans` (PLANS, PlanId), `lib/admin/adminLogs`, `lib/admin/types` |
| `/api/admin/update-plan` | `app/api/admin/update-plan/route.ts` | POST | `workspaces` (via getWorkspace) | `workspaces` (via updateWorkspacePlanRepo) | `lib/repositories/workspacesRepository`, `lib/billing/plans` |
| `/api/admin/workspaces` | `app/api/admin/workspaces/route.ts` | GET | `workspaces`, `users` | — | `lib/repositories/sessionsRepository` (getWorkspaceSessionCountRepo), `lib/domain/workspace` |
| `/api/admin/workspaces/actions` | `app/api/admin/workspaces/actions/route.ts` | POST | `workspaces` (via getWorkspace) | `workspaces` (updateDoc) | `lib/repositories/workspacesRepository` (getWorkspace, updateWorkspacePlanRepo), `lib/admin/adminLogs`, `lib/billing/plans` |
| `/api/admin/feature-flags` | `app/api/admin/feature-flags/route.ts` | GET, PATCH | `featureFlags` | `featureFlags` (setDoc merge) | `lib/admin/adminLogs`, `lib/admin/types` |
| `/api/admin/usage` | `app/api/admin/usage/route.ts` | GET | `workspaces` | — | `lib/repositories/sessionsRepository` (getWorkspaceSessionCountRepo) |

**Note:** `POST /api/admin/update-plan` is **owner-only** (not admin); it is not called by the Admin UI. Admin uses `POST /api/admin/workspaces/actions` with `action: "upgrade" | "downgrade"` to change a workspace’s plan.

---

## SECTION 3 — FIRESTORE DATA MODEL

### Collections used by Admin and/or runtime

| Collection | Schema (key fields) | Read by | Written by |
|------------|---------------------|---------|------------|
| **plans** | `name`, `priceMonthly`, `priceYearly`, `maxSessions`, `maxMembers`, `insightsEnabled` (PlanDoc in `lib/admin/types.ts`) | Admin GET/plans, `lib/billing/getPlanCatalog` (runtime) | Admin PATCH /api/admin/plans |
| **workspaces** | `name`, `ownerId`, `billing.plan`, `billing.suspended`, `entitlements.*`, `usage.*`, … (Workspace/WorkspaceDoc) | Admin workspaces/usage, runtime (getWorkspace, listenToWorkspace, updateWorkspacePlanRepo, etc.) | Admin workspaces/actions; repos (create, update plan, settings) |
| **users** | `email`, `name`, `workspaceId`, `isAdmin` | Admin (workspaces for owner), adminAuth/requireAdmin | App (user create/update) |
| **adminLogs** | `adminId`, `action`, `workspaceId?`, `metadata?`, `timestamp` (AdminLogDoc) | (None in codebase) | Admin APIs via `logAdminAction` |
| **featureFlags** | `name`, `enabledGlobally`, `enabledForWorkspaces` (FeatureFlagDoc) | Admin feature-flags API only | Admin PATCH /api/admin/feature-flags |
| **sessions** | (session docs) | Admin usage (count via repo), runtime | Runtime (create/update sessions) |
| **feedback** | (feedback docs) | Admin usage (feedbackCreated from workspace.usage), runtime | Runtime |
| **comments** | (comment docs) | Runtime | Runtime |
| **screenshots** | (screenshot docs) | Runtime | Runtime |

### Collections written by Admin but never read by runtime

- **adminLogs** — Written by Admin for audit; no product code reads it.
- **featureFlags** — Written (and read) only by Admin. **No product code reads `featureFlags`.** So Admin feature-flag toggles have **no effect** on the product.

---

## SECTION 4 — BILLING SYSTEM ARCHITECTURE

### Plan source of truth

- **Intended:** Firestore `plans` collection (admin-editable) merged with code defaults.
- **In practice:** Two sources exist:
  1. **Firestore `plans`** — Read by `getPlanCatalog()` (used by resolver, catalog API, and when syncing workspace entitlements on plan change).
  2. **Code `lib/billing/plans.ts` (PLANS)** — Used as fallback when catalog fails, and for default workspace entitlements, `update-plan`/workspace actions (when syncing entitlements from catalog; see bug in Section 9), and `SAFE_FALLBACK` in billing/usage.

### Pricing source

- **Admin:** Edits `priceMonthly` / `priceYearly` in Firestore `plans` via Admin Plans page.
- **Runtime:** `getPlanCatalog()` reads Firestore `plans` and merges with `DEFAULT_PRICES` in `lib/billing/getPlanCatalog.ts` (duplicated in `app/api/admin/plans/route.ts`). Catalog is cached 60s.
- **Billing UI:** `GET /api/plans/catalog` → `getPlanCatalog()` → prices and limits from Firestore + code defaults.

### Entitlement resolver

- **Resolver:** `lib/billing/getWorkspaceEntitlements.ts`
  - Input: `Workspace` (from Firestore).
  - Plan: `workspace.billing?.plan ?? "free"`.
  - Plan lookup: `getPlanCatalog()` → `catalog[plan]` (Firestore-backed); on failure uses `PLANS[plan]` from code.
  - Override: `workspace.entitlements` (maxSessions, maxMembers, insightsAccess) override plan-derived values.
  - Output: `{ maxSessions, maxMembers, insightsAccess }`.

### Upgrade flows

1. **Admin:** Customers page → “Upgrade” / “Downgrade” → `POST /api/admin/workspaces/actions` with `action: "upgrade"|"downgrade"`, `newPlan` → `updateWorkspacePlanRepo(workspaceId, newPlan)` → updates `workspaces/{id}` `billing.plan` and `entitlements` from plan catalog (or PLANS fallback).
2. **Owner (product):** No UI found that calls `POST /api/admin/update-plan`. So there is no self-serve upgrade flow that persists plan change; settings billing tab only shows plans and CTAs (e.g. “Contact Sales”).

### Session limit enforcement

- **Where:** `app/api/sessions/route.ts` (POST create session).
- **How:** `getWorkspace(workspaceId)` → `checkPlanLimit({ workspace, metric: "maxSessions", currentUsage })` → `getWorkspaceEntitlements(workspace)` → compare `currentUsage` to `entitlements.maxSessions`; if over, return 403 with `planLimitReachedBody(planErr)`.

### Feature gating (insights)

- **Where:** `app/api/insights/route.ts` (GET).
- **How:** `getWorkspaceEntitlements(workspace)` → if `!entitlements.insightsAccess`, return 403 with `planRequiredBody(upgradePlan)`.

**Flow summary:**  
Admin (Plans) → Firestore `plans` → `getPlanCatalog()` → `getWorkspaceEntitlements()` → Billing UI + Upgrade modal + limit/insights enforcement.  
Workspace overrides (`entitlements.maxSessions` etc.) are applied in resolver and persist across plan changes until explicitly overridden by Admin (e.g. “Set limit” / “Grant unlimited”).

---

## SECTION 5 — PLAN DEFINITIONS

### Files containing plan definitions or pricing/limits

| File | Content | Role |
|------|---------|------|
| `lib/billing/plans.ts` | `PLANS` (maxSessions, maxMembers, insightsAccess), `UPGRADE_PLAN` | Code source for limits and fallback; used by resolver fallback, checkPlanLimit, updateWorkspacePlanRepo fallback, defaultWorkspaceDoc, billing/usage SAFE_FALLBACK |
| `lib/billing/getPlanCatalog.ts` | `DEFAULT_PRICES`, `PLAN_NAMES`, `buildDefaultCatalog()`, `fetchCatalogFromFirestore()` | Runtime plan catalog: Firestore `plans` merged with code defaults; 60s cache |
| `app/api/admin/plans/route.ts` | `DEFAULT_PRICES`, `defaultPlanDoc()` using `PLANS` | Admin GET (merge Firestore + code); Admin PATCH writes Firestore |
| `lib/admin/types.ts` | `PlanDoc` (name, priceMonthly, priceYearly, maxSessions, maxMembers, insightsEnabled) | Type for Firestore `plans` docs |
| `app/(app)/settings/page.tsx` | `PLAN_DISPLAY_META`, `COMPARISON_SECTIONS` (e.g. “3”, “20”, “Unlimited”) | **Hardcoded** display: titles, feature bullets, comparison table. Pricing/limits come from `/api/plans/catalog`. |

### Duplicates

- **DEFAULT_PRICES** appears in:
  - `lib/billing/getPlanCatalog.ts`
  - `app/api/admin/plans/route.ts`  
  Same values; must be kept in sync manually.
- **Plan limits (maxSessions, maxMembers, insights):**  
  - In code: `lib/billing/plans.ts` (PLANS).  
  - In Firestore: `plans` (admin-editable).  
  Runtime uses Firestore via `getPlanCatalog()` and then `getWorkspaceEntitlements()`; code is fallback and default for new workspaces.

### Canonical vs outdated

- **Runtime source for limits/pricing in product:** Firestore `plans` as read by `getPlanCatalog()` (with code fallback). So **Firestore `plans` is the intended canonical source** for display and enforcement after first load.
- **Billing tab feature list / comparison:** `PLAN_DISPLAY_META` and `COMPARISON_SECTIONS` in settings are **hardcoded**. If Admin changes e.g. max sessions to 5 for free, the comparison table still says “3” until the settings page is updated.

---

## SECTION 6 — ENTITLEMENT RESOLUTION

### File

`lib/billing/getWorkspaceEntitlements.ts`

### Inputs

- **workspace:** `Workspace` (from Firestore `workspaces/{id}`), including `billing.plan` and `entitlements`.

### Plan lookup

1. `plan = workspace.billing?.plan ?? "free"`.
2. `getPlanCatalog()` (Firestore `plans` + code defaults, 60s cache).
3. `entry = catalog[plan] ?? catalog.free`.
4. `fromPlan = { maxSessions: entry.maxSessions, maxMembers: entry.maxMembers, insightsAccess: entry.insightsEnabled }`.

### Fallback

- If `getPlanCatalog()` throws: `fromPlan = PLANS[plan] ?? PLANS.free` (code only).

### Override

- `stored = workspace.entitlements` (partial).
- Return:  
  `maxSessions: stored?.maxSessions ?? fromPlan.maxSessions`,  
  `maxMembers: stored?.maxMembers ?? fromPlan.maxMembers`,  
  `insightsAccess: stored?.insightsAccess ?? fromPlan.insightsAccess`.

So: **Firestore `plans` (via catalog) first; workspace `entitlements` override; code PLANS only on catalog failure.**

---

## SECTION 7 — LIMIT ENFORCEMENT

### Session limit

- **Where:** `app/api/sessions/route.ts` (POST).
- **How:** `checkPlanLimit({ workspace, metric: "maxSessions", currentUsage: sessionCount })`. Uses `getWorkspaceEntitlements(workspace)`; limit from `entitlements.maxSessions` (null = unlimited). On exceed: 403, `planLimitReachedBody(planErr)`.

### Member limit

- **Defined:** In `lib/billing/plans.ts`, `getWorkspaceEntitlements`, and `app/api/billing/usage/route.ts` (returned in `limits.maxMembers`).
- **Enforced:** **Nowhere.** No `checkPlanLimit(..., metric: "maxMembers", ...)` call exists. So **maxMembers is displayed but not enforced**.

### Feature access (insights)

- **Where:** `app/api/insights/route.ts` (GET).
- **How:** `getWorkspaceEntitlements(workspace)` → `entitlements.insightsAccess`; if false, 403 with `planRequiredBody(upgradePlan)`.

### Other features (integrations, branding)

- **Stored:** `workspace.entitlements.brandingControls`, `integrations` (in domain and defaultWorkspaceDoc).
- **Usage:** Not audited in full; no enforcement points found in the billing/limit code paths above. Likely used elsewhere for feature toggles.

---

## SECTION 8 — UI DATA SOURCES

### Billing page (Settings)

- **File:** `app/(app)/settings/page.tsx` (BillingTab).
- **Data:**  
  - **Plans/pricing/limits:** `GET /api/plans/catalog` → `getPlanCatalog()` → Firestore `plans` + code defaults.  
  - **Display meta (titles, feature bullets, comparison):** Hardcoded `PLAN_DISPLAY_META` and `COMPARISON_SECTIONS` in same file.
- **No direct Firestore reads from the client.**

### Upgrade modal

- **File:** `components/billing/UpgradeModal.tsx`.
- **Data:** `GET /api/billing/usage` when modal opens → `data.usage.sessionsCreated`, `data.limits.maxSessions`. No Firestore, no hardcoded limits.

### Usage meter

- **File:** `components/billing/UsageMeter.tsx`.
- **Data:** `GET /api/billing/usage` → plan, usage (sessionsCreated, members), limits (maxSessions, maxMembers). No Firestore, no hardcoded limits.

### Profile upgrade section

- **File:** `components/layout/ProfileCommandPanel.tsx`.
- **Data:** `authFetch("/api/billing/usage")` → `billingUsage.plan`, `billingUsage.usage.sessionsCreated`, `billingUsage.limits.maxSessions`. No Firestore, no hardcoded limits.

**Summary:** All billing/usage UIs get limits and usage from **`GET /api/billing/usage`** or **`GET /api/plans/catalog`**; both APIs use **getWorkspaceEntitlements** (and thus Firestore `plans` via catalog) or safe fallbacks. Hardcoded values only in settings **display** (feature list and comparison table), not in numeric limits or pricing.

---

## SECTION 9 — DUPLICATED CONFIGURATION

### Plans / limits

- **lib/billing/plans.ts (PLANS):** Canonical code definition; used as fallback and for defaults.
- **Firestore `plans`:** Admin-editable; canonical at runtime when catalog is used.
- **getPlanCatalog.ts DEFAULT_PRICES:** Duplicate of admin route default prices; used when Firestore doc missing or for base catalog.

### Pricing

- **DEFAULT_PRICES** in `lib/billing/getPlanCatalog.ts` and `app/api/admin/plans/route.ts` — same numbers; duplicated.

### Bug: insightsAccess vs insightsEnabled in updateWorkspacePlanRepo

- **File:** `lib/repositories/workspacesRepository.ts`, `updateWorkspacePlanRepo()`.
- **Issue:** Plan catalog type `PlanCatalogEntry` has **`insightsEnabled`**; code does `planConfig = { ..., insightsAccess: entry.insightsAccess }`. So **`entry.insightsAccess` is undefined**. When Admin changes a workspace’s plan via “Upgrade”/“Downgrade”, the entitlements written to Firestore use `insightsAccess: undefined`, which can leave the field unchanged or inconsistent. Correct field is **`entry.insightsEnabled`**.

### Billing tab constants

- **PLAN_DISPLAY_META** and **COMPARISON_SECTIONS** in `app/(app)/settings/page.tsx`: Hardcoded session counts (“3”, “20”, “Unlimited”) and feature lists. If Admin changes plan limits in Firestore, these strings stay outdated.

### Summary

- **Canonical for runtime:** Firestore `plans` via `getPlanCatalog()` (with code fallback).
- **Outdated / inconsistent:** (1) `updateWorkspacePlanRepo` using `entry.insightsAccess` instead of `entry.insightsEnabled`; (2) Settings page hardcoded feature/limit strings.
- **Duplicated:** DEFAULT_PRICES in two files; plan limits in code vs Firestore (by design, but fallback must stay in sync).

---

## SECTION 10 — DATA FLOW DIAGRAM

```
Plan change in Admin (edit plan doc)
  ↓
  PATCH /api/admin/plans → setDoc(plans/{id}, payload, { merge: true })
  ↓
  Firestore: plans collection updated

Resolver (on next request that needs entitlements)
  ↓
  getPlanCatalog() → getDocs(plans) + code defaults, 60s cache
  ↓
  getWorkspaceEntitlements(workspace) → catalog[plan] + workspace.entitlements overrides

Billing page (Settings)
  ↓
  GET /api/plans/catalog → getPlanCatalog() → same Firestore plans
  ↓
  Renders prices/limits from API; feature list from PLAN_DISPLAY_META (hardcoded)

Upgrade modal
  ↓
  GET /api/billing/usage → getWorkspaceEntitlements(workspace) → limits
  ↓
  Shows usage and maxSessions (from resolver)

Limit enforcement (e.g. create session)
  ↓
  POST /api/sessions → checkPlanLimit → getWorkspaceEntitlements(workspace)
  ↓
  Uses same resolver → same Firestore plans + overrides
```

**Breaks in the chain**

1. **Catalog cache (60s):** Admin plan edits can take up to 60s to appear in resolver and billing/usage APIs.
2. **updateWorkspacePlanRepo bug:** On Admin “Upgrade”/“Downgrade”, `insightsAccess` is taken from `entry.insightsAccess` (undefined); insights entitlement may not update from Firestore plan.
3. **Billing tab copy:** PLAN_DISPLAY_META and COMPARISON_SECTIONS are hardcoded; Admin changes to limits/features are not reflected in feature bullets or comparison table.
4. **Feature flags:** Admin writes to `featureFlags`; no product code reads it — complete break.

---

## SECTION 11 — ADMIN CONTROL COVERAGE

| Admin action | Effect | Status |
|--------------|--------|--------|
| Plan pricing change (Plans page) | Firestore `plans` updated → getPlanCatalog() → billing UI and resolver (after cache TTL) | **Works** (with cache delay) |
| Plan limit change (maxSessions, maxMembers, insights) in Admin | Firestore `plans` updated → catalog → getWorkspaceEntitlements; session limit and insights enforcement use resolver | **Works** for maxSessions and insights (with cache); **maxMembers** never enforced in product |
| Feature toggle (Feature Flags page) | Firestore `featureFlags` updated | **No effect** — product never reads featureFlags |
| Workspace plan change (Customers → Upgrade/Downgrade) | updateWorkspacePlanRepo → Firestore `workspaces` billing.plan + entitlements from catalog (insights bug above) | **Partial** — plan and session/member limits update; insights may not due to insightsAccess bug |
| Override session limit / Grant unlimited | Direct update to `workspace.entitlements.maxSessions` | **Works** — resolver uses workspace.entitlements override |
| Reset usage | `usage.sessionsCreated`, `usage.feedbackCreated` set to 0 | **Works** — usage APIs and session count reflect it |
| Suspend workspace | `billing.suspended: true` | **Partial** — stored but no enforcement found in audited code (no check for suspended in sessions or billing APIs) |

---

## SECTION 12 — RUNTIME VS ADMIN DISCREPANCIES

1. **Feature flags:** Admin modifies `featureFlags`; product does not read it. All Admin feature-flag actions have **no effect** on the app.
2. **Plans collection:** Product **does** use it (via getPlanCatalog → resolver and /api/plans/catalog). So plans are not “unused,” but catalog cache and the insights bug can make Admin changes appear delayed or wrong for insights.
3. **adminLogs:** Written by Admin only; never read — by design (audit log).
4. **Limits overridden elsewhere:** Workspace `entitlements` override plan-derived limits; Admin “Override session limit” / “Grant unlimited” correctly set those. No duplicate override source found; the only bug is `insightsAccess` vs `insightsEnabled` when applying plan to workspace.
5. **Billing tab:** Comparison table and feature bullets are hardcoded; Admin plan edits don’t change them.
6. **maxMembers:** Enforced nowhere; Admin can change it in plans or overrides but product does not block adding members based on it.

---

## SECTION 13 — CODE FILE MAP

| Layer | File(s) |
|-------|--------|
| **Admin UI** | `app/admin/page.tsx`, `app/admin/plans/page.tsx`, `app/admin/customers/page.tsx`, `app/admin/usage/page.tsx`, `app/admin/features/page.tsx`, `app/admin/layout.tsx`, `components/admin/AdminLayout.tsx` |
| **Admin API** | `app/api/admin/me/route.ts`, `app/api/admin/plans/route.ts`, `app/api/admin/update-plan/route.ts`, `app/api/admin/workspaces/route.ts`, `app/api/admin/workspaces/actions/route.ts`, `app/api/admin/feature-flags/route.ts`, `app/api/admin/usage/route.ts` |
| **Admin lib** | `lib/admin/types.ts`, `lib/admin/adminLogs.ts`, `lib/server/adminAuth.ts`, `lib/server/requireAdmin.ts` |
| **Plan storage** | Firestore collection `plans` (PlanDoc). Read/write: Admin plans API; read: getPlanCatalog. |
| **Plan catalog (runtime)** | `lib/billing/getPlanCatalog.ts` (reads Firestore `plans` + code defaults, 60s cache) |
| **Plan resolver** | `lib/billing/getWorkspaceEntitlements.ts` (catalog + workspace.entitlements overrides) |
| **Plan definitions (code)** | `lib/billing/plans.ts` (PLANS, UPGRADE_PLAN) |
| **Limit enforcement** | `lib/billing/checkPlanLimit.ts`; called from `app/api/sessions/route.ts` (maxSessions), `app/api/insights/route.ts` (insightsAccess). No maxMembers enforcement. |
| **Workspace plan sync** | `lib/repositories/workspacesRepository.ts` — `updateWorkspacePlanRepo()` (used by Admin actions and update-plan API) |
| **Billing UI** | `app/(app)/settings/page.tsx` (BillingTab), `components/billing/UpgradeModal.tsx`, `components/billing/UsageMeter.tsx`, `components/layout/ProfileCommandPanel.tsx` (upgrade section) |
| **Billing/usage API** | `app/api/billing/usage/route.ts`, `app/api/plans/catalog/route.ts` |
| **Upgrade flows** | Admin: workspaces/actions (upgrade/downgrade). Product: no caller for `/api/admin/update-plan` found. |

---

## SECTION 14 — ARCHITECTURE RECOMMENDATION

**Target: Firestore `plans` = single source of truth**

1. **Admin edits plans** → Only Firestore `plans` (already so). Optionally invalidate or shorten catalog cache on Admin PATCH so changes propagate quickly.
2. **Resolver loads plans** → Only from Firestore via getPlanCatalog(); use code PLANS only as fallback for missing docs or on error. Fix `updateWorkspacePlanRepo` to use `entry.insightsEnabled` so plan-derived insights are correct.
3. **Billing UI renders plans** → Only from `GET /api/plans/catalog` (getPlanCatalog). Remove or reduce hardcoded PLAN_DISPLAY_META/COMPARISON_SECTIONS; either derive from catalog or keep a single shared constant that matches Firestore semantics.
4. **Limits enforced using same plans** → Already use getWorkspaceEntitlements (catalog + overrides). Add maxMembers enforcement where members are added (if product supports it). Add explicit check for `billing.suspended` where appropriate (e.g. session creation, billing APIs).
5. **Single DEFAULT_PRICES / plan defaults** — Define once (e.g. in `lib/billing/plans.ts` or a small `lib/billing/defaults.ts`); import in getPlanCatalog and admin plans API.
6. **Feature flags** — Either remove Admin UI for feature flags or add runtime reads of `featureFlags` (e.g. a small `getFeatureFlag(id)` used by APIs or UI) so Admin toggles have effect.

---

## SECTION 15 — FINAL AUDIT SUMMARY

### Architecture overview

- Admin writes to Firestore: `plans`, `workspaces` (plan, entitlements, usage, suspended), `featureFlags`, `adminLogs`. Product reads `plans` (via getPlanCatalog) and `workspaces`; product does not read `featureFlags` or `adminLogs`.
- Entitlements are resolved by `getWorkspaceEntitlements`: plan from workspace → catalog (Firestore `plans` + code defaults) → then workspace.entitlements override. Session limit and insights are enforced using this resolver; member limit is not enforced.
- Billing and usage UIs get data from `GET /api/billing/usage` and `GET /api/plans/catalog`; both rely on the same resolver or catalog.

### Code file references

- See Section 13 for the full file map.
- Critical paths: `lib/billing/getPlanCatalog.ts`, `lib/billing/getWorkspaceEntitlements.ts`, `lib/repositories/workspacesRepository.ts` (updateWorkspacePlanRepo), `lib/billing/checkPlanLimit.ts`, `app/api/sessions/route.ts`, `app/api/insights/route.ts`, `app/api/billing/usage/route.ts`, `app/api/plans/catalog/route.ts`.

### Firestore collections

- **plans** — Read by runtime (getPlanCatalog); written by Admin. Used for pricing and limits.
- **workspaces** — Read/written by Admin and runtime; holds plan, entitlements, usage, suspended.
- **users** — Read by Admin and auth; holds isAdmin.
- **featureFlags** — Written/read by Admin only; product does not use.
- **adminLogs** — Write-only from Admin; audit only.

### Inconsistencies

1. **insightsAccess vs insightsEnabled** in `updateWorkspacePlanRepo`: catalog has `insightsEnabled`; code sets `insightsAccess: entry.insightsAccess` (undefined). Fix: use `entry.insightsEnabled`.
2. **Feature flags** never read by product — Admin changes have no effect.
3. **Billing tab** feature/limit copy is hardcoded; Admin plan edits don’t update it.
4. **DEFAULT_PRICES** duplicated in getPlanCatalog and admin plans route.
5. **maxMembers** not enforced anywhere.
6. **billing.suspended** not checked in audited enforcement paths.

### Duplicated systems

- Plan limits: code (PLANS) vs Firestore (plans). Design is “Firestore + code fallback”; keep fallback in sync.
- Pricing defaults: two copies of DEFAULT_PRICES; consolidate to one module.

### Broken data flows

- Admin → featureFlags → (nothing). Add product reads of featureFlags or drop Admin UI.
- Admin “Upgrade”/“Downgrade” → updateWorkspacePlanRepo → insights wrong due to insightsAccess bug.
- Optional: catalog 60s cache delays Admin plan edits; consider cache invalidation on Admin PATCH.

### Recommended fixes (implementation-ready)

1. **Fix updateWorkspacePlanRepo:** In `lib/repositories/workspacesRepository.ts`, set `insightsAccess: entry.insightsEnabled` (not `entry.insightsAccess`) when building planConfig from catalog.
2. **Single DEFAULT_PRICES:** Move to `lib/billing/plans.ts` or `lib/billing/defaults.ts`; import in `lib/billing/getPlanCatalog.ts` and `app/api/admin/plans/route.ts`.
3. **Feature flags:** Either implement `getFeatureFlag(id)` and use it where features are gated, or remove/hide the Admin Feature Flags UI and document that it’s not connected.
4. **Billing tab:** Derive feature list or comparison from catalog (e.g. maxSessions from API) or maintain one shared config that Admin and code both align to; avoid hardcoded “3”/“20”/“Unlimited” that can diverge from Firestore.
5. **maxMembers:** If product supports adding/removing members, add checkPlanLimit(..., metric: "maxMembers", ...) at the point of adding a member.
6. **Suspended:** If “suspend” should block usage, add a check for `workspace.billing?.suspended` in session creation and/or billing/usage API and return 403 with a clear message.
7. **Catalog cache:** On PATCH /api/admin/plans, clear or shorten getPlanCatalog cache (e.g. export a `invalidatePlanCatalogCache()` and call it from the Admin PATCH handler).

---

*End of audit report. No code was modified during this analysis.*
