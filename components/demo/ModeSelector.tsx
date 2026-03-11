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
            ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
            : "bg-white border border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <Mic className="h-4 w-4" />
        <div className="leading-tight text-left">
          <div className="text-[12px] font-semibold">Voice</div>
          <div className={`text-[10px] ${selectedMode === "voice" ? "opacity-90" : "text-gray-500"}`}>
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
            ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
            : "bg-white border border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <Pencil className="h-4 w-4" />
        <div className="leading-tight text-left">
          <div className="text-[12px] font-semibold">Write</div>
          <div className={`text-[10px] ${selectedMode === "write" ? "opacity-90" : "text-gray-500"}`}>
            Manual
          </div>
        </div>
      </button>
    </div>
  )
}
