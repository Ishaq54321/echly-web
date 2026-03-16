"use client";

import React from "react";
import { m } from "framer-motion";
import type { StructuredFeedback } from "@/lib/capture-engine/core/types";

export type ConfirmationCardProps = {
  ticket: StructuredFeedback;
  onConfirm: () => void;
  onEdit: () => void;
};

export function ConfirmationCard({ ticket, onConfirm, onEdit }: ConfirmationCardProps) {
  return (
    <m.div
      className="echly-confirmation-card"
      style={{
        borderRadius: 14,
        background: "rgba(20,22,28,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        padding: 24,
        maxWidth: "min(360px, 92vw)",
        fontFamily: '"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <p className="echly-confirmation-card-heading" style={{ fontSize: 16, fontWeight: 600, color: "#F3F4F6", margin: "0 0 16px", lineHeight: 1.4 }}>
        I understood
      </p>
      <ul className="echly-confirmation-card-list" style={{ listStyle: "none", margin: "0 0 20px", padding: 0 }}>
        <li className="echly-confirmation-card-title" style={{ fontSize: 14, fontWeight: 600, color: "#F3F4F6", lineHeight: 1.45 }}>
          {ticket.title}
        </li>
        {ticket.actionSteps?.length ? (
          <li className="echly-confirmation-card-desc" style={{ fontSize: 13, fontWeight: 500, color: "#A1A1AA", marginTop: 6, lineHeight: 1.4 }}>
            {ticket.actionSteps.join("\n\n")}
          </li>
        ) : null}
      </ul>
      <div className="echly-confirmation-card-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <m.button
          type="button"
          onClick={onConfirm}
          className="echly-confirmation-btn echly-confirmation-btn--confirm"
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            background: "#155DFC",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(21, 93, 252, 0.25)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Confirm
        </m.button>
        <m.button
          type="button"
          onClick={onEdit}
          className="echly-confirmation-btn echly-confirmation-btn--edit"
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.08)",
            color: "#F3F4F6",
            cursor: "pointer",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Edit
        </m.button>
      </div>
    </m.div>
  );
}
