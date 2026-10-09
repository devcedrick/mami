import type { FloodRiskResult } from "@/lib/fuzzy";

interface RiskResultProps {
  result: FloodRiskResult;
}

const COLORS: Record<string, string> = {
  Green: "text-risk-normal",
  Yellow: "text-risk-prepare",
  Orange: "text-risk-evacuate",
  Red: "text-risk-forced",
};

export default function RiskResult({ result }: RiskResultProps) {
  const accent = COLORS[result.advisory.color] ?? "text-foreground";
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Flood Risk Index</h2>
      <p className={`mt-2 text-4xl font-bold tabular-nums ${accent}`}>
        {result.risk.toFixed(1)}
      </p>
      <p className={`text-sm font-medium ${accent}`}>{result.advisory.label}</p>
      <p className="text-xs text-muted">index out of 100</p>
    </section>
  );
}
