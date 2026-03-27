# Echly Final System Architecture Audit (Phase 1 -> Phase 3)

Date: 2026-03-27  
Scope: Full repository audit for write authority, rules, workspace isolation, share security, counters, realtime safety, and production readiness.  
Method: Static code audit only (no code modifications), adversarial security posture, no trust assumptions.

---

## Executive Verdict

- **Is this system secure?** **Partially.** Core server-authoritative write migration is mostly in place, but there are **critical authorization/isolation gaps**.
- **Is this system consistent?** **Partially.** Core counter architecture is server-updated, but there are consistency and scope defects that can cause drift or cross-workspace confusion.
- **Is this system production-ready?** **No** until critical issues are fixed.

### Critical Findings

1. **`/api/sessions/[id]/view` lacks ownership/membership authorization** and can increment `viewCount` for arbitrary known session IDs. **(Critical)**
2. **`/api/insights` is hard-coded to `workspaceId = user.uid`**, breaking workspace isolation and correctness for shared workspaces. **(Critical)**
3. **`/api/feedback/counts` for authenticated users enforces `session.userId === user.uid` only**, blocking legitimate workspace/invite access and creating cross-endpoint authorization inconsistency. **(Medium-High)**

---

## Section 1 - Write Authority Verification

### Searched primitives

- `addDoc(`
- `setDoc(`
- `updateDoc(`
- `deleteDoc(`
- `runTransaction(`
- `writeBatch(`
- `increment(`
- `arrayUnion(`
- `arrayRemove(`

### Findings

- No matches found in:
  - `components/*`
  - `hooks/*`
  - `lib/client/*` (directory not present)
  - `extension/*`
- Source matches are concentrated in:
  - `*.server.ts` repository files
  - `app/api/*` routes (admin transaction usage)
  - `scripts/*` (maintenance/backfill utilities)

### Violations

- **No UI/client write primitive violations found** for the targeted patterns.
- **Operational note:** scripts using client SDK writes exist (expected for scripts), e.g. backfill/cleanup scripts.

### Severity

- `components/hooks/extension/UI`: **No violations**
- `scripts/*` usage: **🟡 minor** operational risk only (if misused in production)

---

## Section 2 - API Write Coverage

| Operation | API Exists | Server Repo | Safe? |
|---|---|---|---|
| Feedback create | Yes (`POST /api/feedback`) | `feedbackRepository.server.ts` | Yes (workspace/session validated) |
| Feedback update | Yes (`PATCH /api/tickets/[id]`) | `feedbackRepository.server.ts` | Mostly (permission-gated) |
| Feedback delete | Yes (`DELETE /api/tickets/[id]`) | `feedbackRepository.server.ts` | Mostly (permission-gated) |
| Comments create | Yes (`POST /api/comments`) | `commentsRepository.server.ts` | Mostly (permission-gated) |
| Comments update | Yes (`PATCH /api/comments`) | `commentsRepository.server.ts` | Mostly (permission-gated) |
| Comments delete | Yes (`DELETE /api/comments`) | `commentsRepository.server.ts` | Mostly (permission-gated) |
| Sessions create | Yes (`POST /api/sessions`) | `sessionsRepository.server.ts` | Yes (server derived workspace) |
| Sessions update | Yes (`PATCH /api/sessions/[id]`) | `sessionsRepository.server.ts` | Yes (owner-only check) |
| Sessions delete | Yes (`DELETE /api/sessions/[id]`) | `sessionsRepository.server.ts` | Yes (owner-only check) |
| User provisioning | Yes (`POST /api/users`) | `usersRepository.server.ts` | Yes (transactional idempotent link) |
| User update | Yes (`PATCH /api/users`) | `usersRepository.server.ts` | Yes (server-resolved workspace) |
| Workspace create | Yes (`POST /api/workspaces`) | inline tx + `workspacesRepository.server.ts` | Mostly (idempotent intent) |
| Workspace update | Yes (`PATCH /api/workspaces`) | `workspacesRepository.server.ts` | Yes (workspace derived server-side) |
| Session views | Yes (`POST /api/sessions/[id]/view`) | `sessionsRepository.server.ts` | **No - auth gap** |
| Insights updates | Indirect (ticket/comment mutations) | `insightsRepository.server.ts` | **No - read path scope bug** |

### Client fallback check

- Client repository modules (`lib/repositories/*.ts` non-server) now call APIs or perform reads/realtime subscriptions only.
- No direct client fallback writes found in app code for core entities.

---

## Section 3 - Firestore Rules Validation

### A. No public access

- Found: `allow read: if true` in `plans` collection.
- This is acceptable **only if intentional** (public plan catalog).
- No other broad public read found.

### B. Workspace isolation

- Rules enforce membership checks via workspace document membership arrays for workspace-scoped docs.
- Legacy fallback read path exists for docs without `workspaceId` using `userId == request.auth.uid`.
- Isolation model is strong at rule layer for read access.

### C. Writes blocked

- Collection rules consistently use `allow create, update, delete: if false`.
- Global catch-all `allow read, write: if false` exists.

### D. Sensitive collections

- `adminLogs`: fully blocked (`allow read, write: if false`) ✅
- `share_links`: fully blocked (`allow read, write: if false`) ✅

### E. Plans

- `plans` publicly readable (`allow read: if true`) - consistent with intended catalog exposure.

### Rule gaps / bypass potential

- **No direct rule-level write bypass identified.**
- Main residual risk is **application-layer authorization inconsistencies**, not rules syntax.

---

## Section 4 - Storage Rules Validation

- `storage.rules` is global deny:
  - `allow read, write: if false` on all paths.
- No client upload path directly to Firebase Storage found.
- Uploads occur via server routes using Admin SDK:
  - `POST /api/upload-screenshot`
  - `POST /api/upload-attachment`

### Exposure risk

- Rules posture is strong.  
- Risk is route-level auth/business logic only (not storage rules leakage).

---

## Section 5 - Workspace Isolation (Critical)

### Traced endpoints

- `/api/workspaces`
- `/api/users`
- `/api/comments`
- `/api/feedback`
- `/api/sessions`

### Verification

1. **workspaceId trust from client**
   - `/api/workspaces PATCH`: ignores client workspace target, uses `resolveWorkspaceForUserLight(user.uid)` ✅
   - `/api/users PATCH`: server resolves workspace ID ✅
   - `/api/feedback` and `/api/comments`: derive from session/server data, not client body workspaceId ✅

2. **Authoritative derivation**
   - Widely uses `resolveWorkspaceForUserLight` or session-derived workspace.
   - However, not all routes apply consistent actor permission enforcement.

3. **Mismatch rejection simulation**
   - If User A sends `workspaceId` for User B on protected routes above, server generally ignores/rejects.
   - **Exception class:** routes that do not assert ownership/permission before action.

### Bypass possibilities

- **🔴 Critical:** `POST /api/sessions/[id]/view` does not verify owner/workspace membership/share permission before mutating `sessionViews` + `sessions.viewCount`.
- **🔴 Critical:** `GET /api/insights` uses `workspaceId = user.uid`; in shared workspace model this causes wrong workspace data scope and can isolate user from actual workspace metrics.

---

## Section 6 - Provisioning Safety

### Traced paths

- `useAuthGuard`
- onboarding calls to `/api/users` and `/api/workspaces`
- `usersRepository.server.ts` transactional provisioning

### Verification

1. **Idempotency**
   - `ensureUserWorkspaceLinkRepo` transaction checks existing user/workspace and sets only missing links.
   - Repeated calls should not create duplicate workspace IDs under normal single-workspace-per-user model.

2. **Transaction safety**
   - Existing `user.workspaceId` is preserved; only set when missing.
   - Workspace creation conditional on non-existence.

3. **Race condition**
   - Transactional approach is race-resistant for duplicate provisioning.
   - Residual edge risk remains if external/manual docs with conflicting ownership are introduced.

### Duplication risk

- Current implementation: **Low to Medium** (low in normal flow, medium under out-of-band data mutations).

---

## Section 7 - Counter Integrity

### Counters traced

- `commentCount`
- `feedbackCount`
- `openCount`
- `resolvedCount`
- `totalComments`

### Verification

1. **Update locations**
   - Counter writes are in server repositories (`*.server.ts`) via Admin SDK transactions/increments.
   - No client-side counter mutation path found.

2. **Duplicate updates**
   - Counters are updated across multiple coordinated repo methods.
   - There is fallback repair logic (`resolveSessionFeedbackCounts`) that recomputes + writes if mismatch detected.

3. **Drift risk**
   - `deleteCommentRepo` decrements workspace total comments but does not adjust session/feedback comment counters in the same path -> possible denormalized drift.
   - Repair exists for session open/resolved/total via count resolver, but not all comment counters are centrally reconciled.

### Outcome

- **🟡 Medium drift risk** under complex mutation paths and deletions.

---

## Section 8 - Share Page Security

### Traced

- `/api/public/share/[token]`
- `/api/internal/share/resolve`
- `/s/[token]` page
- `shareTokenResolver` + `shareLinksRepository`

### Verification

1. No Firestore client usage on public page reads -> data fetched via API route ✅
2. Data access is token-validated via `resolveShareToken` ✅
3. Public share route sanitizes returned entities (`sanitizePublic*`) ✅
4. Workspace leakage controls:
   - Uses token -> session mapping and session-bound feedback query.
   - No authenticated workspace expansion in public endpoint.

### Exposure risk

- Token model appears strong (random 32-byte token base64url, active + expiry checks).
- **Low** residual risk: no explicit brute-force throttling visible in route code.

---

## Section 9 - Realtime Safety

### Verification

- Realtime listeners (`onSnapshot`) are used in authenticated dashboard/client flows (`feedbackStore`, `workspaceStore`, comments listeners).
- Public share page (`/s/[token]`) uses API-fetched snapshot and `useShareCounts`; it does not depend on realtime completeness.

### Inconsistency risk

- Dashboard realtime is capped/optimized (`REALTIME_LIMIT` windows), so not full-history authoritative by itself.
- System correctly pairs realtime UX with API/counter endpoints; risk is **low-medium** for transient UI mismatch, not data corruption.

---

## Section 10 - System Consistency

### counts === list / pipeline consistency

- Public share list uses `/api/public/share/[token]` full payload; counts use `/api/feedback/counts` with token path.
- Counts endpoint includes auto-repair for inconsistent session denormalized counters.

### Risks identified

- Authorization model is inconsistent across endpoints (owner-only in some routes vs workspace/share-aware in others).
- Insights pipeline is inconsistent with workspace mapping (`user.uid` shortcut), which breaks data source alignment in multi-member workspaces.
- Some denormalized counters can temporarily diverge before repair paths run.

---

## Section 11 - Final Verdict

### 1) Production safety by scale

- **10 users:** **Not safe** until critical auth/isolation issues are fixed.
- **100 users:** **Not safe** (critical issues amplify; support load + data trust issues).
- **1000 users:** **Not safe** (authorization and workspace-scope defects become severe operational/security liabilities).

### 2) Critical risks

- **🔴 Unauthorized session view mutation path** in `POST /api/sessions/[id]/view`.
- **🔴 Workspace isolation/correctness break** in `GET /api/insights` (`workspaceId = user.uid`).

### 3) Medium risks

- **🟡 Counter drift potential** on some comment deletion paths.
- **🟡 Authorization inconsistency** between endpoints for shared/workspace actors.
- **🟡 Public token endpoint lacks evident anti-abuse controls** (rate limiting not visible).

### 4) Low risks

- **🟢 Rules posture** (Firestore + Storage deny-by-default) is generally strong.
- **🟢 Server-authoritative write architecture** largely enforced in app runtime paths.

### 5) What will break under real usage

- Shared workspace users may see incorrect/missing insights due to wrong workspace resolution.
- Session view metrics can be manipulated by authenticated users with guessed/leaked session IDs.
- Some counts may diverge from expected values during delete-heavy or edge mutation flows.

---

## Overall Conclusion

The migration achieved major architectural progress (server-side write authority + restrictive rules), but the system is **not yet production-ready** because there are still **critical authorization and workspace-isolation flaws** at the API layer.  
Fixing those critical gaps is mandatory before real-user rollout.

# Echly Final System Architecture Audit

Date: 2026-03-27  
Scope: Phase 1 -> Phase 3 migration post-audit  
Method: static code/rules audit only (no code changes, no fixes)

---

## Executive Verdict

- **Is this system secure?** **No (not yet).**
- **Is this system consistent?** **Partially.** Core ticket/comment/session flows are mostly server-authoritative, but there are consistency gaps.
- **Is this system production-ready?** **Not yet** due to critical multi-tenant isolation risk.

### Top Risks

1. 🔴 **Critical:** Authenticated user can request arbitrary `workspaceId` during workspace provisioning and may be linked to an existing workspace without membership validation (`/api/workspaces` POST).
2. 🔴 **Critical:** Public share UI performs direct Firestore client reads (`feedback` collection) in realtime hook, violating strict "public reads via API only" requirement.
3. 🟡 **Medium:** `/api/insights` reads insights using `workspaceId = user.uid`, which can diverge from actual workspace and produce wrong analytics for migrated/workspace-based users.
4. 🟡 **Medium:** Legacy client repositories still perform direct Firestore reads in UI paths; security relies on rules, but architecture target says server-authoritative.

---

## Section 1 - Write Authority Verification

Searched whole repo for:
- `addDoc(`, `setDoc(`, `updateDoc(`, `deleteDoc(`, `runTransaction(`, `writeBatch(`, `increment(`, `arrayUnion(`, `arrayRemove(`

### Findings

- `addDoc(`: no matches.
- `setDoc(`: found in `scripts/backfillInsights.ts`.
- `updateDoc(`: found in scripts:
  - `scripts/backfillFeedbackStatusField.ts`
  - `scripts/sharePublicApiPhase2Smoke.ts`
  - `scripts/backfillWorkspaceStats.ts`
  - `scripts/backfillWorkspaceTotalFeedback.ts`
  - `scripts/backfillWorkspaceCounts.ts`
  - `scripts/hardDeleteInvalidFeedback.ts`
- `deleteDoc(`: found in `scripts/hardDeleteInvalidFeedback.ts`.
- `runTransaction(`: found in server repos/API and one script (`scripts/deleteSkippedFeedback.ts`).
- `writeBatch(`, `arrayUnion(`, `arrayRemove(`: no matches.
- `increment(`: server repos + one script (`scripts/deleteSkippedFeedback.ts`).

### Violation Check (requested paths)

- No direct matches for these write APIs in:
  - `components/*` (for listed write calls)
  - `hooks/*` (for listed write calls)
  - `lib/client/*` (no dir present; no evidence of listed write calls)
  - `extension/*` (repo has `echly-extension`; no listed write calls found there)

### Severity

- 🟡 **Minor:** Direct Firestore client write calls still exist in `scripts/*` (acceptable for admin/maintenance scripts if controlled; operational risk if misused).
- ✅ No evidence of those specific client write calls in UI component/hook paths.

---

## Section 2 - API Write Coverage

| Operation | API Exists | Server Repo | Safe? |
|---|---|---|---|
| feedback create | Yes (`POST /api/feedback`) | Yes (`addFeedbackWithSessionCountersRepo`) | Mostly yes |
| feedback update | Yes (`PATCH /api/tickets/[id]`) | Yes (`updateFeedbackRepo`, `updateFeedbackResolveAndSessionCountersRepo`) | Mostly yes |
| feedback delete | Yes (`DELETE /api/tickets/[id]`) | Yes (`deleteFeedbackWithSessionCountersRepo`) | Mostly yes |
| comments create | Yes (`POST /api/comments`) | Yes (`addCommentRepo`) | Mostly yes |
| comments update | Yes (`PATCH /api/comments`) | Yes (`updateCommentRepo`) | Mostly yes |
| comments delete | Yes (`DELETE /api/comments`) | Yes (`deleteCommentRepo`) | Mostly yes |
| sessions create | Yes (`POST /api/sessions`) | Yes (`createSessionRepo`) | Mostly yes |
| sessions update | Yes (`PATCH /api/sessions/[id]`) | Yes (`updateSessionTitleRepo`, `updateSessionArchivedRepo`, `updateSessionAccessLevelRepo`) | Mostly yes |
| sessions delete | Yes (`DELETE /api/sessions/[id]`) | Yes (`deleteSessionRepo`) | Mostly yes |
| user provisioning/update | Yes (`POST/PATCH /api/users`) | Yes (`ensureUserWorkspaceLinkRepo`, `updateUserFieldsRepo`) | Mostly yes |
| workspace create/update | Yes (`POST/PATCH /api/workspaces`) | Yes (`adminDb.runTransaction`, `updateWorkspaceSettings`) | **No (create path critical issue)** |
| session views | Yes (`POST /api/sessions/[id]/view`) | Yes (`recordSessionViewIfNewRepo`) | Mostly yes |
| insights updates | No dedicated API write route (server-repo writes during events) | Yes (`insightsRepository.server.ts`, feedback/comment repos) | Partially (read path mismatch issue) |

No evidence of client fallback write paths for these operations; writes go through APIs/server repos.

---

## Section 3 - Firestore Rules Validation

File audited: `firestore.rules`

### A. No public access
- `allow read: if true` exists only for `plans`.
- ✅ No global public read/write.
- ✅ Catch-all deny exists.

### B. Workspace isolation
- Workspace-scoped docs require membership + `workspaceIdForUser() == workspaceId`.
- Legacy fallback allows user-owned docs (`userId == request.auth.uid`) when `workspaceId == null`.
- ✅ Isolation intent present and strict for scoped docs.

### C. Writes blocked
- All listed collections: create/update/delete are false.
- ✅ Client writes blocked.

### D. Sensitive collections
- `adminLogs`: blocked.
- `share_links`: blocked.
- ✅ Correct.

### E. Plans
- `plans` readable publicly.
- ✅ Allowed if intended.

### Potential Rule Gaps / Bypass Notes
- No direct bypass found in rules logic.
- Rules are strict enough that client Firestore writes are denied and cross-workspace reads are constrained by membership checks.

---

## Section 4 - Storage Rules Validation

File audited: `storage.rules`

- `allow read, write: if false` on all paths.
- ✅ No direct client Storage access.

Upload path check:
- Uploads performed via authenticated API routes using Admin SDK:
  - `POST /api/upload-screenshot`
  - `POST /api/upload-attachment`
- ✅ No direct client upload path found.

Residual risk:
- Signed URLs are issued by API and are time-bounded; this is expected.

---

## Section 5 - Workspace Isolation (Critical)

Traced:
- `/api/workspaces`
- `/api/users`
- `/api/comments`
- `/api/feedback`
- `/api/sessions`

### Verification

1. **workspaceId trust from client**
   - `/api/users` PATCH rejects mismatched client `workspaceId` against resolved workspace.
   - `/api/comments` POST compares client `workspaceId` to derived value from session/user.
   - `/api/feedback` create does not trust client workspaceId; derives from session/user.
   - `/api/sessions` create derives workspace server-side.
   - ⚠️ `/api/workspaces` POST accepts `requestedWorkspaceId` and may use it when user has no workspace.

2. **Derivation**
   - Frequent use of `resolveWorkspaceForUserLight` or session-derived workspace IDs.
   - Good pattern in most routes.

3. **Mismatch rejection**
   - Present in multiple routes (`FORBIDDEN` checks).
   - **Exception:** workspace provisioning flow allows first-write workspace binding from client-supplied id.

### Logical Attack Simulation

User A sends:
`{ workspaceId: "workspace_of_user_B" }` to `POST /api/workspaces`

Observed logic:
- If A has no existing `user.workspaceId`, transaction sets `effectiveWorkspaceId = requestedWorkspaceId`.
- If target workspace already exists, no ownership/membership check blocks linking user A to that workspace.

### Result

- 🔴 **Critical bypass possibility:** Cross-tenant workspace linking during initial provisioning.
- Impact: workspace isolation can be broken at account setup time.

---

## Section 6 - Provisioning Safety

Traced:
- `useAuthGuard`
- onboarding (`app/onboarding/page.tsx`)
- `POST /api/users`
- `POST /api/workspaces`

### Idempotency
- `POST /api/users` uses transaction (`ensureUserWorkspaceLinkRepo`) and is idempotent.
- Repeat calls do not create duplicate user/workspace when already linked.
- ✅ Good.

### Transaction safety
- Existing `user.workspaceId` is preserved in both user-link and workspace-create transaction paths.
- ✅ Good for overwrite prevention.

### Race condition
- Transaction-based operations reduce duplicate creation risk significantly.
- ✅ Good for concurrency.

### Duplication / misuse risk
- 🔴 **Critical:** `POST /api/workspaces` first-time caller can choose arbitrary existing workspace id (not just duplication risk; isolation breach).

---

## Section 7 - Counter Integrity

Counters traced:
- `commentCount`
- `feedbackCount`
- `openCount`
- `resolvedCount`
- `totalComments`

### Findings

- Counter writes are in server repos (`*.server.ts`) for core mutation flows.
- No client-side counter writes found.
- Session/feedback counters updated in transactions for create/resolve/delete flows.
- `resolveSessionFeedbackCounts` includes fallback repair when inconsistency detected.

### Drift Risks

- 🟡 **Medium:** Mixed counter strategies (`FieldValue.increment` in some paths, recompute/set in others) can still drift under edge/manual/script mutations.
- 🟡 **Medium:** Session delete path hard-deletes related docs with limits (`500`), may miss >500 in one pass and skew aggregate stats in large datasets.
- ✅ Core runtime paths are mostly transactional and defensive.

---

## Section 8 - Share Page Security

Traced:
- share APIs (`/api/public/share/[token]`, `/api/sessions/[id]/share-link`, `/api/internal/share/resolve`)
- public page fetch (`app/s/[token]/page.tsx`)
- token resolver (`resolveShareToken`)

### Verification

1. No Firestore client usage for public reads
   - ❌ Violated: `components/share/usePublicSessionRealtime.ts` directly queries `feedback` via client Firestore.

2. All data via API
   - Initial payload uses API route correctly.
   - Realtime enhancement bypasses API directly.

3. Token-based access enforced
   - API share fetch enforces token validity/active/expiry.
   - ✅ yes.

4. Workspace leak
   - API response sanitizes session/feedback and omits workspace/user identifiers.
   - ✅ API payload is sanitized.

### Exposure Risk

- 🔴 **Critical (architectural/security-policy):** Public path still depends on direct Firestore client read attempt.
- Practical data leak is partially mitigated by strict rules (unauthenticated reads denied), but architecture requirement is not met.

---

## Section 9 - Realtime Safety

- Dashboard realtime is authenticated and rule-guarded.
- Public share realtime exists as "enhancement only"; code comments state server payload remains source of truth.
- ✅ Not required for completeness in public share rendering.
- 🟡 Still risky from architecture perspective because public path attempts direct Firestore access.

---

## Section 10 - System Consistency

### Counts vs List
- Counts endpoint (`/api/feedback/counts`) has fallback reconciliation against actual feedback docs.
- List endpoints use server repos and cursor logic.
- ✅ Generally aligned with repair fallback.

### Partial dataset / pipeline mismatch risks
- 🟡 **Medium:** `/api/insights` uses `workspaceId = user.uid` instead of resolved workspace; may read wrong doc after migration.
- 🟡 **Medium:** Coexistence of legacy client Firestore read repos and new server-authoritative APIs can produce divergent behavior between screens.

---

## Section 11 - Final Verdict

### Production safety by scale

- **10 users:** **No-go** (critical isolation flaw still unacceptable).
- **100 users:** **No-go** (same critical risk; plus consistency issues become visible).
- **1000 users:** **No-go** (critical isolation + counter/insights drift risks amplify).

### Risk Summary

- **CRITICAL**
  - Cross-workspace provisioning link risk in `POST /api/workspaces`.
  - Public-share UI direct Firestore realtime reads (policy/security model violation).

- **MEDIUM**
  - Insights workspace resolution mismatch (`/api/insights`).
  - Counter drift risk in large/delete-heavy edge paths.
  - Legacy client Firestore read surfaces remain; architecture is not fully server-authoritative.

- **LOW**
  - Script-level direct Firestore write utilities (operational hygiene risk if run unsafely).

### What would likely break under real usage

- Tenant isolation assumptions can fail at onboarding/provisioning boundaries.
- Analytics/insights can show wrong or stale values for workspace-migrated users.
- Public share realtime can fail noisily (permission errors) and creates unnecessary complexity.
- Large cleanup/delete operations can leave aggregate counters inconsistent without explicit backfill.

---

## Bottom Line

- **Secure?** Not yet (critical issues present).
- **Consistent?** Partially, with notable drift/mismatch risks.
- **Production-ready?** Not yet. Resolve critical findings before live users.
