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
      <p className="text-sm text-gray-500 text-center py-10">
        No feedback yet. Insights will appear once you start collecting feedback.
      </p>
    );
  }

  const formatted = data.map((d) => {
    const name = d.sessionName.trim();
    const label =
      !name ? "" : name.length > 28 ? `${name.slice(0, 25)}…` : name;
    return { ...d, label };
  });

  const barColors = ["#3B82F6", "#74A5F6", "#94B9F6", "#ACC8F6", "#C5D7F6"];

  return (
    <div className="w-full h-[300px]">

      <ResponsiveContainer width="100%" height="100%">

        <BarChart
          data={formatted}
          layout="vertical"
          margin={{ top: 12, right: 22, left: -10, bottom: 0 }}
          barCategoryGap="18%"
        >

          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            dataKey="label"
            type="category"
            width={150}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            wrapperStyle={{ zIndex: 9999 }}
            cursor={{ fill: "transparent" }}
            content={(tooltipProps: any) => {
              const { active, payload } = tooltipProps;

              if (!active || !payload || payload.length === 0) return null;

              const item = payload[0];
              const count = item.value as number;
              const rawName = String(item.payload?.sessionName ?? "").trim();
              const label = rawName || "";

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
                  {label ? (
                    <div
                      style={{
                        marginBottom: 4,
                        color: "#6B7280",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </div>
                  ) : null}

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
            barSize={24}
            isAnimationActive
            animationDuration={280}
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