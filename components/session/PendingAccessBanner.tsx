"use client";

import { Clock, Mail } from "lucide-react";

export function PendingAccessBanner() {
  return (
    <div
      style={{
        width: "100%",
        height: "48px",
        background: "var(--surface-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Clock size={15} color="var(--brand)" aria-hidden />
        <span
          className="font-medium"
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            letterSpacing: "-0.1px",
          }}
        >
          Your request is pending review
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Mail size={15} color="var(--text-secondary)" aria-hidden />
        <span
          className="font-medium"
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}
        >
          You&apos;ll be notified by email
        </span>
      </div>
    </div>
  );
}
