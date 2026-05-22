/**
 * Ticket-type → icon mapping for the demo tray.
 *
 * Marketing-only. The real extension resolves a ticket's icon from its tags via
 * lib/utils/getTicketIconFromTags (a large taxonomy table). The demo doesn't
 * need the full taxonomy — it carries an explicit `type` on each MockTicket and
 * maps it to a Lucide icon here, matching the approximations called for in the
 * Phase 2B v5 prompt.
 */

import type { LucideIcon } from "lucide-react";
import { Lock, Type, Palette, Link as LinkIcon, MessageSquare } from "lucide-react";
import type { DemoTicketType } from "./mockTickets";

const ICON_BY_TYPE: Record<DemoTicketType, LucideIcon> = {
  "bug": Lock,
  "copy": Type,
  "ui": Palette,
  "broken-link": LinkIcon,
  "content": MessageSquare,
};

export function iconForType(type: DemoTicketType): LucideIcon {
  return ICON_BY_TYPE[type] ?? Type;
}
