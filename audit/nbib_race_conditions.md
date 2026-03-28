# NBIB audit — race conditions and ordering

---

## 🚨 HIGH RISK

| Location | Issue | Evidence |
|----------|-------|----------|
| *(none classified as high with proven cross-tenant data corruption in this read-only pass)* | — | — |

---

## ⚠️ POSSIBLE

| Location | Issue | Evidence |
|----------|-------|----------|
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Deep-link ticket hydrate `useEffect` omits `isIdentityResolved` / `workspaceId` from dependencies and guards | Effect runs on `ticketIdFromUrl`, `feedbackLoading`, etc.; may call `authFetch(/api/tickets/...)` before identity flag flips true in edge timing; API returns 403/forbidden if mis-scoped |
| `lib/hooks/useBillingUsage.ts` | When `!isIdentityResolved`, async path returns after `clearWorkspaceSubscription()` without `setLoading(false)` in that branch | Could leave `loading` true across identity transition depending on prior state — UI flicker or stuck meter (needs runtime confirmation) |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | Separate effects: one seeds cache on `[userId, workspaceId]` without `isIdentityResolved`; another subscribes with `isIdentityResolved` | Designed alignment: `workspaceId` only non-null when resolution succeeded in normal flow; low risk but ordering-sensitive |
| `lib/client/workspaceContext.tsx` | Concurrent `onAuthStateChanged` / generation counter | Uses `authSyncGenerationRef` and `cancelled` — **mitigation present** |

---

## ✅ SAFE

| Location | Mitigation |
|----------|------------|
| `WorkspaceProvider` identity sync | `currentGen !== authSyncGenerationRef.current` checks before applying results |
| `useWorkspaceOverview` Firestore listener | Guard `if (!isIdentityResolved \|\| !userId \|\| !workspaceId) return` |
| `useSessionFeedbackPaginated` | Same class of guard before `onSnapshot` |
| `useCommentsRepoSubscription` | Requires `isIdentityResolved` and non-empty `workspaceId` |

---

## Dependency-array notes

- Strict **exhaustive-deps** compliance was not machine-verified for all files; manual review flagged **SessionPageClient** deep-link effect as the clearest **identity ordering** gap relative to the stated NBIB policy.
