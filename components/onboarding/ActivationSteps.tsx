"use client";

import { motion } from "framer-motion";
import { Download, Globe, MessageSquare, ChevronRight } from "lucide-react";

const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore";

const CARD_ANIMATION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0, 0, 0.58, 1] as const },
};

export interface ActivationStepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  delay?: number;
}

export function ActivationStepCard({
  icon,
  title,
  description,
  action,
  delay = 0,
}: ActivationStepCardProps) {
  return (
    <motion.div
      className="rounded-2xl bg-white/60 backdrop-blur-lg border border-gray-200 shadow-[0_8px_20px_rgba(0,0,0,0.08)] p-6 w-[240px] transition-all duration-200 hover:shadow-[0_14px_35px_rgba(0,0,0,0.12)] hover:-translate-y-[2px] flex flex-col items-start"
      initial={CARD_ANIMATION.initial}
      animate={CARD_ANIMATION.animate}
      transition={{ ...CARD_ANIMATION.transition, delay }}
    >
      <div className="w-12 h-12 rounded-xl bg-[#EEF3FF] flex items-center justify-center text-[#466EFF] mb-4">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-[14px] text-gray-600 flex-1">{description}</p>
      {action && <div className="mt-4 w-full">{action}</div>}
    </motion.div>
  );
}

function FlowArrow() {
  return (
    <span
      className="text-gray-300 text-[20px] animate-pulse select-none"
      aria-hidden
    >
      <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
    </span>
  );
}

function WorkflowDemo() {
  const steps = [
    { label: "Browser" },
    { label: "Select element" },
    { label: "Comment" },
    { label: "Ticket created" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {steps.map((step, i) => (
        <span key={step.label} className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          )}
        </span>
      ))}
    </div>
  );
}

export function ActivationSteps() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Horizontal guided flow: Step 1 → Step 2 → Step 3 */}
      <div className="flex items-center justify-center gap-6 mt-10 overflow-x-auto pb-2 min-w-0 w-full max-w-full">
        <ActivationStepCard
          icon={<Download className="w-6 h-6" />}
          title="Install Extension"
          description="Capture feedback from any website instantly."
          delay={0}
          action={
            <a
              href={CHROME_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center rounded-full px-4 text-sm font-medium text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #466EFF, #6A8CFF)",
                boxShadow: "0 6px 18px rgba(70,110,255,0.25)",
              }}
            >
              Install
            </a>
          }
        />
        <FlowArrow />
        <ActivationStepCard
          icon={<Globe className="w-6 h-6" />}
          title="Open Website"
          description="Go to the page you want to collect feedback on and click the Echly icon."
          delay={0.12}
        />
        <FlowArrow />
        <ActivationStepCard
          icon={<MessageSquare className="w-6 h-6" />}
          title="Capture Feedback"
          description="Select an element, add a comment, and a ticket is created in your dashboard."
          delay={0.24}
        />
      </div>

      {/* Visual workflow preview */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.36 }}
      >
        <WorkflowDemo />
      </motion.div>
    </div>
  );
}
