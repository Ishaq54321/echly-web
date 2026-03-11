"use client"

import React from "react"
import { motion } from "framer-motion"

export type SessionControlBarProps = {
  onPause?: () => void
  onResume?: () => void
  onEnd?: () => void
  highlightEnd?: boolean
  endButtonRef?: React.RefObject<HTMLButtonElement | null>
}

export default function SessionControlBar({ onPause, onResume, onEnd, highlightEnd, endButtonRef }: SessionControlBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
    >
      <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-[0_18px_48px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center gap-3">
        <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">
          Recording Session
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPause}
            className="h-8 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-medium"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={onResume}
            className="h-8 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-medium"
          >
            Resume
          </button>
          <motion.button
            ref={endButtonRef}
            type="button"
            data-demo-target="end"
            onClick={onEnd}
            className="h-8 px-3 rounded-[10px] bg-red-100 hover:bg-red-200 text-red-700 text-[12px] font-medium border-none"
            animate={highlightEnd ? { scale: [1, 1.03, 1], boxShadow: ["0 0 0 6px rgba(59,130,246,0.08), 0 0 18px rgba(59,130,246,0.35)", "0 0 0 6px rgba(59,130,246,0.08), 0 0 22px rgba(59,130,246,0.4)", "0 0 0 6px rgba(59,130,246,0.08), 0 0 18px rgba(59,130,246,0.35)"] } : {}}
            transition={{ duration: 2, repeat: highlightEnd ? Infinity : 0, ease: "easeInOut" }}
          >
            End
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
