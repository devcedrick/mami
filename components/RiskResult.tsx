import type { FloodRiskResult } from "@/lib/fuzzy";

interface RiskResultProps {
  result: FloodRiskResult;
}

export default function RiskResult({ result }: RiskResultProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Flood Risk Index</h2>
      <p className="mt-2 text-3xl font-bold">{result.risk.toFixed(1)}</p>
      <p className="text-sm">{result.advisory.label}</p>
    </section>
  );
}
