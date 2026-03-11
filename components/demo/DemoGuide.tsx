"use client"

import { motion, useMotionValue, useMotionValueEvent } from "framer-motion"
import type { MotionValue } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const TOOLTIP_ABOVE_CURSOR_OFFSET = 56
const PADDING = 16
const TOOLTIP_ARROW_SIZE = 8

export type TooltipArrowPosition = "bottom" | "side"

type DemoGuideProps = {
  text: string
  followCursor?: boolean
  cursorX?: MotionValue<number>
  cursorY?: MotionValue<number>
  containerRef?: React.RefObject<HTMLDivElement | null>
  /** For first tooltip only: arrow at bottom of bubble pointing down. Default "side". */
  arrowPosition?: TooltipArrowPosition
}

export default function DemoGuide({
  text,
  followCursor,
  cursorX,
  cursorY,
  containerRef,
  arrowPosition = "side",
}: DemoGuideProps) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const fallbackX = useMotionValue(0)
  const fallbackY = useMotionValue(0)
  const mx = cursorX ?? fallbackX
  const my = cursorY ?? fallbackY

  useEffect(() => {
    setCursorPosition({ x: mx.get(), y: my.get() })
  }, [mx, my])
  useMotionValueEvent(mx, "change", (v) => {
    if (followCursor) setCursorPosition((prev) => ({ ...prev, x: v }))
  })
  useMotionValueEvent(my, "change", (v) => {
    if (followCursor) setCursorPosition((prev) => ({ ...prev, y: v }))
  })

  const container = containerRef?.current
  const rect = container ? { width: container.offsetWidth, height: container.offsetHeight } : null
  const tooltipEl = tooltipRef.current
  const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 180
  const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 44

  // Position: top = cursorY - 56, left = cursorX, transform translateX(-50%). Clamp inside container.
  let leftPx = cursorPosition.x
  let topPx = cursorPosition.y - TOOLTIP_ABOVE_CURSOR_OFFSET
  if (rect) {
    const minCenterX = PADDING + tooltipWidth / 2
    const maxCenterX = rect.width - PADDING - tooltipWidth / 2
    leftPx = Math.max(minCenterX, Math.min(leftPx, maxCenterX))
    topPx = Math.max(PADDING, Math.min(topPx, rect.height - tooltipHeight - PADDING))
  }

  const computedPosition: React.CSSProperties = {
    left: leftPx,
    top: topPx,
    transform: "translateX(-50%)",
  }

  const arrowAtBottom = arrowPosition === "bottom"
  const arrowStyle: React.CSSProperties = arrowAtBottom
    ? { left: "50%", bottom: -TOOLTIP_ARROW_SIZE / 2, marginLeft: -TOOLTIP_ARROW_SIZE / 2 }
    : { left: -TOOLTIP_ARROW_SIZE / 2, top: "50%", marginTop: -TOOLTIP_ARROW_SIZE / 2 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute z-50 pointer-events-none"
      style={computedPosition}
    >
      <div
        ref={tooltipRef}
        className="relative rounded-[10px] px-3 py-2 text-xs font-medium border border-[#BBD1FF]"
        style={{
          background: "#E8F1FF",
          color: "#1D4ED8",
          boxShadow: "0 4px 12px rgba(29,78,216,0.12)",
        }}
      >
        {text}
        <span
          className="absolute w-2 h-2 rotate-45 bg-[#E8F1FF] border-[#BBD1FF]"
          style={{
            ...arrowStyle,
            width: TOOLTIP_ARROW_SIZE,
            height: TOOLTIP_ARROW_SIZE,
            borderWidth: arrowAtBottom ? "0 1px 1px 0" : "1px 0 0 1px",
          }}
        />
      </div>
    </motion.div>
  )
}
