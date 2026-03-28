# Final system verification — NBIB + data + action enforcement

**Scope:** Read-only review of the repository as of the audited tree (Next.js app, shared `lib/`, `components/`, `echly-extension/` where relevant).  
**Method:** Pattern searches for `authReady`, `authUid`, `identityReady`, `useAuthGuard`, `!isIdentityResolved`, `!workspaceId`, `fetch(`, `authFetch(`, `onSnapshot`, `getDoc`, `getDocs`, `assertIdentityResolved`, `setLoading(true)`, and targeted reads of the critical files listed in the request.

**Strict audit criterion (as given):**  
- UI: render immediately; no full-screen loaders; no early return based on identity.  
- Data: **all** access gated by `isIdentityResolved` (literally `if (!isIdentityResolved) return` or equivalent control flow).  
- Actions: **all** mutations use `assertIdentityResolved(isIdentityResolved)`; no silent failures; no `if (!workspaceId) return` / `if (!authUid) return` as sole guards without assert where mutations occur.

---

## Section 1 — UI layer verification

### Search targets observed

| Pattern | Primary roles |
|--------|----------------|
| `authReady` | `WorkspaceProvider` state; `AppBootReadinessBridge` / `useAppBoot` |
| `authUid` | Workspace context; guards in discussion, suspended guard, copy flows |
| `identityReady` | `useRenderReadiness.ts`: `authReady && Boolean(authUid)` (distinct from `isIdentityResolved`) |
| `useAuthGuard` | `loading = !ws.authReady`; redirect when `user == null` after loading |
| `!isIdentityResolved` | Dashboard skeleton, insights skeleton, session/overview hooks, billing init, many discussion components |
| `!workspaceId` | Settings load gates, dashboard disabled CTAs, repository guards |

### Does any UI return null, full-page loader, or block render on identity/auth?

| Location | Behavior | Classification |
|----------|----------|----------------|
| `components/providers/AppBootGate.tsx` | `AppBootGate` always renders children; `AppBootReadinessBridge` returns `null` (no UI cover). | **CLEAN** for shell cover |
| `components/workspace/WorkspaceIdentityGate.tsx` | On `workspaceError`, replaces **entire** subtree with centered full-viewport message (min-h-screen). | **BLOCKING** (error-driven full replacement; still identity/workspace resolution outcome) |
| `components/workspace/WorkspaceSuspendedGuard.tsx` | Renders `StatusErrorScreen` (min-h-screen) when `authUid && statusError`. | **BLOCKING** (full-screen on status fetch failure while signed in) |
| `app/(app)/dashboard/page.tsx` | No `return null`; uses list **skeleton** when `!isIdentityResolved \|\| (sessionsLoading && empty)`. | **MIXED** (shell renders; primary content deferred via skeleton tied to identity) |
| `app/(app)/dashboard/insights/page.tsx` | `showInsightsSkeleton` includes `authLoading` and `(!isIdentityResolved \|\| !workspaceId?.trim())`. | **MIXED** |
| `app/(app)/settings/page.tsx` | `sectionLoading = authLoading \|\| loadingWorkspace`; tabs get `loading` from auth. | **MIXED** |
| `app/(app)/discussion/page.tsx` | When `!user && !loading`, dedicated “sign in” layout (not `null`, but branch on auth-derived `user`). | **MIXED** |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Renders layout; data/search gated via `feedbackSessionId` / hooks; `useEffect` for `getDoc` waits `authLoading`. | **MIXED** (no global null for identity; auth loading delays session doc) |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | `return null` for bad `sessionId` / redirect paths; skeleton when `!isIdentityResolved` etc. | **MIXED** |
| `useAuthGuard` consumers (overview, settings, insights, `SessionPageClient`, admin, `GlobalNavBar` indirect, `GlobalRail`, `ProfileDropdown`) | `loading` is **`!authReady`**, not `!isIdentityResolved`. | **MIXED** (auth-ready vs NBIB “never block shell”) |
| `components/ui/LogoLoader.tsx` | Component exists; **no** in-repo imports found outside its file (no active full-screen logo gate from this component in the searched tree). | **N/A** |

### UI layer summary

- **Blockers:** Full-viewport replacement in `WorkspaceIdentityGate` (workspace error) and `WorkspaceSuspendedGuard` (status error while `authUid` set). Widespread **skeleton / loading** driven by `!isIdentityResolved` and **`authLoading` from `useAuthGuard`**.
- **Status:** **MIXED** — shell and chrome generally paint; multiple routes and the settings experience still **couple visible loading and content readiness to `authReady` / `isIdentityResolved`**, and two guards can **occupy the full viewport**.

---

## Section 2 — Data layer verification

### Representative `fetch` / `authFetch` / Firestore reads

**Gated by `isIdentityResolved` (or stricter) in the immediate caller / hook:**

- `BillingUsageCacheInitializer.tsx` — effect bails with `if (!isIdentityResolved) return` before `fetchBillingUsage`.
- `useWorkspaceOverview.ts` — `onSnapshot` subscription inside `if (!isIdentityResolved \|\| !userId \|\| !workspaceId) return`; `refreshSessions` uses `if (!isIdentityResolved \|\| !workspaceIdRef.current \|\| !claimsReady) return`.
- `useSessionFeedbackPaginated.ts`, `useCommentsRepoSubscription.ts`, `useSessionOverview.ts`, `useFeedbackDetailController.ts` — identity/workspace gates before loads/subscriptions.
- `SessionPageClient.tsx` — `getDoc(sessionRef)` only after `!authLoading` and `isIdentityResolved && authUid && sessionId && workspaceId`.
- `app/(app)/dashboard/insights/page.tsx` — `onSnapshot` and `getDoc` session titles: `authLoading` / `authUser` / `isIdentityResolved` / `workspaceId` checks.
- `components/discussion/*` — `DiscussionFeed`, `DiscussionList`, `DiscussionPanel`, `DiscussionThread`, `TicketDetailsPanel`: early returns using `isIdentityResolved` (and often `workspaceId`) before `authFetch` / `getDocs` / `getDoc`.
- `WorkspaceSuspendedGuard.tsx` — `authFetch("/api/workspace/status")` only after `authUid` and `isIdentityResolved`.
- `app/admin/layout.tsx` — `authFetch("/api/admin/me")` after `isIdentityResolved`.

**Not gated by `isIdentityResolved` in the client hook (by literal pattern):**

- `lib/client/workspaceContext.tsx` — `authFetch("/api/users", { method: "POST" })` inside `onAuthStateChanged` **before** `isIdentityResolved` can be true (identity bootstrap). **Expected**, but it violates the letter of “all data access requires `isIdentityResolved`” if that rule is read absolutely.
- `lib/hooks/usePlanCatalog.ts` — `fetch("/api/plans/catalog")` on mount with **no** workspace/identity check. **Public catalog** assumption; still **not** behind `isIdentityResolved`.
- `components/share/useShareCounts.ts` — `fetch("/api/feedback/counts?...")` with `credentials: "include"`; **no** `isIdentityResolved` gate in the hook (relies on route + session). **RISK** vs strict rule.
- `lib/state/fetchCountsDedup.ts` — `authFetch` for counts; callers are expected to gate (e.g. overview hook). **SAFE** only by call-chain discipline.
- `echly-extension/**` — numerous `fetch` / `authFetch` paths; **not** using `isIdentityResolved` (different runtime). **OUT OF SCOPE** for dashboard contract unless “system” means entire monorepo — then **RISK**.

**`useWorkspaceOverview.ts` nuance (⚠️ RISK):**

- Effect keyed on `[userId, workspaceId, isIdentityResolved]` runs when `userId && workspaceId` without requiring `isIdentityResolved` on the **first line**: it hydrates from `sessionStorage` / resets state. If `workspaceId` were ever stale relative to `userId` during a transition, this could briefly align UI to the wrong cache key. `WorkspaceProvider` does not clear `workspaceId` at the **start** of a new user’s sync (only on sign-out path in the same handler). **Architectural RISK**, not proven exploit in a single static read.

### Data layer summary

- **Leaks:** None proven as “unauthenticated Firestore/API read” in the main dashboard hooks reviewed; **strict rule failure** is **yes**: several **`fetch` paths are not explicitly gated by `isIdentityResolved`** (`usePlanCatalog`, `useShareCounts`, identity bootstrap `POST /api/users`, and extension).
- **Status:** **RISK** against the **literal** contract; **mostly SAFE** if the contract is interpreted as “workspace-scoped reads wait for `isIdentityResolved`” and public/bootstrap endpoints are excluded.

---

## Section 3 — Action layer verification

### `assertIdentityResolved(isIdentityResolved)` usage (non-exhaustive but high-signal)

Present on many user-initiated and session mutations: e.g. `GlobalNavBar`, `TopControlBar`, `SessionActionsDropdown`, `SessionsWorkspace`, `ShareModal`, `settings/page.tsx` (save actions), `SessionPageClient` (multiple handlers), `useFeedbackDetailController`, `useWorkspaceOverview` (`handleCreateSession`, `setSessionArchived`, `deleteSession`), `DiscussionThread` / `DiscussionPanel`, etc.

### Gaps vs the strict action contract

| Issue | Detail | Classification |
|-------|--------|----------------|
| Optional mutation guard in capture core | `useCaptureWidget` calls `assertIdentityBeforeWorkspaceMutations?.()` — **optional**. `echly-extension/src/content.tsx` mounts `CaptureWidget` **without** passing `assertIdentityBeforeWorkspaceMutations`. | **UNSAFE** / **PARTIAL** under “all mutations must assert” for the **extension + core** surface |
| Early returns without assert | Many handlers use `if (!authUid) return` or `if (!workspaceId) return` **before** or **instead of** assert (e.g. discussion comment paths). Some paths call `assertIdentityResolved` immediately after; others rely on no-op returns. | **PARTIAL** |
| Silent failure patterns | Several `authFetch` call sites treat `!res` as rollback + `return` without surfacing error (e.g. `useWorkspaceOverview` create session, `setSessionArchived`). | **PARTIAL** (“no silent failures” is **not** fully met) |
| `updateSession` in `useWorkspaceOverview` | Local optimistic patch only; **no** `assertIdentityResolved` (not a network mutation). | **SAFE** for strict “mutation = network” reading |
| Logout | `ProfileCommandPanel` `fetch("/api/auth/logout", …)` — no `assertIdentityResolved` (sign-out is intentional). | **Exception** |

### Action layer summary

- **Unsafe mutations:** **CaptureWidget** workspace mutations can run with **no** `assertIdentityResolved` when the optional callback is omitted (confirmed for **extension** host).
- **Status:** **PARTIAL** for the web app’s primary dashboards; **UNSAFE** if the **extension + shared `useCaptureWidget`** is included in “the system.”

---

## Section 4 — Loading state validation

| Location | Trigger | Classification |
|----------|---------|----------------|
| `useWorkspaceOverview.ts` | `setLoading(true)` in `refreshSessions` after `isIdentityResolved` gate; also `setLoading(true)` when `userId`/`workspaceId` change **if** `isIdentityResolved`, else `setLoading(false)`. | **MIXED** (identity-linked loading flags) |
| `BillingUsageCacheInitializer.tsx` | `setLoading(true)` only after `isIdentityResolved`. | **VALID** |
| `useBillingUsage.ts` | Loading tied to fetch path with `isIdentityResolved` checks. | **MIXED** / mostly data-driven |
| `app/(app)/dashboard/insights/page.tsx` | `setLoading(true)` inside effects that also require `authUser` / `isIdentityResolved`. | **MIXED** |
| `app/(app)/settings/page.tsx` | `sectionLoading` includes **`authLoading`** from `useAuthGuard`. | **INVALID** under “loading must not be triggered by identity/auth” |
| Discussion / session overview components | Loading flags align with gated `authFetch` / Firestore batches after identity. | **VALID** / **MIXED** |

### Loading summary

- **Invalid patterns:** **Settings** (and any UI keyed off `useAuthGuard().loading`, i.e. **`!authReady`**) ties **perceived loading** to **auth initialization**, not only to workspace data fetch.
- **Status:** **MIXED**

---

## Section 5 — Global rule validation

**Is this true everywhere: “UI renders immediately, data waits for identity, actions require identity”?**

- **UI renders immediately:** **Partially.** Layout and many pages paint, but **full-viewport error screens**, **skeletons tied to `!isIdentityResolved`**, and **auth-derived loading** break a strict reading of “immediately” and “no blocking.”
- **Data waits for identity:** **Mostly** for workspace-scoped Firestore listeners and `authFetch` in dashboard/discussion hooks; **not** for catalog fetch, share counts hook, or bootstrap `POST /api/users`.
- **Actions require identity:** **Mostly** in app routes via `assertIdentityResolved`; **not** uniformly in **capture engine** when the assert prop is omitted.

**Verdict on the global sentence:** **False** if enforced literally across all client modules including extension and public fetches.

---

## Section 6 — Critical file check

| File | No UI blocking | No data leaks (strict rule) | Mutations asserted |
|------|----------------|------------------------------|---------------------|
| `AppBootGate.tsx` | Yes — children always rendered from `AppBootGate`; bridge returns null only. | N/A | N/A |
| `app/(app)/dashboard/page.tsx` | Shell yes; **skeleton** when `!isIdentityResolved`. | N/A (page); data via provider | Delegates to overview / CTAs disabled |
| `app/(app)/settings/page.tsx` | Header/tabs render; **sectionLoading** includes **auth**. | `listenToWorkspace` only after `isIdentityResolved && workspaceId` | Save handlers use `assertIdentityResolved` |
| `BillingUsageCacheInitializer.tsx` | Returns `null` (no layout block). | Fetch only after `isIdentityResolved` | N/A |
| `WorkspaceIdentityGate.tsx` | **Full-screen** on `workspaceError`. | N/A | N/A |
| `WorkspaceSuspendedGuard.tsx` | **Full-screen** on status error with `authUid`. | `authFetch` after `isIdentityResolved` | N/A |
| `SessionPageClient.tsx` | No identity `return null` for whole page; `getDoc` waits `authLoading` + identity. | `getDoc` / deep-link fetches gated via identity / `feedbackSessionId` | Multiple `assertIdentityResolved` call sites |
| `useWorkspaceOverview.ts` | N/A | `onSnapshot` gated; **cache hydrate** effect keyed on `userId`+`workspaceId` (see RISK) | Create/archive/delete assert; **silent** `!res` paths |
| `useCaptureWidget.ts` | N/A | N/A | **`assertIdentityBeforeWorkspaceMutations` optional**; share/save call `guardWorkspaceMutations()` |

---

## Final report format

### 1. Overall system status

**PARTIAL**

### 2. UI layer

- **Blockers:** `WorkspaceIdentityGate` and `WorkspaceSuspendedGuard` full-viewport screens; route-level skeletons and settings loading driven by **`authReady` / `isIdentityResolved`**.
- **Status:** **MIXED**

### 3. Data layer

- **Leaks:** Strict **“every `fetch`/listener behind `isIdentityResolved`”** is **not** satisfied (`usePlanCatalog`, `useShareCounts`, bootstrap `POST /api/users`, extension). Workspace-scoped dashboard/discussion paths are **largely** gated.
- **Status:** **RISK** (literal rule) / **SAFE** (pragmatic workspace-scoped interpretation)

### 4. Action layer

- **Unsafe mutations:** **Optional** identity assert in **`useCaptureWidget`**; **extension** does not wire it.
- **Status:** **PARTIAL**

### 5. Loading behavior

- **Invalid patterns:** **`authLoading`** (`!authReady`) folded into settings (and insights skeleton conditions).
- **Status:** **MIXED**

### 6. System grade

**B — Mostly correct** for the **signed-in Next.js app** workspace flows, with important gaps on **strict** NBIB wording, **capture core**, and **extension**.  
Would be **C — Hybrid** if graded strictly against the **letter** of all three layers including extension and every `fetch`.

### 7. Final verdict

**The system still contains architectural violations** relative to the **full** contract as stated (absolute UI non-blocking, **every** data access behind `isIdentityResolved`, **every** mutation behind `assertIdentityResolved`, no silent failure paths). The **dashboard + discussion** surfaces are **substantially aligned** with a **pragmatic** reading: workspace **data** and **most mutations** wait for **`isIdentityResolved`**, while **auth-ready** loading, **error full screens**, **bootstrap/public fetches**, and **optional capture asserts** break a **production-grade “true NBIB”** bar.

---

## Evidence index (quick reference)

- `lib/hooks/useAuthGuard.ts` — `loading = !ws.authReady`.
- `lib/client/workspaceContext.tsx` — `isIdentityResolved` definition; `authFetch` `POST /api/users` during auth sync.
- `app/(app)/layout.tsx` — provider order including `WorkspaceSuspendedGuard`, `WorkspaceIdentityGate`, `BillingUsageCacheInitializer`.
- `lib/capture-engine/core/hooks/useCaptureWidget.ts` — `assertIdentityBeforeWorkspaceMutations?.()` in `guardWorkspaceMutations`.
- `echly-extension/src/content.tsx` — `CaptureWidget` without `assertIdentityBeforeWorkspaceMutations`.

**End of audit.**
