"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SessionsSearchContextValue = {
  search: string;
  setSearch: (next: string) => void;
};

const SessionsSearchContext =
  createContext<SessionsSearchContextValue | null>(null);

export function SessionsSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const value = useMemo(
    () => ({ search, setSearch }),
    [search]
  );
  return (
    <SessionsSearchContext.Provider value={value}>
      {children}
    </SessionsSearchContext.Provider>
  );
}

export function useSessionsSearch() {
  const ctx = useContext(SessionsSearchContext);
  if (!ctx) {
    throw new Error(
      "useSessionsSearch must be used within SessionsSearchProvider"
    );
  }
  return ctx;
}
