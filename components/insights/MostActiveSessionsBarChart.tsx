"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ActiveSessionBar {
  sessionId: string;
  sessionName: string;
  issues: number;
}

export function MostActiveSessionsBarChart({
  data,
}: {
  data: ActiveSessionBar[];
}) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-secondary">
        No session activity yet to show.
      </p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label:
      d.sessionName.length > 24
        ? `${d.sessionName.slice(0, 21)}…`
        : d.sessionName,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 8, left: 80 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <YAxis
            dataKey="label"
            type="category"
            width={120}
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <Tooltip formatter={(value: any) => [`${value} issues`, "Issues"]} />
          <Bar dataKey="issues" fill="#155DFC" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

