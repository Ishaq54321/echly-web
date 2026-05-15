"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface PillTooltipProps {
  content: string;
  side?: "top" | "bottom";
  children: React.ReactNode;
  delay?: number;
}

/**
 * Lightweight tooltip used inside the capture pill.
 *
 * Why a separate component (vs. components/ui/Tooltip):
 * the dashboard tooltip portals to document.body, but the pill mounts
 * inside the extension's shadow DOM. Styles from popup.css don't cross
 * the boundary, so a portaled tooltip would render unstyled. This
 * variant renders inline using CSS that's bundled into the pill stylesheet.
 *
 * Matches the dashboard tooltip's visual style: dark pill, 6px×12px,
 * 8px radius, weight 600, font-size 12px.
 */
export function PillTooltip({ content, side = "top", children, delay = 80 }: PillTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className="echly-pill-tooltip-anchor"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className={`echly-pill-tooltip echly-pill-tooltip--${side}`}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
