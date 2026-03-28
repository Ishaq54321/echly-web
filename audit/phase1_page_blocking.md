# Phase 1 — Page- and surface-level blocking

Focus: full-region loaders, skeleton gates, and early returns tied to **`isIdentityResolved`**, **`workspaceId`**, **`claimsReady`**, or auth loading — relative to the stated goal (“render after `authReady`”, no dependence on claims/workspace for shell).

---

## `app/(app)/dashboard/page.tsx`

- **`DashboardFullPageLoader`** when `!identityReady \|\| (sessionsLoading && stableSessions.length === 0)`.
- **`identityReady`** = `authReady && authUid` via `useRenderReadiness()` — **does not** wait on `claimsReady` / `workspaceId` directly.
- Session list still **depends on** `useWorkspaceOverview` / Firestore, which use **`isIdentityResolved`** / **`claimsReady`** internally — so content may stay empty or loading-backed even when `identityReady` is true.

**Mark: ⚠️ MIXED** — Dashboard uses **NBIB-friendly** `identityReady` for its own full-page loader, but **data layer** remains identity-heavy.

---

## `app/(app)/discussion/page.tsx`

- **`useAuthGuard` `loading`**: full-region spinner until auth guard settles (**not** `claimsReady` / `workspaceId` themselves).
- **`DiscussionList` / thread surfaces**: list stays in **`loading === true`** until **`isIdentityResolved`** (see `DiscussionList.tsx` effect early return), which **embeds** `claimsReady` and `workspaceId`.

**Mark: 🚨 BLOCKING** for discussion list content relative to strict NBIB.

---

## `app/(app)/dashboard/insights/page.tsx`

- **`showFullPageLoader = authLoading \|\| loading \|\| !data`**.
- Main `onSnapshot` effect returns early until **`isIdentityResolved`** and non-empty **`workspaceId`** → **`loading`** stays true → **insights body** is the full-page loader.

**Mark: 🚨 BLOCKING** on identity resolution for primary content.

---

## `app/(app)/settings/page.tsx`

- Early **`authLoading`**: centered “Loading settings…”.
- After that, page chrome renders; **`loadingWorkspace`** (includes **`!isIdentityResolved`**, **`!workspaceId`**, **`workspaceLoading`**) drives **General tab** `loading` props — progressive, not a second full-screen gate for the whole page.

**Mark: ⚠️ MIXED**

---

## `app/(app)/dashboard/[sessionId]/overview/page.tsx`

- **`if (authLoading \|\| (loading && !data.session))`** → centered “Loading…”.
- **`useSessionOverview`**: while **`!isIdentityResolved \|\| !workspaceId`**, keeps **`loading` true** → user sees loader until full identity resolution.

**Mark: 🚨 BLOCKING** for overview content.

---

## `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`

- **No** top-level full-screen gate on `isIdentityResolved`.
- **`feedbackSessionId`** undefined until **`isIdentityResolved`** → feedback pagination / search **deferred**; shell (ticket list chrome, etc.) still mounts.

**Mark: ⚠️ MIXED** — **Shell paints**; **data** identity-gated.

---

## `app/onboarding/page.tsx` (outside `(app)` layout)

- **`if (loading \|\| !authReady)`** → spinner only.

**Mark: 🚨 BLOCKING** on `authReady` for that route (expected for onboarding; not the main app shell).

---

## Overall page verdict

**⚠️ MIXED**

- **Clean:** `(app)` **layout** wrapper; **session** page shell largely immediate.
- **Still blocking:** **Insights**, **session overview**, **Discussion** list/feed, and **auth-guard** loading on Discussion — all tie visible loaders or empty spinners to **full identity** (`isIdentityResolved` / `claimsReady` / `workspaceId`) or **auth guard pending**, beyond **`authReady` alone**.
