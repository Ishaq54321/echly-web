# Echly Feedback Pipeline — Architecture Inspection Report

**Scope:** Deep inspection of feedback flow from voice capture to ticket generation. No code modified.

---

## STEP 1 — Entry Points

### Where feedback processing begins

| Entry point | File(s) | What is first received |
|------------|---------|--------------------------|
| **Transcript** | `app/api/structure-feedback/route.ts` (`POST`) | `body.transcript` (string) from request JSON. |
| **Screenshot** | `app/api/upload-screenshot/route.ts` (`POST`) | `body.imageDataUrl`, `body.sessionId`, `body.feedbackId`. Screenshot is stored to Firebase Storage; **no transcript or pipeline processing** in this route. |
| **Page context** | `app/api/structure-feedback/route.ts` (`POST`) | `body.context` (optional). Normalized to `PipelineContext` via `normalizeContext()` in the same file. |

### Callers that send transcript + context to structure-feedback

1. **Browser extension (content script)**  
   - **File:** `echly-extension/src/content.tsx`  
   - Sends `{ transcript, context: enrichedContext }` to `POST /api/structure-feedback`.  
   - Context is enriched with `visibleText` from screenshot OCR when a screenshot exists.

2. **Browser extension (background)**  
   - **File:** `echly-extension/src/background.ts`  
   - On `ECHLY_PROCESS_FEEDBACK`: sends `{ transcript, context }` to `POST /api/structure-feedback` (no screenshot in this path; used when content-script path fails or as fallback).

3. **Dashboard (web app)**  
   - **File:** `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`  
   - `handleTranscript()` calls `authFetch("/api/structure-feedback", { body: JSON.stringify({ transcript, context }) })`.

### Speech capture (transcript origin)

- **File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
- **Functions:** `startListening()` (starts capture), `recognition.onresult` (accumulates transcript).  
- Uses `window.SpeechRecognition` or `window.webkitSpeechRecognition`; transcript is stored in recording state and then passed to the dashboard’s `onComplete(transcript, screenshot, …)` or the extension’s equivalent.  
- **No dedicated `speechCapture.ts`;** speech is captured inside the CaptureWidget hook.

### Upload-screenshot role

- **File:** `app/api/upload-screenshot/route.ts`  
- **Function:** `POST()` — only uploads image to Firebase Storage and returns a download URL.  
- **Does not** receive or process transcript. Screenshot URL is later attached to feedback when the client calls `POST /api/feedback` with `screenshotUrl`.

---

## STEP 2 — Pipeline Trace (structure-feedback)

Flow is linear inside `app/api/structure-feedback/route.ts` (POST), with one fallback branch.

1. **Request:** `transcript` (required), `context` (optional).
2. **Context:** `normalizeContext(body.context)` → `PipelineContext | null`.
3. **Transcript normalization chain (in order):**
   - `anchorProperNouns(transcript, ctx?.visibleText ?? null)` → proper-noun correction from OCR.
   - `normalizeUiVocabulary(...)` → UI term fixes (e.g. summit→submit, model→modal).
   - `normalizeSpeechTranscript(...)` → deterministic STT fixes (e.g. "below 8"→"below it").
   - `normalizeTranscriptWithAI(client, ...)` → AI-based STT/grammar cleanup.
4. **Instruction extraction:** `extractStructuredInstructions(client, normalizedTranscript, ctx)` → `ExtractedInstruction[]`.
5. **Instruction strings:** `extractedToInstructionStrings(extractedList)` → string list used for refinement and verification.
6. **Refinement:** `refineInstructions(client, segmentedInstructions)` → split compound instructions; output is string list again.
7. **Instruction limit:** `instructions.slice(0, MAX_INSTRUCTIONS)` (12).
8. **Instruction graph:** `buildInstructionGraph({ structuredInstructions: extractedList.slice(0, 12), context, transcript })` — uses **structured** extraction only (no string re-parsing for entity).
9. **Tickets from graph:** `ticketsFromGraph(graph)` → `PipelineTicket[]`.
10. **Fallback (if graph yields no tickets):** `mapInstructionsToOntology` → `batchIntentAndTicketsFromOntology` → ontology-based tickets.
11. **Verification:** `verifyTicketsBatch(client, normalizedTranscript, instructions, pipelineTickets)` then `applyVerifierFinalDecision(...)`.
12. **Filter:** Keep only tickets that pass verification; return valid tickets (and optional warnings) in the API response.

After structure-feedback, the **client** (extension or dashboard) calls `POST /api/feedback` once per ticket with `title`, `description`, `actionSteps`, `suggestedTags`, `screenshotUrl`, etc. **Database storage** happens only in `POST /api/feedback` via `addFeedbackWithSessionCountersRepo`.

---

## STEP 3 — Core Functions by Stage

| Stage | File | Function | Purpose |
|-------|------|----------|---------|
| **1 — Speech capture** | `components/CaptureWidget/hooks/useCaptureWidget.ts` | `startListening()`, `recognition.onresult` | Start mic, accumulate transcript in recording state. |
| **2 — Entry (transcript + context)** | `app/api/structure-feedback/route.ts` | `POST()` | Receive transcript and context; run full pipeline; return tickets/clarity. |
| **2b — Screenshot upload only** | `app/api/upload-screenshot/route.ts` | `POST()` | Store screenshot in Firebase Storage; return URL. |
| **3 — Proper noun anchoring** | `lib/server/properNounAnchoring.ts` | `anchorProperNouns(transcript, visibleText)` | Align transcript proper nouns with OCR visible text. |
| **4 — UI vocabulary normalization** | `lib/server/uiVocabularyNormalization.ts` | `normalizeUiVocabulary(transcript)` | Fix STT→UI terms (summit→submit, model→modal, etc.). |
| **5 — Speech normalization** | `lib/server/speechNormalization.ts` | `normalizeTranscript(transcript)` | Deterministic STT fixes (e.g. "below 8"→"below it"). |
| **6 — Transcript normalization (AI)** | `lib/server/transcriptNormalization.ts` | `normalizeTranscript(client, transcript, options)` | Fix STT/grammar with GPT, preserve intent. |
| **7 — AI instruction extraction** | `lib/server/instructionExtraction.ts` | `extractStructuredInstructions(client, transcript, context, options)` | Produce structured instructions (intent, entity, action, confidence). |
| **8 — Instruction strings** | `lib/server/instructionExtraction.ts` | `extractedToInstructionStrings(extractedList)` | Derive "entity: action" / "action" strings for refinement and verification. |
| **9 — Instruction refinement** | `lib/server/instructionRefinement.ts` | `refineInstructions(client, instructions)` | Split compound instructions; one instruction = one developer action. |
| **10 — Instruction graph** | `lib/server/instructionGraph.ts` | `buildInstructionGraph({ structuredInstructions, context, transcript })` | Build graph from structured extraction (entity preserved; no re-parse). |
| **11 — Ticket generation (primary)** | `lib/server/instructionGraph.ts` | `ticketsFromGraph(graph)` | Convert graph to one merged `PipelineTicket` (title, description, actionSteps, tags). |
| **12 — Ontology fallback** | `lib/server/instructionOntology.ts` | `mapInstructionsToOntology(client, instructions, context, options)` | Map instruction strings to ontology actions. |
| **12b — Ontology tickets** | `lib/server/pipelineStages.ts` | `batchIntentAndTicketsFromOntology(client, actions, context, options)` | Generate tickets from ontology actions when graph yields none. |
| **13 — Verification** | `lib/server/ticketVerification.ts` | `verifyTicketsBatch(client, transcript, instructions, tickets)` | AI check: ticket reflects instructions, actionable, no hallucination. |
| **14 — Verifier decision** | `lib/server/ticketVerification.ts` | `applyVerifierFinalDecision(rawVerifications, options)` | Override verifier when instructionCount > 0 or segmentation is clear. |
| **15 — Ticket persistence** | `app/api/feedback/route.ts` | `POST()` → `addFeedbackWithSessionCountersRepo()` | Validate body, then write to Firestore via repository. |
| **16 — Database write** | `lib/repositories/feedbackRepository.ts` | `addFeedbackWithSessionCountersRepo(sessionId, userId, data)` | Transaction: create feedback doc and update session counters. |
| **17 — Serialization** | `lib/server/serializeFeedback.ts` | `serializeTicket(ticket)` (used by GET/POST feedback API) | Map Feedback to API response shape (e.g. createdAt to ISO). |

---

## STEP 4 — Extracted Instruction Data Structure

The system uses the following **structured** shape from extraction (used by the instruction graph and elsewhere):

```ts
// lib/server/instructionExtraction.ts
interface ExtractedInstruction {
  intent: ExtractionIntent;  // e.g. "UI_LAYOUT" | "COPY_CHANGE" | ...
  entity: string;            // e.g. "hero image", "signup button"
  action: string;             // concrete change description
  confidence: number;         // 0–1
}
```

- **Intent** is one of: `UI_LAYOUT`, `UI_VISUAL_ADJUSTMENT`, `FORM_LOGIC`, `DATA_VALIDATION`, `PERFORMANCE_OPTIMIZATION`, `ANALYTICS_TRACKING`, `BACKEND_BEHAVIOR`, `COPY_CHANGE`, `SECURITY_REQUIREMENT`, `GENERAL_INVESTIGATION`.
- The **instruction graph** uses this structure directly: `buildInstructionGraph({ structuredInstructions: extractedList.slice(0, MAX_INSTRUCTIONS), ... })`. Entity is not re-parsed from strings; it is taken from `instruction.entity`.

The **string** representation used for refinement and verification is produced by `extractedToInstructionStrings()`: format `"entity: action"` when entity is meaningful, else `"action"` only.

---

## STEP 5 — Instruction Graph Construction

- **File:** `lib/server/instructionGraph.ts`  
- **Function:** `buildInstructionGraph(input: BuildInstructionGraphInput): BuildInstructionGraphResult`

**Input:**

- `structuredInstructions: ExtractedInstruction[]` (from extraction; entity preserved).
- `context: PipelineContext | null`
- `transcript?: string | null` (kept for compatibility; not used for entity inference).

**Logic:**

- For each `ExtractedInstruction`:
  - `entity` → normalized element key (or `null` if empty/generic like "unknown"/"page"/"this").
  - One **TargetNode** per distinct element key; one **ActionNode** per instruction.
- ActionNode fields: `action_type := instruction.intent`, `details: { summary: instruction.action }`, `confidence := instruction.confidence`.
- Nodes are grouped by `normalizeElementKey(entity)`; ungrouped instructions go to a single target with `element: null`.

**Output:** `{ graph: InstructionGraph, needsClarification }`.  
Ticket generation: `ticketsFromGraph(graph)` builds **one** merged `PipelineTicket` (title from targets, description from primary target, actionSteps from all actions with confidence ≥ 0.5, tags `["Feedback"]`).

---

## STEP 6 — Ticket Generation

### Primary path (graph)

- **File:** `lib/server/instructionGraph.ts`  
- **Function:** `ticketsFromGraph(graph: InstructionGraph): PipelineTicket[]`

**Derivation:**

- **title:** `generateTitleFromTargets(graph.targets)` — from element names (e.g. "Hero layout adjustments", "Layout and content adjustments").
- **description:** Fixed pattern: `"Requested changes for {primaryTarget}."` (primaryTarget from first target or "layout").
- **actionSteps:** From each action’s `details.summary` (or `action_type` if no summary), excluding `action_type === "UNKNOWN"` and `confidence < 0.5`.
- **tags:** Always `["Feedback"]`.
- **confidenceScore:** Average of action confidences.

Returns a single-element array `[ticket]`.

### Fallback path (ontology)

- **File:** `lib/server/pipelineStages.ts`  
- **Function:** `batchIntentAndTicketsFromOntology(client, actions, context, { instructions, retryOnce })`

**Derivation:** One merged ticket from ontology actions; title/description/actionSteps/tags from AI response, normalized by `normalizeSingleTicketFromOntology()`; actionSteps fallback to `instructions` or to titles derived from actions.

### Persistence (title/description/actionSteps/tags)

- **File:** `app/api/feedback/route.ts` (POST)  
- Client sends `title`, `description`, `actionSteps`, `suggestedTags`, etc.  
- **Function:** Builds `structuredData` and calls `addFeedbackWithSessionCountersRepo(sessionId, user.uid, structuredData)`.  
- **File:** `lib/repositories/feedbackRepository.ts` — `feedbackPayload()` maps to Firestore document; `addFeedbackWithSessionCountersRepo` runs a transaction (create feedback doc + update session counters).

---

## STEP 7 — Full Pipeline Diagram

```
ECHLY FEEDBACK PIPELINE

1  Speech capture
   components/CaptureWidget/hooks/useCaptureWidget.ts
   startListening() / recognition.onresult

2  Transcript + context entry
   app/api/structure-feedback/route.ts  POST()
   (Screenshot: app/api/upload-screenshot/route.ts  POST() — storage only)

3  Proper noun anchoring
   lib/server/properNounAnchoring.ts  anchorProperNouns()

4  UI vocabulary normalization
   lib/server/uiVocabularyNormalization.ts  normalizeUiVocabulary()

5  Speech normalization (deterministic)
   lib/server/speechNormalization.ts  normalizeTranscript()

6  Transcript normalization (AI)
   lib/server/transcriptNormalization.ts  normalizeTranscript()

7  AI instruction extraction
   lib/server/instructionExtraction.ts  extractStructuredInstructions()

8  Instruction strings (for refinement + verification)
   lib/server/instructionExtraction.ts  extractedToInstructionStrings()

9  Instruction refinement
   lib/server/instructionRefinement.ts  refineInstructions()

10 Instruction graph construction
    lib/server/instructionGraph.ts  buildInstructionGraph()

11 Ticket generation (primary)
    lib/server/instructionGraph.ts  ticketsFromGraph()
    (Fallback: lib/server/instructionOntology.ts + pipelineStages.ts  batchIntentAndTicketsFromOntology())

12 Verification
    lib/server/ticketVerification.ts  verifyTicketsBatch()
    lib/server/ticketVerification.ts  applyVerifierFinalDecision()

13 Ticket persistence (API)
    app/api/feedback/route.ts  POST()

14 Database storage
    lib/repositories/feedbackRepository.ts  addFeedbackWithSessionCountersRepo()
```

---

## STEP 8 — Weak Points and Risks

1. **Two parallel representations after extraction**  
   - Structured `ExtractedInstruction[]` is used for the graph.  
   - `extractedToInstructionStrings()` produces strings used for refinement and verification.  
   - Refinement returns **new** strings; the graph still uses the **original** structured list (sliced). So refined instructions can diverge from what the graph was built from (e.g. more steps after refinement, but graph node count fixed by extraction). Refinement does not update the structured list or the graph.

2. **Redundant / overlapping normalization**  
   - Four transcript normalization steps (proper noun, UI vocab, speech, AI) are applied in sequence. Some overlap (e.g. "sign of" could be caught by speech normalization or AI). Order is intentional but adds latency and complexity.

3. **Verification uses string instructions**  
   - `verifyTicketsBatch(client, normalizedTranscript, instructions, pipelineTickets)` receives `instructions` (refined strings), not the structured extraction. Verifier does not see entity/intent/confidence explicitly; only the merged ticket and instruction strings.

4. **Single merged ticket**  
   - `ticketsFromGraph()` always returns one ticket. Multiple distinct targets are folded into one title/description/actionSteps list. If product needs one ticket per target, this would require a design change.

5. **Fallback path duplicates concept**  
   - When the graph yields no tickets, ontology path runs: instructions (strings) → ontology actions → ontology ticket. So two different paths can produce tickets (graph vs ontology) with slightly different semantics and no single “source of truth” for structure.

6. **String handling in verification**  
   - Verification prompt builds a single block of text (transcript + instructions + ticket). No structured fields; model must infer alignment. Minor risk of instruction order or formatting affecting result.

7. **Session/counters**  
   - Session counters (openCount, resolvedCount, etc.) are updated in the same transaction as feedback creation. If session doc is missing or schema changes, feedback creation can fail.

---

## STEP 9 — Summary

- **Real pipeline structure:**  
  Entry is **structure-feedback** (transcript + context). Upload-screenshot is **storage-only**. Pipeline is: normalize transcript (anchoring → UI vocab → speech → AI) → extract structured instructions → derive instruction strings → refine (strings) → build graph from **structured** extraction → generate one ticket from graph → (if no tickets) ontology fallback → verify tickets → return. Client then calls **feedback** API to persist each ticket.

- **Entities remain structured through the graph:**  
  Yes. The instruction graph is built from `ExtractedInstruction[]`; `entity` is used directly for target grouping. No re-parsing of "entity: action" strings for graph building.

- **Instruction graph and extraction output:**  
  The graph **does** use the extraction output directly: `structuredInstructions: extractedList.slice(0, MAX_INSTRUCTIONS)` is passed to `buildInstructionGraph()`. Refined **strings** are used for verification and for the ontology fallback, not for building the graph.

- **Suggested improvements (architecture only):**  
  - Align refinement with graph: either refine structured instructions and re-build graph, or make refinement only for verification/display and keep graph strictly from extraction.  
  - Consider a single “ticket source” (e.g. always graph; ontology only as input to graph or removed).  
  - Optionally pass structured instructions (or a digest) into verification for consistency.  
  - Document or simplify the order and responsibility of each normalization step to avoid overlap and aid tuning.

---

*Report generated from codebase inspection. No code was modified.*
