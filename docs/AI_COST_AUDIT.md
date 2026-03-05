# AI Cost Audit Report

**Scope:** Identify unnecessary AI cost or token usage without changing architecture, features, or pipeline flow.

**Constraints:** No architectural changes; no removal of pipeline stages; detection of waste, redundancy, and inefficient token usage only.

---

## SECTION 1 — Active AI Calls

Every place in the repository where an OpenAI call is made:

| # | File path | Function name | Model | temperature | max_tokens | Main pipeline / Optional |
|---|-----------|---------------|-------|-------------|------------|---------------------------|
| 1 | `lib/server/instructionExtraction.ts` | `extractStructuredInstructions` | gpt-4o | 0 | 1600 | **Main** (Understanding layer) |
| 2 | `lib/server/instructionRefinement.ts` | `refineStructuredInstructions` | gpt-4o-mini | 0 | 2000 | **Main** (optional when compound instructions) |
| 3 | `lib/ai/ticketTitle.ts` | `generateTicketTitlesBatch` | gpt-4o-mini | 0 | 120 | **Main** (Structuring layer) |
| 4 | `lib/server/ticketVerification.ts` | `verifyTicketsBatch` (per-ticket loop) | gpt-4o-mini | 0 | 500 | **Main** (optional; enabled in route) |
| 5 | `lib/server/transcriptNormalization.ts` | `normalizeTranscript` | gpt-4o-mini | 0 | 500 | **Optional** (off by default in pipeline) |
| 6 | `app/api/session-insight/route.ts` | POST handler (inline completion) | gpt-4o-mini | 0 | 160 | **Optional** (separate feature; not feedback pipeline) |

**Note:** `lib/server/uiVocabularyNormalization.ts` is deterministic (no AI). The string `"modal"` there is a UI term mapping, not a model name.

---

## SECTION 2 — Runtime Pipeline

Real runtime path when feedback is submitted:

1. **Extension capture** → transcript + context (visibleText, nearbyText, domPath, elements, etc.)
2. **POST /api/structure-feedback** → validates body, calls `runFeedbackPipeline(client, { transcript, context }, { useTranscriptNormalization: false, useVerification: true })`
3. **runFeedbackPipeline** (lib/ai/runFeedbackPipeline.ts):
   - **Capture:** `normalizeInput` (no AI)
   - **Perception:** proper noun anchoring, UI vocab norm, speech norm, clause split, grounding (all deterministic). **Transcript normalization:** not used (useTranscriptNormalization: false).
   - **Understanding:** `extractStructuredInstructions` (1 AI call — gpt-4o). If `hasCompoundInstructions(instructions)` then `refineStructuredInstructions` (1 AI call — gpt-4o-mini).
   - **Structuring:** `buildInstructionGraph`, `ticketsFromGraph`, then `generateTicketTitlesBatch` (1 AI call — gpt-4o-mini, single request for all tickets).
   - **Output:** with useVerification: true, `verifyTicketsBatch` runs — **one AI call per ticket** (gpt-4o-mini each).

**AI calls that actually execute in this flow:**

| Call | When |
|------|------|
| **Instruction extraction** | Always (1 call) |
| **Instruction refinement** | Only when compound instructions detected (0 or 1 call) |
| **Ticket title batch** | When tickets.length > 0 (1 call total) |
| **Ticket verification** | When useVerification is true and tickets.length > 0 (**N calls, one per ticket**) |

**Not in this flow:** Transcript normalization (disabled), session-insight (separate API).

---

## SECTION 3 — Prompt Size Audit

### 3.1 Instruction extraction (`extractStructuredInstructions`)

**System prompt (full template):**

```
You are an AI that converts spoken UI feedback into structured product tickets.
INPUTS: Transcript (user's spoken feedback), Page Context (visible text, DOM text, nearby UI labels).
Your job is to extract structured UI instructions. You do NOT summarize.
Each instruction must identify:
1. Intent — one of: COPY_CHANGE | UI_LAYOUT | UI_VISUAL_ADJUSTMENT | COMPONENT_CHANGE | FORM_LOGIC | DATA_VALIDATION | PERFORMANCE_OPTIMIZATION | ANALYTICS_TRACKING | BACKEND_BEHAVIOR | SECURITY_REQUIREMENT | GENERAL_INVESTIGATION
2. Entity — the specific UI element affected (see RULE 1)
3. Action — clear, developer-actionable instruction (see RULE 2)
4. Confidence — 0.0–1.0
[RULE 1–4, INTENT TYPES, DEFINITIONS, CONFIDENCE RULES, OUTPUT FORMAT, EXTRACTION PRINCIPLES — see lib/server/instructionExtraction.ts lines 59–210]
Only return valid JSON.
```

- **System prompt:** ~5,200 characters → **~1,300 tokens**
- **User prompt:** `User feedback transcript: "<full transcript>"` + optional grounding hints + spatial context (DOM 1500 + nearby 1000 + viewport 2000 + OCR 1500 chars) + optional textContext (up to 1000) + elements JSON (up to 2000). **Transcript is not truncated** — long transcripts can make user prompt very large.
- **Context data:** After `filterRelevantContext` and truncation, spatial fields are capped at 1200/800/1200/800 chars; buildUserContent then applies 1500/1000/2000/1500. Effective max context ~4000–6000 chars (~1,000–1,500 tokens) plus transcript length.

**Flags:**

- **Transcript unbounded:** Full `transcript` is sent; no cap. A 2,000-character transcript adds ~500 tokens; 8,000 characters adds ~2,000 tokens.
- **Possible overlap:** When both `spatialContext` and `textContext` exist, we send filtered spatial context plus "Additional visible text" (textContext.slice(0, 1000)) — some duplication possible between viewport/visibleText and "visible text from page".
- **System prompt size:** Long (1,300 tokens) but necessary for intent list and rules; could be shortened slightly (e.g. intent definitions).

---

### 3.2 Instruction refinement (`refineStructuredInstructions`)

**System prompt:** ~900 characters (~225 tokens). Defines refiner role, rules (one instruction = one action, preserve meaning, output JSON with intent/entity/action/confidence).

**User prompt:** `"Structured instructions to refine (split compounds; output same JSON shape):"` + `JSON.stringify(instructions, null, 2)`. Input is only the extracted instructions (no page context).

- **System:** ~225 tokens
- **User:** Depends on instruction count and length; typically a few hundred tokens. **Reasonable.**

**Flags:** None major. max_tokens 2000 is high for refinement output; most responses are much smaller.

---

### 3.3 Ticket title batch (`generateTicketTitlesBatch`)

**System:** `"You generate short engineering ticket titles."` (~15 tokens).

**User:** `"For each set of UI changes generate a concise ticket title (max 60 characters). Return JSON with a \"titles\" array of strings in the same order."` + input JSON (actions per ticket).

- **System:** ~15 tokens
- **User:** ~50–200+ tokens depending on ticket count and action step length.

**Flags:** None. Single call for all titles is efficient.

---

### 3.4 Ticket verification (`verifyTicketsBatch` — per ticket)

**System prompt:** ~1,100 characters (~275 tokens). Verifier role, checks (reflects instructions, actionable, no hallucination), output format.

**User prompt (repeated for every ticket):**

- `"Original transcript (full feedback):"` + `originalTranscript.trim().slice(0, 1500)` (up to 1500 chars)
- `"Instructions (relevant to this ticket):"` + **all** instruction strings (numbered)
- `"Ticket to verify (ticket i of N):"` + title + action steps JSON

- **System:** ~275 tokens (sent N times in N separate requests)
- **User per call:** ~375 tokens (transcript slice) + instructions (all of them, not ticket-specific) + one ticket. **Same transcript and same full instruction list are sent N times.**

**Flags:**

- **Repeated context:** Full transcript (1500 chars) and full instruction list sent once per ticket. For 3 tickets, transcript + instructions are sent 3 times → **clear redundancy**.
- **Instructions not ticket-scoped:** Prompt says "relevant to this ticket" but sends all instructions every time; model must infer relevance.

---

### 3.5 Transcript normalization (`normalizeTranscript`)

**System:** ~700 characters (~175 tokens). Rules for STT/grammar fixes, preserve intent.

**User:** `Normalize this transcript:\n\n"<trimmed>"` — full transcript, no length cap.

- **System:** ~175 tokens
- **User:** Depends on transcript length (unbounded).

**Flags:** Not used in current pipeline (useTranscriptNormalization: false). If enabled, transcript should be capped for cost.

---

### 3.6 Session insight (`app/api/session-insight/route.ts`)

**System:** SESSION_INSIGHT_SYSTEM_PROMPT ~1,800 characters (~450 tokens). Summary rules, no inference, max 3 sentences.

**User:** Condensed feedback lines (title, context, tags, action) per item, up to 200 items; each context/action truncated (300 / 120 chars).

- **System:** ~450 tokens
- **User:** Can be large (200 items × several lines) but truncated per field. **Reasonable for feature.**

**Flags:** None for pipeline (separate feature).

---

## SECTION 4 — Model Usage

| Call | Model | Assessment |
|------|--------|------------|
| **Extraction** | gpt-4o | **Justified.** Complex structured extraction, multiple intents and entities; higher capability appropriate. |
| **Refinement** | gpt-4o-mini | **Good.** Splitting compounds is well-defined; mini is sufficient. |
| **Title generation** | gpt-4o-mini | **Good.** Short titles; mini is sufficient. |
| **Verification** | gpt-4o-mini | **Good.** Binary-style checks; mini is sufficient. **Maybe optional:** pipeline already works with useVerification: false; verification is a quality safeguard, not required for flow. |
| **Transcript normalization** | gpt-4o-mini | **Good.** Grammar/STT fixes; mini sufficient. Currently off. |
| **Session insight** | gpt-4o-mini | **Good.** Summarization with strict rules; mini sufficient. |

---

## SECTION 5 — Duplicate or Loop Calls

1. **Verification per ticket:** `verifyTicketsBatch` runs a **separate AI call for each ticket**. For 3 tickets there are 3 verification calls. Same system prompt and same large user payload (transcript + all instructions) are sent repeatedly.
2. **Title generation:** Single batch call for all tickets — **no duplicate**; good.
3. **Extraction retry:** On empty/clarification result and retryOnce, extraction can run **twice** for the same feedback (by design for robustness).
4. **Refinement:** At most one call per feedback when compound instructions are detected — **no loop**.

---

## SECTION 6 — Token Waste

| Issue | Location | Estimate |
|------|----------|----------|
| **Verification: same transcript + instructions sent N times** | ticketVerification.ts | For N tickets: (transcript slice ~375 tokens + instructions ~100–300 tokens) × (N − 1) = **~500–700 tokens wasted per extra ticket** (e.g. 3 tickets → ~1,000–1,400 tokens redundant). |
| **Extraction: transcript unbounded** | instructionExtraction.ts buildUserContent | Long transcripts (e.g. 500+ words) can add 500–2,000+ tokens per request with no cap. **Variable; can be large.** |
| **Extraction: textContext + spatial overlap** | instructionExtraction.ts | When both spatialContext and textContext exist, "Additional visible text" (1000 chars) can overlap viewport/visibleText. **~50–250 tokens possible overlap.** |
| **Verification: all instructions per ticket** | ticketVerification.ts | Sending every instruction for every ticket; only the current ticket’s instructions are strictly needed. **Modest waste per call** (instructions × (N−1) across N calls). |
| **Refinement: max_tokens 2000** | instructionRefinement.ts | Output is typically a small JSON array; 2000 is overkill. **No input waste;** output budget could be lower. |

**Rough total redundant/waste estimate per feedback (3 tickets, verification on):** ~1,500–2,500 tokens (verification repeat + overlap); plus variable if transcript is very long.

---

## SECTION 7 — Safe Cost Optimizations

All of the following keep architecture and pipeline flow unchanged.

1. **Cap transcript length for extraction**  
   - Before calling `extractStructuredInstructions`, truncate transcript to e.g. 1,500–2,000 characters (or ~500 words) for the AI call.  
   - **Saves:** Variable; large for long transcripts. **Risk:** Very long feedback might lose tail content; 1,500–2,000 chars usually covers one coherent chunk.

2. **Reduce verification redundancy**  
   - **Option A:** Build one verification request that includes transcript + instructions once, and list all N tickets; ask model to return an array of N verification results. Single call instead of N. (Requires prompt/response shape change but same stage.)  
   - **Option B (minimal change):** For each verification call, send only the instructions that belong to that ticket (if the graph/ticket structure already maps instructions to tickets). Shorter prompts and less repeated text.  
   - **Saves:** Option A: (N−1) × (transcript + instructions) tokens. Option B: smaller per-call prompts and less repetition.

3. **Lower refinement max_tokens**  
   - Set `max_tokens` to 800 or 1000 in `refineStructuredInstructions`; output is one JSON array of instructions.  
   - **Saves:** Output token budget only; small. **Risk:** Very rare edge case of many split instructions might hit limit.

4. **Tighten extraction user prompt**  
   - When both spatialContext and textContext exist, avoid sending "Additional visible text" if spatial viewport/OCR already cover it (or cap to 500 chars).  
   - **Saves:** ~50–250 tokens per extraction. **Risk:** Low if spatial context is already populated.

5. **Skip verification for single-ticket, high-confidence**  
   - If `tickets.length === 1` and `segmentConfidence >= 0.85`, skip verification and treat as pass.  
   - **Saves:** One gpt-4o-mini call when conditions hold. **Risk:** Some single-ticket cases might still benefit from verification; make threshold configurable.

6. **Cap transcript in transcript normalization (if ever enabled)**  
   - If useTranscriptNormalization is turned on, cap transcript to e.g. 1,500 characters before calling the normalizer.  
   - **Saves:** Variable when feature is on.

---

## SECTION 8 — Estimated Cost per Feedback

**Assumptions:**  
- Prices (approximate): gpt-4o $2.50/1M input, $10/1M output; gpt-4o-mini $0.15/1M input, $0.60/1M output (check current pricing).  
- Typical case: transcript ~100 words (~400 chars), 2 instructions, 2 tickets, refinement once, verification on.

**Per-feedback call sequence:**

| Call | Model | Input (tokens, approx) | Output (tokens, approx) |
|------|--------|-------------------------|--------------------------|
| Extraction | gpt-4o | 2,200 (system 1,300 + user 900) | 150 |
| Refinement | gpt-4o-mini | 450 (system 225 + user 225) | 80 |
| Title batch | gpt-4o-mini | 120 (system 15 + user 105) | 30 |
| Verification × 2 | gpt-4o-mini | 700 × 2 = 1,400 (system 275 + user 425, ×2) | 50 × 2 = 100 |

**Totals (typical):**

- **Input:** 2,200 (gpt-4o) + 450 + 120 + 1,400 = 4,170 (gpt-4o-mini) → 2,200 gpt-4o + 2,970 gpt-4o-mini input tokens.  
- **Output:** 150 (gpt-4o) + 80 + 30 + 100 = 360 gpt-4o-mini output tokens (gpt-4o output 150).

**Cost (illustrative):**

- gpt-4o: 2,200 × 2.5/1e6 + 150 × 10/1e6 ≈ $0.0055 + $0.0015 ≈ **$0.007**  
- gpt-4o-mini: (2,970 + 360) × 0.15/1e6 + 360 × 0.60/1e6 ≈ $0.0005 + $0.0002 ≈ **$0.0007**  
- **Total per feedback (typical): ~\$0.0077** (dominated by gpt-4o extraction).

With 3 tickets (3 verification calls), add ~700 tokens input + 50 output per extra verification → ~\$0.0002 per extra ticket. Long transcripts (e.g. 400 tokens transcript → +100 tokens extraction input) add a few percent.

**Realistic range:** **~\$0.005–\$0.012 per feedback** depending on ticket count, refinement on/off, and transcript length.

---

## SECTION 9 — Final Recommendations

### HIGH IMPACT

1. **Batch verification into one call (or send ticket-relevant instructions only)**  
   - **Change:** Either one request with transcript + instructions + all tickets → one response with N verification results, or per-ticket requests that only include instructions for that ticket.  
   - **Expected reduction:** Eliminate (N−1) full verification requests and repeated transcript/instruction tokens. **~30–50% of verification cost and a meaningful share of total feedback cost when verification is on.**

2. **Cap transcript length for extraction (e.g. 1,500–2,000 chars)**  
   - **Change:** Truncate transcript (with ellipsis or at word boundary) before building extraction user content.  
   - **Expected reduction:** Prevents runaway cost on long transcripts; **saves 100–500+ tokens on long feedback**, and avoids rare very large requests.

### MEDIUM IMPACT

3. **Optional verification for single-ticket, high-confidence**  
   - **Change:** If tickets.length === 1 and segmentConfidence >= 0.85, skip verification.  
   - **Expected reduction:** **One gpt-4o-mini call saved** when condition holds (~\$0.0001 per such feedback; adds up at scale).

4. **Reduce overlap in extraction (textContext vs spatial)**  
   - **Change:** When spatialContext is present, omit or cap "Additional visible text" (e.g. 500 chars or skip if viewport scope is long).  
   - **Expected reduction:** **~50–250 tokens per extraction** (~\$0.00004 input on gpt-4o).

### LOW IMPACT

5. **Lower refinement max_tokens to 800–1000**  
   - **Expected reduction:** Minor; output token budget only.

6. **If transcript normalization is enabled later, cap transcript there too**  
   - **Expected reduction:** Only when feature is on; avoids long normalization calls.

---

**Document version:** 1.0  
**Audit date:** 2025-03-05
