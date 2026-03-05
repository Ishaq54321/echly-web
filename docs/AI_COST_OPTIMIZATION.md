# AI Cost Optimization Report

**Date:** March 2025  
**Scope:** Token efficiency only. No architecture, model, API, or behavior changes.

---

## Summary

Two optimizations were implemented to reduce token waste in the Echly feedback pipeline:

1. **Batch ticket verification** — One OpenAI call for all tickets instead of one per ticket.
2. **Cap transcript length for extraction** — Transcript truncated to 2,000 characters before the extraction prompt.

---

## OPTIMIZATION 1 — Batch Ticket Verification

### Changes made

**File:** `lib/server/ticketVerification.ts`

- **System prompt:** Updated to describe batch verification. The model now receives one JSON input with `transcript`, `instructions`, and `tickets` (array) and must return a single JSON object with a `results` array — one verification object per ticket, in the same order.
- **User message:** Replaced per-ticket text blocks with a single JSON payload:
  - `transcript`: same as before (trimmed, slice 0–1500 chars).
  - `instructions`: full list (once).
  - `tickets`: array of `{ id, title, actions }` (one entry per ticket).
- **API usage:** One `client.chat.completions.create` call for the entire batch instead of a loop over tickets.
- **Response parsing:** New `parseBatchVerification(content, ticketCount)` parses the `results` array and maps each element to `VerificationResult` via `parseOneVerificationResult`. If the array is shorter than `ticketCount`, missing entries are filled with `conservativeVerification()`.
- **Retry:** Single retry for the whole batch on failure (aligned with previous “retry once” semantics).
- **`applyVerifierFinalDecision`:** Unchanged; still receives `VerificationResult[]` and returns it as-is.
- **`max_tokens`:** Set to `Math.max(500, tickets.length * 150)` so the model has enough space for multiple results.

### Preserved

- `VerificationResult` shape and semantics.
- Order of results (index i corresponds to ticket i).
- Conservative fallback on parse failure or missing entries.
- Same transcript slice (1500 chars) and instruction set as before.

### Estimated token reduction

- **Before:** For N tickets, N requests × (system ~275 tokens + user ~375 + instructions). Example (3 tickets): 3 × (275 + 375 + ~150) ≈ **2,400 tokens input**.
- **After:** 1 request × (system ~275 + user: transcript ~375 + instructions ~150 + tickets payload ~variable). One system prompt and one transcript/instructions block. Ticket payload adds roughly 50–150 tokens per ticket.
- **Savings:** Approximately **(N − 1) × (275 + 375 + instructions)** input tokens. For 3 tickets: ~1,600 input tokens saved per run. Scales with N.

### Estimated cost reduction

- gpt-4o-mini input: fewer input tokens per feedback with verification.
- For 3 tickets: ~1,600 input tokens saved per feedback; at $0.15/1M input tokens, ~**$0.00024** per feedback. Cost savings scale with ticket count and feedback volume.

---

## OPTIMIZATION 2 — Cap Transcript Length for Extraction

### Changes made

**File:** `lib/server/instructionExtraction.ts`

- **Helper:** `capTranscript(transcript: string): string`
  - `MAX = 2000`.
  - If empty/falsy, returns `""`.
  - If length ≤ 2000, returns transcript as-is.
  - Otherwise returns `transcript.slice(0, 2000) + "..."`.
- **Usage:** In `extractStructuredInstructions`, after trimming the transcript, `cappedTranscript = capTranscript(trimmed)` is computed once. All prompt construction uses `cappedTranscript` (e.g. `buildUserContent(cappedTranscript, ...)`). The retry condition still uses `cappedTranscript.length > 20` for consistency.

### Preserved

- Extraction behavior for transcripts ≤ 2000 characters (unchanged).
- All other inputs (context, spatialContext, groundedClauses) unchanged.
- Model, temperature, max_tokens, and API contract unchanged.

### Estimated token reduction

- **Before:** Full transcript in the user message (unbounded). Example: 8,000 chars ≈ ~2,000 tokens.
- **After:** At most 2,000 chars + "..." ≈ ~500 tokens for the transcript portion.
- **Savings:** Variable; for transcripts over 2,000 characters, **~1,500+ input tokens saved per extraction** (e.g. 8k chars → 2k chars).

### Estimated cost reduction

- gpt-4o input: savings apply to the extraction call only. For a long transcript (e.g. 8k chars), ~1,500 input tokens saved per feedback; at $2.50/1M input (example gpt-4o), ~**$0.00375** per such feedback. Shorter transcripts see no change.

---

## Files modified

| File | Changes |
|------|--------|
| `lib/server/ticketVerification.ts` | Batch verification: single request with transcript + instructions + all tickets; new system prompt and `parseBatchVerification`; `VerificationResult[]` and order preserved. |
| `lib/server/instructionExtraction.ts` | Added `capTranscript()` (max 2000 chars); extraction prompt uses capped transcript only. |

---

## Validation

- **TypeScript:** `npx tsc --noEmit` passes.
- **Pipeline behavior:** `runFeedbackPipeline` unchanged; it still calls `verifyTicketsBatch` and `applyVerifierFinalDecision` with the same contract. Verification results still map 1:1 to tickets by index.
- **Extraction:** Long transcripts are truncated before the prompt; extraction logic and output shape unchanged. Retry logic still uses capped transcript length.

---

## Combined impact (order of magnitude)

- **Verification (e.g. 3 tickets):** ~1,600 input tokens saved per feedback (gpt-4o-mini).
- **Extraction (e.g. long transcript):** ~1,500+ input tokens saved per feedback (gpt-4o).
- For a typical run with verification and one long transcript: **~3,000+ tokens saved per feedback**, with proportional cost reduction at current pricing.
