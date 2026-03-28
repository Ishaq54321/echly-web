"use client";

import { createPortal } from "react-dom";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ChevronDown, Globe } from "lucide-react";

import { ModalPortal } from "@/components/ui/ModalPortal";

import { useToast } from "@/components/dashboard/context/ToastContext";

import { PORTAL_DROPDOWN_Z_INDEX } from "@/lib/ui/zIndex";

import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";

import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";
import {
  fetchSessionShares,
  fetchSessionLinkAccess,
  shareSession,
  updateSharePermission,
  updateSessionLinkAccess,
  type SharePermission,
} from "@/lib/api/sessionSharesClient";

export interface ShareModalProps {
  isOpen: boolean;

  onClose: () => void;

  sessionId: string;

  sessionTitle?: string;
}

type ShareListUser = {
  clientId: string;

  email: string;

  access: AccessLevel;

  /** True only while a role change request (PATCH) is in flight; disables the role dropdown. */
  isSaving: boolean;

  /** True while initial invite (shareSession) is in flight; row may show busy state but role stays editable. */
  isInviting: boolean;

  isNew: boolean;
};

/** UI labels for link-level general access only (stored: view | comment | resolve). */
const ACCESS_LABELS = [
  "Anyone with the link can view",
  "Anyone can comment",
  "Anyone can resolve",
] as const;

type AccessLabel = (typeof ACCESS_LABELS)[number];

/** One-word role labels for per-user shares (same enum as `AccessLevel` in storage). */
const PEOPLE_ROLE_LABELS = ["Viewer", "Commenter", "Resolver"] as const;

type PeopleRoleLabel = (typeof PEOPLE_ROLE_LABELS)[number];

function accessLevelToLabel(a: AccessLevel): AccessLabel {
  if (a === "comment") return "Anyone can comment";
  if (a === "resolve") return "Anyone can resolve";
  return "Anyone with the link can view";
}

function labelToAccessLevel(label: string): AccessLevel {
  if (label === "Anyone can comment") return "comment";
  if (label === "Anyone can resolve") return "resolve";
  return "view";
}

function accessLevelToPeopleRoleLabel(a: AccessLevel): PeopleRoleLabel {
  if (a === "comment") return "Commenter";
  if (a === "resolve") return "Resolver";
  return "Viewer";
}

function peopleRoleLabelToAccessLevel(label: string): AccessLevel {
  if (label === "Commenter") return "comment";
  if (label === "Resolver") return "resolve";
  return "view";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function serverRowToUser(share: {
  email: string;
  permission: SharePermission;
}): ShareListUser {
  const email = normalizeEmail(share.email);

  return {
    clientId: `srv-${email}`,

    email,

    access: normalizeAccessLevel(share.permission),

    isSaving: false,

    isInviting: false,

    isNew: false,
  };
}

/** After fetch: server rows + any rows still persisting that are not yet on the server. */
function mergeServerSharesWithPending(
  serverUsers: ShareListUser[],
  prev: ShareListUser[],
): ShareListUser[] {
  const serverEmails = new Set(serverUsers.map((u) => u.email));
  const pending = prev.filter(
    (u) => u.isInviting === true && !serverEmails.has(u.email),
  );
  return [...serverUsers, ...pending];
}

function rolePillDotClassName(access: AccessLevel): string {
  if (access === "view") return "role-dot role-dot--viewer";

  if (access === "comment") return "role-dot role-dot--commenter";

  if (access === "resolve") return "role-dot role-dot--resolver";

  return "role-dot role-dot--viewer";
}

function ShareDropdown<T extends string>({
  value,

  options,

  onChange,

  ariaLabel,

  disabled,

  triggerVariant = "default",

  leadingIcon,

  ariaDescribedBy,

  /** Dot color class for `role-pill` trigger; derived from `AccessLevel` on the client. */
  pillDotClassName,
}: {
  value: T;

  options: readonly T[];

  onChange: (next: T) => void;

  ariaLabel: string;

  disabled?: boolean;

  /** `"role-pill"` — compact pill trigger for user-row roles only (invite / link dropdowns stay default). */
  triggerVariant?: "default" | "role-pill";

  leadingIcon?: ReactNode;

  ariaDescribedBy?: string;

  pillDotClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncMenuPosition = () => {
    const el = triggerRef.current;

    if (!el) return;

    const r = el.getBoundingClientRect();

    const width =
      triggerVariant === "role-pill"
        ? Math.max(r.width, 132)
        : r.width;

    setMenuRect({ top: r.bottom + 6, left: r.left, width });
  };

  useLayoutEffect(() => {
    if (!open) return;

    syncMenuPosition();
  }, [open, triggerVariant]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;

      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t))
        return;

      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();

        e.stopPropagation();

        setOpen(false);
      }
    };

    const onScrollResize = () => syncMenuPosition();

    document.addEventListener("mousedown", onDoc);

    document.addEventListener("keydown", onKey, true);

    window.addEventListener("scroll", onScrollResize, true);

    window.addEventListener("resize", onScrollResize);

    return () => {
      document.removeEventListener("mousedown", onDoc);

      document.removeEventListener("keydown", onKey, true);

      window.removeEventListener("scroll", onScrollResize, true);

      window.removeEventListener("resize", onScrollResize);
    };
  }, [open]);

  const menu =
    open &&
    mounted &&
    createPortal(
      <div
        ref={menuRef}
        className="share-dropdown-menu share-dropdown-menu--portal dropdown-menu"
        role="listbox"
        style={{
          position: "fixed",

          top: menuRect.top,

          left: menuRect.left,

          width: menuRect.width,

          zIndex: PORTAL_DROPDOWN_Z_INDEX,
        }}
      >
        {options.map((opt) => (
          <div
            key={opt}
            role="option"
            aria-selected={opt === value}
            className="share-dropdown-option"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(opt);

              setOpen(false);
            }}
          >
            {opt}
          </div>
        ))}
      </div>,

      document.body,
    );

  const rootClassName =
    triggerVariant === "role-pill"
      ? "share-dropdown share-dropdown--role-pill"
      : "share-dropdown";

  return (
    <div className={rootClassName}>
      {triggerVariant === "role-pill" ? (
        <button
          ref={triggerRef}
          type="button"
          className="role-pill dropdown-trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          disabled={disabled === true}
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={pillDotClassName ?? rolePillDotClassName("view")}
            aria-hidden
          />

          <span className="role-label">{value}</span>

          <ChevronDown
            className="shrink-0"
            width={16}
            height={16}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className="share-dropdown-trigger dropdown-trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          disabled={disabled === true}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="share-dropdown-trigger-start">
            {leadingIcon != null ? (
              <span className="share-dropdown-trigger-icon" aria-hidden>
                {leadingIcon}
              </span>
            ) : null}
            <span className="share-dropdown-trigger-label">{value}</span>
          </span>

          <ChevronDown
            className="shrink-0"
            width={18}
            height={18}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      )}

      {menu}
    </div>
  );
}

function shareUserInitial(email: string): string {
  const trimmed = email.trim();

  if (trimmed.length === 0) return "?";

  const local = trimmed.split("@")[0] ?? trimmed;

  const letter = local.charAt(0);

  return letter ? letter.toUpperCase() : "?";
}

function SharedUserRow({
  email: userEmail,

  access,

  roleMutationSaving,

  onAccessChange,
}: {
  email: string;

  access: AccessLevel;

  roleMutationSaving: boolean;

  onAccessChange: (next: AccessLevel) => void;
}) {
  return (
    <div
      className="share-member share-user-item"
      role="listitem"
    >
      <div className="share-member-info">
        <div className="share-user-avatar" aria-hidden>
          <span className="share-user-avatar-initial">
            {shareUserInitial(userEmail)}
          </span>
        </div>
        <span className="share-user-email">{userEmail}</span>
      </div>

      <ShareDropdown<PeopleRoleLabel>
        value={accessLevelToPeopleRoleLabel(access)}
        options={PEOPLE_ROLE_LABELS}
        ariaLabel={`Role for ${userEmail}`}
        disabled={roleMutationSaving === true}
        onChange={(label) => onAccessChange(peopleRoleLabelToAccessLevel(label))}
        triggerVariant="role-pill"
        pillDotClassName={rolePillDotClassName(access)}
      />
    </div>
  );
}

function useShareInFlightCount() {
  const [inFlightCount, setInFlightCount] = useState(0);

  const beginShareOp = useCallback(() => {
    setInFlightCount((n) => n + 1);
  }, []);

  const endShareOp = useCallback(() => {
    setInFlightCount((n) => Math.max(0, n - 1));
  }, []);

  return {
    beginShareOp,
    endShareOp,
    inFlightCount,
  };
}

export function ShareModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
}: ShareModalProps) {
  const { showToast } = useToast();
  const { isIdentityResolved } = useWorkspace();

  const [email, setEmail] = useState("");

  const [inviteAccess, setInviteAccess] = useState<AccessLevel>("view");

  const [linkAccessLevel, setLinkAccessLevel] = useState<AccessLevel>("view");

  const [users, setUsers] = useState<ShareListUser[]>([]);

  const [listError, setListError] = useState<string | null>(null);

  const [shareSuccess, setShareSuccess] = useState(false);

  const successClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clears stuck `isSaving` (role PATCH) if no response within 3s. */
  const savingFailsafeTimersRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  const { beginShareOp, endShareOp, inFlightCount } = useShareInFlightCount();

  const loadSharesQuietly = useCallback(async () => {
    setListError(null);

    try {
      const list = await fetchSessionShares(sessionId);

      const serverUsers = list.map(serverRowToUser);

      setUsers((prev) => mergeServerSharesWithPending(serverUsers, prev));
    } catch (err) {
      console.error("Failed to load shares", err);

      setListError("Could not load people with access.");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    void (async () => {
      await loadSharesQuietly();
      try {
        const level = await fetchSessionLinkAccess(sessionId);
        if (!cancelled) setLinkAccessLevel(level);
      } catch (err) {
        console.error("Failed to load link access", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, loadSharesQuietly, sessionId]);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");

      setShareSuccess(false);

      setListError(null);

      savingFailsafeTimersRef.current.forEach((t) => clearTimeout(t));

      savingFailsafeTimersRef.current.clear();

      if (successClearRef.current) {
        clearTimeout(successClearRef.current);

        successClearRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      savingFailsafeTimersRef.current.forEach((t) => clearTimeout(t));
      savingFailsafeTimersRef.current.clear();
      return;
    }

    const savingIds = users
      .filter((u) => u.isSaving === true)
      .map((u) => u.clientId);

    for (const [cid, t] of [...savingFailsafeTimersRef.current.entries()]) {
      if (!savingIds.includes(cid)) {
        clearTimeout(t);
        savingFailsafeTimersRef.current.delete(cid);
      }
    }

    for (const cid of savingIds) {
      if (savingFailsafeTimersRef.current.has(cid)) continue;
      const t = setTimeout(() => {
        savingFailsafeTimersRef.current.delete(cid);
        setUsers((prev) =>
          prev.map((u) =>
            u.clientId === cid ? { ...u, isSaving: false } : u,
          ),
        );
      }, 3000);
      savingFailsafeTimersRef.current.set(cid, t);
    }
  }, [users, isOpen]);

  const pendingRequests = new Set(
    users
      .filter((u) => u.isSaving === true || u.isInviting === true)
      .map((u) => u.clientId),
  );

  function handleShare() {
    const trimmed = email.trim();

    if (!trimmed.includes("@") || trimmed.indexOf("@") <= 0) return;

    const normalized = normalizeEmail(trimmed);

    const tempClientId = `temp-${crypto.randomUUID()}`;

    const stableClientId = `srv-${normalized}`;

    const access = inviteAccess;

    let inserted = false;

    setUsers((prev) => {
      if (prev.some((u) => normalizeEmail(u.email) === normalized)) return prev;

      inserted = true;

      return [
        ...prev,
        {
          clientId: tempClientId,
          email: normalized,
          access,
          isSaving: false,
          isInviting: true,
          isNew: true,
        },
      ];
    });

    if (!inserted) return;

    setEmail("");

    setShareSuccess(false);

    if (successClearRef.current) {
      clearTimeout(successClearRef.current);

      successClearRef.current = null;
    }

    beginShareOp();

    assertIdentityResolved(isIdentityResolved);

    shareSession({
      sessionId,

      email: normalized,

      permission: access,
    })
      .then(() => {
        setUsers((prev) => {
          const next = prev.map((u) =>
            u.clientId === tempClientId
              ? {
                  clientId: stableClientId,
                  email: normalized,
                  access: u.access,
                  isSaving: false,
                  isInviting: false,
                  isNew: false,
                }
              : u,
          );
          const seen = new Set<string>();
          const deduped: ShareListUser[] = [];
          for (const u of next) {
            if (seen.has(u.email)) continue;
            seen.add(u.email);
            deduped.push(u);
          }
          return deduped;
        });

        setShareSuccess(true);

        successClearRef.current = setTimeout(
          () => setShareSuccess(false),
          2600,
        );
      })

      .catch(() => {
        setUsers((prev) => prev.filter((u) => u.clientId !== tempClientId));

        showToast("Failed to add user");
      })

      .finally(() => {
        endShareOp();
        setUsers((prev) =>
          prev.map((u) =>
            u.clientId === tempClientId
              ? { ...u, isSaving: false, isInviting: false }
              : u,
          ),
        );
      });
  }

  function handleDone() {
    onClose();
  }

  if (!isOpen) return null;

  const emailValid =
    email.trim().includes("@") && email.trim().indexOf("@") > 0;

  const normalizedInput = normalizeEmail(email.trim());

  const duplicateInvite =
    emailValid &&
    users.some((u) => normalizeEmail(u.email) === normalizedInput);

  const shareHeaderSessionName = sessionTitle?.trim() ?? "";

  const dialogLabel = shareHeaderSessionName
    ? `Share “${shareHeaderSessionName}”`
    : "Share";

  return (
    <ModalPortal>
      <div
        className="overlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal share-modal"
          role="dialog"
          aria-modal="true"
          aria-label={dialogLabel}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="share-modal-header">
            <h2 className="share-modal-title">{`Share “${shareHeaderSessionName}”`}</h2>
          </div>

          <div className="share-modal-share-stack">
            <div className="share-modal-invite">
              <input
                className="share-input"
                placeholder="Add people by email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Add people by email"
                autoComplete="email"
                type="email"
              />

              <div className="share-modal-invite-actions">
                <ShareDropdown<PeopleRoleLabel>
                  value={accessLevelToPeopleRoleLabel(inviteAccess)}
                  options={PEOPLE_ROLE_LABELS}
                  ariaLabel="Role for new person"
                  onChange={(label) =>
                    setInviteAccess(peopleRoleLabelToAccessLevel(label))
                  }
                />

                <button
                  type="button"
                  className="share-btn share-btn--primary share-modal-invite-share-btn"
                  disabled={!emailValid || duplicateInvite}
                  onClick={() => handleShare()}
                >
                  Share
                </button>
              </div>

              {shareSuccess ? (
                <p className="share-modal-success" role="status">
                  Person added.
                </p>
              ) : null}
            </div>

            {listError ? (
              <p className="share-modal-list-error" role="alert">
                {listError}
              </p>
            ) : null}

            {users.length > 0 ? (
              <div className="share-modal-shared-with">
                <h3 className="share-modal-section-heading share-modal-section-heading--people">
                  People
                </h3>

                <div className="share-modal-team">
                  <div
                    className="share-team-list share-modal-user-list"
                    role="list"
                    aria-busy={pendingRequests.size > 0}
                  >
                    {users.map((user) => (
                      <SharedUserRow
                        key={user.clientId}
                        email={user.email}
                        access={user.access}
                        roleMutationSaving={user.isSaving === true}
                        onAccessChange={(nextAccess) => {
                          const { clientId } = user;
                          const rowEmail = user.email;
                          let prevAccess = user.access;

                          setUsers((prev) => {
                            const cur = prev.find((u) => u.clientId === clientId);
                            if (cur) prevAccess = cur.access;

                            return prev.map((u) =>
                              u.clientId === clientId
                                ? { ...u, access: nextAccess, isSaving: true }
                                : u,
                            );
                          });

                          beginShareOp();

                          assertIdentityResolved(isIdentityResolved);

                          updateSharePermission({
                            sessionId,
                            email: rowEmail,
                            permission: nextAccess,
                          })
                            .then(() => {
                              setUsers((prev) =>
                                prev.map((u) =>
                                  u.clientId === clientId
                                    ? { ...u, isSaving: false }
                                    : u,
                                ),
                              );
                            })
                            .catch(() => {
                              setUsers((prev) =>
                                prev.map((u) =>
                                  u.clientId === clientId
                                    ? { ...u, access: prevAccess, isSaving: false }
                                    : u,
                                ),
                              );

                              showToast("Could not update access.");
                            })
                            .finally(() => {
                              endShareOp();
                            });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="share-modal-permissions">
            <h3 className="share-modal-section-heading share-modal-section-heading--general-access">
              General access
            </h3>

            <ShareDropdown<AccessLabel>
              value={accessLevelToLabel(linkAccessLevel)}
              options={ACCESS_LABELS}
              ariaLabel="Link access"
              ariaDescribedBy="share-general-access-hint"
              onChange={(label) => {
                const next = labelToAccessLevel(label);
                const prev = linkAccessLevel;
                setLinkAccessLevel(next);
                beginShareOp();
                assertIdentityResolved(isIdentityResolved);
                updateSessionLinkAccess({ sessionId, accessLevel: next })
                  .catch(() => {
                    setLinkAccessLevel(prev);
                    showToast("Could not update link access.");
                  })
                  .finally(() => {
                    endShareOp();
                  });
              }}
              leadingIcon={
                <Globe className="share-general-access-globe" size={18} aria-hidden />
              }
            />

            <p className="share-modal-general-access-hint" id="share-general-access-hint">
              Default permission for new visitors who open the session link.
            </p>

            <div className="share-modal-actions">
              <button type="button" className="share-btn" onClick={onClose}>
                Cancel
              </button>

              <button
                type="button"
                className="share-btn share-btn--primary"
                disabled={inFlightCount > 0}
                onClick={handleDone}
              >
                {inFlightCount > 0 ? "Saving..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
