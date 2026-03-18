# Phase 8 Decoupling Audit — Target Endpoints

**Date:** 2025-03-18  
**Scope:** Identify EXACTLY where Phase 8 (decoupling) is needed. No code changes — audit and report only.  
**Goal:** Avoid redundant or unnecessary refactors; only address real blocking bottlenecks.

---

## STEP 1 — TARGET ENDPOINTS (File Paths & Entry Functions)

| Endpoint | File path | Entry function |
|----------|-----------|----------------|
| **GET /api/feedback** | `app/api/feedback/route.ts` | `GET(req)` |
| **POST /api/feedback** | `app/api/feedback/route.ts` → `app/api/feedback/post.ts` | `POST(req)` in `post.ts` |
| **POST /api/session-insight** | `app/api/session-insight/route.ts` | `POST(req)` |
| **POST /api/upload-screenshot** | `app/api/upload-screenshot/route.ts` | `POST(req)` |
| **POST /api/extension/session** | `app/api/extension/session/route.ts` | `POST(request)` |
| **GET /api/sessions** | `app/api/sessions/route.ts` | `GET(req)` |
| **POST /api/sessions** | `app/api/sessions/route.ts` | `POST(req)` |
| **POST /api/session/state** | `app/api/session/state/route.ts` | `POST(request)` |

**Related (called by extension / flow, not in original list):**

| Endpoint | File path | Entry function |
|----------|-----------|----------------|
| **POST /api/structure-feedback** | `app/api/structure-feedback/route.ts` | `POST(req)` |

Extension flow for capture: **upload-screenshot** (optional) → **structure-feedback** (AI) → **feedback** POST. Structure-feedback is the AI bottleneck in the request path; feedback POST does not call AI.

---

## STEP 2 — EXECUTION FLOW (Per Endpoint)

### GET /api/feedback

- `requireAuth(req)` → **SYNC BLOCKING**
- `resolveWorkspaceForUserLight(auth.uid, req)` (via authPromise/workspacePromise) → **PARALLEL** with auth (`Promise.all([authPromise, workspacePromise])`)
- Parse query (sessionId, cursor, limit) → sync
- Cache check `getCachedFeedbackPage` → sync
- Firestore: `getSessionFeedbackPageForUserWithStringCursorRepo` + `getSessionByIdRepo` → **PARALLEL** (`Promise.all`)
- `setCachedFeedbackPage` → sync
- `fetchNextPageInBackground(...).catch(() => {})` → **ASYNC FIRE-AND-FORGET** (response not awaited)
- Response → **AFTER** auth, workspace, and Firestore (or cache)

**TOTAL:** Response waits for auth + workspace + one Firestore read (or cache). Prefetch is non-blocking. **BLOCKING** only for the single page/cache read (acceptable for GET).

---

### POST /api/feedback (app/api/feedback/post.ts)

- `requireAuth(req)` → **SYNC BLOCKING**
- `req.json()` → **SYNC BLOCKING**
- `getSessionByIdRepo(sessionId)` → **SYNC BLOCKING**
- `resolveWorkspaceByIdCached(workspaceId)` → **SYNC BLOCKING**
- `createFeedbackMinimal(...)` (single Firestore `addDoc`) → **SYNC BLOCKING**
- Build response with `docRef.id`, return `NextResponse.json(...)` → **BEFORE** heavy follow-up
- `void (async () => { ... })()` → **ASYNC FIRE-AND-FORGET**: `incrementNewFeedbackCountersRepo`, `invalidateFeedbackCache`, `updateDoc` (status "processing"), `updateScreenshotAttachedRepo` — **NOT** awaited; response already sent

**TOTAL:** Response happens **BEFORE** counters, cache invalidation, screenshot attach. **NOT BLOCKING** for heavy work (already decoupled).

---

### POST /api/session-insight

- `requireAuth(req)` → **SYNC BLOCKING**
- `req.json()` → **SYNC BLOCKING**
- `getSessionByIdRepo(sessionId)` → **SYNC BLOCKING**
- `getUserWorkspaceIdRepo` / workspace from session → **SYNC BLOCKING**
- `resolveWorkspaceById(workspaceId)` → **SYNC BLOCKING**
- `getSessionFeedbackTotalCountRepo(sessionId)` → **SYNC BLOCKING**
- Cache check (cachedSummary vs totalCount) → sync
- `getSessionFeedbackPageWithStringCursorRepo(sessionId, 200, undefined)` → **SYNC BLOCKING**
- In-memory prep (tags, keyword blocks, condensedLines) → sync
- `client.chat.completions.create` (OpenAI gpt-4o-mini) → **SYNC BLOCKING**
- `updateSessionAiInsightSummaryRepo(sessionId, summary, totalCount)` → **SYNC BLOCKING**
- Response → **AFTER** all above

**TOTAL:** **FULLY BLOCKING**. Response only after Firestore reads + AI call + Firestore write. No async/fire-and-forget.

---

### POST /api/upload-screenshot

- `requireAuth(req)` → **SYNC BLOCKING**
- `req.json()` → **SYNC BLOCKING**
- `getSessionByIdRepo(sid)` → **SYNC BLOCKING**
- `getCachedWorkspace(workspaceId, () => resolveWorkspaceById(...))` → **SYNC BLOCKING**
- `getScreenshotByIdRepo(ssId)` → **SYNC BLOCKING**
- `createScreenshotRepoSync(ssId, storagePath)` (if not ATTACHED) → **SYNC BLOCKING**
- `uploadString(screenshotRef, imageDataUrl, "data_url", ...)` (Firebase Storage) → **SYNC BLOCKING**
- `getDownloadURL(screenshotRef)` → **SYNC BLOCKING**
- Response `{ url }` → **AFTER** all above

**TOTAL:** **FULLY BLOCKING**. Response only after upload and getDownloadURL. No background pattern.

---

### POST /api/extension/session

- `requireAuth(request)` → **SYNC BLOCKING**
- `SignJWT(payload).sign(secret)` → **SYNC BLOCKING** (CPU-only, fast)
- Response `{ extensionToken, user: { uid, email } }` → **AFTER** auth + sign

**TOTAL:** No heavy I/O or AI. **SAFE** (no decoupling needed).

---

### GET /api/sessions

- `requireAuth(req)` → **SYNC BLOCKING**
- `resolveWorkspaceForUser(user.uid)` → **SYNC BLOCKING**
- `getWorkspaceSessionsPaginatedRepo` + `getWorkspaceSessionCountRepo` → **PARALLEL** (`Promise.all`)
- Response → **AFTER** auth, workspace, Firestore

**TOTAL:** Response waits for one workspace resolve and one parallel Firestore read. No AI, no uploads. **SAFE**.

---

### POST /api/sessions

- `requireAuth(req)` → **SYNC BLOCKING**
- `resolveWorkspaceForUser(user.uid)` → **SYNC BLOCKING**
- `getWorkspaceSessionCountRepo` + `checkPlanLimit` → **SYNC BLOCKING**
- `createSessionRepo(workspaceId, user.uid, null)` → **SYNC BLOCKING**
- Response `{ success: true, session: { id } }` → **AFTER** above

**TOTAL:** Single Firestore write for session creation. No AI, no uploads. **SAFE**.

---

### POST /api/session/state

- `requireAuth(request)` → **SYNC BLOCKING**
- `request.json()` → **SYNC BLOCKING**
- `getSessionByIdRepo(sessionId)` → **SYNC BLOCKING**
- `updateSessionStatusRepo(sessionId, status)` → **SYNC BLOCKING**
- Response → **AFTER** above

**TOTAL:** Two Firestore ops (read + update). Lightweight. **SAFE**.

---

### POST /api/structure-feedback

- `requireAuth(req)` → **SYNC BLOCKING**
- `resolveWorkspaceForUser(user.uid)` → **SYNC BLOCKING**
- `runFeedbackPipeline(client, { transcript, context }, { useVerification: true })` → **SYNC BLOCKING**
  - Internally: `runVoiceToTicket` → `extractStructuredFeedback` (GPT-4o-mini) → optional `reviewStructuredFeedback` (second GPT call if confidence < 0.85)
- Response → **AFTER** AI pipeline completes

**TOTAL:** **FULLY BLOCKING**. Response only after one or two AI calls. This is the endpoint the extension awaits before calling POST /api/feedback. **CRITICAL** for decoupling if we want non-blocking capture UX at the API level.

---

## STEP 3 — HEAVY OPERATIONS

| Endpoint | Heavy operation | Type | Est. duration |
|----------|------------------|------|----------------|
| **POST /api/session-insight** | OpenAI `chat.completions.create` (gpt-4o-mini, ~160 tokens) | AI | ~1–3s typical |
| **POST /api/session-insight** | `getSessionFeedbackPageWithStringCursorRepo(sessionId, 200)` | Firestore | Can be 500ms+ for large sessions |
| **POST /api/session-insight** | `updateSessionAiInsightSummaryRepo` | Firestore write | Usually &lt;500ms |
| **POST /api/upload-screenshot** | `uploadString` (Firebase Storage) + `getDownloadURL` | File upload | 3–8s depending on size/network |
| **POST /api/upload-screenshot** | `createScreenshotRepoSync` / `getScreenshotByIdRepo` | Firestore | Usually &lt;500ms |
| **POST /api/structure-feedback** | `extractStructuredFeedback` (GPT-4o-mini) | AI | ~1–3s |
| **POST /api/structure-feedback** | `reviewStructuredFeedback` (if confidence &lt; 0.85) | AI | ~1–2s extra |
| **POST /api/feedback** | `createFeedbackMinimal` (single addDoc) | Firestore | Usually &lt;300ms |
| **POST /api/feedback** | Counters + cache invalidation + screenshot attach | Firestore (async) | After response — not blocking |

**HEAVY OPERATIONS SUMMARY:**

- **session-insight:** AI ~2s + Firestore read (200 items) + Firestore write. **Response after all.**
- **upload-screenshot:** Upload 3–8s + getDownloadURL. **Response after all.**
- **structure-feedback:** AI 2–5s (1 or 2 calls). **Response after all.**
- **feedback POST:** Single write then response; heavy follow-up is already fire-and-forget.

---

## STEP 4 — RESPONSE TIMING

| Endpoint | Response when | Verdict |
|----------|----------------|--------|
| **GET /api/feedback** | After auth + workspace + one Firestore page (or cache) | A. After work (read is required for body) — acceptable |
| **POST /api/feedback** | After single `createFeedbackMinimal`; counters/cache/screenshot **after** response | **B. BEFORE heavy work** ✅ |
| **POST /api/session-insight** | After Firestore + AI + Firestore write | **A. AFTER all heavy work** ❌ |
| **POST /api/upload-screenshot** | After upload + getDownloadURL | **A. AFTER all heavy work** ❌ |
| **POST /api/extension/session** | After auth + JWT sign | B (no heavy work) ✅ |
| **GET /api/sessions** | After auth + workspace + Firestore | A (read required) — acceptable |
| **POST /api/sessions** | After auth + workspace + limit check + one write | A (write required for id) — acceptable |
| **POST /api/session/state** | After read + update | A (required) — acceptable |
| **POST /api/structure-feedback** | After full AI pipeline | **A. AFTER all heavy work** ❌ |

---

## STEP 5 — EXISTING ASYNC PATTERNS

- **app/api/feedback/post.ts**
  - `void (async () => { ... })()` after sending response: runs `incrementNewFeedbackCountersRepo`, `invalidateFeedbackCache`, `updateDoc` (status "processing"), `updateScreenshotAttachedRepo`. **Already decoupled** for feedback POST.
- **app/api/feedback/route.ts**
  - `fetchNextPageInBackground(..., nextCursor, ...).catch(() => {})`: prefetch next page for GET; **non-awaited**, response already sent.
- **No** `setTimeout` or job-like queues found in the target API routes.
- **session-insight, upload-screenshot, structure-feedback:** no fire-and-forget; all work is awaited before response.

**Where async already exists:** POST /api/feedback (counters/cache/screenshot attach).  
**Where system is already decoupled:** Feedback creation response is fast; extension “processing” UX relies on this (response with ticket id + status "processing", then background updates).

---

## STEP 6 — EXTENSION DEPENDENCIES

### POST /api/feedback

**Response shape used by extension (background.ts, content.tsx):**

- `success: boolean` — required to decide success/failure
- `ticket.id` — required to show ticket in list, update UI, and for screenshot attach
- `ticket.title`, `ticket.description`, `ticket.type` (or actionSteps) — used for list item and display

**CRITICAL RESPONSE FIELDS (do not break in Phase 8):**

- `success`
- `ticket.id`
- `ticket.title`
- `ticket.description` (or equivalent)
- `ticket.type` or actionSteps for display

**What can be delayed safely:** Nothing in the current response is “delayed” — backend already returns immediately with ticket id; extension does not expect AI result from this endpoint (AI is from structure-feedback).

### POST /api/extension/session

**Response shape:**

- `extensionToken` — required for `Authorization: Bearer`
- `user.uid`, `user.email` — used for UI/state

**CRITICAL:** All of the above. No change to response shape.

### POST /api/structure-feedback (called by extension before POST /api/feedback)

Extension awaits this and then builds the body for POST /api/feedback from `tickets[]`. So:

- **Required for extension to proceed:** `success`, `tickets` (at least one ticket with title, description, actionSteps, suggestedTags). If we decouple (e.g. return 202 + job id), extension would need a way to get the structured result later (polling or callback). **Changing this endpoint affects extension flow.**

---

## STEP 7 — LOG CORRELATION

**Existing logs:**

- **GET/POST /api/feedback:** `log("[API] GET /api/feedback start")`, `log("[API] GET /api/feedback duration:", totalTime)`, `log("[API] POST /api/feedback start")`, `log("[API] POST /api/feedback duration:", Date.now() - start)`.
- **session-insight:** Only `console.log("[AI COST]", { ... })` after AI; **no** request start or total duration.
- **upload-screenshot:** `console.log(\`[UPLOAD] screenshot upload duration: ${uploadDuration}ms\`)`; no request start or total response time.
- **sessions:** `[ECHLY PERF] /api/sessions START`, `auth:`, `resolve_workspace:`, `limit check:`, `db write:`, `TOTAL:`.
- **structure-feedback:** No duration or request-start logs in route; AI pipeline logs `[AI PIPELINE] extractStructuredFeedback duration: Xms` and `runVoiceToTicket duration: Xms` in `voiceToTicketPipeline.ts`.

**To identify endpoints with >1s or >3s response:**

- **feedback GET/POST:** Can correlate start/duration from existing logs.
- **session-insight, upload-screenshot, structure-feedback:** Would need explicit request start + response duration logs to correlate; currently only partial (AI duration or upload duration, not end-to-end).

**Inference from code:**

- **session-insight:** Likely **>1s** (Firestore 200 items + AI); often **>3s**.
- **upload-screenshot:** Likely **>3s** (upload + getDownloadURL).
- **structure-feedback:** Likely **>1s** (AI); **>3s** when review pass runs.

---

## STEP 8 — FINAL CLASSIFICATION

| Endpoint | Status | Reason |
|----------|--------|--------|
| **GET /api/feedback** | SAFE | No change needed; parallel Firestore + cache; prefetch is already non-blocking. |
| **POST /api/feedback** | SAFE | Response before heavy work; counters/cache/screenshot already fire-and-forget. |
| **POST /api/session-insight** | **CRITICAL** | 5–9s blocking (Firestore + AI + write). Response after all. |
| **POST /api/upload-screenshot** | **CRITICAL** | 5–8s blocking (upload + getDownloadURL). Response after all. |
| **POST /api/extension/session** | SAFE | Auth + JWT only; no heavy I/O. |
| **GET /api/sessions** | SAFE | Auth + workspace + one parallel Firestore read. |
| **POST /api/sessions** | SAFE | Single session create; no AI/upload. |
| **POST /api/session/state** | SAFE | Light read + update. |
| **POST /api/structure-feedback** | **CRITICAL** | 2–5s+ blocking (AI pipeline). Extension awaits it before POST /api/feedback. |

---

## STEP 9 — PHASE 8 SCOPE DEFINITION

**PHASE 8 SHOULD TOUCH (decoupling candidates):**

1. **POST /api/session-insight** — Move AI + Firestore write to background; return immediately (e.g. 202 + “generating” or cached summary).
2. **POST /api/upload-screenshot** — Accept upload asynchronously (e.g. return 202 + job id, then callback/poll for URL); or at minimum return quickly and process upload in background (extension would need to poll or use another channel for URL).
3. **POST /api/structure-feedback** — Only if product goal is “submit first, structure later”: e.g. return 202 + job id, extension polls or gets webhook for structured result, then extension calls POST /api/feedback with that result. Higher impact and higher risk (extension flow change).

**PHASE 8 SHOULD NOT TOUCH:**

- **GET /api/feedback** — Already optimized (parallel, cache, prefetch).
- **POST /api/feedback** — Already decoupled (response before counters/cache/screenshot).
- **POST /api/extension/session** — No heavy work.
- **GET /api/sessions**, **POST /api/sessions**, **POST /api/session/state** — No blocking heavy operations.

**Recommendation for scope:**  
Include **session-insight** and **upload-screenshot** as the primary Phase 8 targets. Include **structure-feedback** only if the product accepts a change to extension flow (e.g. submit raw transcript first, get structured result asynchronously).

---

## STEP 10 — RISK ANALYSIS

### POST /api/session-insight (if decoupled)

- **What could break?** Dashboard or client that expects `summary` in the same response would need to poll or re-request. Ensure all callers can handle “pending” and later “ready.”
- **Extension dependency risk?** Low — extension does not call session-insight in the critical capture path (used for session summary in dashboard).
- **Data consistency risk?** Summary eventually consistent with feedback list; ensure cache key (e.g. feedbackCount) is updated when summary is written so clients don’t see stale “cached” with wrong count.

### POST /api/upload-screenshot (if decoupled)

- **What could break?** Extension currently awaits `{ url }` and then passes `screenshotUrl` (and screenshotId) into POST /api/feedback. If response is 202, extension would need another way to get `url` (and optionally attach screenshot to feedback) — e.g. poll, or create feedback first and attach screenshot when URL is ready.
- **Extension dependency risk?** **High.** Extension flow: upload → get URL → structure-feedback → feedback POST (with screenshotUrl/screenshotId). Changing to async upload requires extension changes and a clear contract (e.g. job id + poll endpoint or webhook).
- **Data consistency risk?** TEMP screenshot record exists before upload; feedback can reference screenshotId before URL is ready. Ensure “ATTACHED” and URL update are atomic or eventually consistent so UI doesn’t show broken image.

### POST /api/structure-feedback (if decoupled)

- **What could break?** Extension currently awaits structured result and then calls POST /api/feedback with it. Decoupling would require: (1) accept raw transcript (and context), return 202 + job id; (2) extension either polls for result or gets callback; (3) extension then calls POST /api/feedback with the structured payload. All call sites (content.tsx, background.ts, dashboard SessionPageClient, useFeedback) would need updates.
- **Extension dependency risk?** **Very high.** Core capture flow depends on synchronous structure-feedback response.
- **Data consistency risk?** Low if job result is immutable once written; ensure idempotency if extension retries.

---

## FINAL OUTPUT SUMMARY

### 1. Endpoint audit summary

- **6 target endpoints + 1 related** (structure-feedback) audited.
- **3 CRITICAL** (session-insight, upload-screenshot, structure-feedback): response **after** heavy work.
- **1 already decoupled** (POST /api/feedback): response **before** heavy work; heavy work is fire-and-forget.
- Rest are **SAFE** (light reads/writes, no AI, no large uploads).

### 2. Blocking vs async classification

- **Fully blocking (response after all work):** session-insight, upload-screenshot, structure-feedback.
- **Already async where it matters:** POST /api/feedback (response then counters/cache/screenshot in background).
- **Parallel but still blocking for one read/write:** GET /api/feedback, GET/POST /api/sessions, POST /api/session/state — acceptable for their use case.

### 3. Heavy operation map

- **session-insight:** Firestore read (200 items) + AI (gpt-4o-mini) + Firestore write.
- **upload-screenshot:** Firebase Storage upload + getDownloadURL.
- **structure-feedback:** One or two GPT-4o-mini calls (extract + optional review).

### 4. Phase 8 required scope

- **Must consider:** **POST /api/session-insight**, **POST /api/upload-screenshot**.
- **Optional (higher risk):** **POST /api/structure-feedback** — only if product and extension flow are updated to async structure.

### 5. Risks if modified

- **session-insight:** Low extension risk; ensure callers handle “pending” and cache/summary consistency.
- **upload-screenshot:** High extension risk; contract (job id + URL delivery) and extension changes required.
- **structure-feedback:** Very high extension risk; full capture flow and multiple call sites depend on synchronous response.

### 6. Recommendation

- **Proceed** with Phase 8 for **session-insight** (and optionally **upload-screenshot** and **structure-feedback**).
- **Do not** refactor POST /api/feedback or GET /api/feedback for decoupling — they are already in good shape.
- For **upload-screenshot** and **structure-feedback**, define clear async contracts and extension changes before implementing; otherwise leave as-is to avoid redundant or breaking refactors.

---

*Audit complete. No code was modified.*
