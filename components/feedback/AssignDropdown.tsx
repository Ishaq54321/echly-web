"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserPlus, UserMinus, Check, ChevronDown, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";

interface WorkspaceMemberRow {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

interface AssignDropdownProps {
  feedbackId: string;
  sessionId: string;
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
  currentAssigneeAvatarUrl: string | null;
  onAssigned: (
    assigneeId: string | null,
    assigneeName: string | null,
    assigneeAvatarUrl: string | null
  ) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

function hashColor(str: string): string {
  const colors = [
    "#E57373", "#F06292", "#BA68C8", "#7986CB",
    "#4FC3F7", "#4DB6AC", "#81C784", "#FFD54F",
    "#FF8A65", "#A1887F",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

function Avatar({
  name,
  avatarUrl,
  size,
}: {
  name: string | null;
  avatarUrl: string | null;
  size: number;
}) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const bg = hashColor(name ?? "?");
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? ""}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 600,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

export function AssignDropdown({
  feedbackId,
  sessionId: _sessionId,
  currentAssigneeId,
  currentAssigneeName,
  currentAssigneeAvatarUrl,
  onAssigned,
  disabled = false,
  readOnly = false,
}: AssignDropdownProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberRow[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const fetchMembers = useCallback(async () => {
    if (membersLoaded) return;
    try {
      const res = await authFetch("/api/workspace/members");
      if (!res?.ok) return;
      const body = (await res.json()) as { data?: { members?: WorkspaceMemberRow[] } };
      const list = body.data?.members ?? [];
      setMembers(list);
      setMembersLoaded(true);
    } catch {
      // silently ignore
    }
  }, [membersLoaded]);

  useEffect(() => {
    if (!open) return;
    void fetchMembers();
    const t = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(t);
  }, [open, fetchMembers]);

  useEffect(() => {
    if (open) return;
    const t = requestAnimationFrame(() => setAnimate(false));
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

  const handleSelect = async (member: WorkspaceMemberRow) => {
    const prevId = currentAssigneeId;
    const prevName = currentAssigneeName;
    const prevAvatar = currentAssigneeAvatarUrl;
    setOpen(false);
    onAssigned(member.uid, member.displayName ?? null, member.avatarUrl ?? null);
    setIsSaving(true);
    try {
      const res = await authFetch(`/api/tickets/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigneeId: member.uid,
          assigneeName: member.displayName ?? null,
          assigneeAvatarUrl: member.avatarUrl ?? null,
        }),
      });
      if (!res?.ok) {
        onAssigned(prevId, prevName, prevAvatar);
        showToast("Failed to assign");
      } else {
        const body = await res.json() as {
          data?: {
            ticket?: {
              assigneeId?: string | null;
              assigneeName?: string | null;
              assigneeAvatarUrl?: string | null;
            };
          };
        };
        const ticket = body.data?.ticket;
        if (ticket && ticket.assigneeName !== undefined) {
          onAssigned(ticket.assigneeId ?? null, ticket.assigneeName ?? null, ticket.assigneeAvatarUrl ?? null);
        }
      }
    } catch {
      onAssigned(prevId, prevName, prevAvatar);
      showToast("Failed to assign");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async () => {
    const prevId = currentAssigneeId;
    const prevName = currentAssigneeName;
    const prevAvatar = currentAssigneeAvatarUrl;
    setOpen(false);
    onAssigned(null, null, null);
    try {
      const res = await authFetch(`/api/tickets/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: null }),
      });
      if (!res?.ok) {
        onAssigned(prevId, prevName, prevAvatar);
      }
    } catch {
      onAssigned(prevId, prevName, prevAvatar);
    }
  };

  // READ-ONLY MODE
  if (readOnly) {
    if (currentAssigneeId && currentAssigneeName) {
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '34px',
          padding: '0 10px',
          background: '#F0F7FF',
          border: '1.5px solid #C3DFFE',
          borderRadius: '9px',
          fontSize: '13px',
          fontWeight: '500',
          color: '#1D4ED8',
          cursor: 'default',
          flexShrink: 0,
        }}>
          <Avatar
            name={currentAssigneeName}
            avatarUrl={currentAssigneeAvatarUrl}
            size={20}
          />
          <span style={{
            maxWidth: '80px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {currentAssigneeName}
          </span>
        </div>
      );
    }
    return null;
  }

  const hasAssignee = Boolean(currentAssigneeId);

  const assignedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 34,
    padding: "0 10px",
    background: "#F0F7FF",
    border: "1.5px solid #C3DFFE",
    borderRadius: 9,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontSize: 13,
    fontWeight: 500,
    color: "#111111",
  };

  const unassignedCls = `inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[9px] text-[13px] font-medium border border-[#E7ECF2] bg-[#FAFBFC] text-[#374151] hover:bg-[#F1F4F8] hover:border-[#DCE4EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        style={hasAssignee ? assignedStyle : undefined}
        className={!hasAssignee ? unassignedCls : undefined}
        disabled={disabled || isSaving}
        onClick={() => !disabled && !isSaving && setOpen((o) => !o)}
      >
        {hasAssignee ? (
          <>
            {isSaving
              ? <Loader2 size={16} className="animate-spin" aria-hidden style={{ flexShrink: 0 }} />
              : <Avatar name={currentAssigneeName} avatarUrl={currentAssigneeAvatarUrl} size={20} />
            }
            <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentAssigneeName ?? "Assigned"}
            </span>
            <ChevronDown size={12} style={{ flexShrink: 0, color: "#6B7280" }} />
          </>
        ) : (
          <>
            {isSaving
              ? <Loader2 size={16} className="animate-spin" aria-hidden />
              : <UserPlus size={16} style={{ flexShrink: 0 }} aria-hidden />
            }
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
            background: "white",
            border: "1px solid #E8E8E8",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
            width: 240,
            overflow: "hidden",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 160ms ease, transform 160ms ease",
          }}
        >
          <div
            style={{
              padding: "10px 12px 6px",
              fontSize: 11,
              fontWeight: 600,
              color: "#AAAAAA",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            Assign to
          </div>

          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {members.map((member) => {
              const isSelected = member.uid === currentAssigneeId;
              return (
                <button
                  key={member.uid}
                  type="button"
                  onClick={() => void handleSelect(member)}
                  style={{
                    width: "calc(100% - 8px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: 8,
                    margin: "0 4px",
                    background: isSelected ? "#EBF4FF" : "transparent",
                    border: "none",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "#F7F8FA";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <Avatar name={member.displayName ?? null} avatarUrl={member.avatarUrl ?? null} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.displayName ?? member.email ?? "Unknown"}
                    </div>
                    {member.email && (
                      <div style={{ fontSize: 12, color: "#888888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.email}
                      </div>
                    )}
                  </div>
                  {isSelected && <Check size={13} color="#1775E0" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
            {membersLoaded && members.length === 0 && (
              <div style={{ padding: "8px 12px", fontSize: 13, color: "#888888" }}>No members found</div>
            )}
            {!membersLoaded && (
              <div style={{ padding: "8px 12px", fontSize: 13, color: "#888888" }}>Loading…</div>
            )}
          </div>

          {hasAssignee && (
            <>
              <div style={{ height: 1, background: "#F0F0F0", margin: "4px 8px" }} />
              <button
                type="button"
                onClick={() => void handleUnassign()}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "#DC2626",
                  textAlign: "left",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <UserMinus size={14} color="#DC2626" style={{ flexShrink: 0 }} />
                Remove assignee
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
