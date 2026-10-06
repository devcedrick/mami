import type { FiredRule } from "@/lib/fuzzy";

interface FiredRulesTableProps {
  firedRules: FiredRule[];
}

function describe(rule: FiredRule["rule"]): string {
  const antecedent = rule.antecedent
    .map(({ variable, term }) => `${variable} is ${term}`)
    .join(` ${rule.connective} `);
  return `IF ${antecedent} THEN ${rule.consequent.variable} is ${rule.consequent.term}`;
}

export default function FiredRulesTable({ firedRules }: FiredRulesTableProps) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="text-sm font-semibold">Fired Rules</h2>
      {firedRules.length === 0 ? (
        <p className="mt-2 text-xs text-muted">No rules fired.</p>
      ) : (
        <ul className="mt-2 flex flex-col text-xs">
          {firedRules.map(({ rule, strength }) => (
            <li
              key={rule.id}
              className="flex items-baseline justify-between gap-3 border-t border-line py-1 first:border-t-0"
            >
              <span>{describe(rule)}</span>
              <span className="shrink-0 tabular-nums text-muted">{strength.toFixed(3)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
