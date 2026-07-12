import React from "react";
import {
  MousePointerClick,
  Mic,
  FolderOpen,
  ShieldCheck,
  ClipboardCheck,
  PenTool,
  MessagesSquare,
  Briefcase,
  Users,
  BookOpen,
  Rocket,
  CircleHelp,
  Wrench,
  Lock,
} from "lucide-react";

/**
 * Shared marketing nav model — the single source of truth for the desktop
 * header, its full-width dropdown panels, and the mobile menu (all rendered by
 * MarketingHeader), so they can never drift out of sync.
 *
 * Shape mirrors the reference architecture (antigravity.google): top-level
 * items are either a plain link or a dropdown; each dropdown carries a big
 * statement `title` shown on the left of the panel, an optional overview
 * link, and a column of sublinks on the right.
 *
 * Plain data module (no "use client", no server-only): safe to import from
 * both server and client components.
 */

export type NavSublink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export type NavDropdown = {
  id: string;
  /** Big statement headline on the left of the open panel. */
  title: string;
  /** Optional "See overview" destination under the headline. */
  overviewHref?: string;
  overviewLabel?: string;
  sublinks: ReadonlyArray<NavSublink>;
};

export type NavItem = {
  label: string;
  /** Direct destination for plain items; ignored when `dropdown` is set. */
  href?: string;
  dropdown?: NavDropdown;
};

const ICON_SIZE = 20;

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    label: "Product",
    dropdown: {
      id: "product",
      title: "Everything between spotting a bug and shipping the fix",
      overviewHref: "/docs",
      overviewLabel: "See overview",
      sublinks: [
        {
          label: "Capture extension",
          href: "/docs/capturing",
          icon: <MousePointerClick size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Voice tickets & AI diagnosis",
          href: "/docs/tickets",
          icon: <Mic size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Sessions & sharing",
          href: "/docs/sharing",
          icon: <FolderOpen size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Privacy controls",
          href: "/docs/privacy",
          icon: <ShieldCheck size={ICON_SIZE} strokeWidth={1.75} />,
        },
      ],
    },
  },
  {
    label: "Use cases",
    dropdown: {
      id: "use-cases",
      title: "Built for every team that ships on the web",
      sublinks: [
        {
          label: "QA testing",
          href: "/use-cases/qa-testing",
          icon: <ClipboardCheck size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Design review",
          href: "/use-cases/design-review",
          icon: <PenTool size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Client feedback",
          href: "/use-cases/client-feedback",
          icon: <MessagesSquare size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Agencies",
          href: "/use-cases/agencies",
          icon: <Briefcase size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Teams",
          href: "/use-cases/teams",
          icon: <Users size={ICON_SIZE} strokeWidth={1.75} />,
        },
      ],
    },
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  {
    label: "Resources",
    dropdown: {
      id: "resources",
      title: "Everything you need to get set up and get help",
      overviewHref: "/docs",
      overviewLabel: "Browse the docs",
      sublinks: [
        {
          label: "Documentation",
          href: "/docs",
          icon: <BookOpen size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Getting started",
          href: "/docs/getting-started",
          icon: <Rocket size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "FAQ",
          href: "/docs/faq",
          icon: <CircleHelp size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Troubleshooting",
          href: "/docs/troubleshooting",
          icon: <Wrench size={ICON_SIZE} strokeWidth={1.75} />,
        },
        {
          label: "Trust & security",
          href: "/marketing/trust.html",
          icon: <Lock size={ICON_SIZE} strokeWidth={1.75} />,
        },
      ],
    },
  },
];
