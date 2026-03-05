# AI Cost Telemetry

This document describes how the Echly pipeline measures and logs estimated AI cost per feedback and where to find the logs.

## How cost is calculated

- **Source**: `lib/ai/costEstimator.ts` exports `estimateCost(model, promptTokens, completionTokens)`.
- **Pricing** (USD per token, as of implementation):
  - **gpt-4o**: input 2.5/1M, output 10/1M
  - **gpt-4o-mini**: input 0.15/1M, output 0.6/1M
- **Formula**: `inputCost = promptTokens * inputPricePerToken`, `outputCost = completionTokens * outputPricePerToken`, `cost = inputCost + outputCost`.
- **Units**: All logged costs are in **USD**. Values are small (e.g. 0.001–0.01 per feedback) unless prompts are very large.

Pricing is fixed in code; update `costEstimator.ts` when OpenAI pricing changes.

## Where logs appear

Logs go to **stdout** (server console / process logs). They are emitted by:

1. **Per-call logs** — Every OpenAI completion logs once with the `[AI COST]` prefix.
2. **Per-feedback totals** — At the end of each feedback run, the pipeline logs `[AI COST TOTAL]` and `[AI COST SUMMARY]`.

No new files or databases are written; this is logging only.

## Log formats

### Per-call: `[AI COST]`

Emitted after each OpenAI call in:

| Stage                    | File                               | Model        |
|--------------------------|------------------------------------|--------------|
| extraction               | `lib/server/instructionExtraction.ts` | gpt-4o       |
| refinement               | `lib/server/instructionRefinement.ts`  | gpt-4o-mini  |
| verification             | `lib/server/ticketVerification.ts`     | gpt-4o-mini  |
| title                    | `lib/ai/ticketTitle.ts`                | gpt-4o-mini  |
| transcript_normalization | `lib/server/transcriptNormalization.ts` | gpt-4o-mini  |
| session_insight          | `app/api/session-insight/route.ts`     | gpt-4o-mini  |

Example:

```json
[AI COST] {
  "stage": "extraction",
  "model": "gpt-4o",
  "prompt_tokens": 1200,
  "completion_tokens": 340,
  "cost": 0.007
}
```

- **stage**: Pipeline stage or API (see table above).
- **model**: Model used for that call.
- **prompt_tokens** / **completion_tokens**: From `response.usage`.
- **cost**: Estimated USD for that single call.

If a stage is skipped (e.g. no refinement, no verification), no `[AI COST]` log is emitted for that stage for that feedback.

### Per-feedback: `[AI COST TOTAL]`

Emitted once at the end of each feedback pipeline run (in `lib/ai/runFeedbackPipeline.ts`):

```json
[AI COST TOTAL] { "feedbackCost": 0.01234 }
```

- **feedbackCost**: Sum of all AI costs for that feedback (normalization + extraction + refinement + title + verification), in USD.

### Per-feedback: `[AI COST SUMMARY]`

Emitted immediately after `[AI COST TOTAL]` for the same run:

```json
[AI COST SUMMARY] {
  "normalizationCost": 0,
  "extractionCost": 0.008,
  "refinementCost": 0.001,
  "titleCost": 0.0005,
  "verificationCost": 0.002,
  "totalCost": 0.0115
}
```

- **normalizationCost**: Transcript normalization (optional; 0 if disabled).
- **extractionCost**: Instruction extraction (gpt-4o).
- **refinementCost**: Instruction refinement when compound instructions are detected (gpt-4o-mini); 0 if skipped.
- **titleCost**: Ticket title generation (gpt-4o-mini).
- **verificationCost**: Ticket verification (gpt-4o-mini); 0 if verification is disabled.
- **totalCost**: Same as `feedbackCost` in `[AI COST TOTAL]`.

## How to read the logs

1. **Cost per feedback**: Use `[AI COST TOTAL]` or `[AI COST SUMMARY].totalCost`.
2. **Which stage is expensive**: Use `[AI COST SUMMARY]` to compare stage costs; use `[AI COST]` for token and cost per call.
3. **Retries**: If a stage retries (e.g. extraction), you will see multiple `[AI COST]` entries for that stage; the pipeline adds all of them into the stage cost and into `totalCost`.
4. **Session insight**: The session-insight API logs `[AI COST]` with `stage: "session_insight"`; it is not part of the feedback pipeline, so it is not included in `[AI COST TOTAL]` or `[AI COST SUMMARY]`.

## Implementation notes

- **No architecture or prompt changes**: Only telemetry and return-value extensions (cost) were added.
- **Optional stages**: When transcript normalization or verification is off, their cost is 0 and no AI is called for those stages.
- **Unknown models**: If a model is not in the pricing map, `estimateCost` returns 0 and the per-call log still records tokens.
