"use client";

import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "brand" | "purple";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: "var(--ink-400)",
  success: "var(--green-dot)",
  warning: "var(--amber-dot)",
  danger:  "var(--red-dot)",
  info:    "var(--brand)",
  brand:   "var(--brand)",
  purple:  "var(--purple-text)",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "echly-badge",
        `echly-badge--${variant}`,
        size === "sm" ? "echly-badge--sm" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "var(--r-full)",
            background: DOT_COLORS[variant],
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
