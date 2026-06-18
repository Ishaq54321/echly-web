"use client";

import { useEffect, useRef } from "react";

/**
 * useAnimationPause — pause a section's CSS animations while it's off-screen.
 *
 * Many marketing sections run *infinite* decorative CSS animations (drifting
 * code columns, soft-light clouds, the 55-bar voice waveform, pulsing rings).
 * Left alone these keep compositing/repainting even when scrolled far out of
 * view, burning GPU/CPU for nothing — a constant baseline that leaves no
 * headroom on weak hardware.
 *
 * This hook observes the returned ref's element and toggles the
 * `mk-anim-paused` class whenever it leaves the viewport (+200px margin so
 * animations are already running by the time it scrolls in). A single CSS rule
 * (in marketing.css) maps that class to `animation-play-state: paused` for the
 * subtree. Animations resume exactly where they left off — zero visual change
 * while the section is on-screen, which is the only time it's visible.
 *
 * Pure perf: no effect under prefers-reduced-motion (those animations are
 * already disabled in CSS) and a safe no-op where IntersectionObserver is
 * unavailable (the section just animates as before).
 */
export function useAnimationPause<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        el.classList.toggle("mk-anim-paused", !entry.isIntersecting);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
