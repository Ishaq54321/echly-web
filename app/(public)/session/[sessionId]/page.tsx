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
import { getUidHint } from "@/lib/client/workspaceBootstrap";

function PublicSessionView({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { authReady, authUid } = useWorkspace();

  const [uidHint, setUidHint] = useState<string | null>(null);

  useEffect(() => {
    setUidHint(getUidHint());
  }, []);

  useEffect(() => {
    if (authReady && authUid && token) {
      setShareToken(token);
    }
  }, [authReady, authUid, token]);

  const showAuthShell = !!authUid || !!uidHint;

  const authShell = (content: React.ReactNode) => (
    <div suppressHydrationWarning className="flex h-screen overflow-hidden">
      <GlobalRail />
      <div className="content-divider shrink-0" aria-hidden />
      <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          {content}
        </div>
      </main>
    </div>
  );

  if (showAuthShell) {
    return authShell(
      <SessionPageClient
        sessionId={sessionId}
        onAccessBlocked={() => {}}
      />
    );
  }

  return (
    <div suppressHydrationWarning style={{ height: "100dvh", overflow: "hidden", position: "relative" }}>
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
          onAccessBlocked={() => {}}
        />
      </div>
      <PublicViewerBanner
        sessionId={sessionId}
        shareToken={token}
        canRequestAccess={false}
      />
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
