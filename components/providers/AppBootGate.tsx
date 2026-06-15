"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useAppBoot } from "@/lib/client/perception/useAppBoot";

export type AppBootChromeContextValue = {
  surfaceReady: boolean;
  reportSurfaceReady: (ready: boolean) => void;
};

const AppBootChromeContext = createContext<AppBootChromeContextValue | null>(
  null
);

export function useAppBootChromeOptional(): AppBootChromeContextValue | null {
  return useContext(AppBootChromeContext);
}

/**
 * Outermost shell. NBIB: never covers the UI; boot state is tracked for chrome hooks only.
 */
export function AppBootGate({ children }: { children: ReactNode }) {
  const [surfaceReady, setSurfaceReady] = useState(true);

  const reportSurfaceReady = useCallback((ready: boolean) => {
    setSurfaceReady((prev) => ready || prev);
  }, []);

  const chromeValue = useMemo(
    () => ({ surfaceReady, reportSurfaceReady }),
    [surfaceReady, reportSurfaceReady]
  );

  return (
    <AppBootChromeContext.Provider value={chromeValue}>
      <div className="relative flex h-full min-h-screen w-full flex-1 flex-col">
        {children}
      </div>
    </AppBootChromeContext.Provider>
  );
}

/**
 * Under WorkspaceStoreProvider. Dismisses boot overlay when auth has initialized only.
 * Claims, workspace id, sessions, and billing load progressively and must not block boot.
 */
export function AppBootReadinessBridge() {
  // All hooks must run unconditionally on every render (rules of hooks). The
  // early return for a missing chrome context happens AFTER the hooks below.
  const chrome = useAppBootChromeOptional();
  const { authReady } = useWorkspace();
  const bootReady = useAppBoot(authReady);

  const reportSurfaceReady = chrome?.reportSurfaceReady;
  useEffect(() => {
    reportSurfaceReady?.(bootReady);
  }, [bootReady, reportSurfaceReady]);

  if (!chrome) return null;

  return null;
}
