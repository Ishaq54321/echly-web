import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorState, Transaction } from "@tiptap/pm/state";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface AiStreamingPluginState {
  active: boolean;
  cursorPos: number;
  insertedStart: number;
  dimmedFrom: number;
  dimmedTo: number;
  targetEnd: number;
}

const initialState: AiStreamingPluginState = {
  active: false,
  cursorPos: 0,
  insertedStart: 0,
  dimmedFrom: 0,
  dimmedTo: 0,
  targetEnd: 0,
};

export const aiStreamingPluginKey = new PluginKey<AiStreamingPluginState>(
  "aiStreaming",
);

function buildDecorations(
  state: AiStreamingPluginState,
  doc: PMNode,
): DecorationSet {
  if (!state.active) return DecorationSet.empty;

  const decorations: Decoration[] = [];
  const docSize = doc.content.size;

  const dimFrom = Math.max(0, Math.min(state.dimmedFrom, docSize));
  const dimTo = Math.max(0, Math.min(state.dimmedTo, docSize));
  if (dimFrom < dimTo) {
    decorations.push(
      Decoration.inline(dimFrom, dimTo, {
        class: "ai-dim-range",
      }),
    );
  }

  const cursorAt = Math.max(0, Math.min(state.cursorPos, docSize));
  decorations.push(
    Decoration.widget(
      cursorAt,
      () => {
        const wrap = document.createElement("span");
        wrap.className = "ai-annote-cursor";
        wrap.setAttribute("contenteditable", "false");

        const caret = document.createElement("span");
        caret.className = "ai-annote-caret";
        caret.setAttribute("aria-hidden", "true");

        const pill = document.createElement("span");
        pill.className = "ai-annote-pill";
        pill.textContent = "Annoting";

        wrap.appendChild(caret);
        wrap.appendChild(pill);
        return wrap;
      },
      {
        key: "ai-annote-cursor",
        side: -1,
        ignoreSelection: true,
      },
    ),
  );

  return DecorationSet.create(doc, decorations);
}

interface StartMeta {
  action: "start";
  cursorPos: number;
  insertedStart: number;
  dimmedFrom: number;
  dimmedTo: number;
  targetEnd: number;
}

interface UpdateCursorMeta {
  action: "updateCursor";
  cursorPos: number;
  dimmedFrom?: number;
}

interface StopMeta {
  action: "stop";
}

export type AiStreamingMeta = StartMeta | UpdateCursorMeta | StopMeta;

export const AiStreamingPlugin = Extension.create({
  name: "aiStreamingPlugin",

  addProseMirrorPlugins() {
    return [
      new Plugin<AiStreamingPluginState>({
        key: aiStreamingPluginKey,

        state: {
          init: () => ({ ...initialState }),

          apply(tr: Transaction, prevState: AiStreamingPluginState) {
            const meta = tr.getMeta(aiStreamingPluginKey) as
              | AiStreamingMeta
              | undefined;

            if (meta) {
              if (meta.action === "start") {
                return {
                  active: true,
                  cursorPos: meta.cursorPos,
                  insertedStart: meta.insertedStart,
                  dimmedFrom: meta.dimmedFrom,
                  dimmedTo: meta.dimmedTo,
                  targetEnd: meta.targetEnd,
                };
              }
              if (meta.action === "updateCursor") {
                return {
                  ...prevState,
                  cursorPos: meta.cursorPos,
                  dimmedFrom: meta.dimmedFrom ?? prevState.dimmedFrom,
                };
              }
              if (meta.action === "stop") {
                return { ...initialState };
              }
            }

            if (tr.docChanged && prevState.active) {
              return {
                ...prevState,
                cursorPos: tr.mapping.map(prevState.cursorPos),
                insertedStart: tr.mapping.map(prevState.insertedStart, -1),
                dimmedFrom: tr.mapping.map(prevState.dimmedFrom),
                dimmedTo: tr.mapping.map(prevState.dimmedTo, 1),
                targetEnd: tr.mapping.map(prevState.targetEnd, 1),
              };
            }

            return prevState;
          },
        },

        props: {
          decorations(state: EditorState) {
            const pluginState = aiStreamingPluginKey.getState(state);
            if (!pluginState) return DecorationSet.empty;
            return buildDecorations(pluginState, state.doc);
          },

          handleKeyDown(view, event) {
            const pluginState = aiStreamingPluginKey.getState(view.state);
            if (pluginState?.active) {
              event.preventDefault();
              return true;
            }
            return false;
          },

          handleClick(view) {
            const pluginState = aiStreamingPluginKey.getState(view.state);
            return !!pluginState?.active;
          },
        },
      }),
    ];
  },
});
