# Phase 6 — Early data layer (break identity dependency)

**Date:** 2026-03-28  
**Scope:** Client-only. No backend or Firestore rule changes. Mutations still use `assertIdentityResolved(isIdentityResolved)` where they already did.

## 1. Objective

Start Firestore and workspace-scoped data work as soon as **`authUid`** is available, instead of waiting for **`isIdentityResolved`** (`authReady && claimsReady && workspaceId`). Queries remain **scoped by `workspaceId`** (and session/feedback ids) where the path or `where` clause requires them.

## 2. Files updated

| Area | File |
|------|------|
| Dashboard sessions | `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` |
| Session feedback list | `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` |
| Session page | `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` |
| Feedback detail / comments | `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` |
| Session overview data | `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` |
| Insights | `app/(app)/dashboard/insights/page.tsx` |
| Comments subscription | `lib/hooks/useCommentsRepoSubscription.ts` |
| Workspace doc realtime | `lib/hooks/useWorkspaceUsageRealtime.ts` |
| Billing usage + Firestore retain | `lib/hooks/useBillingUsage.ts` |
| Billing provider / meters | `lib/billing/BillingUsageProvider.tsx`, `components/billing/UsageMeter.tsx`, `components/billing/UpgradeModal.tsx`, `components/billing/BillingUsageCacheInitializer.tsx` |
| Settings workspace listener | `app/(app)/settings/page.tsx` |
| Suspended guard (status fetch) | `components/workspace/WorkspaceSuspendedGuard.tsx` |
| Admin gate | `app/admin/layout.tsx` |
| Profile panel | `components/layout/ProfileCommandPanel.tsx` |
| Discussion | `components/discussion/DiscussionFeed.tsx`, `DiscussionList.tsx`, `DiscussionPanel.tsx`, `DiscussionThread.tsx`, `TicketDetailsPanel.tsx` |

## 3. Identity guards removed (data path)

Replaced patterns of **`if (!isIdentityResolved) return`** (or combined `!isIdentityResolved || !authUid`) on **subscriptions and reads** with **`if (!authUid) return`** (or `!authUid` only where `authUid` was redundant with identity).

**Still required for actual Firestore/API work:**

- **`workspaceId`** (trimmed) wherever the query or `listenToWorkspace` needs a workspace.
- **`sessionId` / `feedbackId`** where applicable.

**Explicitly unchanged (per rules):**

- All **`assertIdentityResolved(isIdentityResolved)`** call sites for **mutations** (create/update/delete, copy link, comments, etc.).
- **`refreshSessions` in `useWorkspaceOverview`** no longer requires `claimsReady`; it only needs **`authUid`** and **`workspaceIdRef.current`** (same as “has a workspace id for this user” once resolved).

## 4. New data flow behavior

1. **`WorkspaceProvider`** still sets **`authUid`** on the first auth callback; **`workspaceId`** and **`claimsReady`** follow the existing async identity sync (`POST /api/users`, `getIdToken(true)`, `getUserWorkspaceIdRepo`).
2. **Listeners and fetches** that only needed “signed in” now key off **`authUid`** in their effect guards and dependency arrays, not **`isIdentityResolved`**.
3. **Workspace-scoped Firestore** (`sessions` list, `feedback` list, insights doc, `retainWorkspaceFirestoreListener`, comments repo) still **does not run** until **`workspaceId`** (and other path ids) are present — but it **no longer additionally waits** on the **`isIdentityResolved`** boolean.
4. **`listenToWorkspace(..., claimsReady)`** is unchanged internally; settings still passes **`claimsReady`** from context so the repo continues to no-op until claims are ready (avoids attaching a useless listener).

## 5. UI / product surfaces intentionally not changed (phase scope)

- **`app/(app)/dashboard/page.tsx`** — placeholder / disabled controls still use **`isIdentityResolved`**.
- **`app/(app)/dashboard/[sessionId]/overview/page.tsx`** — skeleton and redirect conditions still use **`isIdentityResolved`**.
- **`app/(app)/dashboard/insights/page.tsx`** — **`showInsightsSkeleton` / `insightsSkeletonImmediate`** still reference **`isIdentityResolved`** (data effects use **`authUid`**).

## 6. Edge cases

| Topic | Notes |
|--------|--------|
| **`authUid` without `workspaceId`** | Effects return early; no query is built; no cross-workspace reads. |
| **Claims vs listener** | `listenToWorkspace` still gates on **`claimsReady`** inside `workspacesRepository.ts`. Other listeners rely on rules + scoped ids; permission errors surface in existing `onSnapshot` error handlers where present. |
| **`WorkspaceSuspendedGuard`** | Status fetch runs when **`authUid`** is set (no longer waits for full identity). Server must continue to enforce workspace/session authorization. |
| **Admin `/api/admin/me`** | Same as above: runs on **`authUid`** only. |
| **Naming** | `useWorkspaceUsageRealtime`: `waitingForClaimsOrWorkspace` renamed to **`waitingForAuthOrWorkspace`** (`!authUid \|\| !widReady`). |

## 7. Verification

- `npx tsc --noEmit` — **pass** (2026-03-28).

## 8. Success criteria (checklist)

- Firestore listeners for dashboard sessions, session feedback, insights doc, comments, and workspace retain paths **do not depend on `isIdentityResolved` in their effect guards**.
- **Mutations** still go through **`assertIdentityResolved`** where required.
- Queries remain **workspace- (and session-) scoped**; no broadened collection reads were introduced.
