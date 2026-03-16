# Plan Limits Fix — Implementation Summary

## 1. Files Modified

| File | Change |
|------|--------|
| `lib/billing/getWorkspaceEntitlements.ts` | Entitlements treated as **overrides only**. Explicit `!== undefined` check so missing fields use catalog. Doc comment updated. |
| `lib/domain/workspace.ts` | `defaultWorkspaceDoc`: removed `insightsAccess`, `maxSessions`, `maxMembers` from default entitlements (only `brandingControls` and `integrations` remain). Type comments: entitlements are override-only. Removed unused `PLANS` import. |
| `lib/repositories/workspacesRepository.ts` | `updateWorkspacePlanRepo`: now only updates `billing.plan` and `updatedAt`. No longer writes plan-derived limits into `entitlements`. Removed `getPlanCatalog` and `PLANS` imports. |
| `lib/billing/getPlanCatalog.ts` | Comment added: admin PATCH invalidates cache so next request (e.g. session creation) gets current catalog. |
| `app/api/admin/workspaces/actions/route.ts` | **No change.** `override_session_limit` and `grant_unlimited_sessions` still write `entitlements.maxSessions` (explicit overrides). |

## 2. New / Added Files

| File | Purpose |
|------|---------|
| `lib/admin/migrateWorkspaceEntitlementsToOverrides.ts` | Migration: removes `entitlements.maxSessions`, `maxMembers`, `insightsAccess` when they equal current plan catalog (preserves true overrides). |
| `app/api/admin/migrate-workspace-entitlements/route.ts` | Admin-only POST endpoint to run migration; `?dryRun=true` to preview. |
| `docs/PLAN_LIMITS_FIX_IMPLEMENTATION.md` | This summary and test checklist. |

---

## 3. New Entitlement Logic

**Effective limit:**

```ts
workspace.entitlements.maxSessions !== undefined
  ? workspace.entitlements.maxSessions
  : planCatalog[workspace.billing.plan].maxSessions
```

Same for `maxMembers` and `insightsAccess` (catalog field `insightsEnabled`).

- **Plan catalog** = source of truth (Firestore `plans` collection + code defaults, via `getPlanCatalog()`).
- **Workspace.entitlements** = only explicit overrides (e.g. from `override_session_limit`, `grant_unlimited_sessions`). If a field is missing, catalog is used.
- No code path writes plan defaults into `entitlements`; new workspaces get no `maxSessions`/`maxMembers`/`insightsAccess`, and `set_plan` only updates `billing.plan`.

---

## 4. Migration Script / Utility

**Option A — Admin API (recommended)**

1. As an admin, call:
   - **Preview:** `POST /api/admin/migrate-workspace-entitlements?dryRun=true`
   - **Run:** `POST /api/admin/migrate-workspace-entitlements`
2. Response includes `updated` count and `results` (per-workspace list of removed fields).

**Option B — Programmatic**

Import and call from a one-off script or Node REPL:

```ts
import { migrateWorkspaceEntitlementsToOverrides } from "@/lib/admin/migrateWorkspaceEntitlementsToOverrides";

const { updated, results } = await migrateWorkspaceEntitlementsToOverrides(false);
console.log("Updated", updated, "workspaces", results);
```

**Behavior**

- For each workspace, compares `entitlements.maxSessions`, `entitlements.maxMembers`, `entitlements.insightsAccess` to current `catalog[workspace.billing.plan]`.
- If equal → field is removed (Firestore `deleteField()`).
- If different (or null vs catalog) → kept as override.
- Idempotent: safe to run multiple times.

---

## 5. Test Checklist

### 5.1 Admin plan change applies immediately

1. Note a test workspace on **Free** with current limit (e.g. 3 sessions).
2. In **Admin → Plans**, change **Free** plan **max sessions** from 3 → 5; save.
3. **Without** re-login or changing the workspace, create a new session (dashboard or extension).
4. **Pass:** New session is created (limit 5).
5. Change **Free** back to 3; save. Create sessions until at 3; next create must return **403** with plan limit message.

### 5.2 Override still wins

1. In **Admin → Workspaces/Customers**, set **override_session_limit** = 2 for a test workspace (plan can be Free with catalog 5).
2. Create 2 sessions; third session create must return **403**.
3. Remove override (if supported) or set override to a higher value; next create must succeed.

### 5.3 Extension

1. With limit reached (catalog or override), trigger **Start new session** from extension.
2. **Pass:** 403 and (if implemented) limit message in extension UI.
3. Raise limit (admin plan or override); create session from extension.
4. **Pass:** Session created and extension shows new session.

### 5.4 Migration

1. **Dry run:** `POST /api/admin/migrate-workspace-entitlements?dryRun=true` → returns list of workspaces and fields that would be removed.
2. **Run:** `POST /api/admin/migrate-workspace-entitlements` → same list, and Firestore updated.
3. For a workspace that had only plan-synced values, after migration its `entitlements` should no longer contain `maxSessions`/`maxMembers`/`insightsAccess` (unless they were overrides).
4. Create session again; limit should match **current** plan catalog.

### 5.5 New workspace

1. Create a new workspace (onboarding).
2. **Pass:** Workspace doc has no `entitlements.maxSessions`, `entitlements.maxMembers`, `entitlements.insightsAccess`.
3. Session creation uses plan catalog limit for that plan.

---

*End of implementation summary.*
