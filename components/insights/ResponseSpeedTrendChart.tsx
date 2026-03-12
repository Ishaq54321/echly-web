"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ResponseSpeedPoint {
  week: string;
  averageFirstReplyMs: number;
}

function formatMsToHours(ms: number): number {
  if (!ms || ms <= 0) return 0;
  return ms / (1000 * 60 * 60);
}

export function ResponseSpeedTrendChart({
  data,
}: {
  data: ResponseSpeedPoint[];
}) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-secondary">
        Not enough data yet to show response speed over time.
      </p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    avgHours: Number(formatMsToHours(d.averageFirstReplyMs).toFixed(2)),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatted}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <YAxis
            tickFormatter={(v) => `${v}h`}
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <Tooltip
            formatter={(value: any) => [`${value}h`, "Avg first reply"]}
            labelFormatter={(label) => `Week ${label}`}
          />
          <Line
            type="monotone"
            dataKey="avgHours"
            name="Average first reply"
            stroke="#155DFC"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

