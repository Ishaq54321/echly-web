# NBIB audit — `isIdentityResolved` and `assertIdentityResolved` usage

Classification: **DATA** = listener/fetch/subscribe; **ACTION** = user/API mutation; **UI** = render/loader condition.

`isIdentityResolved` definition (source of truth): `lib/client/workspaceContext.tsx` — `authReady && claimsReady && Boolean(workspaceId?.trim())`.

---

## `isIdentityResolved` usages

| File | Type | Assessment |
|------|------|------------|
| `lib/client/workspaceContext.tsx` | Definition + export | ✅ Correct (canonical flag) |
| `app/admin/layout.tsx` | DATA (`authFetch /api/admin/me` in `useEffect`) | ✅ Correct — waits for identity |
| `components/billing/UpgradeModal.tsx` | UI / enablement (billing modal conditions) | ✅ Correct |
| `lib/billing/BillingUsageProvider.tsx` | DATA (provider enablement) | ✅ Correct |
| `components/billing/UsageMeter.tsx` | UI / DATA enablement | ✅ Correct |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | DATA / validation (`copySessionLink` + workspace match) | ✅ Correct |
| `app/(app)/settings/page.tsx` | DATA (`listenToWorkspace` when resolved) + loading UI | ✅ Correct |
| `components/layout/ProfileCommandPanel.tsx` | DATA (billing-related fetches when open) | ✅ Correct |
| `lib/hooks/useBillingUsage.ts` | DATA (`subscribeWorkspace`, refetch) | ✅ Correct (see `nbib_race_conditions.md` for loading edge) |
| `lib/hooks/useWorkspaceUsageRealtime.ts` | DATA | ✅ Correct |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | DATA (`getDoc` session), UI (`renderExecutionContent`), navigation guards | ✅ Mostly correct — see `nbib_data_leaks.md` for deep-link fetch |
| `app/(app)/dashboard/insights/page.tsx` | DATA (Firestore `onSnapshot` / `getDoc`) | ✅ Correct |
| `components/discussion/DiscussionFeed.tsx` | DATA (`getDocs` / `getDoc`) | ✅ Correct |
| `components/discussion/DiscussionList.tsx` | DATA (`authFetch /api/feedback`) | ✅ Correct |
| `components/discussion/TicketDetailsPanel.tsx` | DATA (`authFetch /api/tickets`) | ✅ Correct |
| `components/discussion/DiscussionThread.tsx` | DATA + ACTION paths | ✅ Correct |
| `components/discussion/DiscussionPanel.tsx` | DATA + ACTION | ✅ Correct |
| `components/dashboard/SessionActionsDropdown.tsx` | ACTION (`authFetch` PATCH) | ⚠️ Weak — uses `assertIdentityResolved` on some paths; entry also checks `authUid` (see action audit) |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | DATA + ACTION | ✅ Correct |
| `lib/hooks/useCommentsRepoSubscription.ts` | DATA (`listenToCommentsRepo`) | ✅ Correct |
| `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` | DATA (parallel Firestore/API helpers) | ✅ Correct |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | DATA (`onSnapshot` sessions) + ACTION | ⚠️ Weak — extra redundant `claimsReady` checks alongside `isIdentityResolved` (redundant, not unsafe) |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | DATA (`onSnapshot`) | ✅ Correct |
| `components/workspace/WorkspaceSuspendedGuard.tsx` | DATA (`authFetch /api/workspace/status`) | ✅ Correct — waits for `isIdentityResolved` before fetch |

**Not using `isIdentityResolved` (by design or gap):**

| File | Notes |
|------|--------|
| `lib/client/perception/useRenderReadiness.ts` | Uses `authReady && authUid` only — **intentional NBIB shell helper** (documented in file). |
| `app/(app)/dashboard/page.tsx` | Uses `useRenderReadiness()` for loader; sessions data from `useWorkspaceOverview()` (gated internally). |
| `components/providers/AppBootReadinessBridge.tsx` | Uses `authReady`, `authUid`, `claimsReady`, `workspaceId` directly — **boot overlay**, not `isIdentityResolved` symbol (equivalent condition for signed-in). |

---

## `assertIdentityResolved` usages (ACTION guard)

| File | Type | Assessment |
|------|------|------------|
| `lib/client/workspaceContext.tsx` | Utility definition | ✅ Correct |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | ACTION (multiple `authFetch` PATCH/DELETE and handlers) | ✅ Correct |
| `components/discussion/DiscussionThread.tsx` | ACTION (`addComment`, etc.) | ✅ Correct |
| `components/discussion/DiscussionPanel.tsx` | ACTION (`addComment`) | ✅ Correct |
| `components/dashboard/SessionActionsDropdown.tsx` | ACTION (archive/share PATCH) | ✅ Present on mutation path audited |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | ACTION (comments API) | ✅ Correct |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | ACTION (create/archive/delete session) | ✅ Correct |

**No `assertIdentityResolved` (call sites still exist):**

| Area | Assessment |
|------|------------|
| `app/(app)/settings/page.tsx` — `updateWorkspace*` via `lib/repositories/workspacesRepository.ts` | ❌ Missing frontend assert — relies on `disabled` UI + `workspaceId` checks + API (see action safety doc) |
| `components/layout/GlobalNavBar.tsx` — `getOrCreateShareLink` | ❌ Missing — guards with `authUid` only |
| `components/ui/TopControlBar.tsx` — `copySessionLink` | ❌ Missing — `authUid` only |
| `components/dashboard/SessionsWorkspace.tsx` — `copySessionLink` | ❌ Missing — `authUid` only |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | ❌ Missing — uses `authenticatedFetch` to APIs |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` — `handleDeleteFeedback` | ⚠️ Partial — DELETE `authFetch` without `assertIdentityResolved` immediately before call (identity likely true from surrounding UI state; not asserted) |
