"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { resolveUserName } from "@/lib/utils/nameSplit";
import { ProfileCommandPanel } from "@/components/layout/ProfileCommandPanel";
import { useWorkspace } from "@/lib/client/workspaceContext";

export function ProfileDropdown() {
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const { avatarUrl } = useWorkspace();
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={avatarRef}
        type="button"
        aria-label="Profile"
        aria-expanded={open}
        className="shrink-0 cursor-pointer rounded-full h-9 w-9 overflow-hidden"
        style={{ boxShadow: "none" }}
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          image={(user as { image?: string | null } | null)?.image}
          photoURL={user?.photoURL}
          name={resolveUserName({
            displayName: user?.displayName,
            email: user?.email,
          })}
          colorSeed={user?.uid}
          className="h-9 w-9 cursor-pointer"
        />
      </button>
      <ProfileCommandPanel
        open={open}
        onClose={() => setOpen(false)}
        user={user}
        anchorRef={avatarRef}
      />
    </>
  );
}
