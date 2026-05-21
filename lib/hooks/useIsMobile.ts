"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT_PX = 768;

/**
 * Returns `true` when the viewport width is below the mobile breakpoint (768px,
 * matching Tailwind's `md:` boundary).
 *
 * When to use this vs. CSS:
 * - PREFER Tailwind responsive prefixes (`md:`, `lg:`, `xl:`) for any change that
 *   is purely visual — spacing, colors, hidden/shown elements, layout flips.
 *   CSS-only changes avoid hydration mismatch and have zero JS cost.
 * - USE this hook only when mobile behavior must be state-driven: a drawer that
 *   opens/closes, conditional rendering of a structurally different component
 *   tree, or behavior wired into event handlers (e.g. close on outside tap).
 *
 * SSR caveat: the initial render returns `false` on both server and first client
 * paint, then flips to the real value after mount. On a mobile device this means
 * a brief flash of desktop layout during hydration. For structural swaps, gate
 * the mobile-only tree behind a mounted check or use CSS `md:hidden` siblings
 * instead.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

/**
 * Returns `true` when the viewport matches the supplied media query string.
 *
 * Same usage guidance as `useIsMobile`: prefer Tailwind responsive prefixes for
 * visual-only changes, and reach for this only when behavior depends on the
 * match. Pass a full media query string, e.g. `"(min-width: 1024px)"` or
 * `"(prefers-reduced-motion: reduce)"`.
 *
 * SSR caveat: the initial value is `false`; the real match resolves after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
