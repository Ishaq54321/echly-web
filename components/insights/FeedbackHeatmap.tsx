"use client";

import {
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
} from "recharts";

export interface FeedbackHeatmapBin {
  dayOfWeek: number;
  hourOfDay: number;
  count: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function FeedbackHeatmap({
  data,
}: {
  data: FeedbackHeatmapBin[];
}) {
  const tooltipFontFamily =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-secondary">
        Not enough data yet to show feedback timing.
      </p>
    );
  }

  const maxCount = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  const chartData = data.map((bin) => ({
    x: bin.hourOfDay,
    y: bin.dayOfWeek,
    z: bin.count,
  }));

  const cellWidth = 18;
  const cellHeight = 14;

  const getFillForCount = (count: number): string => {
    if (count <= 0) return "transparent";
    if (count <= 1) return "#DBEAFE";
    if (count <= 3) return "#93C5FD";
    if (count <= 5) return "#2563EB";
    return "#2563EB";
  };

  return (
    <div className="w-full h-[220px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 24, bottom: 10, left: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            dataKey="x"
            name="Hour"
            domain={[0, 23]}
            ticks={[0, 3, 6, 9, 12, 15, 18, 21]}
            tickFormatter={(v) => `${v}`}
            tick={{ fontSize: 10, fill: "#6B7280" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Day"
            domain={[0, 6]}
            tickFormatter={(v) => DAYS[v] ?? ""}
            tick={{ fontSize: 10, fill: "#6B7280" }}
          />
          <ZAxis type="number" dataKey="z" range={[0, 400]} />
          <Tooltip
            wrapperStyle={{ zIndex: 9999 }}
            cursor={{ stroke: "#9CA3AF", strokeWidth: 1, fill: "transparent" }}
            labelFormatter={() => ""}
            content={(tooltipProps: any) => {
              const { active, payload } = tooltipProps;
              if (!active || !payload || payload.length === 0) return null;
              const item = payload[0];
              const hour = item.payload?.x ?? 0;
              const day = item.payload?.y ?? 0;
              const count = item.value as number;
              return (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "10px 12px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
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
                    {DAYS[day]} {hour}:00
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
                      {count}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Scatter
            data={chartData}
            shape={(props: any) => {
              const intensity =
                maxCount > 0 ? Math.min(1, (props.z as number) / maxCount) : 0;
              const opacity = 0.15 + 0.85 * intensity;
              return (
                <rect
                  x={(props.cx as number) - cellWidth / 2}
                  y={(props.cy as number) - cellHeight / 2}
                  width={cellWidth}
                  height={cellHeight}
                  fill={getFillForCount(props.z as number)}
                  fillOpacity={intensity === 0 ? 0 : 1}
                  rx={2}
                  ry={2}
                />
              );
            }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}


