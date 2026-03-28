# Phase 6.7 readiness — final system summary

Read-only audit consolidation. **No code was modified** to produce this report; deliverables live under `audit/` only.

## Verification checklist

- [x] Application/source files unchanged (audit-only writes).
- [x] New/updated audit artifacts: `entry_points_map.md`, `data_flow_map.md`, `listener_topology.md`, `counts_system.md`, `query_analysis.md`, `firestore_usage.md`, `payload_analysis.md`, `render_performance.md`, `source_of_truth.md`, `loading_gates.md`, `final_phase_6_7_readiness.md`.
- [x] Cross-references align with current code paths (March 2026 snapshot).

---

## Critical issues (red)

### Fan-out architecture

- **Dashboard**: After each Firestore sessions snapshot, up to **30 parallel** `GET /api/feedback/counts` requests (`hydrateCountsForSessionIds` + `Promise.all`).
- **Session board**: Firestore listener returns **all feedback documents** for the session (no limit); cost scales linearly with ticket count. Paired with **repeated counts API** refresh on **every** feedback snapshot.
- **DiscussionFeed (orphan)**: If ever enabled, **100 feedback docs** + chunked **`getDoc` per distinct session** — severe read amplification (currently unused).

### N+1-style patterns

- **Dashboard session cards**: One counts request **per session id** in the list (bounded by 30 but still N+1 relative to list).
- **Session overview**: `getFeedbackByIds` uses **up to 10 parallel `getDoc`** — bounded N+1.
- **Insights**: Up to **10 `getDoc(session)`** for titles — bounded N+1.

### Listener duplication / pairing

- **No duplicate Firestore listener** for `sessions` (single provider) or `workspaces/{id}` (singleton + retain count).
- **Risk**: `DiscussionPanel` + `DiscussionThread` **both** subscribe via `useCommentsRepoSubscription` — **not** both mounted on `/discussion` today; future UI changes could duplicate comment listeners for the same ticket.
- **Real pairing cost**: Feedback `onSnapshot` + **HTTP counts** on each update — logical duplication of “how many tickets” truth.

---

## Medium issues (yellow)

### Payload inefficiencies

- Session board maps **full** `feedback` documents into the list for **every** ticket — large text fields and screenshot URLs included even for non-selected rows.
- Workspace realtime listener ingests the **full** workspace document for usage/plan subset.
- Dashboard sessions query returns **full** session documents without field projection.

### Render / CPU inefficiencies

- **Per-snapshot** dedupe + **sort** of entire feedback array in `useSessionFeedbackPaginated` — O(n log n) per realtime tick for large n.
- Large ticket lists → large React reconciliation for `TicketList` (mitigated somewhat by stable state patterns).

### Cache / churn

- `useBillingUsage` refetches billing on **each** workspace document change after first snapshot (idle-batched) — correct for freshness, noisy if workspace doc is chatty.

### Dead / alternate code paths

- **`DiscussionFeed.tsx`**, **`DiscussionPanel.tsx`**, **`TicketDetailsPanel.tsx`**: Not imported by active routes surveyed — maintenance hazard if re-enabled without architecture review.

---

## Safe areas (green)

- **Single Firestore `onSnapshot` for dashboard sessions** shared via `WorkspaceOverviewProvider`; `GlobalSearch` reuses the same data — **no extra sessions subscription**.
- **Workspace Firestore listener** correctly multiplexed with **retain count** (`workspaceStore.ts`) — avoids duplicate `workspaces/{id}` listeners across `UsageMeter` / `UpgradeModal` / billing.
- **Insights primary metrics**: **One** insights document subscription drives charts; avoids legacy multi-query insights client paths (as described in code comments / `computeInsights`).
- **Public share**: **Server-only** data load; predictable single API round-trip; no accidental client Firestore exposure.
- **Comments**: **One** listener per `(workspace, session, feedback)` while a single hook instance is mounted; explicit unsubscribe on change.
- **Dashboard list filters**: **Memoized**; session cap **30** bounds work.

---

## Suggested Phase 6.7 focus order (planning only)

1. **Quantify** session-board listener document count and snapshot frequency in production-like data.
2. **Unify or throttle** counts refresh (debounce batch endpoint, or derive from session doc fields client-side when consistent).
3. **Reduce dashboard counts fan-out** (batch API, or rely on denormalized session fields + single validation).
4. **Payload projection** strategy for feedback list vs detail.
5. **Normalize imports** (`firebase.ts` vs `firebaseClient.ts` re-export) for consistency only — same `db` instance.
6. **Remove or wire** orphan discussion components to prevent accidental double data paths.

---

## Reference map

| Topic | File |
|-------|------|
| Routes & components | `audit/entry_points_map.md` |
| End-to-end flows | `audit/data_flow_map.md` |
| Realtime topology | `audit/listener_topology.md` |
| Counts & aggregation | `audit/counts_system.md` |
| Query counts & N+1 | `audit/query_analysis.md` |
| Firestore API usage | `audit/firestore_usage.md` |
| Document weight | `audit/payload_analysis.md` |
| React render cost | `audit/render_performance.md` |
| Source of truth | `audit/source_of_truth.md` |
| Loading & gates | `audit/loading_gates.md` |
