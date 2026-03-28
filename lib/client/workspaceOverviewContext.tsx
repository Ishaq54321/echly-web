"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useWorkspaceOverviewState } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";

type WorkspaceOverviewValue = ReturnType<typeof useWorkspaceOverviewState>;

const WorkspaceOverviewContext =
  createContext<WorkspaceOverviewValue | null>(null);

/**
 * One `useWorkspaceOverviewState("all")` subscription for the signed-in app shell.
 * Dashboard and GlobalSearch read the same realtime session list.
 */
export function WorkspaceOverviewProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceOverviewState("all");
  return (
    <WorkspaceOverviewContext.Provider value={value}>
      {children}
    </WorkspaceOverviewContext.Provider>
  );
}

export function useWorkspaceOverview(): WorkspaceOverviewValue {
  const ctx = useContext(WorkspaceOverviewContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceOverview must be used within WorkspaceOverviewProvider"
    );
  }
  return ctx;
}
