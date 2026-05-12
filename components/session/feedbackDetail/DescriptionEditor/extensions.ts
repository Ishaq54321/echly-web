import type { MutableRefObject } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Markdown } from "tiptap-markdown";
import { createMentionSuggestion, type MentionParticipant } from "@/lib/tiptap/mentionSuggestion";
import ImageNodeView from "./ImageNodeView";
import { ImageUploadPlaceholder } from "./ImageUploadPlaceholder";
import { FakeSelection } from "./FakeSelection";
import { AiMark } from "./extensions/AiMark";
import { AiStreamingPlugin } from "./extensions/AiStreamingPlugin";

interface ImageMarkdownStorage {
  serialize?: {
    node?: (state: unknown, node: unknown) => void;
  };
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      "data-aspect": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-aspect"),
        renderHTML: (attributes) => {
          if (!attributes["data-aspect"]) return {};
          return { "data-aspect": attributes["data-aspect"] };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        serialize(
          state: {
            write: (s: string) => void;
            closeBlock: (node: unknown) => void;
            esc: (s: string) => string;
          },
          node: {
            attrs: Record<string, unknown>;
          },
        ) {
          const src = (node.attrs.src as string) || "";
          const alt = (node.attrs.alt as string) || "";
          const title = node.attrs.title as string | null | undefined;
          const width = node.attrs.width as string | number | null | undefined;
          const aspect = node.attrs["data-aspect"] as string | number | null | undefined;

          if (width) {
            const parts = [`<img src="${src.replace(/"/g, "&quot;")}"`];
            if (alt) parts.push(`alt="${alt.replace(/"/g, "&quot;")}"`);
            parts.push(`width="${String(width)}"`);
            if (aspect) parts.push(`data-aspect="${String(aspect)}"`);
            parts.push("/>");
            state.write(parts.join(" "));
          } else {
            const escapedAlt = state.esc(alt);
            const titleSuffix = title ? ` "${String(title).replace(/"/g, '\\"')}"` : "";
            state.write(`![${escapedAlt}](${src}${titleSuffix})`);
          }
          state.closeBlock(node);
        },
        parse: {
          // tiptap-markdown handles ![alt](src) via its default image rule;
          // HTML <img> tags are parsed by the html option.
        },
      },
    } as ImageMarkdownStorage & Record<string, unknown>;
  },
});

export interface BuildDescriptionExtensionsOptions {
  placeholder: string;
  participantsRef: MutableRefObject<MentionParticipant[]>;
}

export function buildDescriptionExtensions({
  placeholder,
  participantsRef,
}: BuildDescriptionExtensionsOptions) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
      horizontalRule: false,
      hardBreak: false,
    }),
    CodeBlock.configure({
      HTMLAttributes: {
        class: "description-editor-code-block",
      },
    }),
    Underline,
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-[var(--brand-secondary)] underline decoration-1 underline-offset-2",
      },
    }),
    Mention.configure({
      HTMLAttributes: { class: "mention-chip" },
      suggestion: createMentionSuggestion({ participantsRef }),
    }),
    TextStyle,
    Color.configure({
      types: ["textStyle"],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    CustomImage.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: "description-editor-image",
        loading: "lazy",
      },
    }),
    ImageUploadPlaceholder,
    FakeSelection,
    AiMark,
    AiStreamingPlugin,
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: "-",
      linkify: false,
      breaks: false,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];
}
