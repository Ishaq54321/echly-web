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
      className="absolute right-6 top-6 z-[999999] w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#CBD5F5] flex items-center justify-center transition-colors shadow-sm"
      aria-label="Replay demo"
    >
      <RotateCcw className="h-4 w-4 text-gray-700" aria-hidden />
    </button>
  )
}
