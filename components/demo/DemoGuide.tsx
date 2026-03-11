"use client"

import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion"
import { useLayoutEffect, useRef, useState } from "react"

const ANNOTATION_OFFSET_X = 18
const ANNOTATION_OFFSET_Y = -12

const PADDING = 16
const TOOLTIP_ARROW_SIZE = 8

export type ArrowPosition = "top" | "bottom" | "left" | "right"

export type DemoGuideProps = {
  text: string
  rootRef: React.RefObject<HTMLDivElement | null>
  /** Optional. If not set, tooltip is centered in root. */
  targetSelector?: string | null
  /** Placement of tooltip relative to target (and small arrow on bubble). */
  position?: ArrowPosition
}

/**
 * Element-anchored guidance bubble. Positions near target via getBoundingClientRect,
 * or centered in root when no target. Styled for readability.
 */
export default function DemoGuide({
  text,
  rootRef,
  targetSelector,
  position = "top",
}: DemoGuideProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({ left: "50%", top: "50%", transform: "translate(-50%, -50%)" })

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const rootRect = root.getBoundingClientRect()
    const tooltipEl = tooltipRef.current
    const tooltipWidth = tooltipEl ? Math.min(tooltipEl.offsetWidth, 240) : 240
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 60

    if (targetSelector) {
      const el = root.querySelector<HTMLElement>(targetSelector)
      if (el) {
        const tr = el.getBoundingClientRect()
        const targetCenterX = tr.left - rootRect.left + tr.width / 2
        const targetCenterY = tr.top - rootRect.top + tr.height / 2
        const gap = 12
        let left = 0
        let top = 0
        if (position === "top") {
          left = targetCenterX
          top = tr.top - rootRect.top - tooltipHeight - gap
        } else if (position === "bottom") {
          left = targetCenterX
          top = tr.bottom - rootRect.top + gap
        } else if (position === "left") {
          left = tr.left - rootRect.left - tooltipWidth - gap
          top = targetCenterY
        } else {
          left = tr.right - rootRect.left + gap
          top = targetCenterY
        }
        // Clamp inside root (left/top are top-left of tooltip)
        const minX = PADDING
        const maxX = rootRect.width - tooltipWidth - PADDING
        const minY = PADDING
        const maxY = rootRect.height - tooltipHeight - PADDING
        left = Math.max(minX, Math.min(left, maxX))
        top = Math.max(minY, Math.min(top, maxY))
        setStyle({
          left,
          top,
          transform: "none",
        })
        return
      }
    }

    // Center of root
    setStyle({ left: rootRect.width / 2, top: rootRect.height / 2, transform: "translate(-50%, -50%)" })
  }, [rootRef, targetSelector, position, text])

  const arrowStyle: React.CSSProperties =
    position === "top"
      ? { left: "50%", bottom: -TOOLTIP_ARROW_SIZE / 2, marginLeft: -TOOLTIP_ARROW_SIZE / 2 }
      : position === "bottom"
        ? { left: "50%", top: -TOOLTIP_ARROW_SIZE / 2, marginLeft: -TOOLTIP_ARROW_SIZE / 2 }
        : position === "left"
          ? { left: -TOOLTIP_ARROW_SIZE / 2, top: "50%", marginTop: -TOOLTIP_ARROW_SIZE / 2 }
          : { right: -TOOLTIP_ARROW_SIZE / 2, top: "50%", marginTop: -TOOLTIP_ARROW_SIZE / 2 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute z-50 pointer-events-none"
      style={style}
    >
      <div
        ref={tooltipRef}
        className="relative rounded-[10px] px-[14px] py-[10px] text-[14px] font-medium max-w-[240px]"
        style={{
          background: "white",
          color: "#1a1a1a",
          boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {text}
        <span
          className="absolute w-2 h-2 rotate-45 bg-white border border-gray-200"
          style={{
            ...arrowStyle,
            width: TOOLTIP_ARROW_SIZE,
            height: TOOLTIP_ARROW_SIZE,
            borderWidth: position === "top" ? "0 1px 1px 0" : position === "bottom" ? "1px 0 0 1px" : position === "left" ? "1px 0 0 1px" : "0 1px 1px 0",
          }}
        />
      </div>
    </motion.div>
  )
}

/** Arrow that points at a target element. Large, high-contrast, bounce animation. */
export function GuideArrow({
  rootRef,
  targetSelector,
  direction,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>
  targetSelector: string
  direction: ArrowPosition
}) {
  const [position, setPosition] = useState<{
    left: number
    top: number
    rotate: number
    targetCenterX: number
    targetCenterY: number
  } | null>(null)

  const ARROW_SIZE = 56
  const OFFSET = 20
  const EDGE_PADDING = 8

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const update = () => {
      const el = root.querySelector<HTMLElement>(targetSelector)
      if (!el) {
        setPosition(null)
        return
      }
      const rootRect = root.getBoundingClientRect()
      const tr = el.getBoundingClientRect()
      const targetCenterX = tr.left - rootRect.left + tr.width / 2
      const targetCenterY = tr.top - rootRect.top + tr.height / 2

      let arrowLeft: number
      let arrowTop: number
      let rotate = 0
      if (direction === "left") {
        arrowLeft = tr.left - rootRect.left - ARROW_SIZE - OFFSET
        arrowTop = targetCenterY - ARROW_SIZE / 2
        rotate = 0
      } else if (direction === "right") {
        arrowLeft = tr.right - rootRect.left + OFFSET
        arrowTop = targetCenterY - ARROW_SIZE / 2
        rotate = 180
      } else if (direction === "top") {
        arrowLeft = targetCenterX - ARROW_SIZE / 2
        arrowTop = tr.top - rootRect.top - ARROW_SIZE - OFFSET
        rotate = 90
      } else {
        arrowLeft = targetCenterX - ARROW_SIZE / 2
        arrowTop = tr.bottom - rootRect.top + OFFSET
        rotate = -90
      }

      // Keep arrow inside root for all screen sizes
      arrowLeft = Math.max(EDGE_PADDING, Math.min(arrowLeft, rootRect.width - ARROW_SIZE - EDGE_PADDING))
      arrowTop = Math.max(EDGE_PADDING, Math.min(arrowTop, rootRect.height - ARROW_SIZE - EDGE_PADDING))

      setPosition({ left: arrowLeft, top: arrowTop, rotate, targetCenterX, targetCenterY })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(root)
    return () => ro.disconnect()
  }, [rootRef, targetSelector, direction])

  if (!position) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute z-[45] pointer-events-none"
      style={{
        left: position.left,
        top: position.top,
        width: ARROW_SIZE,
        height: ARROW_SIZE,
      }}
    >
      <motion.div
        animate={{
          y: direction === "top" ? [0, -4, 0] : direction === "bottom" ? [0, 4, 0] : 0,
          x: direction === "left" ? [0, 4, 0] : direction === "right" ? [0, -4, 0] : 0,
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        style={{ transform: `rotate(${position.rotate}deg)` }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg
          width={ARROW_SIZE}
          height={ARROW_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          className="text-[#4F7EFF]"
          style={{
            filter: "drop-shadow(0 2px 8px rgba(79,126,255,0.4))",
          }}
        >
          <path
            d="M12 5v14M7 10l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

/**
 * Cursor-attached annotation: bubble follows cursor with offset (x: +18px, y: -12px). Max width 260px, no overflow.
 */
export function CursorAnnotation({
  cursorX,
  cursorY,
  text,
  contentOffset = { x: 0, y: 0 },
  rootRef,
}: {
  cursorX: MotionValue<number>
  cursorY: MotionValue<number>
  text: string
  contentOffset?: { x: number; y: number }
  rootRef?: React.RefObject<HTMLDivElement | null>
}) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const shiftLeft = useMotionValue(0)

  useLayoutEffect(() => {
    if (!rootRef?.current || !bubbleRef.current) return
    const root = rootRef.current
    const bubble = bubbleRef.current
    const update = () => {
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : root.getBoundingClientRect().width
      const bubbleRect = bubble.getBoundingClientRect()
      const annotationRight = bubbleRect.left + bubbleRect.width
      if (annotationRight > viewportWidth - PADDING) {
        shiftLeft.set(annotationRight - (viewportWidth - PADDING))
      } else {
        shiftLeft.set(0)
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(bubble)
    return () => ro.disconnect()
  }, [rootRef, text, shiftLeft])

  const left = useTransform(
    [cursorX, shiftLeft],
    ([x, s]: number[]) => x + ANNOTATION_OFFSET_X + contentOffset.x - s
  )
  const top = useTransform(
    cursorY,
    (y) => y + ANNOTATION_OFFSET_Y + contentOffset.y
  )

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute z-50 pointer-events-none"
      style={{ left, top }}
    >
      <div
        className="rounded-[10px] px-[14px] py-[10px] text-[14px] font-medium"
        style={{
          maxWidth: 260,
          whiteSpace: "normal",
          lineHeight: 1.4,
          background: "white",
          color: "#1a1a1a",
          boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {text}
      </div>
    </motion.div>
  )
}

const HIGHLIGHT_PADDING = 12

/** Highlight ring overlay for the active target element. Glow only, no stroke. */
export function DemoHighlight({
  rootRef,
  targetSelector,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>
  targetSelector: string
}) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const update = () => {
      const el = root.querySelector<HTMLElement>(targetSelector)
      if (!el) {
        setRect(null)
        return
      }
      const rootRect = root.getBoundingClientRect()
      const tr = el.getBoundingClientRect()
      setRect({
        left: tr.left - rootRect.left,
        top: tr.top - rootRect.top,
        width: tr.width,
        height: tr.height,
      })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(root)
    return () => ro.disconnect()
  }, [rootRef, targetSelector])

  if (!rect) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        scale: [1, 1.03, 1],
      }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.25 },
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute pointer-events-none z-[42] echly-highlight-glow"
      style={{
        left: rect.left - HIGHLIGHT_PADDING,
        top: rect.top - HIGHLIGHT_PADDING,
        width: rect.width + HIGHLIGHT_PADDING * 2,
        height: rect.height + HIGHLIGHT_PADDING * 2,
        borderRadius: 16,
        background: "rgba(59,130,246,0.18)",
        border: "none",
        boxShadow:
          "0 0 0 6px rgba(59,130,246,0.08), 0 0 18px rgba(59,130,246,0.35)",
      }}
    />
  )
}
