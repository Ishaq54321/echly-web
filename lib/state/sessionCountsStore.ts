export type Counts = {
  total: number;
  open: number;
  resolved: number;
};

const store = new Map<string, Counts>();
const listeners = new Map<string, Set<(counts: Counts) => void>>();

function notify(sessionId: string, counts: Counts) {
  const sessionListeners = listeners.get(sessionId);
  if (!sessionListeners || sessionListeners.size === 0) return;
  for (const listener of sessionListeners) {
    listener(counts);
  }
}

export function getCounts(sessionId: string): Counts | null {
  return store.get(sessionId) || null;
}

export function setCounts(sessionId: string, counts: Counts) {
  store.set(sessionId, counts);
  notify(sessionId, counts);
}

export function updateCounts(sessionId: string, updater: (c: Counts) => Counts) {
  const current = store.get(sessionId);
  if (!current) return;
  const next = updater(current);
  store.set(sessionId, next);
  notify(sessionId, next);
}

export function subscribeCounts(
  sessionId: string,
  listener: (counts: Counts) => void
): () => void {
  const sessionListeners = listeners.get(sessionId) ?? new Set<(counts: Counts) => void>();
  sessionListeners.add(listener);
  listeners.set(sessionId, sessionListeners);
  return () => {
    const next = listeners.get(sessionId);
    if (!next) return;
    next.delete(listener);
    if (next.size === 0) {
      listeners.delete(sessionId);
    }
  };
}
