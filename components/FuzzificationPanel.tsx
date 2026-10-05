interface FuzzificationPanelProps {
  rainfallDegrees: Record<string, number>;
  riverLevelDegrees: Record<string, number>;
}

export default function FuzzificationPanel({
  rainfallDegrees,
  riverLevelDegrees,
}: FuzzificationPanelProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Fuzzification</h2>
      <pre className="mt-2 text-xs">
        {JSON.stringify({ rainfallDegrees, riverLevelDegrees }, null, 2)}
      </pre>
    </section>
  );
}
