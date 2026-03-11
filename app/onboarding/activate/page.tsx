"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion"
import {
  Download,
  Globe,
  MessageSquare,
  Mic,
  Pencil,
  Sparkles,
} from "lucide-react"
import DemoFeedbackDashboard from "../../../components/demo/DemoFeedbackDashboard"
import DemoGuide from "@/components/demo/DemoGuide"
import ExtensionPopup from "@/components/demo/ExtensionPopup"
import SessionControlBar from "@/components/demo/SessionControlBar"
import {
  createDemoExtensionController,
  DEFAULT_DEMO_EXTENSION_STATE,
  type DemoExtensionState,
  type DemoTicket,
  type DemoFeedbackMode,
} from "@/components/demo/DemoExtensionController"

type Step = "install" | "open" | "capture"
type PendingTransition = "open" | null
type DemoStage = "open_click" | "selection" | "overlay" | "comment" | "capture"
type CapturePhase = "none" | "voice" | "write" | "processing"

type GuidedStep =
  | "install_extension"
  | "open_extension"
  | "choose_mode"
  | "click_page"
  | "selection_created"
  | "voice_feedback"
  | "write_feedback"
  | "finish_feedback"
  | "processing"
  | "end_session"

type CursorMode = "default" | "interactive" | "comment"

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

const GUIDE_TEXTS: Record<Exclude<GuidedStep, "processing">, string> = {
  install_extension: "Click the extension icon on top right",
  open_extension: "Choose a feedback mode",
  choose_mode: "Click Start Session",
  click_page: "Click anywhere on the page to capture feedback",
  selection_created: "Screenshot captured — now add your feedback",
  voice_feedback: "Click Finish when done",
  write_feedback: "Type your feedback and submit",
  finish_feedback: "Finish to generate tickets",
  end_session: "Click End to finish your feedback session",
}

export default function ActivationPage() {
  const [step, setStep] = useState<Step>("install")
  const [demoStage, setDemoStage] = useState<DemoStage>("open_click")
  const [capturePhase, setCapturePhase] = useState<CapturePhase>("none")
  const [waveformActive, setWaveformActive] = useState(false)
  const [tasksStarted, setTasksStarted] = useState(false)
  const [demoExtensionState, setDemoExtensionState] = useState<DemoExtensionState>(
    DEFAULT_DEMO_EXTENSION_STATE
  )
  const demoControllerRef = useRef(createDemoExtensionController(setDemoExtensionState))
  const demoController = demoControllerRef.current
  const [guidedStep, setGuidedStep] = useState<GuidedStep | null>("install_extension")
  const [selection, setSelection] = useState<{ x: number; y: number } | null>(null)
  const [cursorMode, setCursorMode] = useState<CursorMode>("default")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectionCreatedTimeoutRef = useRef<number | null>(null)
  const processingTasksTimeoutRef = useRef<number | null>(null)
  const [dashboardPhase, setDashboardPhase] = useState<null | "loading" | "ready">(null)

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

  const createSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setSelection({ x, y })
    demoController.captureSelection(x, y)
    setDemoStage("selection")
    setGuidedStep("selection_created")
  }

  // Sync step / demoStage / capturePhase from guided step when in guided mode
  useEffect(() => {
    if (guidedStep == null) return
    if (guidedStep === "install_extension" || guidedStep === "open_extension" || guidedStep === "choose_mode") {
      setStep("install")
      setDemoStage("open_click")
      setCapturePhase("none")
    } else if (guidedStep === "click_page") {
      setStep("open")
      setDemoStage("open_click")
      setCapturePhase("none")
    } else if (guidedStep === "selection_created") {
      setStep("open")
      setCapturePhase("none")
      // demoStage stays "selection" from createSelection; we transition to overlay in timeout
    } else if (guidedStep === "voice_feedback" || guidedStep === "finish_feedback") {
      setStep("capture")
      setCapturePhase("voice")
      setDemoStage("comment")
    } else if (guidedStep === "write_feedback") {
      setStep("capture")
      setCapturePhase("write")
      setDemoStage("comment")
    } else if (guidedStep === "processing") {
      setStep("capture")
      setCapturePhase("processing")
      setDemoStage("comment")
    }
  }, [guidedStep])

  // Cursor mode derived from guided step
  useEffect(() => {
    if (guidedStep == null) {
      setCursorMode("default")
      return
    }

    switch (guidedStep) {
      case "install_extension":
      case "open_extension":
      case "choose_mode":
      case "voice_feedback":
      case "write_feedback":
      case "finish_feedback":
      case "processing":
      case "end_session":
        setCursorMode("default")
        break
      case "click_page":
        setCursorMode("interactive")
        break
      case "selection_created":
        setCursorMode("comment")
        break
      default:
        setCursorMode("default")
    }
  }, [guidedStep])

  // Screenshot flow: selection 1200ms → overlay 1000ms → comment 600ms → feedback (voice/write by mode)
  useEffect(() => {
    if (guidedStep !== "selection_created") return
    const tOverlay = window.setTimeout(() => setDemoStage("overlay"), 1200)
    const tComment = window.setTimeout(() => setDemoStage("comment"), 1200 + 1000)
    selectionCreatedTimeoutRef.current = window.setTimeout(() => {
      const mode = demoExtensionState.mode
      if (mode === "voice") setGuidedStep("voice_feedback")
      else if (mode === "write") setGuidedStep("write_feedback")
      else setGuidedStep("voice_feedback")
      setSelection(null)
      demoController.clearSelection()
    }, 1200 + 1000 + 600)
    return () => {
      window.clearTimeout(tOverlay)
      window.clearTimeout(tComment)
      if (selectionCreatedTimeoutRef.current != null) {
        window.clearTimeout(selectionCreatedTimeoutRef.current)
        selectionCreatedTimeoutRef.current = null
      }
    }
  }, [guidedStep, demoExtensionState.mode])

  // When entering processing, show processing steps then generate tickets after 1200ms
  useEffect(() => {
    if (guidedStep !== "processing") return
    setTasksStarted(false)
    processingTasksTimeoutRef.current = window.setTimeout(() => {
      demoControllerRef.current.generateTickets()
      setTasksStarted(true)
    }, 1200)
    return () => {
      if (processingTasksTimeoutRef.current != null) {
        window.clearTimeout(processingTasksTimeoutRef.current)
        processingTasksTimeoutRef.current = null
      }
    }
  }, [guidedStep])

  // After tickets appear, show end_session guidance after 1800ms
  const endSessionTimeoutRef = useRef<number | null>(null)
  useEffect(() => {
    if (guidedStep !== "processing" || !tasksStarted) return
    endSessionTimeoutRef.current = window.setTimeout(() => {
      setGuidedStep("end_session")
    }, 1800)
    return () => {
      if (endSessionTimeoutRef.current != null) {
        window.clearTimeout(endSessionTimeoutRef.current)
        endSessionTimeoutRef.current = null
      }
    }
  }, [guidedStep, tasksStarted])

  // After End session: show loading 800ms then dashboard
  useEffect(() => {
    if (dashboardPhase !== "loading") return
    const t = window.setTimeout(() => setDashboardPhase("ready"), 800)
    return () => window.clearTimeout(t)
  }, [dashboardPhase])

  const handleReplayDemo = () => {
    setDashboardPhase(null)
    setGuidedStep("install_extension")
    demoController.reset()
    setStep("install")
    setDemoStage("open_click")
    setCapturePhase("none")
    setSelection(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-[7vh] px-6 pb-20 relative">
      {guidedStep != null ? (
        <button
          type="button"
          onClick={() => {
            setGuidedStep(null)
            demoController.reset()
            setStep("install")
            setDemoStage("open_click")
            setCapturePhase("none")
            setSelection(null)
          }}
          className="absolute right-6 top-6 z-50 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          Skip demo
        </button>
      ) : null}
      {dashboardPhase === "ready" ? (
        <button
          type="button"
          onClick={handleReplayDemo}
          className="absolute right-6 top-6 z-50 text-sm font-medium text-[#1D4ED8] hover:text-[#0F3DB8] bg-[#E8F1FF] hover:bg-[#BBD1FF] px-3 py-1.5 rounded-lg border border-[#BBD1FF] transition-colors"
        >
          Replay Demo
        </button>
      ) : null}
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
        {dashboardPhase === "loading" ? (
          <div className="flex items-center justify-center h-[440px] rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-sm font-medium text-gray-600">Loading feedback...</p>
            </div>
          </div>
        ) : dashboardPhase === "ready" ? (
          <DemoFeedbackDashboard />
        ) : (
          <BrowserDemo
            containerRef={containerRef}
            step={step}
            demoStage={demoStage}
            capturePhase={capturePhase}
            waveformActive={waveformActive}
            tasksStarted={tasksStarted}
            guidedStep={guidedStep}
            setGuidedStep={setGuidedStep}
            demoExtensionState={demoExtensionState}
            demoController={demoController}
            selection={selection}
            createSelection={createSelection}
            cursorMode={cursorMode}
            onEndSession={() => {
              setGuidedStep(null)
              setDashboardPhase("loading")
            }}
          />
        )}
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

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin"
      aria-hidden
    />
  )
}

function BrowserDemo({
  containerRef,
  step,
  demoStage,
  capturePhase,
  waveformActive,
  tasksStarted,
  guidedStep,
  setGuidedStep,
  demoExtensionState,
  demoController,
  selection,
  createSelection,
  cursorMode,
  onEndSession,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  step: Step
  demoStage: DemoStage
  capturePhase: CapturePhase
  waveformActive: boolean
  tasksStarted: boolean
  guidedStep: GuidedStep | null
  setGuidedStep: (s: GuidedStep | null) => void
  demoExtensionState: DemoExtensionState
  demoController: ReturnType<typeof createDemoExtensionController>
  selection: { x: number; y: number } | null
  createSelection: (e: React.MouseEvent<HTMLDivElement>) => void
  cursorMode: CursorMode
  onEndSession?: () => void
}) {
  const showWebsite = step !== "install"
  const websiteStage: "opening" | "ready" = step === "open" ? "opening" : "ready"
  const cursorXBase = useMotionValue(420)
  const cursorYBase = useMotionValue(190)
  const cursorX = useSpring(cursorXBase, { stiffness: 120, damping: 18 })
  const cursorY = useSpring(cursorYBase, { stiffness: 120, damping: 18 })
  const isGuided = guidedStep != null
  const extensionIconRef = useRef<HTMLButtonElement | null>(null)
  const voiceModeButtonRef = useRef<HTMLButtonElement | null>(null)
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number } | null>(null)
  const sessionActive =
    isGuided &&
    [
      "click_page",
      "selection_created",
      "voice_feedback",
      "write_feedback",
      "finish_feedback",
      "processing",
      "end_session",
    ].includes(guidedStep!)

  const showExtensionPopup =
    step === "install" &&
    (guidedStep == null || guidedStep === "open_extension" || guidedStep === "choose_mode")
  const showExtensionIconInChrome = isGuided && guidedStep === "install_extension"

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden relative">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-400 rounded-full" />
        </div>
        <div className="ml-4 text-xs text-gray-400 select-none">example-website.com</div>
        {showExtensionIconInChrome ? (
          <motion.button
            type="button"
            ref={extensionIconRef}
            onClick={() => setGuidedStep("open_extension")}
            className="ml-auto h-8 w-8 rounded-lg flex items-center justify-center border pointer-events-auto"
            animate={{
              scale: [1, 1.12, 1],
              backgroundColor: ["#E0EDFF", "#BBD1FF", "#E0EDFF"],
              borderColor: ["#93B8FF", "#6A9AFF", "#93B8FF"],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-label="Open Echly extension"
          >
            <motion.span
              animate={{ color: ["#1D4ED8", "#0F3DB8", "#1D4ED8"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.span>
          </motion.button>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="demo-container relative h-[440px] p-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden cursor-none"
        onMouseMove={(e) => {
          if (!containerRef.current) return
          const rect = containerRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          cursorXBase.set(x)
          cursorYBase.set(y)
        }}
        onClick={(e) => {
          if (guidedStep === "click_page") {
            const rect = containerRef.current!.getBoundingClientRect()
            setClickRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
            createSelection(e)
          }
        }}
      >
        {/* Keep both layers mounted so the browser never renders blank. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key="browser-content" className="h-full relative pointer-events-none">
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
          animate={{ opacity: step === "install" ? 0 : 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
          className="absolute inset-0 pointer-events-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            {step === "open" ? (
              <OpenWebsiteSequence
                key="open-seq"
                stage={demoStage}
                selection={selection}
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {step === "capture" ? (
              <CapturePanels
                key="capture-panels"
                guidedStep={guidedStep}
                phase={capturePhase}
                waveformActive={waveformActive}
                tasksStarted={tasksStarted}
                tickets={demoExtensionState.tickets}
                onVoiceFinish={
                  isGuided
                    ? () => {
                        demoController.submitVoice()
                        demoController.processFeedback()
                        setGuidedStep("processing")
                      }
                    : undefined
                }
                onWriteSubmit={
                  isGuided
                    ? (text?: string) => {
                        if (text != null) demoController.submitWrite(text)
                        demoController.processFeedback()
                        setGuidedStep("processing")
                      }
                    : undefined
                }
              />
            ) : null}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {clickRipple ? (
            <motion.div
              key="ripple"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => setClickRipple(null)}
              className="absolute left-0 top-0 z-10 pointer-events-none rounded-full bg-blue-400/50"
              style={{
                width: 48,
                height: 48,
                left: clickRipple.x,
                top: clickRipple.y,
                transform: "translate(-50%, -50%)",
              }}
            />
          ) : null}
        </AnimatePresence>

        {guidedStep != null && guidedStep !== "processing" ? (
          <DemoGuide
            text={GUIDE_TEXTS[guidedStep]}
            followCursor
            cursorX={cursorX}
            cursorY={cursorY}
            containerRef={containerRef}
            arrowPosition={guidedStep === "install_extension" ? "bottom" : "side"}
          />
        ) : null}
        {guidedStep != null ? (
          <GuideCursor guidedStep={guidedStep} cursorX={cursorX} cursorY={cursorY} cursorMode={cursorMode} />
        ) : null}

        {sessionActive ? (
          <SessionControlBar
            onPause={() => {}}
            onResume={() => {}}
            onEnd={() => {
              if (onEndSession) {
                onEndSession()
              } else {
                demoController.endSession()
                setGuidedStep(null)
              }
            }}
            highlightEnd={guidedStep === "end_session"}
          />
        ) : null}

        <AnimatePresence>
          {showExtensionPopup ? (
            <ExtensionPopup
              key="popup-install"
              selectedMode={demoExtensionState.mode}
              onModeSelect={(mode: DemoFeedbackMode) => demoController.selectMode(mode)}
              onStartSession={
                isGuided
                  ? () => {
                      demoController.startSession()
                      setGuidedStep("click_page")
                    }
                  : undefined
              }
              startSessionButtonRef={voiceModeButtonRef}
            />
          ) : null}
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

function FigmaCommentBubble() {
  return (
    <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-[12px] font-semibold flex items-center justify-center shadow-[0_10px_24px_rgba(37,99,235,0.35)]">
      1
    </div>
  )
}

function GuideCursor({
  guidedStep,
  cursorX,
  cursorY,
  cursorMode,
}: {
  guidedStep: GuidedStep
  cursorX: import("framer-motion").MotionValue<number>
  cursorY: import("framer-motion").MotionValue<number>
  cursorMode: CursorMode
}) {
  const showCommentIcon = cursorMode === "comment"

  return (
    <motion.div
      initial={false}
      style={{ x: cursorX, y: cursorY }}
      className="absolute left-0 top-0 z-40 pointer-events-none"
    >
      <div className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {cursorMode === "interactive" && !showCommentIcon && (
          <motion.div className="w-[26px] h-[26px] rounded-full bg-white border-2 border-gray-400 shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </motion.div>
        )}
        {showCommentIcon && <MessageSquare className="w-5 h-5 text-blue-500" />}
        {cursorMode === "default" && !showCommentIcon && (
          <div className="w-[26px] h-[26px] rounded-full bg-white border-2 border-gray-400 shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function OpenWebsiteSequence({
  stage,
  selection,
}: {
  stage: DemoStage
  selection?: { x: number; y: number } | null
}) {
  const showSelection = stage === "selection" && selection != null
  const showScreenshot = stage === "overlay" || stage === "comment"
  const showCommentBubble = stage === "comment"

  const defaultRect = { left: 310, top: 150, width: 190, height: 96 }
  const selectionRect =
    selection != null
      ? {
          left: Math.max(0, selection.x - defaultRect.width / 2),
          top: Math.max(0, selection.y - defaultRect.height / 2),
          width: defaultRect.width,
          height: defaultRect.height,
        }
      : defaultRect

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence initial={false}>
        {showSelection ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                "0 0 0 0 rgba(59,130,246,0)",
                "0 0 0 8px rgba(59,130,246,0.25)",
                "0 0 20px 4px rgba(59,130,246,0.2)",
                "0 0 0 8px rgba(59,130,246,0.25)",
              ],
            }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{
              opacity: { duration: 0.22, ease: "easeOut" },
              scale: { duration: 0.22, ease: "easeOut" },
              boxShadow: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute pointer-events-none z-20 border-2 border-blue-500 rounded-md bg-blue-100/10 animate-pulse"
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
            className="absolute z-30 pointer-events-none"
            style={{ left: selectionRect.left, top: selectionRect.top }}
          >
            <div
              className="rounded-md border border-blue-500/30 shadow-[0_18px_40px_rgba(0,0,0,0.18)] overflow-hidden"
              style={{ width: selectionRect.width, height: selectionRect.height }}
            >
              <div className="h-full w-full bg-white rounded-sm overflow-hidden flex flex-col">
                {/* Mini browser chrome */}
                <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="flex-1 min-w-0 h-1.5 bg-gray-200 rounded ml-1" />
                </div>
                {/* UI card preview: header + content block + highlighted CTA */}
                <div className="flex-1 p-2 flex flex-col gap-2 min-w-0">
                  <div className="h-2 w-[70%] bg-gray-200 rounded shrink-0" />
                  <div className="h-1.5 w-full max-w-[85%] bg-gray-100 rounded shrink-0" />
                  <div className="flex-1 rounded-md border border-gray-200 bg-gray-50/60 p-2 flex flex-col gap-1.5">
                    <div className="h-2 w-12 bg-gray-200 rounded" />
                    <div className="flex-1 rounded border-2 border-blue-500 bg-blue-50/80 flex items-center justify-center shadow-[0_0_0_2px_rgba(59,130,246,0.2)] relative">
                      <span className="text-[8px] font-semibold text-blue-700">Get started</span>
                    </div>
                    <div className="h-1.5 w-14 bg-gray-100 rounded" />
                  </div>
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
                  className="absolute -right-3 -top-3 pointer-events-none"
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

function WriteFeedbackPopup({ onSubmit }: { onSubmit?: (text?: string) => void } = {}) {
  const [value, setValue] = useState("")

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className="bg-transparent rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-4">
        <div className="font-semibold text-gray-900 text-[13px]">Write Feedback</div>
        <div className="mt-1 text-[12px] text-gray-600">
          Describe the issue — Echly will structure it.
        </div>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. The CTA button spacing looks off..."
          className="mt-4 w-full h-24 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
        />

        <button
          type="button"
          onClick={() => onSubmit?.(value)}
          className="mt-4 h-10 w-full rounded-xl bg-gray-900 hover:bg-black text-white text-[12px] font-semibold"
        >
          Submit
        </button>
      </div>
    </motion.div>
  )
}

function VoiceFeedbackPopup({ onFinish }: { onFinish?: () => void } = {}) {
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
          onClick={onFinish}
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

function ProcessingPanelCard({
  tasksStarted,
  tickets,
}: {
  tasksStarted: boolean
  tickets: DemoTicket[]
}) {
  const items = [
    "Analyzing feedback...",
    "Structuring insights...",
    tasksStarted ? "Tickets generated" : "Generating tickets...",
  ]
  const tasks = tickets.slice(0, 2)

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
                key={idx}
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
              {tasks.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={tasksStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.28, ease: "easeOut", delay: i * 0.4 }}
                  className="rounded-xl bg-white/70 backdrop-blur border border-gray-200 px-3 py-2.5 shadow-[0_10px_34px_rgba(0,0,0,0.08)]"
                >
                  <div className="text-[12px] font-medium text-gray-900">{t.title}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function CollapsibleTicketGroup({
  label,
  count,
  expanded,
  onToggle,
  tickets,
  tasksStarted,
}: {
  label: string
  count: number
  expanded: boolean
  onToggle: () => void
  tickets: DemoTicket[]
  tasksStarted: boolean
}) {
  return (
    <div className="mb-3 last:mb-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-1.5 px-1 rounded-lg hover:bg-gray-100/80 transition-colors"
      >
        <span className="text-[11px] font-semibold text-gray-700">
          {label} ({count})
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="space-y-2 pt-1">
          {tickets.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={tasksStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: i * 0.1 }}
              className="rounded-xl bg-white/70 backdrop-blur border border-gray-200 px-3 py-2.5 shadow-[0_10px_34px_rgba(0,0,0,0.08)]"
            >
              <div className="text-[12px] font-medium text-gray-900">{t.title}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function VoicePanelCard({
  waveformActive,
  onFinish,
}: {
  waveformActive: boolean
  onFinish?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[360px] pointer-events-none"
    >
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.16)] overflow-hidden pointer-events-auto">
        <div className={["p-4", waveformActive ? "" : "wave-idle"].join(" ")}>
          <VoiceFeedbackPopup onFinish={onFinish} />
        </div>
      </div>
    </motion.div>
  )
}

function CapturePanels({
  guidedStep,
  phase,
  waveformActive,
  tasksStarted,
  tickets,
  onVoiceFinish,
  onWriteSubmit,
}: {
  guidedStep: GuidedStep | null
  phase: CapturePhase
  waveformActive: boolean
  tasksStarted: boolean
  tickets: DemoTicket[]
  onVoiceFinish?: () => void
  onWriteSubmit?: (text?: string) => void
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
          {phase === "voice" ? (
            <VoicePanelCard
              key="voice"
              waveformActive={waveformActive}
              onFinish={onVoiceFinish}
            />
          ) : phase === "write" ? (
            <WritePanelCard key="write" onSubmit={onWriteSubmit} />
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {guidedStep === "processing" ? (
            <ProcessingPanelCard
              key="processing"
              tasksStarted={tasksStarted}
              tickets={tickets}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function WritePanelCard({ onSubmit }: { onSubmit?: (text?: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[360px] pointer-events-none"
    >
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.16)] overflow-hidden pointer-events-auto">
        <div className="p-4">
          <WriteFeedbackPopup onSubmit={onSubmit} />
        </div>
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
}: {
  icon: React.ReactNode
  title: string
  description: string
  button?: string
  active: boolean
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -4,
        boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
      }}
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
