"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ActivityTrendPoint {
  date: string;
  issues: number;
  replies: number;
}

export function ActivityTrendChart({
  data,
}: {
  data: ActivityTrendPoint[];
}) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-secondary">
        Not enough data yet to show activity over time.
      </p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    dateLabel: d.date.slice(5),
  }));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatted}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <Tooltip
            formatter={(value: any) => [value, "count"]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="issues"
            name="Issues captured"
            stroke="#155DFC"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="replies"
            name="Replies made"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

