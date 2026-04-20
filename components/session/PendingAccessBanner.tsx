"use client";

import { Clock, Mail } from "lucide-react";

export function PendingAccessBanner() {
  return (
    <div
      style={{
        width: "100%",
        height: "48px",
        background: "#F7F8FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Clock size={15} color="#1775E0" aria-hidden />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#555555",
            letterSpacing: "-0.1px",
          }}
        >
          Your request is pending review
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Mail size={15} color="#555555" aria-hidden />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#555555",
          }}
        >
          You&apos;ll be notified by email
        </span>
      </div>
    </div>
  );
}
