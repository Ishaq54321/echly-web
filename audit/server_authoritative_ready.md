# Server-Authoritative Write Migration Readiness

Date: 2026-03-27

## Scope

Finalized migration to server-authoritative writes without changing realtime read behavior or removing existing API contracts.

## 1) Remaining Client Write Paths (Firestore SDK)

Searched for:

- `updateDoc(`
- `runTransaction(`
- `increment(`
- `addDoc(` / `setDoc(` / `deleteDoc(` / `writeBatch(`

Result:

- No client-side write primitives remain in `lib/` client repositories or client-facing wrappers.
- Remaining matches are limited to:
  - `*.server.ts` repositories (expected)
  - `app/api/*` server routes (expected)
  - `scripts/*` admin/migration scripts (expected)

## 2) Client Repository Cleanup

### `lib/repositories/commentsRepository.ts`

- Removed client write exports:
  - `addCommentRepo`
  - `updateCommentPositionRepo`
  - `updateCommentRepo`
  - `deleteCommentRepo`
  - `deleteAllCommentsForSessionRepo`
- Kept read-only/realtime utilities:
  - `listenToCommentsRepo`
  - `getSessionRecentCommentsRepo`
  - `getWorkspaceCommentsForInsightsRepo`

### `lib/repositories/sessionsRepository.ts`

- Removed client write exports:
  - `createSessionRepo`
  - `updateSessionTitleRepo`
  - `updateSessionAccessLevelRepo`
  - `updateSessionArchivedRepo`
  - `updateSessionUpdatedAtRepo`
  - `incrementSessionCommentCountRepo`
  - `recordSessionViewIfNewRepo`
  - `deleteSessionRepo`
- Kept read-only utilities:
  - `getWorkspaceSessionCountRepo`
  - `getWorkspaceSessionsRepo`
  - `getUserSessionsRepo`
  - `getWorkspaceSessionsByFeedbackCountRepo`
  - `getSessionByIdRepo`

### `lib/repositories/usersRepository.ts`

- Already server-authoritative via `/api/users` for writes.
- Read utilities unchanged.

### `lib/repositories/workspacesRepository.ts`

- Already server-authoritative via `/api/workspaces` for writes.
- Realtime/read behavior unchanged.

### `lib/repositories/feedbackRepository.ts` and `lib/repositories/insightsRepository.ts`

- Removed client write-capable functions to prevent hidden direct-write fallback.
- Kept read/query helpers only in client repository files.
- Server write logic remains in corresponding `*.server.ts` files.

## 3) Counter Integrity Validation

Counter increments/decrements now resolve to server-only implementations:

- Session counters: `lib/repositories/sessionsRepository.server.ts`
- Feedback counters: `lib/repositories/feedbackRepository.server.ts`
- Workspace comment/session stats: `lib/repositories/commentsRepository.server.ts` + `sessionsRepository.server.ts`
- Insights counters: `lib/repositories/insightsRepository.server.ts`

No client code path contains `increment(` for Firestore writes.

## 4) Write Entry Point Validation

Confirmed write entry points:

- `/api/feedback` (create)
- `/api/comments` (create/update/delete)
- `/api/users` (ensure/update user workspace link)
- `/api/workspaces` (create/update settings/plan)
- `/api/sessions` and `/api/sessions/[id]` (create/update/delete)

Additional endpoint added for migrated view tracking:

- `/api/sessions/[id]/view` (POST) for session view-count recording

Client wrappers updated to API-based writes:

- `lib/comments.ts` (already API-based)
- `lib/feedback.ts` (now API-based for update/delete)
- `lib/sessions.ts` (now API-based for write operations)
- `lib/repositories/usersRepository.ts` / `workspacesRepository.ts` (already API-based)

## 5) Critical Flow Verification

Manual UI verification status:

- Create feedback: **pending manual check**
- Add comment: **pending manual check**
- Resolve ticket: **pending manual check**
- Create workspace: **pending manual check**
- Onboarding flow: **pending manual check**
- Settings update: **pending manual check**

Reason:

- Static/code-path validation completed in this pass.
- End-to-end manual verification requires authenticated browser interaction.

Recommended quick manual pass (post-change):

1. Create feedback in a live session.
2. Add and edit/delete a comment.
3. Resolve/reopen ticket and confirm counters update.
4. Create workspace from onboarding/new-user path.
5. Complete onboarding workspace-link flow.
6. Update settings (name/notifications/appearance).

## 6) Breakage Risk Assessment

### Low risk (addressed)

- Legacy client write calls in sessions/feedback/comments repositories removed.
- Realtime read subscriptions preserved.
- Existing write APIs unchanged (additive view endpoint only).

### Watch items

- If any untracked legacy import still expects removed client-repo write exports, TypeScript build will surface it immediately.
- Session view tracking now depends on `/api/sessions/[id]/view`; verify with signed-in non-owner viewer and owner viewer.
- Admin/migration scripts still use client Firestore SDK write helpers (by design, out of runtime app path).

## Readiness Verdict

Server-authoritative migration is functionally complete for application runtime write paths:

- No direct client Firestore writes detected in app code.
- Writes route through API/server repos.
- Realtime reads remain intact.

System is ready for Firestore rule enforcement after completing the manual flow checklist above.

