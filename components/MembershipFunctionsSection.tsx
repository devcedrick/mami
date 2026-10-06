"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FuzzyVariable } from "@/lib/flood-config";

interface MembershipFunctionsSectionProps {
  variables: FuzzyVariable[];
}

type Shape = "left" | "triangle" | "right";

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#0d9488", "#db2777"];

function shapeFor(index: number, count: number): Shape {
  if (count > 1 && index === 0) return "left";
  if (count > 1 && index === count - 1) return "right";
  return "triangle";
}

function degree(x: number, [lowval, midval, highval]: readonly [number, number, number], shape: Shape): number {
  if (shape === "left") {
    if (x > highval) return 0;
    if (x > midval) return (highval - x) / (highval - midval);
    return 1;
  }
  if (shape === "right") {
    if (x < lowval) return 0;
    if (x < midval) return (x - lowval) / (midval - lowval);
    return 1;
  }
  if (x < lowval || x > highval) return 0;
  if (x === midval) return 1;
  if (x < midval) return (x - lowval) / (midval - lowval);
  return (highval - x) / (highval - midval);
}

function buildSeries(variable: FuzzyVariable) {
  const entries = Object.entries(variable.terms).sort((a, b) => a[1][0] - b[1][0]);
  const shapes = entries.map((_entry, index) => shapeFor(index, entries.length));
  const { min, max } = variable.universe;
  const steps = 120;
  const rows: Array<Record<string, number>> = [];
  for (let i = 0; i <= steps; i++) {
    const x = min + ((max - min) * i) / steps;
    const row: Record<string, number> = { x: Number(x.toFixed(4)) };
    entries.forEach(([name, triplet], index) => {
      row[name] = degree(x, triplet, shapes[index]);
    });
    rows.push(row);
  }
  return { entries, rows };
}

function VariableChart({ variable }: { variable: FuzzyVariable }) {
  const { entries, rows } = buildSeries(variable);

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{variable.name}</h3>
      <div className="mt-2 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" opacity={0.4} />
            <XAxis
              dataKey="x"
              type="number"
              domain={[variable.universe.min, variable.universe.max]}
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
              labelFormatter={(label) => `x = ${Number(label).toFixed(2)}`}
              formatter={(value) => Number(value).toFixed(3)}
            />
            {entries.map(([name], index) => (
              <Line
                key={name}
                type="linear"
                dataKey={name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        {entries.map(([name], index) => (
          <li key={name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-4 rounded-sm"
              style={{ background: COLORS[index % COLORS.length] }}
              aria-hidden
            />
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MembershipFunctionsSection({
  variables,
}: MembershipFunctionsSectionProps) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Membership Functions</h2>
      <div className="mt-3 flex flex-col gap-6">
        {variables.map((variable) => (
          <VariableChart key={variable.name} variable={variable} />
        ))}
      </div>
    </section>
  );
}
