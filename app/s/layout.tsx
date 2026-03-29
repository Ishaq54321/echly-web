import { WorkspaceProvider } from "@/lib/client/workspaceContext";

/** Share routes use the same workspace + auth provider as the app shell for consistent context. */
export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
