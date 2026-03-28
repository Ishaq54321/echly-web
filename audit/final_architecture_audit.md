# Final architecture audit (Phases 1–5, excluding perception-layer deep-dive)

**Scope:** Read-only review of the repository against the stated contracts. Skeletons, animation, and visual polish are out of scope per instructions. Perception hooks (`useStableState`, `useStableRenderState`, `useAppBoot`, etc.) are not audited as a layer; only structural side effects tied to them are noted where they intersect identity or data.

**Method:** Pattern searches (`authReady`, `authUid`, `useAuthGuard`, `!isIdentityResolved`, `fetch` / `authFetch`, `onSnapshot`, `getDoc` / `getDocs`, `useEffect`, `assertIdentityResolved`, HTTP verbs in client code) plus explicit reads of the files listed in the brief.

---

## Section 1 — UI layer audit

**Searches:** `authReady`, `authUid`, `useAuthGuard`, `!isIdentityResolved`, `!workspaceId`, `return null`, full-screen–style replacement patterns.

### Findings

| Area | Behavior vs contract |
|------|----------------------|
| **`app/(app)/layout.tsx`** | Shell always mounts: `AppBootGate` → `WorkspaceProvider` → `WorkspaceSuspendedGuard` → `WorkspaceIdentityGate` → children. No route-level `return null` waiting on identity. **Aligns with “render immediately” for the chrome.** |
| **`WorkspaceIdentityGate.tsx`** | Renders `children` first; `workspaceError` adds `OverlayError` on top. **Not** a full unmount of the shell. **Clean** for blocking. |
| **`useAuthGuard`** (`lib/hooks/useAuthGuard.ts`) | `loading = !ws.authReady` — ties “loading” to `authReady`. **Violates strict Phase 1** if interpreted as “UI must not depend on authReady” for any consumer logic. |
| **`SessionPageClient.tsx`** | Uses `useAuthGuard({ router })` for redirect; main UI still renders. Session `getDoc` effect **returns early when `authLoading`** without clearing `session` in that branch (stale title/meta possible for one frame/transition). **Mixed** (data timing coupled to `authLoading`). |
| **`insights/page.tsx`**, **`settings/page.tsx`**, **`discussion/page.tsx`**, **`admin/layout.tsx`** | Use `useAuthGuard` and/or `authUser` / `authLoading` in effects or conditional layout (e.g. discussion: dedicated layout when `!user && !loading`). **Mixed** — identity/auth signals influence what is shown or when effects run. |
| **`settings/page.tsx`** | On workspace error / missing workspace after resolution, **returns a full-page centered error** instead of only overlaying (contrast with `WorkspaceIdentityGate`). **Violates Phase 3.5 “no full UI replacement”** under a strict reading. |
| **`app/onboarding/page.tsx`** | Blocks on local `authReady` + spinner (`if (loading || !authReady)`). Outside `(app)` shell but shows **auth-gated render**. Noted for completeness. |
| **`AppBootReadinessBridge`** (`components/providers/AppBootGate.tsx`) | Reads `authReady` from `useWorkspace` and feeds `useAppBoot` for chrome only; does not remove `children`. **OK for shell**; perception implementation not graded. |

### Classification — UI layer

**⚠️ MIXED** — The app shell and identity gate do not globally block on identity, but multiple routes and hooks still **depend on `authReady` / `useAuthGuard` loading / `authUser`** for timing or layout. Settings uses a **page-level replacement** for some error paths.

---

## Section 2 — Data layer audit

**Searches:** `fetch(`, `authFetch(`, `onSnapshot`, `getDoc`, `getDocs` in client paths.

### Gated by `if (!isIdentityResolved) return` (or equivalent strong gate)

| Location | Gate |
|----------|------|
| `useWorkspaceOverview.ts` | Firestore `onSnapshot` on `sessions` — `!isIdentityResolved \|\| !userId \|\| !workspaceId`. `refreshSessions` checks `isIdentityResolved` + `claimsReady`. |
| `useSessionFeedbackPaginated.ts` | Listener and counts paths use `isIdentityResolved` + `workspaceId` / `sessionId`. |
| `useSessionOverview.ts` | Effect bails until `isIdentityResolved && workspaceId`; `useAsyncGeneration` for stale guards. |
| `useBillingUsage.ts` | `!authUid \|\| !isIdentityResolved \|\| trimmedWorkspace == null`. |
| `BillingUsageCacheInitializer.tsx` | `if (!isIdentityResolved) return`. |
| `useWorkspaceUsageRealtime.ts` | Retain listener only when `isIdentityResolved` and valid `workspaceId`. |
| `insights/page.tsx` | Insights doc `onSnapshot` and session-title `getDoc` batch: `authLoading` / `authUser` / `isIdentityResolved` / `workspaceId`. |
| `DiscussionFeed.tsx`, `DiscussionList.tsx`, `DiscussionThread.tsx` / `DiscussionPanel.tsx` | Fetch / Firestore guarded by `isIdentityResolved` (and workspace where needed). |
| `ProfileCommandPanel.tsx` | `authFetch("/api/insights")` only when `open && isIdentityResolved`. |
| `useCommentsRepoSubscription.ts` | `!isIdentityResolved` → no `listenToCommentsRepo`. |

### Intentional or structural exceptions

| Location | Note |
|----------|------|
| **`workspaceContext.tsx`** | `onAuthStateChanged` runs `authFetch("/api/users", { method: "POST" })` and `getUserWorkspaceIdRepo` **before** `isIdentityResolved` can be true — this **is** the identity bootstrap. **Not a “leak” in the sense of skipping the gate; it defines the gate.** |
| **`WorkspaceSuspendedGuard.tsx`** | `authFetch("/api/workspace/status")` after `authUid` and `isIdentityResolved`. **Safe** for workspace-scoped status. |
| **`usePlanCatalog.ts`** | `fetch(CATALOG_API)` — catalog, not workspace identity. **Out of band** for this contract. |
| **`components/share/useShareCounts.ts`** | `fetch("/api/feedback/counts?...")` with `sessionId` + `token` — share/public-style surface; **no `isIdentityResolved`**. By design for that route; **not** the same threat model as signed-in Firestore. |
| **`lib/repositories/*.ts` (client)** | `getDoc` / `getDocs` / `onSnapshot` in repositories have **parameter-level** checks (`workspaceId` required) but **no** built-in `isIdentityResolved` — **callers must gate**. Audited call sites above generally do. |
| **`getWorkspace` / `listenToWorkspace`** (`workspacesRepository.ts`) | `getDoc` / store subscription; **settings** wires `listenToWorkspace` inside `useEffect` with `isIdentityResolved && workspaceId`. **Safe** at that call site. |

### Classification — Data layer

**⚠️ RISK** — Subscription and list/overview paths are **consistently** identity-gated. Residual risk: **low-level repo and `authFetch` helpers** can be called from new code without gates; **bootstrap** in `WorkspaceProvider` is the only deliberate pre-`isIdentityResolved` client fetch. Share/catalog paths are **ungated by design**.

---

## Section 3 — Action layer audit

**Searches:** `assertIdentityResolved`, client `POST` / `PATCH` / `DELETE` via `authFetch`, and early `if (!workspaceId) return` / `if (!authUid) return` on mutation paths.

### `assertIdentityResolved(isIdentityResolved)` present (representative)

`SessionPageClient.tsx`, `useWorkspaceOverview.ts` (create / archive / delete session), `SessionsWorkspace.tsx`, `DiscussionThread.tsx`, `DiscussionPanel.tsx`, `settings/page.tsx` (save actions), `GlobalNavBar.tsx`, `TopControlBar.tsx`, `SessionActionsDropdown.tsx`, `ShareModal.tsx`, overview `page.tsx` (copy link), `useFeedbackDetailController.ts`.

### Gaps vs strict contract

| Issue | Detail |
|-------|--------|
| **Shared libs without assert** | `lib/comments.ts`, `lib/feedback.ts`, `lib/sessions.ts`, `lib/repositories/workspacesRepository.ts` perform `authFetch` with `POST`/`PATCH`/`DELETE` **without** `assertIdentityResolved`. Enforcement is **at call sites**, not in the API wrapper. **Any new caller can skip assert.** |
| **Silent early returns before assert** | e.g. `DiscussionThread.tsx` `handleSendComment` / `handleAttachmentSend`: `if (!authUid \|\| !feedbackId \|\| ...) return` **before** `assertIdentityResolved`. If those fields were ever inconsistent with `isIdentityResolved`, the handler would **exit silently** (no throw). **Violates “ALWAYS assert” + “NEVER silently fail” under strict reading.** |
| **`handleCreateSession`** (`useWorkspaceOverview.ts`) | Calls `assertIdentityResolved(isIdentityResolved)` then `if (!claimsReady \|\| !workspaceIdRef.current) return` — **no throw**; optimistic UI may already have been applied in other flows; here create bails quietly if ref empty. **Partial.** |
| **Admin** | `app/admin/customers/page.tsx` `runAction` uses `POST` to `/api/admin/workspaces/actions` **without** `assertIdentityResolved` (admin layout gates fetch of `/api/admin/me` on identity, but actions are not wrapped in assert). **Partial / separate surface.** |
| **Onboarding** | `authFetch("/api/workspaces", { method: "POST" })` from `app/onboarding/page.tsx` — no `assertIdentityResolved` (different flow). **Expected exception.** |
| **`ProfileCommandPanel.tsx`** | `fetch("/api/auth/logout", { method: "POST", ... })` — logout; not a workspace mutation. **Excluded** from workspace-assert rule. |

### Classification — Action layer

**⚠️ PARTIAL** — Core dashboard and discussion entry points **often** assert, but **assert is not universal** on every mutation path, and **repository / lib** layers do not enforce it. **Silent returns** exist alongside assert.

---

## Section 4 — System consistency audit

**Checks:** Optional guards, conditional assertions, UI replacement.

### Findings

- **`assertIdentityResolved`** is a hard throw — **not** optional once invoked.
- **Dual patterns** for workspace failure: global **`OverlayError`** (identity gate) vs **settings full-page error** — **inconsistent** with a single “never replace shell” rule.
- **`listenToWorkspace(..., claimsReady)`** uses **`claimsReady`** as an additional parameter vs a single `isIdentityResolved` boolean — **overlapping concepts**; consistent in settings because `isIdentityResolved` implies both, but the API exposes **two knobs**.
- **Capture widget** (`useCaptureWidget.ts`): requires `assertIdentityBeforeWorkspaceMutations`; throws **“Identity guard missing”** if absent when `guardWorkspaceMutation` runs. **Extension** passes it (`echly-extension/src/content.tsx`). **Web** path: `CaptureWidget` is not mounted from `components/` tree in the same way; if mounted without the prop, mutations would throw — **consistent internal rule**, not `assertIdentityResolved` by name.

### Classification — System consistency

**⚠️ VIOLATIONS** — Multiple enforcement styles (overlay vs page replacement; assert at hook vs silent return; repo without assert).

---

## Section 5 — Effect gating audit

**Approach:** Spot-check high-risk `useEffect` clusters tied to identity.

| File / hook | Identity in deps / guard | Notes |
|-------------|-------------------------|--------|
| `workspaceContext.tsx` | N/A (defines identity) | Generation ref + `cancelled` on async sync. |
| `SessionPageClient.tsx` | Search, deep-link hydrate, `getDoc` session load | `getDoc` also gated on `authLoading`. |
| `useWorkspaceOverview.ts` | Sessions listener: `[isIdentityResolved, userId, workspaceId]` | Cache hydration effect uses `userId` + `workspaceId` without `isIdentityResolved` in deps (see Section 2 — typically aligned with commit order). |
| `useSessionFeedbackPaginated.ts` | `[isIdentityResolved, sessionId, workspaceId, ...]` | Counts + subscribe effects include `isIdentityResolved`. |
| `useSessionOverview.ts` | `[isIdentityResolved, workspaceId, sessionId, ...]` | Stale token via `useAsyncGeneration`. |
| `BillingUsageCacheInitializer.tsx` | `[isIdentityResolved]` | **Clean.** |
| `WorkspaceSuspendedGuard.tsx` | `[isIdentityResolved, authUid]` | Fetch only when resolved + uid; `cancelled` on async. **Clean.** |
| `insights/page.tsx` | Mixed `authLoading`, `authUser?.uid`, `isIdentityResolved`, `workspaceId` | **Extra** auth-user coupling beyond `isIdentityResolved` alone. |

### Classification

**⚠️ MIXED** — Most workspace data effects include `isIdentityResolved` (or equivalent composite). **Session page** and **insights** additionally gate on **`authLoading` / `authUser`**, which is **stricter than the written “single gate” ideal** but introduces **multiple preconditions**.

---

## Section 6 — Listener management (`onSnapshot`)

| Location | Cleanup | Duplicate risk |
|----------|---------|----------------|
| `useWorkspaceOverview.ts` | `return () => unsubscribe()` | Single effect per mount + workspace. |
| `useSessionFeedbackPaginated.ts` | Unsub in cleanup | **OK.** |
| `insights/page.tsx` | Unsub in cleanup; `insightsDocWidRef` guards stale updates | **OK.** |
| `workspaceStore.ts` | `retainWorkspaceFirestoreListener` ref-count; swap unsub on workspace change; `clearWorkspaceSubscription` on sign-out | **OK** — explicit **de-dup** for same `workspaceId`. |
| `commentsRepository.ts` `listenToCommentsRepo` | Returns `onSnapshot` unsub; **`useCommentsRepoSubscription`** cleans up | **OK.** |

### Classification

**✅ SAFE** — Cleanups and workspace listener ref-counting are **present**; snapshot handlers use **workspace-id / gen** checks where relevant.

---

## Section 7 — Async safety (`async` / `await` / `setState`)

| Pattern | Where | Verdict |
|---------|-------|---------|
| `cancelled` flag + early return after `await` | `SessionPageClient`, `DiscussionThread`, `DiscussionFeed`, `WorkspaceSuspendedGuard`, `ProfileCommandPanel`, insights title fetch, etc. | **Present** widely. |
| Generation / token | `useSessionOverview` (`useAsyncGeneration`), `useWorkspaceOverview` (`sessionsSnapshotGenRef` + `shouldApply` for counts) | **Latest-result** intent for counts and overview. |
| `useSafeAsync` | Exported from `lib/hooks/useSafeAsync.ts` | Used by `useSessionOverview`; not universal across all hooks. |

### Classification

**⚠️ RISK** — Strong patterns on critical paths; **not every** async effect uses a generation token — reliance on `cancelled` + ref checks is **typical**.

---

## Section 8 — Critical file validation

| File | Role vs contract |
|------|------------------|
| **`AppBootGate.tsx`** | Shell always renders children; `AppBootReadinessBridge` reports readiness using `authReady` (perception hook). **Does not block layout.** |
| **`WorkspaceIdentityGate.tsx`** | Overlay on error; children stay mounted. **Aligned.** |
| **`WorkspaceSuspendedGuard.tsx`** | Children always mounted; overlay on status fetch error; redirect when suspended. **Data gated** on `isIdentityResolved` + `authUid`. |
| **`workspaceContext.tsx`** | Single source for `isIdentityResolved`; bootstrap `POST /api/users` + workspace resolution; sign-out clears store + `clearWorkspaceSubscription()`. **Architectural anchor.** |
| **`BillingUsageCacheInitializer.tsx`** | Fetches billing usage only when `isIdentityResolved`. **OK.** |
| **`useWorkspaceOverview.ts`** | Firestore + counts + mutations: listener **gated**; mutations use **assert** (with noted **silent return** on create guard). |
| **`SessionPageClient.tsx`** | Mutations **assert**; session `getDoc` tied to **`authLoading`**; search / deep link **identity-gated**. |
| **`useSessionOverview.ts`** | **Fully gated** + **async generation** for stale safety. **Strong.** |
| **`useCaptureWidget.ts`** | **Mandatory** `assertIdentityBeforeWorkspaceMutations` for workspace mutations (throws if missing). **Strong internal contract** (not `assertIdentityResolved` symbol). |
| **`workspaceStore.ts`** | **Single** Firestore listener with **ref-count**, **swap** on workspace change, **stale** doc id checks in handler. **Strong.** |

---

## 1. Overall status

**⚠️ PARTIAL** — Identity-gated subscriptions and workspace store behavior are **production-grade** in the audited paths, but the codebase **does not uniformly** satisfy the **strict** Phase 1 / Phase 3 / Phase 3.5 wording across **all** surfaces.

---

## 2. UI layer

- **Blockers (vs strict contract):** `useAuthGuard` / `authLoading` / `authUser` used for **effect timing and layout** on multiple pages; **settings** full-page error path; **onboarding** auth spinner gate.
- **Status:** **⚠️ MIXED**

---

## 3. Data layer

- **Leaks:** No evidence of Firestore listeners starting **without** `isIdentityResolved` in the audited subscription hooks; **bootstrap** `POST` in `WorkspaceProvider` is **pre-resolution by design**. Share/catalog fetches are **ungated**.
- **Status:** **⚠️ RISK** (caller discipline + intentional exceptions)

---

## 4. Action layer

- **Unsafe paths:** **Lib/repo** mutations without assert; **admin** POST actions without assert; **silent** early returns **before** assert on some handlers.
- **Status:** **⚠️ PARTIAL**

---

## 5. System consistency

- **Violations:** **Overlay vs full-page** error handling; **assert not centralized** in mutation libraries; **multiple** preconditions (`authLoading` + `isIdentityResolved`).
- **Status:** **⚠️ VIOLATIONS** (relative to strict Phase 3.5)

---

## 6. Race condition safety

- **Issues:** `SessionPageClient` session load **skips** `setSession(null)` when `authLoading` is true; not all async flows use **generation tokens** (mostly `cancelled` + refs).
- **Status:** **⚠️ MIXED** — **Strong** in `workspaceStore`, session overview, and paginated feedback listener; **gaps** are **localized**.

---

## 7. System grade

**B — Strong but minor gaps** (relative to a **lenient** production bar).

If graded **only** against the **literal** contract in the brief (especially Phase 1 “no authReady / authUid dependency” and Phase 3 “ALWAYS assert on every mutation path”), the grade would trend **C — Hybrid**.

---

## 8. Final verdict

**The system still contains structural violations** relative to the **strict** written contract (universal non-dependence on auth signals for UI timing, universal `assertIdentityResolved` on every mutation including libs/admin, no page-level UI replacement, single gate everywhere).

We can state with certainty that **signed-in dashboard Firestore subscriptions and the workspace realtime store are largely identity-gated and listener-safe**, and that **core session/dashboard mutations generally assert**, but the **system as a whole is not fully uniform** under the Phase 1–3.5 rules as stated.

---

*End of audit. No code was modified. No fix recommendations per instructions.*
