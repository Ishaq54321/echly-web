# NBIB audit — data calls vs identity gating

Question per call site: **Is `isIdentityResolved` (or equivalent full identity) checked before the request/subscription runs?**

Legend: **Uses workspaceId?** = does the operation scope to a workspace or user session resource. **Gated?** = explicit client guard aligned with `authReady && claimsReady && workspaceId`.

---

## Firestore client — `onSnapshot`

| File | Call | Uses `workspaceId`? | Gated by identity? | Mark |
|------|------|---------------------|--------------------|------|
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `onSnapshot` sessions query | Y | Y (`isIdentityResolved`, `userId`, `workspaceId`) | ✅ SAFE |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | `onSnapshot` feedback query | Y | Y | ✅ SAFE |
| `app/(app)/dashboard/insights/page.tsx` | `onSnapshot` insights doc | Y | Y | ✅ SAFE |
| `lib/repositories/commentsRepository.ts` | `onSnapshot` (via `listenToCommentsRepo`) | Y | Indirect — `useCommentsRepoSubscription` gates | ✅ SAFE |
| `lib/realtime/workspaceStore.ts` | `onSnapshot` `workspaces/{id}` | Y | Callers: `useBillingUsage`, `listenToWorkspace` gate | ✅ SAFE |

---

## Firestore client — `getDoc` / `getDocs`

| File | Call | Uses `workspaceId`? | Gated? | Mark |
|------|------|---------------------|--------|------|
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `getDoc` session | Y (validates vs context) | Y (effect requires `isIdentityResolved`, `authUid`, `workspaceId`) | ✅ SAFE |
| `app/(app)/dashboard/insights/page.tsx` | `getDoc` session | Y | Y | ✅ SAFE |
| `components/discussion/DiscussionFeed.tsx` | `getDocs` + `getDoc` | Y | Y | ✅ SAFE |
| `lib/repositories/usersRepository.ts` | `getDoc` / `getDocFromServer` `users/{uid}` | N (uid-scoped) | Special — **identity resolution pipeline** inside `WorkspaceProvider` after POST `/api/users` | ✅ SAFE (not “app data”) |
| `lib/repositories/workspacesRepository.ts` | `getDoc` workspace | Y | Library — callers must gate; settings uses `listenToWorkspace(..., claimsReady)` | ⚠️ RISK if misused |
| `lib/repositories/sessionsRepository.ts`, `feedbackRepository.ts`, etc. | various | Y/N | Used from hooks that gate (`useSessionOverview`, etc.) or server | ✅ SAFE at audited call sites |

---

## HTTP `fetch` / `authFetch` — app shell

| File | Call | Uses `workspaceId`? | Gated? | Mark |
|------|------|---------------------|--------|------|
| `lib/client/workspaceContext.tsx` | `authFetch POST /api/users` | N (bootstrap) | Special — **establishes** identity; not gated by `isIdentityResolved` | ✅ SAFE (by definition) |
| `components/billing/BillingUsageCacheInitializer.tsx` | `fetchBillingUsage` → `GET /api/billing/usage` | Y (server resolves from uid) | **No** `isIdentityResolved` / `workspaceId` check | 🚨 CRITICAL (violates stated “data layer waits for identity” rule; server still `requireAuth` + `getUserWorkspaceIdRepo`) |
| `lib/hooks/useBillingUsage.ts` | `getBillingUsageCached` / refetch | Y | Y (`isIdentityResolved`, workspace trimmed) | ✅ SAFE |
| `components/discussion/DiscussionList.tsx` | `authFetch /api/feedback` | Y (server-scoped) | Y (`isIdentityResolved`) | ✅ SAFE |
| `components/discussion/TicketDetailsPanel.tsx` | `authFetch /api/tickets/:id` | Y | Y | ✅ SAFE |
| `components/workspace/WorkspaceSuspendedGuard.tsx` | `authFetch /api/workspace/status` | Y | Y (`isIdentityResolved`) | ✅ SAFE |
| `app/admin/layout.tsx` | `authFetch /api/admin/me` | N | Y (`isIdentityResolved`) | ✅ SAFE |
| `lib/state/fetchCountsDedup.ts` | `authFetch /api/feedback/counts` | Y | Caller `useSessionOverview` gates | ✅ SAFE |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `authFetch /api/tickets/:id` (deep link hydrate) | Y | **No** `isIdentityResolved` in effect guard/deps | ⚠️ RISK — backend `withAuthorization` / `userWorkspaceMatchesSession` enforces |
| `lib/hooks/usePlanCatalog.ts` | `fetch(CATALOG_API)` | N | Public catalog | ✅ SAFE (non-workspace data) |
| `components/share/useShareCounts.ts` | `fetch /api/feedback/counts` | Y | Share page context; auth via cookie + token param | ⚠️ RISK — intentional public/share path; not `isIdentityResolved` model |

---

## `axios`

- No `axios` usage found under main app `*.ts` / `*.tsx` sources in this audit scan (extension/utils may differ).

---

## Server Actions

- No `"use server"` modules found in repository scan.

---

## Summary counts (representative, not exhaustive of every repo helper)

- **🚨 CRITICAL (client rule violation)**: `BillingUsageCacheInitializer` — billing usage fetch without identity gate.
- **⚠️ RISK**: Session deep-link ticket hydrate; shared `useShareCounts`; low-level repo functions if called without guards.
- **✅ SAFE**: Major Firestore listeners (`useWorkspaceOverview`, `useSessionFeedbackPaginated`, insights, discussion feed, comments hook).
