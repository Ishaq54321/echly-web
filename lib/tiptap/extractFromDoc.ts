/**
 * Pure serializer for a TipTap/ProseMirror document's JSON shape.
 *
 * Intentionally has ZERO TipTap imports — it only consumes the structural
 * `{ toJSON() }` contract a ProseMirror doc node satisfies. Kept in its own
 * module so non-editor code paths (e.g. comment submit handlers reachable
 * before the editor chunk loads) can call it without referencing the
 * editor's module graph.
 */
export function extractFromDoc(doc: {
  toJSON: () => {
    content?: Array<{
      content?: Array<{ type?: string; text?: string; attrs?: { label?: string; id?: string } }>;
    }>;
  };
}): { text: string; mentionedUserIds: string[] } {
  const json = doc.toJSON();
  const blocks = json.content ?? [];
  const mentionedUserIds: string[] = [];

  const text = blocks
    .map((block) =>
      (block.content ?? [])
        .map((node) => {
          if (node.type === "mention") {
            const id = node.attrs?.id ?? "";
            const label = node.attrs?.label ?? id;
            if (id) mentionedUserIds.push(id);
            return `@[${label}](${id})`;
          }
          // Shift+Enter inserts a hardBreak node (no text) inside a paragraph.
          // Serialize it to a newline so soft line breaks survive the round-trip.
          if (node.type === "hardBreak") return "\n";
          return node.text ?? "";
        })
        .join("")
    )
    .join("\n")
    .trim();

  return { text, mentionedUserIds: [...new Set(mentionedUserIds)] };
}
