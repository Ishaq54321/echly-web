import React from "react";

export type SessionLimitUpgradeViewProps = {
  limitMessage: string;
  upgradePlan?: unknown;
  onUpgrade: () => void;
};

export function SessionLimitUpgradeView({
  limitMessage,
  onUpgrade,
}: SessionLimitUpgradeViewProps) {
  const description =
    limitMessage?.trim() ||
    "Your current plan allows a limited number of sessions.";

  const imageSrc = chrome.runtime.getURL(
    "assets/feedback-tray-session-limit.png"
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "12px 8px",
        maxWidth: 320,
        margin: "0 auto",
      }}
    >
      {/* Illustration */}
      <div style={{ marginBottom: 24 }}>
        <img
          src={imageSrc}
          alt="Session limit reached"
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Title — extension theme: --text-primary */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 12,
          color: "var(--text-primary)",
        }}
      >
        You've reached your session limit
      </h2>

      {/* Description — extension theme: --text-secondary */}
      <p
        style={{
          fontSize: 14,
          lineHeight: "1.6",
          color: "var(--text-secondary)",
          marginBottom: 28,
          maxWidth: 260,
        }}
      >
        {description}
        <br />
        Upgrade your plan to keep capturing feedback without limits.
      </p>

      {/* Upgrade Button — extension primary button tokens */}
      <button
        type="button"
        onClick={onUpgrade}
        style={{
          width: "100%",
          maxWidth: 260,
          height: 44,
          borderRadius: 12,
          border: "none",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          color: "var(--button-primary-text)",
          background: "var(--button-primary-bg)",
          boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
          transition: "transform 0.08s ease, box-shadow 0.08s ease",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Upgrade Plan
      </button>
    </div>
  );
}
