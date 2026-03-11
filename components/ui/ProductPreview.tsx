"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

const CYCLE_MS = 6000;
const STEPS: { at: number; show: string }[] = [
  { at: 0, show: "idle" },
  { at: 0.12, show: "cursor" },
  { at: 0.28, show: "highlight" },
  { at: 0.45, show: "comment" },
  { at: 0.62, show: "ticket" },
  { at: 0.88, show: "idle" },
];

const easeSubtle = { type: "tween" as const, duration: 0.28, ease: [0.22, 0.61, 0.36, 1] as const };

export function ProductPreview() {
  return (
    <div className="relative w-full max-w-[520px]">
      <motion.div
        className="rounded-xl border border-white/10 bg-black/20 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {/* Mock browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-white/20"
              />
            ))}
          </div>
          <div className="flex-1 flex justify-center">
            <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-1.5 text-xs text-gray-500 w-3/4 max-w-[240px] text-center">
              app.echly.com/demo
            </div>
          </div>
        </div>

        {/* Page content placeholder */}
        <div className="relative aspect-[4/3] min-h-[200px] bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-6">
          {/* Simulated page blocks */}
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-5/6 rounded bg-white/5" />
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-white/5 border border-white/5"
                />
              ))}
            </div>
          </div>

          <ProductPreviewAnimation cycleMs={CYCLE_MS} steps={STEPS} />
        </div>
      </motion.div>
    </div>
  );
}

function ProductPreviewAnimation({
  cycleMs,
  steps,
}: {
  cycleMs: number;
  steps: { at: number; show: string }[];
}) {
  const current = useAnimationPhase(cycleMs, steps);

  return (
    <>
      {/* Cursor moves in first */}
      <AnimatePresence mode="wait">
        {(current === "cursor" || current === "highlight" || current === "comment" || current === "ticket") && (
          <motion.div
            className="absolute w-5 h-5 pointer-events-none z-20"
            style={{ left: "28%", top: "32%" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={easeSubtle}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg" fill="white">
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 0 0-.7L6.35 3.21a.5.5 0 0 0-.85.35Z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight element */}
      <AnimatePresence>
        {(current === "highlight" || current === "comment" || current === "ticket") && (
          <motion.div
            className="absolute left-[18%] top-[26%] w-[22%] h-[18%] rounded-lg border-2 border-[#466EFF] bg-[#466EFF]/10 pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={easeSubtle}
          />
        )}
      </AnimatePresence>

      {/* Comment bubble appears */}
      <AnimatePresence>
        {(current === "comment" || current === "ticket") && (
          <motion.div
            className="absolute left-[42%] top-[22%] max-w-[48%] rounded-xl border border-white/10 bg-[#111827] px-3 py-2 shadow-xl pointer-events-none z-10"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={easeSubtle}
          >
            <p className="text-xs text-gray-300">Fix button alignment here</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket card fades in */}
      <AnimatePresence>
        {current === "ticket" && (
          <motion.div
            className="absolute right-[8%] bottom-[12%] w-[44%] rounded-xl border border-white/10 bg-[#0B0F1A]/95 backdrop-blur px-3 py-2.5 shadow-xl pointer-events-none z-10"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={easeSubtle}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#466EFF]" />
              <span className="text-xs font-medium text-white">New ticket</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Button alignment — Feedback</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function useAnimationPhase(cycleMs: number, steps: { at: number; show: string }[]): string {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const phase = (elapsed % cycleMs) / cycleMs;
      setT(phase);
    };
    const id = setInterval(frame, 80);
    return () => clearInterval(id);
  }, [cycleMs]);
  let current = "idle";
  for (let i = steps.length - 1; i >= 0; i--) {
    if (t >= steps[i]!.at) {
      current = steps[i]!.show;
      break;
    }
  }
  return current;
}
