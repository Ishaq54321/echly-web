"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Command,
  CreditCard,
  ExternalLink,
  Globe,
  HelpCircle,
  LogOut,
  Settings,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useBillingStore } from "@/lib/store/billingStore";
import { UserAvatar } from "@/components/ui/UserAvatar";

const PANEL_WIDTH = 280;

export interface ProfileCommandPanelProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  anchorRef: React.RefObject<HTMLElement | null>;
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  badge?: string;
  external?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

function UpgradePlanHeading({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "var(--brand)",
        letterSpacing: "-0.005em",
        marginBottom: 6,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        textDecoration: hover ? "underline" : "none",
        textUnderlineOffset: 2,
        opacity: hover ? 0.85 : 1,
        transition: "opacity var(--duration-fast) var(--ease)",
      }}
    >
      <Zap size={14} strokeWidth={1.5} />
      Upgrade plan
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  subtitle,
  badge,
  external,
  danger,
  onClick,
}: MenuItemProps) {
  const [hover, setHover] = useState(false);

  const iconBg = danger
    ? hover
      ? "var(--color-danger)"
      : "var(--color-danger-bg)"
    : hover
    ? "var(--brand-subtle)"
    : "var(--surface-subtle)";
  const iconColor = danger
    ? hover
      ? "#FFFFFF"
      : "var(--color-danger)"
    : hover
    ? "var(--brand)"
    : "var(--text-secondary)";
  const labelColor = danger ? "var(--color-danger)" : "var(--text-heading)";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 8,
        borderRadius: 8,
        border: "none",
        background: hover ? "var(--surface-hover)" : "transparent",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        transition: `background var(--duration-fast) var(--ease)`,
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: iconBg,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          color: iconColor,
          transition: `background var(--duration-fast), color var(--duration-fast)`,
        }}
      >
        <Icon size={16} strokeWidth={1.5} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: labelColor,
            letterSpacing: "-0.005em",
          }}
        >
          {label}
        </span>
        {subtitle && (
          <span
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-tertiary)",
              marginTop: 1,
            }}
          >
            {subtitle}
          </span>
        )}
      </span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 999,
            background: "var(--brand-subtle)",
            color: "var(--brand)",
            letterSpacing: "0.01em",
          }}
        >
          {badge}
        </span>
      )}
      {external && (
        <span style={{ color: "var(--text-tertiary)", flexShrink: 0, display: "inline-flex" }}>
          <ExternalLink size={12} strokeWidth={1.5} />
        </span>
      )}
    </button>
  );
}

export function ProfileCommandPanel({
  open,
  onClose,
  user,
  anchorRef,
}: ProfileCommandPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(() => {
    if (!anchorRef?.current) return null;
    const rect = anchorRef.current.getBoundingClientRect();
    return { top: rect.bottom + 6, left: Math.max(8, rect.right - PANEL_WIDTH) };
  });
  const [mounted, setMounted] = useState(false);
  const { avatarUrl, workspaceName } = useWorkspace();
  const {
    feedbackTicketsUsed,
    feedbackTicketsLimit,
    plan: cachedPlan,
    isLoaded: isBillingLoaded,
  } = useBillingStore();

  useEffect(() => {
    if (!open || !anchorRef?.current) {
      setPosition(null);
      setMounted(false);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - PANEL_WIDTH),
    });
    const t = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(t);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await signOut(auth);
    onClose();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const displayName =
    user?.displayName?.trim() || user?.email?.split("@")[0] || "User";
  const wsName = workspaceName?.trim() || "Workspace";
  const metaText = `Admin · ${wsName}`;

  const isStarterPlan = isBillingLoaded && cachedPlan === "starter";
  const isPaidPlan =
    isBillingLoaded && cachedPlan !== "starter" && cachedPlan !== null;
  const paidPlanLabel = cachedPlan
    ? cachedPlan === "business"
      ? "Business"
      : cachedPlan === "enterprise"
      ? "Enterprise"
      : cachedPlan.charAt(0).toUpperCase() + cachedPlan.slice(1)
    : "";

  const usageRatio =
    feedbackTicketsLimit && feedbackTicketsLimit > 0
      ? Math.min(1, feedbackTicketsUsed / feedbackTicketsLimit)
      : 0;
  const usageBarColor =
    usageRatio >= 1 ? "var(--color-danger)" : "var(--brand)";

  if (!open) return null;

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: "var(--border)",
    margin: "0 16px",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--text-tertiary)",
    padding: "6px 8px 4px",
    margin: 0,
  };

  const panel = (
    <div className="fixed inset-0 z-[1100]" aria-hidden>
      <div className="absolute inset-0" onClick={handleBackdropClick} />
      {position && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Profile"
          className="fixed z-[1101]"
          style={{
            width: PANEL_WIDTH,
            top: position.top,
            left: position.left,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)",
            transition: `opacity var(--duration-fast) var(--ease), transform var(--duration-fast) var(--ease)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Profile Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "16px 16px 14px",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, var(--brand) 0%, var(--brand-text) 100%)",
                }}
              >
                <UserAvatar
                  avatarUrl={avatarUrl}
                  image={(user as { image?: string | null } | null)?.image}
                  photoURL={user?.photoURL}
                  name={displayName}
                  className="h-full w-full"
                />
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#22C55E",
                  border: "2px solid var(--surface-card)",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--text-heading)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.3,
                  marginTop: 1,
                }}
              >
                {metaText}
              </div>
              <button
                type="button"
                onClick={() => navigateTo("/settings?tab=profile")}
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  color: "var(--brand)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  marginTop: 2,
                  fontFamily: "inherit",
                }}
                className="hover:underline underline-offset-2"
              >
                Edit profile
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                color: "var(--text-tertiary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                alignSelf: "flex-start",
                marginTop: -2,
                transition: `background var(--duration-fast), color var(--duration-fast)`,
              }}
              className="hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          <div style={dividerStyle} />

          {/* Upgrade Plan Section */}
          {isStarterPlan && (
            <>
              <div style={{ padding: "14px 16px" }}>
                <UpgradePlanHeading
                  onClick={() => navigateTo("/settings?tab=billing")}
                />
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  Current plan:{" "}
                  <span style={{ color: "var(--text-heading)", fontWeight: 500 }}>
                    Starter
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 4,
                      background: "var(--surface-subtle)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: usageBarColor,
                        width: `${Math.round(usageRatio * 100)}%`,
                        transition: "width 0.4s ease-out, background 0.2s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {feedbackTicketsUsed} / {feedbackTicketsLimit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo("/settings?tab=billing")}
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 500,
                    color: "var(--brand)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontFamily: "inherit",
                  }}
                  className="hover:underline underline-offset-2"
                >
                  View plans
                  <ArrowRight size={12} strokeWidth={1.5} />
                </button>
              </div>
              <div style={dividerStyle} />
            </>
          )}

          {isPaidPlan && (
            <>
              <div style={{ padding: "14px 16px" }}>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  Current plan:{" "}
                  <span style={{ color: "var(--text-heading)", fontWeight: 500 }}>
                    {paidPlanLabel}
                  </span>
                </div>
              </div>
              <div style={dividerStyle} />
            </>
          )}

          {/* Account Section */}
          <div style={{ padding: "6px 8px" }}>
            <div style={sectionLabelStyle}>Account</div>
            <MenuItem
              icon={CreditCard}
              label="Billing"
              external
              onClick={() => navigateTo("/settings?tab=billing")}
            />
            <MenuItem
              icon={Settings}
              label="Workspace settings"
              onClick={() => navigateTo("/settings")}
            />
          </div>

          <div style={dividerStyle} />

          {/* Tools Section */}
          <div style={{ padding: "6px 8px" }}>
            <div style={sectionLabelStyle}>Tools</div>
            <MenuItem
              icon={Globe}
              label="Install Chrome extension"
              subtitle="Capture feedback anywhere"
              badge="Free"
              onClick={() => {
                window.open(
                  "https://chrome.google.com/webstore",
                  "_blank",
                  "noopener,noreferrer",
                );
                onClose();
              }}
            />
            <MenuItem
              icon={Command}
              label="Keyboard shortcuts"
              onClick={onClose}
            />
          </div>

          <div style={dividerStyle} />

          {/* Support Section */}
          <div style={{ padding: "6px 8px" }}>
            <div style={sectionLabelStyle}>Support</div>
            <MenuItem
              icon={HelpCircle}
              label="Help & Support"
              onClick={() => {
                window.open("mailto:support@echly.com", "_self");
                onClose();
              }}
            />
          </div>

          <div style={dividerStyle} />

          {/* Sign Out Section */}
          <div style={{ padding: "6px 8px 10px" }}>
            <MenuItem
              icon={LogOut}
              label="Sign out"
              danger
              onClick={handleSignOut}
            />
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(panel, document.body)
    : null;
}
