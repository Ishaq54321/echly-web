"use client";

import { motion } from "framer-motion";
import { Download, Globe, MessageSquare, ChevronRight } from "lucide-react";

const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore"; // Replace with real link when published

const cardClass =
  "flex gap-4 items-start rounded-xl border border-[#E5E7EB] bg-white p-5 transition-all duration-200 ease-out hover:border-[#466EFF] hover:shadow-[0_6px_20px_rgba(70,110,255,0.15)]";

const iconContainerClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#466EFF]/10 text-[#466EFF]";

export function ActivationSteps() {
  return (
    <div className="space-y-4 w-full">
      {/* Step 1: Install Extension */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={iconContainerClass}>
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Install Extension</h3>
          <p className="text-gray-500 text-sm mb-4">
            Capture feedback from any website without leaving the page.
          </p>
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-[10px] px-5 text-sm font-medium text-white transition-all hover:brightness-105"
            style={{
              background: "linear-gradient(135deg, #466EFF, #5F7DFF)",
            }}
          >
            Install extension
          </a>
        </div>
      </motion.div>

      {/* Step 2: Open Website */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
      >
        <div className={iconContainerClass}>
          <Globe className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Open Website</h3>
          <p className="text-gray-500 text-sm">
            Go to the page you want to collect feedback on and click the Echly icon.
          </p>
        </div>
      </motion.div>

      {/* Step 3: Capture Feedback */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={iconContainerClass}>
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Capture Feedback</h3>
          <p className="text-gray-500 text-sm mb-4">
            Select an element, add a comment, and a ticket is created in your dashboard.
          </p>
          <FlowDiagram />
        </div>
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
    <div className="flex flex-wrap items-center gap-2 py-4">
      {chips.map((chip, i) => (
        <span key={chip.label} className="flex items-center gap-2">
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700">
            {chip.label}
          </span>
          {i < chips.length - 1 && (
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          )}
        </span>
      ))}
    </div>
  );
}
