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
  Area,
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
  const tooltipFontFamily =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const renderTooltip = (tooltipProps: any) => {
    const { active, payload, label } = tooltipProps;
    if (!active || !payload || payload.length === 0) return null;

    const issues = payload.find((p: any) => p.dataKey === "issues");
    const replies = payload.find((p: any) => p.dataKey === "replies");

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
          Day {label}
        </div>
        {issues && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ color: "#4B5563", fontWeight: 500 }}>Issues captured</span>
            <span style={{ color: "#111827", fontWeight: 600 }}>
              {issues.value}
            </span>
          </div>
        )}
        {replies && (
          <div
            style={{
              marginTop: 4,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ color: "#4B5563", fontWeight: 500 }}>Replies made</span>
            <span style={{ color: "#111827", fontWeight: 600 }}>
              {replies.value}
            </span>
          </div>
        )}
      </div>
    );
  };

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
    <div className="w-full h-[320px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatted}
          margin={{ top: 10, right: 16, bottom: 0, left: 16 }}
        >
          <defs>
            <linearGradient id="activityIssuesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#155DFC" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#155DFC" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            wrapperStyle={{ zIndex: 9999 }}
            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            content={renderTooltip}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="issues"
            stroke="none"
            fill="url(#activityIssuesGradient)"
            fillOpacity={0.15}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="issues"
            name="Issues captured"
            stroke="#155DFC"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="replies"
            name="Replies made"
            stroke="#34D399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

