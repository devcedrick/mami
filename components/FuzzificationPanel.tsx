interface FuzzificationPanelProps {
  rainfallDegrees: Record<string, number>;
  riverLevelDegrees: Record<string, number>;
}

function DegreeTable({ title, degrees }: { title: string; degrees: Record<string, number> }) {
  const entries = Object.entries(degrees);
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <table className="mt-2 w-full text-left text-xs">
        <thead>
          <tr className="text-muted">
            <th className="py-1 font-medium">Term</th>
            <th className="py-1 text-right font-medium">Degree</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([term, degree]) => (
            <tr key={term} className="border-t border-line">
              <td className="py-1">{term}</td>
              <td className="py-1 text-right tabular-nums">{degree.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FuzzificationPanel({
  rainfallDegrees,
  riverLevelDegrees,
}: FuzzificationPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Fuzzification</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <DegreeTable title="Rainfall" degrees={rainfallDegrees} />
        <DegreeTable title="River Level" degrees={riverLevelDegrees} />
      </div>
    </section>
  );
}
