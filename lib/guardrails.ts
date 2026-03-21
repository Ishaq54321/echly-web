export const ECHLY_STRICT_MODE = true;

export function assert(condition: unknown, message: string): asserts condition {
  if (!ECHLY_STRICT_MODE) return;
  if (condition) return;
  console.error("[GUARDRAIL]", message);
  throw new Error(message);
}
