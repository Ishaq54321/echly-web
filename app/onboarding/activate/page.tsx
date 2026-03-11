"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useAnimation } from "framer-motion"
import {
  Download,
  Globe,
  Home,
  MessageSquare,
  Mic,
  Moon,
  MousePointer2,
  Pencil,
  Sparkles,
  X,
} from "lucide-react"

type Step = "install" | "open" | "capture"
type OpenSubstep = "idle" | "cursor" | "clicked"

type ActionCard = {
  key: Step
  icon: React.ReactNode
  title: string
  description: string
  cta?: string
}

export default function ActivationPage() {
  const [step, setStep] = useState<Step>("install")
  const [openSubstep, setOpenSubstep] = useState<OpenSubstep>("idle")
  const demoNonceRef = useRef(0)

  const actionCards: ActionCard[] = useMemo(
    () => [
      {
        key: "install",
        icon: <Download className="h-[18px] w-[18px]" />,
        title: "Install Extension",
        description: "Add Echly to your browser to capture feedback directly from websites.",
        cta: "Install extension",
      },
      {
        key: "open",
        icon: <Globe className="h-[18px] w-[18px]" />,
        title: "Open Website",
        description: "Visit any website where you want to collect feedback.",
      },
      {
        key: "capture",
        icon: <MessageSquare className="h-[18px] w-[18px]" />,
        title: "Capture Feedback",
        description: "Select elements and add comments to create tickets instantly.",
      },
    ],
    [],
  )

  useEffect(() => {
    setOpenSubstep("idle")
    demoNonceRef.current += 1
  }, [step])

  useEffect(() => {
    if (step !== "open") return
    const myNonce = demoNonceRef.current

    const t1 = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setOpenSubstep("cursor")
    }, 450)

    const t2 = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setOpenSubstep("clicked")
    }, 2450)

    const t3 = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setStep("capture")
    }, 3400)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [step])

  return (
    <div className="min-h-screen flex flex-col items-center pt-[7vh] px-6 pb-20">
      <div className="text-center max-w-xl">
        <h1 className="text-[36px] leading-[1.12] font-semibold tracking-tight text-gray-900">
          You&apos;re ready to capture feedback
        </h1>
      </div>

      <div className="mt-12 w-full max-w-[920px]">
        <BrowserDemo step={step} openSubstep={openSubstep} />
      </div>

      <div className="mt-12 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-3 gap-6">
        {actionCards.map((c) => (
          <StepCard
            key={c.key}
            icon={c.icon}
            title={c.title}
            description={c.description}
            button={c.cta}
            active={step === c.key}
            onClick={() => setStep(c.key)}
          />
        ))}
      </div>

      <button
        type="button"
        className="mt-14 h-12 px-10 rounded-full text-white font-medium bg-gradient-to-r from-[#466EFF] to-[#6A8CFF] shadow-[0_10px_30px_rgba(70,110,255,0.35)] hover:scale-[1.04] transition-all"
      >
        Go to dashboard
      </button>
    </div>
  )
}

function BrowserDemo({ step, openSubstep }: { step: Step; openSubstep: OpenSubstep }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden relative">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-400 rounded-full" />
        </div>
        <div className="ml-4 text-xs text-gray-400 select-none">example-website.com</div>
      </div>

      <div className="relative h-[440px] p-6 bg-gradient-to-b from-white to-gray-50">
        <AnimatePresence mode="wait">
          {step === "install" ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <WebsiteSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="website"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="h-full"
            >
              <WebsiteLayout />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{step === "open" && <CursorSequence substep={openSubstep} />}</AnimatePresence>

        <AnimatePresence>
          {step === "capture" && (
            <HighlightBox key="highlight" top={150} left={350} width={210} height={54} />
          )}
        </AnimatePresence>

        <AnimatePresence>{step === "install" && <ExtensionPopup key="popup-install" />}</AnimatePresence>

        <AnimatePresence>
          {step === "capture" && (
            <div className="absolute right-6 top-6 w-[320px] flex flex-col gap-3">
              <VoiceFeedbackPopup key="popup-voice" />
              <ProcessingStack key="processing" />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function WebsiteSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-[220px]" />
        <div className="h-8 bg-gray-200 rounded-full w-[120px]" />
      </div>

      <div className="mt-10 space-y-3">
        <div className="h-9 bg-gray-200 rounded-xl w-[520px]" />
        <div className="h-9 bg-gray-200 rounded-xl w-[420px]" />
        <div className="h-4 bg-gray-200 rounded w-[560px]" />
        <div className="h-4 bg-gray-200 rounded w-[520px]" />
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        <div className="bg-gray-200/70 h-24 rounded-2xl" />
        <div className="bg-gray-200/70 h-24 rounded-2xl" />
        <div className="bg-gray-200/70 h-24 rounded-2xl" />
      </div>

      <div className="mt-8 bg-gray-200/70 rounded-2xl flex-1" />
    </div>
  )
}

function WebsiteLayout() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="font-semibold text-gray-900">Example Website</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-full bg-gray-100" />
          <div className="h-8 w-24 rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="mt-10">
        <div className="text-[28px] leading-tight font-semibold text-gray-900 max-w-[620px]">
          Landing page headline
        </div>
        <div className="mt-2 text-sm text-gray-600 max-w-[640px]">
          A clean layout with feature cards and a content section to simulate a real website.
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {["Fast setup", "Clean UI", "Better feedback"].map((t) => (
          <div key={t} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100" />
            <div className="mt-3 font-medium text-gray-900 text-sm">{t}</div>
            <div className="mt-1 text-xs text-gray-600">Short description goes here.</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 flex-1">
        <div className="h-4 bg-gray-100 rounded w-[260px]" />
        <div className="mt-4 space-y-3">
          <div className="h-3 bg-gray-100 rounded w-[92%]" />
          <div className="h-3 bg-gray-100 rounded w-[86%]" />
          <div className="h-3 bg-gray-100 rounded w-[78%]" />
          <div className="h-3 bg-gray-100 rounded w-[88%]" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function CursorSequence({ substep }: { substep: OpenSubstep }) {
  const cursorControls = useAnimation()
  const pulseControls = useAnimation()

  useEffect(() => {
    if (substep !== "cursor") return
    ;(async () => {
      await cursorControls.set({ opacity: 0, x: 80, y: 260, rotate: -6, scale: 1 })
      await cursorControls.start({
        opacity: 1,
        x: 280,
        y: 160,
        rotate: 0,
        transition: { duration: 0.9, ease: "easeOut" },
      })
      await cursorControls.start({
        x: 355,
        y: 168,
        transition: { duration: 0.85, ease: "easeInOut" },
      })
    })()
  }, [cursorControls, substep])

  useEffect(() => {
    if (substep !== "clicked") return
    ;(async () => {
      await pulseControls.start({
        opacity: [0, 1, 0],
        scale: [0.6, 1.15, 1.35],
        transition: { duration: 0.55, ease: "easeOut" },
      })
      await pulseControls.set({ opacity: 0, scale: 1 })
    })()
  }, [pulseControls, substep])

  return (
    <>
      <AnimatePresence>
        {substep === "clicked" && (
          <HighlightBox key="highlight-open" top={150} left={350} width={210} height={54} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={pulseControls}
        className="absolute pointer-events-none"
        style={{ left: 368, top: 178 }}
      >
        <div className="h-10 w-10 rounded-full border-2 border-blue-500/80" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={cursorControls}
        className="absolute pointer-events-none z-20 text-gray-900 drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
        style={{ left: 0, top: 0 }}
      >
        <MousePointer2 className="h-6 w-6 fill-white" />
      </motion.div>
    </>
  )
}

function HighlightBox({
  top,
  left,
  width,
  height,
}: {
  top: number
  left: number
  width: number
  height: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="absolute pointer-events-none rounded-xl border-2 border-blue-500 shadow-[0_0_0_6px_rgba(59,130,246,0.18)]"
      style={{ top, left, width, height }}
    />
  )
}

function ExtensionPopup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className="absolute right-6 top-6 w-[320px] bg-white border border-gray-200 shadow-[0_18px_60px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden"
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

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-blue-600 text-white px-3 py-2.5 flex items-center gap-2 shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
            <Mic className="h-4 w-4" />
            <div className="leading-tight">
              <div className="text-[12px] font-semibold">Voice</div>
              <div className="text-[10px] opacity-90">Recommended</div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 text-gray-800">
            <Pencil className="h-4 w-4 text-gray-700" />
            <div className="leading-tight">
              <div className="text-[12px] font-semibold">Write</div>
              <div className="text-[10px] text-gray-500">Manual</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="h-10 rounded-xl bg-[#FF7A1A] hover:bg-[#ff6f08] text-white text-[12px] font-semibold shadow-[0_10px_24px_rgba(255,122,26,0.28)]"
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

function VoiceFeedbackPopup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className="bg-white border border-gray-200 shadow-[0_18px_60px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-4">
        <div className="font-semibold text-gray-900 text-[13px]">Voice Feedback</div>
        <div className="mt-1 text-[12px] text-gray-600">
          Describe the issue — Echly will structure it.
        </div>

        <div className="mt-4 flex items-end gap-1.5 h-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              animate={{ height: [6, 22, 10, 26, 8] }}
              transition={{
                repeat: Infinity,
                duration: 1.25,
                delay: i * 0.045,
                ease: "easeInOut",
              }}
              className="w-[3px] rounded bg-blue-600/90"
              style={{ height: 10 }}
            />
          ))}
        </div>

        <div className="mt-3 text-[12px] text-gray-600">Listening...</div>

        <button
          type="button"
          className="mt-4 h-10 w-full rounded-xl bg-gray-900 hover:bg-black text-white text-[12px] font-semibold"
        >
          Finish
        </button>
      </div>
    </motion.div>
  )
}

function ProcessingStack() {
  const items = ["Processing feedback...", "Text Adjustment", "Button Adjustment", "Image Adjustment", "Card Update"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-2"
    >
      {items.map((label, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * idx, duration: 0.28 }}
          className="bg-white border border-gray-200 shadow-[0_14px_44px_rgba(0,0,0,0.12)] rounded-2xl px-4 py-3 flex items-center justify-between"
        >
          <span className={`text-[12px] ${idx === 0 ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
            {label}
          </span>
          <span className="text-gray-400 text-[11px]">…</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

function StepCard({
  icon,
  title,
  description,
  button,
  active,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  button?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick()
      }}
      whileHover={{ y: -4 }}
      className={`w-full p-6 rounded-xl border cursor-pointer transition-all select-none ${
        active ? "bg-blue-50 border-blue-500 shadow-lg" : "bg-white border-gray-200"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
        {icon}
      </div>

      <div className="mt-3 font-semibold text-gray-900 text-[16px]">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{description}</div>

      {button ? (
        <button
          type="button"
          className="mt-4 h-10 px-4 rounded-full text-white text-sm bg-gradient-to-r from-[#466EFF] to-[#6A8CFF]"
        >
          {button}
        </button>
      ) : null}
    </motion.div>
  )
}
