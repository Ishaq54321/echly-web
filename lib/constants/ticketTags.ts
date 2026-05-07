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
  OctagonX,
  AlertTriangle,
  ChevronDown,
  Brush,
  Inbox,
  Loader,
  AlertCircle,
  Shuffle,
  Flag,
  type LucideIcon,
} from "lucide-react";

export const TICKET_TAG_TAXONOMY = {
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
  priority: [
    { key: "blocker", label: "Blocker", description: "Cannot proceed, deploy stopper", icon: OctagonX },
    { key: "critical", label: "Critical", description: "Blocking, broken, crashes", icon: AlertTriangle },
    { key: "minor", label: "Minor", description: "Small, polish, nice-to-have", icon: ChevronDown },
    { key: "cosmetic", label: "Cosmetic", description: "Purely visual, zero functional impact", icon: Brush },
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
  ...TICKET_TAG_TAXONOMY.component,
  ...TICKET_TAG_TAXONOMY.platform,
  ...TICKET_TAG_TAXONOMY.priority,
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
    ...TICKET_TAG_TAXONOMY.component,
    ...TICKET_TAG_TAXONOMY.platform,
    ...TICKET_TAG_TAXONOMY.priority,
    ...TICKET_TAG_TAXONOMY.state,
  ].map((t) => [t.key, t.icon as LucideIcon])
);
