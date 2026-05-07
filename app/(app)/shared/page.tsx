"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { RotateCcw, WifiOff } from "lucide-react";
import type { SharedSessionMembership } from "@/lib/domain/session";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { SessionWorkspaceRow } from "@/components/dashboard/SessionsWorkspace";
import { sharedToSessionWithCounts } from "@/lib/utils/sharedSessionAdapter";

const LeaveSessionModal = dynamic(
  () =>
    import("@/components/dashboard/LeaveSessionModal").then((m) => m.LeaveSessionModal),
  { ssr: false }
);

function ErrorState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "var(--color-danger-bg)",
          border: "1px solid var(--color-danger-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <WifiOff size={24} color="var(--color-danger)" />
      </div>

      <h2
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "var(--text-heading)",
          letterSpacing: "-0.2px",
          margin: "0 0 8px 0",
        }}
      >
        Couldn&apos;t load shared sessions
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          lineHeight: "1.6",
          maxWidth: "280px",
          margin: "0 0 24px 0",
        }}
      >
        Something went wrong while loading your sessions. This is usually a
        temporary issue.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          height: "38px",
          padding: "0 20px",
          background: "#FFFFFF",
          border: "1.5px solid var(--border)",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "500",
          color: "var(--text-body)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "all 140ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--text-placeholder)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 2px 8px rgba(0,0,0,0.10)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.06)";
        }}
      >
        <RotateCcw size={14} />
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: 160, height: 140, marginBottom: 20 }}>
        <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
          <g transform="translate(100 82) rotate(-9) translate(-50 -30)">
            <rect width="100" height="60" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
            <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#E5E7EB" />
            <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
          </g>
          <g transform="translate(100 82) rotate(6) translate(-50 -28)">
            <rect width="100" height="56" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
            <rect x="14" y="14" width="38" height="5" rx="2.5" fill="#D1D5DB" />
            <rect x="14" y="26" width="56" height="4" rx="2" fill="#E5E7EB" />
            <rect x="14" y="36" width="42" height="4" rx="2" fill="#E5E7EB" />
          </g>
          <g transform="translate(146 112)">
            <circle cx="17" cy="17" r="14" fill="#6B7280" />
            <circle cx="12" cy="17" r="2.5" fill="#fff" />
            <circle cx="22" cy="12" r="2.5" fill="#fff" />
            <circle cx="22" cy="22" r="2.5" fill="#fff" />
            <line x1="12" y1="17" x2="22" y2="12" stroke="#fff" strokeWidth="1.5" />
            <line x1="12" y1="17" x2="22" y2="22" stroke="#fff" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      <h2
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--text-heading)",
          letterSpacing: "-0.005em",
          margin: "0 0 6px 0",
        }}
      >
        Nothing shared with you yet
      </h2>

      <p
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: "1.5",
          maxWidth: "260px",
          margin: 0,
        }}
      >
        When someone shares a session with you, it will appear here.
      </p>
    </div>
  );
}

export default function SharedPage() {
  const router = useRouter();
  const { isIdentityResolved } = useWorkspace();
  const [sessions, setSessions] = useState<SharedSessionMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [leaveModalSessionId, setLeaveModalSessionId] = useState<string | null>(null);

  const isLoading = loading || !isIdentityResolved;

  useEffect(() => {
    if (!isIdentityResolved) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    void (async () => {
      try {
        let res = await authFetch("/api/sessions/shared");

        // Single retry on null (auth not ready) or 401
        if (!res || res.status === 401) {
          await new Promise<void>((resolve) => setTimeout(resolve, 800));
          res = await authFetch("/api/sessions/shared");
        }

        if (cancelled) return;
        if (!res?.ok) throw new Error("Failed to fetch");
        const json = (await res.json()) as {
          success: boolean;
          data?: { sessions: SharedSessionMembership[] };
        };
        if (cancelled) return;
        setSessions(
          (json.data?.sessions ?? []).filter((s) => !s.isArchived)
        );
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isIdentityResolved]);

  const handleViewShared = useCallback(
    (sessionId: string) => {
      router.push(`/session/${sessionId}`);
    },
    [router]
  );

  const handleLeaveSession = useCallback((sessionId: string) => {
    setLeaveModalSessionId(sessionId);
  }, []);

  const leaveModalSession = useMemo(
    () =>
      leaveModalSessionId
        ? sessions.find((s) => s.sessionId === leaveModalSessionId) ?? null
        : null,
    [leaveModalSessionId, sessions]
  );

  const confirmLeaveSession = useCallback(async () => {
    if (!leaveModalSessionId) return;
    const res = await authFetch(
      `/api/sessions/shared/${leaveModalSessionId}`,
      { method: "DELETE" }
    );
    if (!res || !res.ok) {
      throw new Error("Failed to leave session");
    }
    setSessions((prev) =>
      prev.filter((s) => s.sessionId !== leaveModalSessionId)
    );
  }, [leaveModalSessionId]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .skeleton-pulse {
          animation: shimmer 1.6s ease-in-out infinite;
          background: var(--surface-hover);
          border-radius: 6px;
        }
      `}</style>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: "1280px",
            padding: "12px 24px 40px 24px",
          }}
        >
        {/* Header */}
        <div style={{ paddingBottom: 0 }}>
          <span className="text-xs font-medium text-[var(--text-tertiary)] block mb-1 tracking-wide">
            Library
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: sessions.length > 0 ? "4px" : "0",
            }}
          >
            <h1 className="text-xl font-bold text-[var(--text-heading)] tracking-[-0.4px] mt-1 mb-0">
              Shared with me
            </h1>

          </div>

          {sessions.length > 0 && !isLoading && (
            <p className="text-sm font-normal text-[var(--text-secondary)] mt-1">
              Sessions shared with you from other workspaces
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{ paddingTop: "20px" }}>
          {isLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: "72px",
                    padding: "16px",
                    background: "#FFFFFF",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {/* Left side */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      className="skeleton-pulse"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        animationDelay: `${i * 120}ms`,
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        className="skeleton-pulse"
                        style={{
                          width: "180px",
                          height: "15px",
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                      <div
                        className="skeleton-pulse"
                        style={{
                          width: "260px",
                          height: "12px",
                          marginTop: "8px",
                          opacity: 0.6,
                          animationDelay: `${i * 120 + 80}ms`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Right side */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      className="skeleton-pulse"
                      style={{
                        width: "70px",
                        height: "26px",
                        borderRadius: "9999px",
                        animationDelay: `${i * 120 + 40}ms`,
                      }}
                    />
                    <div
                      className="skeleton-pulse"
                      style={{
                        width: "85px",
                        height: "26px",
                        borderRadius: "9999px",
                        animationDelay: `${i * 120 + 60}ms`,
                      }}
                    />
                    <div
                      className="skeleton-pulse"
                      style={{
                        width: "55px",
                        height: "26px",
                        borderRadius: "9999px",
                        opacity: 0.6,
                        animationDelay: `${i * 120 + 80}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </>
          ) : error ? (
            <ErrorState />
          ) : sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {sessions.map((m) => (
                <SessionWorkspaceRow
                  key={m.sessionId}
                  item={sharedToSessionWithCounts(m)}
                  onView={handleViewShared}
                  isSharedSession
                  sharedByName={m.addedByName ?? undefined}
                  workspaceLabel={m.workspaceName ?? undefined}
                  onLeaveSession={handleLeaveSession}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {leaveModalSessionId ? (
        <LeaveSessionModal
          open
          onClose={() => setLeaveModalSessionId(null)}
          sessionTitle={leaveModalSession?.sessionName ?? ""}
          onConfirm={confirmLeaveSession}
        />
      ) : null}
    </>
  );
}
