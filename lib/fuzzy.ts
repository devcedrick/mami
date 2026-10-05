import type {
  FuzzyRule,
  FuzzyVariable,
  Triplet,
  Universe,
} from "./flood-config";

export interface FiredRule {
  rule: FuzzyRule;
  strength: number;
}

export interface AggregatedPoint {
  x: number;
  mu: number;
}

export interface FloodRiskResult {
  risk: number;
  advisory: { label: string; color: string };
  firedRules: FiredRule[];
  aggregated: AggregatedPoint[];
}

export function clamp(x: number, universe: Universe): number {
  if (Number.isNaN(x)) return universe.min;
  if (x < universe.min) return universe.min;
  if (x > universe.max) return universe.max;
  return x;
}

export function triangularMF(x: number, triplet: Triplet): number {
  const [lowval, midval, highval] = triplet;
  if (x < lowval || x > highval) return 0;
  if (x === midval) return 1;
  if (x < midval) return (x - lowval) / (midval - lowval);
  return (highval - x) / (highval - midval);
}

export function fuzzify(x: number, variable: FuzzyVariable): Record<string, number> {
  const crisp = clamp(x, variable.universe);
  const degrees: Record<string, number> = {};
  for (const term of Object.keys(variable.terms)) {
    degrees[term] = triangularMF(crisp, variable.terms[term]);
  }
  return degrees;
}

export function evaluateRules(
  degrees: Record<string, Record<string, number>>,
  ruleSet: FuzzyRule[],
): FiredRule[] {
  return ruleSet.map((rule) => {
    const doms = rule.antecedent.map(({ variable, term }) => degrees[variable]?.[term] ?? 0);
    let strength = 0;
    if (doms.length > 0) {
      strength = rule.connective === "OR" ? Math.max(...doms) : Math.min(...doms);
    }
    return { rule, strength };
  });
}

export function termStrengths(
  fired: FiredRule[],
  output: FuzzyVariable,
): Record<string, number> {
  const strengths: Record<string, number> = {};
  for (const term of Object.keys(output.terms)) {
    strengths[term] = 0;
  }
  for (const { rule, strength } of fired) {
    if (rule.consequent.variable !== output.name) continue;
    const term = rule.consequent.term;
    if (!(term in strengths)) continue;
    if (strength > strengths[term]) strengths[term] = strength;
  }
  return strengths;
}

export function termArea(
  lowval: number,
  midval: number,
  highval: number,
  mu: number,
): number {
  void midval;
  const base = (highval - lowval) / 2;
  const fired = clamp(mu, { min: 0, max: 1, step: 0 });
  return base * (2 * fired - fired * fired);
}

export function termCentroid(lowval: number, midval: number, highval: number): number {
  void lowval;
  void highval;
  return midval;
}

export function defuzzify(
  strengths: Record<string, number>,
  output: FuzzyVariable,
): number {
  let weighted = 0;
  let totalArea = 0;
  for (const term of Object.keys(output.terms)) {
    const [lowval, midval, highval] = output.terms[term];
    const area = termArea(lowval, midval, highval, strengths[term] ?? 0);
    weighted += termCentroid(lowval, midval, highval) * area;
    totalArea += area;
  }
  if (totalArea === 0) return 0;
  return weighted / totalArea;
}

export function aggregate(fired: FiredRule[], output: FuzzyVariable): AggregatedPoint[] {
  void fired;
  void output;
  return [];
}

export function inferFloodRisk(rainfallValue: number, riverLevelValue: number): FloodRiskResult {
  void rainfallValue;
  void riverLevelValue;
  return {
    risk: 0,
    advisory: { label: "Normal / monitor", color: "Green" },
    firedRules: [],
    aggregated: [],
  };
}
