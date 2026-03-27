# Workspace Security Enforcement Audit

## Scope

Server-side ownership enforcement and workspace scoping for authenticated user operations.

Reviewed:

- `app/api/workspaces/route.ts`
- `app/api/users/route.ts`
- `app/api/comments/route.ts`
- `app/api/feedback/route.ts`
- `app/api/feedback/post.ts`
- `app/api/sessions/route.ts`
- `app/api/sessions/[id]/route.ts`
- `lib/server/resolveWorkspaceForUserLight.ts`
- `lib/repositories/workspacesRepository.server.ts`
- `lib/repositories/usersRepository.server.ts`

## Findings And Hardening Applied

### 1) Workspace API source-of-truth enforcement

`/api/workspaces` now enforces server-owned workspace identity:

- `POST /api/workspaces`
  - Requires `request.body.workspaceId` for contract compatibility.
  - Resolves authoritative workspace via `resolveWorkspaceForUserLight(user.uid)`.
  - Rejects mismatches (`403 FORBIDDEN`) when `body.workspaceId !== resolvedWorkspaceId`.
  - Writes only to the resolved workspace id.
- `PATCH /api/workspaces`
  - Already validated `body.workspaceId === resolveWorkspaceForUserLight(user.uid).workspaceId`.
  - Kept and confirmed.

Result: client cannot switch target workspace by sending a different `workspaceId`.

### 2) User profile API no longer allows workspace hijacking

`PATCH /api/users` previously accepted and persisted client-provided `workspaceId` directly to `users/{uid}`.

Hardening:

- Resolve canonical workspace id with `resolveWorkspaceForUserLight(user.uid)`.
- If a client sends a `workspaceId` and it does not match resolved id, reject with `403 FORBIDDEN`.
- If `workspaceId` is sent and valid, only persist the resolved id (never trust payload id as source-of-truth).

Result: user cannot repoint themselves to another workspace via `PATCH /api/users`.

### 3) Comment write path strict target validation

`POST /api/comments` accepted `workspaceId` and `sessionId` from body and passed them into repository writes.

Hardening:

- Enforce feedback/session relation: loaded session must exist and match `body.sessionId`.
- Resolve authoritative workspace from session/user context.
- Reject if `body.workspaceId !== resolvedWorkspaceId` (`403 FORBIDDEN`).

Result: client cannot forge comment writes/counters against another workspace by tampering body identifiers.

## Repository Validation

### `lib/repositories/workspacesRepository.server.ts`

- Repository functions write to provided `workspaceId`, but these are now guarded at API boundary by server-resolved ownership checks.
- No client payload reaches this repository without API-level validation in reviewed routes.

### `lib/repositories/usersRepository.server.ts`

- `updateUserFieldsRepo` can write `workspaceId` when provided.
- API hardening now blocks arbitrary `workspaceId` changes in `PATCH /api/users`, preventing blind trust at call sites.

## Feedback And Session Path Validation

- Feedback list/search routes (`/api/feedback`, `/api/feedback/search`) already derive workspace from `resolveWorkspaceForUserLight(user.uid)`.
- Feedback creation (`/api/feedback/post.ts`) derives workspace from trusted session context and enforces actor/session permission gates.
- Session list/create (`/api/sessions`) derives workspace via server resolution (`resolveWorkspaceForUser`).
- Session update/delete (`/api/sessions/[id]`) is owner-gated (`session.userId === user.uid`) and workspace validated via server-side context.

## Bypass Scenario Simulation

### Scenario: User A submits User B workspace id

Payload example:

```json
{ "workspaceId": "workspace_of_user_B" }
```

Expected behavior after hardening:

- `PATCH /api/workspaces` -> rejected (`403`), because requested id mismatches resolved id.
- `POST /api/workspaces` -> rejected (`403`) on mismatch before writes.
- `PATCH /api/users` -> rejected (`403`), cannot repoint `users/{uid}.workspaceId`.
- `POST /api/comments` with forged ids -> rejected (`403`) due to session/workspace mismatch checks.

No cross-workspace write occurs.

## Final Security Contract

| Action | Protected |
|------|----------|
| update workspace | ✅ |
| read workspace | ✅ |
| update feedback | ✅ |
| update session | ✅ |

## Conclusion

All reviewed authenticated workspace operations now enforce server-owned workspace identity.

- Client `workspaceId` is treated as an input to validate, not a source-of-truth.
- Ownership/scope is derived from server context (`resolveWorkspaceForUserLight` or trusted session linkage).
- Cross-workspace access and mutation via payload tampering are blocked.
