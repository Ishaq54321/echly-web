"use client";

import React, { useEffect } from "react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional classes for overlay customization (e.g. fullscreen image viewer) */
  overlayClassName?: string;
  /** Optional classes for panel customization */
  panelClassName?: string;
  /** Optional id for the panel for aria-labelledby */
  ariaLabelledBy?: string;
  /** Optional role, default dialog */
  role?: "dialog" | "alertdialog";
};

export function Modal({
  open,
  onClose,
  children,
  overlayClassName,
  panelClassName,
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
    <ModalPortal>
      <div
        className={`echly-modal-overlay${overlayClassName ? ` ${overlayClassName}` : ""}`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        data-echly-ui="true"
        style={{ zIndex: MODAL_LAYER_Z_INDEX }}
      >
        <div
          className={`echly-modal-panel${panelClassName ? ` ${panelClassName}` : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalPortal>
  );
}
