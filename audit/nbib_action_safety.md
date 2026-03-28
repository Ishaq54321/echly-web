# NBIB audit — actions (mutations) vs `assertIdentityResolved` and backend validation

Scope: client-triggered **create / update / delete** via `authFetch`, repository PATCH helpers, and related flows.

---

## Table

| File | Action (summary) | `assertIdentityResolved` before execute? | Backend validation (visible) | Mark |
|------|------------------|----------------------------------------|------------------------------|------|
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Session/ticket PATCH/DELETE via `authFetch` | Yes on many handlers; **ticket DELETE** path not clearly preceded by assert in same function | API routes use `requireAuth` + workspace checks / `withAuthorization` patterns | ⚠️ PARTIAL |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | POST `/api/sessions`, PATCH/DELETE session | Yes | `app/api/sessions/route.ts` — `requireAuth`, `getUserWorkspaceIdRepo` | ✅ SAFE |
| `components/dashboard/SessionActionsDropdown.tsx` | PATCH session (archive, etc.) | Yes on audited mutation entry | API session routes | ✅ SAFE |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | Comment mutations via `lib/comments` → `authFetch` | Yes | Ticket/comment APIs with auth | ✅ SAFE |
| `components/discussion/DiscussionThread.tsx` | `addComment` / `updateComment` / `deleteComment` | Yes | API + Firestore rules (writes false on client SDK for comments — APIs used) | ✅ SAFE |
| `components/discussion/DiscussionPanel.tsx` | `addComment` | Yes | Same | ✅ SAFE |
| `app/(app)/settings/page.tsx` | `updateWorkspaceName` / notifications / appearance / settings | **No** | `app/api/workspaces/route.ts` PATCH — `requireAuth`, loads user workspace and validates | ⚠️ PARTIAL |
| `lib/repositories/workspacesRepository.ts` | PATCH `/api/workspaces` helpers | **No** assert in library | Server validates ownership | ⚠️ PARTIAL |
| `components/layout/GlobalNavBar.tsx` | `getOrCreateShareLink` (share link creation) | **No** | Depends on implementation of `lib/share/getOrCreateShareLink` (typically API) | ⚠️ PARTIAL |
| `components/ui/TopControlBar.tsx` | `copySessionLink` | **No** | Copy only vs API inside helper | ⚠️ PARTIAL |
| `components/dashboard/SessionsWorkspace.tsx` | `copySessionLink` | **No** | Same | ⚠️ PARTIAL |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | PATCH `/api/tickets`, transcribe | **No** | API handlers | ⚠️ PARTIAL |
| `lib/sessions.ts` / `lib/feedback.ts` / `lib/comments.ts` | Thin `authFetch` wrappers | **No** assert in module | API-side | ⚠️ PARTIAL |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `recordSessionViewIfNew` | Called only from `getDoc` path already gated by identity | `app/api/sessions/[id]/view/route.ts` | ✅ SAFE |
| `components/layout/ProfileCommandPanel.tsx` | POST `/api/auth/logout` | **No** | Logout route | ✅ SAFE (not workspace mutation) |
| `lib/client/workspaceContext.tsx` | POST `/api/users` (sync) | N/A | `requireAuth`, `setWorkspaceClaim` | ✅ SAFE |

---

## Notes

- **Backend**: `lib/server/auth/withAuthorization.ts` resolves resource workspace and compares `getUserWorkspaceIdRepo(user.uid)` — strong pattern for routes that use it (e.g. `app/api/tickets/[id]/route.ts`).
- **Firestore rules** (`firestore.rules`): client direct writes denied (`allow write: if false` for app collections); mutations are expected via Admin/API — enforcement is **server-side**, not rules for writes.

---

## Top “no assert” clusters

1. Settings workspace updates — UI disables without `workspaceId`; no `assertIdentityResolved`.
2. Share/link copy helpers — `authUid` only on some buttons.
3. Capture widget — API-only mutations without local assert.
