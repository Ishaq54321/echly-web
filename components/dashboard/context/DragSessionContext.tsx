"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface DragSessionContextValue {
  draggedSessionId: string | null;
  setDraggedSessionId: (id: string | null) => void;
}

const DragSessionContext = createContext<DragSessionContextValue | null>(null);

export function DragSessionProvider({ children }: { children: ReactNode }) {
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);
  return (
    <DragSessionContext.Provider
      value={{ draggedSessionId, setDraggedSessionId }}
    >
      {children}
    </DragSessionContext.Provider>
  );
}

export function useDragSession() {
  const ctx = useContext(DragSessionContext);
  if (!ctx) {
    return {
      draggedSessionId: null,
      setDraggedSessionId: () => {},
    };
  }
  return ctx;
}
