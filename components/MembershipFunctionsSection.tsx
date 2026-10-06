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

interface Vertex {
  x: number;
  degree: number;
}

function vertices([lowval, midval, highval]: readonly [number, number, number]): Vertex[] {
  return [
    { x: lowval, degree: 0 },
    { x: midval, degree: 1 },
    { x: highval, degree: 0 },
  ];
}

function TermChart({
  term,
  points,
  domain,
}: {
  term: string;
  points: Vertex[];
  domain: [number, number];
}) {
  return (
    <div className="rounded-md border border-line p-2">
      <p className="mb-1 text-xs font-medium text-muted">{term}</p>
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="x" type="number" domain={domain} tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Line
              type="linear"
              dataKey="degree"
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function MembershipFunctionsSection({
  variables,
}: MembershipFunctionsSectionProps) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Membership Functions</h2>
      <div className="mt-3 flex flex-col gap-4">
        {variables.map((variable) => (
          <div key={variable.name}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {variable.name}
            </h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {Object.entries(variable.terms).map(([term, triplet]) => (
                <TermChart
                  key={term}
                  term={term}
                  points={vertices(triplet)}
                  domain={[variable.universe.min, variable.universe.max]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
