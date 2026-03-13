# Plan Limit Realtime Sync — Fix Report

**Date:** 2025-03-14  
**Issue:** Plan limit changes made in the Admin dashboard were not reflected for users until they logged out and back in.  
**Goal:** Plan changes must take effect immediately without logout or page refresh.

---

## Section 1 — Workspace Data Flow (Diagnosis)

### Where workspace is loaded and stored

- **No `WorkspaceContext` or `workspace-provider`** — The app does not use a global workspace context.
- **Billing/limits:** Plan and limits are loaded via **`useBillingUsage`** (`lib/hooks/useBillingUsage.ts`). The hook:
  - Resolves `workspaceId` from the current user via `getUserWorkspaceIdRepo(user.uid)`.
  - Subscribes to the workspace document with **`listenToWorkspace(workspaceId, callback)`** (Firestore `onSnapshot` in `lib/repositories/workspacesRepository.ts`).
  - On every workspace document change, it calls **`refetch()`**, which requests **`GET /api/billing/usage`**.
  - The API uses **`getWorkspace(workspaceId)`** (one-time `getDoc`) and **`getWorkspaceSessionCountRepo(workspaceId)`** to compute plan, usage, and limits and returns them as JSON.

### Previous behavior

- Workspace document was already subscribed via **`listenToWorkspace`** in `useBillingUsage`, so Firestore changes did trigger a refetch.
- **Next.js could cache** `GET /api/billing/usage` and `GET /api/plans/catalog`, so refetches could return stale plan/limits.
- **`useBillingUsage({ enabled: open })`** in `ProfileCommandPanel` meant the subscription ran only when the panel was open; with the panel closed, no listener ran until the user opened the panel again.

### Summary

- Workspace was not “fetched once on login” in a single place; billing data came from the usage API, which was driven by the workspace listener in `useBillingUsage`.
- The main issues were: (1) possible route caching of the usage (and catalog) API, and (2) the billing subscription only active when the profile panel was open.

---

## Section 2 — Realtime Workspace Listener

**Existing implementation (unchanged):**

- **`lib/repositories/workspacesRepository.ts`** already exposes:
  - **`listenToWorkspace(workspaceId, callback)`** — uses `onSnapshot(doc(db, "workspaces", workspaceId), ...)` and invokes the callback with the current workspace (or `null`).
- **`lib/hooks/useBillingUsage.ts`** already uses this:
  - When `enabled` is true, it subscribes with `listenToWorkspace(workspaceId, () => refetch())`, so any change to the workspace document triggers a refetch of billing usage.

**Change made:** The billing hook is now always enabled when the component is mounted (see Section 4), so the realtime listener runs whenever the user is in the app, not only when the profile panel is open.

---

## Section 3 — Admin Plan Updates and Workspace Document

**Verified:**

- **`lib/repositories/workspacesRepository.ts`** — **`updateWorkspacePlanRepo(workspaceId, newPlan)`**:
  - Updates **`billing.plan`** to `newPlan`.
  - Sets **`entitlements.maxSessions`**, **`entitlements.maxMembers`**, and **`entitlements.insightsAccess`** from the plan catalog (with code fallback).
  - Writes to **`workspaces/{workspaceId}`** via `updateDoc(ref, { "billing.plan": newPlan, entitlements: { ... }, updatedAt })`.
- **`app/api/admin/workspaces/actions/route.ts`** — For **upgrade** / **downgrade**, calls **`updateWorkspacePlanRepo(workspaceId, newPlan)`**. For **override_session_limit** and **grant_unlimited_sessions**, updates **`entitlements.maxSessions`** on the same workspace document.

The realtime listener in `useBillingUsage` receives these updates because they are written directly to the workspace document.

---

## Section 4 — Client-Side Workspace / Billing Caching

**Findings:**

- No **useMemo** or **useRef** was used to cache the workspace document or plan/limits in a way that would freeze values after login.
- No **localStorage** or global singleton was used for workspace or limits.
- **`useBillingUsage`** was the single source of billing/limits on the client; it already uses a Firestore listener and refetch, not a one-time fetch.

**Change made:**

- **`components/layout/ProfileCommandPanel.tsx`** previously used **`useBillingUsage({ enabled: open })`**, so the workspace listener and refetch ran only when the profile panel was open.
- Updated to **`useBillingUsage()`** (default `enabled: true`), so whenever the user is on a page that mounts `ProfileCommandPanel` (e.g. app layout with `FloatingUtilityActions`), the listener is active and billing data is refetched on every workspace document change. The UI (e.g. “X / Y sessions used”) then updates without logout or refresh.

---

## Section 5 — Plan Catalog Caching

- **`lib/billing/getPlanCatalog.ts`** caches the catalog in memory (`cachedCatalog`, `lastFetchTime`, TTL 60s) and exports **`invalidatePlanCatalogCache()`**.
- **`app/api/admin/plans/route.ts`** — **PATCH** handler already calls **`invalidatePlanCatalogCache()`** after updating a plan document (after `setDoc(ref, payload, { merge: true })`).

No code changes were required; catalog cache is invalidated when Admin updates plans via **PATCH /api/admin/plans**.

---

## Section 6 — Next.js Route Caching Disabled

**Updates:**

1. **`app/api/billing/usage/route.ts`**  
   - Added: **`export const dynamic = "force-dynamic"`**  
   - Ensures each request runs dynamically and responses are not cached.

2. **`app/api/plans/catalog/route.ts`**  
   - Added: **`export const dynamic = "force-dynamic"`**  
   - Ensures catalog responses are never statically or revalidated-cached.

3. **`app/api/sessions/route.ts`**  
   - Added: **`export const dynamic = "force-dynamic"`**  
   - Ensures session list and create responses are always dynamic (supports correct limit enforcement and fresh session counts).

---

## Section 7 — Session Limit Enforcement

**Verified:**

- **POST /api/sessions** (`app/api/sessions/route.ts`):
  - Resolves **`workspaceId`** from the authenticated user.
  - Loads workspace with **`getWorkspace(workspaceId)`** (fresh read).
  - Gets **`currentSessionCount`** with **`getWorkspaceSessionCountRepo(workspaceId)`** (fresh count).
  - Calls **`checkPlanLimit({ workspace, metric: "maxSessions", currentUsage: currentSessionCount })`**.
- No cached usage or workspace is used; every create request uses up-to-date workspace and session count.

---

## Section 8 — UI Updates After Realtime Listener

- **ProfileCommandPanel** shows “Current plan” and “X / Y sessions used” from **`useBillingUsage().data`**.
- With the listener always on (Section 4) and the usage API non-cached (Section 6), when an admin changes **maxSessions** (or plan) on the workspace:
  1. Firestore **workspace** document is updated.
  2. **`onSnapshot`** in **`listenToWorkspace`** fires.
  3. **`refetch()`** runs and calls **GET /api/billing/usage**.
  4. The route runs with **`dynamic = "force-dynamic"`** and returns fresh workspace and limits.
  5. **`setData(json)`** updates state and the UI shows the new limit (e.g. “2 / 5 sessions used” instead of “2 / 3 sessions used”) without refresh or logout.

---

## Section 9 — Testing Scenarios

- **Test 1 — Admin increases maxSessions**  
  User can create more sessions as soon as the workspace document is updated; the listener refetches usage/limits and the UI and POST /api/sessions use the new limit.

- **Test 2 — Admin decreases maxSessions**  
  Existing sessions stay; **POST /api/sessions** uses the new limit, so new sessions are blocked until **activeSessions < maxSessions**.

- **Test 3 — No logout or refresh**  
  With the listener always on and the usage route dynamic, the profile panel and any other consumer of **`useBillingUsage`** update as soon as the workspace document changes.

---

## Section 10 — Summary

### Files modified

| File | Change |
|------|--------|
| `app/api/billing/usage/route.ts` | Added `export const dynamic = "force-dynamic"`. |
| `app/api/plans/catalog/route.ts` | Added `export const dynamic = "force-dynamic"`. |
| `app/api/sessions/route.ts` | Added `export const dynamic = "force-dynamic"`. |
| `components/layout/ProfileCommandPanel.tsx` | Replaced `useBillingUsage({ enabled: open })` with `useBillingUsage()` so the billing subscription is always on when mounted. |

### Listeners

- **Existing:** **`listenToWorkspace`** in **`useBillingUsage`** (Firestore **`onSnapshot`** on **`workspaces/{workspaceId}`**). No new listeners added; behavior unchanged in **`lib/repositories/workspacesRepository.ts`** and **`lib/hooks/useBillingUsage.ts`**.

### Caches removed / behavior changed

- **Client:** No caches were removed. The only change was to keep the existing workspace listener active whenever the app layout is mounted (ProfileCommandPanel always enables **useBillingUsage**).
- **Server:** No in-memory caches were removed. **Next.js** route caching was disabled for the three routes above via **`dynamic = "force-dynamic"`**.

### Next.js caching disabled

- **GET /api/billing/usage** — `dynamic = "force-dynamic"`.
- **GET /api/plans/catalog** — `dynamic = "force-dynamic"`.
- **GET/POST /api/sessions** — `dynamic = "force-dynamic"`.

### Verification

- **Admin plan/limit updates** write to **`workspaces/{workspaceId}`** (**billing.plan**, **entitlements.maxSessions**, **entitlements.maxMembers**).
- **Realtime listener** in **useBillingUsage** runs whenever the user is in the app (profile panel open or not) and refetches usage on every workspace change.
- **Usage and catalog API** responses are not cached, so refetches always get current limits.
- **POST /api/sessions** uses fresh **getWorkspace** and **getWorkspaceSessionCountRepo** on every request, so limits are enforced in real time.

Plan and session-limit changes from the Admin dashboard now take effect immediately for the user, without logout or page refresh.
