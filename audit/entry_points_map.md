# Phase 6.7 — UI entry points map

Read-only audit. Maps Next.js routes to primary client components and their main data dependencies.

## Signed-in app shell (`app/(app)/layout.tsx`)

- **Providers**: `WorkspaceProvider`, `WorkspaceSuspendedGuard`, `WorkspaceIdentityGate`, `BillingUsageCacheInitializer`, `WorkspaceOverviewProvider`, `SessionsSearchProvider`, `GlobalSearch`, `AppBootGate` / `AppBootReadinessBridge`.
- **Cross-cutting data**: workspace identity (`lib/client/workspaceContext.tsx`), global session list + counts (`WorkspaceOverviewProvider` → `useWorkspaceOverviewState`), billing store prefetch (`BillingUsageCacheInitializer` → `fetchBillingUsage`).

---

## Main dashboard & sessions

| Route | Page / client | Primary components | Data dependencies |
|-------|----------------|-------------------|-------------------|
| `/dashboard` | `app/(app)/dashboard/page.tsx` | `SessionsWorkspace`, filters, `DeleteSessionModal`, `DashboardCaptureHost` | `useWorkspaceOverview()` → Firestore `onSnapshot` on `sessions` (limit 30) + parallel `/api/feedback/counts` per session via `hydrateCountsForSessionIds` / `sessionCountsStore` cache; `useWorkspace()` for identity; `useStableState` for list perception |
| `/dashboard/[sessionId]` | `app/(app)/dashboard/[sessionId]/page.tsx` → `SessionPageClient.tsx` | `TicketList`, `ExecutionView`, `CommentPanel`, `TopControlBar` | `getDoc(sessions/{id})` for session meta; `useSessionFeedbackPaginated` → Firestore `onSnapshot` on `feedback` (workspace + session) + `/api/feedback/counts` + `sessionCountsStore`; `useFeedbackDetailController` → `onSnapshot` on `comments` per selected ticket; `authFetch` search, ticket PATCH/DELETE, session PATCH/DELETE; optional `GET /api/tickets/:id` for `?ticket=` deep link |
| `/dashboard/[sessionId]/overview` | `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Overview layout, metric cards, activity | `useSessionOverview` → `getSessionById`, `fetchCounts` → `/api/feedback/counts`, `getSessionFeedbackByResolved` (2× Firestore `getDocs`), `getSessionRecentComments` (`getDocs`), `getFeedbackByIds` (N× `getDoc`) |

---

## Insights & workspace-wide analytics

| Route | Page | Data dependencies |
|-------|------|-------------------|
| `/dashboard/insights` | `app/(app)/dashboard/insights/page.tsx` | Firestore `onSnapshot` on workspace insights doc (`workspaceInsightsRef`); secondary `getDoc` per top session id (up to 10) for chart labels; client `useMemo` for charts from doc payload |

---

## Discussion (tickets with comments)

| Route | Page | Data dependencies |
|-------|------|-------------------|
| `/discussion` | `app/(app)/discussion/page.tsx` | `DiscussionList` → `authFetch` `GET /api/feedback?conversationsOnly=true&limit=20`; `DiscussionThread` → `authFetch` `GET /api/tickets/:id`, `GET /api/sessions/:id`, `useCommentsRepoSubscription` → Firestore `onSnapshot` on `comments` for selected feedback |

**Note**: `DiscussionFeed.tsx` implements an alternate Firestore path (`getDocs` feedback + chunked `getDoc` sessions) but is **not referenced** by any route in this repo (orphaned component).

---

## Settings & billing surfaces

| Route | Page | Data dependencies |
|-------|------|-------------------|
| `/settings` | `app/(app)/settings/page.tsx` | Workspace/user settings via APIs and Firestore as implemented in page (mutations gated by `assertIdentityResolved` where applicable) |

**Global rail / modals**: `ProfileCommandPanel`, `UsageMeter`, `UpgradeModal` use `useWorkspaceUsageRealtime` → `useWorkspaceRealtimeStore` (backed by shared `workspaces/{id}` listener when retained).

---

## Share / public (no app shell providers)

| Route | Page | Data dependencies |
|-------|------|-------------------|
| `/s/[token]` | `app/s/[token]/page.tsx` | Server `fetch` → `GET /api/public/share/:token` (Admin SDK: session + feedback list, sanitized JSON); `PublicShareSessionView` with `usePublicSessionRealtime` (currently **no** client Firestore; placeholder state) |

---

## Extension-triggered flows

| Route | Purpose | Data dependencies |
|-------|---------|-------------------|
| `/extension-auth` | `app/extension-auth/page.tsx` — broker tab | `POST /api/extension/session` (cookie session → extension token), redirect to `/login` on 401 |
| Capture / tray | `lib/capture-engine`, extension messaging | Extension uses tokens; dashboard listens for `ECHLY_FEEDBACK_CREATED` / `ECHLY_TICKET_UPDATED` window events (`SessionPageClient`) |

Other API routes used by extension: `app/api/feedback/search/route.ts` supports `x-extension-token` (see route implementation).

---

## Auth, onboarding, admin (summary)

| Area | Routes | Role |
|------|--------|------|
| Auth | `/login`, `/signup` | Entry to app; no workspace overview |
| Onboarding | `/onboarding`, `/onboarding/activate` | Post-signup flows |
| Workspace suspended | `/workspace-suspended` | Gated UX |
| Admin | `/admin`, `/admin/customers`, `/admin/plans`, `/admin/usage` | Admin layout + pages |
| Root | `/` | Marketing / redirect as configured |

---

## Global search

| Component | Data |
|-----------|------|
| `components/search/GlobalSearch.tsx` | `useWorkspaceOverview()` — same Firestore session list + counts as dashboard (no separate query) |

---

## Quick reference: route → primary “screen owner”

- **Sessions hub**: `dashboard/page.tsx` + `useWorkspaceOverview`.
- **Ticket board**: `SessionPageClient.tsx` + `useSessionFeedbackPaginated` + `useFeedbackDetailController`.
- **Session overview analytics page**: `overview/page.tsx` + `useSessionOverview`.
- **Workspace insights**: `insights/page.tsx` + insights doc snapshot.
- **Discussions hub**: `discussion/page.tsx` + `DiscussionList` + `DiscussionThread`.
