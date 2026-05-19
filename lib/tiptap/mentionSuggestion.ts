import type { MutableRefObject } from "react";
import { getInitials } from "@/lib/utils/getInitials";
import { getAvatarColor } from "@/lib/utils/getAvatarColor";

export interface MentionParticipant {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}

interface CreateMentionSuggestionOptions {
  participantsRef: MutableRefObject<MentionParticipant[]>;
  /** Optional — set true while dropdown is open so editor-level Enter handlers can defer. */
  mentionOpenRef?: MutableRefObject<boolean>;
}

/**
 * Builds the `suggestion` config for `@tiptap/extension-mention`.
 * Behavior matches the original inline implementation from
 * components/comments/TiptapCommentEditor.tsx 1:1 — vanilla DOM dropdown
 * portalled to document.body, keyboard navigation, mouse selection with
 * blur-suppression via onmousedown, and fixed-position anchoring above the
 * caret rect.
 */
export function createMentionSuggestion({
  participantsRef,
  mentionOpenRef,
}: CreateMentionSuggestionOptions) {
  return {
    items: ({ query }: { query: string }) =>
      participantsRef.current
        .filter(
          (p) =>
            p.displayName.toLowerCase().includes(query.toLowerCase()) ||
            p.email.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: (): any => {
      let dropdownEl: HTMLDivElement | null = null;
      let currentItems: MentionParticipant[] = [];
      let selectedIndex = 0;
      let savedCommand: ((attrs: { id: string; label: string }) => void) | null = null;
      let scrollCleanup: (() => void) | null = null;

      const DROPDOWN_WIDTH = 280;
      const GAP = 6;

      function positionDropdown(rect: DOMRect) {
        if (!dropdownEl) return;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        // Measure actual rendered height; fall back to estimate before paint.
        const measured = dropdownEl.offsetHeight;
        const popoverHeight = measured > 0 ? measured : Math.min(currentItems.length * 56 + 8, 300);

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const placeBelow =
          spaceBelow >= popoverHeight + GAP || spaceBelow >= spaceAbove;

        dropdownEl.style.position = "fixed";
        dropdownEl.style.zIndex = "2147480001";
        const left = Math.max(
          GAP,
          Math.min(rect.left, viewportWidth - DROPDOWN_WIDTH - GAP)
        );
        dropdownEl.style.left = `${left}px`;
        if (placeBelow) {
          dropdownEl.style.top = `${rect.bottom + GAP}px`;
          dropdownEl.style.bottom = "auto";
        } else {
          dropdownEl.style.top = "auto";
          dropdownEl.style.bottom = `${viewportHeight - rect.top + GAP}px`;
        }
      }

      function renderDropdownItems(
        items: MentionParticipant[],
        selected: number,
        command: (attrs: { id: string; label: string }) => void
      ) {
        if (!dropdownEl) return;
        dropdownEl.innerHTML = "";
        if (items.length === 0) {
          dropdownEl.style.display = "none";
          return;
        }
        dropdownEl.style.display = "block";

        items.forEach((item, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `mention-dropdown-item${i === selected ? " active" : ""}`;

          const avatarDiv = document.createElement("div");
          avatarDiv.className = "mention-dropdown-avatar";
          if (item.avatarUrl) {
            const img = document.createElement("img");
            img.src = item.avatarUrl;
            img.alt = "";
            avatarDiv.appendChild(img);
          } else {
            // Route through the shared helpers so the mention dropdown matches
            // every other avatar surface: full initials ("IM" not "I") on the
            // user's stable per-uid color. CSS gives a flat --brand-subtle bg;
            // override it inline and flip the text to white for contrast.
            avatarDiv.textContent = getInitials(item.displayName);
            avatarDiv.style.backgroundColor = getAvatarColor(item.uid);
            avatarDiv.style.color = "#fff";
          }
          btn.appendChild(avatarDiv);

          const infoDiv = document.createElement("div");
          infoDiv.className = "mention-dropdown-info";

          const nameDiv = document.createElement("div");
          nameDiv.className = "mention-dropdown-name";
          nameDiv.textContent = item.displayName;
          infoDiv.appendChild(nameDiv);

          const emailDiv = document.createElement("div");
          emailDiv.className = "mention-dropdown-email";
          emailDiv.textContent = item.email;
          infoDiv.appendChild(emailDiv);

          btn.appendChild(infoDiv);

          btn.onmousedown = (e) => {
            e.preventDefault();
            command({ id: item.uid, label: item.displayName });
          };

          dropdownEl!.appendChild(btn);
        });
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onStart(props: any) {
          if (mentionOpenRef) mentionOpenRef.current = true;
          dropdownEl = document.createElement("div");
          dropdownEl.className = "mention-dropdown";
          document.body.appendChild(dropdownEl);
          currentItems = (props.items as MentionParticipant[]) ?? [];
          selectedIndex = 0;
          savedCommand = props.command;
          renderDropdownItems(currentItems, selectedIndex, props.command);
          const rect = props.clientRect?.() as DOMRect | null;
          if (rect) positionDropdown(rect);

          // Dismiss the mention popover on any scroll — capture phase so it
          // catches scrolls inside the comment panel as well as the window.
          // We dispatch Escape to the editor's DOM so Tiptap closes the
          // suggestion (which fires onExit and cleans up listeners).
          const handleScroll = () => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const editorDom: HTMLElement | undefined = (props.editor as any)?.view?.dom;
              editorDom?.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
              );
            } catch {
              /* noop */
            }
            // Belt-and-suspenders: also hide the dropdown immediately in case
            // Escape didn't propagate (e.g. mid-IME).
            if (dropdownEl) dropdownEl.style.display = "none";
          };
          window.addEventListener("scroll", handleScroll, true);
          scrollCleanup = () => {
            window.removeEventListener("scroll", handleScroll, true);
          };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUpdate(props: any) {
          currentItems = (props.items as MentionParticipant[]) ?? [];
          selectedIndex = 0;
          savedCommand = props.command;
          renderDropdownItems(currentItems, selectedIndex, props.command);
          const rect = props.clientRect?.() as DOMRect | null;
          if (rect) positionDropdown(rect);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onKeyDown(props: any) {
          if ((props.event as KeyboardEvent).key === "ArrowUp") {
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderDropdownItems(currentItems, selectedIndex, props.command ?? (() => {}));
            return true;
          }
          if ((props.event as KeyboardEvent).key === "ArrowDown") {
            selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
            renderDropdownItems(currentItems, selectedIndex, props.command ?? (() => {}));
            return true;
          }
          if ((props.event as KeyboardEvent).key === "Enter") {
            const item = currentItems[selectedIndex];
            if (item && savedCommand) {
              savedCommand({ id: item.uid, label: item.displayName });
            }
            return true;
          }
          return false;
        },
        onExit() {
          if (mentionOpenRef) mentionOpenRef.current = false;
          scrollCleanup?.();
          scrollCleanup = null;
          dropdownEl?.remove();
          dropdownEl = null;
          savedCommand = null;
        },
      };
    },
  };
}
