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
          padding: "0 40px",
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
          aria-label="Go to Echly home"
        >
          <div
            style={{
              position: "relative",
              width: 32,
              height: 32,
              background: "#155DFC",
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Image src="/Echly_logo.svg" alt="" fill sizes="32px" style={{ objectFit: "cover" }} />
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.4px",
            }}
          >
            Echly
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
      style={{
        fontSize: 15,
        fontWeight: 500,
        color: "#444444",
        padding: "6px 12px",
        textDecoration: "none",
        borderRadius: 7,
        transition: "color 120ms, background 120ms",
        display: "inline-block",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "#111111";
        el.style.background = "#F4F5F7";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "#444444";
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
      style={{
        background: "white",
        border: "1.5px solid #D8D8D8",
        borderRadius: 9,
        height: 38,
        padding: "0 20px",
        fontSize: 14,
        fontWeight: 500,
        color: "#333333",
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
        btn.style.borderColor = "#AAAAAA";
        btn.style.background = "#F8F8F8";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.borderColor = "#D8D8D8";
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
      style={{
        background: "#1775E0",
        border: "none",
        borderRadius: 9,
        height: 38,
        padding: "0 20px",
        fontSize: 14,
        fontWeight: 600,
        color: "#FFFFFF",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(23,117,224,0.25)",
        transition: "all 140ms ease",
      }}
      onClick={() => {
        window.location.href = "/signup";
      }}
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
      Get started free
    </button>
  );
}
