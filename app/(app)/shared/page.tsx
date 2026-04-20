"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { Building2, Calendar, Check, CircleDashed, Inbox, RotateCcw, WifiOff } from "lucide-react";
import type { SharedSessionMembership } from "@/lib/domain/session";
import { useWorkspace } from "@/lib/client/workspaceContext";
import ProgressPie from "@/components/ui/ProgressPie";

function formatDate(
  addedAt: { seconds: number; nanoseconds: number } | null
): string {
  if (!addedAt) return "";
  const d = new Date(addedAt.seconds * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <WifiOff size={24} color="#EF4444" />
      </div>

      <h2
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#111111",
          letterSpacing: "-0.2px",
          margin: "0 0 8px 0",
        }}
      >
        Couldn&apos;t load shared sessions
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "#777777",
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
          border: "1.5px solid #E0E0E0",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#333333",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "all 140ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#BBBBBB";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 2px 8px rgba(0,0,0,0.10)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#E0E0E0";
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
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          background: "#F4F5F7",
          border: "1px solid #EBEBEB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Inbox size={28} color="#AAAAAA" />
      </div>

      <h2
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#111111",
          letterSpacing: "-0.2px",
          margin: "0 0 8px 0",
        }}
      >
        Nothing shared yet
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "#777777",
          lineHeight: "1.6",
          maxWidth: "300px",
          margin: "0",
        }}
      >
        Sessions shared with you from outside your workspace will appear here
        once someone invites you.
      </p>
    </div>
  );
}

function SessionRow({
  session,
  onClick,
}: {
  session: SharedSessionMembership;
  onClick: () => void;
}) {
  const dateLabel = formatDate(session.addedAt);
  const workspaceLabel =
    session.workspaceName ?? session.workspaceId.slice(0, 8) + "...";

  const open = session.openCount ?? 0;
  const resolved = session.resolvedCount ?? 0;
  const total = open + resolved;
  let progress = total === 0 ? 0 : (resolved / total) * 100;
  if (progress >= 100) progress = 99.999;

  // Pill shared style — matches dashboard SessionWorkspaceRow chips
  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    borderRadius: "9999px",
    border: "1px solid #E5E5E5",
    background: "#FFFFFF",
    padding: "6px 12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    whiteSpace: "nowrap",
    minHeight: "36px",
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = "#F7F8FA";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        el.style.transform = "translateY(-1px)";
        el.style.borderRadius = "12px";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = "#FFFFFF";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
        el.style.borderRadius = "12px";
      }}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "12px",
        padding: "16px",
        background: "#FFFFFF",
        cursor: "pointer",
        transition: "all 150ms",
        outline: "none",
        marginBottom: "12px",
      }}
    >
      {/* Left section */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
        <ProgressPie value={progress} size={32} />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "500",
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {session.sessionName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "3px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#555555", fontWeight: "400" }}>
              {session.addedByName
                ? `Shared by ${session.addedByName}`
                : "Added to session"}
            </span>
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "#D1D5DB",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#F4F5F7",
                border: "1px solid #E0E0E0",
                borderRadius: "9999px",
                padding: "3px 10px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#444444",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <Building2 size={15} color="#444444" />
              {workspaceLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {open > 0 && (
          <div style={chipStyle}>
            <CircleDashed size={16} style={{ color: "#3B82F6", flexShrink: 0 }} />
            <span style={{ letterSpacing: "-0.01em" }}>{open} open</span>
          </div>
        )}

        {resolved > 0 && (
          <div style={chipStyle}>
            <Check size={16} strokeWidth={2.5} style={{ color: "#22C55E", flexShrink: 0 }} />
            <span style={{ letterSpacing: "-0.01em" }}>{resolved} resolved</span>
          </div>
        )}

        {dateLabel && (
          <div style={{ ...chipStyle, minWidth: "5.5rem" }}>
            <Calendar size={16} strokeWidth={2.5} style={{ color: "#F97316", flexShrink: 0 }} />
            <span style={{ letterSpacing: "-0.01em" }}>{dateLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharedPage() {
  const router = useRouter();
  const { isIdentityResolved } = useWorkspace();
  const [sessions, setSessions] = useState<SharedSessionMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .skeleton-pulse {
          animation: shimmer 1.6s ease-in-out infinite;
          background: #F0F0F0;
          border-radius: 6px;
        }
      `}</style>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "#FFFFFF",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: "1400px",
            padding: "12px 24px 40px 24px",
          }}
        >
        {/* Header */}
        <div style={{ paddingBottom: 0 }}>
          <span
            style={{
              fontSize: "15px",
              color: "#000000",
              display: "block",
              marginBottom: "4px",
              fontWeight: "600",
            }}
          >
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
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#111111",
                letterSpacing: "-0.4px",
                margin: "0",
                lineHeight: "1.1",
              }}
            >
              Shared with me
            </h1>

          </div>

          {sessions.length > 0 && !isLoading && (
            <p
              style={{
                fontSize: "14px",
                color: "#6B7280",
                margin: "4px 0 0 0",
              }}
            >
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
            sessions.map((session) => (
              <SessionRow
                key={session.sessionId}
                session={session}
                onClick={() => router.push(`/session/${session.sessionId}`)}
              />
            ))
          )}
        </div>
        </div>
      </div>
    </>
  );
}
