# Echly — System Production Readiness Report

**Generated:** 2025-03-27  
**Scope:** Full codebase review (Firebase hybrid usage, API vs client, cache removal, security alignment, light performance notes).  
**Method:** Static analysis only — no code changes.

---

## 1. Executive Summary

**Overall status:** ⚠️ **Needs fix** (relative to the **strict** checklist: “no client writes” + “server-only Firestore/Storage SDKs in `app/api/**` and `lib/server/**`”), and **⚠️ safe with minor fixes / caveats** for **early production (0–1K users)** if **deployed Firebase rules match the committed `firestore.rules`** and the team accepts that **many product writes still use the client Firestore SDK** by design.

**Short reasoning:**

- **Phases 3–4 (screenshot + feedback create)** are implemented in line with **Admin Storage** and **server repositories** (`*.server.ts`) for the main API paths.
- **`app/api/**` and `lib/server/**` do not directly import** `firebase/firestore` or `firebase/storage` (client SDK), which satisfies a **narrow** reading of Phase 5A.
- **However**, several **API routes transitively import** modules that **do** use the **client** Firestore SDK (`lib/billing/getPlanCatalog.ts`, `lib/admin/adminLogs.ts`, `lib/admin/migrateWorkspaceEntitlementsToOverrides.ts`). That is a **mixed-SDK-on-server** pattern and **fails** the **stricter** Phase 5A goal.
- The **audit’s “expected” rules** (`read` if auth; `write` if false) **do not match** the **committed** `firestore.rules`, which **allow** authenticated, membership-scoped **client writes** on core collections. `audit/production_rules.md` describes a **stricter, server-authoritative target** that is **not** what `firestore.rules` implements today.
- **Cache removal** is largely successful (no `cachedFetch`, no `lib/server/cache/*`, no React `cache()` in source), but **a short-TTL in-memory map** remains on **`GET /api/insights`**, and **client-side TTL maps** exist in `usersRepository` (workspace id cache).

---

## 2. Phase Validation

### Phase 3 — Storage + Upload (Admin SDK)

**✅ Pass** (for the flows described in scope)

| Check | Evidence |
|--------|----------|
| Screenshot uploads go through API | `POST /api/upload-screenshot` in `app/api/upload-screenshot/route.ts`; extension uses `.../api/upload-screenshot` (`echly-extension/src/background.ts`); web uses `lib/screenshot.ts` → `authFetch("/api/upload-screenshot", ...)`. |
| API uses Firebase **Admin** Storage | `import { getStorage } from "firebase-admin/storage"`; `bucket.file(...).save(...)`; `file.getSignedUrl({ action: "read", ... })`. |
| No `getDownloadURL` in server app code | **No** `getDownloadURL` from `firebase/storage` in `app/` or `lib/` (only Admin `getSignedUrl` / `upload-screenshot` / `upload-attachment` / `feedback/post`). |
| Signed URLs | `getSignedUrl` used for read URLs after upload and in feedback screenshot resolution. |
| Client does not use Firebase Storage SDK for uploads | `lib/firebase.ts` exports `storage = getStorage(app)` but **no other source files import `storage`**; uploads go through **HTTP** to API routes. |

**Note:** `firebase.json` does not declare Storage rules; Storage behavior depends on **Firebase Console** configuration (not in repo).

---

### Phase 4 — Feedback Creation Fix

**✅ Pass**

- `app/api/feedback/post.ts` uses **`feedbackRepository.server`**, **`sessionsRepository.server`**, **`usersRepository.server`**, and **`initializeApp` path via** `@/lib/server/firebaseAdmin` + **`getStorage` from `firebase-admin/storage`**.
- Screenshot URL resolution uses **`getScreenshotByIdRepo`** (Firestore via **`adminDb`** in `lib/repositories/screenshotsRepository.ts`) and **`getSignedUrl`** — **not** client Storage.
- No `firebase/storage` (client) in this route.

---

### Phase 5A — Server Migration to Admin SDK

**⚠️ Partial pass** (depends on definition)

| Rule | Result |
|------|--------|
| No `firebase/firestore` or `firebase/storage` in `app/api/**` and `lib/server/**` **directly** | **✅** — Grep: **no** such imports in those trees. |
| All server logic uses Admin SDK only | **⚠️** — **Indirect** server execution still pulls **client** Firestore via shared libs: |

**Transitive client Firestore SDK usage from API routes:**

| Module | Client SDK usage | Called from API (examples) |
|--------|------------------|----------------------------|
| `lib/billing/getPlanCatalog.ts` | `collection`, `getDocs` from `firebase/firestore`, `db` from `@/lib/firebase` | `app/api/plans/catalog/route.ts`, `app/api/billing/usage/route.ts`, `app/api/admin/workspaces/route.ts`, `app/api/admin/update-plan/route.ts` |
| `lib/admin/adminLogs.ts` | `addDoc` to `adminLogs` | `app/api/admin/workspaces/actions/route.ts`, `app/api/admin/plans/route.ts` |
| `lib/admin/migrateWorkspaceEntitlementsToOverrides.ts` | `getDocs`, `updateDoc`, etc. | `app/api/admin/migrate-workspace-entitlements/route.ts` |

**Repositories:** Core CRUD for API routes uses **`*.server.ts`** + `firebase-admin` patterns (`feedbackRepository.server`, `sessionsRepository.server`, etc.). `screenshotsRepository.ts` is **not** named `*.server.ts` but uses **`adminDb`** only.

**Verdict:** Phase 5A is **satisfied for direct imports** but **not** for a **“no client SDK anywhere in server bundles”** bar.

---

## 3. Architecture Validation

### Hybrid model (as implemented)

| Layer | Firestore | Notes |
|--------|-----------|--------|
| **Browser / extension** | **Client SDK** (`firebase/firestore`) | **Reads:** `onSnapshot`, `getDocs`, `getDoc`, etc. (`feedbackStore`, `useWorkspaceOverview`, `DiscussionFeed`, `SessionPageClient`, insights page, …). |
| **Browser / extension** | **Client SDK** | **Writes:** `addDoc`, `setDoc`, `updateDoc`, `deleteDoc` appear in **`lib/repositories/*`** (non-server) and are used via **`lib/comments.ts`**, **`lib/feedback.ts`**, **`lib/sessions.ts`**, **`app/onboarding/page.tsx`**, **`useAuthGuard` → `ensureUserWorkspaceLinkRepo`**, **`app/(app)/settings/page.tsx`**, etc. |

So **the product does not match** the **strict** audit goal “**no client-side writes**”; it matches a **hybrid** model where **many writes still go through the client SDK**, with **rules** enforcing membership (see §4).

### Server vs client responsibility

- **Server:** Session creation, feedback **create** (POST `/api/feedback`), tickets API (`/api/tickets/[id]`), uploads, admin actions, **most** `app/api/**` data access via **`.server` repositories** + **Admin**.
- **Client:** **Comments**, **feedback** updates/deletes (via `lib/feedback.ts` / repos), **session** title/archive/view/delete helpers, **onboarding** workspace creation, **user/workspace** linking — **not** exclusively API-driven.

### Violations vs **strict** checklist

1. **Client writes** — **present** (see grep targets: `addDoc`/`setDoc`/`updateDoc`/`deleteDoc` in `lib/repositories/*.ts` and call sites).
2. **Mixed SDK on server** — **present** via `getPlanCatalog`, `adminLogs`, migration helper (§2 Phase 5A).

---

## 4. Security Assessment

### Firestore — “expected” vs **committed** `firestore.rules`

| Document | Model |
|----------|--------|
| **This audit’s stated expectation** | `read` if authenticated; `write` **false** for clients. |
| **`firestore.rules` in repo** | **Authenticated reads** on scoped paths; **writes allowed** for `users` (own doc), `workspaces` (members), `sessions`, `feedback`, `comments` (with membership / legacy rules), `sessionViews`, `session_shares`, etc. **Default deny** for `/{document=**}`. |

**Conclusion:** Architecture **does not** align with the **“write: false”** expectation; it **does** align with **membership-based client writes** in **`firestore.rules`**.

**Risk:** If someone deploys rules from **`audit/production_rules.md`** (client writes denied) **without** migrating app code, **core product flows** that still use client writes would **break**.

### Collections without explicit rules in `firestore.rules`

- **`plans`** and **`adminLogs`** are **not** in `firestore.rules`; they fall under **`match /{document=**}` → `allow read, write: if false`**.
- **Implication:** `getPlanCatalog()`’s `getDocs` on `plans` likely **fails**; code **falls back** to `buildDefaultCatalog()` (see `try/catch` in `fetchPlans`).
- **`adminLogs`**: `addDoc` from **unauthenticated** client SDK on the server **should not** succeed under committed rules — **admin audit logging may fail silently or throw** depending on error handling at call sites (worth validating in staging).

### Storage rules expectation

**Expected (audit):** `allow read, write: if false` for clients.

**Code:** Uploads and reads for screenshots are **not** via client Storage SDK; **signed URLs** are returned. **No `storage.rules` file** in repo — **confirm** in Firebase Console that **direct client Storage access** is not required for your UX.

---

## 5. Cache Removal Impact

| Check | Result |
|--------|--------|
| `cachedFetch` | **None** in `.ts`/`.tsx` source. |
| `lib/server/cache/*` | **No** imports found. |
| React `cache(` | **None** in source `.ts`/`.tsx`. |
| `authFetch` uses `cache: "no-store"` | **Yes** (`lib/authFetch.ts`). |
| TTL-based maps | **Still present:** `app/api/insights/route.ts` — `insightsCache` with **5s TTL**; `lib/repositories/usersRepository.ts` — `workspaceIdCache` with TTL. |

**Conclusion:** Broad cache removal **looks successful**; **not** a complete absence of TTL behavior (insights API + client repo cache).

---

## 6. Data Flow Validation

**Intended path (extension / app → API → Admin):**

- `POST /api/upload-screenshot` → Admin Storage + `screenshotsRepository` (Admin Firestore).
- `POST /api/feedback` → `.server` repos + Admin signed URL for screenshot.

**Parallel path (client writes):**

- UI → `lib/comments.ts` / `lib/feedback.ts` / `lib/repositories/*` → **client SDK** → Firestore (allowed by **`firestore.rules`** for scoped data).

**Bypass / mixed paths:**

- **No** evidence of **direct** Storage writes from client.
- **Server API** can still **transitively** load **client** Firestore modules (§2).

---

## 7. Error Handling Check

| Area | Observation |
|------|----------------|
| `authFetch` | Returns **`null`** when `auth.currentUser` is missing — **no throw**; callers must handle `null` (risk of **null dereference** if a caller assumes a `Response`). |
| API auth | **401** / `NOT_AUTHENTICATED` patterns in **feedback** and **extension** routes; **`requireAuth`** used elsewhere. |
| `uploadAttachment.ts` | Throws **`Error("User not authenticated")`** if no user — **explicit** failure path (not a silent crash). |

---

## 8. Performance Risk Check (Light)

- **`lib/api/fetchSessionsList.ts`** uses **`dedupedRequest`** for concurrent `/api/sessions` — **good** deduping.
- **`useSessionFeedbackPaginated`** (and similar hooks) use multiple **`authFetch(..., { cache: "no-store" })`** calls — **possible** duplicate parallel requests under load; **observation only** (no change suggested per scope).

---

## 9. Risk Flags (Real Issues Only)

1. **Spec vs implementation:** **Strict** “no client writes” / **“write: false”** **does not match** the **current app** or **`firestore.rules`**.
2. **Phase 5A gap:** **Client** Firestore SDK used from code paths **invoked by API routes** (`getPlanCatalog`, `adminLogs`, migration).
3. **`plans` / `adminLogs`:** **Default deny** in `firestore.rules` — **plan overrides from Firestore may never apply**; **admin logs may not persist** (unless rules differ in production).
4. **Unused client Storage export:** `storage` in `lib/firebase.ts` is **unused** — low risk but **removes** a footgun if someone later uses client Storage.
5. **Residual TTL cache:** **`GET /api/insights`** 5s in-memory cache — **stale** data for up to ~5s in multi-instance deployments (usually acceptable at 0–1K scale; **not** a security finding).

---

## 10. Production Readiness Verdict

**Choose one — applied to “ship and get first users” with **current** hybrid model:**

**⚠️ SAFE WITH MINOR FIXES**

**Reasoning:** Core **upload** and **feedback creation** paths are **server-authoritative** with **Admin** and **signed URLs**. **Security posture** depends on **Firestore rules** staying **consistent** with **`firestore.rules`** (membership checks) and **not** accidentally deploying **stricter** rules until the **client-write** surfaces are migrated. **Admin/plan catalog** and **audit logging** should be **validated** against deployed rules (or moved to **Admin SDK**).

---

## 11. Optional Recommendations (Max 5)

1. **Align** `firestore.rules` in repo with **production** (or add **`match /plans`** and **`match /adminLogs`** if those collections must be read/written by the intended actor).
2. **Replace** `getPlanCatalog` / `adminLogs` / migration **client** Firestore usage on **API routes** with **Admin** Firestore reads/writes when you next touch those areas.
3. **Document** for the team: **hybrid** model (client writes + API) vs **`audit/production_rules.md`** **target** server-only model — **avoid** deploying the wrong rules.
4. **Remove or gate** `storage` export from `lib/firebase.ts` if unused, to avoid accidental client Storage.
5. **Smoke-test** admin actions in staging: confirm **`adminLogs`** writes succeed or fail **loudly** (no silent “success” with missing audit trail).

---

## 12. Appendix — Search Commands Used (Conceptual)

- Imports: `firebase/firestore`, `firebase/storage`, `firebase-admin/*` across `app/api`, `lib/server`, `lib`, `components`.
- Writes: `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`.
- Cache: `cachedFetch`, `lib/server/cache`, `cache(`, `no-store`.
- Upload: `upload-screenshot`, `getSignedUrl`, `getDownloadURL`.

---

*End of report.*
