# Phase 6.6 — Persisted workspace bootstrap

## Hint usage

- **Storage**: `localStorage` key `echly_workspace_hint_v1` via `lib/client/workspaceBootstrap.ts` (`getWorkspaceHint`, `setWorkspaceHint`, `clearWorkspaceHint`).
- **Read**: On sign-in, after profile fields are set and before the async `getDoc` fast path, `WorkspaceProvider` reads the hint and, if present, calls `commitWorkspaceId` and `setClaimsReady(true)` so workspace-scoped data can start immediately.
- **Write**: Every authoritative `commitWorkspaceId(next)` updates the hint with `setWorkspaceHint(next)` (including `null`, which removes the key).
- **Clear**: `clearWorkspaceHint()` runs on sign-out alongside existing token/subscription cleanup.

The hint is **not** used for permission or business rules elsewhere; it only seeds React state early.

## Cache sync behavior

- `commitWorkspaceId` is the single path that updates `workspaceIdRef`, `workspaceId` state, and localStorage.
- Firestore fast path (`getDoc(users/{uid})`) still runs and may replace the displayed workspace id before API sync completes.
- After `POST /api/users`, `getIdToken(true)`, and `getUserWorkspaceIdRepo(uid)`, the normalized server workspace id is committed again and `claimsReady` is set consistent with success or error. The persisted hint always tracks the last committed id.

## Mismatch handling

- Wrong or stale hint: overwritten when fast path or repo resolution commits a different id (same `commitWorkspaceId` + `setWorkspaceHint`).
- Missing workspace / sync failure: `commitWorkspaceId(null)` clears state and removes the hint; `setClaimsReady(false)` and `workspaceError` behave as before.
- No extra mismatch branch is required: the server-backed path remains authoritative.

## Timing vs previous behavior

- **Before**: `workspaceId` and `claimsReady` typically became usable only after the Firestore fast path (or later API/repo steps).
- **After**: With a stored hint, `workspaceId` and `claimsReady` can be true in the same synchronous turn as auth profile updates, **before** `getDoc` resolves and **before** `POST /api/users` completes. Backend sync, token refresh, and repo confirmation still run unchanged.

## Out of scope (unchanged)

- `assertIdentityResolved`, API routes, Firestore rules, and extension logic were not modified.

## Manual validation checklist

| Scenario | Expectation |
|----------|-------------|
| Returning user, hard refresh | Sessions/data can subscribe as soon as auth + hint apply; sync still completes in background. |
| Slow network | UI can proceed with hinted workspace before `POST /api/users` finishes; final id follows server. |
| Logout → login | Hint cleared on sign-out; no reliance on previous user’s hint after re-auth. |
| Workspace change | Next successful `commitWorkspaceId` updates localStorage. |
| New user (no hint) | Same as prior flow: no hint branch; fast path / sync establish id. |

---

**Principle**: The persisted value is a **performance hint** only; Firestore fast path and `getUserWorkspaceIdRepo` remain the paths that reconcile to truth.
