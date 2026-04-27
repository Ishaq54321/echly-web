import {
  MousePointerClick,
  PanelLeft,
  Image,
  Palette,
  Type,
  AppWindow,
  TextCursorInput,
  LayoutGrid,
  Sparkles,
  Link,
  Loader,
  Smartphone,
  Shapes,
  Bug,
  AlignCenter,
  PanelsTopLeft,
  type LucideIcon,
} from 'lucide-react';

type IconRule = {
  keywords: string[];
  icon: LucideIcon;
};

const ICON_RULES: IconRule[] = [
  { keywords: ['button', 'click', 'tap', 'cta', 'press'], icon: MousePointerClick },
  { keywords: ['nav', 'menu', 'sidebar', 'header', 'navbar', 'drawer', 'breadcrumb'], icon: PanelLeft },
  { keywords: ['image', 'photo', 'screenshot', 'thumbnail', 'avatar', 'banner', 'gallery'], icon: Image },
  { keywords: ['color', 'theme', 'style', 'dark mode', 'contrast', 'background'], icon: Palette },
  { keywords: ['font', 'text', 'typography', 'heading', 'label', 'title', 'copy', 'truncat'], icon: Type },
  { keywords: ['modal', 'dialog', 'popup', 'overlay', 'toast', 'alert', 'notification'], icon: AppWindow },
  { keywords: ['form', 'input', 'field', 'checkbox', 'radio', 'select', 'dropdown', 'search'], icon: TextCursorInput },
  { keywords: ['layout', 'grid', 'spacing', 'padding', 'margin', 'gap', 'flex', 'container'], icon: LayoutGrid },
  { keywords: ['animation', 'transition', 'hover', 'motion', 'scroll', 'parallax'], icon: Sparkles },
  { keywords: ['link', 'url', 'redirect', 'href', 'anchor', 'route'], icon: Link },
  { keywords: ['loading', 'spinner', 'performance', 'slow', 'lazy', 'skeleton'], icon: Loader },
  { keywords: ['responsive', 'mobile', 'screen', 'breakpoint', 'tablet', 'viewport'], icon: Smartphone },
  { keywords: ['icon', 'logo', 'badge', 'favicon', 'symbol', 'emoji'], icon: Shapes },
  { keywords: ['error', 'bug', 'fix', 'broken', 'crash', 'issue', 'fail', 'wrong'], icon: Bug },
  { keywords: ['align', 'position', 'overlap', 'z-index', 'offset', 'center', 'stack'], icon: AlignCenter },
];

export function getTicketIcon(title: string): LucideIcon {
  const lower = title.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.icon;
    }
  }
  return PanelsTopLeft;
}
