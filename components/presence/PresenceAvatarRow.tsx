"use client";

import { useMemo } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { usePresenceStore } from "@/lib/realtime/presenceStore";

const AVATAR_SIZE = 28;
const MAX_VISIBLE = 4;

interface Props {
  sessionId: string;
  currentUserId: string | null;
}

export function PresenceAvatarRow({ sessionId, currentUserId }: Props) {
  const { presentUsers } = usePresenceStore(sessionId);

  const others = useMemo(
    () => presentUsers.filter((u) => u.userId !== currentUserId),
    [presentUsers, currentUserId]
  );

  if (others.length === 0) return null;

  const visible = others.slice(0, MAX_VISIBLE);
  const overflow = others.length - visible.length;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((u) => (
        <Tooltip key={u.userId} content={u.displayName || "Viewer"} position="bottom">
          <span
            className="inline-flex rounded-full"
            style={{ boxShadow: "0 0 0 2px var(--color-warning)" }}
          >
            <UserAvatar
              photoURL={u.photoURL}
              name={u.displayName}
              size={AVATAR_SIZE}
              alt={u.displayName ? `${u.displayName} viewing` : "Viewer"}
            />
          </span>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)] font-semibold"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            fontSize: 11,
            boxShadow: "0 0 0 2px var(--color-warning)",
          }}
          aria-label={`${overflow} more viewing`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
