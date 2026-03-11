"use client";

import { useCallback, useRef, useEffect } from "react";

export interface ResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ onResize, className = "" }: ResizeHandleProps) {
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        onResize(e.movementX);
        rafRef.current = null;
      });
    };
    const handlePointerUp = () => {
      isDraggingRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [onResize]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className={`resize-handle w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-black/5 transition-colors ${className}`}
      onPointerDown={handlePointerDown}
      style={{ minWidth: 4, width: 4 }}
    />
  );
}
