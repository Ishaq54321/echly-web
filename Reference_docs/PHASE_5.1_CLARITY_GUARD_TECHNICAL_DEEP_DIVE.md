# Phase 5.1: Clarity Guard System — Technical Deep Dive

Structured engineering document for implementing the production AI Clarity Guard. All references are to actual file paths and code.

---

## SECTION 1 — STRUCTURE-FEEDBACK ROUTE ANALYSIS

### 1.1 Complete structure of `app/api/structure-feedback/route.ts`

| Block | Lines | Purpose |
|-------|--------|---------|
| Imports | 1–9 | NextResponse, OpenAI, requireAuth, patternDetection, properNounAnchoring |
| Client / rate limit | 10–57 | `client` (OpenAI), `rateLimitMap`, `checkRateLimit`, `extractScreenEntities` |
| **System prompt** | **59–214** | **`STRUCTURE_ENGINE_V2`** (single constant string) |
| **Response type** | **216–221** | **`StructureResponse`**: `{ success, tickets, error? }** |
| **Parse function** | **223–241** | **`parseStructuredTickets(content)`** — see 1.2 |
| Helpers | 243–283 | `buildStructuralHintsBlock`, `actionStepsContainBoth`, `RETRY_SYSTEM_APPEND` |
| **POST handler** | **285–503** | Auth → rate limit → body parse → **transcript parse** → context blocks → **one or two AI calls** → **parseStructuredTickets** → validation/retry → **return `{ success, tickets }`** |

**Return shape (success):** `NextResponse.json({ success: true, tickets: valid })` at line 448.  
**Return shape (failure):** `NextResponse.json({ success: false, tickets: [], error })` (status 200 or 429).

---

### 1.2 Where transcript is parsed, system prompt, JSON parse, tickets returned

| Concern | Location | Reference |
|--------|----------|-----------|
| **Transcript parsed from request** | Body read and validated | `body = await req.json()` (302–317); `transcript = body?.transcript` (318–324); `typeof transcript !== "string"` → stableFailure |
| **System prompt defined** | Single constant | **Lines 59–214**: `const STRUCTURE_ENGINE_V2 = \`...\`` |
| **JSON parsed** | After AI completion | **Lines 223–241**: `parseStructuredTickets(content)` — `JSON.parse(cleaned)` at 230; expects root object with `parsed.tickets` array |
| **Tickets returned** | After validation/map | **Lines 434–448**: `valid` = filtered/mapped `parsedTickets` (title, description, actionSteps, suggestedTags); `return NextResponse.json({ success: true, tickets: valid })` |

**Parse detail:** `parseStructuredTickets` returns `parsed.tickets` only; it does not read any other root-level keys. Adding `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence` at the **root** of the JSON would require a second parse or an extended parser that reads both `tickets` and clarity fields.

---

### 1.3 Extending the response without breaking current consumers

**Proposed extension:**

```ts
{
  tickets: [],
  clarityScore: number,
  clarityIssues: string[],
  suggestedRewrite: string | null,
  confidence: number
}
```

**Current type:** `StructureResponse = { success: boolean; tickets: Array<Record<string, unknown>>; error?: string }` (lines 217–221).

**Consumers and how they use the response:**

| Consumer | File | How response is used |
|----------|------|----------------------|
| **Web (session page)** | `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Lines 784–807: `res.json()` as `{ success?, tickets?, error? }`. Uses only `data.success`, `data.tickets`. Ignores extra keys. |
| **Web (hook)** | `app/(app)/dashboard/[sessionId]/hooks/useFeedback.ts` | Lines 90–99: `(await res.json()) as { success?, tickets?, StructuredTicket[], error? }`. Uses only `data.success`, `data.tickets`. Ignores extra keys. |
| **Extension content (submit)** | `echly-extension/src/content.tsx` | Lines 274–284: casts to `{ success?, tickets?, error? }`. Uses `data.success`, `data.tickets`. Ignores extra keys. |
| **Extension content (live)** | `echly-extension/src/content.tsx` | Lines 347–357: `liveStructureFetch` uses same API; uses only `data.success`, `data.tickets`, first ticket `title` / `suggestedTags`. |
| **Extension background** | `echly-extension/src/background.ts` | Lines 378–396: `JSON.parse(structureText)` as `{ success?, tickets?, error? }`. Uses `data.success`, `data.tickets`, `data.error`. Ignores extra keys. |

**Conclusion:** Adding `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence` to the JSON response is **safe**: all consumers only read `success`, `tickets`, and sometimes `error`. Extra fields are ignored. No response shape change is required for existing behavior; only the route and (optionally) type definitions need to be extended.

---

## SECTION 2 — FEEDBACK CREATION FLOW

### 2.1 Web flow: structure-feedback → addFeedback

- **Path:** `structure-feedback` → **client-side** `addFeedback()` (no POST to `/api/feedback` from web app for this path).
- **Session page:**  
  - **File:** `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`  
  - **Flow:** `handleTranscript(transcript, screenshot)` (779) → `authFetch("/api/structure-feedback", ...)` (784) → `res.json()` → if `data.success && tickets.length > 0`, for each ticket calls `addFeedback(sessionId, session.userId, payload, ...)` (832).  
  - **`addFeedback`:** `lib/feedback.ts` → `addFeedbackWithSessionCountersRepo` in `lib/repositories/feedbackRepository.ts`.
- **Hook (optional path):**  
  - **File:** `app/(app)/dashboard/[sessionId]/hooks/useFeedback.ts`  
  - **Flow:** `handleTranscript` (86) → `authFetch("/api/structure-feedback", ...)` (90) → then for each ticket `addFeedback(sessionId, session.userId, payload, ...)` (126).  
  - Same `addFeedback` → `addFeedbackWithSessionCountersRepo`.  
  - **Note:** `useFeedback` is not currently referenced by `SessionPageClient.tsx` or `dashboard/page.tsx` in the codebase; the live session flow uses the inlined `handleTranscript` in SessionPageClient.

**Exact path (session page):**  
`SessionPageClient.handleTranscript` → `POST /api/structure-feedback` → `addFeedback()` (from `@/lib/feedback`) → `addFeedbackWithSessionCountersRepo()`.

---

### 2.2 Extension content flow: structure-feedback → POST /api/feedback

- **File:** `echly-extension/src/content.tsx`
- **Path 1 (direct from content):**  
  - Lines 269–273: `apiFetch("/api/structure-feedback", { body: JSON.stringify(structureBody) })`.  
  - Lines 296–311: For each ticket, `apiFetch("/api/feedback", { method: "POST", body: JSON.stringify(body) })`.  
  - So: **structure-feedback** → then **POST /api/feedback** per ticket.
- **Path 2 (via background):**  
  - Lines 223–254: `chrome.runtime.sendMessage({ type: "ECHLY_PROCESS_FEEDBACK", payload: { transcript, screenshotUrl, sessionId, context } })`.  
  - **File:** `echly-extension/src/background.ts` (367–426): fetches **structure-feedback**, then for each ticket (or one fallback ticket) **POST /api/feedback** (423).

**Exact path (extension content):**  
Content: `apiFetch("/api/structure-feedback")` → then for each `data.tickets` → `apiFetch("/api/feedback", POST)`.  
Or: Content sends `ECHLY_PROCESS_FEEDBACK` → Background: `fetch(…/api/structure-feedback)` → then `fetch(…/api/feedback)` per ticket.

---

### 2.3 Extension popup: no structure step

- **File:** `echly-extension/src/popup.ts`
- **Flow:** Lines 194–202: Form submit builds `{ sessionId, title, description, screenshotUrl }` and calls **only** `apiFetch("/api/feedback", { method: "POST", body: JSON.stringify(...) })`. No call to `/api/structure-feedback`.
- **Conclusion:** Popup creates feedback **directly via POST /api/feedback**; no structuring, no clarity evaluation on that path unless added later.

---

### 2.4 Where to put Clarity Guard: (a) structure-feedback, (b) /api/feedback, (c) /api/clarity-check

| Criterion | (a) structure-feedback | (b) /api/feedback | (c) /api/clarity-check |
|-----------|------------------------|-------------------|-------------------------|
| **Avoid duplication** | Single place for structure + clarity; one AI call can do both. | Would need clarity either before or inside POST; if before, caller must call two endpoints unless structure-feedback also does clarity. | Two calls (structure + clarity) unless clarity is merged into structure. |
| **Avoid breaking extension** | Add optional response fields; extension keeps using `tickets` only. No breaking change. | POST body would need to accept clarity metadata when creating from structured flow; extension would need to pass it through from structure response. | Extension would need to call clarity-check as well; more coordination. |
| **Cost** | **Lowest:** one merged prompt (structure + clarity) in the existing structure-feedback call. | If clarity is a separate step before POST, either second AI call or structure-feedback must still do clarity. | **Higher:** extra route = extra AI call unless clarity is merged into structure. |
| **Single source of truth** | One route returns both tickets and clarity; all entry points that use structure-feedback get clarity. | Truth split between structure (tickets) and feedback (persistence); clarity would live in structure or a separate step. | Clarity would be a separate service; structure remains separate. |

**Recommendation:** Put Clarity Guard in **(a) structure-feedback**:

- Merge clarity evaluation into the **existing** structure-feedback prompt (or same request with a second, minimal prompt if you prefer separation in code but one HTTP call).
- Return `tickets` plus `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence` from that route.
- Web and extension content/background keep using `tickets`; they can optionally read clarity fields for UX (indicator, rewrite suggestion, block submit).
- Extension popup stays as-is (no structure, no clarity) unless you later add an optional clarity check for manual title/description.
- Single source of truth, no extra HTTP or AI call for the main flow.

---

## SECTION 3 — DATABASE MODIFICATION PLAN

### 3.1 Fields to store

- `clarityScore`: number (0–100)  
- `clarityStatus`: "clear" | "needs_improvement" | "unclear"  
- `clarityIssues`: string[]  
- `clarityConfidence`: number  
- `clarityCheckedAt`: timestamp  

### 3.2 Where to extend payload (feedback repository)

- **File:** `lib/repositories/feedbackRepository.ts`
- **Payload builder:** **Lines 28–53**: `feedbackPayload(sessionId, userId, data)`.
- **Current `data` type:** `StructuredFeedback` from `@/lib/domain/feedback` (line 26).
- **Exact place to extend:** Inside the object returned by `feedbackPayload`, add:

  - `clarityScore: data.clarityScore ?? null`
  - `clarityStatus: data.clarityStatus ?? null`
  - `clarityIssues: Array.isArray(data.clarityIssues) ? data.clarityIssues : null`
  - `clarityConfidence: data.clarityConfidence ?? null`
  - `clarityCheckedAt: data.clarityCheckedAt ?? null` (if you pass a Firestore `Timestamp` or server timestamp from the API).

- **Callers:** `addFeedbackRepo` and `addFeedbackWithSessionCountersRepo` both call `feedbackPayload(sessionId, userId, data)` (lines 61, 82). So extending `feedbackPayload` and `StructuredFeedback` is enough for new feedback docs.

### 3.3 How `feedbackPayload()` and types would change

- **`feedbackPayload`:** In `lib/repositories/feedbackRepository.ts`, add the five fields to the returned object as above.
- **Domain type:** In **`lib/domain/feedback.ts`**, extend **`StructuredFeedback`** (lines 3–23) with optional:
  - `clarityScore?: number`
  - `clarityStatus?: "clear" | "needs_improvement" | "unclear"`
  - `clarityIssues?: string[]`
  - `clarityConfidence?: number`
  - `clarityCheckedAt?: Timestamp | number | null`
- **`Feedback` (read model):** In the same file, extend the **`Feedback`** interface (lines 28–54) with the same fields (e.g. `| null` for optional DB reads).
- **Read path:** In `lib/repositories/feedbackRepository.ts`, **`docToFeedback`** (228–258) maps doc → `Feedback`. Add:
  - `clarityScore: data.clarityScore ?? null`
  - `clarityStatus: data.clarityStatus ?? null`
  - `clarityIssues: data.clarityIssues ?? null`
  - `clarityConfidence: data.clarityConfidence ?? null`
  - `clarityCheckedAt: data.clarityCheckedAt ?? null`

So: **`feedbackPayload`** and **`docToFeedback`** both need the new fields; **`StructuredFeedback`** and **`Feedback`** in `lib/domain/feedback.ts` must be updated.

### 3.4 Firestore rules

- **Finding:** No `firestore.rules` (or `*.rules`) file was found under the repo root. Rules may live in Firebase console or another repo.
- **If rules exist elsewhere:** Typical Firestore rules do not whitelist field names; they restrict by path and `request.auth`. New fields on the `feedback` collection normally do not require rule changes unless you have strict schema validation.
- **Conclusion:** If your deployment uses a rules file not in this repo, add no extra rule for these fields unless you enforce a schema. Otherwise, no change.

### 3.5 Domain types to update

- **`lib/domain/feedback.ts`:**  
  - **`StructuredFeedback`:** add optional clarity fields (for create/update).  
  - **`Feedback`:** add optional clarity fields (for read/display).  
- **`lib/repositories/feedbackRepository.ts`:**  
  - **`feedbackPayload`:** include clarity fields.  
  - **`docToFeedback`:** map clarity fields from doc to `Feedback`.  

No other domain types need changes for persistence; API response types for structure-feedback should expose the new clarity fields where clients use them.

---

## SECTION 4 — COST OPTIMIZATION (MERGE STRUCTURING + CLARITY)

### 4.1 Current behavior

- **structure-feedback** runs:
  - On **submit** (web SessionPageClient, useFeedback, extension content, extension background).
  - **Debounced during voice** in extension content: `liveStructureFetch` (content.tsx 338–364) calls `/api/structure-feedback` with debounce 1800 ms and min transcript length 12 (see also `useCaptureWidget.ts` 83–84, 206–237: `LIVE_STRUCTURE_DEBOUNCE_MS`, `LIVE_STRUCTURE_MIN_LENGTH`).
- So there is already one structuring call on submit and optionally one debounced call while speaking. Adding a **separate** clarity route would add another AI call per submit (and optionally per debounced call).

### 4.2 Can we merge into one prompt?

Yes. You can:

- **Option A (single prompt):** Extend **`STRUCTURE_ENGINE_V2`** in `app/api/structure-feedback/route.ts` (lines 59–214) to require the model to output both:
  - The existing **tickets** array (unchanged schema).
  - A **clarity** object: e.g. `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence` (and optionally `clarityStatus` derived server-side from score).
- **Option B (two messages, one round-trip):** Keep one `chat.completions.create` but send two user messages (or system + user with two parts): first for structure, second for clarity. This is still one API call but may cost more tokens than one combined prompt.
- **Recommendation:** Option A — extend the existing JSON output format in the same prompt so the model returns one JSON object that includes both `tickets` and clarity fields.

### 4.3 Where to modify the prompt safely

- **File:** `app/api/structure-feedback/route.ts`
- **Constant:** **`STRUCTURE_ENGINE_V2`** (lines 59–214).
- **Strict output format block:** **Lines 176–211** — "Return ONLY valid JSON" and the example `{ "tickets": [ ... ] }`.
- **Safe change:** Append a second block to the prompt, e.g. "CLARITY EVALUATION" and a short set of rules (what makes feedback clear vs unclear, 0–100 score, optional suggested rewrite, confidence 0–1). Then extend the example to:
  - `"tickets": [ ... ]`
  - `"clarityScore": number`
  - `"clarityIssues": string[]`
  - `"suggestedRewrite": string | null`
  - `"confidence": number`
- **Parser:** Either extend **`parseStructuredTickets`** to return both `tickets` and clarity fields from the same `parsed` object, or add a small helper that reads `parsed.clarityScore`, etc., and pass them through to the response. Keep backward compatibility: if the model omits clarity fields, return defaults (e.g. `clarityScore: 100`, `clarityIssues: []`, `suggestedRewrite: null`, `confidence: 0`).

---

## SECTION 5 — UX INTEGRATION POINTS

### 5.1 Clarity indicator (green / amber / red), rewrite suggestion, block submit

| Location | File | Where to integrate |
|----------|------|--------------------|
| **CaptureWidget** | `components/CaptureWidget/CaptureWidget.tsx` | No direct access to structure response. Clarity state and actions are better handled in the hook and/or in the component that provides `onComplete`. So: **indicator/rewrite/block** can be passed in as props (e.g. `clarityStatus`, `clarityIssues`, `suggestedRewrite`, `onSubmitBlocked`) from parent. Optionally show a small clarity badge near **WidgetFooter** (line 201) or in the recording capsule. |
| **useCaptureWidget** | `components/CaptureWidget/hooks/useCaptureWidget.ts` | **`finishListening`** (362–418): after user stops speaking, it calls `onComplete(active.transcript, active.screenshot, callbacks)`. The **parent** (e.g. SessionPageClient or extension content) implements `onComplete` and there calls structure-feedback. So: **clarity logic lives in the parent**. The hook could accept an optional callback like `onClarityResult(clarity)` and call it when the parent passes clarity back; or the parent can handle clarity and pass down only UI state (e.g. `clarityStatus`, `suggestedRewrite`, `submitBlocked`). **Block submit:** Parent’s `onComplete` can avoid calling addFeedback/POST feedback when clarity is bad and instead call a callback that sets state to show rewrite/block; the widget can show "Clarity low — edit or use suggestion" and a "Submit anyway" action. **Exact place:** In **`finishListening`**, the parent’s `onComplete` is the single choke point; that’s where you’d read clarity from the structure response and decide whether to create feedback or show clarity UI. |
| **SessionPageClient** | `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | **`handleTranscript`** (779–862): receives transcript and screenshot, calls structure-feedback, then `addFeedback` for each ticket. **Integration:** (1) Parse `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence` from the structure response. (2) If you want to block: when clarity is below threshold, do not call `addFeedback`; instead set local state (e.g. `clarityResult`, `submitBlocked`) and show a banner/modal with indicator (green/amber/red), issues, and suggested rewrite; provide "Use suggestion" and "Submit anyway". (3) If "Use suggestion", re-call structure with the suggested rewrite (or send suggested rewrite as new transcript) then proceed. (4) If "Submit anyway", call `addFeedback` with current tickets and attach clarity metadata to payload. **Exact function:** `handleTranscript`; add clarity handling immediately after `const [data, screenshotUrl] = await Promise.all([structureCall, uploadCall]);` and before the `addFeedback` loop. |
| **Extension content** | `echly-extension/src/content.tsx` | **Direct submit path (269–328):** After `apiFetch("/api/structure-feedback")` and `(await res.json())`, read clarity fields. If blocking: do not loop to POST /api/feedback; instead show in-widget UI (e.g. state set from a callback) with indicator + issues + suggested rewrite; "Submit anyway" would then POST tickets. **Background path (223–254):** Background does structure then POST; you could extend the message protocol so background returns clarity in the response and content shows the same UI when `response.clarityBlocked === true`. **Live structure (338–364):** `liveStructureFetch` only uses title/tags; optional: also show a small clarity indicator from the same response if you add clarity to that call. **Exact places:** (1) In the submit handler that calls `apiFetch("/api/structure-feedback")` (around 269–328). (2) Optionally in the `ECHLY_PROCESS_FEEDBACK` response handler (233–251) if background returns clarity. |
| **Extension popup** | `echly-extension/src/popup.ts` | Popup does **not** call structure-feedback; it only POSTs to `/api/feedback` with title/description/screenshot. So **no** structure or clarity unless you add an optional step: e.g. "Check clarity" that calls a dedicated clarity endpoint or a structure-feedback call with the typed title+description, then show indicator/rewrite before submit. **Exact place:** In `bindFormSubmit` (or the submit handler around 194), before `apiFetch("/api/feedback")`, optionally call structure-feedback (or clarity-only) with the form text and show UI; then on confirm POST /api/feedback (and optionally include clarity metadata if you persist it from that check). |

### 5.2 Summary: files and functions

| Goal | File | Function / area |
|------|------|------------------|
| Show clarity indicator | SessionPageClient, content.tsx, (optional) CaptureWidget | After structure response in `handleTranscript` / content submit handler; pass `clarityStatus` or `clarityScore` into a small indicator component or CaptureWidget props. |
| Show rewrite suggestion | SessionPageClient, content.tsx | Same as above; pass `suggestedRewrite` and render it (e.g. prefill or "Use this" button). |
| Block submit conditionally | SessionPageClient, content.tsx (and background if you want block there) | In `handleTranscript` / content submit: if clarity below threshold, set state and do not call `addFeedback` / POST /api/feedback until user confirms "Use suggestion" or "Submit anyway". |
| Optional in CaptureWidget | CaptureWidget.tsx, useCaptureWidget.ts | Receive props like `clarityStatus`, `suggestedRewrite`, `submitBlocked` and render banner or footer message; or keep all clarity UI in parent and only pass callbacks. |

---

## SECTION 6 — FAILURE STRATEGY

### 6.1 What currently happens when AI fails

- **Route:** `app/api/structure-feedback/route.ts`  
  - On error in the `try` (e.g. OpenAI throw): **Lines 435–440** — `catch (err)` logs and returns `NextResponse.json({ success: false, tickets: [], error: "Structuring failed" }, { status: 200 })`.  
  - So the API never returns 5xx; it returns 200 with `success: false` and empty tickets.

- **Consumers:**
  - **SessionPageClient:** Lines 804–808: if `!data.success || tickets.length === 0`, logs warning and **returns without creating feedback**. No fallback.
  - **useFeedback:** Lines 98–99: if `!data.success || tickets.length === 0` **return undefined**. No fallback.
  - **Extension content (direct):** Lines 284–285: if `!data.success || tickets.length === 0` **return undefined**. No fallback; user sees no ticket.
  - **Extension background:** Lines 389–404: if `!data.success`, sends `sendResponse({ success: false, error: ... })`. If `data.success` but **tickets.length === 0**, it **creates a fallback ticket** (396–403): one ticket with `title: transcript.slice(0, 80)`, `description: transcript`, `actionSteps: []`, `suggestedTags: ["Feedback"]`, then continues to POST /api/feedback for that one ticket. So **only the background** has a raw-feedback fallback today.

### 6.2 Fallback to raw feedback creation

- **Desired behavior:** When structure-feedback fails (or returns empty tickets), optionally create a single feedback with raw transcript as title/description so the user does not lose the input.
- **Where to implement:**
  - **structure-feedback route:** Do not create feedback in the route (route should remain stateless). Keep returning `{ success: false, tickets: [], error }`.
  - **SessionPageClient:** In **`handleTranscript`**, in the branch `if (!data.success || tickets.length === 0)` (804–808), optionally call `addFeedback` once with e.g. `title: transcript.slice(0, 80)`, `description: transcript`, `type: "Feedback"`, then update local state (e.g. setFeedback, setSelectedId) so the ticket appears. Same pattern as extension background.
  - **useFeedback:** In **`handleTranscript`**, when `!data.success || tickets.length === 0`, optionally create one feedback with raw transcript and return it (so the caller can show it).
  - **Extension content:** In the direct submit path, when `!data.success || tickets.length === 0`, either (1) send a message to background to create one raw ticket (if you centralize fallback in background), or (2) POST /api/feedback once with `title: transcript.slice(0, 80)`, `description: transcript`, and no action steps.
  - **Extension background:** Already has fallback (396–403); ensure the created ticket is still sent to POST /api/feedback and that the response is returned to content.

**Recommendation:** Add explicit raw-feedback fallback in **SessionPageClient.handleTranscript** and **useFeedback.handleTranscript** (and optionally in content’s direct path) so web and extension behave consistently. Keep fallback in **background** as is.

### 6.3 Where fallback logic should go (exact spots)

| Place | File | Function / line | Change |
|-------|------|-----------------|--------|
| Web session page | `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `handleTranscript`, after `if (!data.success \|\| tickets.length === 0) { warn(...); return; }` (804–808) | Replace `return` with: build one payload from `transcript` (e.g. title = transcript.slice(0, 80), description = transcript), call `addFeedback(...)` once, push to state, set selected, return. |
| Web hook | `app/(app)/dashboard/[sessionId]/hooks/useFeedback.ts` | `handleTranscript`, after `if (!data.success \|\| tickets.length === 0) return;` (98–99) | Same: create one raw payload, call `addFeedback`, push to `created`, setFeedback, setSelectedId, return the first created item. |
| Extension content | `echly-extension/src/content.tsx` | Direct submit path after `if (!data.success \|\| tickets.length === 0) return undefined;` (284–285) | Optionally POST /api/feedback once with raw title/description and sessionId/screenshotUrl, then call `callbacks?.onSuccess` with the returned ticket so the widget shows one item. |
| Extension background | `echly-extension/src/background.ts` | Lines 396–403 | Already implements fallback; no change required unless you want to add clarity metadata (e.g. clarityScore: 0) for raw fallback tickets. |

---

## Document summary

- **Section 1:** structure-feedback route structure, transcript/prompt/parse/return locations; extending the response with clarity fields is safe for all current consumers.
- **Section 2:** Web uses structure-feedback then `addFeedback()`; extension content/background use structure-feedback then POST /api/feedback; popup uses only POST /api/feedback. Recommended placement for Clarity Guard: **structure-feedback** (merged prompt, one call).
- **Section 3:** Extend `feedbackPayload` and `docToFeedback` in `lib/repositories/feedbackRepository.ts`, and `StructuredFeedback` / `Feedback` in `lib/domain/feedback.ts`; no Firestore rules file in repo.
- **Section 4:** Merge clarity into the existing structure prompt in `STRUCTURE_ENGINE_V2` and extend the JSON output and parser in the same route.
- **Section 5:** Integrate clarity UI in SessionPageClient and extension content (and optionally CaptureWidget via props) after the structure response; block submit in the same places when clarity is low.
- **Section 6:** On AI failure, route returns 200 with empty tickets; add raw-feedback fallback in SessionPageClient and useFeedback (and optionally in extension content); background already has fallback.

This document is intended for implementing the production AI Clarity Guard with minimal duplication, no breaking changes to the extension, and a single source of truth for structure + clarity.
