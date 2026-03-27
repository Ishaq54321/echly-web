# Client Firestore Write Paths Inventory

Scope searched: `addDoc(`, `setDoc(`, `updateDoc(`, `deleteDoc(`, `runTransaction(`, `writeBatch(`, `increment(`, `arrayUnion(`, `arrayRemove(` across the repository.

This report lists **client-side Firestore write paths** that should be considered for migration to API routes.

---

## Executive Answer

- **Where are all client writes happening?** Primarily in:
  - `lib/repositories/commentsRepository.ts`
  - `lib/repositories/sessionsRepository.ts`
  - `lib/repositories/feedbackRepository.ts`
  - `lib/repositories/usersRepository.ts`
  - `lib/repositories/workspacesRepository.ts`
  - `lib/repositories/insightsRepository.ts`
- **What must be migrated?** All write paths below marked **`API equivalent: no`** and all high-risk mixed paths still callable from client.
- **What is safe to leave?** Script-only writes (`scripts/*`) and server-only writes (`*.server.ts`, `app/api/*`) are not client-side migration targets.

---

## 1. FEEDBACK WRITES

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/feedbackRepository.ts` | `addFeedbackWithSessionCountersRepo` | Creates feedback ticket, links screenshot, updates session/workspace/insights counters in transaction | `feedback`, `sessions`, `workspaces`, `workspaces/{id}/insights/main`, `screenshots` | yes | yes (`POST /api/feedback`) | 🔴 critical |
| `lib/repositories/feedbackRepository.ts` | `updateFeedbackRepo` | Updates editable feedback fields/status | `feedback` | yes | yes (`PATCH /api/tickets/[id]`) | 🔴 critical |
| `lib/repositories/feedbackRepository.ts` | `updateFeedbackResolveAndSessionCountersRepo` | Resolves/reopens feedback and recalculates session + insights counters | `feedback`, `sessions`, `workspaces/{id}/insights/main` | yes | yes (`PATCH /api/tickets/[id]`) | 🔴 critical |
| `lib/repositories/feedbackRepository.ts` | `deleteFeedbackWithSessionCountersRepo` | Soft-deletes feedback, decrements session/workspace counters in transaction | `feedback`, `sessions`, `workspaces` | yes | yes (`DELETE /api/tickets/[id]`) | 🔴 critical |
| `lib/repositories/feedbackRepository.ts` | `deleteAllFeedbackForSessionRepo` | Bulk deletes feedback docs for session | `feedback` | yes | yes (via `DELETE /api/sessions/[id]`) | 🔴 critical |
| `lib/repositories/feedbackRepository.ts` | `incrementFeedbackCommentCountRepo` | Increments `feedback.commentCount`, updates comment preview metadata | `feedback` | yes | partial (indirect in ticket flows, not comment API) | 🟡 important |

Notes:
- Feedback lifecycle has server API equivalents, but client repository still contains full write logic.

---

## 2. COMMENTS WRITES

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/commentsRepository.ts` | `addCommentRepo` | Creates comment and updates session/feedback/workspace/insights counters | `comments`, `sessions`, `feedback`, `workspaces`, `workspaces/{id}/insights/main` | yes | no | 🔴 critical |
| `lib/repositories/commentsRepository.ts` | `updateCommentPositionRepo` | Updates pin coordinates | `comments` | no | no | ⚪ optional |
| `lib/repositories/commentsRepository.ts` | `updateCommentRepo` | Updates comment text/resolved fields | `comments` | yes | no | 🟡 important |
| `lib/repositories/commentsRepository.ts` | `deleteCommentRepo` | Deletes single comment and decrements workspace comment stats | `comments`, `workspaces` | yes | no | 🟡 important |
| `lib/repositories/commentsRepository.ts` | `deleteAllCommentsForSessionRepo` | Bulk deletes comments for session | `comments` | yes | yes (indirect via server delete session flow) | 🟡 important |

Client call sites (direct):
- `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts`
- `components/discussion/DiscussionPanel.tsx`
- `components/discussion/DiscussionThread.tsx`

---

## 3. SESSION WRITES

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/sessionsRepository.ts` | `createSessionRepo` | Creates session and increments workspace usage counters | `sessions`, `workspaces` | yes | yes (`POST /api/sessions`) | 🔴 critical |
| `lib/repositories/sessionsRepository.ts` | `updateSessionTitleRepo` | Renames session | `sessions` | yes | yes (`PATCH /api/sessions/[id]`) | 🟡 important |
| `lib/repositories/sessionsRepository.ts` | `updateSessionAccessLevelRepo` | Updates session access level | `sessions` | yes | yes (`PATCH /api/sessions/[id]`) | 🟡 important |
| `lib/repositories/sessionsRepository.ts` | `updateSessionArchivedRepo` | Archives/unarchives session and updates workspace archived counter | `sessions`, `workspaces` | yes | yes (`PATCH /api/sessions/[id]`) | 🔴 critical |
| `lib/repositories/sessionsRepository.ts` | `updateSessionUpdatedAtRepo` | Touches session updated timestamp | `sessions` | yes | partial (often done by server routes) | 🟡 important |
| `lib/repositories/sessionsRepository.ts` | `incrementSessionCommentCountRepo` | Increments comment count on session | `sessions` | yes | no direct comment endpoint | 🟡 important |
| `lib/repositories/sessionsRepository.ts` | `recordSessionViewIfNewRepo` | Creates per-viewer view doc and increments view count | `sessionViews/{sessionId}/views`, `sessions` | no | no | ⚪ optional |
| `lib/repositories/sessionsRepository.ts` | `deleteSessionRepo` | Deletes session + related data, updates workspace counters | `sessions`, `sessionViews`, `feedback`, `comments`, `workspaces` | yes | yes (`DELETE /api/sessions/[id]`) | 🔴 critical |

Client call site of view tracking:
- `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` via `recordSessionViewIfNew`.

---

## 4. USER WRITES

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/usersRepository.ts` | `setUserWorkspaceIdRepo` | Sets/updates `users/{uid}.workspaceId` and onboarding profile attrs | `users` | yes | no | 🔴 critical |
| `lib/repositories/usersRepository.ts` | `ensureUserRepo` | Creates user doc if absent | `users` | yes | no | 🟡 important |
| `lib/repositories/usersRepository.ts` | `ensureUserWorkspaceLinkRepo` | Transaction to ensure user + default workspace linkage | `users`, `workspaces` | yes | no | 🔴 critical |

Client call sites:
- `app/onboarding/page.tsx` (`setUserWorkspaceIdRepo`)
- `lib/hooks/useAuthGuard.ts` (`ensureUserWorkspaceLinkRepo`)
- `lib/firestore.ts` exposes `ensureUserRepo` helper (currently not referenced elsewhere)

---

## 5. INSIGHTS WRITES

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/insightsRepository.ts` | `incrementInsightsOnFeedbackCreateRepo` | Increments feedback/issue/session/day analytics counters | `workspaces/{id}/insights/main` | no | yes (in server feedback flows) | ⚪ optional |
| `lib/repositories/insightsRepository.ts` | `incrementInsightsOnCommentCreateRepo` | Increments comment/day analytics counters | `workspaces/{id}/insights/main` | no | no dedicated comment API | ⚪ optional |
| `lib/repositories/insightsRepository.ts` | `incrementInsightsOnFeedbackResolvedRepo` | Increments/decrements resolved/day counters | `workspaces/{id}/insights/main` | no | yes (in server ticket resolve flows) | ⚪ optional |

---

## 6. VIEW TRACKING

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/sessionsRepository.ts` | `recordSessionViewIfNewRepo` | Deduped view tracking per viewer/session | `sessionViews/{sessionId}/views`, `sessions` | no | no | ⚪ optional |

---

## 7. OTHER

### Workspace settings writes from client UI

| File path | Function | What it does | Collection(s) | Critical? | API equivalent? | Risk |
|---|---|---|---|---|---|---|
| `lib/repositories/workspacesRepository.ts` | `createWorkspaceRepo` | Creates workspace doc | `workspaces` | yes | no (non-admin user route missing) | 🔴 critical |
| `lib/repositories/workspacesRepository.ts` | `ensureWorkspaceRepo` | Creates workspace if missing | `workspaces` | yes | no | 🟡 important |
| `lib/repositories/workspacesRepository.ts` | `updateWorkspaceName` | Updates workspace name | `workspaces` | yes | no | 🟡 important |
| `lib/repositories/workspacesRepository.ts` | `updateWorkspaceNotifications` | Updates notification settings | `workspaces` | yes | no | 🟡 important |
| `lib/repositories/workspacesRepository.ts` | `updateWorkspaceAppearance` | Updates appearance settings | `workspaces` | no | no | ⚪ optional |
| `lib/repositories/workspacesRepository.ts` | `updateWorkspaceSettings` | Generic settings update payload | `workspaces` | yes | no | 🟡 important |
| `lib/repositories/workspacesRepository.ts` | `updateWorkspacePlanRepo` | Updates billing plan field | `workspaces` | yes | yes (admin-only routes) | 🟡 important |

Client call sites:
- `app/onboarding/page.tsx`
- `app/(app)/settings/page.tsx`

---

## Required Search Tokens Summary

- `addDoc(`: found in client write path (`commentsRepository.ts`)
- `setDoc(`: found in client write paths (`usersRepository.ts`, `workspacesRepository.ts`)
- `updateDoc(`: found in client write paths (`feedbackRepository.ts`, `commentsRepository.ts`, `sessionsRepository.ts`, `usersRepository.ts`, `workspacesRepository.ts`)
- `deleteDoc(`: found in client write paths (`feedbackRepository.ts`, `commentsRepository.ts`, `sessionsRepository.ts`)
- `runTransaction(`: found in client write paths (`feedbackRepository.ts`, `commentsRepository.ts`, `sessionsRepository.ts`, `usersRepository.ts`, `insightsRepository.ts`)
- `writeBatch(`: **no matches**
- `increment(`: found in client write paths (`feedbackRepository.ts`, `commentsRepository.ts`, `sessionsRepository.ts`, `insightsRepository.ts`)
- `arrayUnion(`: **no matches**
- `arrayRemove(`: **no matches**

---

## Duplication / Mixed Pattern Findings

1. **Dual repositories with duplicated write logic**  
   For feedback, sessions, users, and insights there are both:
   - client-write modules (`lib/repositories/*Repository.ts`)
   - server-write modules (`lib/repositories/*Repository.server.ts`)

2. **Mixed invocation style in app**  
   - Ticket/session writes are mostly routed through API endpoints (`/api/tickets/*`, `/api/sessions/*`).
   - Comment and workspace/user onboarding/settings writes are still direct client Firestore writes.

3. **Comment subsystem is the main migration gap**  
   - Comment create/update/delete and associated counter updates are performed client-side with no user-facing API replacement.

4. **Auth/onboarding still performs client-side identity/workspace provisioning writes**  
   - `ensureUserWorkspaceLinkRepo` in `useAuthGuard` and onboarding calls (`createWorkspaceRepo`, `setUserWorkspaceIdRepo`) bypass API.

---

## Migration Priority (from this inventory)

- **🔴 Critical first**: comments writes, user/workspace provisioning writes, and any client-callable feedback/session write path.
- **🟡 Important next**: non-core settings updates and metadata counter writes attached to comments/sessions.
- **⚪ Optional later**: insights-only analytics counters and session view tracking.

