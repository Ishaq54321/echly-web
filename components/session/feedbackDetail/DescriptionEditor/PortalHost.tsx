"use client";

import { createContext, useContext, type ReactNode } from "react";

const PortalHostContext = createContext<HTMLElement | null>(null);

interface PortalHostProviderProps {
  container: HTMLElement | null;
  children: ReactNode;
}

export function PortalHostProvider({ container, children }: PortalHostProviderProps) {
  return (
    <PortalHostContext.Provider value={container}>
      {children}
    </PortalHostContext.Provider>
  );
}

export function usePortalHost(): HTMLElement {
  const ctx = useContext(PortalHostContext);
  if (ctx) return ctx;
  if (typeof document !== "undefined") return document.body;
  return null as unknown as HTMLElement;
}
