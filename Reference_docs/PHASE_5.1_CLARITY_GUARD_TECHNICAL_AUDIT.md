# Phase 5.1: Clarity Guard System — Technical Audit

**Date:** 2025-03-04  
**Scope:** Complete technical audit of AI architecture, feedback flow, database, cost patterns, UI capabilities, and constraints for building the Clarity Guard system.

---

## SECTION 1 — AI ARCHITECTURE

### 1.1 AI provider(s) and models

- **Provider:** OpenAI only. No Anthropic or other providers in use.
- **Model (exact string in code):** `"gpt-4o-mini"`.
- **References:**
  - `app/api/structure-feedback/route.ts` line 424: `model: "gpt-4o-mini"`
  - `app/api/session-insight/route.ts` line 251: `model: "gpt-4o-mini"`
- **Not used:** GPT-4o, GPT-4.1, GPT-5, or any other model variant.

### 1.2 How AI is invoked

- **API:** Chat Completions (`client.chat.completions.create`). No Responses API.
- **Function calling:** Not used.
- **JSON schema / structured outputs:** Not used. Model returns plain text; code asks for JSON in the prompt and parses it manually.
- **Streaming:** Not used. Both routes await the full completion.
- **Runtime:** Node.js (default). No `export const runtime = 'edge'` in any API route under `app/api/`.

### 1.3 Where AI is called

| Location | Purpose |
|----------|--------|
| `app/api/structure-feedback/route.ts` | POST handler: structures raw feedback transcript into tickets (title, description, actionSteps, suggestedTags). |
| `app/api/session-insight/route.ts` | POST handler: generates session-level executive summary from feedback list. |

**Snippet — structure-feedback (lines 421–430):**

```typescript
const completion = await client.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0,
  messages: [
    { role: "system", content: system },
    { role: "user", content: userContent },
  ],
});
return completion.choices[0]?.message?.content ?? null;
```

**Snippet — session-insight (lines 250–258):**

```typescript
const completion = await client.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0,
  max_tokens: 160,
  messages: [
    { role: "system", content: SESSION_INSIGHT_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ],
});
```

### 1.4 What AI currently does

- **Structure-feedback:** Extracts modification instructions from a single feedback transcript; outputs one or more “tickets” with title, description, action steps, and suggested tags. Used for **structuring/tagging** of voice or text feedback before it is saved as feedback. Not summarization; not classification labels beyond tags; not auto-resolution.
- **Session-insight:** **Summarization** of all feedback in a session (titles, context, action steps, tags) into a short executive summary (max ~120 words). No classification, tagging, or auto-resolution.

### 1.5 Storage of AI outputs

- **Structure-feedback:** AI output is not stored as a separate entity. The returned tickets are immediately used to create feedback documents (title, description, contextSummary, actionSteps, suggestedTags, etc.) via `addFeedback` / `addFeedbackWithSessionCountersRepo`. So “AI output” is persisted only as the resulting feedback fields in Firestore.
- **Session-insight:** AI summary **is** stored:
  - **Collection:** `sessions`
  - **Fields:** `aiInsightSummary` (string), `aiInsightSummaryFeedbackCount` (number), `aiInsightSummaryUpdatedAt` (timestamp).  
  - **Repo:** `lib/repositories/sessionsRepository.ts` — `updateSessionAiInsightSummaryRepo(sessionId, summary, feedbackCount)` (lines 135–147).  
  - **Domain:** `lib/domain/session.ts` — `aiInsightSummary`, `aiInsightSummaryFeedbackCount`, `aiInsightSummaryUpdatedAt`.

### 1.6 Structured output enforcement

- **JSON schema / response_format:** Not used. No `response_format: { type: "json_schema", ... }` or similar.
- **Implementation:** Prompt instructs “Return ONLY valid JSON” with an example `{ "tickets": [ ... ] }`. Response is parsed as plain text: strip markdown code fences, then `JSON.parse(cleaned)` in `parseStructuredTickets` (`app/api/structure-feedback/route.ts` lines 223–241). If parsing fails or `parsed.tickets` is missing, an empty array is returned.
- **Risk:** No guarantee of schema compliance; malformed or extra text can cause parse failures or wrong structure.

---

## SECTION 2 — FEEDBACK SUBMISSION FLOW

### 2.1 Where feedback submission UI lives

- **Web app (session page):** Capture flow and transcript handling are in:
  - `components/CaptureWidget/CaptureWidget.tsx` — main widget.
  - `components/CaptureWidget/hooks/useCaptureWidget.ts` — state and handlers; calls `liveStructureFetch(transcript)` for live structuring and ultimately the same flow that creates feedback.
  - `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` — builds `handleTranscript` and passes `liveStructureFetch` into the widget; calls `authFetch("/api/structure-feedback", ...)` then creates feedback via `addFeedback`.
  - `app/(app)/dashboard/[sessionId]/hooks/useFeedback.ts` — `handleTranscript` calls `/api/structure-feedback` then `addFeedback` for each ticket.
- **Chrome extension (content):** `echly-extension/src/content.tsx` — capture flow that can call `/api/structure-feedback` (with optional context + visibleText) and then POST to `/api/feedback` for each ticket.
- **Chrome extension (popup):** `echly-extension/src/popup.ts` — form submit posts directly to `POST /api/feedback` with user-entered title/description and screenshot; **no** structure-feedback call.

### 2.2 Fields currently submitted

**To POST /api/feedback (server expects and persists):**

- **Required:** `sessionId`, `title`, `description`.
- **Optional:** `suggestion`, `screenshotUrl`, `contextSummary`, `actionSteps` (array), `suggestedTags` (array), `metadata` (object with `url`, `viewportWidth`, `viewportHeight`, `userAgent`, `clientTimestamp`).

**To POST /api/structure-feedback (input only; no direct DB write):**

- **Required:** `transcript` (string).
- **Optional:** `context` (object with `url`, `viewportWidth`, `viewportHeight`, `domPath`, `nearbyText`, `visibleText`).

**UI/extension:**

- **Extension popup:** User types title and description in form; no tags, no action steps, no attachments except screenshot uploaded before submit.
- **Web/extension content capture:** Transcript (and optionally context) go to structure-feedback; the returned tickets are then sent as feedback with title, description, contextSummary, actionSteps, suggestedTags, screenshotUrl, metadata. No separate “action steps” or “attachments” field in the form; action steps come from AI.

### 2.3 Validation

- **Client-side:** Extension popup checks `sessionId`, `title`, and `description` non-empty before submit (`echly-extension/src/popup.ts` lines 157–160). Web capture flow does not validate feedback fields before calling structure-feedback or addFeedback; it relies on API and repo.
- **Server-side (POST /api/feedback):** `app/api/feedback/route.ts` — JSON body parsed; `sessionId` required and trimmed; `title` and `description` required (trimmed), otherwise 400 with error. Optional fields are type-checked (string, array, etc.) and passed through or defaulted. No schema library (e.g. Zod) in use.
- **Server-side (POST /api/structure-feedback):** Requires `transcript` (string); returns 200 with `success: false` and error message if missing. Context is optional; no strict schema.

### 2.4 Free-text vs structured

- **User input:** Free-text (transcript in capture flow; title + description in extension popup).
- **Payload to POST /api/feedback:** Structured JSON (sessionId, title, description, and optional fields). When coming from structure-feedback, title/description/actionSteps/suggestedTags are AI-generated from that free-text.

### 2.5 Submission payload type (POST /api/feedback)

From `app/api/feedback/route.ts` (lines 126–142) and `lib/domain/feedback.ts`:

```typescript
// Request body type (inferred from route)
{
  sessionId?: string;
  title?: string;
  description?: string;
  suggestion?: string;
  screenshotUrl?: string;
  contextSummary?: string;
  actionSteps?: string[];
  suggestedTags?: string[];
  metadata?: {
    url?: string;
    viewportWidth?: number;
    viewportHeight?: number;
    userAgent?: string;
    clientTimestamp?: number;
  };
}

// Persisted via StructuredFeedback → feedbackPayload (lib/repositories/feedbackRepository.ts)
// Domain: lib/domain/feedback.ts — StructuredFeedback, Feedback
```

Server builds `structuredData` from this and passes to `addFeedbackWithSessionCountersRepo(sessionId, user.uid, structuredData)`.

---

## SECTION 3 — DATABASE SCHEMA

### 3.1 Database

- **Firebase / Firestore** for application data. No PostgreSQL, Supabase, or Drizzle/Prisma.  
- **Config:** `lib/firebase.ts` — `getFirestore(app)`; `lib/firebase/config` for project config.

### 3.2 Feedback table (collection) schema

- **Collection name:** `feedback`.
- **Write shape:** `lib/repositories/feedbackRepository.ts` — `feedbackPayload()` (lines 28–53).

| Field | Type | Notes |
|-------|------|--------|
| sessionId | string | Required. |
| userId | string | Required. |
| title | string | Required. |
| description | string | Required. |
| suggestion | string | Default `""`. |
| type | string | Required (e.g. `"general"`, or first suggestedTag). |
| status | `"open"` | Set at create; updated on resolve/skip. |
| createdAt | Firestore Timestamp | serverTimestamp(). |
| contextSummary | string \| null | Optional. |
| actionSteps | string[] \| null | Optional. |
| suggestedTags | string[] \| null | Optional. |
| url | string \| null | Optional. |
| viewportWidth | number \| null | Optional. |
| viewportHeight | number \| null | Optional. |
| userAgent | string \| null | Optional. |
| clientTimestamp | number \| null | Optional. |
| screenshotUrl | string \| null | Optional. |

- **Read mapping:** `docToFeedback()` (lines 232–260) maps Firestore doc to domain `Feedback`; `status` is normalized to `isResolved` / `isSkipped` (and backward compat `status === "done"` → resolved). `actionItems` accepted as fallback for `actionSteps`.
- **Indexes:** Code assumes a composite index on `feedback` for `(sessionId ASC, createdAt DESC)` for paginated queries (`getSessionFeedbackPageRepo`, `getSessionFeedbackPageWithStringCursorRepo`).

### 3.3 Status storage

- **Stored in Firestore:** `status` as **string**: `"open"` | `"resolved"` | `"skipped"`.  
- **Domain:** `Feedback` uses `isResolved: boolean` and `isSkipped?: boolean`; `lib/domain/feedback.ts` and `getTicketStatus()` expose a derived `TicketStatus`: `"open"` | `"resolved"` | `"skipped"`.  
- **UI layer:** `lib/domain/feedback-display.ts` uses display labels `FeedbackStatus = "Open" | "In Progress" | "Blocked" | "Resolved"` and `statusFromResolved(isResolved)`; “In Progress” and “Blocked” are **display-only** and not persisted in the feedback collection.

### 3.4 Priority field

- **Not stored.** Priority is **display-only** in the UI: `lib/domain/feedback-display.ts` defines `FeedbackPriority = "Low" | "Medium" | "High" | "Critical"` and `defaultPriority()` returns `"Medium"`. No priority field in `feedbackPayload`, `Feedback`, or `StructuredFeedback`. Clarity Guard cannot persist a priority without a schema change.

---

## SECTION 4 — AI COST & CALL PATTERN

### 4.1 When AI is called

- **Structure-feedback:**  
  - On **submission** of a capture: after user finishes speaking (or equivalent), transcript (and optionally context) is sent to `/api/structure-feedback`; the returned tickets are then turned into feedback.  
  - Also used for **live** structuring while the user is speaking: `useCaptureWidget` debounces transcript and calls `liveStructureFetch(transcript)` (e.g. from content script’s `liveStructureFetch`), which hits `/api/structure-feedback` with transcript only — so **on each debounced “chunk” during capture**, not only on final submit.
- **Session-insight:**  
  - **On session view / after feedback load:** Triggered from `SessionPageClient` in a `useEffect` when session and feedback are loaded; if there is no cached summary or feedback count changed, it POSTs to `/api/session-insight`. So it runs **on review** (viewing the session page), not on each submission, and not via a manual “Generate summary” button only.

### 4.2 Synchronous vs async

- **Structure-feedback:** Synchronous from client’s perspective: client awaits the POST, then creates feedback. No background job or queue.
- **Session-insight:** Fire-and-forget from the client (no blocking UI); summary is written to the session doc and state is updated when the response returns. No server-side job queue.

### 4.3 Rate limiting and cost protection

- **Structure-feedback:** In-memory per-uid rate limit: 20 requests per 60 seconds (`app/api/structure-feedback/route.ts` lines 14–15, 41–56). Returns 429 when exceeded. No token or cost cap.
- **Session-insight:** No rate limiting. Caching by `(sessionId, totalCount)` avoids redundant calls when count unchanged; `shouldTrigger` (e.g. totalCount >= 5 or tag/keyword heuristics) avoids calling when there’s little to summarize. No token or cost cap.

### 4.4 Token usage (estimate per feedback)

- **Structure-feedback:** No explicit `max_tokens`; system prompt is large (~4k+ chars) plus user content (transcript + context blocks). One completion per submission; retry adds a second call when change/replace validation fails. Rough order: hundreds to low thousands of input tokens per request; output is one JSON blob (tickets array). Not measured in code.
- **Session-insight:** `max_tokens: 160`; input is condensed lines for up to 200 feedback items. Per session view, one call when cache miss and shouldTrigger. Not measured in code.

---

## SECTION 5 — UI CAPABILITIES

### 5.1 Inline AI, blocking, guidance panel, confidence

- **Inline AI suggestions while typing:** Partially present. During voice capture, **live** structuring runs on debounced transcript via `liveStructureFetch` and the result (e.g. title, tags, priority) is shown (e.g. in `RecordingCapsule` / capture UI). There is no separate “while typing” clarity or suggestion UI for a text field.
- **Block submission conditionally:** Not implemented. Submission is not gated by an AI “clarity” or validation step. Extension popup only checks non-empty title/description; web flow does not block submit based on AI.
- **Expandable AI guidance panel:** Not implemented. No dedicated panel for “AI says your feedback is unclear” or similar.
- **Confidence indicators:** Not implemented. Structure-feedback and session-insight do not return or display confidence scores.

### 5.2 Reusable modal system

- **Present:** Custom modals implemented as components (no shared design system):  
  - `components/dashboard/DeleteSessionModal.tsx`  
  - `components/dashboard/ShareSessionModal.tsx`  
  - `components/dashboard/RenameSessionModal.tsx`  
  - `SessionPageClient.tsx` uses an inline delete confirmation overlay (`showDeleteModal`).  
- **Pattern:** Props for open state and callbacks; `aria-modal="true"` used. No single generic `<Modal>` from a UI library.

### 5.3 Toast system

- **Not implemented.** No toast or snackbar library (e.g. sonner, react-hot-toast) in `package.json`. Status messages are inline (e.g. extension `statusEl`, or local state in components).

### 5.4 Form state management

- **No dedicated form library.** No react-hook-form, Formik, or similar in `package.json`. Forms use local React state (e.g. `useState` for inputs and validation in extension popup and RenameSessionModal). Capture flow state is custom in `useCaptureWidget` and `useFeedback`.

---

## SECTION 6 — CONSTRAINTS & RISKS

### 6.1 Technical constraints for Clarity Guard

- **No structured AI output:** Structure-feedback uses prompt-based JSON and manual parsing. Adding a “clarity” or “validation” response (e.g. clarity score, suggested rewrites) would either require another prompt + parse or adoption of JSON schema / structured outputs for reliability.
- **No priority in DB:** Confidence or “needs clarification” cannot be stored as a priority or clarity field without adding a new field and migration/storage rules.
- **No server-side validation pipeline:** Feedback is validated only for presence of title/description. A “clarity guard” step (e.g. run AI before persisting, or run after and attach a flag) would need a new API or extension of the existing structure or feedback route.
- **Multiple entry points:** Feedback is created from (1) web session page (structure-feedback → addFeedback), (2) extension content (structure-feedback → POST /api/feedback), (3) extension popup (direct POST /api/feedback). Any guard that runs only in one path would leave others unguarded unless duplicated or centralized in the API.
- **Live structuring already calls structure-feedback:** Adding a separate “clarity” call per chunk could double cost or latency unless combined into one structured response (e.g. structure + clarity in one prompt/response).

### 6.2 Architectural risks

- **In-memory rate limit:** Structure-feedback rate limit is per process; not shared across instances. Under multiple server instances or serverless, limits are not global.
- **No circuit breaker / fallback:** If OpenAI is slow or down, structure-feedback fails and the user gets no tickets; there is no fallback (e.g. save raw transcript as a single ticket) or degradation path.
- **Parse failure = silent empty:** When `parseStructuredTickets` fails or returns empty, the API returns `success: true, tickets: []` (or similar); clients may treat this as “no tickets” rather than “structuring failed,” which can confuse Clarity Guard UX if clarity is tied to structure.

### 6.3 Performance bottlenecks

- **Synchronous structure then create:** Client waits for structure-feedback then creates N feedback docs sequentially (or in a loop). For many tickets, this can be slow; no batching of feedback creates in the API.
- **Session-insight payload:** Fetches up to 200 feedback items and builds a large text block for the model; for very large sessions this is a heavy read and a large prompt.
- **No streaming:** Both AI routes are non-streaming; latency is full round-trip. For a “live” clarity indicator, streaming or a dedicated lightweight endpoint might be needed to avoid blocking.

---

## Summary Table

| Area | Finding |
|------|--------|
| AI provider | OpenAI only, `gpt-4o-mini` |
| AI invocation | Chat Completions, non-streaming, Node runtime |
| AI call sites | `app/api/structure-feedback/route.ts`, `app/api/session-insight/route.ts` |
| AI roles | Structuring/tagging (structure-feedback); summarization (session-insight) |
| AI storage | Session summary in `sessions`; structure output only via feedback fields |
| Structured output | Prompt-based JSON; no JSON schema |
| Feedback UI | CaptureWidget + SessionPageClient + useFeedback; extension content + popup |
| Feedback fields | title, description, optional: suggestion, screenshotUrl, contextSummary, actionSteps, suggestedTags, metadata |
| Validation | Server: title/description required; no schema lib. Client: extension checks non-empty. |
| Database | Firestore (feedback, sessions). No priority field; status = open \| resolved \| skipped. |
| AI trigger | Structure: on submit + debounced during voice; Session-insight: on session view when cache invalid. |
| Rate limit | Structure-feedback: 20/60s per uid (in-memory). Session-insight: none. |
| Modals | Custom components; no generic toast or form library. |
| Clarity Guard blockers | No clarity/confidence in API or DB; no submission gating; multiple entry points; no shared guard in API. |

---

*Audit complete. All findings are from the current codebase; no speculation.*
