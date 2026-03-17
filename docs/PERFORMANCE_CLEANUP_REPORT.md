# ECHLY — Performance Cleanup Report

## STEP 1 — Duplicate API Calls (Findings)

### GET /api/sessions

| Caller | When | Notes |
|--------|------|--------|
| **echly-extension/src/content.tsx** | Widget visible | `GET /api/sessions?limit=1` to set `hasPreviousSessions` |
| **echly-extension/src/content.tsx** | Preload effect | `GET /api/sessions` (full list) in `fetchSessions()` |
| **echly-extension/src/background.ts** | On `ECHLY_SET_ACTIVE_SESSION` | `GET /api/sessions` in `Promise.all` with feedback (separate process, not deduped with content) |

**Web app (dashboard):** Does **not** call GET /api/sessions on load. It uses Firestore via `getWorkspaceSessions` / `getUserSessions` in `useWorkspaceOverview`.

**Result on extension load (widget visible):** Previously 2 calls (limit=1 + full). After dedupe: **1 call** (shared cache for full list; hasPreviousSessions derived from it).

---

### GET /api/billing/usage

| Caller | When |
|--------|------|
| **useBillingUsage** (used by **UsageMeter**) | On auth + workspace subscription |
| **useBillingUsage** (used by **ProfileCommandPanel**) | On auth + workspace subscription |
| **useBillingUsage** (used by **UpgradeModal**, `enabled: open`) | When modal opens |

Multiple components use `useBillingUsage()` with no shared cache, so **multiple GET /api/billing/usage** on initial load (e.g. dashboard with profile in layout).

**Result after dedupe:** Single shared fetch layer with **60s TTL**; only **1 call** per 60s across all consumers. Cache invalidated on workspace doc change.

---

## STEP 2 — Dedupe Implemented

- **Web:** `lib/cachedBillingUsage.ts` — `getBillingUsageCached(fetchFn)` with 60s TTL and in-flight dedupe. `useBillingUsage` uses it; workspace listener calls `invalidateBillingUsageCache()` then refetch.
- **Extension content:** `echly-extension/src/cachedSessions.ts` — `getSessionsCached(fetchFn)` with 30s TTL. Both the “hasPreviousSessions” effect and `fetchSessions` use it. Removed separate `GET /api/sessions?limit=1`. Cache invalidated after creating a new session.

---

## STEP 3 — Plan Catalog Cache

- **File:** `lib/billing/getPlanCatalog.ts`
- **Change:** In-memory cache with **5-minute TTL** and in-flight promise dedupe.
- Repeated calls in the same process (e.g. multiple API handlers) share one Firestore `getDocs(plans)` read.

---

## STEP 4 — Workspace Resolution Cache

- **File:** `lib/server/resolveWorkspaceForUser.ts`
- **Change:** Per-uid cache with **30s TTL** and in-flight dedupe. Multiple handlers for the same user in the same process share one resolution.

---

## STEP 5 — getWorkspaceSessionCountRepo (Report Only — No Code Change)

- **File:** `lib/repositories/sessionsRepository.ts` (lines 78–104)

**Exact queries:**

1. **All sessions in workspace:**  
   `collection(db, "sessions")` with `where("workspaceId", "==", workspaceId)`  
   → `getCountFromServer(baseQuery)` (count only, no document read).

2. **Archived sessions in workspace:**  
   `collection(db, "sessions")` with `where("workspaceId", "==", workspaceId)` and `where("archived", "==", true)`  
   → `getCountFromServer(...)` (count only).

**Active count:** `total - archived` (both counts run in parallel via `Promise.all`).

**Index:**  
- `firestore.indexes.json` does **not** define any index for the `sessions` collection.  
- Firestore typically auto-creates single-field indexes for `workspaceId` equality.  
- The compound query `(workspaceId, archived)` may require a composite index; if not deployed, Firestore would log an error and the SDK may throw or prompt for index creation.  
- **Recommendation:** Add an explicit composite index for `sessions` with `workspaceId` (ASC) and `archived` (ASC) if not already present, to avoid full collection scans and ensure fast count aggregation.

---

## STEP 6 — Parallelization

- **app/api/billing/usage/route.ts (fallback branch):**  
  `getWorkspaceSessionCountRepo(workspaceId)` and `getWorkspaceEntitlements(workspace)` now run in **Promise.all** instead of sequentially.

- **lib/billing/getWorkspacePlanState.ts:**  
  After `getWorkspace(workspaceId)`, `getPlanCatalog()`, `getWorkspaceEntitlements(workspace)`, and `getWorkspaceUsage(workspaceId)` now run in **Promise.all**.

- **lib/billing/getWorkspaceUsage.ts:**  
  `getWorkspace(workspaceId)` and `getWorkspaceSessionCountRepo(workspaceId)` now run in **Promise.all**.

---

## STEP 7 — Verify

After deploying:

1. **Logs / Network**
   - **GET /api/sessions:** Only **1 call** per extension widget open (content script); background may do one more when user sets active session (different context).
   - **GET /api/billing/usage:** One call per 60s per user across all components; response ideally **&lt; 1s** with cached `resolveWorkspaceForUser` and parallelized backend work.
   - **Total load:** Fewer duplicate calls and parallelized backend should reduce total load time.

2. **Behavior**
   - No change to business logic: plan limits, session creation, billing display, and workspace resolution semantics are unchanged; only caching and request dedupe were added.

---

## Summary

| Item | Change |
|------|--------|
| **Duplicate calls removed** | GET /api/sessions in extension content: 2 → 1 per widget open. GET /api/billing/usage: N (per consumer) → 1 per 60s (shared cache). |
| **Cache points added** | (1) Billing usage — 60s TTL, client. (2) Sessions list in extension — 30s TTL. (3) getPlanCatalog — 5 min TTL, server. (4) resolveWorkspaceForUser — 30s TTL per uid, server. |
| **Parallelization** | Billing usage route fallback; getWorkspacePlanState; getWorkspaceUsage. |
| **Slowest remaining operation** | Likely **getWorkspaceSessionCountRepo** (two Firestore count queries per workspace) and/or **resolveWorkspaceForUser** first miss (getUserWorkspaceIdRepo + getWorkspace). Plan catalog and workspace resolution are now cached; session count is not cached and runs on each billing/usage and POST /api/sessions (limit check). |
