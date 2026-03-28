"use client";

import Link from "next/link";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

type Props = { children: React.ReactNode };

function FullScreenError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-lg font-medium text-gray-900">{message}</p>
      <p className="max-w-md text-sm text-gray-600">
        Your account workspace could not be loaded. Try refreshing the page or sign in again.
      </p>
      <button
        type="button"
        className="rounded-lg bg-[#466EFF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}

/**
 * Blocks the app shell when workspace identity cannot be loaded for a signed-in user.
 * Missing workspace is a system error, not a silent empty state.
 */
export function WorkspaceIdentityGate({ children }: Props) {
  const {
    workspaceId,
    workspaceError,
    workspaceLoading,
    claimsReady,
    authReady,
    authUid,
  } = useWorkspace();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#466EFF]"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (workspaceError) {
    const needsOnboarding = workspaceError === MISSING_USER_WORKSPACE_ERROR;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-lg font-medium text-gray-900">Workspace unavailable</p>
        <p className="max-w-md text-sm text-gray-600">
          {workspaceError ||
            "Your account workspace could not be loaded. Try refreshing the page or sign in again."}
        </p>
        {needsOnboarding ? (
          <Link
            href="/onboarding"
            className="rounded-lg bg-[#466EFF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Complete setup
          </Link>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }

  if (!authUid) {
    return <>{children}</>;
  }

  if (!claimsReady || workspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#466EFF]"
          aria-label="Loading identity"
        />
      </div>
    );
  }

  if (!workspaceId || workspaceId.trim() === "") {
    return <FullScreenError message="Workspace not found" />;
  }

  return <>{children}</>;
}
