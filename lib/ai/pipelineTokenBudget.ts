/**
 * Token budget helpers for the feedback pipeline.
 * Target: < 2000 tokens per AI request. Uses ~4 chars/token approximation.
 */

const CHARS_PER_TOKEN_APPROX = 4;
/** Max context chars (non-transcript) to keep total request under ~2000 tokens. */
const MAX_CONTEXT_CHARS = 6000;

export function truncateForTokenBudget(s: string, maxChars: number): string {
  if (!s || s.length <= maxChars) return s;
  return s.slice(0, maxChars).trim();
}

/** Spatial context shape for truncation. */
export interface SpatialContextLike {
  domScopeText: string;
  nearbyScopeText: string;
  viewportScopeText: string;
  screenshotOCRText: string;
}

/**
 * Truncate spatial context fields so combined size stays under budget.
 * Priority: dom > nearby > viewport > ocr. Target < 2000 tokens per request.
 */
export function truncateSpatialContext(ctx: SpatialContextLike): SpatialContextLike {
  const limits: Record<keyof SpatialContextLike, number> = {
    domScopeText: 1200,
    nearbyScopeText: 800,
    viewportScopeText: 1200,
    screenshotOCRText: 800,
  };
  return {
    domScopeText: truncateForTokenBudget(ctx.domScopeText, limits.domScopeText),
    nearbyScopeText: truncateForTokenBudget(ctx.nearbyScopeText, limits.nearbyScopeText),
    viewportScopeText: truncateForTokenBudget(ctx.viewportScopeText, limits.viewportScopeText),
    screenshotOCRText: truncateForTokenBudget(ctx.screenshotOCRText, limits.screenshotOCRText),
  };
}

export function getMaxContextChars(): number {
  return MAX_CONTEXT_CHARS;
}

export function approximateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN_APPROX);
}
