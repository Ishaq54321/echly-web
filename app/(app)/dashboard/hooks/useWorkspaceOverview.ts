"use client";

/**
 * Session list types and helpers for dashboard components.
 * Runtime session data lives in {@link useWorkspaceStore} / {@link WorkspaceStoreProvider}.
 */
export type {
  SessionWithCounts,
  ViewMode,
} from "@/lib/client/workspaceStore";
export { countsFromSessionFields } from "@/lib/client/workspaceStore";
