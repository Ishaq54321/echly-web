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
      className="absolute right-6 top-6 z-[999999] w-9 h-9 rounded-[10px] bg-white border border-[#E3E6E5] hover:bg-[#E9ECEB] hover:border-[#CFEFB3] flex items-center justify-center transition-colors shadow-sm"
      aria-label="Replay demo"
    >
      <RotateCcw className="h-4 w-4 text-[#5F6368]" aria-hidden />
    </button>
  )
}
