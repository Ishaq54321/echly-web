"use client";

/**
 * <CursorTip /> — a small pill that follows the cursor while it's over a
 * demo surface, hinting it's interactive (e.g. "Click to interact" on the
 * dashboard demo in NovaShowcase). Positioned via a translate3d CSS var
 * written directly on the element (no React state per pointermove — keeps
 * this at 60fps), fades in/out on enter/leave, and never intercepts clicks.
 *
 * Wrap the interactive surface in a `position: relative` container and
 * render this as its last child.
 */

import { useEffect, useRef } from "react";
import { MousePointerClick } from "lucide-react";

export function CursorTip({
  label = "Click to interact",
}: {
  label?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    const host = node?.parentElement;
    if (!node || !host) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onEnter = (e: PointerEvent) => {
      onMove(e);
      node.classList.add("is-visible");
    };
    const onLeave = () => {
      node.classList.remove("is-visible");
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span ref={ref} className="nv-cursor-tip" aria-hidden="true">
      <MousePointerClick size={12} strokeWidth={2.2} />
      {label}
    </span>
  );
}
