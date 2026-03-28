# NBIB architecture verification — final verdict

Read-only audit. Evidence in sibling files: `nbib_identity_sources.md`, `nbib_identity_usage.md`, `nbib_data_leaks.md`, `nbib_action_safety.md`, `nbib_ui_blocking.md`, `nbib_backend_enforcement.md`, `nbib_race_conditions.md`.

---

## 1. Is the claim TRUE?

| Claim | Verdict |
|-------|---------|
| UI renders early (NBIB) | ⚠️ **PARTIALLY TRUE** — `useRenderReadiness` (`authReady && authUid`) supports early *dashboard* stabilization, but **`AppBootReadinessBridge` keeps a global boot overlay until `claimsReady && workspaceId` for signed-in users**, and **`WorkspaceIdentityGate` / `WorkspaceSuspendedGuard` spin on `!authReady`**. |
| Identity resolves in background | ✅ **TRUE** — `WorkspaceProvider` resolves claims + `workspaceId` after auth via POST `/api/users`, token refresh, and `users/{uid}` read; children can mount during `workspaceLoading` before final workspace error branch. |
| Data strictly gated by identity | ⚠️ **PARTIALLY TRUE** — Major Firestore listeners and most fetches use `isIdentityResolved`; **`BillingUsageCacheInitializer` calls `GET /api/billing/usage` without an identity gate** (violates the stated client rule; server still authenticates). |
| Actions strictly guarded | ⚠️ **PARTIALLY TRUE** — Core session/ticket flows often use `assertIdentityResolved`; **settings workspace PATCH helpers, share/copy helpers, capture widget, and some delete paths do not**; **backend APIs generally enforce workspace ownership**. |

**Overall:** ⚠️ **PARTIALLY TRUE**

---

## 2. Critical violations (Top 5)

1. **`components/billing/BillingUsageCacheInitializer.tsx`** — Fires `fetchBillingUsage()` on mount with **no `isIdentityResolved` / workspace gate** (client policy violation; unnecessary early authenticated request).
2. **`components/providers/AppBootGate.tsx` (`AppBootReadinessBridge`)** — Dismisses boot overlay for signed-in users only when **`claimsReady && workspaceId`** — conflicts with strict “shell only needs `authReady && authUid`”.
3. **`components/workspace/WorkspaceIdentityGate.tsx`** — **`!authReady` spinner** and **signed-in empty `workspaceId` full-screen block** — shell depends on more than `authUid`.
4. **`app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`** — Deep-link **`authFetch(/api/tickets/...)`** without explicit **`isIdentityResolved` guard** in the effect (backend mitigates).
5. **`components/workspace/WorkspaceSuspendedGuard.tsx`** — **`!authReady` spinner** before children (same class as #3 for first paint).

---

## 3. System grade

**B — Mostly safe**

Rationale: **Server-side auth + workspace checks and Firestore rules** provide strong containment for many “early” client calls; **client NBIB policy is not applied uniformly** (billing initializer, boot/identity gates, some actions without `assertIdentityResolved`).

---

## 4. Architecture verdict (one paragraph)

The system implements a **bounded, hybrid NBIB**: identity is centralized in `WorkspaceProvider` with a clear `isIdentityResolved` flag and **most** workspace-scoped Firestore listeners and API-backed views respect it, while **`useRenderReadiness` documents an intentional narrower shell readiness** (`authReady && authUid`) used for dashboard content stabilization. **Global chrome still waits on claims and workspace** via `AppBootReadinessBridge`, and **`WorkspaceIdentityGate` / `WorkspaceSuspendedGuard` block on `authReady`**, so the strict claim that the UI layer never depends on `claimsReady` or `workspaceId` is **not fully true**. **Data and actions are not 100% gated by `isIdentityResolved` on the client** (notably **`BillingUsageCacheInitializer`** and several mutation entry points without `assertIdentityResolved`), but **backend route patterns (`requireAuth`, `getUserWorkspaceIdRepo`, `withAuthorization`) and Firestore rules largely compensate**, yielding **mostly production-appropriate safety** with **documented client-side policy gaps** relative to the ideal model.
