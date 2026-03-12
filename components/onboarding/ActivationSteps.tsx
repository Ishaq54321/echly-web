"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download, MessageSquare, Share2, ChevronRight } from "lucide-react";

const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore"; // Replace with real link when published

const cardClass =
  "flex flex-col gap-3 rounded-2xl border border-[#E3E6E5] bg-[#FFFFFF] p-6 transition-all duration-200 ease-out hover:border-[#E5E7EB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]";

const iconContainerClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F3F2] text-[#111111] border border-[#E3E6E5]";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-[10px] text-[#111111] font-semibold text-base transition-all hover:brightness-105 px-[22px]";
const primaryButtonStyle = {
  background: "#9FE870",
  boxShadow: "0 6px 20px rgba(70,110,255,0.25)",
};

export function ActivationSteps() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Step 1: Install the Echly Extension */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={iconContainerClass}>
          <Download className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium text-[#111111]">Install the Echly Extension</h3>
        <p className="text-[#111111] text-sm">
          Capture feedback instantly from any website with one click.
        </p>
      </motion.div>

      {/* Step 2: Capture Feedback */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
      >
        <div className={iconContainerClass}>
          <MessageSquare className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium text-[#111111]">Capture Feedback</h3>
        <p className="text-[#111111] text-sm">
          Click anywhere on the page and describe issues using voice or text.
        </p>
        <FlowDiagram />
      </motion.div>

      {/* Step 3: Share Your Session */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={iconContainerClass}>
          <Share2 className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium text-[#111111]">Share Your Session</h3>
        <p className="text-[#111111] text-sm">
          You can share the session link with anyone to review feedback and tickets.
        </p>
        <Link
          href="/dashboard"
          className={`${primaryButtonClass} inline-flex items-center gap-1.5 mt-auto`}
          style={primaryButtonStyle}
        >
          Go to Dashboard →
        </Link>
      </motion.div>
    </div>
  );
}

function FlowDiagram() {
  const chips = [
    { label: "Browser" },
    { label: "Select element" },
    { label: "Comment" },
    { label: "Ticket created" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {chips.map((chip, i) => (
        <span key={chip.label} className="flex items-center gap-2">
          <span className="rounded-full border border-[#E3E6E5] bg-white px-2.5 py-1.5 text-xs text-[#4A4A4A]">
            {chip.label}
          </span>
          {i < chips.length - 1 ? (
            <ChevronRight className="h-4 w-4 shrink-0 text-[#111111]" />
          ) : null}
        </span>
      ))}
    </div>
  );
}
