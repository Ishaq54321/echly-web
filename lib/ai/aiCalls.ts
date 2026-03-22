/**
 * AI Call Registry — LLM usage for the structure-feedback path (voice → ticket).
 *
 * `structure_feedback` is the single GPT-4o-mini extraction in `voiceToTicketPipeline`.
 */

export const AI_CALL_STRUCTURE_FEEDBACK = "structure_feedback" as const;

export const ALLOWED_AI_CALLS = [AI_CALL_STRUCTURE_FEEDBACK] as const;

export type AllowedAICall = (typeof ALLOWED_AI_CALLS)[number];
