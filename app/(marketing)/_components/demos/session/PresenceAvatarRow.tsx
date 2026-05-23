/**
 * PresenceAvatarRow — marketing forklift of components/presence/PresenceAvatarRow.tsx
 *
 * Modifications from source:
 * - Stripped usePresenceStore + useUserAvatars (Firestore/realtime). Viewers
 *   now arrive as a static prop array.
 * - The amber-ring treatment is verbatim: each avatar wrapped in
 *   `boxShadow: "0 0 0 2px var(--color-warning)"`, 28px UserAvatar, max 4 + "+N"
 *   chip, NO count label, NO pulse — production-faithful (binding decision #4).
 * - UserAvatar (pure: getInitials + getAvatarColor) kept verbatim.
 */
"use client";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { Tooltip } from "@/components/ui/Tooltip";

const AVATAR_SIZE = 28;
const MAX_VISIBLE = 4;

interface Viewer {
  id: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
}

export function PresenceAvatarRow({ viewers }: { viewers: readonly Viewer[] }) {
  if (viewers.length === 0) return null;

  const visible = viewers.slice(0, MAX_VISIBLE);
  const overflow = viewers.length - visible.length;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((u, i) => (
        <Tooltip key={u.id} content={u.name || "Viewer"} position="bottom">
          <span
            className="inline-flex rounded-full"
            style={{ boxShadow: "0 0 0 2px var(--color-warning)" }}
            data-presence-pulse={i}
          >
            <UserAvatar
              avatarUrl={u.avatarUrl}
              name={u.name}
              size={AVATAR_SIZE}
              colorSeed={u.id}
              alt={u.name ? `${u.name} viewing` : "Viewer"}
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
