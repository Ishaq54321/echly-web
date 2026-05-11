/**
 * Token budget utilities for the AI pipeline.
 */

export function truncateForTokenBudget(s: string, maxChars: number): string {
  if (!s || s.length <= maxChars) return s;
  return s.slice(0, maxChars).trim();
}
