"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative w-full overflow-hidden bg-white"
      style={{
        maxWidth: "420px",
        padding: "32px",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
