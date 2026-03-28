# Phase 5 — Race condition hardening (verification)

## Scope

Client-only changes. Identity gating (`isIdentityResolved`), NBIB-style non-blocking boot, and backend routes were not modified.

## 1. Effects fixed / tightened

| Area | Change |
|------|--------|
| **Session page search** | Explicit `if (!isIdentityResolved)` early exit; `isIdentityResolved` added to dependency array so search never runs before identity boundary. |
| **Session page deep link hydrate** | `if (!isIdentityResolved) return` at start of `?ticket=` API hydrate effect; dependency includes `isIdentityResolved`. |
| **Session overview (`useSessionOverview`)** | Invalid `sessionId` or missing identity/workspace resets to `EMPTY_SESSION_OVERVIEW`, clears loading/error, and bumps async generation so in-flight loads cannot commit stale UI. Latest load wins via `useAsyncGeneration` (`nextToken` / `isCurrent`). |
| **Insights** | Insights doc `onSnapshot` guarded with `insightsDocWidRef` so callbacks ignore stale workspace after switch. Session title hydration checks `workspaceIdLiveRef` after `await` before `setSessionTitleMap`. |
| **`useBillingUsage`** | Firestore workspace listener acquired **synchronously** via `retainWorkspaceFirestoreListener` (no longer inside a late async branch). Removed global `clearWorkspaceSubscription()` on “not ready” branches so other surfaces are not torn down incorrectly. |

## 2. Listener cleanup / deduplication

| Listener | Status |
|----------|--------|
| **Workspace document (`workspaces/{id}`)** | **Ref-counted** via `retainWorkspaceFirestoreListener` / `release` on unmount. `clearWorkspaceSubscription()` still resets count and detaches on auth sign-out (`WorkspaceProvider`). Prevents one consumer (e.g. profile panel) from unsubscribing for everyone (billing, settings, usage meters). |
| **Dashboard sessions query** | Single `onSnapshot` per effect; cleanup calls `unsubscribe()`. Already gated on `isIdentityResolved`, `userId`, `workspaceId`. |
| **Session feedback** | Single `onSnapshot` per `(workspaceId, sessionId)`; cleanup unsubscribes. |
| **Comments** | `useCommentsRepoSubscription` unsubscribes on dep change/unmount; identity-gated. |
| **Insights doc** | Unsubscribe in effect cleanup; ref guard for stale callbacks. |

## 3. Async control improvements

- **`lib/hooks/useSafeAsync.ts`**: `useAsyncGeneration()` for explicit tokens; `useSafeAsync()` for “latest promise wins” (returns `null` when superseded).
- **`useSessionOverview`**: Uses `useAsyncGeneration` after each `await` boundary before `setData` / `setLoading` / `setError`.

## 4. Temporary logging (development only)

`console.debug` lines prefixed with **`[ECHLY][race]`** for:

- Workspace Firestore retain / release / attach / detach / full clear
- `useWorkspaceUsageRealtime` / `useBillingUsage` effect start and skip
- Dashboard sessions listener attach/detach
- Session feedback listener attach/detach / skip
- Comments subscription attach/detach / skip
- Insights insights-doc listener attach/detach / skip
- Session overview load start and identity skip

Remove or gate further once validation is complete.

## 5. Remaining risks / follow-ups

1. **Other `useEffect` surfaces** — Not every file in the repo was audited; focus was identity-bound data, Firestore listeners, and shared workspace realtime. Extension (`echly-extension`) and admin pages were not part of this pass.
2. **`useSafeAsync` adoption** — Optional to roll into other high-churn fetches (modals, rapid navigation) where `cancelled` flags are easy to get wrong.
3. **Global workspace store** — Still a module singleton; refcount fixes cross-component teardown but assumes a single active workspace id per signed-in shell (intended).
4. **Strict Mode double-mount** — React 18 dev double-invocation is compatible with retain/release (each mount pairs release on cleanup).

## 6. Validation checklist (manual)

- [ ] Throttle network; confirm no pre-identity Firestore errors on dashboard / session / insights.
- [ ] Rapid dashboard ↔ session navigation; no duplicate session list listeners (dev log attach/detach pairs).
- [ ] Open UI that uses `useWorkspaceUsageRealtime` in two places; close one; billing/usage still updates.
- [ ] Sign out; workspace listener cleared (`[ECHLY][race] workspace listener clear` in dev).

## Success criteria (phase goal)

| Criterion | Notes |
|-----------|--------|
| No early execution before identity | Enforced on search, deep link hydrate, overview load, billing workspace retain, existing hooks already gated. |
| No duplicate listeners (same resource) | Workspace doc refcount; Firestore listeners one per effect instance with cleanup. |
| No stale updates | Overview generation token; insights ref guards; existing `cancelled` / `sessionIdRef` patterns retained. |
| Deterministic ordering | Latest overview generation wins; snapshot handlers ignore wrong workspace id where added. |
