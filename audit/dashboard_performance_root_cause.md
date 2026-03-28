# Dashboard performance — root cause audit (read-only)

**Scope:** Trace from dashboard mount until session rows are visible. **No code changes** were made for this document. Timing labels (T0–T3) are **logical phases** inferred from execution order in source; **exact millisecond durations were not measured in this audit** (would require Runtime / DevTools).

---

## Section 1 — Session load flow trace

### Where sessions are fetched

| Layer | Mechanism | Evidence |
|-------|-----------|----------|
| Data hook | `useWorkspaceOverviewState` in `useWorkspaceOverview.ts` | Single Firestore `onSnapshot` on `sessions` |
| Not used on dashboard page | `getDocs` one-shot for the list | No `getDocs` in this hook for the list |
| Provider | `WorkspaceOverviewProvider` mounts hook once for the app shell | Same state feeds dashboard + `GlobalSearch` |

**Query:**

```209:214:app/(app)/dashboard/hooks/useWorkspaceOverview.ts
    const q = query(
      collection(db, "sessions"),
      where("workspaceId", "==", wid),
      orderBy("updatedAt", "desc"),
      limit(SESSION_LIST_LIMIT)
    );
```

**Listener:**

```216:266:app/(app)/dashboard/hooks/useWorkspaceOverview.ts
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        sessionsSourceWorkspaceRef.current = wid;
        const dbSessions: Session[] = snap.docs.map((docSnap) => {
          // ... maps docs to Session[]
        });
        // setAllSessions merges optimistic + dbSessions, caches to sessionStorage
        void (async () => {
          try {
            await hydrateCountsForSessionIds(
              ids,
              setCountsBySessionId,
              () => sessionsSnapshotGenRef.current === snapshotGen
            );
          } catch (error) {
            // ...
          }
          if (workspaceIdRef.current !== wid || sessionsSnapshotGenRef.current !== snapshotGen) return;
          setIsCountsReady(true);
          setLoading(false);
        })();
      },
      (err) => {
        // ...
        setIsCountsReady(true);
        setLoading(false);
      }
    );
```

### Timeline (logical)

| Phase | Label | What happens |
|-------|-------|----------------|
| **T0** | Shell / route mount | `AppLayout` renders `WorkspaceProvider` → `WorkspaceOverviewProvider` → dashboard `page.tsx`. |
| **T0→T1** | Identity gate | Firestore **sessions** listener effect **does not run** until `isIdentityResolved` is true (see Section 5). Meanwhile `WorkspaceProvider` runs `POST /api/users`, `getIdToken(true)`, client `getUserWorkspaceIdRepo` (Firestore `users/{uid}`). |
| **T1** | Query / listener attach | `onSnapshot` registered when `isIdentityResolved && userId && workspaceId`. |
| **T2** | First snapshot | Callback maps documents → `setAllSessions`. Session **documents** are in React state; **`loading` is still `true`** until the async block finishes. |
| **T2→T3** | Count hydration | `hydrateCountsForSessionIds` runs (`Promise.all` over session ids — see Section 3). **`setLoading(false)` only after this completes.** |
| **T3** | UI “sessions visible” | Dashboard uses `useStableState(sessions, !sessionsLoading, …)` so the list commit used for rendering tracks `loading` (see Section 2). |

**Net:** Wall-clock to visible list is dominated by **identity setup + first snapshot + completion of all per-session count fetches** (cold path), not by `getDocs` for sessions.

---

## Section 2 — Blocking dependencies

### Does session *render* depend on counts / usage / status / billing / identity?

| Dependency | Blocks session list? | Classification | Evidence |
|------------|---------------------|----------------|----------|
| **Identity** (`isIdentityResolved`) | **Yes — listener** | Blocking (for Firestore list) | `onSnapshot` effect returns early if identity not ready. |
| **Counts API** (`/api/feedback/counts`) | **Yes — “visible list” on cold path** | Blocking (via `loading` + `useStableState`) | `setLoading(false)` runs after `hydrateCountsForSessionIds`. Dashboard gates skeleton on `sessionsLoading && stableSessions.length === 0`. |
| **`isCountsReady`** | **Indirect** | Coupled | Set together with `loading` false after hydration; not directly read in `page.tsx` but tied to same async completion. |
| **Usage / billing** | **No** for list | Independent | `BillingUsageCacheInitializer` runs post–identity with `requestIdleCallback` / timeout; does not gate `useWorkspaceOverview`. |
| **Workspace status** (`/api/workspace/status`) | **No** for list | Independent | `WorkspaceSuspendedGuard` fetches after identity; children still render. |
| **Counts in card UI** | **No** for layout | Independent | `WorkspaceCard` uses `counts?.total` / optional chaining — cards can render without counts. |

**Patterns found (gating-style):**

1. **Firestore subscription gated on identity** (listener after identity):

```202:205:app/(app)/dashboard/hooks/useWorkspaceOverview.ts
  useEffect(() => {
    if (!isIdentityResolved || !userId || !workspaceId) {
      return;
    }
```

2. **`loading` tied to count hydration** (not cleared when session docs arrive):

```246:258:app/(app)/dashboard/hooks/useWorkspaceOverview.ts
        void (async () => {
          try {
            await hydrateCountsForSessionIds(
              ids,
              setCountsBySessionId,
              () => sessionsSnapshotGenRef.current === snapshotGen
            );
          } catch (error) {
            // ...
          }
          if (workspaceIdRef.current !== wid || sessionsSnapshotGenRef.current !== snapshotGen) return;
          setIsCountsReady(true);
          setLoading(false);
        })();
```

3. **Dashboard: skeleton while loading and stable list empty:**

```66:67:app/(app)/dashboard/page.tsx
  const showSessionsSkeleton =
    !isIdentityResolved || (sessionsLoading && stableSessions.length === 0);
```

4. **`useStableState` only commits `sessions` when `!sessionsLoading`:**

```64:64:app/(app)/dashboard/page.tsx
  const stableSessions = useStableState(sessions, !sessionsLoading, workspaceId);
```

```21:25:lib/client/perception/useStableState.ts
  if (isReady) {
    stableRef.current = value;
  }

  return isReady ? value : stableRef.current;
```

**Summary:** **🚨 Blocking:** identity before listener; **session list commitment** blocked on **`loading` false** (after counts). **✅ Independent:** billing prefetch, suspended status fetch, per-card optional counts. **⚠️ Coupled:** `loading` / `isCountsReady` / count hydration are one async chain after snapshot.

** nuance — `sessionStorage` cache:** If cached sessions exist and `useStableState` already holds a **non-empty** `stableRef` when `sessionsLoading` flips true, `stableSessions.length === 0` may be false and the skeleton path may **not** trigger even while counts load. **Cold / empty-cache** navigation matches the 5–6s “nothing visible” pattern.

---

## Section 3 — N+1 query detection

### Client: per-session work after snapshot

`hydrateCountsForSessionIds` runs **`sessionIds.map` → per-id `fetchCounts`** wrapped in `Promise.all` (parallel N, not serial loop — but **N distinct HTTP requests** per dashboard snapshot if store/cache misses).

```81:112:app/(app)/dashboard/hooks/useWorkspaceOverview.ts
async function hydrateCountsForSessionIds(
  sessionIds: string[],
  setCountsBySessionId: Dispatch<SetStateAction<Record<string, SessionFeedbackCounts>>>,
  shouldApply?: () => boolean
): Promise<void> {
  await Promise.all(
    sessionIds.map(async (sessionId) => {
      if (!sessionId) return;
      // ...
      const cached = getCounts(sessionId);
      if (cached) {
        // ...
        return;
      }
      try {
        const normalizedCounts = await fetchCounts(sessionId);
        // ...
      } catch {
        // ...
      }
    })
  );
}
```

`fetchCounts` = one GET per session id:

```21:27:lib/state/fetchCountsDedup.ts
export async function fetchCounts(sessionId: string): Promise<SessionFeedbackCounts> {
  return dedupedRequest(`counts-${sessionId}`, async () => {
    try {
      const res = await authFetch(
        `/api/feedback/counts?sessionId=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" }
      );
```

### Counts per session (cold)

| Resource | Count / load |
|----------|----------------|
| Firestore listener queries (`sessions`) | **1** subscription; **1** logical read set per snapshot emission |
| HTTP `/api/feedback/counts` | **Up to N** where `N = min(30, number of sessions in snapshot)` (`SESSION_LIST_LIMIT = 30`) |
| In-flight dedup | Per `sessionId` only (duplicate ids in one wave dedupe; **distinct sessions do not dedupe across each other**) |

### Server work per `/api/feedback/counts` (evidence, not measured)

Route always loads session doc; authenticated path loads user workspace from Admin SDK; may scan `feedback` if counters inconsistent:

```28:98:app/api/feedback/counts/route.ts
    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    // ...
    sessionSnap = await sessionRef.get();
    // ...
    user = await requireAuth(req);
    // ...
    wid = await getUserWorkspaceIdRepo(user.uid);
    // ...
    const counts = await resolveSessionFeedbackCounts(
      sessionId,
      sessionWorkspaceId,
      session as Record<string, unknown>
    );
```

```23:30:lib/server/resolveSessionFeedbackCounts.ts
  if (isConsistent) {
    const data: ResolvedSessionFeedbackCounts = {
      total,
      open,
      resolved,
    };
    return data;
  }
  // else: collection query feedback where sessionId + workspaceId
```

**Total “queries” for one cold dashboard load (order of magnitude):**  
**1** client `onSnapshot` + **up to 30** count HTTP requests **each** implying **≥2** Admin Firestore reads (session + user) and **0 or 1** feedback collection query **per session** if repair path runs.

---

## Section 4 — Firestore analysis (sessions list)

### Query structure

- Collection: `sessions`
- Filter: `workspaceId == wid`
- Order: `updatedAt` desc
- Limit: 30

### Indexing

Composite index is defined for this shape:

```95:101:firestore.indexes.json
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
```

**Verdict:** Query is **appropriately indexed** in repo config — **no evidence of client-side filtering** replacing server filters for this list (mapping normalizes fields only).

### Fetch size

Snapshot returns **up to 30 session documents** with full document payloads (whatever fields exist on each session doc). **No `select()`** narrowing in the client query — **potential over-fetch** of fields not needed for list rows cannot be ruled out without schema review; not proven as primary 5–6s cause.

---

## Section 5 — Listener timing

### When `onSnapshot` attaches

**⚠️ After identity** — the effect explicitly requires `isIdentityResolved`:

```202:205:app/(app)/dashboard/hooks/useWorkspaceOverview.ts
  useEffect(() => {
    if (!isIdentityResolved || !userId || !workspaceId) {
      return;
    }
```

`isIdentityResolved` is `authReady && claimsReady && workspaceId`:

```184:190:lib/client/workspaceContext.tsx
  const isIdentityResolved = useMemo(
    () =>
      authReady &&
      claimsReady &&
      Boolean(workspaceId && workspaceId.trim()),
    [authReady, claimsReady, workspaceId]
  );
```

`claimsReady` becomes true only after **`POST /api/users`** and **`user.getIdToken(true)`** and workspace resolution in the same flow:

```114:157:lib/client/workspaceContext.tsx
      void (async () => {
        try {
          // ...
          const res = await authFetch("/api/users", { method: "POST" });
          // ...
          await user.getIdToken(true);
          // ...
          const resolved = await getUserWorkspaceIdRepo(uid);
          // ...
          setWorkspaceId(normalized);
          setWorkspaceError(null);
          setClaimsReady(true);
```

**Classification:** Listener attaches **after identity** (⚠️ / **sequencing**), not “immediately on mount.”

---

## Section 6 — Post-processing cost

### Client

- **Session list:** `snap.docs.map` to `Session[]`; merge with optimistic rows; optional **`sessionStorage` JSON** read/write — **O(n)** with small **n ≤ 30** — negligible vs network.
- **Dashboard:** `filterAndSortSessions` — filter + sort by `updatedAt` — **O(n log n)**, **n** small.

### Server (counts)

- **Heavy path:** If session counter fields are **inconsistent**, `/api/feedback/counts` loads **all feedback docs** for that session/workspace (`collection("feedback").where(...).get()`), then may **write** session doc repair — **can be expensive per session** when triggered.

**Conclusion:** **Derived data (counts)** drives **extra round-trips** and **possible large scans**; list sort/map is **not** the bottleneck relative to identity + snapshot + N API calls.

---

## Section 7 — Network waterfall (static analysis)

DevTools was **not** run in this audit; the following is **inferred** from call chains.

| Stage | Request / action | Relative to prior | Classification |
|-------|------------------|-------------------|----------------|
| 1 | `POST /api/users` (identity sync) | Must complete before `claimsReady` | 🚨 **Blocking chain** (listener) |
| 2 | Client `getUserWorkspaceIdRepo` (Firestore user doc) | After token refresh path | 🚨 **Blocking chain** |
| 3 | Firestore `onSnapshot(sessions)` | After step 1–2 | 🚨 **Blocking chain** |
| 4 | Up to **30×** `GET /api/feedback/counts?sessionId=…` | After snapshot callback starts async hydration | ⚠️ **Parallel fan-out**; `Promise.all` = **tail latency = slowest request** |
| 5 | `GET /api/workspace/status` | After identity, parallel to dashboard data | ✅ **Parallel** (does not gate list in code) |
| 6 | Billing usage (idle-scheduled) | After identity | ✅ **Parallel** / deferred |

**Redundancy:** Each counts request re-validates auth and re-reads **`users/{uid}`** on the server (`getUserWorkspaceIdRepo`), independent per HTTP request — **⚠️ redundant cross-request work** under concurrent count fetches.

---

## Section 8 — Root cause summary

1. **Why 5–6 seconds (most likely)?**  
   Cumulative **sequential gating**: identity sync **then** Firestore **then** **up to 30** count API round-trips. **`loading`** stays **true** until **all** hydrations finish, and **`useStableState`** withholds committing `sessions` while **`sessionsLoading`** is true — so the user **waits for the slowest count request** (and identity + first snapshot) before the list appears on a **cold** path.

2. **Biggest bottleneck?**  
   **Per-session count hydration** (`hydrateCountsForSessionIds` + `/api/feedback/counts`) coupled with **`loading` / `useStableState`**, so list visibility tracks **counts batch completion**, not session snapshot arrival. **Tail latency** on one slow count dominates `Promise.all`.

3. **Category:**  
   **Combination:** **API + client sequencing** (not raw Firestore list query alone). Firestore **sessions** query is indexed; delay is strongly tied to **N API calls** and **gates** after snapshot.

---

## Section 9 — Impact ranking

1. **Largest:** **Blocking dependency** — **`setLoading(false)` after full count hydration** + **`useStableState(..., !sessionsLoading)`** + skeleton condition → visible list waits on **entire** counts batch.  
2. **Second:** **N× `/api/feedback/counts`** — high parallelism with **per-request auth + Firestore**; **slowest** dominates; **repair path** can add heavy reads.  
3. **Third:** **Listener attaches only after identity** — Firestore snapshot cannot start until `POST /api/users` + token + workspace resolution complete.

---

## Section 10 — Verdict

**Combination**

- **Blocking dependency issue** (session list commitment vs counts completion).  
- **N+1-style fan-out** to `/api/feedback/counts` (parallel HTTP, not a single batched API).  
- **Listener timing / sequencing** (snapshot after full identity pipeline).

---

## Evidence checklist (no guessing on ms timings)

| Claim | Source |
|-------|--------|
| `onSnapshot` for sessions | `useWorkspaceOverview.ts` |
| Listener after `isIdentityResolved` | Same file, `useEffect` guard |
| Count hydration uses `Promise.all` + per-session `fetchCounts` | `hydrateCountsForSessionIds`, `fetchCountsDedup.ts` |
| `loading` cleared after hydration | `onSnapshot` async IIFE |
| Dashboard ties stable list to `!sessionsLoading` | `page.tsx` + `useStableState.ts` |
| `/api/feedback/counts` server steps | `route.ts`, `resolveSessionFeedbackCounts.ts` |
| Composite index for sessions list | `firestore.indexes.json` |

**Not verified in this audit:** Actual DevTools waterfall captures, production Firebase latency, or per-environment count of inconsistent sessions triggering feedback scans.
