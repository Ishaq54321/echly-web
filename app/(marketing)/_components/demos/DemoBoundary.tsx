"use client";

import { useCallback, useState, type MouseEvent, type ReactNode } from "react";

// Wraps a real product component embedded in a marketing demo. Click events
// inside the wrapper are intercepted so demo embeds never trigger real-looking
// actions (no router pushes, no fake API calls, no state mutations propagating
// out of the demo island).
//
// `disabled: true` strips event interception entirely — use for fully static
// embeds (e.g., a screenshot inside a BrowserFrame) where the wrapper is purely
// presentational and you want no click side effects at all.
//
// `tooltip` shows a transient "This is a demo — {tooltip}" message after a click.

export interface DemoBoundaryProps {
  children: ReactNode;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function DemoBoundary({
  children,
  tooltip,
  disabled,
  className,
}: DemoBoundaryProps) {
  const [hint, setHint] = useState<string | null>(null);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (tooltip) {
        setHint(tooltip);
        window.setTimeout(() => setHint(null), 1800);
      }
    },
    [tooltip],
  );

  if (disabled) {
    return (
      <div
        className={className}
        style={{ pointerEvents: "none", userSelect: "none" }}
        aria-hidden
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={className}
      style={{ position: "relative", cursor: tooltip ? "default" : "pointer" }}
      role="presentation"
    >
      {children}
      {hint && (
        <div
          className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-md"
          style={{ background: "var(--text-heading)" }}
        >
          This is a demo — {hint}
        </div>
      )}
    </div>
  );
}
