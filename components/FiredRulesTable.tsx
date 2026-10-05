import type { FiredRule } from "@/lib/fuzzy";

interface FiredRulesTableProps {
  firedRules: FiredRule[];
}

export default function FiredRulesTable({ firedRules }: FiredRulesTableProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Fired Rules</h2>
      {firedRules.length === 0 ? (
        <p className="mt-2 text-xs opacity-60">No rules fired.</p>
      ) : (
        <ul className="mt-2 text-xs">
          {firedRules.map(({ rule, strength }) => (
            <li key={rule.id}>
              Rule {rule.id} — {strength.toFixed(3)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
