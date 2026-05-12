import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

interface FakeSelectionState {
  from: number;
  to: number;
  active: boolean;
}

const fakeSelectionKey = new PluginKey<FakeSelectionState>("fakeSelection");

export const FakeSelection = Extension.create({
  name: "fakeSelection",

  addProseMirrorPlugins() {
    return [
      new Plugin<FakeSelectionState>({
        key: fakeSelectionKey,
        state: {
          init: (): FakeSelectionState => ({ from: 0, to: 0, active: false }),
          apply(tr, prev) {
            const meta = tr.getMeta(fakeSelectionKey) as
              | Partial<FakeSelectionState>
              | undefined;
            if (meta) return { ...prev, ...meta };
            if (tr.docChanged && prev.active) {
              return {
                from: tr.mapping.map(prev.from),
                to: tr.mapping.map(prev.to),
                active: prev.active,
              };
            }
            return prev;
          },
        },
        props: {
          decorations(state) {
            const pluginState = fakeSelectionKey.getState(state);
            if (!pluginState?.active) return DecorationSet.empty;
            const { from, to } = pluginState;
            if (from === to) return DecorationSet.empty;
            return DecorationSet.create(state.doc, [
              Decoration.inline(from, to, { class: "fake-selection" }),
            ]);
          },
        },
      }),
    ];
  },
});

export function setFakeSelection(
  editor: Editor,
  from: number,
  to: number,
  active: boolean,
) {
  const tr = editor.state.tr;
  tr.setMeta(fakeSelectionKey, { from, to, active });
  editor.view.dispatch(tr);
}
