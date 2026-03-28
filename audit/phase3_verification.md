# Phase 3 — Action layer enforcement (`assertIdentityResolved`)

## Policy

- **Enforcement primitive:** `assertIdentityResolved(isIdentityResolved)` in `lib/client/workspaceContext.tsx` throws `"Identity not ready"` if workspace identity is not resolved (`authReady && claimsReady && non-empty workspaceId`).
- **Scope:** Client-side only; **no backend changes** in this phase.
- **UX:** Buttons and disabled states may still gate clicks; mutations additionally **must not** rely on UI alone.

## Mutations updated in this phase

| Location | Mutation / API | Assertion |
|----------|----------------|-----------|
| `app/(app)/settings/page.tsx` | `updateWorkspaceName`, `updateWorkspaceNotifications`, `updateWorkspaceAppearance`, `updateWorkspaceSettings` (all Firestore-backed via `authFetch` in repo) | `assertIdentityResolved` at each handler entry; missing `workspaceId` after assert throws (no silent skip). |
| `components/layout/GlobalNavBar.tsx` | `getOrCreateShareLink` → POST share-link | Assert before network; `authUid` validated for `string` before call. |
| `components/ui/TopControlBar.tsx` | `copySessionLink` → POST share-link | Assert before `copySessionLink`. |
| `components/dashboard/SessionsWorkspace.tsx` | Row: `copySessionLink`; bulk: `archiveSelected` / `unarchiveSelected` / `deleteSelected` | Assert before copy and before bulk parent callbacks (parent APIs already assert in `useWorkspaceOverview`). |
| `components/share/ShareModal.tsx` | `shareSession` (POST), `updateSharePermission` / `updateSessionLinkAccess` (PATCH) | Assert before each write. |
| `components/dashboard/SessionActionsDropdown.tsx` | `copySessionLink` | Assert added before copy (rename already asserted). |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | `copySessionLink` | Assert before copy. |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | POST `/api/transcribe-audio`; PATCH `/api/tickets/:id`; `getOrCreateShareLink` in `handleShare` | `guardWorkspaceMutations()` calls optional `assertIdentityBeforeWorkspaceMutations` when provided. |
| `lib/capture-engine/core/types.ts` + `CaptureWidget.tsx` | Prop plumbing | `assertIdentityBeforeWorkspaceMutations?: () => void` — **extension omits** (identity via extension auth). |

## Already covered before / during prior work (verified)

| Area | Notes |
|------|--------|
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | PATCH/DELETE ticket + session paths use `assertIdentityResolved` (including `handleDeleteFeedback`). |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | Comment/reply/pin mutations assert. |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | Create session, archive, delete assert. |
| `components/discussion/*` | Panel/thread/pin flows assert before `authFetch` writes where applicable. |
| `components/dashboard/SessionActionsDropdown.tsx` | Rename PATCH asserted; copy link now asserted. |

## Reads (no assertion required for Phase 3 mutation rule)

Examples: `authFetch` GET for insights, discussion hydration, session shares **list**, link access **read**, `SessionPageClient` search/ticket GETs. These are not POST/PATCH/DELETE workspace mutations.

## Intentional exceptions / follow-ups

| Item | Rationale |
|------|-----------|
| `WorkspaceProvider` bootstrap | `authFetch("/api/users", POST)` runs **before** `isIdentityResolved` can be true; asserting would deadlock identity resolution. |
| Chrome extension + `useCaptureWidget` | Host does not pass `assertIdentityBeforeWorkspaceMutations`; extension uses its own authenticated fetch path. |
| `lib/repositories/workspacesRepository.ts` | Low-level helpers; **call sites** (e.g. settings) must assert — settings now do. |
| `lib/api/sessionSharesClient.ts`, `utils/copySessionLink.ts`, `lib/share/getOrCreateShareLink.ts` | Shared utilities; enforcement at **UI entry points** and optional capture callback. |
| `ProfileCommandPanel` `POST /api/auth/logout` | Session teardown; not workspace-scoped; left unchanged to avoid blocking sign-out if identity is stuck. |
| Onboarding / auth pages / admin | Outside signed-in workspace shell or separate flows; not part of this pass. |

## Coverage summary

- **Workspace app mutations** touched in this phase now fail fast with a **controlled error** if identity is not resolved, instead of relying on `if (!workspaceId)` / `if (!authUid)` silent returns alone.
- **`tsc --noEmit`:** passes after changes.

## Missing spots (none blocking for stated app scope)

- Any **new** UI that calls `authFetch` with write methods without `useWorkspace` + assert should be caught in code review; grep for `method: "POST"`, `"PATCH"`, `"DELETE"` in new features.
