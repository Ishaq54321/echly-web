# Critical Fixes Applied

Date: 2026-03-27

## Scope

Applied root-cause fixes for two critical architecture/security issues:

1. Workspace provisioning must never allow arbitrary workspace linking.
2. Public share must never perform Firestore client reads.

No product-surface behavior changes were introduced intentionally; changes are restricted to trust boundaries and data-source enforcement.

## Fix 1: Workspace Provisioning Security

### File

- `app/api/workspaces/route.ts`

### What changed

- Removed client `workspaceId` as a source of truth in `POST /api/workspaces`.
- Provisioning now always derives deterministic workspace ID as `user.uid` when the user has no linked workspace.
- Preserved existing-user behavior:
  - If `user.workspaceId` exists, route returns that existing workspace link.
  - If missing, route creates `workspaces/{user.uid}` and writes `users/{uid}.workspaceId = user.uid`.
- Hardened `PATCH /api/workspaces` to ignore body `workspaceId` and always apply updates to `resolveWorkspaceForUserLight(user.uid).workspaceId`.

### Security result

- Cross-workspace linking via client-provided workspace ID is no longer possible in workspace provisioning.
- Client input can no longer steer workspace update target in this route.

## Fix 2: Remove Public Firestore Client Read

### Files

- `components/share/usePublicSessionRealtime.ts`
- `components/share/PublicShareSessionView.tsx`

### What changed

- Removed Firestore client SDK usage from public share realtime hook:
  - Removed `onSnapshot`, `query`, `collection`, and all `firebase/firestore` imports.
- Kept hook API shape stable but disabled client-side realtime reads (returns empty changes).
- Removed realtime merge consumption from public share view:
  - `PublicShareSessionView` no longer imports or applies realtime Firestore changes.

### Data-flow result

Public share view now relies on:

- `/api/public/share/[token]` for payload
- `/api/feedback/counts` for counts

No direct Firestore client reads remain in `components/share`.

## Fix 3: Clean Workspace Body Routing in Non-Admin API Paths

### Files

- `app/api/users/route.ts`
- `app/api/comments/route.ts`

### What changed

- Removed request-body `workspaceId` usage in user/comment routes.
- These routes now derive workspace context server-side:
  - from `resolveWorkspaceForUserLight(user.uid)` and/or validated session context.
- Maintains existing authorization gates while eliminating client workspace routing influence.

## Fix 4: Verification Scan

### WorkspaceId body scan (`app/api`)

Searched for request-body workspace routing patterns (`body.workspaceId`, `requestedWorkspaceId`).

Remaining matches are admin-only control-plane endpoints:

- `app/api/admin/update-plan/route.ts`
- `app/api/admin/workspaces/actions/route.ts`

These are intentionally admin-scoped and out of the end-user provisioning/public-share attack path.

### Public Firestore scan (`components/share`)

Searched for `firebase/firestore` and `onSnapshot` usage.

- No matches remain.

## Checklist Status

1. Try linking user to another workspace -> **blocked by design** (no client workspace ID accepted in provisioning path).
2. New user -> **workspace defaults to `uid`**.
3. Share page -> **loads without Firestore client reads**.
4. No permission errors in console -> **requires runtime smoke in active environment**.
5. No direct Firestore usage in public path -> **verified in `components/share`**.

## Notes

- Admin endpoints still accept explicit `workspaceId` by design for privileged operations.
- If desired, a follow-up hardening pass can apply stricter server-side resolution policies to admin APIs as a separate governance decision.
