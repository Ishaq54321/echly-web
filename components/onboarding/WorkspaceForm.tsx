"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

export type WorkspaceFormValues = {
  workspaceName: string;
  role: string;
  companySize: string;
};

const inputClass =
  "w-full h-12 rounded-xl border border-gray-200 px-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#466EFF] focus:ring-[3px] focus:ring-[rgba(70,110,255,0.15)] transition-all";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      workspaceName: workspaceName.trim(),
      role,
      companySize,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <div className="mt-8">
        <span className="block text-[16px] font-semibold text-gray-900 mb-2">Role</span>
        <div className="grid grid-cols-3 gap-4 mt-3">
          {ROLES.map(({ id, icon: Icon }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-gray-200 bg-white cursor-pointer transition-all hover:border-[#466EFF] hover:bg-[#F7F9FF] hover:scale-[1.02] ${
                role === id ? "border-[#466EFF] bg-[#F5F8FF]" : ""
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-6 h-6 shrink-0 ${role === id ? "text-[#466EFF]" : "text-gray-500"}`} />
              <span className="text-sm font-medium text-gray-800">{id}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <span className="block text-[16px] font-semibold text-gray-900 mb-2">Company Size</span>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {COMPANY_SIZES.map(({ value, number, label }) => (
            <motion.button
              key={value}
              type="button"
              onClick={() => setCompanySize(value)}
              className={`rounded-xl border border-gray-200 py-4 text-center cursor-pointer transition-all hover:border-[#466EFF] hover:bg-[#F7F9FF] ${
                companySize === value ? "border-[#466EFF] bg-[#F5F8FF]" : "bg-white"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <span className="block text-lg font-semibold text-gray-900">{number}</span>
              <span className="block text-xs text-gray-500">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading || !workspaceName.trim()}
        className="h-12 w-full rounded-xl font-semibold text-white text-[16px] transition-all disabled:opacity-60 hover:brightness-105 flex items-center justify-center mt-8"
        style={{
          background: "linear-gradient(135deg, #466EFF, #5F7DFF)",
          boxShadow: "0 12px 30px rgba(70,110,255,0.35)",
        }}
        whileTap={{ scale: 0.99 }}
      >
        {loading ? "Setting up…" : "Continue"}
      </motion.button>
    </form>
  );
}
