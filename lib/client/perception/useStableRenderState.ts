"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_REVEAL_DELAY_MS = 100;

export type UseStableRenderStateOptions = {
  /** When true, show the placeholder as soon as `showPlaceholder` is true (no reveal delay). */
  immediate?: boolean;
  /** When not `immediate`, wait this long before showing the placeholder to reduce fast-network flicker. */
  revealDelayMs?: number;
};

/**
 * Stabilizes loading placeholder visibility: immediate for identity-style gates, short delay for data-only loads.
 */
export function useStableRenderState(
  showPlaceholder: boolean,
  options?: UseStableRenderStateOptions
): { active: boolean; showAnimated: boolean } {
  const immediate = options?.immediate ?? false;
  const revealDelayMs = options?.revealDelayMs ?? DEFAULT_REVEAL_DELAY_MS;

  const [active, setActive] = useState(() => Boolean(showPlaceholder && immediate));
  const [showAnimated, setShowAnimated] = useState(() => Boolean(showPlaceholder && immediate));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showPlaceholder) {
      if (immediate) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setActive(true);
        setShowAnimated(true);
        return;
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setActive(true);
        setShowAnimated(true);
      }, revealDelayMs);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActive(false);
    setShowAnimated(false);
  }, [showPlaceholder, immediate, revealDelayMs]);

  return { active, showAnimated };
}
