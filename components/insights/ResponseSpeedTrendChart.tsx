"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";

export interface ResponseSpeedPoint {
  week: string;
  averageFirstReplyMs: number;
  averageResolutionMs?: number;
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
  const tooltipFontFamily =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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
    avgResolutionHours: d.averageResolutionMs
      ? Number(formatMsToHours(d.averageResolutionMs).toFixed(2))
      : undefined,
  }));

  const avgResponse =
    formatted.reduce((sum, d) => sum + d.avgHours, 0) / formatted.length;
  const hasResolution = formatted.some(
    (d) => typeof d.avgResolutionHours === "number" && d.avgResolutionHours > 0
  );
  const avgResolution = hasResolution
    ? formatted.reduce(
        (sum, d) => sum + (d.avgResolutionHours ?? 0),
        0
      ) / formatted.length
    : 0;

  return (
    <div className="w-full h-[240px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatted}
          margin={{ top: 10, right: 16, bottom: 0, left: 16 }}
        >
          <defs>
            <linearGradient id="responseSpeedArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#155DFC" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#155DFC" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            wrapperStyle={{ zIndex: 9999 }}
            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            content={(tooltipProps: any) => {
              const { active, payload, label } = tooltipProps;
              if (!active || !payload || payload.length === 0) return null;
              const item = payload[0];
              const hours = item.value as number;
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
                    Week {label}
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
                    >{`Avg first reply`}</span>
                    <span style={{ color: "#111827", fontWeight: 600 }}>
                      {hours}h
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="avgHours"
            stroke="none"
            fill="url(#responseSpeedArea)"
            fillOpacity={0.15}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="avgHours"
            name="Average first reply"
            stroke="#155DFC"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
          <ReferenceLine
            y={Number(avgResponse.toFixed(2))}
            stroke="#6B7280"
            strokeDasharray="4 4"
            strokeWidth={1}
            ifOverflow="extendDomain"
            label={{
              value: `Avg response (${avgResponse.toFixed(1)}h)`,
              position: "right",
              fill: "#6B7280",
              fontSize: 11,
            }}
          />
          {hasResolution && (
            <ReferenceLine
              y={Number(avgResolution.toFixed(2))}
              stroke="#F97316"
              strokeDasharray="4 4"
              strokeWidth={1}
              ifOverflow="extendDomain"
              label={{
                value: `Avg resolution (${avgResolution.toFixed(1)}h)`,
                position: "right",
                fill: "#F97316",
                fontSize: 11,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

