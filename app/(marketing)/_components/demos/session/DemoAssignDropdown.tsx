/**
 * DemoAssignDropdown — marketing forklift of components/feedback/AssignDropdown.tsx
 *
 * Modifications from source:
 * - Stripped useWorkspace + useWorkspaceMembers store (Firestore-backed member
 *   cache) and the InviteMemberModal. Members now arrive as a static prop
 *   (DemoMember[]) sourced from MOCK_WORKSPACE_MEMBERS' shape.
 * - Removed the `busy` in-flight lock, the async/await on onAssigned, the
 *   loading-skeleton branch, the "Invite members to workspace" footer, and the
 *   read-only / iconOnly branches (the demo only ever uses the editable,
 *   name-visible variant). onAssigned is a synchronous local-state setter.
 * - Kept VERBATIM: the trigger button classes + UserPen/ChevronDown content,
 *   the popover surface inline styles (position/zIndex/animate/transition), the
 *   "Assignees" eyebrow, the search input row, the member-row layout +
 *   hover/selected styling, the Check tick, and the "Remove assignee" footer.
 * - Search box kept and wired to local query state (filters the static members),
 *   exactly as source — it's already self-contained.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { UserMinus, UserPen, Check, ChevronDown, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

export interface DemoMember {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

/** Thin adapter over the canonical UserAvatar (verbatim from source). */
function Avatar({
  name,
  avatarUrl,
  size,
  colorSeed,
}: {
  name: string | null;
  avatarUrl: string | null;
  size: number;
  colorSeed?: string | null;
}) {
  return <UserAvatar avatarUrl={avatarUrl} name={name} size={size} colorSeed={colorSeed} />;
}

interface DemoAssignDropdownProps {
  members: DemoMember[];
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
  currentAssigneeAvatarUrl: string | null;
  onAssigned: (
    assigneeId: string | null,
    assigneeName: string | null,
    assigneeAvatarUrl: string | null
  ) => void;
}

export function DemoAssignDropdown({
  members,
  currentAssigneeId,
  currentAssigneeName,
  currentAssigneeAvatarUrl,
  onAssigned,
}: DemoAssignDropdownProps) {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const t = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(t);
    }
    const t = requestAnimationFrame(() => {
      setQuery("");
      setAnimate(false);
    });
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const filteredMembers = members.filter((m) => {
    if (!query.trim()) return true;
    const name = m.displayName.toLowerCase();
    const email = (m.email ?? "").toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const handleSelect = (member: DemoMember) => {
    setOpen(false);
    onAssigned(member.uid, member.displayName, member.avatarUrl);
  };

  const handleUnassign = () => {
    setOpen(false);
    onAssigned(null, null, null);
  };

  const hasAssignee = Boolean(currentAssigneeId);

  const baseCls =
    "inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer";

  const displayName = currentAssigneeName ? currentAssigneeName : currentAssigneeId ? "Assigned" : null;
  const buttonLabel = displayName || "Assigned";

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className={baseCls} onClick={() => setOpen((o) => !o)}>
        {hasAssignee ? (
          <>
            <Avatar name={displayName} avatarUrl={currentAssigneeAvatarUrl} size={20} colorSeed={currentAssigneeId} />
            <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {buttonLabel}
            </span>
            <ChevronDown size={12} style={{ flexShrink: 0 }} />
          </>
        ) : (
          <>
            <UserPen size={14} strokeWidth={1.7} style={{ flexShrink: 0 }} aria-hidden />
            Assign
          </>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-lg)",
            width: 260,
            overflow: "hidden",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 160ms ease, transform 160ms ease",
          }}
        >
          <div
            style={{
              padding: "10px 12px 6px",
              fontSize: 12,
              fontWeight: "600",
              color: "var(--text-tertiary)",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            Assignees
          </div>

          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--surface-input)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0 10px",
                height: "34px",
              }}
            >
              <Search size={13} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search members..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="no-focus-ring"
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: "var(--text-body)",
                  outline: "none",
                  boxShadow: "none",
                  WebkitAppearance: "none",
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {filteredMembers.map((member) => {
              const isSelected = member.uid === currentAssigneeId;
              return (
                <button
                  key={member.uid}
                  type="button"
                  onClick={() => handleSelect(member)}
                  style={{
                    width: "calc(100% - 8px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    margin: "0 4px",
                    background: isSelected ? "var(--brand-subtle)" : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "none",
                    minHeight: 40,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <Avatar name={member.displayName} avatarUrl={member.avatarUrl} size={28} colorSeed={member.uid} />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-body)",
                      textAlign: "left",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.displayName}
                  </span>
                  {isSelected && <Check size={13} color="var(--brand)" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}

            {filteredMembers.length === 0 && (
              <div style={{ padding: "8px 12px", fontSize: 14, color: "var(--text-tertiary)" }}>No members found</div>
            )}
          </div>

          {hasAssignee && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "4px 8px" }} />
              <button
                type="button"
                onClick={handleUnassign}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "var(--color-danger)",
                  textAlign: "left",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--color-danger-bg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <UserMinus size={14} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                Remove assignee
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
