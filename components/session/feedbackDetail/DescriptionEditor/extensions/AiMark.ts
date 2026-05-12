import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiTouched: {
      setAiMark: (attrs?: { sessionId?: string | null }) => ReturnType;
      unsetAiMark: () => ReturnType;
    };
  }
}

export const AiMark = Mark.create({
  name: "aiTouched",

  addAttributes() {
    return {
      sessionId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-ai-touched]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-ai-touched": "true",
        class: "ai-touched-mark",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAiMark:
        (attrs) =>
        ({ commands }) => {
          return commands.setMark(this.name, attrs);
        },
      unsetAiMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
