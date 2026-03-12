/**
 * Echly Fintech Design System — Design Tokens
 * Single source of truth for colors, typography, spacing, and components.
 */

// =============================================================================
// PRIMARY COLOR SYSTEM
// =============================================================================

export const colors = {
  // Primary accent (green)
  primary: "#9FE870",
  primaryHover: "#8FD764",
  primaryActive: "#7CCB56",
  deepGreen: "#163300",

  // Secondary green surfaces
  softActionBg: "#DDF3C8",
  lightAccentSurface: "#E9ECEB",
  successGreen: "#4CAF50",

  // Neutral system — canvas is pure white
  canvasBg: "#FFFFFF",
  cardSurface: "#FFFFFF",
  softSurface: "#F1F3F2",
  hoverSurface: "#E9ECEB",
  border: "#E3E6E5",
  divider: "#DADDDD",

  // Text hierarchy
  textPrimary: "#111111",
  textSecondary: "#4A4A4A",
  textMuted: "#111111",
  textSubtle: "#9AA0A6",

  // Semantic (keep for compatibility)
  danger: "#DC2626",
  warning: "#D97706",
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const fontStack =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const typography = {
  display: "40px",
  h1: "32px",
  h2: "24px",
  h3: "20px",
  body: "16px",
  meta: "14px",
  caption: "12px",
} as const;

export const lineHeights = {
  display: 1.2,
  h1: 1.25,
  h2: 1.3,
  h3: 1.35,
  body: 1.5,
  meta: 1.45,
  caption: 1.4,
} as const;

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  containerMaxWidth: "1200px",
  containerPaddingX: "24px",
  pagePaddingY: "24px",
} as const;

// =============================================================================
// CARD SYSTEM
// =============================================================================

export const card = {
  background: colors.cardSurface,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "24px",
  // Currency card
  currencyBg: colors.softSurface,
  currencyGap: "16px",
  // Add account (dashed)
  addAccountBorder: `2px dashed ${colors.divider}`,
  addAccountBg: "transparent",
} as const;

// =============================================================================
// BUTTON SYSTEM
// =============================================================================

export const button = {
  primary: {
    background: colors.primary,
    color: colors.textPrimary,
    borderRadius: "999px",
    padding: "10px 18px",
    fontWeight: 600,
    hover: colors.primaryHover,
    active: colors.primaryActive,
  },
  secondary: {
    background: "#E9ECEB",
    color: colors.textPrimary,
    borderRadius: "999px",
  },
  ghost: {
    background: "transparent",
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
  },
  pill: {
    background: colors.softActionBg,
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 500,
    color: colors.textPrimary,
  },
} as const;

// =============================================================================
// INPUT SYSTEM
// =============================================================================

export const input = {
  background: "white",
  border: `1px solid ${colors.border}`,
  borderRadius: "999px",
  padding: "10px 16px",
  focusBorder: colors.primary,
  focusShadow: "0 0 0 3px rgba(159, 232, 112, 0.25)",
} as const;

// =============================================================================
// CHAT UI
// =============================================================================

export const chat = {
  userBubble: {
    background: colors.softSurface,
    borderRadius: "18px",
    padding: "14px 16px",
    maxWidth: "520px",
  },
  systemBubble: {
    background: colors.cardSurface,
    border: `1px solid ${colors.border}`,
  },
  inputBar: {
    borderRadius: "999px",
    border: `1px solid ${colors.border}`,
    padding: "10px 16px",
  },
} as const;

// =============================================================================
// SIDEBAR NAVIGATION
// =============================================================================

export const sidebar = {
  hoverBg: "#E9ECEB",
  activeBg: "#E9ECEB",
  activeColor: colors.textPrimary,
  iconDefault: "#6B6F75",
  iconHover: "#111111",
  iconActive: colors.textPrimary,
} as const;

// =============================================================================
// GRID
// =============================================================================

export const grid = {
  currencyCards: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
} as const;

// =============================================================================
// BADGE
// =============================================================================

export const badge = {
  neutral: {
    background: colors.softSurface,
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: typography.meta,
  },
  accent: {
    background: colors.primary,
    color: colors.deepGreen,
  },
} as const;

// =============================================================================
// MODAL
// =============================================================================

export const modal = {
  background: colors.cardSurface,
  borderRadius: "16px",
  border: `1px solid ${colors.border}`,
  padding: "24px",
  backdrop: "rgba(0, 0, 0, 0.2)",
} as const;

// =============================================================================
// SPACING (for consistency)
// =============================================================================

export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
} as const;

// =============================================================================
// RADIUS
// =============================================================================

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  pill: "999px",
} as const;

// =============================================================================
// SHADOWS (minimal)
// =============================================================================

export const shadow = {
  none: "none",
  subtle: "0 1px 2px rgba(0, 0, 0, 0.05)",
  card: "0 1px 2px rgba(0, 0, 0, 0.05)",
  modal: "0 6px 20px rgba(0, 0, 0, 0.08)",
} as const;
