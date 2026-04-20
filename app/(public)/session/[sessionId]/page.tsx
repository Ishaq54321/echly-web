"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PublicSessionNav, { PUBLIC_NAV_HEIGHT } from "@/components/layout/PublicSessionNav";
import SessionPageClient from "@/app/(app)/dashboard/[sessionId]/SessionPageClient";
import GlobalRail from "@/components/layout/GlobalRail";
import PublicViewerBanner from "@/components/session/PublicViewerBanner";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { setShareToken } from "@/lib/client/shareToken";

function PublicSessionView({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { authReady, authUid, isIdentityResolved } = useWorkspace();
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [isWorkspaceMember, setIsWorkspaceMember] = useState(false);

  useEffect(() => {
    if (authReady && authUid && token) {
      setShareToken(token);
    }
  }, [authReady, authUid, token]);

  useEffect(() => {
    if (!authUid || !isIdentityResolved) return;
    let cancelled = false;
    setSessionLoading(true);
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setIsWorkspaceMember(data?.access?.isWorkspaceMember === true);
        }
      })
      .catch(() => {
        if (!cancelled) setIsWorkspaceMember(false);
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, authUid, isIdentityResolved]);

  const isMember = isWorkspaceMember;

  const spinner = (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          border: "2.5px solid #E0E0E0",
          borderTopColor: "#1775E0",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!authReady || (!!authUid && (sessionLoading || !isIdentityResolved))) {
    return spinner;
  }

  if (accessBlocked) {
    return (
      <SessionPageClient
        sessionId={sessionId}
        isPublicRoute
        onAccessBlocked={() => setAccessBlocked(true)}
      />
    );
  }

  if (authUid && isMember) {
    return (
      <div className="flex h-screen overflow-hidden">
        <GlobalRail />
        <div className="content-divider shrink-0" aria-hidden />
        <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <SessionPageClient
              sessionId={sessionId}
              onAccessBlocked={() => setAccessBlocked(true)}
            />
          </div>
        </main>
      </div>
    );
  }

  if (authUid && !isMember) {
    return (
      <div className="flex h-screen overflow-hidden">
        <GlobalRail />
        <div className="content-divider shrink-0" aria-hidden />
        <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <SessionPageClient
              sessionId={sessionId}
              onAccessBlocked={() => setAccessBlocked(true)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh", overflow: "hidden", position: "relative" }}>
      <PublicSessionNav />
      <div
        style={{
          marginTop: `${PUBLIC_NAV_HEIGHT}px`,
          height: `calc(100dvh - ${PUBLIC_NAV_HEIGHT}px)`,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: "88px",
        }}
      >
        <SessionPageClient
          sessionId={sessionId}
          isPublicRoute
          onAccessBlocked={() => setAccessBlocked(true)}
        />
      </div>
      <PublicViewerBanner sessionId={sessionId} shareToken={token} canRequestAccess={false} />
    </div>
  );
}

export default function PublicSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);

  return (
    <Suspense>
      <PublicSessionView sessionId={sessionId} />
    </Suspense>
  );
}
