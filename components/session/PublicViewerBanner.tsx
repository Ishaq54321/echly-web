"use client";

import { useState } from "react";
import { Lock, LogIn, X } from "lucide-react";

type PublicViewerBannerProps = {
  sessionId: string;
  shareToken: string;
  canRequestAccess: boolean;
};

export default function PublicViewerBanner(_props: PublicViewerBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("echly_public_banner_dismissed") === "1";
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("echly_public_banner_dismissed", "1");
    } catch {
      // sessionStorage unavailable
    }
  };

  const handleSignIn = () => {
    window.location.href = `/login?returnUrl=${encodeURIComponent(
      window.location.pathname + window.location.search
    )}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "#FFFFFF",
        borderTop: "1px solid #EBEBEB",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "21px 40px",
      }}
    >
      {/* Left section */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            background: "linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Lock size={18} color="#1775E0" aria-hidden />
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#111111",
            letterSpacing: "-0.1px",
            margin: 0,
          }}
        >
          Sign in to resolve &amp; manage feedback
        </p>
      </div>

      {/* Right section */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        <button
          type="button"
          style={{
            height: 42,
            padding: "0 22px",
            background: "#1775E0",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "#FFFFFF",
            cursor: "pointer",
            letterSpacing: "-0.1px",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            boxShadow: "0 1px 3px rgba(23,117,224,0.25)",
            transition: "all 140ms ease",
          }}
          onClick={handleSignIn}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.background = "#1462C4";
            btn.style.boxShadow = "0 2px 10px rgba(23,117,224,0.30)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.background = "#1775E0";
            btn.style.boxShadow = "0 1px 3px rgba(23,117,224,0.25)";
          }}
        >
          <LogIn size={15} color="rgba(255,255,255,0.9)" aria-hidden />
          Sign in
        </button>

        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={handleDismiss}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "1.5px solid #E0E0E0",
            borderRadius: 8,
            cursor: "pointer",
            color: "#888888",
            marginLeft: 4,
            transition: "all 120ms ease",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.borderColor = "#BBBBBB";
            btn.style.color = "#444444";
            btn.style.background = "#F7F8FA";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.borderColor = "#E0E0E0";
            btn.style.color = "#888888";
            btn.style.background = "none";
          }}
        >
          <X size={15} aria-hidden />
        </button>
      </div>
    </div>
  );
}
