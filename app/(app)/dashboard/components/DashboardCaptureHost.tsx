"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

export interface DashboardCaptureHostProps {
  open: boolean;
  onClose: () => void;
}

export default function DashboardCaptureHost({ open, onClose }: DashboardCaptureHostProps) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
  };

  useEffect(() => {
    if (!isClosing) return;
    const t = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
    return () => clearTimeout(t);
  }, [isClosing, onClose]);

  const handleInstall = () => {
    window.open(CHROME_EXTENSION_URL, "_blank");
  };

  if (!mounted || !open) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[2147483647] w-[340px] rounded-2xl p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${isClosing ? "animate-extension-tray-out" : "animate-extension-tray-in"}`}
      role="dialog"
      aria-label="Install Echly extension"
    >
      {/* Header: logo + close */}
      <div className="flex items-center justify-between mb-4">
        <Image
          src="/Echly_logo.svg"
          alt="Echly"
          width={96}
          height={24}
          className="h-6 w-auto dark:invert"
        />
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Illustration placeholder */}
      <div className="h-[120px] rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500 dark:text-neutral-400">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        Capture feedback anywhere
      </h2>

      {/* Description */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
        Install the Echly extension to capture feedback across any website, with pixel-perfect screenshots and real-time annotations.
      </p>

      {/* Bullets */}
      <ul className="space-y-2 mb-5">
        {[
          "Capture on any website",
          "Pixel-perfect screenshots",
          "Voice & AI-powered feedback",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155DFC] shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleInstall}
        className="w-full h-11 rounded-[10px] font-medium text-white bg-gradient-to-r from-[#155DFC] to-[#0d47d1] hover:from-[#1a6aff] hover:to-[#155DFC] active:scale-[0.98] transition-all duration-150 shadow-sm"
      >
        Install Chrome Extension
      </button>

      {/* Secondary */}
      <button
        type="button"
        onClick={handleClose}
        className="w-full mt-3 h-10 rounded-[10px] text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150"
      >
        Maybe later
      </button>
    </div>
  );
}
