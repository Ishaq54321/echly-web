"use client";

import React, { useEffect, useRef } from "react";

export interface SelectedElementOverlayProps {
  /** The element captured by the user. Overlay re-measures it every frame. */
  targetElement: HTMLElement | null;
}

/**
 * Persistent purple outline drawn over the captured element throughout the
 * capture session (recording, typing, processing). Pointer-events: none so it
 * doesn't block the underlying page.
 *
 * Tracks the element via a rAF loop applying transform/width/height directly
 * to the DOM node (not React state). The scroll event fires AFTER layout has
 * already shifted, which produces a visible lag-and-snap; running every frame
 * keeps the overlay synchronized with whatever the latest rect is.
 */
export function SelectedElementOverlay({ targetElement }: SelectedElementOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!targetElement) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        overlay.style.display = "none";
        return;
      }
      overlay.style.display = "block";
      overlay.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    };

    updatePosition();

    const tick = () => {
      updatePosition();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(updatePosition);
    ro.observe(targetElement);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      ro.disconnect();
    };
  }, [targetElement]);

  if (!targetElement) return null;

  return (
    <div
      ref={overlayRef}
      className="echly-selected-overlay"
      data-annote-ui="true"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        display: "none",
      }}
    />
  );
}
