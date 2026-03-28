"use client";

import { useCallback, useRef } from "react";

/**
 * Wraps async work so only the latest in-flight call is considered valid.
 * After `await`, use `if (!isCurrent(token)) return` before setState.
 */
export function useAsyncGeneration(): {
  nextToken: () => number;
  isCurrent: (token: number) => boolean;
} {
  const seq = useRef(0);
  const nextToken = useCallback(() => {
    seq.current += 1;
    return seq.current;
  }, []);
  const isCurrent = useCallback((token: number) => seq.current === token, []);
  return { nextToken, isCurrent };
}

/**
 * Runs `operation` and returns its result, or `null` if a newer run started (or the effect unmounted and bumped the seq externally).
 */
export function useSafeAsync() {
  const seq = useRef(0);
  return useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    const token = ++seq.current;
    try {
      const value = await operation();
      if (seq.current !== token) return null;
      return value;
    } catch (e) {
      if (seq.current !== token) return null;
      throw e;
    }
  }, []);
}
