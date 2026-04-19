"use client";

import { Clock } from "lucide-react";

export function PendingAccessBanner() {
  return (
    <div
      style={{
        width: "100%",
        height: 44,
        background: "#FFFBEB",
        borderBottom: "1px solid #FDE68A",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 10,
        flexShrink: 0,
      }}
    >
      <Clock size={15} color="#D97706" aria-hidden />
      <span
        style={{
          fontSize: 14,
          color: "#92400E",
          fontWeight: 500,
          flex: 1,
        }}
      >
        Your request to access this session is pending review.
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#B45309",
          marginLeft: "auto",
          whiteSpace: "nowrap",
        }}
      >
        You&apos;ll be notified by email
      </span>
    </div>
  );
}
