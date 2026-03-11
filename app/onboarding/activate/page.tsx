"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Download,
  Globe,
  Home,
  MessageSquare,
  Mic,
  Moon,
  Pencil,
  Sparkles,
  X,
} from "lucide-react"

type Step = "install" | "open" | "capture"
type PendingTransition = "open" | null
type DemoStage = "open_click" | "selection" | "overlay" | "comment" | "capture"
type CapturePhase = "none" | "voice" | "processing"

type ActionCard = {
  key: Step
  icon: React.ReactNode
  title: string
  description: string
  cta?: string
}

const STEP_ORDER: Step[] = ["install", "open", "capture"]
const STEP_LABELS: Record<Step, string> = {
  install: "Install Extension",
  open: "Open Website",
  capture: "Capture Feedback",
}

const DEMO_SEQUENCE: Array<{ step: Step; duration: number }> = [
  { step: "install", duration: 2200 },
  { step: "open", duration: 3000 },
  // Keep capture visible long enough for voice → processing → tasks.
  { step: "capture", duration: 4500 },
]

const GENERATED_TASKS = [
  "Create ticket: spacing issue",
  "Adjust CTA button style",
] as const

export default function ActivationPage() {
  const [step, setStep] = useState<Step>("install")
  const [stage, setStage] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<PendingTransition>(null)
  const [demoStage, setDemoStage] = useState<DemoStage>("open_click")
  const [openClickPulse, setOpenClickPulse] = useState(0)
  const [capturePhase, setCapturePhase] = useState<CapturePhase>("none")
  const [waveformActive, setWaveformActive] = useState(false)
  const [tasksStarted, setTasksStarted] = useState(false)
  const [captureIdle, setCaptureIdle] = useState(false)
  const demoNonceRef = useRef(0)
  const loopTimeoutRef = useRef<number | null>(null)
  const resetTimeoutRef = useRef<number | null>(null)

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

  const setStepWithReset = (next: Step, nextCapturePhase: CapturePhase = "none") => {
    demoNonceRef.current += 1
    setDemoStage("open_click")
    setOpenClickPulse(0)
    setCapturePhase(next === "capture" ? nextCapturePhase : "none")
    setWaveformActive(false)
    setTasksStarted(false)
    setCaptureIdle(false)
    setStep(next)
  }

  const resetDemoState = () => {
    demoNonceRef.current += 1
    setTransitioning(false)
    setPendingTransition(null)
    setDemoStage("open_click")
    setOpenClickPulse(0)
    setCapturePhase("none")
    setWaveformActive(false)
    setTasksStarted(false)
    setCaptureIdle(false)
  }

  const requestStep = (next: Step) => {
    if (next === step) return

    // install → open: keep the install frame visible while the website layout mounts,
    // then crossfade into the open state (never render an empty browser).
    if (step === "install" && next === "open") {
      setTransitioning(true)
      setPendingTransition("open")

      // Preload + begin fade in immediately; commit the step once the content is mounted.
      window.setTimeout(() => {
        setStepWithReset("open")
        setTransitioning(false)
        setPendingTransition(null)
      }, 360)
      return
    }

    setTransitioning(false)
    setPendingTransition(null)
    if (next === "capture") {
      setStepWithReset("capture", "voice")
      return
    }
    setStepWithReset(next)
  }

  useEffect(() => {
    if (!autoPlay) return

    const HOLD_AFTER_TASKS_MS = 2000
    let cancelled = false

    const clearTimers = () => {
      if (loopTimeoutRef.current != null) window.clearTimeout(loopTimeoutRef.current)
      if (resetTimeoutRef.current != null) window.clearTimeout(resetTimeoutRef.current)
      loopTimeoutRef.current = null
      resetTimeoutRef.current = null
    }

    const totalDuration =
      DEMO_SEQUENCE.reduce((sum, item) => sum + item.duration, 0) + HOLD_AFTER_TASKS_MS

    const runCycle = () => {
      if (cancelled) return

      setStage(0)
      setResetting(true)

      // Hard reset demo visuals before the loop restarts.
      resetTimeoutRef.current = window.setTimeout(() => {
        if (cancelled) return
        resetDemoState()
        setStepWithReset("install")
        setResetting(false)
      }, 420)

      const tInstall = DEMO_SEQUENCE[0]?.duration ?? 0
      const tOpen = tInstall + (DEMO_SEQUENCE[1]?.duration ?? 0)

      window.setTimeout(() => {
        if (cancelled) return
        setStage(1)
        requestStep("open")
      }, tInstall)

      window.setTimeout(() => {
        if (cancelled) return
        setStage(2)
        requestStep("capture")
      }, tOpen)

      loopTimeoutRef.current = window.setTimeout(() => {
        if (cancelled) return
        runCycle()
      }, totalDuration)
    }

    clearTimers()
    runCycle()

    return () => {
      cancelled = true
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay])

  useEffect(() => {
    if (step !== "capture") return
    const myNonce = demoNonceRef.current

    // Timeline (Capture Feedback)
    // 0.0s voice panel appears (already visible when entering capture)
    // 0.5s waveform starts
    // 1.2s processing panel appears
    // 1.6s first task card appears
    // 2.0s second task card appears
    // 3.0s idle display (hold)
    setCapturePhase("voice")
    setWaveformActive(false)
    setTasksStarted(false)
    setCaptureIdle(false)

    const tWave = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setWaveformActive(true)
    }, 500)

    const tProcessing = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setCapturePhase("processing")
    }, 1200)

    const tTasks = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setTasksStarted(true)
    }, 1600)

    const tIdle = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setCaptureIdle(true)
    }, 3000)

    return () => {
      window.clearTimeout(tWave)
      window.clearTimeout(tProcessing)
      window.clearTimeout(tTasks)
      window.clearTimeout(tIdle)
    }
  }, [step])

  useEffect(() => {
    if (!autoPlay) {
      const timer = window.setTimeout(() => {
        setAutoPlay(true)
      }, 8000)

      return () => window.clearTimeout(timer)
    }
  }, [autoPlay])

  useEffect(() => {
    if (step !== "open") return
    const myNonce = demoNonceRef.current

    setDemoStage("open_click")
    setCapturePhase("none")

    // Timeline (Open Website)
    // 0.0s pointer appears
    // 0.7s pointer clicks element
    // 1.0s selection rectangle appears
    // 1.4s screenshot overlay appears
    // 2.0s comment bubble appears
    const tClick = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setOpenClickPulse((v) => v + 1)
    }, 700)

    const tSelection = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setDemoStage("selection")
    }, 1000)

    const tOverlay = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setDemoStage("overlay")
    }, 1400)

    const tComment = window.setTimeout(() => {
      if (demoNonceRef.current !== myNonce) return
      setDemoStage("comment")
    }, 2000)

    return () => {
      window.clearTimeout(tClick)
      window.clearTimeout(tSelection)
      window.clearTimeout(tOverlay)
      window.clearTimeout(tComment)
    }
  }, [step])

  useEffect(() => {
    if (step === "install") resetDemoState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <div className="min-h-screen flex flex-col items-center pt-[7vh] px-6 pb-20">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight whitespace-nowrap text-gray-900">
          You&apos;re ready to capture feedback
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mt-12 w-full max-w-[920px]"
      >
        <BrowserDemo
          step={step}
          resetting={resetting}
          demoStage={demoStage}
          openClickPulse={openClickPulse}
          capturePhase={capturePhase}
          waveformActive={waveformActive}
          tasksStarted={tasksStarted}
          captureIdle={captureIdle}
          transitioning={transitioning}
          pendingTransition={pendingTransition}
        />
      </motion.div>

      <div className="mt-12 w-full max-w-[920px]">
        <StepProgress step={step} />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {actionCards.map((c) => (
            <motion.div
              key={c.key}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
              }}
            >
              <StepCard
                icon={c.icon}
                title={c.title}
                description={c.description}
                button={c.cta}
                active={step === c.key}
                onClick={() => {
                  setAutoPlay(false)
                  requestStep(c.key)
                }}
              />
            </motion.div>
          ))}
        </motion.div>
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

function BrowserDemo({
  step,
  resetting,
  demoStage,
  openClickPulse,
  capturePhase,
  waveformActive,
  tasksStarted,
  captureIdle,
  transitioning,
  pendingTransition,
}: {
  step: Step
  resetting: boolean
  demoStage: DemoStage
  openClickPulse: number
  capturePhase: CapturePhase
  waveformActive: boolean
  tasksStarted: boolean
  captureIdle: boolean
  transitioning: boolean
  pendingTransition: PendingTransition
}) {
  const showWebsite = step !== "install" || (transitioning && pendingTransition === "open")
  const websiteStage: "opening" | "ready" =
    step === "open" || (transitioning && pendingTransition === "open") ? "opening" : "ready"

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

      <div className="relative h-[440px] p-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Keep both layers mounted so the browser never renders blank. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key="browser-content" className="h-full relative">
            <motion.div
              initial={false}
              animate={{ opacity: showWebsite ? 0 : 1 }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{ willChange: "opacity" }}
            >
              <WebsiteSkeleton />
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: showWebsite ? 1 : 0, y: showWebsite ? 0 : 6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0"
              style={{ willChange: "opacity, transform" }}
            >
              <WebsiteLayout stage={websiteStage} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={false}
          animate={{ opacity: step === "install" || resetting ? 0 : 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            {step === "open" ? (
              <OpenWebsiteSequence key="open-seq" stage={demoStage} clickPulse={openClickPulse} />
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {step === "capture" ? (
              <CapturePanels
                key="capture-panels"
                phase={capturePhase}
                waveformActive={waveformActive}
                tasksStarted={tasksStarted}
                captureIdle={captureIdle}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>{step === "install" && <ExtensionPopup key="popup-install" />}</AnimatePresence>
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

function WebsiteLayout({ stage }: { stage: "opening" | "ready" }) {
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
        <motion.div
          initial={stage === "opening" ? { opacity: 0, y: 6 } : false}
          animate={stage === "opening" ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-[28px] leading-tight font-semibold text-gray-900 max-w-[620px]"
        >
          Landing page headline
        </motion.div>
        <div className="mt-2 text-sm text-gray-600 max-w-[640px]">
          A clean layout with feature cards and a content section to simulate a real website.
        </div>
      </div>

      <motion.div
        initial={stage === "opening" ? { opacity: 0, y: 10 } : false}
        animate={stage === "opening" ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
        className="mt-8 grid grid-cols-3 gap-4"
      >
        {["Fast setup", "Clean UI", "Better feedback"].map((t) => (
          <div key={t} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100" />
            <div className="mt-3 font-medium text-gray-900 text-sm">{t}</div>
            <div className="mt-1 text-xs text-gray-600">Short description goes here.</div>
          </div>
        ))}
      </motion.div>

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

function CommentPointer({ className }: { className?: string }) {
  return (
    <div
      className={[
        "h-8 w-8 rounded-full bg-white border-2 border-blue-500",
        "shadow-[0_14px_28px_rgba(0,0,0,0.18)]",
        "flex items-center justify-center text-blue-600",
        className ?? "",
      ].join(" ")}
    >
      <MessageSquare className="h-4 w-4" />
    </div>
  )
}

function FigmaCommentBubble() {
  return (
    <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-[12px] font-semibold flex items-center justify-center shadow-[0_10px_24px_rgba(37,99,235,0.35)]">
      1
    </div>
  )
}

function OpenWebsiteSequence({ stage, clickPulse }: { stage: DemoStage; clickPulse: number }) {
  const showPointer = stage !== "capture"
  const showSelection = stage === "selection"
  const showScreenshot = stage === "overlay" || stage === "comment"
  const showCommentBubble = stage === "comment"

  const selectionRect = {
    left: 310,
    top: 150,
    width: 190,
    height: 96,
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait" initial={false}>
        {showPointer ? (
          <motion.div
            key="pointer"
            initial={{ opacity: 0, x: 420, y: 190, scale: 0.92 }}
            animate={{
              opacity: 1,
              x: [420, 434],
              y: [190, 198],
              scale: clickPulse > 0 ? [1, 0.9, 1] : 1,
            }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: "easeInOut" } }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              scale: clickPulse > 0 ? { duration: 0.2, times: [0, 0.45, 1], ease: "easeInOut" } : undefined,
            }}
            className="absolute z-30"
            style={{ left: 0, top: 0 }}
          >
            <CommentPointer />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {stage === "open_click" && clickPulse > 0 ? (
          <motion.div
            key={clickPulse}
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: [0, 1, 0], scale: [0.65, 1.1, 1.35] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute z-20"
            style={{ left: 418, top: 188 }}
          >
            <div className="h-10 w-10 rounded-full border-2 border-blue-500/80 bg-blue-500/5" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showSelection ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                "0 0 0 0 rgba(59,130,246,0.00)",
                "0 0 0 6px rgba(59,130,246,0.14)",
                "0 0 0 0 rgba(59,130,246,0.00)",
              ],
            }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.22, ease: "easeOut", boxShadow: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute pointer-events-none z-20 border-2 border-blue-500 rounded-md bg-blue-100/10"
            style={selectionRect}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {showScreenshot ? (
          <motion.div
            key="screenshot"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: [0, 1], scale: [0.96, 1] }}
            exit={{ opacity: 0, scale: 0.985, transition: { duration: 0.2, ease: "easeInOut" } }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute z-30"
            style={{ left: selectionRect.left, top: selectionRect.top }}
          >
            <div
              className="rounded-md border border-blue-500/30 shadow-[0_18px_40px_rgba(0,0,0,0.18)] overflow-hidden"
              style={{ width: selectionRect.width, height: selectionRect.height }}
            >
              <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-gray-50 p-2">
                <div className="bg-white rounded-lg shadow-sm p-3 space-y-2 border border-gray-100">
                  <div className="h-2 w-16 bg-gray-300 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 bg-blue-300 rounded-full" />
                    <div className="h-2 w-14 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-blue-200 rounded" />
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showCommentBubble ? (
                <motion.div
                  key="comment-bubble"
                  initial={{ opacity: 0, y: -8, scale: 0.85 }}
                  animate={{ opacity: 1, y: [ -8, 0, -2, 0 ], scale: [0.85, 1.06, 0.98, 1] }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16, ease: "easeInOut" } }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                  className="absolute -right-3 -top-3"
                >
                  <FigmaCommentBubble />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
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

function StepProgress({ step }: { step: Step }) {
  const idx = STEP_ORDER.indexOf(step)
  const clampedIdx = Math.max(0, idx)
  const fillPct = (clampedIdx / (STEP_ORDER.length - 1)) * 100

  return (
    <div className="relative w-full max-w-xl mx-auto mb-10 px-2">
      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2">
        <div className="h-[2px] bg-gray-200 w-full" />
        <motion.div
          className="h-[2px] bg-blue-500 absolute left-0 top-0"
          initial={false}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </div>

      <div className="relative grid grid-cols-3 items-center">
        {STEP_ORDER.map((s, i) => {
          const isActive = s === step
          const isDone = i < clampedIdx
          return (
            <div key={s} className="flex flex-col items-center gap-3">
              <motion.div
                initial={false}
                animate={
                  isActive
                    ? { scale: 1.06 }
                    : { scale: 1 }
                }
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
                className={[
                  "h-4 w-4 rounded-full border flex items-center justify-center bg-white",
                  isDone || isActive ? "border-blue-500" : "border-gray-300",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    isDone || isActive ? "bg-blue-500" : "bg-gray-300",
                  ].join(" ")}
                />
              </motion.div>
              <div className={`text-[12px] font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`}>
                {STEP_LABELS[s]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
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
  const bars = useMemo(() => Array.from({ length: 20 }), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className="bg-transparent rounded-2xl overflow-hidden"
    >
      <style jsx global>{`
        .voice-wave {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 20px;
        }
        .wave-bar {
          width: 3px;
          background: #3b82f6;
          border-radius: 2px;
          animation: wave 1.1s infinite ease-in-out;
        }
        .wave-idle .wave-bar {
          animation-play-state: paused;
          opacity: 0.55;
          height: 4px;
        }
        .wave-bar:nth-child(1) {
          animation-delay: 0.05s;
        }
        .wave-bar:nth-child(2) {
          animation-delay: 0.1s;
        }
        .wave-bar:nth-child(3) {
          animation-delay: 0.15s;
        }
        .wave-bar:nth-child(4) {
          animation-delay: 0.2s;
        }
        .wave-bar:nth-child(5) {
          animation-delay: 0.25s;
        }
        .wave-bar:nth-child(6) {
          animation-delay: 0.3s;
        }
        .wave-bar:nth-child(7) {
          animation-delay: 0.35s;
        }
        .wave-bar:nth-child(8) {
          animation-delay: 0.4s;
        }
        .wave-bar:nth-child(9) {
          animation-delay: 0.45s;
        }
        .wave-bar:nth-child(10) {
          animation-delay: 0.5s;
        }
        @keyframes wave {
          0% {
            height: 4px;
          }
          50% {
            height: 18px;
          }
          100% {
            height: 4px;
          }
        }

        .generated-tasks {
          max-height: 140px;
          overflow: hidden;
        }

        .shimmer-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(148, 163, 184, 0.9);
          box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.35);
          animation: shimmerDot 1.05s infinite ease-in-out;
          will-change: transform, opacity, box-shadow;
        }
        @keyframes shimmerDot {
          0% {
            transform: translateY(0px) scale(0.95);
            opacity: 0.45;
            box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.15);
          }
          50% {
            transform: translateY(-1px) scale(1);
            opacity: 0.85;
            box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.06);
          }
          100% {
            transform: translateY(0px) scale(0.95);
            opacity: 0.45;
            box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.15);
          }
        }
      `}</style>
      <div className="px-4 py-4">
        <div className="font-semibold text-gray-900 text-[13px]">Voice Feedback</div>
        <div className="mt-1 text-[12px] text-gray-600">
          Describe the issue — Echly will structure it.
        </div>

        <div className="mt-4">
          <div className="voice-wave">
            {bars.map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className="wave-bar" />
            ))}
          </div>
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

function LoadingIndicator() {
  return <span className="shimmer-dot" aria-hidden="true" />
}

function ProcessingStack() {
  const items = ["Processing feedback...", "Text Adjustment", "Button Adjustment", "Image Adjustment"]

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
          className="bg-white/70 backdrop-blur border border-gray-200 shadow-[0_10px_34px_rgba(0,0,0,0.10)] rounded-2xl px-4 py-3 flex items-center justify-between"
        >
          <span className={`text-[12px] ${idx === 0 ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
            {label}
          </span>
          <LoadingIndicator />
        </motion.div>
      ))}
    </motion.div>
  )
}

function ProcessingPanelCard({ tasksStarted }: { tasksStarted: boolean }) {
  const items = ["Processing feedback...", "Text Adjustment", "Button Adjustment", "Image Adjustment"]
  const tasks = GENERATED_TASKS.slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, x: 12, scale: 0.99 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.99 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-[280px]"
    >
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.16)] overflow-hidden pointer-events-auto">
        <div className="p-4">
          <div className="font-semibold text-gray-900 text-[13px]">Processing</div>
          <div className="mt-3 space-y-2">
            {items.map((label, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * idx, duration: 0.28, ease: "easeOut" }}
                className="flex items-center justify-between rounded-xl bg-white/70 backdrop-blur border border-gray-200 shadow-[0_10px_34px_rgba(0,0,0,0.10)] px-4 py-3"
              >
                <span className={`text-[12px] ${idx === 0 ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                  {label}
                </span>
                <LoadingIndicator />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: tasksStarted ? 1 : 0, height: tasksStarted ? "auto" : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-4 overflow-hidden"
          >
            <div className="text-[11px] font-semibold tracking-wide text-gray-500">GENERATED TASKS</div>
            <div className="mt-2 space-y-2 generated-tasks">
              {tasks.slice(0, 2).map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  animate={tasksStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.28, ease: "easeOut", delay: i * 0.4 }}
                  className="rounded-xl bg-white/70 backdrop-blur border border-gray-200 px-3 py-2.5 shadow-[0_10px_34px_rgba(0,0,0,0.08)]"
                >
                  <div className="text-[12px] font-medium text-gray-900">{t}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function VoicePanelCard({ waveformActive, captureIdle }: { waveformActive: boolean; captureIdle: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[360px] pointer-events-none"
    >
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.16)] overflow-hidden pointer-events-auto">
        <div className={["p-4", waveformActive && !captureIdle ? "" : "wave-idle"].join(" ")}>
          <VoiceFeedbackPopup />
        </div>
      </div>
    </motion.div>
  )
}

function CapturePanels({
  phase,
  waveformActive,
  tasksStarted,
  captureIdle,
}: {
  phase: CapturePhase
  waveformActive: boolean
  tasksStarted: boolean
  captureIdle: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "voice" || phase === "processing" ? (
            <VoicePanelCard key="voice" waveformActive={waveformActive} captureIdle={captureIdle} />
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "processing" ? <ProcessingPanelCard key="processing" tasksStarted={tasksStarted} /> : null}
        </AnimatePresence>
      </div>
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
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={[
        "w-full p-7 rounded-2xl border cursor-pointer select-none transition-all duration-300",
        "shadow-sm hover:shadow-lg",
        active
          ? "bg-blue-50 border-blue-400 shadow-md"
          : "border-gray-200 bg-gradient-to-b from-white/80 to-white backdrop-blur",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-100/80 border border-blue-200/60 flex items-center justify-center text-blue-700">
          {icon}
        </div>
        {active ? (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 border border-blue-200/70 px-2 py-1 rounded-full"
          >
            Active
          </motion.div>
        ) : null}
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
