"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { PenTool, Code2, LayoutDashboard, Megaphone, Crown } from "lucide-react";

const ROLES = [
  { id: "Designer", icon: PenTool },
  { id: "Developer", icon: Code2 },
  { id: "Product Manager", icon: LayoutDashboard },
  { id: "Marketing", icon: Megaphone },
  { id: "Founder", icon: Crown },
] as const;

const COMPANY_SIZES = [
  { value: "Just me", number: "1", label: "solo" },
  { value: "2-10", number: "2–10", label: "team" },
  { value: "10-50", number: "10–50", label: "team" },
  { value: "50+", number: "50+", label: "team" },
] as const;

/* Minimal card base; selection feedback comes from moving highlight */
const ROLE_GRID_CLASS =
"relative flex flex-col items-center justify-center gap-2 h-[90px] rounded-2xl border border-[#E3E6E5] bg-[#FFFFFF] cursor-pointer transition-all duration-150 hover:bg-[#E9ECEB] hover:border-[#E5E7EB] hover:scale-[1.02] active:scale-[0.97]";
  const SIZE_OPTION_CLASS =
  "relative rounded-2xl bg-[#FFFFFF] border border-[#E3E6E5] py-4 text-center cursor-pointer transition-all duration-150 hover:bg-[#E9ECEB] hover:border-[#E5E7EB] hover:scale-[1.02] active:scale-[0.97]";

export type WorkspaceFormValues = {
  workspaceName: string;
  role: string;
  companySize: string;
};

const inputClass =
  "w-full h-11 rounded-full bg-[#FFFFFF] border border-[#E3E6E5] px-4 text-[#111111] placeholder:text-[#111111] focus:outline-none focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)] transition-all duration-150 ease-out";

type HighlightStyle = { left: number; top: number; width: number; height: number } | null;

export function WorkspaceForm({
  onSubmit,
  loading,
}: {
  onSubmit: (values: WorkspaceFormValues) => void;
  loading: boolean;
}) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [roleHighlight, setRoleHighlight] = useState<HighlightStyle>(null);
  const [sizeHighlight, setSizeHighlight] = useState<HighlightStyle>(null);

  const roleContainerRef = useRef<HTMLDivElement>(null);
  const selectedRoleRef = useRef<HTMLButtonElement | null>(null);
  const sizeContainerRef = useRef<HTMLDivElement>(null);
  const selectedSizeRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const btn = selectedRoleRef.current;
    const container = roleContainerRef.current;
    if (!btn || !container) {
      setRoleHighlight(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setRoleHighlight({
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [role]);

  useLayoutEffect(() => {
    const btn = selectedSizeRef.current;
    const container = sizeContainerRef.current;
    if (!btn || !container) {
      setSizeHighlight(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setSizeHighlight({
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [companySize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      workspaceName: workspaceName.trim(),
      role,
      companySize,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      <div>
        <label htmlFor="workspace-name" className="block text-body font-semibold text-[#111111] mb-2">
          Workspace Name
        </label>
        <input
          id="workspace-name"
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="My team"
          className={inputClass}
          required
        />
      </div>

      <div>
        <span className="block text-body font-semibold text-[#111111] mb-2">Role</span>
        <div ref={roleContainerRef} className="relative grid grid-cols-3 gap-4 mt-4">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div
              className="selection-highlight"
              style={
                roleHighlight
                  ? {
                      left: roleHighlight.left,
                      top: roleHighlight.top,
                      width: roleHighlight.width,
                      height: roleHighlight.height,
                    }
                  : { opacity: 0, pointerEvents: "none", left: 0, top: 0, width: 0, height: 0 }
              }
            />
          </div>
          {ROLES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              ref={role === id ? selectedRoleRef : undefined}
              onClick={() => setRole(id)}
              className={ROLE_GRID_CLASS}
            >
              <Icon className={`w-6 h-6 shrink-0 ${role === id ? "text-[#111111]" : "text-[#111111]"}`} />
              <span className={`text-meta font-medium ${role === id ? "text-[#111111]" : "text-[#111111]"}`}>{id}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-body font-semibold text-[#111111] mb-2">Company Size</span>
        <div ref={sizeContainerRef} className="relative grid grid-cols-4 gap-3 mt-4">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div
              className="selection-highlight"
              style={
                sizeHighlight
                  ? {
                      left: sizeHighlight.left,
                      top: sizeHighlight.top,
                      width: sizeHighlight.width,
                      height: sizeHighlight.height,
                    }
                  : { opacity: 0, pointerEvents: "none", left: 0, top: 0, width: 0, height: 0 }
              }
            />
          </div>
          {COMPANY_SIZES.map(({ value, number, label }) => {
            const isSelected = companySize === value;
            return (
              <button
                key={value}
                type="button"
                ref={isSelected ? selectedSizeRef : undefined}
                onClick={() => setCompanySize(value)}
                className={SIZE_OPTION_CLASS}
              >
                <span className={`block text-h3 font-semibold ${isSelected ? "text-[#111111]" : "text-[#111111]"}`}>{number}</span>
                <span className={`block text-caption ${isSelected ? "text-[#111111]" : "text-[#111111]"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !workspaceName.trim()}
        className="primary-cta h-14 px-12 text-body rounded-full hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 flex items-center justify-center mt-8 w-full"
      >
        {loading ? "Setting up…" : "Continue"}
      </button>
    </form>
  );
}
