/**
 * Estimate OpenAI API cost from token usage (USD).
 * Used for telemetry logging only; pricing may change — update when needed.
 */

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
    "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  };

  const p = pricing[model];
  if (!p) return 0;

  const inputCost = promptTokens * p.input;
  const outputCost = completionTokens * p.output;

  return inputCost + outputCost;
}
