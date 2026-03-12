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

const COLORS = ["#155DFC", "#6366F1", "#EC4899", "#F59E0B", "#10B981"];

export function IssueTypeDonutChart({ data }: { data: IssueSlice[] }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-secondary">
        Not enough data yet to show issue distribution.
      </p>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`slice-${entry.type}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, _name, props: any) => {
              const count = value as number;
              const pct =
                total > 0 ? ((count / total) * 100).toFixed(1) + "%" : "0%";
              return [`${count} (${pct})`, props.payload.type];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

