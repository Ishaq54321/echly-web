"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserPlus, UserMinus, Check, ChevronDown, Search } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";

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
  onSaveStateChange?: (state: 'saving' | 'saved' | 'error' | 'hidden') => void;
  disabled?: boolean;
  readOnly?: boolean;
}

const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: '#EBF4FF', text: '#0F5BB5' },
  { bg: '#F3F0FF', text: '#5B21B6' },
  { bg: '#FDF4FF', text: '#7E22CE' },
  { bg: '#FFF0F3', text: '#9D174D' },
  { bg: '#FFF7ED', text: '#C2410C' },
  { bg: '#ECFDF5', text: '#059669' },
  { bg: '#F0FDF4', text: '#166534' },
  { bg: '#FEFCE8', text: '#854D0E' },
  { bg: '#FFF1F2', text: '#BE123C' },
  { bg: '#F0FDFA', text: '#115E59' },
];

function hashColor(str: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
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
  const colors = hashColor(name ?? "?");
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
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: '600',
        color: colors.text,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

function getMemberDisplayName(member: WorkspaceMemberRow): string {
  if (member.displayName?.trim()) {
    return member.displayName.trim();
  }
  if (member.email) {
    return member.email.split('@')[0];
  }
  return 'Unknown';
}

export function AssignDropdown({
  feedbackId,
  sessionId: _sessionId,
  currentAssigneeId,
  currentAssigneeName,
  currentAssigneeAvatarUrl,
  onAssigned,
  onSaveStateChange,
  disabled = false,
  readOnly = false,
}: AssignDropdownProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberRow[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast: _showToast } = useToast();

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
    setQuery('');
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

  const filteredMembers = members.filter(m => {
    if (!query.trim()) return true;
    const name = getMemberDisplayName(m).toLowerCase();
    const email = (m.email ?? '').toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const handleSelect = async (member: WorkspaceMemberRow) => {
    const prevId = currentAssigneeId;
    const prevName = currentAssigneeName;
    const prevAvatar = currentAssigneeAvatarUrl;
    setOpen(false);
    onAssigned(member.uid, getMemberDisplayName(member), member.avatarUrl ?? null);
    setIsSaving(true);
    onSaveStateChange?.('saving');
    try {
      const res = await authFetch(`/api/tickets/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigneeId: member.uid,
          assigneeName: getMemberDisplayName(member),
          assigneeAvatarUrl: member.avatarUrl ?? null,
        }),
      });
      if (!res?.ok) {
        onAssigned(prevId, prevName, prevAvatar);
        onSaveStateChange?.('error');
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
        onSaveStateChange?.('saved');
      }
    } catch {
      onAssigned(prevId, prevName, prevAvatar);
      onSaveStateChange?.('error');
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
    setIsSaving(true);
    onSaveStateChange?.('saving');
    try {
      const res = await authFetch(`/api/tickets/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: null }),
      });
      if (!res?.ok) {
        onAssigned(prevId, prevName, prevAvatar);
        onSaveStateChange?.('error');
      } else {
        onSaveStateChange?.('saved');
      }
    } catch {
      onAssigned(prevId, prevName, prevAvatar);
      onSaveStateChange?.('error');
    } finally {
      setIsSaving(false);
    }
  };

  // READ-ONLY MODE
  if (readOnly) {
    if (currentAssigneeId) {
      return (
        <div
          title={currentAssigneeName ? `Assigned to ${currentAssigneeName}` : "Assigned"}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 10px',
            background: 'var(--brand-subtle)',
            border: '1.5px solid var(--brand-muted)',
            borderRadius: '9px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--brand)',
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
            {currentAssigneeName ? currentAssigneeName.split(" ")[0] : "Assigned"}
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
    height: 36,
    padding: "0 14px",
    background: "var(--brand-subtle)",
    border: "1.5px solid var(--brand-muted)",
    borderRadius: 9,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontSize: 14,
    fontWeight: '500',
    color: "var(--brand)",
  };

  const unassignedCls = `inline-flex items-center gap-1.5 px-3.5 rounded-[9px] text-[14px] font-medium border border-[#EBEBEB] bg-white text-[#44403C] hover:bg-[#F4F5F7] hover:border-[#D5D5D5] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} h-9`;

  const displayName = currentAssigneeName
    ? currentAssigneeName
    : currentAssigneeId
    ? "Assigned"
    : null;

  const firstName = displayName ? displayName.split(" ")[0] : "Assigned";
  const tooltipText = displayName ? `Assigned to ${displayName}` : "Assigned";

  return (
    <>
      <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
        <button
          type="button"
          style={hasAssignee ? assignedStyle : undefined}
          className={!hasAssignee ? unassignedCls : undefined}
          disabled={disabled || isSaving}
          title={hasAssignee ? tooltipText : undefined}
          onClick={() => !disabled && !isSaving && setOpen((o) => !o)}
        >
          {hasAssignee ? (
            <>
              <Avatar name={displayName} avatarUrl={currentAssigneeAvatarUrl} size={20} />
              <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {firstName}
              </span>
              <ChevronDown size={12} style={{ flexShrink: 0, color: "var(--brand)" }} />
            </>
          ) : (
            <>
              <UserPlus size={16} style={{ flexShrink: 0 }} aria-hidden />
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
                fontWeight: '600',
                color: "var(--text-tertiary)",
                letterSpacing: "0.6px",
                textTransform: "uppercase",
              }}
            >
              Assignees
            </div>

            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--surface-input)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 10px',
                height: '34px',
              }}>
                <Search size={13} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search or enter email..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                  className="no-focus-ring"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    color: 'var(--text-body)',
                    outline: 'none',
                    boxShadow: 'none',
                    WebkitAppearance: 'none',
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
                    onClick={() => void handleSelect(member)}
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
                    <Avatar name={getMemberDisplayName(member)} avatarUrl={member.avatarUrl ?? null} size={28} />
                    <span style={{
                      flex: 1,
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-body)",
                      textAlign: "left",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {getMemberDisplayName(member)}
                    </span>
                    {isSelected && <Check size={13} color="var(--brand)" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}

              {membersLoaded && filteredMembers.length === 0 && (
                <div style={{ padding: "8px 12px", fontSize: 14, color: "var(--text-tertiary)" }}>
                  No members found
                </div>
              )}
              {!membersLoaded && (
                <div style={{ padding: "8px 12px", fontSize: 14, color: "var(--text-tertiary)" }}>Loading…</div>
              )}

              {membersLoaded && members.length <= 1 && filteredMembers.length <= 1 && !query.trim() && (
                <>
                  <div style={{ height: 1, background: "var(--border)", margin: "4px 8px" }} />
                  <div style={{
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center" }}>
                      No other members yet
                    </span>
                  </div>
                </>
              )}
            </div>

            {hasAssignee && (
              <>
                <div style={{ height: 1, background: "var(--border)", margin: "4px 8px" }} />
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
                    fontSize: 14,
                    color: "var(--color-danger)",
                    textAlign: "left",
                    marginBottom: 4,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-danger-bg)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <UserMinus size={14} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                  Remove assignee
                </button>
              </>
            )}

            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '4px 4px',
            }}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowInviteModal(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = 'var(--surface-hover)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--surface-subtle)',
                  border: '1.5px dashed var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <UserPlus size={13} color="var(--text-secondary)" />
                </div>
                Invite members to workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            setShowInviteModal(false);
            setMembersLoaded(false);
          }}
        />
      )}
    </>
  );
}
