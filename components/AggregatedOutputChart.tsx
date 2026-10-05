"use client";

import type { AggregatedPoint } from "@/lib/fuzzy";

interface AggregatedOutputChartProps {
  aggregated: AggregatedPoint[];
  centroid: number;
}

export default function AggregatedOutputChart({
  aggregated,
  centroid,
}: AggregatedOutputChartProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Aggregated Output</h2>
      <p className="mt-2 text-xs opacity-60">
        {aggregated.length} samples · centroid {centroid.toFixed(2)}
      </p>
    </section>
  );
}
