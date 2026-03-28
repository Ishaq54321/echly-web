# Phase 1 — Global pattern scan (requested strings)

Repository scan (`.ts` / `.tsx`, excluding prior audit prose). For each pattern: **file**, **condition / role**, **blocks UI? (Y/N)**, **mark**.

Legend: **🚨 BLOCKER** · **⚠️ SAFE** (non-UI or data-only) · **✅ OK** (non-blocking or definition only)

---

## A. `claimsReady &&`

| File | Condition | Blocks UI? | Mark |
| ---- | --------- | ---------- | ---- |
| `lib/client/workspaceContext.tsx` | `isIdentityResolved` memo: `authReady && claimsReady && Boolean(workspaceId…)` | Indirectly: downstream consumers use `isIdentityResolved` for gating | ⚠️ SAFE — **SSoT definition** (not a render branch by itself) |

*No other `claimsReady &&` matches in application `.ts`/`.tsx`.*

---

## B. `!claimsReady`

| File | Condition | Blocks UI? | Mark |
| ---- | --------- | ---------- | ---- |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `if (!isIdentityResolved \|\| !workspaceIdRef.current \|\| !claimsReady) return;` in subscription setup | Gates Firestore/session data, not layout shell | ⚠️ SAFE |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `if (!claimsReady \|\| !workspaceIdRef.current) return` in `handleCreateSession` | Blocks an action until claims ready | ⚠️ SAFE (mutation guard) |
| `lib/repositories/workspacesRepository.ts` | `if (!claimsReady \|\| !wid)` | Repository precondition | ⚠️ SAFE |

---

## C. `workspaceId &&` (representative / UI-adjacent)

| File | Condition | Blocks UI? | Mark |
| ---- | --------- | ---------- | ---- |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `Boolean(workspaceId && userId) && sessionsSourceWorkspaceRef…` for `overviewDataAligned` | Hides session list data until workspace/user alignment | ⚠️ SAFE (data alignment; combines with dashboard loaders separately) |

---

## D. `!workspaceId` (high-signal UI vs lib)

*Many server/repo/script matches are preconditions only (**⚠️ SAFE**). Listed below are **client UI / hooks** where the pattern affects what the user sees or when data runs.*

| File | Role | Blocks UI? | Mark |
| ---- | ---- | ---------- | ---- |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Effect guard before `getDoc(session)` | N — shell still renders; session meta loads after identity | ⚠️ SAFE |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Effect guard for workspace match + redirect | N for initial paint; drives navigation logic | ⚠️ SAFE |
| `app/(app)/settings/page.tsx` | `if (!isIdentityResolved \|\| !workspaceId)`, `loadingWorkspace`, `disabled={… \|\| !workspaceId}`, early `return` in handlers | General tab skeleton/loading; not full app shell | ⚠️ MIXED — **progressive** tab loading (**N** for whole-page block after `authLoading`) |
| `components/discussion/DiscussionFeed.tsx` | `if (!isIdentityResolved \|\| !workspaceId) return` in `useEffect` | **Y** — `loading` stays true → spinner | 🚨 BLOCKER |
| `components/discussion/DiscussionThread.tsx` | Multiple guards (`!workspaceId`, `!isIdentityResolved`) | **Y** for thread content paths / assertions | 🚨 BLOCKER (panel content) |
| `components/discussion/DiscussionPanel.tsx` | `if (!workspaceId \|\| … \|\| !isIdentityResolved)` | **Y** for panel behavior | 🚨 BLOCKER |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | Effect guards | Data for detail; UX depends on controller consumers | ⚠️ SAFE / localized |
| `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` | `if (!isIdentityResolved \|\| !workspaceId) { setLoading(true); return; }` | **Y** — page shows loading until resolved | 🚨 BLOCKER (page region) |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | Guards on `isIdentityResolved`, `workspaceId` | Gates pagination / fetch | ⚠️ SAFE (data); session shell still paints |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | Multiple early returns | Drives dashboard session list availability | ⚠️ SAFE (data); interacts with dashboard loader |

*Additional `!workspaceId` in `lib/repositories/*`, `lib/realtime/*`, `app/api/*`, `scripts/*`: **⚠️ SAFE** (non-UI).*

---

## E. `!authReady` (early return / loading)

| File | Condition | Blocks UI? | Mark |
| ---- | --------- | ---------- | ---- |
| `app/onboarding/page.tsx` | `if (loading \|\| !authReady) return <spinner/>` | **Y** for onboarding route | 🚨 BLOCKER *(route-specific; outside `(app)` layout)* |

*No `!authReady` matches under `app/(app)/` or the three workspace guard files.*

---

## F. Implicit `claimsReady` / `workspaceId` via `isIdentityResolved`

Any check of **`!isIdentityResolved`** is equivalent to blocking on **`authReady && claimsReady && workspaceId`** (per `workspaceContext.tsx`). High-impact UI examples:

| File | Blocks UI? | Mark |
| ---- | ---------- | ---- |
| `components/discussion/DiscussionList.tsx` | **Y** — initial `loading` true, effect returns without clearing → spinner | 🚨 BLOCKER |
| `app/(app)/dashboard/insights/page.tsx` | **Y** — snapshot effect gated; `showFullPageLoader` until `data` | 🚨 BLOCKER |
| `lib/hooks/useWorkspaceUsageRealtime.ts` | `waitingForClaimsOrWorkspace` — consumer-dependent | ⚠️ SAFE / contextual |

---

## Summary

- **Boot / layout guards:** No matches for `claimsReady` / `workspaceId` / `!authReady` in `AppBootReadinessBridge`, `WorkspaceIdentityGate`, or `WorkspaceSuspendedGuard` (see sibling audit files).
- **Product UI:** Multiple **🚨 BLOCKER** surfaces remain where **`isIdentityResolved` / `workspaceId` / `!claimsReady`** prevent effects from running while **`loading === true`**, producing **spinners or full-page loaders** until claims and workspace id are ready.
