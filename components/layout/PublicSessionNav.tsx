"use client";

import Image from "next/image";

export const PUBLIC_NAV_HEIGHT = 60;

export default function PublicSessionNav() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 60,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        {/* Left: Logo + wordmark */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          onClick={() => {
            window.location.href = "/";
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") window.location.href = "/";
          }}
          aria-label="Go to Annote home"
        >
          <div
            style={{
              position: "relative",
              width: 23,
              height: 28,
              flexShrink: 0,
            }}
          >
            <Image src="/annote-logo-icon.svg" alt="Annote" fill sizes="23px" style={{ objectFit: "contain" }} />
          </div>
          <span
            className="font-bold"
            style={{
              fontSize: 24,
              color: "var(--text-heading)",
              letterSpacing: "-0.4px",
            }}
          >
            Annote
          </span>
        </div>

        {/* Right: Nav links + Sign in + Get started */}
        <div
          className="public-nav-right"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}
        >
          <div
            className="public-nav-links"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <NavLink href="#">Learn</NavLink>
            <NavLink href="#">Pricing</NavLink>
          </div>
          <SignInButton />
          <GetStartedButton />
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .public-nav-links { display: none !important; }
        }
      `}</style>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium"
      style={{
        fontSize: 15,
        color: "var(--text-body)",
        padding: "6px 12px",
        textDecoration: "none",
        borderRadius: 7,
        transition: "color 120ms, background 120ms",
        display: "inline-block",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "var(--text-heading)";
        el.style.background = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "var(--text-body)";
        el.style.background = "transparent";
      }}
    >
      {children}
    </a>
  );
}

function SignInButton() {
  return (
    <button
      type="button"
      className="font-medium"
      style={{
        background: "white",
        border: "1.5px solid var(--border-strong)",
        borderRadius: 9,
        height: 38,
        padding: "0 20px",
        fontSize: 14,
        color: "var(--text-body)",
        cursor: "pointer",
        transition: "all 140ms ease",
      }}
      onClick={() => {
        window.location.href = `/login?returnUrl=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`;
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget;
        btn.style.borderColor = "var(--text-tertiary)";
        btn.style.background = "var(--surface-subtle)";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.borderColor = "var(--border-strong)";
        btn.style.background = "white";
      }}
    >
      Sign in
    </button>
  );
}

function GetStartedButton() {
  return (
    <button
      type="button"
      className="font-semibold"
      style={{
        background: "var(--brand)",
        border: "none",
        borderRadius: 9,
        height: 38,
        padding: "0 20px",
        fontSize: 14,
        color: "#FFFFFF",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(90,73,191,0.25)",
        transition: "all 140ms ease",
      }}
      onClick={() => {
        window.location.href = "/signup";
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget;
        btn.style.background = "var(--brand-hover)";
        btn.style.boxShadow = "0 2px 10px rgba(90,73,191,0.30)";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.background = "var(--brand)";
        btn.style.boxShadow = "0 1px 3px rgba(90,73,191,0.25)";
      }}
    >
      Get started free
    </button>
  );
}
