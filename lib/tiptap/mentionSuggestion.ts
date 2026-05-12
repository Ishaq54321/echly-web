import type { MutableRefObject } from "react";

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
            avatarDiv.textContent = item.displayName.charAt(0).toUpperCase();
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
          const rect = props.clientRect?.() as DOMRect | null;
          if (rect && dropdownEl) {
            dropdownEl.style.position = "fixed";
            dropdownEl.style.left = `${rect.left}px`;
            dropdownEl.style.bottom = `${window.innerHeight - rect.top + 4}px`;
            dropdownEl.style.top = "auto";
            dropdownEl.style.zIndex = "2147480001";
          }
          savedCommand = props.command;
          renderDropdownItems(currentItems, selectedIndex, props.command);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUpdate(props: any) {
          currentItems = (props.items as MentionParticipant[]) ?? [];
          selectedIndex = 0;
          const rect = props.clientRect?.() as DOMRect | null;
          if (rect && dropdownEl) {
            dropdownEl.style.left = `${rect.left}px`;
            dropdownEl.style.bottom = `${window.innerHeight - rect.top + 4}px`;
            dropdownEl.style.top = "auto";
          }
          savedCommand = props.command;
          renderDropdownItems(currentItems, selectedIndex, props.command);
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
          dropdownEl?.remove();
          dropdownEl = null;
          savedCommand = null;
        },
      };
    },
  };
}
