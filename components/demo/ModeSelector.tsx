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
            ? "bg-[var(--brand)] text-white shadow-[0_10px_24px_rgba(23,117,224,0.22)]"
            : "bg-white border border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
        }`}
      >
        <Mic className="h-4 w-4" />
        <div className="leading-tight text-left">
          <div className="text-[12px] font-semibold">Voice</div>
          <div className={`text-[12px] ${selectedMode === "voice" ? "opacity-90" : "text-[var(--text-secondary)]"}`}>
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
            ? "bg-[var(--brand)] text-white shadow-[0_10px_24px_rgba(23,117,224,0.22)]"
            : "bg-white border border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
        }`}
      >
        <Pencil className="h-4 w-4" />
        <div className="leading-tight text-left">
          <div className="text-[12px] font-semibold">Write</div>
          <div className={`text-[12px] ${selectedMode === "write" ? "opacity-90" : "text-[var(--text-secondary)]"}`}>
            Manual
          </div>
        </div>
      </button>
    </div>
  )
}
