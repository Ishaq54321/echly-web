/**
 * AI Call Registry — Single source of truth for allowed LLM usage in the Echly pipeline.
 *
 * Only these AI calls are allowed. Do not add new calls without updating this registry.
 *
 * Pipeline flow: Capture → Perception → Understanding (AI) → Structuring → Output
 */

/**
 * 1. Instruction extraction (Understanding layer)
 * - Model: gpt-4o
 * - Purpose: Convert transcript + context into structured instructions (intent, entity, action, confidence).
 * - Entry: extractStructuredInstructions (lib/server/instructionExtraction.ts)
 */
export const AI_CALL_INSTRUCTION_EXTRACTION = "instruction_extraction" as const;

/**
 * 2. Instruction refinement (Understanding layer, optional when compound)
 * - Model: gpt-4o-mini
 * - Purpose: Split compound instructions into one instruction per developer action; preserve structure.
 * - Entry: refineStructuredInstructions (lib/server/instructionRefinement.ts)
 */
export const AI_CALL_INSTRUCTION_REFINEMENT = "instruction_refinement" as const;

/**
 * 3. Ticket verification (Output layer, optional)
 * - Model: gpt-4o-mini
 * - Purpose: Validate each ticket (title, action steps) against transcript and instructions.
 * - Entry: verifyTicketsBatch (lib/server/ticketVerification.ts)
 */
export const AI_CALL_TICKET_VERIFICATION = "ticket_verification" as const;

/**
 * 4. Session insight (separate feature, not part of feedback pipeline)
 * - Model: gpt-4o-mini
 * - Purpose: Generate executive summary of session feedback patterns.
 * - Entry: POST /api/session-insight (app/api/session-insight/route.ts)
 */
export const AI_CALL_SESSION_INSIGHT = "session_insight" as const;

/**
 * 5. Ticket title synthesis (Structuring layer)
 * - Model: gpt-4o-mini
 * - Purpose: Generate all ticket titles in a single request (max 60 chars each).
 * - Entry: generateTicketTitlesBatch (lib/ai/ticketTitle.ts)
 */
export const AI_CALL_TICKET_TITLE = "ticket_title" as const;

/** All allowed AI call identifiers. */
export const ALLOWED_AI_CALLS = [
  AI_CALL_INSTRUCTION_EXTRACTION,
  AI_CALL_INSTRUCTION_REFINEMENT,
  AI_CALL_TICKET_VERIFICATION,
  AI_CALL_SESSION_INSIGHT,
  AI_CALL_TICKET_TITLE,
] as const;

export type AllowedAICall = (typeof ALLOWED_AI_CALLS)[number];
