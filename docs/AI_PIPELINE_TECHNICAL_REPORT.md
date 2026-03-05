# Echly AI Pipeline — Technical Documentation for External Audit

**Purpose:** Complete technical documentation of the AI pipeline for external AI architects to audit and improve the system.  
**Scope:** Pipeline architecture, every LLM call, prompt design, instruction extraction, entity resolution, ticket generation, verification, error handling, metrics, and file map.

---

## SECTION 1 — Pipeline Overview

The pipeline is organized into five layers. Each stage has a single responsibility; AI is used only where indicated.

```
Capture
   ↓
Perception
   ↓
Understanding
   ↓
Structuring
   ↓
Output
```

### 1. Capture

**What it does:** Collects raw signals from the client: transcript (voice or text), optional screenshot, and context (DOM, viewport, text near capture point). No AI.

**Implementation:**
- **Entry:** `POST /api/structure-feedback` receives `{ transcript, context }`.
- **File:** `app/api/structure-feedback/route.ts` — validates body, delegates to `runFeedbackPipeline(client, { transcript, context }, options)`.
- **Normalization:** `lib/ai/runFeedbackPipeline.ts` — `normalizeInput(raw)` and `normalizeContext(raw)` turn the request into `PipelineCapture`: `{ transcript: string, context: PipelineContext | null }`.
- **Context shape:** `context` may include `url`, `viewportWidth`, `viewportHeight`, `scrollX`, `scrollY`, `devicePixelRatio`, `domPath`, `nearbyText`, `visibleText`, `screenshotOCRText`, `subtreeText`, and element arrays (`elements`, `visibleElements`, `interactiveElements`, `formFields`, `buttons`, `headings`).

### 2. Perception

**What it does:** Cleans and prepares signals. Mostly deterministic; one optional AI call for transcript normalization.

**Steps (in order):**
1. **Proper noun anchoring** — Align transcript phrases to OCR/visible text (e.g. fix “sign of form” → “signup form” using visible text).  
   **File:** `lib/server/properNounAnchoring.ts` — `anchorProperNouns(transcript, visibleText)`.
2. **UI vocabulary normalization** — Map known STT mishearings (summit→submit, model→modal, etc.).  
   **File:** `lib/server/uiVocabularyNormalization.ts` — `normalizeUiVocabulary(transcript)`.
3. **Speech normalization** — Deterministic fixes (e.g. “below 8” → “below it”).  
   **File:** `lib/server/speechNormalization.ts` — `normalizeTranscript(transcript)`.
4. **Clause splitting** — Split transcript into clauses (no AI).  
   **File:** `lib/server/clauseSplitter.ts` — `splitTranscriptIntoClauses(transcript)`.
5. **Grounding** — Pre-detect entities/actions per clause by matching against DOM phrases (no AI, &lt;2ms).  
   **File:** `lib/server/groundTranscriptClauses.ts` — `groundTranscriptClauses({ clauses, domPhrases })`; `domPhrases` from `lib/server/pipelineContext.ts` — `getDomPhrasesFromContext(context)`.
6. **Optional AI transcript normalization** — Fix STT/grammar via LLM; preserve intent.  
   **File:** `lib/server/transcriptNormalization.ts` — `normalizeTranscript(client, transcript)`.  
   **Controlled by:** `useTranscriptNormalization` (default **false** in structure-feedback).
7. **Spatial context build** — Build full spatial context from context fields.  
   **File:** `lib/ai/spatial-context-builder.ts` — `buildSpatialContext(input)` → `SpatialContext` (domScopeText, nearbyScopeText, viewportScopeText, screenshotOCRText).
8. **Token budget truncation** — Truncate spatial context for the extraction model only.  
   **File:** `lib/ai/pipelineTokenBudget.ts` — `truncateSpatialContext(fullSpatialContext)`.

**Orchestration:** `lib/ai/runFeedbackPipeline.ts` — `runPerceptionLayer(capture, options)` returns `PerceptionOutput`: `normalizedTranscript`, `spatialContext` (truncated), `fullSpatialContext`, `context`, `groundedClauses`.

### 3. Understanding

**What it does:** Primary AI stage: extract structured instructions (intent, entity, action, confidence). Then deterministic copy correction and entity resolution.

**Steps:**
1. **Context filtering** — For extraction only, prioritize context lines relevant to the transcript.  
   **File:** `lib/ai/contextFilter.ts` — `filterRelevantContext(transcript, spatialContext)`.
2. **Instruction extraction (AI)** — Convert transcript into structured instructions.  
   **File:** `lib/server/instructionExtraction.ts` — `extractStructuredInstructions(client, transcript, context, { spatialContext, groundedClauses })` → `{ instructions: ExtractedInstruction[], needsClarification }`.  
   **Model:** gpt-4o, temperature 0, max_tokens 1600.
3. **Copy correction** — For `COPY_CHANGE` instructions, replace STT-error phrases with best fuzzy match from spatial context (dom → nearby → viewport → ocr).  
   **File:** `lib/ai/copy-correction.ts` — `correctCopyInInstructions(instructions, fullSpatialContext)`.
4. **Entity resolution** — Resolve vague entity phrases to concrete text from spatial context (same priority order; fuzzy + spatial + hierarchy scoring).  
   **File:** `lib/ai/element-resolver.ts` — `resolveInstructionsEntities(instructions, fullSpatialContext, { context, transcript })`.
5. **Action normalization** — Deterministic rules to normalize vague actions (e.g. “spacing feels tight” → “increase spacing”).  
   **File:** `lib/server/instructionExtraction.ts` — `normalizeInstructionActions(instructions)`.
6. **Optional refinement (AI)** — Only when `hasCompoundInstructions(instructions)` is true: split compound instructions so each is one developer action.  
   **File:** `lib/server/instructionRefinement.ts` — `refineStructuredInstructions(client, instructions)`.  
   **Model:** gpt-4o-mini, temperature 0, max_tokens 2000.

**Orchestration:** `lib/ai/runFeedbackPipeline.ts` — `runUnderstandingLayer(client, perception, { metrics })` returns `UnderstandingOutput`: `instructions`, `needsClarification`, `segmentConfidence`.

### 4. Structuring

**What it does:** Build an instruction graph from structured instructions and turn it into one pipeline ticket. No AI. No ontology fallback in the current main path (ontology exists but is only used when graph yields no tickets).

**Steps:**
1. **Cap instructions** — `MAX_INSTRUCTIONS = 12`; slice and set `instructionLimitWarning` if over.
2. **Build graph** — Group instructions by entity; each instruction becomes one action on a target node.  
   **File:** `lib/server/instructionGraph.ts` — `buildInstructionGraph({ structuredInstructions, context, transcript })` → `{ graph, needsClarification }`.
3. **Tickets from graph** — One ticket per entity; titles from single `generateTicketTitlesBatch(client, tickets)` call; action steps from graph actions (confidence ≥ 0.5).  
   **File:** `lib/server/instructionGraph.ts` — `ticketsFromGraph(graph, instructions)`; **File:** `lib/ai/ticketTitle.ts` — `generateTicketTitlesBatch(client, tickets)`.

**Orchestration:** `lib/ai/runFeedbackPipeline.ts` — `runStructuringLayer(understanding, perception, context)` returns `StructuringOutput`: `graph`, `tickets`, `refinedInstructions`, `instructionLimitWarning`, `graphNeedsClarification`.

### 5. Output

**What it does:** Optional verification (AI), filtering of tickets by verification result, clarity scoring, and stable API response.

**Steps:**
1. **Early exits** — If no instructions/tickets: return clarity-style response (e.g. suggestedRewrite, needsClarification). If graph produced no tickets but instructions exist: return needsClarification, no ontology in current flow.
2. **Verification (optional AI)** — When `useVerification` is true: verify the single ticket against transcript and all instruction strings.  
   **File:** `lib/server/ticketVerification.ts` — `verifyTicketsBatch(client, transcript, instructionStrings, tickets)` → `VerificationResult[]`.  
   **Model:** gpt-4o-mini, temperature 0, max_tokens 1500.
3. **Verifier overrides** — Apply business rules so valid instructions don’t incorrectly trigger clarification.  
   **File:** `lib/server/ticketVerification.ts` — `applyVerifierFinalDecision(rawVerifications, options)` (e.g. if instructionCount &gt; 0: force isActionable=true, needsClarification=false).
4. **Filter** — Keep only tickets where `isAccurate && isActionable && !needsClarification`.
5. **Response** — Build final payload: `success`, `tickets` (title, actionSteps, suggestedTags, confidenceScore), `clarityScore`, `clarityIssues`, `suggestedRewrite`, `confidence`, `needsClarification`, `verificationIssues`, `verificationWarnings`, `instructionLimitWarning`, `extractedInstructions`.

**Orchestration:** `lib/ai/runFeedbackPipeline.ts` — `runOutputLayer(client, structuring, understanding, perception, options)`.

### End-to-end entry

**File:** `lib/ai/runFeedbackPipeline.ts` — `runFeedbackPipeline(client, input, options)` runs:  
`normalizeInput` → `runPerceptionLayer` → `runUnderstandingLayer` → `runStructuringLayer` → `runOutputLayer`, then logs pipeline metrics.

---

## SECTION 2 — AI Calls

Every OpenAI (LLM) call in the system, with file, function, model, temperature, max tokens, input payload, and output format.

### 2.1 Transcript normalization

| Field | Value |
|-------|--------|
| **File** | `lib/server/transcriptNormalization.ts` |
| **Function** | `normalizeTranscript` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **Max tokens** | 500 |
| **Input** | System: NORMALIZATION_SYSTEM. User: `"Normalize this transcript:\n\n\"${trimmed}\""`. |
| **Output** | Plain normalized transcript string (or original on failure). |

**When used:** Only when `useTranscriptNormalization === true` (default false in structure-feedback).

---

### 2.2 Instruction extraction

| Field | Value |
|-------|--------|
| **File** | `lib/server/instructionExtraction.ts` |
| **Function** | `extractStructuredInstructions` |
| **Model** | gpt-4o |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 1600 |
| **Input** | System: EXTRACTION_SYSTEM_PROMPT. User: `buildUserContent(transcript, context, spatialContext, groundedClauses)` — transcript, optional grounded-clause hints, spatial context (DOM / nearby / viewport / OCR), text context, known UI elements. |
| **Output** | JSON `{ "instructions": [ { "intent", "entity", "action", "confidence" }, ... ] }`. Parsed to `ExtractionResult`; fallback `{ instructions: [], needsClarification: true }` on parse failure. |

---

### 2.3 Instruction refinement (structured)

| Field | Value |
|-------|--------|
| **File** | `lib/server/instructionRefinement.ts` |
| **Function** | `refineStructuredInstructions` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 2000 |
| **Input** | System: STRUCTURED_REFINEMENT_SYSTEM. User: "Structured instructions to refine (split compounds; output same JSON shape):" + JSON.stringify(instructions, null, 2). |
| **Output** | JSON `{ "instructions": [ { "intent", "entity", "action", "confidence" }, ... ] }`. On parse failure returns original instructions. |

---

### 2.4 Instruction refinement (string-based, deprecated)

| Field | Value |
|-------|--------|
| **File** | `lib/server/instructionRefinement.ts` |
| **Function** | `refineInstructions` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 1500 |
| **Input** | System: REFINEMENT_SYSTEM. User: "Instructions to refine (one per line):" + numbered list of instruction strings. |
| **Output** | JSON `{ "instructions": string[] }`. Not used by main pipeline. |

---

### 2.5 Instruction ontology

| Field | Value |
|-------|--------|
| **File** | `lib/server/instructionOntology.ts` |
| **Function** | `mapInstructionsToOntology` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 3000 |
| **Input** | System: ONTOLOGY_SYSTEM. User: DOM elements + visible text + instructions list (from `buildUserContent(instructions, context)`). |
| **Output** | JSON `{ "actions": [ { "action_type", "target_element", "change_details", "confidence" } ], "needsClarification" }`. Used only when graph yields no tickets (ontology fallback). |

---

### 2.6 Batch intent and tickets from ontology

| Field | Value |
|-------|--------|
| **File** | `lib/server/pipelineStages.ts` |
| **Function** | `batchIntentAndTicketsFromOntology` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 2500 |
| **Input** | System: TICKET_FROM_ONTOLOGY_SYSTEM. User: ontology actions JSON + instructions + UI elements + visible text. |
| **Output** | JSON with single `ticket` object (title, actionSteps, tags, confidenceScore). Normalized to `PipelineTicket[]`; fallback from ontology actions if parse fails. |

---

### 2.7 Batch intent and tickets (from instruction strings)

| Field | Value |
|-------|--------|
| **File** | `lib/server/pipelineStages.ts` |
| **Function** | `batchIntentAndTickets` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 2500 |
| **Input** | System: INTENT_AND_TICKET_SYSTEM. User: instructions list + UI elements + visible text. |
| **Output** | JSON with `intents` array and single `ticket` object. Used in ontology fallback path when merging ticket from instructions. |

---

### 2.8 Ticket verification

| Field | Value |
|-------|--------|
| **File** | `lib/server/ticketVerification.ts` |
| **Function** | `verifyTicketsBatch` |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **top_p** | 1 |
| **Max tokens** | 1500 |
| **Input** | System: VERIFICATION_SYSTEM. User: original transcript (trimmed, slice 0–1500) + numbered instructions + ticket title and action steps JSON. |
| **Output** | JSON `{ "verification": { "isAccurate", "isActionable", "needsClarification", "confidence" } }`. One result per batch (single merged ticket). Conservative fallback on failure: isAccurate/isActionable false, needsClarification true, confidence 0.5. |

---

### 2.9 Session insight

| Field | Value |
|-------|--------|
| **File** | `app/api/session-insight/route.ts` |
| **Function** | Inline `client.chat.completions.create` after loading session feedback. |
| **Model** | gpt-4o-mini |
| **Temperature** | 0 |
| **Max tokens** | 160 |
| **Input** | System: SESSION_INSIGHT_SYSTEM_PROMPT. User: condensed lines per feedback (title, context, tags, action steps), up to 200 items. |
| **Output** | Plain text summary (3 sentences, 90–120 words) or null. Cached in session when feedback count unchanged. |

---

### 2.10 Unused by main pipeline

- **`lib/server/intentExtraction.ts`** — `extractIntent`: gpt-4o-mini, 300 tokens. Single-intent extraction. Not called by any route.
- **`lib/server/instructionSegmentation.ts`** — `segmentInstructions`: gpt-4o, 1200 tokens. String-based segmentation. Not used by structure-feedback (pipeline uses instructionExtraction instead).

---

## SECTION 3 — Prompt Design

Exact prompts for instruction extraction, instruction refinement, and verification.

### 3.1 Instruction extraction

**System prompt** (`EXTRACTION_SYSTEM_PROMPT` in `lib/server/instructionExtraction.ts`):

- Role: Convert spoken UI feedback into structured product tickets. Inputs: transcript, page context (visible text, DOM text, nearby UI labels). Do not summarize.
- Per instruction: **Intent** (one of COPY_CHANGE | UI_LAYOUT | UI_VISUAL_ADJUSTMENT | COMPONENT_CHANGE | FORM_LOGIC | DATA_VALIDATION | PERFORMANCE_OPTIMIZATION | ANALYTICS_TRACKING | BACKEND_BEHAVIOR | SECURITY_REQUIREMENT | GENERAL_INVESTIGATION), **Entity** (specific UI element), **Action** (clear, developer-actionable), **Confidence** (0.0–1.0).
- **RULE 1 — Entity:** Prefer transcript entities; infer from page context only when ambiguous. Avoid vague entities (e.g. "page", "design", "element").
- **RULE 2 — Action:** Precise and actionable (e.g. "change button color from green to blue" not "improve the button").
- **RULE 3 — Split multiple changes:** One instruction per change; do not merge unrelated changes.
- **RULE 4 — Spatial context priority:** DOM scope → nearby → viewport → OCR. Resolve UI elements only from provided spatial context.
- Intent definitions and confidence rules (0.9+ when entity matched in DOM; &lt;0.7 when ambiguous).
- **Output format:** Valid JSON only, no markdown: `{ "instructions": [ { "intent", "entity", "action", "confidence" }, ... ] }`.

**User prompt:** Built by `buildUserContent(transcript, context, spatialContext, groundedClauses)`:
- "User feedback transcript:" + quoted transcript.
- If groundedClauses: "Pre-detected grounding hints" + per-clause entities, action, property, confidence.
- If spatial context: "Spatial context — resolve UI elements ONLY from these sources" + [DOM scope] (slice 1500) + [Nearby scope] (1000) + [Viewport scope] (2000) + [OCR fallback] if no viewport (1500).
- Additional visible text / known UI elements (from pipelineContext) when present.

**Expected JSON output:**

```json
{
  "instructions": [
    {
      "intent": "COPY_CHANGE | UI_LAYOUT | ...",
      "entity": "specific UI element",
      "action": "clear developer instruction",
      "confidence": 0.0
    }
  ]
}
```

---

### 3.2 Instruction refinement

**System prompt** (`STRUCTURED_REFINEMENT_SYSTEM` in `lib/server/instructionRefinement.ts`):

- Role: Echly Instruction Refiner. Ensure each instruction is exactly ONE developer-ready action. Input/output are structured (intent, entity, action, confidence).
- Rules: One instruction = one developer action; split compound instructions; preserve meaning; do not hallucinate; when splitting, assign intent per sub-instruction and give each entity/action/confidence.
- **Output format:** Strict JSON only, no markdown: `{ "instructions": [ { "intent", "entity", "action", "confidence" }, ... ] }`.

**User prompt:** "Structured instructions to refine (split compounds; output same JSON shape):" + JSON.stringify(instructions, null, 2).

**Expected JSON output:**

```json
{
  "instructions": [
    {
      "intent": "UI_VISUAL_ADJUSTMENT",
      "entity": "hero image",
      "action": "reduce the hero image size",
      "confidence": 0.9
    }
  ]
}
```

---

### 3.3 Verification

**System prompt** (`VERIFICATION_SYSTEM` in `lib/server/ticketVerification.ts`):

- Role: Echly Ticket Verifier. Validate ONE ticket (Title, Description, ActionSteps) against original transcript and instructions.
- **Check:** (1) Ticket reflects ALL instructions; (2) Action steps are implementable and developer-actionable; (3) No hallucination (no invented UI text, no copying page/OCR as requested change).
- **Clarity:** Set needsClarification true ONLY when ticket is wrong, hallucinated, or misses an instruction. Do NOT set for: correct UX diagnostic feedback, problem-statement-style instructions inferred into actionable steps, general but correct wording, conversational language ("maybe", "probably").
- **Verification result:** isAccurate, isActionable, needsClarification, confidence (0–1). Output: only valid JSON, one "verification" object (not array).

**User prompt:** Original transcript (slice 1500) + "Instructions (all should be reflected in the ticket):" (numbered) + "Ticket to verify (single merged ticket):" + Title + Action steps JSON.

**Expected JSON output:**

```json
{
  "verification": {
    "isAccurate": true,
    "isActionable": true,
    "needsClarification": false,
    "confidence": 0.9
  }
}
```

---

## SECTION 4 — Entity Resolution

Entity resolution maps vague or STT-noisy entity phrases (e.g. "that button", "this title") to concrete text from the page using spatial context and fuzzy matching.

### 4.1 Where it runs

- **Copy correction** (`lib/ai/copy-correction.ts`): For instructions with `intent === "COPY_CHANGE"`, replaces phrases in entity/action with best match from spatial context (e.g. "but tribes us" → "What Drives Us" from DOM).
- **Entity resolution** (`lib/ai/element-resolver.ts`): `resolveInstructionsEntities(instructions, spatialContext, options)` updates each instruction’s `entity` (and optionally confidence) when a resolution score meets the threshold.

### 4.2 DOM phrase extraction

- **Source:** `lib/server/pipelineContext.ts` — `getDomPhrasesFromContext(ctx)`.
- **Logic:** Collects labels and text from `getElementsForPrompt(ctx)` (elements, visibleElements, formFields, buttons, headings, interactiveElements). Deduplicates by lowercase; minimum length 2. If no elements, tokenizes `getTextContextForPrompt(ctx)` into words and bigrams (length ≥ 3) as fallback phrases.
- **Use:** These phrases are used for grounding (`groundTranscriptClauses`) and for entity resolution when context provides interactive labels (see below).

### 4.3 N-gram generation (element-resolver)

- **File:** `lib/ai/element-resolver.ts`.
- **Input:** Per-scope text (domScopeText, nearbyScopeText, viewportScopeText, screenshotOCRText).
- **Tokenization:** `getCleanTokens(text)` — split on whitespace/·,; trim.
- **N-grams:** `getPhraseCandidates(tokens)` — n = 1, 2, 3 up to `MAX_NGRAM` (3), sliding window; deduplicated, order preserved. Rejected: length &gt; `MAX_PHRASE_CHARS` (40), UI overlay words ("capture", "cancel", "retake"), only stopwords, single word &lt; MIN_CANDIDATE_LENGTH (4).

### 4.4 Fuzzy matching algorithm

- **File:** `lib/ai/fuzzy-similarity.ts`.
- **Levenshtein:** `levenshtein(a, b)` — edit distance.
- **Similarity:** `fuzzySimilarity(a, b) = max(0, 1 - distance / maxLen)` (0–1, 1 = identical).
- **Best match in corpus:** `bestMatchInCorpus(phrase, corpus, { minChunkLength, maxChunkLength })` — slides word windows (up to 12 words) and single words; returns `{ similarity, matchedText }` with highest similarity.
- **Copy correction:** Uses `bestMatchInCorpus` over each spatial scope line in order (dom → nearby → viewport → ocr); first match with similarity ≥ threshold (0.75) wins.
- **Element resolver:** For each phrase candidate from scope text, `fuzzySimilarity(phrase, candidatePhrase)` is combined with spatial and hierarchy scores (see below).

### 4.5 Similarity thresholds and scoring (element-resolver)

- **MIN_RESOLUTION_SCORE = 0.65** — Below this, resolution is not applied (entity left unchanged).
- **Scoring (per candidate):**
  - **Text weight 0.6:** `fuzzySimilarity(entityPhrase, candidatePhrase)`.
  - **Spatial weight 0.3:** dom=1, nearby=0.75, viewport=0.5, ocr=0.25.
  - **Hierarchy weight 0.1:** `domHierarchyWeight(candidateText)` by length (e.g. ≤2 chars 0.3, ≤10 0.6, ≤40 0.9, else 1).
  - **Heading boost +0.2:** When entity phrase is "title"/"heading"/"section title" and source is dom.
  - **Keyword-in-DOM boost +0.15:** When source is dom and transcript/entity keywords appear in candidate.
  - **Interactive boost +0.2:** When entity suggests button/link/field/input and candidate is in context’s buttons/interactiveElements/formFields labels.
- **Confidence after resolution:** If resolved from dom or nearby: at least 0.9; from viewport or ocr: at least 0.75. If entity is vague ("that button", "the thing", "unknown") and unresolved: confidence capped at 0.65.

### 4.6 Examples

- "that button" + DOM "Start Free Trial" → resolved to "Start Free Trial" (if score ≥ 0.65).
- "hero title" + DOM heading "What Drives Us" → heading boost helps DOM match win.
- "sign of form" in COPY_CHANGE action → copy correction replaces with "signup form" when match in spatial context ≥ 0.75.

---

## SECTION 5 — Spatial Context System

Spatial context scopes all resolution to four regions in priority order: **DOM subtree → nearby → viewport → OCR fallback**.

### 5.1 Inputs and types

- **File:** `lib/ai/spatial-context-builder.ts`.
- **Input:** `SpatialContextInput`: `domPath`, `visibleText`, `nearbyText` (string or array), `viewportWidth`, `viewportHeight`, `scrollX`, `scrollY`, `screenshotOCRText`, `subtreeText`.
- **Output:** `SpatialContext`: `domScopeText`, `nearbyScopeText`, `viewportScopeText`, `screenshotOCRText` (all strings).

### 5.2 domPath

- Client-sent selector/path of the focused or captured element.
- **Use:** If `subtreeText` is not provided and code runs in a DOM environment, `extractDomSubtreeText(domPath)` gets innerText/textContent of that subtree. Otherwise dom scope falls back to nearby text when dom is empty.

### 5.3 nearbyText

- Client-sent text near the capture point (string or array of snippets).
- **Build:** `buildNearbyScopeText(nearbyText)` — normalize whitespace, split on newlines/commas/semicolons, drop chunks with length ≤ 3, join with newlines → `nearbyScopeText`.

### 5.4 subtreeText

- Client-sent text for the DOM subtree at `domPath` (most accurate for the focused element).
- **Use:** Preferred for `domScopeText`. If present, it is used directly; no server-side DOM query.

### 5.5 visibleText

- Usually OCR or visible text from the client (e.g. screenshot OCR).
- **Use:** Fills `viewportScopeText` (currently no per-line scroll filtering; full visible text). Also used for `screenshotOCRText` when `screenshotOCRText` is not set.

### 5.6 truncateSpatialContext()

- **File:** `lib/ai/pipelineTokenBudget.ts`.
- **Purpose:** Keep total context under token budget (~2000 tokens target; ~4 chars/token).
- **Logic:** Per-field character limits: `domScopeText` 1200, `nearbyScopeText` 800, `viewportScopeText` 1200, `screenshotOCRText` 800. `truncateForTokenBudget(s, maxChars)` truncates each field to its limit (slice from start, trim).
- **Usage:** Truncated context is passed to instruction extraction. Copy-correction and entity resolution use **full** (untruncated) spatial context.

### 5.7 Priority order in consumers

- **getSpatialScopeLines(ctx)** returns `[ { text: domScopeText, source: "dom" }, ... nearby, viewport, ocr ]`.
- Copy-correction and element-resolver iterate this order (dom → nearby → viewport → ocr) when matching or resolving.

---

## SECTION 6 — Instruction Structuring

How structured instructions become a single pipeline ticket (graph path; no ontology in the default success path).

### 6.1 buildInstructionGraph()

- **File:** `lib/server/instructionGraph.ts`.
- **Signature:** `buildInstructionGraph(input: BuildInstructionGraphInput): BuildInstructionGraphResult`.
- **Input:** `structuredInstructions` (ExtractedInstruction[]), `context`, `transcript` (optional; kept for compatibility, not used for entity).
- **Logic:**
  - For each instruction: normalize entity to an element key (`normalizeElementKey`, lowercased, trimmed, slice 80). Empty or generic ("unknown", "page", "this") → key `"__ungrouped__"`.
  - Group by key: same key → same target node; each instruction becomes one `ActionNode`: `action_type = instruction.intent`, `details.summary = instruction.action`, `confidence = instruction.confidence`.
  - Build `InstructionGraph`: list of `TargetNode` (element key or null for ungrouped, actions list). Set `needsClarification` when no actionable targets or all action confidences &lt; 0.5.
- **Output:** `{ graph: InstructionGraph, needsClarification: boolean }`.

### 6.2 groupInstructionsIntoTickets / ticketsFromGraph()

- **File:** `lib/server/instructionGraph.ts`.
- **Function:** `ticketsFromGraph(graph, instructions?)` — there is no separate `groupInstructionsIntoTickets`; grouping is done inside `buildInstructionGraph`. Ticket generation is `ticketsFromGraph`.
- **Logic:**
  - Collect all actions from all targets with confidence ≥ 0.5; action_type !== "UNKNOWN". Each action’s `details.summary` (or action_type) becomes one action step string.
  - `actionSteps` = list of those strings.
  - Primary target: first target’s element (or "layout" if null/ungrouped). Title entity: first target’s element or first instruction’s entity or "layout".
  - **Title:** Assigned in `runStructuringLayer` via `generateTicketTitlesBatch(client, tickets)` (lib/ai/ticketTitle.ts); one LLM call for all titles; fallback per ticket: actionSteps[0].slice(0, 60).
  - One `PipelineTicket` per graph target: title (slice 120), actionSteps, tags `["Feedback"]`, confidenceScore = average of action confidences.
- **Output:** `PipelineTicket[]` (one per entity/target).

### 6.3 generateTicketTitlesBatch()

- **File:** `lib/ai/ticketTitle.ts`.
- **Signature:** `generateTicketTitlesBatch(client: OpenAI, tickets: TicketTitleInput[]): Promise<string[]>`. Each title max 60 chars.
- **Logic:** Single gpt-4o-mini call; user prompt: "For each set of UI changes generate a concise ticket title (max 60 characters). Return JSON with a \"titles\" array of strings in the same order." Input JSON: array of `{ actions: string[] }`. Fallback per ticket on failure: actionSteps[0].slice(0, 60) or "Requested UI changes".

### 6.4 Example transformations

- **Input instructions:**  
  [ { entity: "hero section", action: "reduce the size of the hero section", intent: "UI_VISUAL_ADJUSTMENT", confidence: 0.9 },  
    { entity: "signup button", action: "move the signup button below the hero", intent: "UI_LAYOUT", confidence: 0.85 } ]
- **Graph:** Two targets: "hero section" (one action), "signup button" (one action).
- **Tickets:** Two tickets (one per entity). Each: actionSteps from that target's actions; title from generateTicketTitlesBatch (e.g. "Reduce hero section size", "Move signup button below hero"); tags ["Feedback"]; confidenceScore = average of that target's action confidences.

---

## SECTION 7 — Error Handling

| Scenario | Handling |
|----------|----------|
| **Speech / STT errors** | Perception: proper noun anchoring, UI vocabulary normalization, speech normalization. Optional AI transcript normalization; on failure or when disabled, original (or post–speech-norm) transcript used. Copy correction then fixes COPY_CHANGE phrases via fuzzy match to DOM/nearby/viewport/OCR. |
| **Entity mismatches** | Entity resolution: if score &lt; MIN_RESOLUTION_SCORE (0.65), entity left unchanged. Vague unresolved entities ("that button", "unknown") get confidence capped at 0.65. No hard failure; pipeline continues with original entity. |
| **AI extraction failures** | `extractStructuredInstructions`: on parse error or empty content returns `fallbackResult()` (instructions: [], needsClarification: true). Retry once if result empty and transcript length &gt; 20. |
| **AI refinement failures** | `refineStructuredInstructions`: on parse error or empty content returns original instructions. No retry. |
| **Ontology failures** | `mapInstructionsToOntology`: on parse/API error returns fallback ontology (one defaultAction() per instruction, needsClarification: true). Retry once. |
| **Verification failures** | `verifyTicketsBatch`: on parse/API error returns `conservativeVerification()` (isAccurate false, isActionable false, needsClarification true, confidence 0.5). Retry once. |
| **Empty instructions** | Understanding returns instructions: [], needsClarification. Output layer: early exit with clarity response (e.g. suggestedRewrite when wordCount &lt; 12 and no action verbs). |
| **Graph yields no tickets** | Output layer: if instructions exist but tickets.length === 0, return needsClarification and message (no ontology fallback in current default path; ontology code exists for optional fallback). |
| **All tickets fail verification** | Only tickets with isAccurate && isActionable && !needsClarification kept; if none, response with needsClarification, verificationIssues, suggestedRewrite. |
| **Rate limit** | structure-feedback: 20 requests per 60s per user; 429 when exceeded. |
| **Missing OPENAI_API_KEY** | structure-feedback returns 200 with success: false, error message. session-insight returns success: false, summary: null. |

---

## SECTION 8 — Performance Metrics

Metrics are collected in-memory and logged only when `NODE_ENV !== "production"` (no external telemetry).

### 8.1 PipelineMetrics (lib/ai/pipelineMetrics.ts)

- **pipelineLatencyMs** — Full pipeline duration.
- **extractionLatencyMs** — Time for `extractStructuredInstructions`.
- **refinementLatencyMs** — Time for `refineStructuredInstructions` (when called).
- **contextCharactersSent** — Sum of character lengths of filtered spatial context (domScopeText, nearbyScopeText, viewportScopeText, screenshotOCRText) sent to extraction.
- **instructionCount** — Number of instructions after understanding.
- **aiCallCount** — Number of AI calls in the run (extraction + optional refinement + optional verification; transcript norm if enabled).

### 8.2 Logging

- **Function:** `logPipelineMetrics(metrics)` — `console.debug("ECHLY PIPELINE METRICS", { ... })` in non-production.
- **Typical values (from design/comments):** No aggregate metrics are persisted; approximate expectations:
  - **Latency:** Dominated by sequential LLM calls (extraction is slowest; gpt-4o). Refinement and verification add one gpt-4o-mini call each when used.
  - **AI calls per feedback:** Default (no transcript norm, no verification): 1 (extraction) or 2 (extraction + refinement when compound). With verification: +1. With transcript norm: +1.
  - **Token usage:** Extraction 1600 max; refinement 2000; verification 1500; session insight 160. Context truncated to ~1200+800+1200+800 chars for extraction.
  - **Instruction count:** Capped at 12; typically 1–5 from extraction.

---

## SECTION 9 — Known Weaknesses

From code and comments:

- **Verifier:** `applyVerifierFinalDecision` returns raw verification results; ticket is valid only when isAccurate && isActionable && !needsClarification.
- **Clarity rules:** Multiple ad-hoc rules (word count &lt; 12, action verbs, confidence thresholds, instructionCountNorm * 0.6 + avgConfidence * 0.4) without a single clarity model.
- **Duplicate/unused code:** Two refinement entry points (refineStructuredInstructions used; refineInstructions deprecated). instructionSegmentation and intentExtraction unused by structure-feedback.
- **No ontology in default path:** When graph yields no tickets, current flow returns needsClarification; ontology + batchIntentAndTicketsFromOntology exist but are not wired in the main path as described in some docs.
- **Context truncation:** Extraction sees truncated spatial context; copy-correction and entity resolution use full context — consistent but extraction may miss distant DOM text when context is large.
- **Multiple tickets:** Pipeline produces one ticket per entity (graph target); titles from single batch LLM call.

---

## SECTION 10 — File Map

Key files implementing the AI pipeline.

| Area | File | Purpose |
|------|------|---------|
| **Entry** | `app/api/structure-feedback/route.ts` | POST handler; rate limit; calls runFeedbackPipeline. |
| **Orchestration** | `lib/ai/runFeedbackPipeline.ts` | normalizeInput, runPerceptionLayer, runUnderstandingLayer, runStructuringLayer, runOutputLayer, runFeedbackPipeline; metrics. |
| **Context** | `lib/server/pipelineContext.ts` | PipelineContext type; getElementsForPrompt, getTextContextForPrompt, getDomPhrasesFromContext. |
| **Perception** | `lib/server/properNounAnchoring.ts` | anchorProperNouns. |
| | `lib/server/uiVocabularyNormalization.ts` | normalizeUiVocabulary. |
| | `lib/server/speechNormalization.ts` | normalizeTranscript (speech). |
| | `lib/server/clauseSplitter.ts` | splitTranscriptIntoClauses. |
| | `lib/server/groundTranscriptClauses.ts` | groundTranscriptClauses. |
| | `lib/server/transcriptNormalization.ts` | normalizeTranscript (AI). |
| **Spatial** | `lib/ai/spatial-context-builder.ts` | buildSpatialContext, getSpatialScopeLines, extractDomSubtreeText. |
| | `lib/ai/pipelineTokenBudget.ts` | truncateSpatialContext, truncateForTokenBudget. |
| | `lib/ai/contextFilter.ts` | filterRelevantContext. |
| **Understanding** | `lib/server/instructionExtraction.ts` | extractStructuredInstructions, normalizeInstructionActions, structuredToInstructionStrings; EXTRACTION_SYSTEM_PROMPT. |
| | `lib/ai/copy-correction.ts` | correctCopyInInstructions. |
| | `lib/ai/element-resolver.ts` | resolveElement, resolveInstructionsEntities. |
| | `lib/ai/fuzzy-similarity.ts` | fuzzySimilarity, bestMatchInCorpus. |
| | `lib/server/instructionRefinement.ts` | refineStructuredInstructions; STRUCTURED_REFINEMENT_SYSTEM. |
| **Structuring** | `lib/server/instructionGraph.ts` | buildInstructionGraph, ticketsFromGraph. |
| | `lib/ai/ticketTitle.ts` | generateTicketTitlesBatch. |
| **Ontology (fallback)** | `lib/server/instructionOntology.ts` | mapInstructionsToOntology; ONTOLOGY_SYSTEM. |
| | `lib/server/pipelineStages.ts` | batchIntentAndTicketsFromOntology, batchIntentAndTickets; PipelineTicket. |
| **Output** | `lib/server/ticketVerification.ts` | verifyTicketsBatch, applyVerifierFinalDecision; VERIFICATION_SYSTEM. |
| **Metrics** | `lib/ai/pipelineMetrics.ts` | createPipelineMetrics, logPipelineMetrics, PipelineMetrics. |
| **Session insight** | `app/api/session-insight/route.ts` | Session summary AI call; SESSION_INSIGHT_SYSTEM_PROMPT. |

---

*End of technical report. This document is intended for external AI architects to audit and improve the Echly AI pipeline.*
