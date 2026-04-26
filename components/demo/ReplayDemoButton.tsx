"use client"

import React from "react"
import { RotateCcw } from "lucide-react"

export type ReplayDemoButtonProps = {
  onReplay: () => void
}

export default function ReplayDemoButton({ onReplay }: ReplayDemoButtonProps) {
  return (
    <button
      type="button"
      onClick={onReplay}
      className="absolute right-6 top-6 z-[999999] w-10 h-10 rounded-[var(--radius-sm)] bg-white border border-[var(--border)] hover:bg-[#F8FAFC] hover:border-[#CBD5F5] flex items-center justify-center transition-colors shadow-sm"
      aria-label="Replay demo"
    >
      <RotateCcw className="h-4 w-4 text-[var(--text-body)]" aria-hidden />
    </button>
  )
}
