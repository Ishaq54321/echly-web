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

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 16, bottom: 10, left: 40 }}>
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
            cursor={{ stroke: "#9CA3AF", strokeWidth: 1 }}
            formatter={(value: any, _name, props: any) => {
              const hour = props?.payload?.x ?? 0;
              const day = props?.payload?.y ?? 0;
              return [`${value} issues`, `${DAYS[day]} ${hour}:00`];
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
                  fill="#155DFC"
                  fillOpacity={opacity}
                  rx={2}
                  ry={2}
                />
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}


