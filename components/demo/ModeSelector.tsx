"use client"

import React from "react"
import { Mic, Pencil } from "lucide-react"
import type { DemoFeedbackMode } from "./DemoExtensionController"

export type ModeSelectorProps = {
  selectedMode: DemoFeedbackMode | null
  onSelect: (mode: DemoFeedbackMode) => void
  disabled?: boolean
}

export default function ModeSelector({ selectedMode, onSelect, disabled }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onSelect("voice")}
        disabled={disabled}
        className={`rounded-xl px-3 py-2.5 flex items-center gap-2 transition-colors ${
          selectedMode === "voice"
            ? "bg-[#9FE870] text-[#111111] shadow-[0_10px_24px_rgba(159,232,112,0.28)]"
            : "bg-white border border-[#E3E6E5] text-[#111111] hover:border-[#DADDDD] hover:bg-[#E9ECEB]"
        }`}
      >
        <Mic className="h-4 w-4" />
        <div className="leading-tight text-left">
          <div className="text-[12px] font-semibold">Voice</div>
          <div className={`text-[10px] ${selectedMode === "voice" ? "opacity-90" : "text-[#111111]"}`}>
            Recommended
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSelect("write")}
        disabled={disabled}
        className={`rounded-xl px-3 py-2.5 flex items-center gap-2 transition-colors ${
          selectedMode === "write"
            ? "bg-[#9FE870] text-[#111111] shadow-[0_10px_24px_rgba(159,232,112,0.28)]"
            : "bg-white border border-[#E3E6E5] text-[#111111] hover:border-[#DADDDD] hover:bg-[#E9ECEB]"
        }`}
      >
        <Pencil className="h-4 w-4" />
        <div className="leading-tight text-left">
          <div className="text-[12px] font-semibold">Write</div>
          <div className={`text-[10px] ${selectedMode === "write" ? "opacity-90" : "text-[#111111]"}`}>
            Manual
          </div>
        </div>
      </button>
    </div>
  )
}
