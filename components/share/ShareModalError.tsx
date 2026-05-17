"use client";

import { AlertCircle } from "lucide-react";

type ShareModalErrorProps = {
  message: string;
  variant?: "boxed" | "inline";
};

/**
 * Inline error surface for the Share modal. Mirrors the canonical premium
 * boxed-error pattern already in app/(app)/settings/page.tsx:1189-1194 —
 * AlertCircle + the existing --color-danger* tokens (no new colors). Two
 * variants:
 *  - boxed:  section-level errors (invite, general access, list load).
 *  - inline: per-row / per-request errors (lighter, no box).
 */
export function ShareModalError({ message, variant = "boxed" }: ShareModalErrorProps) {
  if (variant === "inline") {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--color-danger)",
          lineHeight: 1.4,
        }}
      >
        <AlertCircle size={13} color="var(--color-danger)" aria-hidden="true" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        background: "var(--color-danger-bg)",
        border: "1px solid var(--color-danger-border)",
        borderRadius: 8,
        padding: "10px 12px",
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <AlertCircle
        size={14}
        color="var(--color-danger)"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: 1 }}
      />
      <span style={{ fontSize: 13, color: "var(--color-danger)", lineHeight: 1.4 }}>
        {message}
      </span>
    </div>
  );
}
