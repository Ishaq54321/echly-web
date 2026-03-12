"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative w-full max-w-[420px] overflow-hidden bg-[#FFFFFF] border border-[#E3E6E5] rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
