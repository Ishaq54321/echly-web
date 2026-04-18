import "server-only";

import { groupEvents, groupPreviewEvents, type ActivityEvent } from "@/lib/activity/groupEvents";
import { groupEventsServer } from "./groupEventsServer";

export function assertGroupingParity(events: ActivityEvent[]) {
  const clientGroups = groupEvents(events);
  const serverGroups = groupEventsServer(events);

  if (clientGroups.length !== serverGroups.length) {
    console.warn("Grouping mismatch: length differs", {
      client: clientGroups.length,
      server: serverGroups.length,
    });
  }

  for (let i = 0; i < clientGroups.length; i++) {
    const c = clientGroups[i];
    const s = serverGroups[i];

    if (!c || !s) continue;

    if (c.type !== s.type) {
      console.warn("Grouping mismatch: type differs", { c, s });
      continue;
    }

    if (c.type === "group" && s.type === "group") {
      if (c.count !== s.count) {
        console.warn("Grouping mismatch: count differs", {
          client: c.count,
          server: s.count,
        });
      }

      if (c.primaryEventId !== s.primaryEventId) {
        console.warn("Grouping mismatch: primaryEventId differs", {
          client: c.primaryEventId,
          server: s.primaryEventId,
        });
      }

      const expectedPreviewLen = Math.min(2, s.count);
      if (s.previewEvents.length !== expectedPreviewLen) {
        console.warn("Server previewEvents length unexpected", {
          previewLen: s.previewEvents.length,
          expectedPreviewLen,
        });
      }

      const cPreview = groupPreviewEvents(c);
      if (cPreview.length !== s.previewEvents.length) {
        console.warn("Client vs server preview length mismatch", {
          client: cPreview.length,
          server: s.previewEvents.length,
        });
      }
      for (let j = 0; j < Math.min(cPreview.length, s.previewEvents.length); j++) {
        if (cPreview[j]?.id !== s.previewEvents[j]?.id) {
          console.warn("Client vs server previewEvents id mismatch", { j });
          break;
        }
      }

      if (c.groupId !== s.groupId) {
        console.warn("Client vs server groupId mismatch", {
          client: c.groupId,
          server: s.groupId,
        });
      }
    }
  }
}
