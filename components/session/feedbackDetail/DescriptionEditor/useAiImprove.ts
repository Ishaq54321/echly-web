"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { marked } from "marked";
import type { ImproveAction } from "@/lib/ai/prompts/improveDescription";
import { aiStreamingPluginKey } from "./extensions/AiStreamingPlugin";

interface MarkdownStorage {
  getMarkdown?: () => string;
  serializer?: {
    serialize: (content: unknown) => string;
  };
}

function getMarkdownStorage(editor: Editor): MarkdownStorage | undefined {
  return (editor.storage as unknown as Record<string, unknown>)
    .markdown as MarkdownStorage | undefined;
}

function getMarkdown(editor: Editor): string {
  return getMarkdownStorage(editor)?.getMarkdown?.() ?? "";
}

function getMarkdownInRange(editor: Editor, from: number, to: number): string {
  const slice = editor.state.doc.slice(from, to);
  const serializer = getMarkdownStorage(editor)?.serializer;
  if (serializer) {
    return serializer.serialize(slice.content);
  }
  return slice.content.textBetween(0, slice.content.size, "\n");
}

interface StreamingSession {
  abortController: AbortController;
  pendingText: string;
  accumulatedMarkdown: string;
  rafScheduled: boolean;
  finalizing: boolean;
}

export interface UseAiImproveResult {
  isStreaming: boolean;
  performImprove: (action: ImproveAction) => Promise<void>;
}

export function useAiImprove(editor: Editor | null): UseAiImproveResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const editorRef = useRef<Editor | null>(editor);
  const sessionRef = useRef<StreamingSession | null>(null);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const flushPending = useCallback(() => {
    const ed = editorRef.current;
    const session = sessionRef.current;
    if (!ed || !session) return;
    session.rafScheduled = false;
    if (!session.pendingText || session.finalizing) return;

    session.accumulatedMarkdown += session.pendingText;
    session.pendingText = "";

    const pluginState = aiStreamingPluginKey.getState(ed.state);
    if (!pluginState?.active) return;

    const insertedStart = pluginState.insertedStart;
    const currentCursor = pluginState.cursorPos;
    const dimFrom = pluginState.dimmedFrom;
    const dimTo = pluginState.dimmedTo;

    let html: string;
    try {
      html = marked.parse(session.accumulatedMarkdown, {
        async: false,
        breaks: true,
        gfm: true,
      }) as string;
      html = html
        .replace(/^(\s*<p>\s*<\/p>\s*)+/, "")
        .replace(/(\s*<p>\s*<\/p>\s*)+$/, "")
        .trim();
    } catch (parseErr) {
      console.warn("Mid-stream parse failed:", parseErr);
      return;
    }

    if (!html) return;

    const sizeBefore = ed.state.doc.content.size;
    const previouslyInsertedSize = currentCursor - insertedStart;

    try {
      ed.chain()
        .deleteRange({ from: insertedStart, to: currentCursor })
        .insertContentAt(insertedStart, html, {
          parseOptions: { preserveWhitespace: "full" },
          updateSelection: false,
        })
        .setMeta("addToHistory", false)
        .run();
    } catch (chainErr) {
      console.warn("Mid-stream chain failed:", chainErr);
      return;
    }

    const sizeAfterInsert = ed.state.doc.content.size;
    const insertedContentSize =
      sizeAfterInsert - sizeBefore + previouslyInsertedSize;
    const newCursorPos = insertedStart + insertedContentSize;

    const growthThisFlush = insertedContentSize - previouslyInsertedSize;

    const dimSize = dimTo - dimFrom;

    const consumeAmount = Math.max(0, Math.min(growthThisFlush, dimSize));

    if (consumeAmount > 0) {
      try {
        const deleteTr = ed.state.tr;
        deleteTr.delete(newCursorPos, newCursorPos + consumeAmount);
        deleteTr.setMeta("addToHistory", false);
        ed.view.dispatch(deleteTr);
      } catch (deleteErr) {
        console.warn("Dim consume failed (non-fatal):", deleteErr);
      }
    }

    const newDimFrom = newCursorPos;

    const updateTr = ed.state.tr;
    updateTr.setMeta(aiStreamingPluginKey, {
      action: "updateCursor",
      cursorPos: newCursorPos,
      dimmedFrom: newDimFrom,
    });
    updateTr.setMeta("addToHistory", false);
    ed.view.dispatch(updateTr);
  }, []);

  const appendChunk = useCallback(
    (text: string) => {
      const session = sessionRef.current;
      if (!session || session.finalizing) return;
      session.pendingText += text;
      if (!session.rafScheduled) {
        session.rafScheduled = true;
        requestAnimationFrame(flushPending);
      }
    },
    [flushPending],
  );

  const cleanup = useCallback((shouldShowError: boolean = false) => {
    const ed = editorRef.current;
    const session = sessionRef.current;

    if (session?.abortController) {
      session.abortController.abort();
    }

    if (ed) {
      const tr = ed.state.tr;
      tr.setMeta(aiStreamingPluginKey, { action: "stop" });
      tr.setMeta("addToHistory", false);
      ed.view.dispatch(tr);
      ed.setEditable(true);
    }

    setIsStreaming(false);
    sessionRef.current = null;

    if (shouldShowError) {
      toast.error("AI improvement failed");
    }
  }, []);

  const finalize = useCallback((fullText: string) => {
    const ed = editorRef.current;
    const session = sessionRef.current;
    if (!ed || !session) return;
    session.finalizing = true;

    if (session.pendingText) {
      flushPending();
    }

    requestAnimationFrame(() => {
      const ed2 = editorRef.current;
      const session2 = sessionRef.current;
      if (!ed2 || !session2) return;

      const pluginState = aiStreamingPluginKey.getState(ed2.state);
      if (!pluginState?.active) {
        ed2.setEditable(true);
        setIsStreaming(false);
        sessionRef.current = null;
        return;
      }

      const targetStart = pluginState.insertedStart;
      const targetEnd = pluginState.targetEnd;

      const docSize = ed2.state.doc.content.size;
      const safeStart = Math.max(0, Math.min(targetStart, docSize));
      const safeEnd = Math.max(safeStart, Math.min(targetEnd, docSize));

      const authoritativeMarkdown =
        fullText && fullText.trim().length > 0
          ? fullText.trim()
          : (session2.accumulatedMarkdown || "").trim();

      if (!authoritativeMarkdown) {
        const tr = ed2.state.tr;
        if (safeEnd > safeStart) {
          tr.delete(safeStart, safeEnd);
        }
        tr.setMeta(aiStreamingPluginKey, { action: "stop" });
        ed2.view.dispatch(tr);
        ed2.setEditable(true);
        setIsStreaming(false);
        sessionRef.current = null;
        toast.error("AI improve returned empty response");
        return;
      }

      const normalizedMd = authoritativeMarkdown.replace(/\n{3,}/g, "\n\n");
      let html: string;
      try {
        html = marked.parse(normalizedMd, {
          async: false,
          breaks: true,
          gfm: true,
        }) as string;
        html = html
          .replace(/^(\s*<p>\s*<\/p>\s*)+/, "")
          .replace(/(\s*<p>\s*<\/p>\s*)+$/, "")
          .trim();
      } catch (parseErr) {
        console.error("Markdown parse failed in finalize:", parseErr);
        const escaped = normalizedMd
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        html = `<p>${escaped}</p>`;
      }

      const deleteTr = ed2.state.tr;
      if (safeEnd > safeStart) {
        deleteTr.delete(safeStart, safeEnd);
      }
      deleteTr.setMeta(aiStreamingPluginKey, { action: "stop" });
      ed2.view.dispatch(deleteTr);

      try {
        ed2
          .chain()
          .focus()
          .setTextSelection(safeStart)
          .insertContent(html, {
            parseOptions: { preserveWhitespace: "full" },
          })
          .run();
      } catch (insertErr) {
        console.error(
          "Final insert failed, falling back to plain markdown:",
          insertErr,
        );
        try {
          ed2
            .chain()
            .focus()
            .setTextSelection(safeStart)
            .insertContent(authoritativeMarkdown)
            .run();
        } catch (fallbackErr) {
          console.error("Fallback insert also failed:", fallbackErr);
          toast.error("AI improve failed to apply output");
        }
      }

      const markType = ed2.schema.marks.aiTouched;
      if (markType) {
        const insertEndPos = ed2.state.selection.from;
        const cleanupTr = ed2.state.tr;
        cleanupTr.removeMark(safeStart, insertEndPos, markType);
        cleanupTr.setMeta("addToHistory", false);
        ed2.view.dispatch(cleanupTr);
      }

      ed2.setEditable(true);
      setIsStreaming(false);
      sessionRef.current = null;

      ed2.commands.focus(ed2.state.selection.from);

      toast.success("Improved");
    });
  }, [flushPending]);

  const performImprove = useCallback(
    async (action: ImproveAction) => {
      const ed = editorRef.current;
      if (!ed || isStreamingRef.current) return;

      const { selection } = ed.state;
      const { from: selFrom, to: selTo, empty } = selection;

      const targetFrom = empty ? 0 : selFrom;
      const targetTo = empty ? ed.state.doc.content.size : selTo;

      const text = empty
        ? getMarkdown(ed)
        : getMarkdownInRange(ed, selFrom, selTo);

      if (text.trim().length < 3) {
        toast.error("Nothing to improve", {
          description: "Add some text first.",
        });
        return;
      }

      const abortController = new AbortController();
      sessionRef.current = {
        abortController,
        pendingText: "",
        accumulatedMarkdown: "",
        rafScheduled: false,
        finalizing: false,
      };

      ed.setEditable(false);
      setIsStreaming(true);

      const startTr = ed.state.tr;
      startTr.setMeta(aiStreamingPluginKey, {
        action: "start",
        cursorPos: targetFrom,
        insertedStart: targetFrom,
        dimmedFrom: targetFrom,
        dimmedTo: targetTo,
        targetEnd: targetTo,
      });
      startTr.setMeta("addToHistory", false);
      ed.view.dispatch(startTr);

      try {
        const response = await fetch("/api/ai/improve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, text }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          await handleErrorResponse(response);
          cleanup(false);
          return;
        }

        if (!response.body) {
          cleanup(true);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullTextFromEnd = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr) as {
                type: string;
                text?: string;
                fullText?: string;
                message?: string;
              };

              if (event.type === "chunk" && event.text) {
                appendChunk(event.text);
              } else if (event.type === "end") {
                fullTextFromEnd = event.fullText ?? "";
              } else if (event.type === "error") {
                throw new Error(event.message ?? "Stream error");
              }
            } catch (parseErr) {
              console.warn("SSE parse error:", parseErr);
            }
          }
        }

        finalize(fullTextFromEnd);
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name;
        if (name !== "AbortError") {
          console.error("AI improve failed:", err);
          cleanup(true);
        } else {
          cleanup(false);
        }
      }
    },
    [appendChunk, finalize, cleanup],
  );

  useEffect(() => {
    return () => {
      const session = sessionRef.current;
      if (session?.abortController) {
        session.abortController.abort();
      }
    };
  }, []);

  return {
    isStreaming,
    performImprove,
  };
}

async function handleErrorResponse(response: Response) {
  if (response.status === 429) {
    try {
      const data = await response.json();
      if (data.quotaType === "monthly") {
        const resetDate = new Date(data.resetDate);
        const formatted = resetDate.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        toast.error("Monthly AI limit reached", {
          description: `Resets on ${formatted}.`,
          duration: 6000,
        });
      } else {
        toast.error("Slow down — try again shortly", {
          description: `Try again in ${data.retryAfterSeconds || 60} seconds.`,
        });
      }
    } catch {
      toast.error("Rate limit exceeded");
    }
    return;
  }

  try {
    const data = await response.json();
    if (data.errorCode === "TEXT_TOO_LONG") {
      toast.error("Description too long to improve", {
        description: "Try selecting a smaller section.",
      });
    } else {
      toast.error("AI improvement failed", {
        description: data.error || "Please try again.",
      });
    }
  } catch {
    toast.error("AI improvement failed");
  }
}
