"use client";

import React, { useEffect } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional id for the panel for aria-labelledby */
  ariaLabelledBy?: string;
  /** Optional role, default dialog */
  role?: "dialog" | "alertdialog";
};

export function Modal({
  open,
  onClose,
  children,
  ariaLabelledBy,
  role = "dialog",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="echly-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role={role}
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      data-echly-ui="true"
    >
      <div
        className="echly-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
