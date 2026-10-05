---
status: accepted
tags: [data-model, fis, marikina]
---

# Mami — Data Model

Mami is stateless: there is **no database and no persisted schema**. "Entities" are the
in-memory domain objects and configuration constants that the engine reads and produces.
This note is the single source of truth for their shapes, formats, and invariants; all
other notes reference it by section.

## 1. Entities

| Entity | Meaning | Key fields | Nullability |
| :----- | :------ | :--------- | :---------- |
| Rainfall intensity | Crisp input, mm/hr | value (number), universe `0–60` | never null; clamped |
| River level | Crisp input, m | value (number), universe `10–22` | never null; clamped |
| Fuzzy variable | A universe + named terms | name, universe, terms | never null |
| Term | Triangular MF | `[a, b, c]` numbers, `a <= b <= c` | never null |
| Rule | Antecedent → consequent | id, antecedent[], connective, consequent | never null |
| Fired rule | Rule + its strength | rule, strength (`0–1`) | only `> 0` retained |
| Aggregated point | Output sample | x (`0–100`), mu (`0–1`) | never null |
| Flood risk result | Engine output | risk, advisory, firedRules, aggregated | never null |

Format rules: rainfall is `mm/hr`, river level is meters (`m`), risk is unitless `0–100`,
strengths and memberships are `0–1`. There are no dates/times in this app.

## 2. TypeScript contracts

```ts
export type Triplet = readonly [number, number, number]; // [a, b, c], a <= b <= c

export interface Universe {
  min: number;   // e.g. 0, 10, 0
  max: number;   // e.g. 60, 22, 100
  step: number;  // sampling step, 0.01
}

export interface FuzzyVariable {
  name: string;                        // "Rainfall" | "RiverLevel" | "FloodRisk"
  universe: Universe;
  terms: Record<string, Triplet>;      // non-empty; keys are term names
}

export type Connective = "AND" | "OR";

export interface FuzzyRule {
  id: number;                          // 1..9, unique, stable
  antecedent: { variable: string; term: string }[];
  connective: Connective;              // "AND" (min) in shipped config
  consequent: { variable: string; term: string };
}

export interface FiredRule {
  rule: FuzzyRule;
  strength: number;                    // 0–1
}

export interface AggregatedPoint {
  x: number;                           // 0–100
  mu: number;                          // 0–1
}

export interface FloodRiskResult {
  risk: number;                        // 0–100 centroid
  advisory: { label: string; color: string };
  firedRules: FiredRule[];
  aggregated: AggregatedPoint[];
}
```

Degradation rules: every field is required and non-null. Invalid/typed numeric input is
clamped by `clamp`, so no `null` ever reaches the engine. Because `sum(mu)` can be zero
in principle, `risk` is guarded to `0` rather than `NaN`. Nothing is flagged for Review
because nothing is persisted.

## 3. Schema

**N/A — no persistence.** There is no SQL/DDL, no migration, and no storage layer. The
closest thing to a "schema" is the declarative config in `lib/flood-config.ts` (universes,
terms, rules, advisories), whose shape is fixed by the contracts in §2. If persistence is
ever introduced it must be added as a new ADR plus a migration here.

## 4. Mapping Table

Source field (README spec) → TS field → storage column (none) → null handling.

| Source | TS field | Storage | Null handling |
| :----- | :------- | :------ | :------------ |
| Rainfall universe `0–60 mm/hr` | `rainfall.universe` | — | clamped |
| Rainfall terms Light/Moderate/Heavy | `rainfall.terms.*: Triplet` | — | never null |
| River universe `10–22 m` | `riverLevel.universe` | — | clamped |
| River terms Low/Elevated/Critical | `riverLevel.terms.*: Triplet` | — | never null |
| Output terms Low/Moderate/High | `floodRisk.terms.*: Triplet` | — | never null |
| 9 IF-THEN rules | `rules[]: FuzzyRule` | — | never null |
| Advisory thresholds `<25/25–50/50–75/>=75` | `advisories[]: {max,label,color}` | — | last row `max: Infinity` |
| Risk index `0–100` | `FloodRiskResult.risk` | — | zero-guarded, never NaN |

## 5. Query Contracts

No database queries. The equivalent are pure function contracts (all in `lib/fuzzy.ts`
unless noted):

```ts
clamp(x: number, universe: Universe): number
triangularMF(x: number, triplet: Triplet): number          // 0–1
fuzzify(x: number, variable: FuzzyVariable): Record<string, number>   // term -> degree
evaluateRules(degrees: Record<string, Record<string, number>>, ruleSet: FuzzyRule[]): FiredRule[]
aggregate(fired: FiredRule[], output: FuzzyVariable): AggregatedPoint[]
defuzzify(points: AggregatedPoint[]): number               // centroid, 0 if sum(mu)==0
inferFloodRisk(rainfallValue: number, riverLevelValue: number): FloodRiskResult
```

Ordering / filtering rules:

- `aggregated` is ascending by `x`, sampled at `0.01` steps over the output universe.
- `firedRules` retains only `strength > 0`; ties keep rule order by `id`.
- `advisories` is evaluated top-down; the first `risk <= max` wins.

## 6. Acceptance

- Round-trip: `inferFloodRisk(rain, river)` matches all four vectors in [[TASKS]] within `±0.1`.
- Fuzzify: degrees for every term are in `[0,1]` and an out-of-universe input is clamped first.
- Filter: a scenario firing no rule yields `risk = 0` and an empty `firedRules`.
- Empty state: before any input, defaults render a valid `FloodRiskResult` (no crash, no NaN).
