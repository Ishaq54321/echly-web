# NBIB audit — identity sources (`workspaceId`, claims, auth)

Read-only audit. Evidence from repository as of audit date.

## 1. Primary source: `users/{uid}` (Firestore, client SDK)

| Aspect | Detail |
|--------|--------|
| **Read** | `lib/repositories/usersRepository.ts` — `getUserWorkspaceIdRepo(uid)` uses `doc(db, "users", uid)` with `getDocFromServer` / fallback `getDoc`. |
| **When invoked** | After successful `authFetch("/api/users", { method: "POST" })` inside `WorkspaceProvider` (`lib/client/workspaceContext.tsx`), in the `onAuthStateChanged` async path. |
| **Purpose** | Resolve the canonical `workspaceId` string for the signed-in user. |

## 2. Server-side mirror (Admin SDK)

| Aspect | Detail |
|--------|--------|
| **Read** | `lib/repositories/usersRepository.server.ts` (imported by API routes) — same logical field `workspaceId` on `users/{uid}`. |
| **Used by** | e.g. `app/api/users/route.ts`, `app/api/billing/usage/route.ts`, `lib/server/auth/withAuthorization.ts` (`getUserWorkspaceIdRepo(user.uid)` for cross-checks). |

## 3. Custom claims (`workspaceId` on ID token)

| Aspect | Detail |
|--------|--------|
| **Set** | `app/api/users/route.ts` — after resolving workspace, calls `setWorkspaceClaim(user.uid, workspaceId)`. |
| **Consumed** | `firestore.rules` — `sameWorkspace(wid)` compares `request.auth.token.workspaceId` to document `workspaceId` for sessions/feedback/comments/workspaces. |
| **Client readiness flag** | `claimsReady` in `WorkspaceProvider` is set `true` only after: successful POST `/api/users`, `user.getIdToken(true)`, and successful `getUserWorkspaceIdRepo` + normalized non-empty `workspaceId`. |

## 4. Where `workspaceId` is held (client React state)

| Location | Set | Read |
|----------|-----|------|
| `lib/client/workspaceContext.tsx` | `setWorkspaceId(normalized)` on successful identity sync; cleared on sign-out / errors. | Exported via `useWorkspace().workspaceId`; drives `isIdentityResolved`. |

## 5. Duplication: token vs Firestore

- **Not duplicated as two competing sources for the React context.** The UI `workspaceId` comes from the **Firestore `users/{uid}`** read on the client after the **POST `/api/users`** sync (which also refreshes claims server-side).
- **Rules enforcement** uses **JWT custom claim** `workspaceId` (`firestore.rules`).
- **Potential drift window**: If Firestore user doc and claims ever diverge, client context could disagree with what rules enforce until the next sync / token refresh. The code path intentionally forces `getIdToken(true)` after POST `/api/users` to align claims before setting `claimsReady`.

## 6. Other references to `workspaceId` (data paths, not alternate identity roots)

- Query predicates: `where("workspaceId", "==", wid)` in hooks such as `useWorkspaceOverview`, `useSessionFeedbackPaginated`, `DiscussionFeed`, etc. — these **consume** context/API-resolved `workspaceId`, they do not define identity.
- API handlers resolve workspace from session/user records and compare to `getUserWorkspaceIdRepo(uid)` (e.g. `app/api/tickets/[id]/route.ts` via `userWorkspaceMatchesSession`).

## 7. `authReady` / `authUid`

| Source | Detail |
|--------|--------|
| `lib/client/workspaceContext.tsx` | `onAuthStateChanged` sets `authReady` true on first callback; `authUid` from `user?.uid` or `null`. |

## 8. `useWorkspace` / `WorkspaceProvider`

- Single provider: `WorkspaceProvider` in `app/(app)/layout.tsx` (app shell).
- Admin: separate tree wraps `WorkspaceProvider` in `app/admin/layout.tsx` for `useWorkspace()` there.
