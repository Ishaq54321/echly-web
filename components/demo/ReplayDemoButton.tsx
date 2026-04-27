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
      className="absolute right-6 top-6 z-[999999] w-[38px] h-[38px] rounded-[var(--radius-btn)] bg-white border border-[var(--border)] hover:bg-[var(--surface-subtle)] hover:border-[var(--brand-muted)] flex items-center justify-center transition-colors shadow-sm"
      aria-label="Replay demo"
    >
      <RotateCcw className="h-4 w-4 text-[var(--text-body)]" aria-hidden />
    </button>
  )
}
