"use client";

import React from "react";
import { m } from "framer-motion";
import type { StructuredFeedback } from "./types";

export type ConfirmationCardProps = {
  ticket: StructuredFeedback;
  onConfirm: () => void;
  onEdit: () => void;
};

export function ConfirmationCard({ ticket, onConfirm, onEdit }: ConfirmationCardProps) {
  return (
    <m.div
      className="echly-confirmation-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <p className="echly-confirmation-card-heading">I understood</p>
      <ul className="echly-confirmation-card-list">
        <li className="echly-confirmation-card-title">{ticket.title}</li>
        {ticket.description && (
          <li className="echly-confirmation-card-desc">{ticket.description}</li>
        )}
      </ul>
      <div className="echly-confirmation-card-actions">
        <m.button
          type="button"
          onClick={onConfirm}
          className="echly-confirmation-btn echly-confirmation-btn--confirm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Confirm
        </m.button>
        <m.button
          type="button"
          onClick={onEdit}
          className="echly-confirmation-btn echly-confirmation-btn--edit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Edit
        </m.button>
      </div>
    </m.div>
  );
}
