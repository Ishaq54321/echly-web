# Phase 2 — Final Verification (NBIB: UI vs data gating)

**Scope:** Read-only review of the repo state under `app/(app)`, shared `(app)` layout/providers, and hooks/components they use. Extension, admin app, auth routes, onboarding, and scripts are noted only where they affect the same patterns.

**Definitions used:**

- **`isIdentityResolved`:** `authReady && claimsReady && non-empty workspaceId` (`lib/client/workspaceContext.tsx`).
- **UI blocking:** Early `return null`, full-page spinner/loader, or equivalent that prevents meaningful shell/content paint while waiting on identity/auth (skeleton/placeholder for a **region** counts as progressive, not full-page block).

---

## 1. Overall Status

**⚠️ PARTIAL** — Data paths for workspace-scoped features are largely gated on `isIdentityResolved` (or equivalent `workspaceId` + claims). The signed-in shell still uses **auth-first** overlays and some **main-area** loaders tied to `authReady` / `authUid`, and at least one **global `fetch` runs without** an `isIdentityResolved` guard.

---

## 2. UI Blocking Summary

### Search pattern results (representative)

| Pattern | Role | Blocks rendering? | Classification |
|--------|------|-------------------|----------------|
| `!isIdentityResolved` | Skeleton flags (`insights`, `overview`, `DiscussionList`, `DiscussionFeed`, etc.) | No — shows skeleton/placeholder in-region | ✅ CLEAN (progressive) |
| `!isIdentityResolved` | `WorkspaceSuspendedGuard` effect | No — children still render; fetch deferred | ✅ CLEAN |
| `!isIdentityResolved` | Data `useEffect` early `return` | N/A (not UI) | ✅ (see §3) |
| `!workspaceId` | Various guards with skeletons or no main return | Mixed | ⚠️ MIXED |
| `!claimsReady` | `useWorkspaceOverview` refresh path | No direct page return | ✅ CLEAN |
| `authLoading` | `useAuthGuard` → `loading = !authReady` | See below | 🚨 / ⚠️ |
| `useAuthGuard` | Many pages + `GlobalRail` | Redirect when unauthenticated (after `authReady`) | ⚠️ MIXED |

### 🚨 Blocking — UI waits on auth / identity-shaped readiness

1. **`AppBootGate`** (`components/providers/AppBootGate.tsx`): Fixed full-viewport `LogoLoader` overlay until `AppBootReadinessBridge` reports ready from **`authReady`** only (not full `isIdentityResolved`). Children mount underneath but are **not visible** until then — **shell visually blocked on first auth callback**.

2. **`app/(app)/dashboard/page.tsx`**: `useRenderReadiness().identityReady` is **`authReady && Boolean(authUid)`** (`lib/client/perception/useRenderReadiness.ts`), not `isIdentityResolved`. `showFullPageLoader` is true when **`!identityReady`** → **main dashboard content is a full-page spinner until Firebase auth has produced a uid** (workspace/claims can still be loading).

3. **`app/(app)/settings/page.tsx`**: `if (authLoading) return (... "Loading settings…")` — **full replacement of page** until `authReady`.

4. **`app/admin/layout.tsx`**: `if (authLoading \|\| !user)` and `if (!adminChecked)` return full-page loading — **admin only**, but same pattern.

### ⚠️ MIXED

- **`SessionOverviewPage`**: `showOverviewSkeleton` includes `!isIdentityResolved` and `authLoading` — **progressive** (header skeleton + main skeleton), not `return null` for identity alone. `return null` only for missing `sessionId` / redirect paths.
- **`InsightsPage`**: `showInsightsSkeleton` includes `authLoading` and `(authUser && !data && (loading \|\| !isIdentityResolved \|\| !workspaceId))` — **progressive** skeleton, immediate route chrome.
- **`DiscussionPage`**: Renders layout while `useAuthGuard().loading`; list uses **skeleton** when `!isIdentityResolved` via `DiscussionList` — progressive for signed-in shell.

### ✅ CLEAN (relative to “block whole page on `isIdentityResolved`”)

- **`WorkspaceIdentityGate`**: Replaces tree only on **`workspaceError`**, not while identity is still resolving — aligns with NBIB for the error-only full-page.
- **Session board (`SessionPageClient`)**: Always returns the **split layout**; empty/loading handled inside `TicketList` / `ExecutionView` (e.g. `feedbackLoading` → `ExecutionView` with `item={null}`), not a global identity gate.

**Totals (critical path / `(app)`):**

- **Full-viewport or full-page blockers tied to auth / auth-shaped readiness:** **3** primary (`AppBootGate`, dashboard main loader, settings auth gate) + **admin** if counted.
- **Key files:** `components/providers/AppBootGate.tsx`, `lib/client/perception/useRenderReadiness.ts`, `lib/client/perception/useAppBoot.ts`, `app/(app)/dashboard/page.tsx`, `app/(app)/settings/page.tsx`.

---

## 3. Data Safety Summary

### Rule checked

For each `fetch` / `authFetch` / `onSnapshot` / `getDoc` / `getDocs` in app data paths: is execution prevented until identity is resolved (typically `if (!isIdentityResolved) return` or equivalent such as `feedbackSessionId` derived from `isIdentityResolved`)?

### ✅ SAFE (correctly gated or equivalent)

| Location | Mechanism |
|----------|-----------|
| `useWorkspaceOverview` | `onSnapshot` only when `isIdentityResolved && userId && workspaceId`; refresh uses `isIdentityResolved && claimsReady` |
| `useSessionFeedbackPaginated` | Early return when `!isIdentityResolved \|\| !sessionId \|\| !workspaceId` |
| `useFeedbackDetailController` | Effects return when `!isIdentityResolved \|\| !authUid \|\| !workspaceId` (and feedback id where needed) |
| `useSessionOverview` | `load()` only when `isIdentityResolved && workspaceId` |
| `InsightsPage` | `onSnapshot` / `getDoc` effects: `authLoading` exit, `authUser`, `isIdentityResolved`, non-empty `workspaceId` |
| `DiscussionList` / `DiscussionFeed` | `if (!isIdentityResolved) return` / `if (!isIdentityResolved \|\| !workspaceId) return` before `authFetch` / Firestore |
| `DiscussionPanel` / `DiscussionThread` / `TicketDetailsPanel` | `authFetch` after `isIdentityResolved` checks in effects |
| `SessionPageClient` | `getDoc(session)` only when `!authLoading` and `isIdentityResolved && authUid && sessionId && workspaceId`; search `authFetch` only when `feedbackSessionId` (requires `isIdentityResolved`); deep-link ticket hydrate when `feedbackSessionId` |
| `useBillingUsage` | Waits for `authUid` and `isIdentityResolved` and trimmed `workspaceId` before `subscribeWorkspace` / refetch |
| `useWorkspaceUsageRealtime` | `if (!isIdentityResolved) { clearWorkspaceSubscription(); return }` before `subscribeWorkspace` |
| `useCommentsRepoSubscription` | `if (!enabled \|\| !isIdentityResolved \|\| !ws \|\| !sid \|\| !fid)` |
| `WorkspaceSuspendedGuard` | `authFetch("/api/workspace/status")` only when `authUid` **and** `isIdentityResolved` |
| `ProfileCommandPanel` | `authFetch("/api/insights")` only when `open && isIdentityResolved` |
| `app/admin/layout.tsx` | `authFetch("/api/admin/me")` only when `isIdentityResolved && authUid` |

### 🚨 LEAK (runs before `isIdentityResolved` in signed-in app tree)

| Location | Call | Note |
|----------|------|------|
| **`BillingUsageCacheInitializer`** (`components/billing/BillingUsageCacheInitializer.tsx`) | `fetchBillingUsage()` → `fetch("/api/billing/usage", …)` | `useEffect` schedules work **without** reading `isIdentityResolved`; runs under `(app)/layout.tsx` for all app routes. |

### ⚠️ RISK / special cases

| Location | Call | Note |
|----------|------|------|
| **`WorkspaceProvider`** (`lib/client/workspaceContext.tsx`) | `authFetch("/api/users", { method: "POST" })` then `getUserWorkspaceIdRepo` (Firestore) | **Inherent bootstrap:** `isIdentityResolved` cannot be true until this completes. Not a “leak” in the logical sense, but **does not** use `if (!isIdentityResolved) return` (impossible). |
| **`usePlanCatalog`** | `fetch("/api/plans/catalog")` on mount | Used from settings/billing UI; **no** `isIdentityResolved` check. Acceptable if catalog is public; **risk** if the API assumes a resolved workspace session. |
| **Repository helpers** (`lib/repositories/*.ts`, `lib/sessions.ts`, `lib/feedback.ts`, etc.) | Various `authFetch` / `getDoc` | **Call-site dependent**; safe when only invoked from gated hooks/effects (e.g. overview `load()`). |

**Counts (feature-focused):**

- **Leaks (strict checklist):** **1** clear app-wide case — **`BillingUsageCacheInitializer`**.
- **Safe gated calls:** **Dominant** across dashboard, session, discussion, insights hooks/components listed above.

---

## 4. Loading Behavior

### 🚨 INVALID — tied to identity (state or UI)

- **`useWorkspaceOverview`**: In the `userId/workspaceId` effect, `setLoading(true)` when `isIdentityResolved`, else `setLoading(false)` — **loading flag explicitly flips with identity resolution**, not only with network/subscription completion (though snapshot also drives behavior). **Couples “loading” semantics to identity boundary.**

- **`app/(app)/dashboard/page.tsx`**: **Full-page loader** driven by **`!identityReady`** (`authReady && authUid`) — **UI loading tied to auth**, not to “sessions request in flight” alone.

### ✅ VALID — tied to data fetch / subscription

- **`DiscussionList`**, **`DiscussionFeed`**, **`TicketDetailsPanel`**, **`DiscussionThread`**, **`DiscussionPanel`**: `setLoading(true)` **inside** effects that already passed `isIdentityResolved` (or workspace) gates.
- **`InsightsPage`**: `setLoading(true)` immediately before `onSnapshot` attachment after guards.
- **`useSessionOverview`**: `setLoading(true)` at start of `load()` after `isIdentityResolved && workspaceId`.

### ⚠️ MIXED

- **`InsightsPage`**: `showInsightsSkeleton` true when `authLoading` — **skeleton tied to `authReady`**, not only data `loading`.

---

## 5. Page Behavior

| Page | Renders immediately? | Notes | Classification |
|------|----------------------|-------|------------------|
| **Discussion** (`app/(app)/discussion/page.tsx`) | Yes — layout + chrome; list skeleton while identity pending | Signed-out: dedicated message when `!user && !loading` | ✅ PROGRESSIVE |
| **Insights** (`app/(app)/dashboard/insights/page.tsx`) | Yes — page structure; skeleton when `authLoading` or pending identity/data | Unauthenticated card when `!authLoading && !authUser` | ⚠️ MIXED (skeleton includes `authLoading`) |
| **Session overview** (`app/(app)/dashboard/[sessionId]/overview/page.tsx`) | Yes — skeletons for header/main until session + identity | Redirect `null` only for bad `sessionId` / missing session after load | ⚠️ MIXED (skeleton keys off `!isIdentityResolved`) |
| **Dashboard** (`app/(app)/dashboard/page.tsx`) | Shell (header) renders; **main body** is full-page spinner until `authReady && authUid` | Uses `useRenderReadiness`, not `isIdentityResolved` | 🚨 BLOCKING PAGE (main column) |

---

## 6. Skeleton / Fallback Presence

- **Discussion:** `DiscussionListSkeleton`, `DiscussionFeed` skeleton — ✅ placeholders when identity/data not ready.
- **Insights:** `InsightsPageSkeleton` — ✅.
- **Overview:** `OverviewHeaderSkeleton`, `OverviewMainSkeleton` — ✅.
- **Dashboard:** When `showFullPageLoader`, **spinner** (`Loader2`) for main content — ❌ **not** a structured skeleton for the sessions area (header `SessionsHeader` still mounts above the spinner region per structure).
- **Session board:** In-panel loading via `ExecutionView` / list — ✅ progressive.

---

## 7. Global Rule Validation

**Target rule:** *“UI renders without identity, data waits for identity.”*

| Clause | Holds everywhere? |
|--------|-------------------|
| **Data waits for identity** | **Mostly yes** for workspace-scoped Firestore/API usage in audited feature code; **exception:** `BillingUsageCacheInitializer` fires `fetch("/api/billing/usage")` without `isIdentityResolved`; plus **unavoidable** identity bootstrap in `WorkspaceProvider`. |
| **UI never blocked by identity** | **No** — **`AppBootGate`** hides the shell until `authReady`; **dashboard** main area waits on `authUid`; **settings** waits on `authReady`. |

**Conclusion:** The rule is **not** true globally; it is **approximately** true for **data** in feature modules, with noted gaps.

---

## 8. System Grade

**B — Mostly correct**

- Strong **data gating** on `isIdentityResolved` (or stricter) across session, discussion, insights Firestore/API, and most hooks.
- **UI** still couples **shell visibility** and **some pages** to **auth readiness** (`authReady` / `authUid`) and uses a **global billing `fetch`** without the identity gate.

---

## 9. One-line Verdict

**System still has identity-coupled UI or data leaks** (notably the boot overlay and dashboard/settings auth-shaped loaders, and ungated billing usage prefetch in `BillingUsageCacheInitializer`).

---

## 10. Phase 2 done?

**Not fully.** We can say Phase 2 is **partially** achieved: **workspace data** is largely decoupled and gated on **`isIdentityResolved`**, while **UI** still waits on **auth** in several high-traffic places, and **one global data call** does not wait on **`isIdentityResolved`**.

**Exact hotspots for follow-up (informational only — no fixes in this audit):**

1. `components/providers/AppBootGate.tsx` + `AppBootReadinessBridge` (readiness = `authReady` only).
2. `app/(app)/dashboard/page.tsx` + `useRenderReadiness` (`identityReady` ≠ `isIdentityResolved`).
3. `app/(app)/settings/page.tsx` (`authLoading` full-page return).
4. `components/billing/BillingUsageCacheInitializer.tsx` (`fetchBillingUsage` without identity gate).
