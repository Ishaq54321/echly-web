"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  const tooltipFontFamily =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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

  const barColors = ["#3B82F6", "#74A5F6", "#94B9F6", "#ACC8F6", "#C5D7F6"];

  return (
    <div className="w-full h-[300px]">

      <ResponsiveContainer width="100%" height="100%">

        <BarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 20, right: 30, left: -25, bottom: 0 }}
          barCategoryGap="12%"
        >

          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
          />

          <YAxis
            dataKey="label"
            type="category"
            width={120}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
          />

          <Tooltip
            wrapperStyle={{ zIndex: 9999 }}
            cursor={{ fill: "transparent" }}
            content={(tooltipProps: any) => {
              const { active, payload } = tooltipProps;

              if (!active || !payload || payload.length === 0) return null;

              const item = payload[0];
              const count = item.value as number;
              const label =
                item.payload?.sessionName ?? item.name ?? "Session";

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
                      style={{
                        color: "#4B5563",
                        fontWeight: 500,
                      }}
                    >
                      Issues
                    </span>

                    <span
                      style={{
                        color: "#111827",
                        fontWeight: 600,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              );
            }}
          />

          <Bar
            dataKey="issues"
            barSize={28}   // thicker bars
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
            label={{
              position: "right",
              dx: 6,
              fill: "#111827",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {formatted.map((entry, index) => (
              <Cell
                key={`bar-${entry.sessionId}`}
                fill={barColors[index] ?? "#93C5FD"}
                className="transition-[filter] duration-150 hover:[filter:brightness(1.08)]"
              />
            ))}
          </Bar>

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}