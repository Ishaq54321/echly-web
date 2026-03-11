"use client"

import React, { useLayoutEffect, useState } from "react"
import { motion } from "framer-motion"

const ARROW_SIZE = 32
const ARROW_SIZE_EXTENSION = 34
const STROKE_WIDTH = 3
const TAIL_OFFSET = 40
const COLOR = "#2563EB"

export type ArrowDirection = "top" | "bottom" | "left" | "right" | "topRight"

export type DemoArrowProps = {
  rootRef: React.RefObject<HTMLDivElement | null>
  targetSelector: string
  /** Side from which the arrow points at the target (arrow tail on this side, tip touches target). topRight = below icon, tip up. */
  direction: ArrowDirection
  /** Use extension-icon placement: below target, tip up, 34px, pulse. */
  placementVariant?: "extensionIcon" | "startSession" | "submitButton" | "endButton"
}

/**
 * Onboarding arrow: tip touches the clickable target, correct direction, subtle pulse.
 * Uses getBoundingClientRect for accurate anchoring.
 */
export default function DemoArrow({
  rootRef,
  targetSelector,
  direction,
  placementVariant,
}: DemoArrowProps) {
  const [style, setStyle] = useState<{
    left: number
    top: number
    rotate: number
    size: number
    useFixedPosition?: boolean
  } | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const update = () => {
      const el = root.querySelector<HTMLElement>(targetSelector)
      if (!el) {
        setStyle(null)
        return
      }
      const rootRect = root.getBoundingClientRect()
      const tr = el.getBoundingClientRect()
      const targetCenterX = tr.left - rootRect.left + tr.width / 2
      const targetCenterY = tr.top - rootRect.top + tr.height / 2
      const size = placementVariant === "extensionIcon" ? ARROW_SIZE_EXTENSION : ARROW_SIZE

      let left: number
      let top: number
      let rotate: number
      let useFixedPosition = false
      if (placementVariant === "extensionIcon") {
        // Anchor to extension icon in viewport so arrow is never clipped. arrow.x = centerX, arrow.y = bottom + 22, direction up
        const rect = el.getBoundingClientRect()
        left = rect.left + rect.width / 2 - size / 2
        top = rect.bottom + 22
        rotate = 0
        useFixedPosition = true
      } else if (placementVariant === "startSession") {
        // Arrow below button, pointing up. arrow.x = centerX, arrow.y = bottom + 12, direction up
        left = targetCenterX - size / 2
        top = tr.bottom - rootRect.top + 12
        rotate = 0
      } else if (placementVariant === "submitButton") {
        // Arrow above submit button, tip down
        left = targetCenterX - size / 2
        top = tr.top - rootRect.top - size - 16
        rotate = 180
      } else if (placementVariant === "endButton") {
        left = targetCenterX - size / 2
        top = tr.top - rootRect.top - size - 16
        rotate = 180
      } else {
        // Arrow is placed so its tip touches the target. Tail extends away in `direction`.
        switch (direction) {
          case "top":
            left = targetCenterX - size / 2
            top = tr.top - rootRect.top - size - TAIL_OFFSET
            rotate = 180
            break
          case "bottom":
            left = targetCenterX - size / 2
            top = tr.bottom - rootRect.top + TAIL_OFFSET
            rotate = 0
            break
          case "left":
            left = tr.left - rootRect.left - size - TAIL_OFFSET
            top = targetCenterY - size / 2
            rotate = 90
            break
          case "right":
            left = tr.right - rootRect.left + TAIL_OFFSET
            top = targetCenterY - size / 2
            rotate = -90
            break
          case "topRight":
            left = targetCenterX - 10 - size / 2
            top = tr.bottom - rootRect.top + 8
            rotate = 0
            break
          default:
            left = targetCenterX - size / 2
            top = tr.top - rootRect.top - size - TAIL_OFFSET
            rotate = 180
        }
      }

      setStyle(useFixedPosition ? { left, top, rotate, size, useFixedPosition: true } : { left, top, rotate, size })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(root)
    const onScrollOrResize = () => (placementVariant === "extensionIcon" ? update() : null)
    window.addEventListener("scroll", onScrollOrResize, true)
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", onScrollOrResize, true)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [rootRef, targetSelector, direction, placementVariant])

  if (!style) return null

  const s = style.size

  const isFixed = style.useFixedPosition === true

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: [1, 1.15, 1] }}
      transition={{
        opacity: { duration: 0.25 },
        scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
      }}
      className="z-[999999] pointer-events-none origin-center"
      style={{
        position: isFixed ? "fixed" : "absolute",
        left: style.left,
        top: style.top,
        width: s,
        height: s,
      }}
    >
      <motion.div
        style={{
          transform: `rotate(${style.rotate}deg)`,
          width: s,
          height: s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: COLOR, overflow: "visible" }}
        >
          <path
            d="M12 5v14M7 10l5-5 5 5"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}
