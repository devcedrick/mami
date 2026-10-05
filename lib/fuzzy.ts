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
  void degrees;
  void ruleSet;
  return [];
}

export function defuzzify(points: AggregatedPoint[]): number {
  void points;
  return 0;
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
