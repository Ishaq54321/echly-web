import { useRef } from "react";

/**
 * Holds the last committed value while `isReady` is false to avoid empty flashes.
 * Pass `resetKey` (e.g. `sessionId`) so a context switch does not reuse a stale snapshot.
 * Updates synchronously when `isReady` — no effect delay.
 */
export function useStableState<T>(
  value: T,
  isReady: boolean,
  resetKey?: string | null
) {
  const stableRef = useRef(value);
  const lastResetKeyRef = useRef(resetKey);

  if (resetKey !== undefined && resetKey !== lastResetKeyRef.current) {
    lastResetKeyRef.current = resetKey;
    stableRef.current = value;
  }

  if (isReady) {
    stableRef.current = value;
  }

  return isReady ? value : stableRef.current;
}
