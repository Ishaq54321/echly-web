import "server-only";

/**
 * Extracts mention metadata from a saved markdown description.
 *
 * Mentions are serialized by the TipTap Mention extension as inline spans:
 *   <span ... data-type="mention" ... data-id="UID" ... data-label="Name" ... >@Name</span>
 *
 * Attribute order is not stable (mergeAttributes from @tiptap/core), so we
 * scan every `<span>` and pull out `data-id` / `data-label` regardless of
 * position. Duplicate user IDs are deduplicated; the first label wins.
 */
export function parseMentionsFromDescription(
  description: string | null | undefined
): { ids: string[]; labels: Record<string, string> } {
  if (!description) return { ids: [], labels: {} };

  const SPAN_OPEN_RE = /<span\b([^>]*)>/gi;
  const ids: string[] = [];
  const labels: Record<string, string> = {};
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = SPAN_OPEN_RE.exec(description)) !== null) {
    const attrs = match[1] ?? "";
    if (!/\bdata-type\s*=\s*"mention"/i.test(attrs)) continue;

    const idMatch = attrs.match(/\bdata-id\s*=\s*"([^"]*)"/i);
    const id = idMatch?.[1]?.trim();
    if (!id || seen.has(id)) continue;

    const labelMatch = attrs.match(/\bdata-label\s*=\s*"([^"]*)"/i);
    seen.add(id);
    ids.push(id);
    labels[id] = labelMatch?.[1] ?? "";
  }

  return { ids, labels };
}

/**
 * Returns the set of user IDs newly @mentioned in `nextDescription` that
 * were NOT already mentioned in `previousDescription`. Used to avoid
 * re-notifying users on every description edit.
 */
export function diffMentionSets(
  previousDescription: string | null | undefined,
  nextDescription: string | null | undefined
): string[] {
  const prev = new Set(parseMentionsFromDescription(previousDescription).ids);
  const next = parseMentionsFromDescription(nextDescription).ids;
  return next.filter((id) => !prev.has(id));
}
