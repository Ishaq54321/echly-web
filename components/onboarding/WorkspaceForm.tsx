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
  "relative flex flex-col items-center justify-center gap-2 h-[90px] rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm cursor-pointer transition-all duration-150 hover:bg-white/80 hover:border-[#466EFF] hover:scale-[1.02] active:scale-[0.97]";
const SIZE_OPTION_CLASS =
  "relative rounded-xl bg-white/60 border border-gray-200 backdrop-blur-sm py-4 text-center cursor-pointer transition-all duration-150 hover:bg-white/80 hover:border-[#466EFF] hover:scale-[1.02] active:scale-[0.97]";

export type WorkspaceFormValues = {
  workspaceName: string;
  role: string;
  companySize: string;
};

const inputClass =
  "w-full h-11 rounded-xl bg-white/70 border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 backdrop-blur-sm focus:outline-none focus:border-[#466EFF] focus:ring-[3px] focus:ring-[#466EFF]/20 transition-all duration-150 ease-out";

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
        <label htmlFor="workspace-name" className="block text-[16px] font-semibold text-gray-900 mb-2">
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
        <span className="block text-[16px] font-semibold text-gray-900 mb-2">Role</span>
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
              <Icon className={`w-6 h-6 shrink-0 ${role === id ? "text-[#466EFF]" : "text-gray-500"}`} />
              <span className={`text-sm font-medium ${role === id ? "text-[#1D4ED8]" : "text-gray-700"}`}>{id}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-[16px] font-semibold text-gray-900 mb-2">Company Size</span>
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
                <span className={`block text-lg font-semibold ${isSelected ? "text-[#1D4ED8]" : "text-gray-700"}`}>{number}</span>
                <span className={`block text-xs ${isSelected ? "text-[#466EFF]" : "text-gray-700"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !workspaceName.trim()}
        className="h-12 w-full rounded-xl font-semibold text-white text-[16px] transition-all duration-150 ease-out disabled:opacity-60 flex items-center justify-center mt-8 hover:scale-[1.02] hover:shadow-[0_14px_40px_rgba(70,110,255,0.35)] active:scale-[0.97]"
        style={{
          background: "linear-gradient(135deg, #466EFF, #6A8CFF)",
          boxShadow: "0 10px 28px rgba(70,110,255,0.28)",
        }}
      >
        {loading ? "Setting up…" : "Continue"}
      </button>
    </form>
  );
}
