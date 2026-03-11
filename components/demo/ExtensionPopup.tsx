"use client"

import React from "react"
import { motion } from "framer-motion"
import { Home, Moon, Mic, X } from "lucide-react"
import ModeSelector from "./ModeSelector"
import type { DemoFeedbackMode } from "./DemoExtensionController"

export type ExtensionPopupProps = {
  selectedMode: DemoFeedbackMode | null
  onModeSelect: (mode: DemoFeedbackMode) => void
  onStartSession?: () => void
  startSessionButtonRef?: React.RefObject<HTMLButtonElement | null>
  modeSelectorRef?: React.RefObject<HTMLDivElement | null>
  /** When true (e.g. demo step is choose_mode), button shows active/CTA style. */
  startSessionHighlight?: boolean
}

export default function ExtensionPopup({
  selectedMode,
  onModeSelect,
  onStartSession,
  startSessionButtonRef,
  modeSelectorRef,
  startSessionHighlight = false,
}: ExtensionPopupProps) {
  const startSessionActive = selectedMode != null || startSessionHighlight
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className="absolute right-6 top-6 w-[320px] bg-white border border-gray-200 shadow-[0_18px_60px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden cursor-default pointer-events-auto"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2 text-gray-700">
          <div className="h-9 w-9 rounded-xl hover:bg-gray-50 flex items-center justify-center">
            <Home className="h-[18px] w-[18px]" />
          </div>
          <div className="h-9 w-9 rounded-xl hover:bg-gray-50 flex items-center justify-center">
            <Moon className="h-[18px] w-[18px]" />
          </div>
          <div className="h-9 w-9 rounded-xl hover:bg-gray-50 flex items-center justify-center">
            <Mic className="h-[18px] w-[18px]" />
          </div>
        </div>
        <div className="h-9 w-9 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-500">
          <X className="h-[18px] w-[18px]" />
        </div>
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="text-[12px] text-gray-600">⚡ Powered by GPT-4 + Whisper</div>

        <div className="mt-4 text-[11px] font-semibold tracking-wide text-gray-500">
          SELECT FEEDBACK MODE
        </div>

        <div ref={modeSelectorRef} className="mt-3" data-demo-target="mode-selector">
          <ModeSelector selectedMode={selectedMode} onSelect={onModeSelect} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            ref={startSessionButtonRef}
            type="button"
            data-demo-target="start-session"
            onClick={onStartSession}
            disabled={selectedMode == null}
            className={
              "echly-start-session h-10 rounded-[12px] text-[12px] font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed " +
              (startSessionActive
                ? "bg-[#FF4B14] text-white hover:bg-[#FF4B14] active:bg-[#E64112]"
                : "bg-[#E5E7EB] text-[#374151] hover:bg-[#D1D5DB] active:bg-[#D1D5DB]")
            }
          >
            Start Session
          </button>
          <button
            type="button"
            className="h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-[12px] font-semibold"
          >
            Previous Sessions
          </button>
        </div>
      </div>
    </motion.div>
  )
}
