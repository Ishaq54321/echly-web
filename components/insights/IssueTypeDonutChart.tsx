"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface IssueSlice {
  type: string;
  count: number;
  percentage: number;
}

const ISSUE_COLORS: Record<string, string> = {
  general: "#3B82F6",
  copy: "#BFDBFE",
  ux: "#10B981",
  bug: "#6EE7B7",
};

const ISSUE_LABELS: Record<string, string> = {
  general: "General",
  copy: "Copy",
  ux: "UX",
  bug: "Bug",
};

function normalizeIssueKey(type: string): string {
  return type.toLowerCase();
}

export function IssueTypeDonutChart({
  data,
  totalOverride,
}: {
  data: IssueSlice[];
  totalOverride?: number;
}) {
  const tooltipFontFamily =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-10">
        No feedback yet — insights will appear once you start collecting feedback.
      </p>
    );
  }

  const computedTotal = data.reduce((sum, d) => sum + d.count, 0);
  const safeOverride = Math.max(0, Math.floor(Number(totalOverride ?? NaN)));
  const totalForCenter = Number.isFinite(safeOverride) ? safeOverride : computedTotal;
  const totalForPct = computedTotal || 1;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-[240px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              innerRadius={64}
              outerRadius={100}
              paddingAngle={2}
              isAnimationActive
              animationDuration={280}
              animationEasing="ease-out"
            >
              {data.map((entry) => {
                const key = normalizeIssueKey(entry.type);
                const fill = ISSUE_COLORS[key] ?? "#E5E7EB";
                return (
                  <Cell
                    key={`slice-${entry.type}`}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              })}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: 9999 }}
              offset={14}
              cursor={{ fill: "rgba(17,24,39,0.04)" }}
              content={(tooltipProps: any) => {
                const { active, payload } = tooltipProps;
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0];
                const count = item.value as number;
                const pct =
                  totalForPct > 0 ? ((count / totalForPct) * 100).toFixed(1) + "%" : "0%";
                const rawType = item.name ?? item.payload?.type ?? "general";
                const key = normalizeIssueKey(rawType);
                const label = ISSUE_LABELS[key] ?? rawType;
                return (
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: 8,
                      padding: 10,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                      fontFamily: tooltipFontFamily,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 4,
                        color: "#6B7280",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{ color: "#4B5563", fontWeight: 500 }}
                      >{`Issues`}</span>
                      <span style={{ color: "#111827", fontWeight: 600 }}>
                        {count} ({pct})
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center space-y-[2px] text-center">
          <div className="text-[32px] font-semibold text-neutral-900 leading-none">
            {totalForCenter}
          </div>
          <div className="mt-1 text-[13px] font-medium text-[#6B7280]">
            Total feedback
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600">
        {data.map((slice) => {
          const key = normalizeIssueKey(slice.type);
          const label = ISSUE_LABELS[key] ?? slice.type;
          const color = ISSUE_COLORS[key] ?? "#E5E7EB";
          return (
            <div
              key={`legend-${slice.type}`}
              className="flex items-center gap-2"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

