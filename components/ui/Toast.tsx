"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible || !message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [visible, message, duration, onDismiss]);

  if (!visible || !message || typeof document === "undefined" || !mounted)
    return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium shadow-lg transition-opacity duration-200"
    >
      {message}
    </div>,
    document.body
  );
}
