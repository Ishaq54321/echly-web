# Echly AI Pipeline — Complete Architecture Report

**Purpose:** Full technical investigation of the Echly AI system for redesigning to a production-grade AI feedback platform.  
**Scope:** Every API route and function where AI processing begins; full pipeline flow; every AI module; every LLM call and prompt; data context; spatial context; error handling; performance; output structure; risks; pipeline diagram.

---

## SECTION 1 — AI ENTRY POINTS

Every API route or function where AI processing begins.

### 1.1 `POST /api/structure-feedback`

| Field | Detail |
|-------|--------|
| **File path** | `app/api/structure-feedback/route.ts` |
| **Purpose** | Main AI pipeline: convert voice feedback (transcript + optional context) into structured tickets (title, actionSteps, suggestedTags, confidenceScore). Runs the full pipeline from transcript normalization through extraction, refinement, graph, verification. |
| **Inputs received** | `body.transcript` (string, required); `body.context` (optional): `url`, `viewportWidth`, `viewportHeight`, `scrollX`, `scrollY`, `devicePixelRatio`, `domPath`, `nearbyText`, `visibleText`, `screenshotOCRText`, `subtreeText`, `elements` / `visibleElements` / `interactiveElements` / `formFields` / `buttons` / `headings`. |
| **Outputs returned** | `{ success, tickets: [{ title, actionSteps, suggestedTags, confidenceScore }], error?, clarityScore?, clarityIssues?, suggestedRewrite?, confidence?, needsClarification?, verificationIssues?, verificationWarnings?, instructionLimitWarning?, extractedInstructions?, intent? }` |
| **Modules called next** | `normalizeContext()` (in-file) → `anchorProperNouns` → `normalizeUiVocabulary` → `normalizeSpeechTranscript` → `normalizeTranscriptWithAI` (transcriptNormalization) → `buildSpatialContext` → `extractStructuredInstructions` (instructionExtraction) → `correctCopyInInstructions` → `resolveInstructionsEntities` → `refineStructuredInstructions` (instructionRefinement) → `buildInstructionGraph` → `ticketsFromGraph` → (fallback) `mapInstructionsToOntology` → `batchIntentAndTicketsFromOntology` → `verifyTicketsBatch` → `applyVerifierFinalDecision`. |

### 1.2 `POST /api/session-insight`

| Field | Detail |
|-------|--------|
| **File path** | `app/api/session-insight/route.ts` |
| **Purpose** | Generate an executive-level summary of all feedback in a session (patterns, themes). Uses OpenAI to summarize titles, context summaries, action steps, and tags. Cached when feedback count unchanged. |
| **Inputs received** | `body.sessionId` (string). Feedback data is loaded server-side via `getSessionFeedbackPageWithStringCursorRepo(sessionId, 200)`. |
| **Outputs returned** | `{ success, summary: string | null, generated, cached }` |
| **Modules called next** | `getSessionByIdRepo`, `getSessionFeedbackTotalCountRepo`, `getSessionFeedbackPageWithStringCursorRepo`; on cache miss and when `shouldTrigger` (count ≥ 5 or overlapping tags or repeated keywords): single `client.chat.completions.create` with `SESSION_INSIGHT_SYSTEM_PROMPT`; then `updateSessionAiInsightSummaryRepo`. |

### 1.3 `POST /api/upload-screenshot`

| Field | Detail |
|-------|--------|
| **File path** | `app/api/upload-screenshot/route.ts` |
| **Purpose** | Store screenshot image to Firebase Storage; return download URL. **No AI processing.** OCR/visibleText is produced client-side and sent later as part of `context` to `POST /api/structure-feedback`. |
| **Inputs received** | `body.imageDataUrl`, `body.sessionId`, `body.feedbackId` |
| **Outputs returned** | `{ url }` or `{ error }` |
| **Modules called next** | Firebase Storage `ref`, `uploadString`, `getDownloadURL`. |

### 1.4 `POST /api/feedback`

| Field | Detail |
|-------|--------|
| **File path** | `app/api/feedback/route.ts` |
| **Purpose** | Persist a single feedback (ticket) to Firestore. **No AI in this route.** Optionally updates the global instruction graph with `extractedInstructions` (fire-and-forget `updateInstructionGraph`). |
| **Inputs received** | `body.sessionId`, `body.title`, `body.description`, `body.actionSteps`, `body.suggestedTags`, `body.screenshotUrl`, `body.contextSummary`, `body.metadata`, clarity fields, optional `body.extractedInstructions` |
| **Outputs returned** | `{ success, ticket }` (serialized feedback) |
| **Modules called next** | `addFeedbackWithSessionCountersRepo`, `getFeedbackByIdRepo`; if `extractedInstructions.length > 0`: `updateInstructionGraph(sessionId, docRef.id, instructions)` (lib/graph/instructionGraphEngine.ts). |

### 1.5 Other API routes (no AI)

- **GET/POST /api/feedback** — GET: paginated list; POST: create feedback (see above).  
- **GET /api/feedback/counts** — Counts only; no AI.  
- **GET/PATCH/DELETE /api/tickets/[id]** — CRUD; no AI.  
- **GET/POST /api/sessions**, **GET /api/sessions/[id]** — Session CRUD; no AI.  
- **GET /api/dashboard/metrics** — Metrics; no AI.

### 1.6 Standalone AI modules not invoked by any route

- **`lib/server/intentExtraction.ts`** — `extractIntent(input)`: single LLM call for intent/targetElement/changeCategory/problemSummary/confidence. **Not called by any route** in the repo; available for alternative flows.  
- **`lib/server/instructionSegmentation.ts`** — `segmentInstructions(client, transcript, context)`: splits transcript into instruction strings + needsClarification. **Not used** by the current structure-feedback route (which uses **instructionExtraction** for structured output instead).

---

## SECTION 2 — AI PIPELINE FLOW

End-to-end flow from user action to final ticket generation (structure-feedback path).

```
User speaks feedback (or types) → transcript captured (e.g. CaptureWidget / extension)
↓
Optional: Screenshot captured → uploaded via POST /api/upload-screenshot (URL only)
↓
Client sends POST /api/structure-feedback { transcript, context }
  context may include: visibleText (OCR from client), domPath, nearbyText, subtreeText, viewport, elements
↓
normalizeContext(body.context) → PipelineContext
↓
Transcript normalization chain (all in route):
  anchorProperNouns(transcript, ctx?.visibleText)     [proper noun ↔ OCR alignment]
  normalizeUiVocabulary(...)                          [summit→submit, model→modal, etc.]
  normalizeSpeechTranscript(...)                      [below 8→below it, etc.]
  normalizeTranscriptWithAI(client, ...)              [AI STT/grammar fix]
↓
buildSpatialContext(ctx) → SpatialContext (domScopeText, nearbyScopeText, viewportScopeText, screenshotOCRText)
↓
extractStructuredInstructions(client, normalizedTranscript, ctx, { spatialContext })
  → { instructions: ExtractedInstruction[], needsClarification }
↓
correctCopyInInstructions(extractedList, spatialContext)   [COPY_CHANGE phrase → DOM match]
resolveInstructionsEntities(extractedList, spatialContext)  [vague entity → resolved text]
↓
If instructions.length === 0 → clarity response (optional suggestedRewrite), return
↓
refineStructuredInstructions(client, extractedList)
  → refined ExtractedInstruction[] (split compounds; one action per instruction)
↓
Cap at MAX_INSTRUCTIONS (12); instructionStrings = structuredToInstructionStrings(refined)
↓
buildInstructionGraph({ structuredInstructions: refined, context, transcript })
  → { graph, needsClarification }   [deterministic; no LLM]
↓
ticketsFromGraph(graph, refined) → PipelineTicket[]   [titles via generateTicketTitlesBatch (lib/ai/ticketTitle.ts); actionSteps from graph]
↓
If pipelineTickets.length === 0:
  mapInstructionsToOntology(client, instructionStrings, ctx) → ontologyResult
  batchIntentAndTicketsFromOntology(client, ontologyResult.actions, ctx, { instructions }) → pipelineTickets
↓
If still no tickets → clarity response, return
↓
verifyTicketsBatch(client, normalizedTranscript, instructionStrings, pipelineTickets)
  → VerificationResult[] (isAccurate, isActionable, needsClarification, confidence)
↓
applyVerifierFinalDecision(rawVerifications, { instructionCount, instructions, transcript, segmentationNeedsClarification })
↓
Filter: keep only tickets where isAccurate && isActionable && !needsClarification
↓
If no valid tickets → clarity response; else
  Build response: success, tickets (title, actionSteps, suggestedTags, confidenceScore), clarityScore, etc.
↓
Client receives tickets; typically calls POST /api/feedback for each ticket to persist (and optionally updateInstructionGraph)
```

**Intermediate modules in order:**  
normalizeContext → properNounAnchoring → uiVocabularyNormalization → speechNormalization → transcriptNormalization → spatial-context-builder → instructionExtraction → copy-correction → element-resolver → instructionRefinement → instructionGraph (buildInstructionGraph, ticketsFromGraph) → [optional] instructionOntology → pipelineStages.batchIntentAndTicketsFromOntology → ticketVerification (verifyTicketsBatch, applyVerifierFinalDecision).

---

## SECTION 3 — AI MODULES

### 3.1 `lib/server/instructionExtraction.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Convert feedback transcript into structured instructions: intent, entity, action, confidence per instruction. Output is JSON with multiple instructions when feedback contains multiple changes. |
| **Inputs** | `client` (OpenAI), `transcript` (string), `context` (PipelineContext | null), `options?: { retryOnce, spatialContext }`. |
| **Outputs** | `ExtractionResult`: `{ instructions: ExtractedInstruction[], needsClarification }`. `ExtractedInstruction`: intent, entity, action, confidence. |
| **Dependencies** | pipelineContext (getElementsForPrompt, getTextContextForPrompt), SpatialContext type from lib/ai/spatial-context-builder. |

### 3.2 `lib/server/instructionRefinement.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Split compound instructions so each is exactly one developer action. Preserves intent/entity/action/confidence (structured refinement). |
| **Inputs** | `client` (OpenAI), `instructions: ExtractedInstruction[]`. |
| **Outputs** | `Promise<ExtractedInstruction[]>` (refined list; falls back to input on parse failure). |
| **Dependencies** | instructionExtraction (types, EXTRACTION_INTENTS, isValidExtractionIntent). |

### 3.3 `lib/server/instructionGraph.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Build a graph from structured instructions (group by entity → TargetNode with ActionNodes). No LLM. Then convert graph to one merged PipelineTicket (title, actionSteps, tags, confidenceScore). |
| **Inputs** | `BuildInstructionGraphInput`: structuredInstructions, context, transcript. For tickets: graph + optional instructions. |
| **Outputs** | `BuildInstructionGraphResult`: { graph, needsClarification }; `ticketsFromGraph()` → `PipelineTicket[]`. |
| **Dependencies** | lib/ai/ticketTitle (generateTicketTitlesBatch), pipelineContext, pipelineStages (PipelineTicket type), instructionExtraction (ExtractedInstruction). |

### 3.4 `lib/server/instructionOntology.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Map each refined instruction string to exactly one canonical UI action (e.g. TEXT_CHANGE, RENAME_FIELD, RESIZE_ELEMENT). Used as fallback when graph yields no tickets. |
| **Inputs** | `client`, `instructions: string[]`, `context`, `options?: { retryOnce }`. |
| **Outputs** | `OntologyResult`: { actions: OntologyAction[], needsClarification }. |
| **Dependencies** | pipelineContext (getElementsForPrompt, getTextContextForPrompt). |

### 3.5 `lib/server/pipelineStages.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | (1) From ontology actions: generate one merged ticket + intents (`batchIntentAndTicketsFromOntology`). (2) From instruction strings: batch intent + single ticket (`batchIntentAndTickets`). Used for ontology fallback path. |
| **Inputs** | OpenAI client, ontology actions or instruction strings, context, options (instructions, retryOnce). |
| **Outputs** | `{ intents: InstructionIntent[], tickets: PipelineTicket[] }`. |
| **Dependencies** | pipelineContext, instructionOntology (OntologyAction). |

### 3.6 `lib/server/ticketVerification.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Verify the single merged ticket against original transcript and all instructions (isAccurate, isActionable, needsClarification, confidence). Then apply rules so valid instructions don’t incorrectly trigger clarification. |
| **Inputs** | `client`, `originalTranscript`, `instructions: string[]`, `tickets`, `options?: { retryOnce }`. |
| **Outputs** | `VerificationResult[]`; `applyVerifierFinalDecision()` overrides verifier when instructionCount > 0 or segmentationNeedsClarification === false. |
| **Dependencies** | pipelineStages (PipelineTicket). |

### 3.7 `lib/server/transcriptNormalization.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Fix STT and grammar errors in transcript via LLM; preserve intent. Single normalized string. |
| **Inputs** | `client`, `transcript`, `options?: { retryOnce }`. |
| **Outputs** | `Promise<string>` (normalized transcript or original on failure). |
| **Dependencies** | None (OpenAI type only). |

### 3.8 `lib/server/instructionSegmentation.ts` (not used in main pipeline)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Split transcript into atomic instruction strings + needsClarification. Alternative to instructionExtraction (string-based segmentation). |
| **Inputs** | `client`, `transcript`, `context`, `options?.retryOnce`. |
| **Outputs** | `SegmentInstructionsResult`: instructions (string[]), needsClarification, confidence, intentConfidenceScore. |
| **Dependencies** | pipelineContext. |

### 3.9 `lib/server/intentExtraction.ts` (not used by any route)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Single-intent extraction: intentType, targetElement, changeCategory, problemSummary, confidence. |
| **Inputs** | `IntentExtractionInput`: transcript, visibleText?, url?. |
| **Outputs** | `IntentExtractionResult`. |
| **Dependencies** | OpenAI (creates its own client). |

### 3.10 `lib/ai/spatial-context-builder.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Build SpatialContext from pipeline/context input: domScopeText, nearbyScopeText, viewportScopeText, screenshotOCRText. No LLM. |
| **Inputs** | `SpatialContextInput`: domPath, visibleText, nearbyText, viewport, scroll, screenshotOCRText, subtreeText. |
| **Outputs** | `SpatialContext`; `getSpatialScopeLines(ctx)` for priority-ordered scope lines. |
| **Dependencies** | None (optional document for extractDomSubtreeText in browser). |

### 3.11 `lib/ai/copy-correction.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | For COPY_CHANGE instructions, replace STT-error phrases with best fuzzy match from spatial context (dom → nearby → viewport → OCR). |
| **Inputs** | `instructions` (with intent/entity/action/confidence), `spatialContext`. |
| **Outputs** | Same shape array with corrected entity/action where match ≥ threshold. |
| **Dependencies** | spatial-context-builder (getSpatialScopeLines), fuzzy-similarity (bestMatchInCorpus, fuzzySimilarity). |

### 3.12 `lib/ai/element-resolver.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Resolve vague entity phrases (e.g. "that button") to concrete text from spatial context using similarity + spatial proximity + hierarchy. |
| **Inputs** | Instructions with `entity: string`; `spatialContext`. |
| **Outputs** | Instructions with updated `entity` when resolution score ≥ threshold. |
| **Dependencies** | spatial-context-builder (getSpatialScopeLines), fuzzy-similarity (fuzzySimilarity). |

### 3.13 `lib/ai/fuzzy-similarity.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Levenshtein-based similarity and best-match-in-corpus for copy correction and element resolution. No LLM. |
| **Inputs** | Strings; optional options (minChunkLength, maxChunkLength). |
| **Outputs** | `fuzzySimilarity(a,b)`, `bestMatchInCorpus(phrase, corpus, options)`. |
| **Dependencies** | None. |

### 3.14 `lib/ai/spatial-distance.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Distance from element box to capture point; isWithinSpatialScope. Used for discarding candidates outside ~600px. No LLM. |
| **Inputs** | ElementBox, CapturePoint, optional maxDistancePx. |
| **Outputs** | distance number; boolean. |
| **Dependencies** | None. |

### 3.15 `lib/ai/ticketTitle.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Single batch LLM call to generate all ticket titles (gpt-4o-mini, max 60 chars each). Fallback per ticket: actionSteps[0].slice(0, 60). |
| **Inputs** | `client: OpenAI`, `tickets: TicketTitleInput[]` (each `{ actionSteps: string[] }`). |
| **Outputs** | `Promise<string[]>` — titles in same order as input. |
| **Dependencies** | None. |

### 3.17 `lib/server/properNounAnchoring.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Align transcript proper nouns/phrases to OCR visible text (phrase- and token-level; similarity ≥ 0.85 to replace). No LLM. |
| **Inputs** | `transcript`, `visibleText | null`. |
| **Outputs** | Corrected transcript string. |
| **Dependencies** | None. |

### 3.18 `lib/server/speechNormalization.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Deterministic STT fixes (e.g. "below 8"→"below it", "sign of form"→"signup form"). No LLM. |
| **Inputs** | `transcript: string`. |
| **Outputs** | Normalized string. |
| **Dependencies** | None. |

### 3.19 `lib/server/uiVocabularyNormalization.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Map known STT mishearings to UI terms (summit→submit, model→modal, etc.) and phonetic similarity to UI vocabulary. No LLM. |
| **Inputs** | `transcript: string`. |
| **Outputs** | Normalized string. |
| **Dependencies** | None. |

### 3.20 `lib/server/pipelineContext.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Shared PipelineContext type and helpers: getElementsForPrompt, getTextContextForPrompt. No LLM. |
| **Inputs** | PipelineContext. |
| **Outputs** | Elements array; text string. |
| **Dependencies** | None. |

### 3.21 `lib/graph/instructionGraphEngine.ts`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Session-level instruction graph in Firestore: group by entity+intent, mentionCount, tickets, averageConfidence. Updated on POST /api/feedback when extractedInstructions provided. No LLM. |
| **Inputs** | sessionId, ticketId, instructions (ExtractedInstruction[]). |
| **Outputs** | Promise<void>. |
| **Dependencies** | firebase/firestore, instructionExtraction (ExtractedInstruction, ExtractionIntent). |

---

## SECTION 4 — OPENAI / LLM CALLS

All places that call an AI model (OpenAI only in this codebase).

| # | File | Function / location | Model | Temperature | Max tokens | Purpose |
|---|------|---------------------|--------|-------------|------------|---------|
| 1 | `app/api/structure-feedback/route.ts` | Uses shared `client` (OpenAI) | — | — | — | Client created once; used by all stages invoked from this route. |
| 2 | `lib/server/transcriptNormalization.ts` | `normalizeTranscript` | gpt-4o-mini | 0 | 500 | STT/grammar normalization. |
| 3 | `lib/server/instructionExtraction.ts` | `extractStructuredInstructions` | gpt-4o | 0 | 1600 | Structured instruction extraction (intent, entity, action, confidence). |
| 4 | `lib/server/instructionRefinement.ts` | `refineStructuredInstructions` | gpt-4o-mini | 0 | 2000 | Split compound instructions; preserve structure. |
| 5 | `lib/server/instructionRefinement.ts` | `refineInstructions` (deprecated) | gpt-4o-mini | 0 | 1500 | String-based refinement. |
| 6 | `lib/server/instructionOntology.ts` | `mapInstructionsToOntology` | gpt-4o-mini | 0 | 3000 | Map instructions to canonical action types. |
| 7 | `lib/server/pipelineStages.ts` | `batchIntentAndTicketsFromOntology` | gpt-4o-mini | 0 | 2500 | One merged ticket from ontology actions. |
| 8 | `lib/server/pipelineStages.ts` | `batchIntentAndTickets` | gpt-4o-mini | 0 | 2500 | Intent + single ticket from instruction strings. |
| 9 | `lib/server/ticketVerification.ts` | `verifyTicketsBatch` | gpt-4o-mini | 0 | 1500 | Verify ticket vs transcript and instructions. |
| 10 | `app/api/session-insight/route.ts` | `client.chat.completions.create` | gpt-4o-mini | 0 | 160 | Session summary. |
| 11 | `lib/server/intentExtraction.ts` | `extractIntent` | gpt-4o-mini | 0 | 300 | Single intent extraction (not used by routes). |
| 12 | `lib/server/instructionSegmentation.ts` | `segmentInstructions` | gpt-4o | 0 | 1200 | String-based segmentation (not used by structure-feedback). |

**Prompt templates:** See Section 5.

---

## SECTION 5 — PROMPT INVENTORY

### 5.1 Transcript normalization

- **File:** `lib/server/transcriptNormalization.ts`  
- **What it does:** Fix speech-to-text and grammar errors; preserve intent; output single normalized string.  
- **Inputs to model:** System: NORMALIZATION_SYSTEM (rules: correct STT, fix grammar, preserve intent, no paraphrase beyond errors, no markdown/JSON). User: `"Normalize this transcript:\n\n\"${trimmed}\""`.  
- **Expected output:** Plain normalized transcript string.

### 5.2 Instruction extraction

- **File:** `lib/server/instructionExtraction.ts`  
- **What it does:** Convert feedback into structured instructions (intent, entity, action, confidence); multiple instructions when multiple changes.  
- **Inputs to model:** System: EXTRACTION_SYSTEM_PROMPT (intent types, entity/action/confidence rules, output JSON). User: `buildUserContent(transcript, context, spatialContext)` — transcript + optional spatial context (DOM scope, nearby, viewport, OCR) + optional visible text + known UI elements.  
- **Expected output:** JSON `{ "instructions": [ { "intent", "entity", "action", "confidence" }, ... ] }` (no markdown).

### 5.3 Instruction refinement (structured)

- **File:** `lib/server/instructionRefinement.ts`  
- **What it does:** Split compound instructions; one instruction = one developer action; preserve structure.  
- **Inputs to model:** System: STRUCTURED_REFINEMENT_SYSTEM (rules + intent list + output format). User: "Structured instructions to refine..." + JSON string of instructions.  
- **Expected output:** JSON `{ "instructions": [ { "intent", "entity", "action", "confidence" }, ... ] }`.

### 5.4 Instruction ontology

- **File:** `lib/server/instructionOntology.ts`  
- **What it does:** Map each instruction to exactly one canonical action type (TEXT_CHANGE, RENAME_FIELD, etc.) with target_element and change_details.  
- **Inputs to model:** System: ONTOLOGY_SYSTEM (action types, rules, no hallucination). User: DOM elements + visible text + instructions list.  
- **Expected output:** JSON `{ "actions": [ { "action_type", "target_element", "change_details", "confidence" } ], "needsClarification" }`.

### 5.5 Ticket from ontology

- **File:** `lib/server/pipelineStages.ts`  
- **What it does:** Generate one merged ticket (title, actionSteps, tags, confidenceScore) from ontology actions and instructions.  
- **Inputs to model:** System: TICKET_FROM_ONTOLOGY_SYSTEM (one ticket, one step per instruction, no hallucination). User: UI elements + visible text + ontology actions JSON + instructions.  
- **Expected output:** JSON with single `ticket` object.

### 5.6 Verification

- **File:** `lib/server/ticketVerification.ts`  
- **What it does:** Check ticket reflects all instructions, is actionable, no hallucination; set needsClarification only when wrong/missing/hallucinated.  
- **Inputs to model:** System: VERIFICATION_SYSTEM (check accuracy, actionable, clarity rule). User: original transcript + instructions list + ticket title and action steps.  
- **Expected output:** JSON `{ "verification": { "isAccurate", "isActionable", "needsClarification", "confidence" } }`.

### 5.7 Session insight

- **File:** `app/api/session-insight/route.ts`  
- **What it does:** Summarize session feedback (titles, context, action steps, tags) in 3 sentences, 90–120 words, factual only.  
- **Inputs to model:** System: SESSION_INSIGHT_SYSTEM_PROMPT (rules, no inference/marketing). User: condensed lines per feedback item (title, context, tags, action).  
- **Expected output:** Plain text summary or null.

### 5.8 Intent extraction (unused by routes)

- **File:** `lib/server/intentExtraction.ts`  
- **What it does:** Single intent: intentType, targetElement, changeCategory, problemSummary, confidence.  
- **Inputs to model:** transcript, visibleText, url.  
- **Expected output:** JSON with intentType, targetElement, changeCategory, problemSummary, confidence.

### 5.9 Instruction segmentation (unused by structure-feedback)

- **File:** `lib/server/instructionSegmentation.ts`  
- **What it does:** Split transcript into atomic instruction strings; set needsClarification for vague feedback.  
- **Inputs to model:** SYSTEM_PROMPT + user message with transcript and optional context/elements.  
- **Expected output:** JSON `{ "instructions": string[], "needsClarification", "confidence" }`.

---

## SECTION 6 — DATA CONTEXT PROVIDED TO AI

| Context piece | Origin | Where used |
|---------------|--------|------------|
| **transcript** | Request body `body.transcript` (from voice/text capture). | All transcript normalization; extraction; verification. |
| **visibleText** | Client (extension/dashboard): often from OCR on screenshot; sent in `context.visibleText`. | pipelineContext.getTextContextForPrompt; spatial context (viewportScopeText / screenshotOCRText); proper noun anchoring. |
| **nearbyText** | Client: text near capture point; `context.nearbyText` (string or array). | Spatial context (nearbyScopeText); pipelineContext. |
| **domPath** | Client: selector/path of focused/captured element. | pipelineContext; spatial context (domScopeText via subtreeText or extractDomSubtreeText). |
| **viewport** | `context.viewportWidth`, `viewportHeight`, `scrollX`, `scrollY`. | Spatial context (viewport filtering; currently viewportScopeText = visibleText). |
| **scroll position** | `context.scrollX`, `scrollY`. | SpatialContextInput; future viewport filtering. |
| **OCR results** | Client-side OCR on screenshot; sent as `visibleText` or `screenshotOCRText`. | properNounAnchoring (visibleText); spatial context (screenshotOCRText); extraction/ontology prompts when no DOM. |
| **URL** | `context.url`. | pipelineContext; intent extraction (when used). |
| **elements** | Client: `context.elements` / visibleElements / formFields / buttons / headings. | normalizeContext; getElementsForPrompt; instruction extraction and ontology user content. |
| **subtreeText** | Client: text of DOM subtree at domPath. | Spatial context (domScopeText). |
| **screenshotOCRText** | Explicit OCR field or same as visibleText. | Spatial context; extraction when spatial context provided. |

---

## SECTION 7 — SPATIAL CONTEXT SYSTEM

### 7.1 Role

Spatial context scopes all resolution to: **DOM subtree → nearby → viewport → OCR fallback**, so the model and heuristics prefer the most accurate source (DOM) over OCR.

### 7.2 Generation (`lib/ai/spatial-context-builder.ts`)

- **domScopeText:**  
  - Prefer client-sent `subtreeText`.  
  - Else, if `domPath` is set and code runs in DOM (e.g. extension), `extractDomSubtreeText(domPath)` (innerText/textContent of subtree).  
  - Else fallback to `buildNearbyScopeText(nearbyText)`.

- **nearbyScopeText:**  
  From `nearbyText` (string or array); normalized, chunks with length &lt;= 3 dropped; joined with newlines.

- **viewportScopeText:**  
  Currently set to `visibleText` (no per-line y filtering; future: filter by scrollY and viewport height).

- **screenshotOCRText:**  
  `screenshotOCRText` or `visibleText`.

### 7.3 Usage in pipeline

- **instructionExtraction:** If spatial context is provided, user content includes "[DOM scope]", "[Nearby scope]", "[Viewport scope]", "[OCR fallback]" (with character caps). Prompt says: resolve UI elements only from this; prefer DOM over OCR.
- **copy-correction:** For COPY_CHANGE, phrases are matched against `getSpatialScopeLines(spatialContext)` in order (dom → nearby → viewport → ocr); best match above threshold replaces transcript phrase.
- **element-resolver:** Resolves entity phrase using same scope lines; scoring uses text similarity, spatial proximity (source order), and hierarchy weight; DOM "title" gets heading boost.

---

## SECTION 8 — ERROR HANDLING

| Scenario | Handling |
|----------|----------|
| **Ambiguous instructions** | Extraction returns needsClarification when instructions.length === 0 or all confidence &lt; 0.5. Route returns early with needsClarification, suggestedRewrite when wordCount &lt; 12 and no action verbs. |
| **Low confidence extraction** | needsClarification from extraction; clarity score uses avg confidence; CLARITY_EXTREME_LOW_CONFIDENCE (0.45) noted but instructions still proceed when present. |
| **Failed OCR** | No server-side OCR; client sends visibleText/screenshotOCRText. If missing, spatial context has empty screenshotOCRText; proper noun anchoring no-ops when visibleText too short. |
| **Missing DOM data** | normalizeContext accepts multiple shapes (elements, visibleElements, etc.); getElementsForPrompt returns []; getTextContextForPrompt uses visibleText or nearbyText/domPath. Extraction and ontology still run with "Visible text from page: (none)" or reduced context. |
| **Unclear speech transcript** | Transcript normalization chain: proper noun anchoring, UI vocab, speech rules, then AI normalization. On AI failure, original transcript used. Empty transcript → extraction returns instructions: [], needsClarification: true. |
| **Extraction parse failure** | instructionExtraction: fallbackResult() (instructions: [], needsClarification: true); retry once if empty and transcript long enough. |
| **Refinement parse failure** | instructionRefinement: returns original instructions. |
| **Ontology parse failure** | Fallback ontology with defaultAction() per instruction, needsClarification: true; retry once. |
| **Verification parse failure** | conservativeVerification() (isAccurate/isActionable false, needsClarification true, confidence 0.5); retry once. |
| **Rate limit** | structure-feedback: checkRateLimit(uid); 429 when &gt; 20 requests per 60s per user. |
| **Missing OPENAI_API_KEY** | structure-feedback and session-insight return error or cached/null; intentExtraction returns fallback intent. |

---

## SECTION 9 — PERFORMANCE AND LATENCY

- **AI calls (structure-feedback, typical path):**  
  1. normalizeTranscriptWithAI (gpt-4o-mini, 500 tokens).  
  2. extractStructuredInstructions (gpt-4o, 1600 tokens).  
  3. refineStructuredInstructions (gpt-4o-mini, 2000 tokens).  
  4. verifyTicketsBatch (gpt-4o-mini, 1500 tokens).  
  Optional: mapInstructionsToOntology + batchIntentAndTicketsFromOntology (2 × gpt-4o-mini) when graph yields no tickets.

- **Heavy computation:**  
  - properNounAnchoring: phrase and token windows over transcript and visible text; Levenshtein.  
  - copy-correction / element-resolver: fuzzy matching over spatial scope lines.  
  - buildInstructionGraph / ticketsFromGraph: linear over instructions; titles from single generateTicketTitlesBatch call.

- **Bottlenecks:**  
  - Four sequential LLM calls (normalize → extract → refine → verify) dominate latency.  
  - gpt-4o for extraction is the most expensive and slowest.  
  - Retries (e.g. extraction, verification) double cost on failure.  
  - Session insight: one call but runs only when count ≥ 5 or overlapping tags/keywords; feedback fetch up to 200 items.

---

## SECTION 10 — FINAL OUTPUT STRUCTURE

Final ticket shape returned by structure-feedback and persisted via POST /api/feedback:

| Field | Source / generator |
|-------|---------------------|
| **title** | `lib/ai/ticketTitle.ts` — `generateTicketTitlesBatch(client, tickets)` in runStructuringLayer (single LLM call); or from ontology path via pipelineStages (LLM-generated then enforced 4–10 words). |
| **actionSteps** | instructionGraph: from graph actions (summary from each ActionNode with confidence ≥ 0.5); or ontology path from LLM ticket actionSteps. |
| **confidenceScore** | instructionGraph: average of action confidences; ontology path: from parsed ticket or average of ontology actions. |
| **tags** | instructionGraph: hardcoded `["Feedback"]`; ontology path: from parsed ticket (validated against PipelineTag), default `["Feedback"]`. |
| **screenshot** | Not produced by pipeline; client attaches screenshotUrl when calling POST /api/feedback. |
| **metadata** | Client can send url, viewportWidth, viewportHeight, userAgent, clientTimestamp in POST /api/feedback. |

Response also includes: clarityScore, clarityIssues, suggestedRewrite, needsClarification, verificationIssues, verificationWarnings, instructionLimitWarning, extractedInstructions (for client to send back as extractedInstructions in POST /api/feedback for graph update).

---

## SECTION 11 — ARCHITECTURAL RISKS

- **Duplicated logic:**  
  - Two refinement entry points: `refineStructuredInstructions` (used) vs `refineInstructions` (string-based, deprecated).  
  - Levenshtein/similarity in both properNounAnchoring and uiVocabularyNormalization; fuzzy-similarity used by copy-correction and element-resolver (shared lib reduces duplication).

- **Overlapping AI responsibilities:**  
  - instructionSegmentation (string instructions + needsClarification) vs instructionExtraction (structured instructions + needsClarification): pipeline uses only extraction; segmentation is dead code in this flow.  
  - intentExtraction (single intent) is unused; overlaps conceptually with extraction intents.

- **Fragile heuristics:**  
  - Clarity: multiple ad-hoc rules (word count &lt; 12, action verbs, CLARITY_EXTREME_LOW_CONFIDENCE, instructionCountNorm * 0.6 + avgConfidence * 0.4).  
  - applyVerifierFinalDecision: no overrides in current design; ticket valid only when isAccurate && isActionable && !needsClarification.

- **Unnecessary AI calls:**  
  - Transcript normalization AI call could be skipped for already-clean or short transcripts.  
  - Verification runs even when segmentation is confident; verifier result is often overridden by applyVerifierFinalDecision.

- **Modules doing too much:**  
  - structure-feedback route: orchestrates normalization chain, spatial context, extraction, copy correction, resolution, refinement, graph, ontology fallback, verification, filtering, and response shaping in one large handler.  
  - pipelineStages: both ontology-based and string-based ticket generation plus intent normalization and fallbacks.

- **Inconsistency between docs and code:**  
  - Existing AI_PIPELINE_TECHNICAL_REPORT describes segmentation → refinement → ontology → ticket path; actual structure-feedback uses extraction → refinement → graph → (ontology fallback) → verification.

---

## SECTION 12 — FULL PIPELINE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAPTURE LAYER                                                                │
│ • User: voice/text (CaptureWidget, extension)                               │
│ • Optional: screenshot → POST /api/upload-screenshot (storage only)         │
│ • Client: OCR → visibleText; context (domPath, nearbyText, viewport, etc.)  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ ENTRY LAYER                                                                  │
│ • POST /api/structure-feedback { transcript, context }                      │
│ • normalizeContext(body.context) → PipelineContext                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ NORMALIZATION LAYER (pre-AI)                                                 │
│ • properNounAnchoring(transcript, visibleText)                               │
│ • uiVocabularyNormalization (summit→submit, model→modal, …)                  │
│ • speechNormalization (below 8→below it, …)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TRANSCRIPT CLEANUP (AI)                                                      │
│ • transcriptNormalization.normalizeTranscript(client, transcript) [gpt-4o-mini]│
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SPATIAL CONTEXT LAYER                                                        │
│ • buildSpatialContext(ctx) → domScopeText, nearbyScopeText,                  │
│   viewportScopeText, screenshotOCRText                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ UNDERSTANDING LAYER — EXTRACTION                                             │
│ • instructionExtraction.extractStructuredInstructions(...) [gpt-4o]          │
│   → ExtractedInstruction[] (intent, entity, action, confidence)             │
│ • copy-correction.correctCopyInInstructions (COPY_CHANGE → DOM match)        │
│ • element-resolver.resolveInstructionsEntities (vague entity → resolved)     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINEMENT LAYER                                                             │
│ • instructionRefinement.refineStructuredInstructions(...) [gpt-4o-mini]     │
│   → one instruction = one developer action                                  │
│ • Cap at MAX_INSTRUCTIONS (12); structuredToInstructionStrings              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STRUCTURING LAYER — GRAPH (no LLM)                                           │
│ • instructionGraph.buildInstructionGraph(structuredInstructions, …)         │
│   → InstructionGraph (targets by entity, actions per target)                 │
│ • instructionGraph.ticketsFromGraph(graph)                                   │
│   → PipelineTicket[] (titles from generateTicketTitlesBatch, actionSteps, tags)     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │ pipelineTickets.length === 0?         │
                    └───────────────────┬───────────────────┘
                         Yes             │             No
                    ┌────▼────┐          │          ┌────▼────┐
                    │ ONTOLOGY FALLBACK   │          │ SKIP    │
                    │ instructionOntology │          └────┬────┘
                    │   .mapInstructions   │               │
                    │   ToOntology [LLM]   │               │
                    │ pipelineStages      │               │
                    │   .batchIntentAnd   │               │
                    │   TicketsFromOntology [LLM]         │
                    └────┬────┘          │               │
                         └───────────────┼───────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ VERIFICATION LAYER                                                           │
│ • ticketVerification.verifyTicketsBatch(...) [gpt-4o-mini]                   │
│ • ticketVerification.applyVerifierFinalDecision(...)                         │
│ • Filter: keep tickets where isAccurate && isActionable && !needsClarification│
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ OUTPUT LAYER                                                                 │
│ • Response: success, tickets (title, actionSteps, suggestedTags,            │
│   confidenceScore), clarityScore, needsClarification, …                     │
│ • Client: POST /api/feedback per ticket (persist + optional graph update)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Separate AI entry (no pipeline):**

```
POST /api/session-insight { sessionId }
  → Load feedback (up to 200) → if shouldTrigger → [gpt-4o-mini] session summary
  → Cache in session (aiInsightSummary, aiInsightSummaryFeedbackCount)
```

---

*End of report. This document is intended to allow a senior AI architect to redesign the system without manually inspecting the repository.*
