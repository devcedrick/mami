"use client";

import type { FuzzyVariable } from "@/lib/flood-config";

interface MembershipFunctionsSectionProps {
  variables: FuzzyVariable[];
}

export default function MembershipFunctionsSection({
  variables,
}: MembershipFunctionsSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Membership Functions</h2>
      <ul className="mt-2 text-xs">
        {variables.map((variable) => (
          <li key={variable.name}>{variable.name}</li>
        ))}
      </ul>
    </section>
  );
}
