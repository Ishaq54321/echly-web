# Phase 6.5 — Workspace bootstrap collapse

## Summary

`WorkspaceProvider` now resolves `workspaceId` on a **fast path** (Firestore `users/{uid}` via `getDoc` + `doc(db, ...)`) **before** `POST /api/users`, token refresh, and `getUserWorkspaceIdRepo`. The **sync path is unchanged**: the same POST, `user.getIdToken(true)`, and `getUserWorkspaceIdRepo` still run; on success, workspace is re-confirmed and `claimsReady` is set again.

## 1. Fast path (implemented)

- **Where:** `lib/client/workspaceContext.tsx`, inside the existing `onAuthStateChanged` async IIFE, immediately before `authFetch("/api/users", { method: "POST" })`.
- **Behavior:** Reads `users/{uid}` with `getDoc`. If `workspaceId` is a non-empty string, trims it and uses it as `fastWorkspaceId`.
- **Errors:** Wrapped in `try/catch`; failures log `[ECHLY][bootstrap] fast workspace fetch failed` and fall through to the slow path only (no thrown error from fast path alone).
- **Early identity:** When `fastWorkspaceId` is set, `commitWorkspaceId(fastWorkspaceId)` runs and `setClaimsReady(true)` so `isIdentityResolved` can flip true earlier and Firestore listeners that depend on it can attach sooner.

## 2. Sync path (preserved)

- **Still runs:** `await authFetch("/api/users", { method: "POST" })`, `await user.getIdToken(true)`, `await getUserWorkspaceIdRepo(uid)` with `normalizeWorkspaceId`.
- **Re-confirmation:** After sync, `commitWorkspaceId(normalized)` applies the server-backed workspace; if it matches the fast path, state is not double-updated (see below).
- **Failure handling:** Failed POST, missing workspace after sync, or thrown errors still clear claims/workspace via `commitWorkspaceId(null)` and `setClaimsReady(false)` as before.

## 3. Timing difference (expected)

- **Before:** `workspaceId` and `claimsReady` only became meaningful after POST + `getIdToken(true)` + `getUserWorkspaceIdRepo` (which may use `getDocFromServer` / network).
- **After:** For returning users with a cached or quickly available `users/{uid}` document, `workspaceId` (and temporary `claimsReady`) can appear **as soon as the fast `getDoc` completes**, overlapping with POST and token work.
- **Perceived:** Dashboard/session queries gated on `isIdentityResolved` can start earlier on warm cache or good connectivity to Firestore.

## 4. Double-state guard

- **`workspaceIdRef`:** Tracks the last committed workspace id; `commitWorkspaceId(next)` updates React state only when `next !== workspaceIdRef.current`.
- **Sign-out:** `workspaceIdRef.current` is reset to `null` alongside clearing workspace state.
- **Intent:** When sync confirms the same id as the fast path, React avoids an extra `setWorkspaceId` churn (reduces flicker).

## 5. Edge cases

| Scenario | Behavior |
|----------|----------|
| New user / no `users` doc yet | Fast path yields nothing; behavior matches previous slow-only bootstrap until POST creates/links user. |
| Fast path throws (offline, permission, etc.) | Warning logged; POST + full sync still run. |
| Stale local cache vs server truth | Sync path’s `getUserWorkspaceIdRepo` + normalized id overrides via `commitWorkspaceId` if different. |
| POST fails after fast path | `claimsReady` cleared and `commitWorkspaceId(null)` — UI must not treat identity as valid. |
| `claimsReady` before refreshed token | Intentional “optimistic” gate for early client reads; Firestore rules still enforce access; backend routes unchanged. |

## 6. Not modified (per spec)

- `assertIdentityResolved`
- Firestore security rules
- API authorization patterns
- Extension auth flows
- Backend sync semantics (POST still mandatory in sequence)

## 7. Success criteria checklist

- Workspace id can be set immediately after auth when the user document is readable.
- Listeners keyed off `isIdentityResolved` can attach earlier.
- Sessions and other workspace-scoped data can start loading sooner in typical returning-user flows.
- Backend sync still runs in the background of the user-visible fast path.
- No intentional weakening of server-side checks or rules; client only overlaps work in time.
