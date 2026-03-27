# Provisioning Idempotency Audit

Date: 2026-03-27  
Scope: Auth-guard + onboarding provisioning paths for `users` and `workspaces` with server repository logic as source of truth.  
Constraint: Harden logic only, no product-flow changes.

## Executive Result

- Provisioning is now idempotent across repeated calls to `POST /api/users` and `POST /api/workspaces`.
- Existing user-workspace linkage is preserved and not overwritten by duplicate or conflicting onboarding requests.
- Transaction flow is deterministic for concurrent requests: existing linkage wins, and duplicate workspace creation for the same user is prevented.

---

## 1) Provisioning Entry Points (Client Trace)

## `useAuthGuard.ts` -> `POST /api/users`

- Trigger: `onAuthStateChanged` when authenticated user appears.
- Called on:
  - first login (after auth state resolves),
  - refresh/reload (auth observer re-emits current signed-in user),
  - any remount where auth state rehydrates.
- Purpose: ensure user exists and has a workspace link.
- Expected behavior: safe to call repeatedly (idempotent).

## `app/onboarding/page.tsx` -> `POST /api/workspaces`, then `PATCH /api/users`

- Trigger: onboarding form submit.
- Called on:
  - onboarding step completion by authenticated user.
- Flow:
  1. client proposes a `workspaceId` and calls `POST /api/workspaces`;
  2. then calls `PATCH /api/users` with the **resolved** `workspaceId` returned by server.
- Hardening applied: onboarding now uses server response `workspaceId`, preventing drift when guard and onboarding run close together.

---

## 2) Server Logic Analysis (Source of Truth)

## `usersRepository.server.ts` (`ensureUserWorkspaceLinkRepo`)

- Uses Firestore transaction.
- Reads `users/{uid}` and effective `workspaces/{workspaceId}` before writes.
- If user exists with `workspaceId`:
  - reuses that ID (no relink to another workspace),
  - only creates workspace doc if missing (recovery path).
- If user missing:
  - creates user with deterministic default `workspaceId = uid`,
  - creates workspace doc if missing.
- Idempotency: repeated calls converge to same `(user.workspaceId, workspace doc)` state.

## `workspacesRepository.server.ts`

- Contains workspace read/update helpers.
- Creation primitive `createWorkspaceRepo` is not used by `POST /api/workspaces` path (route uses explicit transaction).
- No conflicting automatic relink behavior found in repository helpers.

---

## 3) Idempotency Enforcement Applied

## `POST /api/users`

- Contract satisfied:
  - if user already exists with `workspaceId`, link is reused;
  - repeated calls return same `workspaceId`;
  - no duplicate workspace creation for same resolved ID.

## `POST /api/workspaces`

- Hardened to enforce:
  - if `user.workspaceId` already exists, it is authoritative;
  - request `workspaceId` is ignored in that case (no new workspace created from conflicting ID);
  - user link is not overwritten when already present.
- Response now returns resolved workspace ID used by server logic.

---

## 4) Transaction Safety

## Workspace creation transaction guarantees

- Reads current user doc first, then chooses deterministic effective workspace ID:
  - `existing user.workspaceId` if present;
  - else requested `workspaceId`.
- Creates workspace only when that effective target workspace doc does not exist.
- Writes `user.workspaceId` only for:
  - new user, or
  - existing user missing `workspaceId`.
- Prevents accidental relink/overwrite under duplicate calls.

## No invalid overwrite cases

- No path in provisioning flow now overwrites an existing `user.workspaceId` during `POST /api/workspaces`.
- No path creates a second workspace for the same user due to onboarding/auth-guard conflict.

---

## 5) Duplicate Detection Search

Searched patterns:

- `addDoc(...workspaces...)`
- `setDoc(...workspaces...)`

Result:

- No direct uncontrolled client Firestore creation path for `workspaces` found via these patterns.
- Server-controlled workspace creation path remains `POST /api/workspaces` transaction + user ensure transaction.

---

## 6) Race Condition Safety

Scenario: two near-simultaneous requests (auth guard + onboarding duplicate submit)

- Firestore transaction retries with latest state.
- Once one request establishes `user.workspaceId`, competing request resolves to same effective ID.
- Competing request does not relink user to another workspace ID.
- Workspace creation is conditional on non-existent target doc, so duplicate creation for same ID is prevented.

Residual note:

- If two different IDs are proposed before any user link exists, winner is first committed link; subsequent request converges to winner via existing link check.

---

## 7) Final Behavior Contract

| Scenario | Result |
| --- | --- |
| First login | User ensured; workspace ensured/created; linkage established deterministically. |
| Refresh | `POST /api/users` is no-op for linkage; state remains stable. |
| Double request | Existing linkage reused; no duplicate workspace for same user linkage. |
| Partial failure | Subsequent call recovers missing piece (missing user/workspace doc) without relinking to conflicting workspace. |

---

## Files Hardened

- `app/api/workspaces/route.ts`
- `lib/repositories/usersRepository.server.ts`
- `app/onboarding/page.tsx`

