"use client";

import { Check, Clock, Lock, Loader2, XCircle } from "lucide-react";
import PublicSessionNav, { PUBLIC_NAV_HEIGHT } from "@/components/layout/PublicSessionNav";

export interface RequestSessionAccessPageProps {
  sessionId: string;
  sessionName: string | null;
  workspaceName: string | null;
  isAuthenticated: boolean;
  isPublicRoute?: boolean;
  userEmail: string | null;
  requestStatus: "idle" | "pending" | "submitted" | "already_requested" | "rejected";
  onRequestAccess: () => Promise<void>;
  onSignIn: () => void;
}

export function RequestSessionAccessPage({
  sessionName,
  workspaceName,
  isAuthenticated,
  isPublicRoute,
  requestStatus,
  onRequestAccess,
  onSignIn,
}: RequestSessionAccessPageProps) {
  const iconBg =
    requestStatus === "submitted"
      ? "var(--color-success-bg)"
      : requestStatus === "already_requested"
        ? "var(--color-warning-bg)"
        : requestStatus === "rejected"
          ? "var(--color-danger-bg)"
          : "var(--color-danger-bg)";

  const iconColor =
    requestStatus === "submitted"
      ? "var(--color-success-solid)"
      : requestStatus === "already_requested"
        ? "var(--color-warning-dot)"
        : "var(--color-danger)";

  const IconComponent =
    requestStatus === "submitted"
      ? Check
      : requestStatus === "already_requested"
        ? Clock
        : requestStatus === "rejected"
          ? XCircle
          : Lock;

  const heading =
    requestStatus === "submitted"
      ? "Request sent"
      : requestStatus === "already_requested"
        ? "Request pending"
        : requestStatus === "rejected"
          ? "Request declined"
          : "Access required";

  const body =
    requestStatus === "submitted"
      ? "The session team has been notified. You'll receive an email when your request is reviewed."
      : requestStatus === "already_requested"
        ? "Your request is being reviewed. You'll be notified by email once the team responds."
        : requestStatus === "rejected"
          ? "Your request to access this session was declined. Reach out to the person who shared this with you if you think this was a mistake."
          : isAuthenticated
            ? "This session is private. Request access and the team will be notified to review your request."
            : "Sign in to request access to this session.";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--surface-subtle)",
      }}
    >
      {isPublicRoute !== false && <PublicSessionNav />}

      <div
        style={{
          paddingTop: PUBLIC_NAV_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: `calc(100dvh - ${PUBLIC_NAV_HEIGHT}px)`,
          padding: `${PUBLIC_NAV_HEIGHT}px 24px 24px`,
        }}
      >
        {/* Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            maxWidth: 420,
            width: "calc(100% - 32px)",
            padding: "36px 32px 32px",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              background: iconBg,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <IconComponent size={24} color={iconColor} />
          </div>

          {/* Session name */}
          {sessionName && requestStatus === "idle" ? (
            <p
              style={{
                fontSize: 13,
                color: "#999",
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              {sessionName}
            </p>
          ) : null}

          {/* Heading */}
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-heading)",
              letterSpacing: "-0.3px",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            {heading}
          </h1>

          {/* Body */}
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 320,
              margin: "0 auto 24px",
            }}
          >
            {body}
          </p>

          {/* CTA */}
          {requestStatus === "idle" ? (
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  void onRequestAccess();
                } else {
                  onSignIn();
                }
              }}
              style={{
                display: "block",
                width: "100%",
                height: 48,
                background: "#5A49BF",
                color: "#ffffff",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {isAuthenticated ? "Request access" : "Sign in to request access"}
            </button>
          ) : requestStatus === "pending" ? (
            <button
              type="button"
              disabled
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                height: 48,
                background: "#5A49BF",
                color: "#ffffff",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                border: "none",
                cursor: "not-allowed",
                opacity: 0.75,
              }}
            >
              <Loader2 size={18} className="animate-spin" aria-hidden />
              Sending request...
            </button>
          ) : requestStatus === "rejected" ? (
            <button
              type="button"
              onClick={() => void onRequestAccess()}
              style={{
                display: "block",
                width: "100%",
                height: 44,
                background: "transparent",
                color: "var(--text-secondary)",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Request again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
