"use client";

import React from "react";
import { motion } from "framer-motion";

export type FloatingCommandButtonProps = {
  label: string;
  expanded: boolean;
  onClick: () => void;
  "aria-label"?: string;
};

export function FloatingCommandButton({
  label,
  expanded,
  onClick,
  "aria-label": ariaLabel = "Open Echly",
}: FloatingCommandButtonProps) {
  return (
    <div className="echly-floating-trigger-wrapper">
      <motion.button
        type="button"
        onClick={onClick}
        className={`echly-floating-trigger ${expanded ? "echly-floating-trigger--expanded" : ""}`}
        aria-label={ariaLabel}
        aria-expanded={expanded}
        initial={false}
        whileHover={expanded ? undefined : { scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {label}
      </motion.button>
    </div>
  );
}
