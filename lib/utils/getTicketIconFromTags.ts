import type { LucideIcon } from "lucide-react";
import { TICKET_TAG_TAXONOMY, TAG_ICON_MAP } from "@/lib/constants/ticketTags";
import { getTicketIcon } from "@/lib/utils/getTicketIcon";

// Priority order: Component → Platform → Priority → State
const CATEGORY_PRIORITY: (keyof typeof TICKET_TAG_TAXONOMY)[] = [
  "component",
  "platform",
  "priority",
  "state",
];

const CATEGORY_KEYS = new Map<string, number>();
for (let ci = 0; ci < CATEGORY_PRIORITY.length; ci++) {
  const cat = CATEGORY_PRIORITY[ci];
  for (const tag of TICKET_TAG_TAXONOMY[cat]) {
    CATEGORY_KEYS.set(tag.key, ci);
  }
}

export function getTicketIconFromTags(
  suggestedTags: string[] | null | undefined,
  title: string
): LucideIcon {
  if (suggestedTags && suggestedTags.length > 0) {
    let bestTag: string | null = null;
    let bestPriority = Infinity;

    for (const tag of suggestedTags) {
      const priority = CATEGORY_KEYS.get(tag);
      if (priority !== undefined && priority < bestPriority) {
        bestPriority = priority;
        bestTag = tag;
      }
    }

    if (bestTag) {
      const icon = TAG_ICON_MAP.get(bestTag);
      if (icon) return icon;
    }
  }

  return getTicketIcon(title);
}
