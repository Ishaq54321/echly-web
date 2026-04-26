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
      className="absolute right-6 top-6 w-[320px] bg-white border border-[var(--border)] shadow-[var(--shadow-xl)] rounded-2xl overflow-hidden cursor-default pointer-events-auto"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2 text-[var(--text-body)]">
          <div className="h-10 w-10 rounded-xl hover:bg-[var(--surface-hover)] flex items-center justify-center">
            <Home className="h-5 w-5 [shape-rendering:geometricPrecision]" strokeWidth={2} />
          </div>
          <div className="h-10 w-10 rounded-xl hover:bg-[var(--surface-hover)] flex items-center justify-center">
            <Moon className="h-5 w-5 [shape-rendering:geometricPrecision]" strokeWidth={2} />
          </div>
          <div className="h-10 w-10 rounded-xl hover:bg-[var(--surface-hover)] flex items-center justify-center">
            <Mic className="h-5 w-5 [shape-rendering:geometricPrecision]" strokeWidth={2} />
          </div>
        </div>
        <div className="h-10 w-10 rounded-xl hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)]">
          <X className="h-5 w-5 [shape-rendering:geometricPrecision]" strokeWidth={2} />
        </div>
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="text-[12px] text-[var(--text-secondary)]">⚡ Powered by GPT-4 + Whisper</div>

        <div className="mt-4 text-[12px] font-semibold tracking-wide text-[var(--text-secondary)]">
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
              "echly-start-session h-10 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed " +
              (startSessionActive
                ? "bg-[#FF4B14] text-white hover:bg-[#FF4B14] active:bg-[#E64112]"
                : "bg-[var(--border)] text-[var(--text-body)] hover:bg-[#D1D5DB] active:bg-[#D1D5DB]")
            }
          >
            Start Session
          </button>
          <button
            type="button"
            className="h-10 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)] text-[var(--text-heading)] text-[12px] font-semibold"
          >
            Previous Sessions
          </button>
        </div>
      </div>
    </motion.div>
  )
}
