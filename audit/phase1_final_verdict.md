# Phase 1 — Final verdict (NBIB UI audit)

Read-only verification against:

- UI should render after **`authReady`**
- UI should **not** depend on **`claimsReady`** or **`workspaceId`** for the shell
- No **identity-based blocking** beyond boot init
- No **full-screen loaders tied to identity** (except boot)

---

## 1. Is Phase 1 COMPLETE?

**⚠️ PARTIAL**

- **COMPLETE** for: **global boot overlay dismissal** (`AppBootReadinessBridge` → **`authReady` only**), **`WorkspaceIdentityGate`** (error-only), **`WorkspaceSuspendedGuard`** (no `!authReady` spinner; children immediate), **`(app)/layout.tsx`** order and lack of identity conditionals, and **`useRenderReadiness`** (no claims/workspace in the hook itself).
- **NOT COMPLETE** for: **multiple in-app surfaces** that keep **loaders or empty spinners** until **`isIdentityResolved`** (which **is** `authReady && claimsReady && workspaceId`) or until **auth guard** loading finishes.

---

## 2. Remaining blockers (exact files / surfaces)

High-impact **UI** blockers (spinners / full-region loaders tied to full identity or auth guard):

| Area | File(s) |
| ---- | ------- |
| Discussion list / feed | `components/discussion/DiscussionList.tsx`, `components/discussion/DiscussionFeed.tsx` |
| Discussion page auth wait | `app/(app)/discussion/page.tsx` (`useAuthGuard` loading) |
| Insights body | `app/(app)/dashboard/insights/page.tsx` |
| Session overview | `app/(app)/dashboard/[sessionId]/overview/page.tsx`, `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` |
| Related discussion panels | `components/discussion/DiscussionPanel.tsx`, `components/discussion/DiscussionThread.tsx` (content guards) |

**Definition propagation (not a leaf blocker):** `lib/client/workspaceContext.tsx` — `isIdentityResolved` combines **`claimsReady`** and **`workspaceId`**.

**Strictness note:** `useRenderReadiness` / dashboard loader use **`authReady && authUid`**, not **`authReady` alone** — see `app/(app)/dashboard/page.tsx`, `lib/client/perception/useRenderReadiness.ts`.

---

## 3. UI behavior summary

| Criterion | Status |
| --------- | ------ |
| Renders immediately after **`authReady`** (boot overlay) | **✔** — `AppBootReadinessBridge` + `useAppBoot(authReady)` |
| Avoids identity blocking everywhere | **✖** — several routes/components wait on **`isIdentityResolved`** / **`workspaceId`** / **`claimsReady`** for visible content |
| Progressive loading | **✔ Partial** — settings general tab and session shell lean progressive; insights, overview, discussion list are **loader-first** until identity |

---

## 4. System grade

**C — Hybrid**

- **Boot + layout shell:** aligned with true NBIB-style rules.
- **Feature surfaces:** still **coupled** to full identity for primary content and loaders.

---

## 5. One-line verdict

**UI still has hidden identity dependencies** (via **`isIdentityResolved`**, **`workspaceId`**, **`claimsReady`**, and **`useAuthGuard` loading** on some pages), even though the **global boot gate** is **`authReady`-only.
