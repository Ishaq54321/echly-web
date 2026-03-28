"use client";

import { useWorkspace } from "@/lib/client/workspaceContext";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { OverlayError } from "@/components/ui/OverlayError";

type Props = { children: React.ReactNode };

/**
 * NBIB: never blocks the shell on claims or workspace resolution.
 * Explicit workspace load failures surface as a non-destructive overlay; underlying UI stays mounted.
 */
export function WorkspaceIdentityGate({ children }: Props) {
  const { workspaceError } = useWorkspace();
  const needsOnboarding = workspaceError === MISSING_USER_WORKSPACE_ERROR;

  return (
    <>
      {children}
      {workspaceError ? (
        <OverlayError
          title="Workspace unavailable"
          message={
            workspaceError ||
            "Your account workspace could not be loaded. Try refreshing the page or sign in again."
          }
          showOnboardingLink={needsOnboarding}
        />
      ) : null}
    </>
  );
}
