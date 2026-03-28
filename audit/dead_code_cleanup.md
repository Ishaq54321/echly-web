# Dead code & legacy cleanup (post Phase 1–5)

**Date:** 2026-03-28  
**Scope:** Client/dashboard hooks, realtime store, session page, discussion page, login session cookie helper. **No backend/API route logic changes** (per constraints).

---

## 1. Files cleaned

| Area | Files |
|------|--------|
| Dashboard / sessions | `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`, `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`, `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`, `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts`, `app/(app)/dashboard/insights/page.tsx` |
| Discussion / auth UI | `app/(app)/discussion/page.tsx`, `app/(auth)/login/page.tsx` |
| Shared hooks / store | `lib/realtime/workspaceStore.ts`, `lib/hooks/useCommentsRepoSubscription.ts`, `lib/hooks/useBillingUsage.ts`, `lib/hooks/useWorkspaceUsageRealtime.ts` |

---

## 2. Code removed (summary)

- **`[ECHLY][race]` `console.debug`:** Removed from all former call sites (insights page, session client, session feedback hook, workspace overview, session overview, billing usage, workspace usage realtime, comments repo subscription, `workspaceStore`). The `raceDebug` flag in `workspaceStore` was deleted with it.
- **Client timing / ad-hoc logs in `useWorkspaceOverview`:** Removed `console.time` / `console.timeEnd` for `"CLIENT counts fetch"` and `"CLIENT sessions fetch"`, and removed `console.log` lines that logged session count / counts call count (left `console.error` paths for real failures).
- **Login:** Removed debug `console.log` for session API HTTP status in `createSessionCookie` (`app/(auth)/login/page.tsx`).
- **`useSessionFeedbackPaginated` API:** Dropped unused parameters (`scrollContainerRef`, `scrollReady`, `resolvedExpanded`, `openExpanded`, `isSearchMode`) — they were not referenced in the hook body; only `SessionPageClient` called it, and the call site was updated.
- **`SessionPageClient`:** Removed `listScrollReady` state and `onScrollContainerReady` props (only used to bump a counter for the removed hook args). Kept `listScrollRef` for scroll container wiring.
- **Discussion page:** Removed unused `refreshKey` / `setRefreshKey` state; `DiscussionList` already defaults `refreshKey` to `0`.
- **Ref updates during render (React Compiler / eslint `react-hooks/refs`):** Moved `onCommentsRef.current = onComments` into `useEffect` in `useCommentsRepoSubscription.ts`; moved `workspaceIdLiveRef.current = workspaceId` into `useEffect` in `insights/page.tsx`.

---

## 3. Hooks removed

- **None** — no custom hooks deleted. One hook **signature** was simplified (`useSessionFeedbackPaginated`).

---

## 4. Guards removed

- **None** — identity / workspace early returns in effects (e.g. `!isIdentityResolved`, `!workspaceId`) were **kept**. They are not redundant with `assertIdentityResolved` (which is for **mutation** entry points, not Firestore listener subscription timing).

---

## 5. Logs removed

- All `console.debug` lines matching **`[ECHLY][race]`** in the app/lib client tree.
- Debug **`console.log`** / **`console.time`** / **`console.timeEnd`** called out above in workspace overview and login.

**Intentionally not stripped (out of scope / operational):**

- `ECHLY_DEBUG`-gated logs in capture engine, extension sources, and `lib/utils/logger.ts` (product diagnostics, large surface).
- Server / API `console.warn` / security / idempotency logs under `lib/server`, `app/api`, repositories (backend constraint).
- Script-only `console.log` under `scripts/`.

---

## 6. Remaining complexity / follow-ups

- **ESLint `react-hooks/set-state-in-effect` and `react-hooks/refs`:** Still report on several files (including some touched here); they predate this pass and were not “fixed” to avoid behavior changes.
- **Project-wide unused imports:** `tsc --noEmit` passes; unused imports are not always reported by TS. A full sweep would need **`eslint .`** with fixes applied file-by-file (large diff).
- **`lib/api/*`:** `fetchBillingUsage.ts` and `sessionSharesClient.ts` are both referenced; no dead helpers removed.
- **Legacy `if (!workspaceId) return` patterns:** Not bulk-removed; many are required for listener lifecycle and differ from `assertIdentityResolved` semantics.

---

## 7. Verification

- **`npx tsc --noEmit`:** Passes after changes.
- **Runtime:** Not executed in this session; spot-check dashboard, session, discussion, and settings as usual after deploy.

---

## Success criteria (this pass)

| Criterion | Status |
|-----------|--------|
| No `[ECHLY][race]` debug noise in cleaned paths | Done |
| No dead hook parameters on `useSessionFeedbackPaginated` | Done |
| No unused `refreshKey` on discussion page | Done |
| Identity / `assertIdentityResolved` architecture untouched | Done |
| No backend/API behavioral edits | Done |
| Entire repo: zero unused imports / zero eslint issues | Not claimed (see §6) |
