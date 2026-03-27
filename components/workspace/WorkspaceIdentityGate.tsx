"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useWorkspace } from "@/lib/client/workspaceContext";

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
  const { workspaceId, workspaceError, workspaceLoading } = useWorkspace();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

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
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-lg font-medium text-gray-900">Workspace unavailable</p>
        <p className="max-w-md text-sm text-gray-600">
          {workspaceError.message || "Your account workspace could not be loaded. Try refreshing the page or sign in again."}
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

  if (!firebaseUser) {
    return <>{children}</>;
  }

  if (workspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#466EFF]"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  if (!workspaceId || workspaceId.trim() === "") {
    return <FullScreenError message="Workspace not found" />;
  }

  return <>{children}</>;
}
