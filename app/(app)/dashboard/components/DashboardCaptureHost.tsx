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
      className={`fixed bottom-6 right-6 z-[2147483647] w-[340px] rounded-2xl p-5 bg-white dark:bg-[var(--text-heading)] border border-[var(--border)] dark:border-[var(--border)] shadow-[var(--shadow-lg)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${isClosing ? "animate-extension-tray-out" : "animate-extension-tray-in"}`}
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
          sizes="96px"
          className="h-6 w-auto dark:invert"
        />
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-body)] hover:bg-[var(--surface-hover)] dark:hover:text-[var(--text-placeholder)] dark:hover:bg-[var(--text-heading)] transition-colors"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Illustration placeholder */}
      <div className="h-[120px] rounded-xl bg-[var(--surface-hover)] dark:bg-[var(--text-heading)] flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[var(--surface-hover)] dark:bg-[var(--text-body)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-secondary)] dark:text-[var(--text-tertiary)]">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-[var(--text-heading)] dark:text-white mb-2">
        Capture feedback anywhere
      </h2>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-tertiary)] mb-4 leading-relaxed">
        Install the Echly extension to capture feedback across any website, with pixel-perfect screenshots and real-time annotations.
      </p>

      {/* Bullets */}
      <ul className="space-y-2 mb-5">
        {[
          "Capture on any website",
          "Pixel-perfect screenshots",
          "Voice & AI-powered feedback",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-body)] dark:text-[var(--text-placeholder)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleInstall}
        className="w-full h-11 rounded-[var(--radius-sm)] font-medium text-white bg-gradient-to-r from-[#1775E0] to-[#1462C4] hover:from-[#1775E0] hover:to-[#1775E0] active:scale-[0.98] transition-all duration-150 shadow-sm"
      >
        Install Chrome Extension
      </button>

      {/* Secondary */}
      <button
        type="button"
        onClick={handleClose}
        className="w-full mt-3 h-[38px] rounded-[var(--radius-btn)] text-[14px] font-medium text-[var(--text-secondary)] dark:text-[var(--text-tertiary)] hover:text-[var(--text-heading)] dark:hover:text-[var(--border)] hover:bg-[var(--surface-hover)] dark:hover:bg-[var(--text-heading)] active:scale-[0.98] transition-all duration-150"
      >
        Maybe later
      </button>
    </div>
  );
}
