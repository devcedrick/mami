"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AggregatedPoint } from "@/lib/fuzzy";

interface AggregatedOutputChartProps {
  aggregated: AggregatedPoint[];
  centroid: number;
}

const MAX_POINTS = 500;

export default function AggregatedOutputChart({
  aggregated,
  centroid,
}: AggregatedOutputChartProps) {
  const step = Math.max(1, Math.ceil(aggregated.length / MAX_POINTS));
  const data = step > 1 ? aggregated.filter((_point, index) => index % step === 0) : aggregated;
  const line = Math.min(100, Math.max(0, centroid));

  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Aggregated Output</h2>
      <p className="mt-1 text-xs text-muted">
        {`Combined membership of the output terms; the dashed line marks the Flood Risk Index (${centroid.toFixed(1)}).`}
      </p>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" opacity={0.4} />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--color-muted)" }}
            />
            <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "var(--color-muted)" }} />
            <Tooltip
              cursor={{ stroke: "var(--color-muted)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-line)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-muted)", marginBottom: 4 }}
              itemStyle={{ color: "var(--color-foreground)" }}
              labelFormatter={(label) => `x = ${Number(label).toFixed(1)}`}
              formatter={(value) => Number(value).toFixed(3)}
            />
            <Area
              type="linear"
              dataKey="mu"
              stroke="var(--color-foreground)"
              fill="var(--color-foreground)"
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <ReferenceLine x={line} stroke="var(--color-muted)" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
