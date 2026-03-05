# Echly Feedback Pipeline — Refactored Architecture

**Orchestrator:** `lib/ai/runFeedbackPipeline.ts`

The pipeline converts user feedback (speech + screenshot + DOM context) into structured developer tickets. It is organized into five layers with a single responsibility each.

---

## Layer Overview

| Layer | Responsibility | AI? | Modules |
|-------|----------------|-----|---------|
| **Capture** | Collect signals only | No | `normalizeInput()` — transcript + context → `PipelineCapture` |
| **Perception** | Clean and prepare signals | Optional (transcript norm) | `anchorProperNouns`, `normalizeUiVocabulary`, `speechNormalize`, `buildSpatialContext`, optional `aiNormalizeTranscript` |
| **Understanding** | Convert feedback → structured instructions | Yes (extraction; refinement only when compound) | `extractStructuredInstructions`, optional `refineStructuredInstructions`, `correctCopyInInstructions`, `resolveInstructionsEntities` |
| **Structuring** | Instructions → tickets | Yes (titles) | `buildInstructionGraph`, `ticketsFromGraph`, `generateTicketTitlesBatch` (lib/ai/ticketTitle.ts) |
| **Output** | Verification, clarity, response shape | Optional (verification) | `verifyTicketsBatch`, `applyVerifierFinalDecision`, clarity scoring |

---

## OpenAI Usage

- **Default (minimal):** 1–2 calls  
  - 1 × `instructionExtraction` (required)  
  - 1 × `instructionRefinement` only when compound instructions are detected (heuristic)
- **Optional (opt-in):**  
  - `useTranscriptNormalization: true` → +1 call (transcript cleanup)  
  - `useVerification: true` → +1 call (ticket verification)  
- **Removed:** Ontology fallback (`mapInstructionsToOntology`, `batchIntentAndTicketsFromOntology`) when graph produces no tickets; clarification is returned instead.

---

## Token Budget

- Spatial context sent to the **Understanding** layer is truncated via `lib/ai/pipelineTokenBudget.ts` so that the total request stays under ~2000 tokens.
- Copy-correction and entity resolution use **full** spatial context (no truncation).

---

## API Route

`POST /api/structure-feedback` only:

1. Auth and rate limit
2. Parse `{ transcript, context }`
3. `runFeedbackPipeline(client, { transcript, context }, { useTranscriptNormalization: false, useVerification: true })`
4. Return `NextResponse.json(result)`

---

## Data Flow

```
Capture:   raw body → normalizeInput → { transcript, context }
Perception: capture → proper nouns, UI vocab, speech norm, [optional AI transcript], buildSpatialContext, truncate for AI
Understanding: perception + client → extractStructuredInstructions(spatialContext) → copy correction, entity resolution → [optional refine if compound]
Structuring: understanding + perception + context → buildInstructionGraph → ticketsFromGraph → { graph, tickets, refinedInstructions }
Output: structuring + understanding + perception + options → [optional verify] → clarity score → PipelineOutput
```

---

## Backward Compatibility

- Response shape (`StructureResponse`) unchanged.
- Existing types (`ExtractedInstruction`, `PipelineTicket`, `PipelineContext`) preserved.
- Verification is enabled by default in the route (`useVerification: true`); set to `false` to reduce cost.
