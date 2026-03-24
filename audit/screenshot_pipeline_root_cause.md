# Screenshot Root Cause Analysis

## Screenshot data model

**Domain / Firestore fields**

- **`screenshotUrl`**: string | null — public download URL for the PNG in Firebase Storage (written on ticket create).
- **`screenshotStatus`**: `"attached" | "pending" | "none" | "failed" | null` — tracked in domain types and repository payloads; dashboard detail UI primarily gates on **`screenshotUrl`**.

**Where written**

- `lib/repositories/feedbackRepository.ts` — `feedbackPayload()` sets `screenshotUrl` and `screenshotStatus` from `StructuredFeedback` when creating feedback.
- `app/api/feedback/post.ts` — resolves URL via `resolveScreenshotDownloadUrl(screenshotId, sessionId)` (Storage `getDownloadURL`), then passes `screenshotUrl` / `screenshotStatus: "attached"` into `addFeedbackWithSessionCountersRepo`.
- Extension: `echly-extension/src/content.tsx` — upload via `/api/upload-screenshot`, then `POST /api/feedback` with `screenshotId` (server writes final `screenshotUrl` on the feedback document).

**Where read**

- **Realtime:** `lib/realtime/feedbackStore.ts` — `mapDocToFeedback()` reads `data.screenshotUrl` into `Feedback.screenshotUrl`.
- **Server DB reads:** `lib/repositories/feedbackRepository.ts` — `docToFeedback()` includes `screenshotUrl: data.screenshotUrl ?? null`.
- **Dashboard UI:** `components/session/feedbackDetail/FeedbackComponents.tsx` (via `FeedbackContent`) uses `item.screenshotUrl` — if falsy, shows the loading placeholder (`FeedbackContent.tsx`).

---

## Extension capture flow

**Capture**

- Content script capture pipeline (`echly-extension/src/content.tsx`): obtains screenshot data URL, runs OCR path as needed, then `uploadScreenshot(...)` (`echly-extension/src/contentScreenshot.ts` → background → `POST /api/upload-screenshot`).

**Upload / storage**

- `app/api/upload-screenshot/route.ts` — uploads `imageDataUrl` to Storage at `sessions/${sessionId}/screenshots/${screenshotId}.png`, creates TEMP screenshot doc, returns `{ screenshotId, url }`.

**Create ticket**

- `POST /api/feedback` (`app/api/feedback/post.ts`) requires a resolvable screenshot URL before Firestore write; **`screenshotUrl` is persisted on the feedback document** when create succeeds.

**Ordering**

- Upload completes before feedback create (hard failure if URL cannot be resolved). DB is updated **after** upload and URL resolution — not a “save feedback then upload” ordering bug for the happy path.

---

## Storage / upload flow

- Storage path pattern: `sessions/{sessionId}/screenshots/{screenshotId}.png`.
- URL is **generated** server-side (`getDownloadURL`) and stored on the feedback document as **`screenshotUrl`**.

---

## Database write

- Feedback documents in collection `feedback` include **`screenshotUrl`** when created through the production POST path (verified in `feedbackPayload` / `post.ts`).

**Conclusion for pipeline steps A/B:** For successful extension → upload → POST flows, **screenshots are uploaded and `screenshotUrl` is saved** on the document. Failures here would be exceptional (409 / strict mode), not the default explanation for “sometimes missing in UI.”

---

## API response

**File:** `app/api/feedback/route.ts`

Session-scoped and workspace-wide list responses use **`serializeFeedbackMinimal()`**, not `serializeFeedback()`.

`serializeFeedbackMinimal` **intentionally omits** `screenshotUrl` and `screenshotStatus`. It only returns a subset of fields (id, sessionId, createdAt, title, instruction/description, type, actionSteps, comment fields, status flags, etc.) — see lines 127–145.

**Implications**

- **Not null-by-accident in repo:** the repository returns full `Feedback` including `screenshotUrl`, then the route **strips** it for JSON.
- **Cache:** `lib/server/cache/feedbackCache.ts` stores the same minimal response body for 30s; cached responses also lack screenshot fields.

---

## Realtime vs API comparison

| Aspect | Realtime (`feedbackStore` → `mapDocToFeedback`) | GET `/api/feedback` (`serializeFeedbackMinimal`) |
|--------|--------------------------------------------------|-----------------------------------------------|
| **`screenshotUrl`** | Present when stored in Firestore | **Absent** from JSON |
| **`screenshotStatus`** | Not mapped in `mapDocToFeedback` (only `screenshotUrl`); domain allows it | **Absent** |
| **Shape** | Full `Feedback`-like object from document | Minimal list row for inbox / pagination |

**Answer to “does realtime include screenshot but API does not?”** — **Yes.** Realtime maps `screenshotUrl`; the list API **does not return** it.

---

## Pagination impact

**File:** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`

**`appendPaginationIntoCanonical`** (lines 222–238)

- Builds a `Map` from **`itemsRef.current`** (canonical list).
- For each incoming API item: **`if (byId.has(item.id)) continue`** — **keeps the existing in-memory row** (often from realtime, with `screenshotUrl`).
- For **new ids** (typically older tickets **outside** the realtime window of 30): **`byId.set(item.id, item)`** — those rows are **exactly the API payload**, which **has no `screenshotUrl`**.

**Realtime window:** `lib/realtime/feedbackStore.ts` — `REALTIME_LIMIT = 30`, query `limit(30)` ordered by `createdAt` desc.

**Observed symptoms line up**

1. **~30 latest:** Still in realtime snapshot → rows often carry `screenshotUrl` from Firestore listeners; overlap with API seed skips replacement.
2. **Paginated / older-only rows:** Loaded only via API → **no `screenshotUrl` in merged state** → placeholder UI.
3. **`appendPaginationIntoCanonical` does not “drop” screenshots by overwriting** for shared ids; it **skips** updates. The loss is **missing field on the API-shaped objects** for ids that exist **only** from pagination.

---

## Rendering logic

**File:** `components/session/feedbackDetail/FeedbackContent.tsx`

- Uses **`item.screenshotUrl`** only.
- If missing: shows **`echly-screenshot-placeholder`** (animated bar), not a broken image URL — looks like “screenshot not loading.”

**No alternate field** (e.g. `imageUrl`) is consulted in this path.

---

## Secondary failure path: `removed` + `refetchFirstPage`

**File:** `useSessionFeedbackPaginated.ts` (lines 554–577)

Whenever **`docChanges` contains any `type === "removed"`**, the effect:

1. Logs “realtime removal detected → refetching first page”.
2. Calls **`refetchFirstPage()`**, which **`setCanonicalFeedback(incoming)`** with **`GET /api/feedback` first page** — **full replace** of the list.

**Firestore behavior (limited queries):** A document that **leaves the result set because of `limit(N)`** (e.g. a 31st ticket pushes the oldest out of the top 30) produces a **`removed`** event for that document — **not necessarily a user delete**.

So for sessions with **more than ~30 tickets**, creating a new ticket can yield **`removed` (window eviction) in the same batch as `added`** (new ticket). This handler treats **any** `removed` as reason to refetch. **`refetchFirstPage`** then replaces the canonical list with **`serializeFeedbackMinimal` rows** → **screenshots disappear for the whole first page**, including the newest ticket.

The later `setCanonicalFeedback` merge that would apply `added` with full `screenshotUrl` **is skipped** in that effect pass because the first loop **`return`s** after scheduling refetch.

---

## Tertiary path: optimistic `ECHLY_FEEDBACK_CREATED`

**File:** `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` (lines 271–293)

- Inserts **`newItem` without `screenshotUrl`** on window event.
- `notifyFeedbackCreated` in `echly-extension/src/content.tsx` only sends `{ id, title, actionSteps, type }` to background; **background does not echo `ECHLY_FEEDBACK_CREATED` back to the tab**, so the window event is **only** dispatched if some other path sends that runtime message (`content.tsx` listener). The common create path may **not** hit this listener.

**If** the optimistic row exists and realtime sends **`added`** for the same id, **`useSessionFeedbackPaginated`** does **not** replace the row (`added` branch only unshifts when id missing) — **screenshot would stay missing** until a **`modified`** update overwrites the same index. This is a **real but rarer** bug than API stripping + refetch.

---

## ROOT CAUSE (STRICT)

### 1) List API strips screenshot fields (primary data defect)

- **File:** `app/api/feedback/route.ts`
- **Function:** `serializeFeedbackMinimal`
- **Failure:** Response objects **exclude `screenshotUrl` (and `screenshotStatus`)**, so **any client state that is seeded or replaced from this API loses screenshot URLs**, even though Firestore and realtime have them.

### 2) Pagination merge inserts API-only rows without screenshots

- **File:** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- **Function:** `appendPaginationIntoCanonical`
- **Failure:** New ids from the API are merged **without** `screenshotUrl` because the API never sends it — **not** because this function deletes the property from existing rows.

### 3) “Removed” handling triggers full refetch with minimal payloads (wipes screenshots on busy sessions)

- **File:** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- **Functions:** effect processing `docChanges` (removed branch) + `refetchFirstPage` + `setCanonicalFeedback`
- **Failure:** **`removed`** includes **query-window evictions** (`REALTIME_LIMIT`), not only deletes. **`refetchFirstPage`** **replaces** the list with **`serializeFeedbackMinimal`** data → **screenshots vanish**, including for **new** tickets on the first page.

### What this is **not** (for default production flow)

- **Not** a pure rendering bug: UI correctly reads `screenshotUrl`; the value is absent in state.
- **Not** “screenshot never uploaded” / “not saved in DB” for successful POST paths: writes and realtime reads include `screenshotUrl` until list API / refetch overwrites client state.

**Mapping to multiple-choice**

- **C) API not returning screenshot** — **YES** (`serializeFeedbackMinimal`).
- **D) Pagination removing screenshot** — **Partially YES** — pagination **adds** rows **without** the field; it does not strip existing ids unless replaced by refetch path.
- **E) UI reading wrong field** — **NO** for main dashboard detail (`screenshotUrl` is correct).
- **A/B** — **Generally NO** for the described intermittent pattern (DB + realtime prove otherwise).

---

## Confidence level

| Claim | Level |
|-------|--------|
| API minimal serialization omits `screenshotUrl` | **HIGH** (direct code evidence) |
| Paginated-only items lack URL in canonical state | **HIGH** |
| Realtime includes `screenshotUrl` when present in Firestore | **HIGH** |
| `removed` + limit(30) eviction triggers refetch and wipes screenshots | **HIGH** (Firestore semantics + hook control flow) |
| Optimistic create without URL sticks until modified | **MEDIUM** (depends on `ECHLY_FEEDBACK_CREATED` actually firing on dashboard tab) |
