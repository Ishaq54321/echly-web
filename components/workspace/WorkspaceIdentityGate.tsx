"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { OverlayError } from "@/components/ui/OverlayError";

type Props = { children: React.ReactNode };

/**
 * NBIB: never blocks the shell on claims or workspace resolution.
 * Explicit workspace load failures surface as a non-destructive overlay; underlying UI stays mounted.
 */
export function WorkspaceIdentityGate({ children }: Props) {
  const { workspaceError, needsOnboarding } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, router]);

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
          showOnboardingLink={false}
        />
      ) : null}
    </>
  );
}
