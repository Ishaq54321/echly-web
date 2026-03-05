/**
 * Format an action step for display only.
 * Does not modify stored data; use at UI rendering layer.
 * - Capitalize first letter
 * - Remove trailing punctuation
 */
export function formatActionStep(step: string): string {
  if (!step) return "";

  let formatted = step.trim();

  // remove trailing punctuation
  formatted = formatted.replace(/[.]+$/, "");

  // capitalize first letter
  formatted =
    formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return formatted;
}
