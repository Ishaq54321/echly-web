"use client";

import React, { useRef, useState, useLayoutEffect, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "right" | "left";
  delay?: number;
}

export function Tooltip({ content, children, position = "top", delay = 0 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<{ pos: string; left: number; top: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const show = useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(true);
    }
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
    setPlacement(null);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !anchorRef.current) return;

    const anchor = anchorRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 8;
    const EDGE_MARGIN = 8;

    const candidates: Record<string, { left: number; top: number }> = {
      top: {
        left: anchor.left + anchor.width / 2 - tip.width / 2,
        top: anchor.top - tip.height - GAP,
      },
      bottom: {
        left: anchor.left + anchor.width / 2 - tip.width / 2,
        top: anchor.bottom + GAP,
      },
      right: {
        left: anchor.right + GAP,
        top: anchor.top + anchor.height / 2 - tip.height / 2,
      },
      left: {
        left: anchor.left - tip.width - GAP,
        top: anchor.top + anchor.height / 2 - tip.height / 2,
      },
    };

    let bestPos = position;
    const preferred = candidates[position];

    if (position === "top" && preferred.top < 0) bestPos = "bottom";
    else if (position === "bottom" && candidates.bottom.top + tip.height > vh) bestPos = "top";
    else if (position === "right" && preferred.left + tip.width > vw) bestPos = "left";
    else if (position === "left" && preferred.left < 0) bestPos = "right";

    let { left, top } = candidates[bestPos];

    if (left < EDGE_MARGIN) left = EDGE_MARGIN;
    if (left + tip.width > vw - EDGE_MARGIN) left = vw - tip.width - EDGE_MARGIN;

    if (top < EDGE_MARGIN) top = EDGE_MARGIN;
    if (top + tip.height > vh - EDGE_MARGIN) top = vh - tip.height - EDGE_MARGIN;

    setPlacement({ pos: bestPos, left, top });
  }, [visible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!content) return children;

  return (
    <span
      ref={anchorRef}
      className="dashboard-tooltip-anchor"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && mounted && createPortal(
        <span
          ref={tooltipRef}
          className="dashboard-tooltip"
          style={{
            position: "fixed",
            visibility: placement ? "visible" : "hidden",
            left: placement ? placement.left : 0,
            top: placement ? placement.top : 0,
            transform: "none",
            zIndex: MODAL_LAYER_Z_INDEX + 100,
          }}
        >
          {content}
        </span>,
        document.body
      )}
    </span>
  );
}
