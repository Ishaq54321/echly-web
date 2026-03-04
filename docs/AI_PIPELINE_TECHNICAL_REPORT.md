# Echly AI Pipeline — Full Technical Report

This document is a complete technical introspection of the AI pipeline used in Echly, from user feedback to ticket creation. It is intended for product and AI architects to fully understand and improve the system.

---

## SECTION 1 — AI PIPELINE OVERVIEW

### End-to-end flow

**INPUT (to API)**

- `transcript` (string) — voice feedback text
- `context` (optional) — when sent by the extension:
  - `url`
  - `viewportWidth`, `viewportHeight`
  - `domPath`, `nearbyText`
  - `visibleText` (OCR from screenshot)

The screenshot is **not** sent to the structure-feedback API. It is uploaded separately (e.g. `uploadScreenshot`). The AI pipeline receives only text: transcript and, when provided, `context.visibleText`.

**Pre-pipeline (no AI)**

- **Proper noun anchoring**  
  **File:** `lib/server/properNounAnchoring.ts`  
  **Input:** `originalTranscript`, `context?.visibleText`  
  **Output:** `correctedTranscript` (STT/transcript terms aligned to OCR visible text for proper nouns/phrases).  
  **Data passed:** The route uses `correctedTranscript` for all subsequent stages.

**Stage 1: Instruction segmentation**

- **File:** `lib/server/instructionSegmentation.ts`  
- **Function:** `segmentInstructions(client, correctedTranscript)`  
- **Input:** OpenAI client, corrected transcript only (no visibleText at this stage).  
- **Output:** `{ instructions: string[], needsClarification: boolean }`.  
- **Data passed to next stage:** `instructions` array; if `needsClarification === true` or `instructions.length === 0`, the route returns immediately and does not run later stages.

**Stage 2: Instruction refinement**

- **File:** `lib/server/instructionRefinement.ts`  
- **Function:** `refineInstructions(client, instructions)`  
- **Input:** OpenAI client, segmented instructions.  
- **Output:** `{ instructions: string[] }` (each instruction = exactly one developer action).  
- **Data passed to next stage:** refined `instructions`.

**Stage 3: Instruction → Ontology Mapping (NEW)**

- **File:** `lib/server/instructionOntology.ts`  
- **Function:** `mapInstructionsToOntology(client, instructions, ctx)`  
- **Input:** OpenAI client, refined instructions, optional pipeline context (DOM elements preferred over OCR).  
- **Output:** `{ actions: OntologyAction[], needsClarification?: boolean }`. Each instruction maps to exactly one canonical action type (e.g. RENAME_FIELD, RESIZE_ELEMENT, TEXT_CHANGE).  
- **Data passed to next stage:** `ontologyResult.actions` (structured UI actions).

**Stage 4–5: Intent + ticket generation from ontology (batched)**

- **File:** `lib/server/pipelineStages.ts`  
- **Function:** `batchIntentAndTicketsFromOntology(client, ontologyResult.actions, ctx)`  
- **Input:** OpenAI client, ontology actions, optional pipeline context.  
- **Output:** `{ intents: InstructionIntent[], tickets: PipelineTicket[] }`. Intents derived from action_type; tickets generated from structured actions for consistency.  
- **Data passed to next stage:** `pipelineTickets`.

**Stage 6: Verification**

- **File:** `lib/server/ticketVerification.ts`  
- **Function:** `verifyTicketsBatch(client, correctedTranscript, instructions, pipelineTickets)`  
- **Input:** OpenAI client, full corrected transcript, refined instructions, pipeline tickets.  
- **Output:** `VerificationResult[]` (one per ticket: `isAccurate`, `isActionable`, `needsClarification`, `confidence`).  
- **Data used:** Route aggregates verification results; if any verification has `needsClarification === true`, that ticket is dropped; if all fail, route returns needsClarification.

**Final ticket creation**

- **File:** `app/api/structure-feedback/route.ts`  
- **Logic:** If all stages succeed and no clarification is required, the route maps `pipelineTickets` to the response shape (`title`, `description`, `actionSteps`, `suggestedTags`, `confidenceScore`) and returns them. Actual persistence (Firestore feedback documents) is done by the client (dashboard or extension) via `/api/feedback` or equivalent, not inside this route.

### Pipeline diagram (data flow)

```
INPUT
  transcript (required)
  context: { url?, viewportWidth?, viewportHeight?, domPath?, nearbyText?, visibleText? }

↓ (in route)

Pre-pipeline: anchorProperNouns(transcript, context?.visibleText)
  File: lib/server/properNounAnchoring.ts
  → correctedTranscript

↓

Stage 1: segmentInstructions(client, correctedTranscript)
  File: lib/server/instructionSegmentation.ts
  → { instructions, needsClarification }
  → If needsClarification || instructions.length === 0 → early return (clarity response)

↓

Stage 2: refineInstructions(client, instructions)
  File: lib/server/instructionRefinement.ts
  → { instructions } (one action per instruction)

↓

Stage 3: mapInstructionsToOntology(client, instructions, ctx)
  File: lib/server/instructionOntology.ts
  → { actions: OntologyAction[], needsClarification? }

↓

Stage 4–5: batchIntentAndTicketsFromOntology(client, actions, ctx)
  File: lib/server/pipelineStages.ts
  → { intents, tickets: pipelineTickets }
  → If pipelineTickets.length === 0 → early return (clarity response)

↓

Stage 6: verifyTicketsBatch(client, correctedTranscript, instructions, pipelineTickets)
  File: lib/server/ticketVerification.ts
  → VerificationResult[]
  → If any v.needsClarification → early return (clarity response)

↓

Final: map pipelineTickets to response tickets; return success + tickets + clarityScore, etc.
  File: app/api/structure-feedback/route.ts
```

---

## SECTION 2 — FULL PROMPTS USED BY EACH AI STAGE

### Stage 1: Instruction segmentation

**File:** `lib/server/instructionSegmentation.ts`

**System prompt (exact):**

```
You are Echly's Instruction Segmenter.

Treat this task as parsing a list of instructions, not summarizing text.

Your job: split user feedback into atomic, actionable instructions. One instruction = exactly one concrete change.

STRICT RULES:
1. Split instructions whenever a new verb or action appears.
2. Split on conjunctions such as "and", "also", commas, or sentence boundaries.
3. Each instruction must represent exactly one change. Never merge unrelated instructions into one.
4. Preserve meaning but simplify wording if needed (e.g. "change X to Y" → "Change the label 'X' to 'Y'").
5. Do NOT hallucinate additional tasks. Only output instructions that are clearly stated or directly implied.
6. If the feedback is vague (e.g. "fix this", "make this better", "this looks weird") with no concrete change, output an empty array and set needsClarification to true.
7. If the transcript is empty or unintelligible, output empty array and needsClarification true.
8. Always return valid JSON. No markdown, no code fences.

OUTPUT FORMAT:
{
  "instructions": ["instruction 1", "instruction 2", ...],
  "needsClarification": false
}

Set needsClarification to true when:
- The user did not specify what to change (e.g. "fix this", "make it better").
- The feedback is purely subjective with no actionable request (e.g. "this looks weird").
- The transcript is empty or unintelligible.

EXAMPLES:

Example 1:
Input: "Change hero image and increase button size"
Output:
{
  "instructions": ["Change the hero image", "Increase the button size"],
  "needsClarification": false
}

Example 2:
Input: "Update the CTA text and make it blue and increase its size"
Output:
{
  "instructions": ["Update the CTA text", "Change the CTA color to blue", "Increase the CTA size"],
  "needsClarification": false
}

Example 3:
Input: "Rename Email to Business Email and Phone Number to Mobile Number"
Output:
{
  "instructions": ["Rename the Email field to Business Email", "Rename the Phone Number field to Mobile Number"],
  "needsClarification": false
}
```

**User prompt (exact):**

```
Transcript:
"<trimmed transcript>"
```

**Rules (in code, pre-LLM):**

- Empty or whitespace transcript → return `{ instructions: [], needsClarification: true }` without calling the model.
- **Vague-pattern check:** If transcript matches any of the following regexes, return `{ instructions: [], needsClarification: true }` without calling the model:
  - `/\b(this looks?|that looks?)\s+(weird|bad|off|wrong)\b/i`
  - `/\bmake (this|it) better\b/i`
  - `/\bfix (this|it)\b/i`
  - `/\bimprove (this|it)\b/i`
  - `/\bsomething('s)? wrong\b/i`
  - `/\b(just )?fix (it|things)\b/i`
- Transcript length &lt; 3 after trim → treated as vague (returns needsClarification).

---

### Stage 2–3: Intent understanding + ticket generation (single batched call)

**File:** `lib/server/pipelineStages.ts`

**System prompt (exact):**

```
You are Echly's pipeline: for each atomic instruction you will output (1) intent and (2) one developer-ready ticket. Accuracy over creativity. Use temperature 0 behavior.

STAGE A — INTENT (per instruction):
For each instruction output:
- intent_type: one of "UI change", "Content change", "Layout change", "Bug fix", "Accessibility improvement", "UX improvement"
- target_element: short label for the UI element (e.g. "hero CTA button", "nav link") or null
- change_type: specific type (e.g. "size_increase", "color_change", "text_replace", "layout_width", "redirect_fix")
- confidence: 0–1

STAGE B — TICKET (per instruction):
Each ticket must represent exactly ONE change. Never merge two instructions into one ticket.

Ticket rules:
1. title: 4–10 words, specific (e.g. "Increase hero button size by 40%"). No vague titles like "Fix design".
2. description: One concise sentence. What should change and why (if clear).
3. actionSteps: 1–5 concrete, implementable steps. No vague steps like "Improve layout". Be specific (e.g. "Increase margin between headline and CTA by ~24px").
4. tags: 1–3 tags from ["UI", "Content", "UX", "Layout", "Bug", "Accessibility"].
5. confidenceScore: 0–1.

Do not repeat the transcript verbatim. Do not hallucinate steps not implied by the instruction.

OUTPUT: Return ONLY valid JSON. No markdown.
{
  "intents": [
    { "intent_type": "UI change", "target_element": "hero button", "change_type": "size_increase", "confidence": 0.88 }
  ],
  "tickets": [
    {
      "title": "Increase hero CTA button size by 40%",
      "description": "The hero call-to-action button should be larger for better visibility.",
      "actionSteps": ["Increase hero CTA button size by approximately 40%.", "Ensure button remains responsive across breakpoints."],
      "tags": ["UI", "Layout"],
      "confidenceScore": 0.88
    }
  ]
}

The number of intents and tickets MUST equal the number of instructions. One instruction → one intent → one ticket.
```

**User prompt (constructed in code):**

```
Visible text from page (for disambiguation only):
<visibleText if provided, else "(none)">

Instructions (one per line):
1. <instruction 1>
2. <instruction 2>
...
```

**Examples:** The single in-prompt example is the JSON block in the system prompt above.

**Rules:** One instruction → one intent → one ticket; counts must match.

---

### Stage 4: Verification

**File:** `lib/server/ticketVerification.ts`

**System prompt (exact):**

```
You are Echly's Ticket Verifier. For each (instruction, ticket) pair, decide if the ticket is accurate and actionable. No creativity; strict evaluation.

For each pair check:
1. Does the ticket match the user's intent? (Same change, same target element — no wrong or invented details.)
2. Is the ticket actionable for developers? (Concrete steps, no vague language.)
3. Is anything hallucinated? (Nothing added that the user did not say or clearly imply.)

Return:
- isAccurate: true only if the ticket correctly reflects the instruction.
- isActionable: true only if a developer could implement it without guessing.
- needsClarification: true if the ticket is wrong, vague, or hallucinated. When in doubt, set true.
- confidence: 0–1 for your verification.

If the instruction was vague (e.g. "fix this") or the ticket invents details, set needsClarification true.

OUTPUT: Return ONLY valid JSON. No markdown.
{
  "verifications": [
    { "isAccurate": true, "isActionable": true, "needsClarification": false, "confidence": 0.9 }
  ]
}

The number of verifications MUST equal the number of instructions. One verification per (instruction, ticket) pair.
```

**User prompt (constructed in code):**

```
Original transcript (full feedback):
"<originalTranscript.trim().slice(0, 1500)>"

Instruction and ticket pairs (verify each):
--- Pair 1 ---
Instruction: <instruction 1>
Ticket title: <ticket 1 title>
Description: <ticket 1 description>
Action steps: <JSON.stringify(ticket 1 actionSteps)>

--- Pair 2 ---
...
```

**Examples:** The single in-prompt example is the `verifications` array in the system prompt.

**Rules:** One verification per (instruction, ticket) pair; length must match.

---

## SECTION 3 — MODEL CONFIGURATION

All pipeline stages use the same model and similar sampling; no explicit timeout is set on the OpenAI client in server code.

| Stage                 | Model       | Temperature | top_p | max_tokens | Response format | Timeout (server) |
|----------------------|------------|-------------|-------|------------|------------------|-------------------|
| Instruction segmentation | gpt-4o-mini | 0           | 1     | 800        | JSON             | None (OpenAI default) |
| Intent + ticket (batch)  | gpt-4o-mini | 0           | 1     | 2000       | JSON             | None              |
| Verification             | gpt-4o-mini | 0           | 1     | 1000       | JSON             | None              |

- **Segmentation:** `lib/server/instructionSegmentation.ts` — `model: "gpt-4o-mini", temperature: 0, top_p: 1, max_tokens: 800`.
- **Intent + tickets:** `lib/server/pipelineStages.ts` — `model: "gpt-4o-mini", temperature: 0, top_p: 1, max_tokens: 2000`.
- **Verification:** `lib/server/ticketVerification.ts` — `model: "gpt-4o-mini", temperature: 0, top_p: 1, max_tokens: 1000`.

Client-side: `lib/authFetch.ts` uses `DEFAULT_TIMEOUT_MS = 25000` for the whole HTTP request (including structure-feedback). No per-stage timeout is configured in the API route.

---

## SECTION 4 — DATA INPUT TO AI

### API request body (structure-feedback)

```ts
{
  transcript: string;           // required
  context?: {
    url?: string;
    viewportWidth?: number;
    viewportHeight?: number;
    domPath?: string | null;
    nearbyText?: string | null;
    visibleText?: string | null;  // OCR text from page
  };
}
```

- **Dashboard:** Typically sends only `{ transcript }` (no `context`). So `visibleText` is null for dashboard-originated requests unless the client is extended to send context.
- **Extension:** Sends `{ transcript, context: enrichedContext }` with `visibleText` from OCR when available, plus `url` and any other context fields.

### Per-stage inputs

| Stage              | Receives from code | Actual AI input (user message content) |
|--------------------|--------------------|----------------------------------------|
| Segmentation       | `correctedTranscript` only | `Transcript:\n"<trimmed>"` |
| Intent + tickets   | `instructions`, `ctx?.visibleText ?? null` | Visible text block + numbered instructions list |
| Verification       | `correctedTranscript` (sliced 0–1500), `instructions`, `pipelineTickets` | Original transcript snippet + per-pair instruction + ticket title, description, action steps |

- **Screenshot:** Not sent to any AI stage. Only text (transcript + optional visibleText) is used.
- **URL, viewport, domPath, nearbyText:** Read from `body.context` in the route but **not** passed into any of the three AI stages; only `visibleText` is passed (to anchoring and to `batchIntentAndTickets`).

---

## SECTION 5 — FAILURE HANDLING

### Instruction segmentation (`instructionSegmentation.ts`)

- **Empty/missing content:** If `completion.choices[0]?.message?.content?.trim()` is falsy → return `{ instructions: [], needsClarification: false }` (no throw).
- **JSON parse:** Content is cleaned (strip markdown code fences), then `JSON.parse(cleaned)`. On any exception → `catch` returns `{ instructions: [], needsClarification: true }`.
- **Instructions array:** If `parsed.instructions` is not an array, `instructions` is `[]`. Strings are filtered to non-empty trimmed only.
- **Logic:** If after parse `instructions.length === 0` and `!needsClarification`, the function forces `needsClarification: true` so the route treats it as clarification needed.

### Intent + ticket generation (`pipelineStages.ts`)

- **Empty content:** If no content from completion → `fallbackIntentAndTickets(instructions)` (default intents and tickets from instruction text; no re-call).
- **JSON parse:** `cleanJson(content)` then `JSON.parse`. On exception → `fallbackIntentAndTickets(instructions)`.
- **Normalization:** `normalizeIntents` and `normalizeTickets` tolerate missing/wrong types: wrong/missing `intent_type` → `"UX improvement"`; missing numbers → `clamp` to 0.5; missing strings → instruction slice or defaults. Length is forced to `expectedLen` / `instructions.length` by iterating over indices.

### Verification (`ticketVerification.ts`)

- **Empty content:** Return array of `conservativeVerification()` for each pair: `{ isAccurate: false, isActionable: false, needsClarification: true, confidence: 0.5 }`.
- **JSON parse:** `cleanJson(content)` then `JSON.parse`. On exception → same conservative result per pair.
- **Per-item:** If a verification object is missing or not an object, that index gets `conservativeVerification()`.

### Route (`app/api/structure-feedback/route.ts`)

- **Auth/rate limit:** Failure returns 401/429 with JSON; no generic catch for those.
- **Invalid body / no transcript:** Returns 200 with `success: false, tickets: [], error: "Invalid request body"` or `"No valid transcript provided"`.
- **Missing OPENAI_API_KEY:** Returns 200 with `success: false, tickets: [], error: "Missing OpenAI API key"`.
- **Top-level try/catch:** Any thrown error in the pipeline (e.g. OpenAI API errors, timeouts) is caught and returns 200 with `success: false, tickets: [], error: "Structuring failed"`. No retries; no differentiation of error type.

### OpenAI API errors and timeouts

- No explicit timeout on `client.chat.completions.create` in server code; reliance on OpenAI SDK/defaults.
- No retry logic in segmentation, pipeline stages, or verification.
- Client: `authFetch` aborts after 25s (configurable via `init.timeout`); no custom timeout is set for structure-feedback in the call sites inspected, so 25s default applies.

### Summary table

| Failure type           | Handling |
|------------------------|----------|
| AI response empty      | Segmentation: empty instructions + needsClarification false; Intent+tickets: fallback tickets; Verification: conservative (needsClarification true). |
| OpenAI API errors      | Propagate to route catch → `success: false, error: "Structuring failed"`. |
| Timeouts               | No server-side timeout; client 25s abort. |
| Invalid JSON           | All stages: strip code fences, then parse; on failure use fallback or conservative result. |
| Empty instructions    | Route returns clarity response (no tickets). |
| Zero tickets from batch| Route returns clarity response. |
| Verification needsClarification | Route returns clarity response with verificationIssues. |

---

## SECTION 6 — CLARITY SYSTEM

### clarityScore generation

- **Success path (tickets returned):** `clarityScore = Math.round(minConfidence * 100)` where `minConfidence` is the minimum of `verifications[].confidence`. So clarity score is 0–100 derived from verification confidence.
- **Clarity return (needsClarification from verification):** `clarityScore = Math.min(...verifications.map((v) => v.confidence * 100))`.
- **Segmentation clarity return:** `clarityScore: 0`.
- **Zero tickets from batch:** `clarityScore: 0`.
- **Default when score missing in client:** Dashboard and extension often use `data.clarityScore ?? 100`.

### Threshold values

- **Dashboard (`SessionPageClient.tsx`):**
  - `buildClarityStatus(score)`: `score >= 85` → `"clear"`, `score >= 60` → `"needs_improvement"`, else `"unclear"`.
  - **Block submission:** `clarityScore < 60` → set `blockSubmit(true)` and show clarity UI with optional “Submit Anyway”.
- **Extension (`content.tsx`):**
  - **Clarity guard (pause and show assistant):** `clarityScore <= 20` → show clarity assistant and do not submit.
  - **Status:** `score >= 85` → clear, `score >= 60` → needs_improvement, else unclear.

So dashboard uses a 60 threshold for blocking; extension uses 20 for the “hard” clarity guard.

### How needsClarification is triggered

1. **Stage 1:** Segmentation returns `needsClarification: true` or `instructions.length === 0` (including vague-pattern or empty transcript).
2. **Stage 2–3:** `pipelineTickets.length === 0` after batch (route treats this as clarification path).
3. **Stage 4:** Any `VerificationResult.needsClarification === true` → route returns with `needsClarification: true` and no tickets.

When the route returns with `needsClarification: true` and zero tickets, the client treats it as “pipeline requested clarification.”

### UI reaction when clarification is required

- **Dashboard:** If `data.needsClarification && tickets.length === 0`: sets `clarityResult` (score, issues, suggestedRewrite), `blockSubmit(true)`, and `pendingClaritySubmit` (payload + screenshot, transcript, etc.). A modal (“Feedback needs clarity”) shows score, clarityIssues list, suggested rewrite if present, and actions: Cancel, “Use Suggestion” (re-run with suggested rewrite), “Submit Anyway.”
- **Extension:** If `needsClarification && tickets.length === 0` (or `clarityScore <= 20`): sets `extensionClarityPending` and opens the clarity assistant UI; no ticket is created. User can edit and re-submit or use suggestion.

---

## SECTION 7 — TICKET STRUCTURE

### Schema of a generated ticket (pipeline output)

**Source:** `lib/server/pipelineStages.ts` — `PipelineTicket` and normalization in `normalizeTickets`.

```ts
interface PipelineTicket {
  title: string;        // max 120 chars in normalization
  description: string;  // max 500 chars
  actionSteps: string[]; // 1–5 steps per prompt; no length limit in code
  tags: string[];        // 1–3 from ["UI","Content","UX","Layout","Bug","Accessibility"] per prompt
  confidenceScore: number; // 0–1, clamped
}
```

### API response ticket shape (route output)

```ts
{
  title: string;
  description: string;
  actionSteps: string[];
  suggestedTags: string[];  // mapped from pipeline ticket.tags
  confidenceScore: number;
}
```

### How each field is generated

- **title:** From model’s `ticket.title`; if missing or empty, `instructions[i].slice(0, 80)`. Normalized to `.slice(0, 120)`.
- **description:** From model’s `ticket.description`; if missing or empty, falls back to title. Normalized to `.slice(0, 500)`.
- **actionSteps:** From model’s `ticket.actionSteps`; must be array of non-empty strings, trimmed; otherwise `[]` for that ticket (or default ticket uses `[instruction]`).
- **tags:** From model’s `ticket.tags`; must be string array; otherwise `["Feedback"]`. Exposed as `suggestedTags` in the API.
- **confidenceScore:** From model’s `ticket.confidenceScore`; clamped to [0, 1] via `clamp()`; default 0.5 if not a number.

---

## SECTION 8 — VERIFICATION LOGIC

### Inputs to verification

- **originalTranscript:** Full corrected transcript, trimmed, then sliced to 1500 characters in the user message.
- **instructions:** Array from Stage 1.
- **tickets:** `pipelineTickets` from Stage 2–3. Pairs are formed as `instructions.slice(0, min(instructions.length, tickets.length))` with `tickets[i]` so that each pair is (instruction, ticket) by index.

### How needsClarification is determined

- The verifier model returns for each pair: `isAccurate`, `isActionable`, `needsClarification`, `confidence`. The route uses only `needsClarification` and `confidence`.
- **Route:** `anyNeedsClarification = verifications.some((v) => v.needsClarification)`. If true, the route returns with `needsClarification: true`, no tickets, and `verificationIssues` set (e.g. “Ticket N: may not match intent or is not actionable” for each verification with needsClarification).

### How inaccurate tickets are blocked

- If any verification has `needsClarification === true`, the entire response is treated as “needs clarification”: the route does **not** return the tickets. So any ticket that the verifier flags as wrong, vague, or hallucinated blocks all tickets for that request. There is no per-ticket filtering; it is all-or-nothing.

---

## SECTION 9 — PERFORMANCE

### AI calls per feedback submission

- **Per submission:** Exactly **3** OpenAI `chat.completions.create` calls when the pipeline runs to completion:
  1. Segmentation (1 call).
  2. Intent + tickets (1 batched call for all instructions).
  3. Verification (1 batched call for all instruction–ticket pairs).

- If segmentation returns needsClarification or empty instructions: **1** call (segmentation only).  
- If intent+tickets returns no tickets: **2** calls (segmentation + batch).  
- No parallelization between these three; they run sequentially in the route.

### Sequencing and batching

- **Sequential:** Stage 1 → Stage 2–3 → Stage 4. Each stage waits for the previous.
- **Batch:** Stages 2–3 are one call for all instructions; Stage 4 is one call for all pairs. No per-instruction or per-ticket API calls.

### Latency

- No server-side metrics or logging of per-stage or total latency in the codebase.
- **Approximate:** 3 × gpt-4o-mini latency (segmentation ~800 tokens, intent+tickets ~2000, verification ~1000). Client timeout 25s for the whole request; if exceeded, client aborts and no tickets are shown.

---

## SECTION 10 — KNOWN LIMITATIONS

- **Instruction segmentation reliability:** Vague detection is regex-based before the LLM; the model can still return empty instructions or set needsClarification inconsistently. Long or complex transcripts may be split suboptimally (no explicit length handling).
- **Context loss in long transcripts:** Verification user message truncates transcript to 1500 characters; very long feedback may lose context for later instructions.
- **No DOM-level targeting:** Pipeline uses only transcript and visibleText (OCR). No `domPath`, `nearbyText`, or screenshot; targeting is textual only.
- **Screenshot not in AI path:** Screenshot is uploaded and stored but never sent to any model; no vision-based understanding.
- **Model hallucination:** Verification is the only guard; if the verifier is permissive, invented details can still reach tickets. No fact-check against DOM or screenshot.
- **All-or-nothing verification:** One bad ticket causes all tickets to be dropped; no partial success.
- **No retries:** Transient API or network failures result in a single “Structuring failed” response.
- **Dashboard without context:** Dashboard sends only transcript to structure-feedback, so anchoring and intent/ticket stage never see visibleText for dashboard-originated feedback.
- **Dual clarity thresholds:** Extension uses clarityScore ≤ 20 for hard block; dashboard uses &lt; 60. Inconsistent product behavior.
- **Intent extraction unused in main pipeline:** `lib/server/intentExtraction.ts` defines a different intent schema and is not called from `app/api/structure-feedback/route.ts`; it appears legacy or for another path.

---

## SECTION 11 — COMPLETE FILE MAP

| File | Responsibility |
|------|----------------|
| `app/api/structure-feedback/route.ts` | Entry point: auth, rate limit, body parsing, proper-noun anchoring, orchestration of stages 1–4, response shaping (tickets vs clarity), error handling. |
| `lib/server/instructionSegmentation.ts` | Stage 1: instruction segmentation and vague detection; single LLM call; returns instructions + needsClarification. |
| `lib/server/pipelineStages.ts` | Stages 2–3: batched intent + ticket generation; single LLM call; defines PipelineTicket and InstructionIntent; normalization and fallbacks. |
| `lib/server/ticketVerification.ts` | Stage 4: batch verification of (instruction, ticket) pairs; single LLM call; returns VerificationResult[]. |
| `lib/server/properNounAnchoring.ts` | Pre-pipeline: corrects transcript using OCR visibleText (phrase- and token-level anchoring); no AI. |
| `lib/server/intentExtraction.ts` | Legacy/alternate intent extraction (different intent types/categories). Not used by structure-feedback route. |
| `lib/authFetch.ts` | Client-side authenticated fetch; 25s default timeout; used by dashboard for structure-feedback. |
| `lib/repositories/feedbackRepository.ts` | Persists feedback including clarityScore, clarityStatus, clarityIssues, clarityConfidence. |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Dashboard UI: calls structure-feedback (transcript only), handles clarity modal, buildClarityStatus (85/60), block at clarityScore &lt; 60, “Use Suggestion” / “Submit Anyway”. |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedback.ts` | Can call structure-feedback with transcript only. |
| `echly-extension/src/content.tsx` | Extension: builds context (visibleText from OCR, url), calls structure-feedback with transcript + context; clarity guard at clarityScore ≤ 20; needsClarification handling; clarity assistant UI. |
| `echly-extension/src/background.ts` | Can call structure-feedback with `{ transcript, context }` when context exists. |
| `app/api/session-insight/route.ts` | Separate feature: generates session summary from feedback list using gpt-4o-mini; not part of the feedback→ticket pipeline. |

---

*End of technical report. All details above reflect the implementation as of the codebase state analyzed.*
