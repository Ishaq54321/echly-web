import {
  LayoutGrid,
  Type,
  Palette,
  Compass,
  TextCursorInput,
  MousePointerClick,
  AppWindow,
  Image,
  Table,
  Wand2,
  PanelTop,
  PanelLeft,
  Bell,
  Search,
  Lock,
  Upload,
  HelpCircle,
  ArrowDownUp,
  Smartphone,
  Globe,
  Accessibility,
  Gauge,
  Languages,
  Moon,
  Focus,
  WifiOff,
  Keyboard,
  Printer,
  Inbox,
  Loader,
  AlertCircle,
  Shuffle,
  Flag,
  Bug,
  Sparkles,
  MessageCircle,
  ArrowRightCircle,
  MessageSquare,
  Mic,
  Bookmark,
  GitBranch,
  Rocket,
  TrendingUp,
  FileText,
  type LucideIcon,
} from "lucide-react";

export const TICKET_TAG_TAXONOMY = {
  feedbackType: [
    { key: "bug", label: "Bug", description: "Something is broken or doesn't work as expected", icon: Bug },
    { key: "feature-request", label: "Feature Request", description: "Explicit request for new functionality", icon: Sparkles },
    { key: "feedback", label: "Feedback", description: "General opinion or observation", icon: MessageCircle },
    { key: "question", label: "Question", description: "Recorder is asking, not reporting", icon: HelpCircle },
    { key: "request", label: "Request", description: "Prescriptive change request", icon: ArrowRightCircle },
  ],
  component: [
    { key: "layout", label: "Layout", description: "Spacing, alignment, positioning", icon: LayoutGrid },
    { key: "typography", label: "Typography", description: "Font, text styling", icon: Type },
    { key: "color-theme", label: "Color & Theme", description: "Colors, backgrounds, shadows", icon: Palette },
    { key: "navigation", label: "Navigation", description: "Menus, tabs, routing", icon: Compass },
    { key: "form-input", label: "Form & Input", description: "Text fields, dropdowns, validation", icon: TextCursorInput },
    { key: "button-cta", label: "Button & CTA", description: "Buttons, click targets", icon: MousePointerClick },
    { key: "modal-dialog", label: "Modal & Dialog", description: "Modals, popups, overlays", icon: AppWindow },
    { key: "image-media", label: "Image & Media", description: "Images, videos, icons", icon: Image },
    { key: "table-list", label: "Table & List", description: "Tables, data grids, lists", icon: Table },
    { key: "animation", label: "Animation", description: "Transitions, loading states", icon: Wand2 },
    { key: "header-footer", label: "Header & Footer", description: "Top bar, footer, sticky elements", icon: PanelTop },
    { key: "sidebar-panel", label: "Sidebar & Panel", description: "Sidebars, drawers, side panels", icon: PanelLeft },
    { key: "notification-toast", label: "Notification & Toast", description: "Toasts, snackbars, alerts, banners", icon: Bell },
    { key: "search-filter", label: "Search & Filter", description: "Search bars, filters, sort controls", icon: Search },
    { key: "authentication", label: "Authentication", description: "Login, signup, permissions", icon: Lock },
    { key: "file-upload", label: "File Upload", description: "Upload flows, drag-and-drop, progress", icon: Upload },
    { key: "tooltip-popover", label: "Tooltip & Popover", description: "Tooltips, popovers, context menus", icon: HelpCircle },
    { key: "scroll-overflow", label: "Scroll & Overflow", description: "Scroll behavior, sticky, overflow", icon: ArrowDownUp },
  ],
  contentDesign: [
    { key: "copy", label: "Copy", description: "Written text, body content, microcopy", icon: Type },
    { key: "messaging", label: "Messaging", description: "Message clarity, value prop, communication", icon: MessageSquare },
    { key: "tone", label: "Tone", description: "Voice, tone-of-voice, personality", icon: Mic },
    { key: "branding", label: "Branding", description: "Brand consistency, logo, brand colors", icon: Bookmark },
    { key: "visual-design", label: "Visual Design", description: "Overall visual aesthetics, design quality", icon: Palette },
    { key: "ux-flow", label: "UX Flow", description: "User flow, task paths, decision points", icon: GitBranch },
    { key: "onboarding", label: "Onboarding", description: "First-time UX, tutorial, welcome", icon: Rocket },
    { key: "conversion", label: "Conversion", description: "CTAs, sign-up flows, checkout funnel", icon: TrendingUp },
    { key: "content", label: "Content", description: "Articles, posts, media content", icon: FileText },
    { key: "search", label: "Search", description: "Search behavior, results, search experience", icon: Search },
  ],
  platform: [
    { key: "responsive", label: "Responsive", description: "Mobile, tablet, viewport issues", icon: Smartphone },
    { key: "cross-browser", label: "Cross-Browser", description: "Browser-specific rendering", icon: Globe },
    { key: "accessibility", label: "Accessibility", description: "Contrast, keyboard nav, ARIA", icon: Accessibility },
    { key: "performance", label: "Performance", description: "Speed, loading, memory", icon: Gauge },
    { key: "i18n", label: "i18n", description: "Translation, RTL, locale", icon: Languages },
    { key: "dark-mode", label: "Dark Mode", description: "Dark theme rendering, theme switching", icon: Moon },
    { key: "high-density", label: "High Density", description: "Retina/HiDPI, blurry assets", icon: Focus },
    { key: "slow-network", label: "Slow Network", description: "3G loading, timeout behavior", icon: WifiOff },
    { key: "keyboard-shortcut", label: "Keyboard Shortcut", description: "Hotkeys, key conflicts", icon: Keyboard },
    { key: "print", label: "Print", description: "Print layout, PDF export", icon: Printer },
  ],
  state: [
    { key: "empty-state", label: "Empty State", description: "Empty/zero-data state rendering", icon: Inbox },
    { key: "loading-state", label: "Loading State", description: "Spinners, skeletons, loading", icon: Loader },
    { key: "error-state", label: "Error State", description: "Error messages, error recovery", icon: AlertCircle },
    { key: "edge-case", label: "Edge Case", description: "Unusual input, boundary values, race conditions", icon: Shuffle },
    { key: "first-time-use", label: "First Time Use", description: "Onboarding, first interaction", icon: Flag },
  ],
} as const;

export const ALL_TAG_KEYS = [
  ...TICKET_TAG_TAXONOMY.feedbackType,
  ...TICKET_TAG_TAXONOMY.component,
  ...TICKET_TAG_TAXONOMY.contentDesign,
  ...TICKET_TAG_TAXONOMY.platform,
  ...TICKET_TAG_TAXONOMY.state,
].map(t => t.key);

export type TicketTagKey = (typeof ALL_TAG_KEYS)[number];

/** Filter unknown tags, dedupe, cap at 3. */
export function whitelistTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const set = new Set<string>();
  for (const t of tags) {
    if (typeof t === "string" && (ALL_TAG_KEYS as readonly string[]).includes(t) && set.size < 3) {
      set.add(t);
    }
  }
  return [...set];
}

export const TAG_ICON_MAP = new Map<string, LucideIcon>(
  [
    ...TICKET_TAG_TAXONOMY.feedbackType,
    ...TICKET_TAG_TAXONOMY.component,
    ...TICKET_TAG_TAXONOMY.contentDesign,
    ...TICKET_TAG_TAXONOMY.platform,
    ...TICKET_TAG_TAXONOMY.state,
  ].map((t) => [t.key, t.icon as LucideIcon])
);
