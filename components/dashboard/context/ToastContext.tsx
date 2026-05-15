"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Toast } from "@/components/ui/Toast";

interface ToastContextValue {
  /**
   * Show a toast. Pass `{ persist: true }` to keep it on screen until
   * `dismissToast()` (or another `showToast`) is called — the default
   * is the usual auto-dismiss after a few seconds.
   */
  showToast: (message: string, options?: { persist?: boolean }) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    persist: boolean;
  }>({
    message: "",
    visible: false,
    persist: false,
  });

  const showToast = useCallback(
    (message: string, options?: { persist?: boolean }) => {
      setToast({ message, visible: true, persist: options?.persist ?? false });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={dismissToast}
        // 0 → no auto-dismiss timer; caller controls the lifetime.
        duration={toast.persist ? 0 : undefined}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {}, dismissToast: () => {} };
  }
  return ctx;
}
