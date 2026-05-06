"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { Building2, Calendar, Check, CircleDashed, RotateCcw, WifiOff } from "lucide-react";
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
    border: "1px solid var(--border)",
    background: "#FFFFFF",
    padding: "6px 12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-body)",
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
        el.style.background = "var(--surface-hover)";
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
              color: "var(--text-heading)",
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
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "400" }}>
              {session.addedByName
                ? `Shared by ${session.addedByName}`
                : "Added to session"}
            </span>
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "var(--border-strong)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "var(--surface-hover)",
                border: "1px solid var(--border)",
                borderRadius: "9999px",
                padding: "3px 10px",
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--text-body)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <Building2 size={15} color="var(--text-body)" />
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
            <CircleDashed size={16} style={{ color: "#1775E0", flexShrink: 0 }} />
            <span style={{ letterSpacing: "-0.01em" }}>{open} open</span>
          </div>
        )}

        {resolved > 0 && (
          <div style={chipStyle}>
            <Check size={16} strokeWidth={2.5} style={{ color: "var(--color-success)", flexShrink: 0 }} />
            <span style={{ letterSpacing: "-0.01em" }}>{resolved} resolved</span>
          </div>
        )}

        {dateLabel && (
          <div style={{ ...chipStyle, minWidth: "5.5rem" }}>
            <Calendar size={16} strokeWidth={2.5} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
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
