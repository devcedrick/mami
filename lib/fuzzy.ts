import {
  advisories,
  floodRisk,
  rainfall,
  riverLevel,
  rules,
  type FuzzyRule,
  type FuzzyVariable,
  type Triplet,
  type Universe,
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

export type TermShape = "left" | "triangle" | "right";

export interface TermEntry {
  name: string;
  triplet: Triplet;
  shape: TermShape;
}

export function clamp(x: number, universe: Universe): number {
  if (Number.isNaN(x)) return universe.min;
  if (x < universe.min) return universe.min;
  if (x > universe.max) return universe.max;
  return x;
}

export function termShape(index: number, count: number): TermShape {
  if (count > 1 && index === 0) return "left";
  if (count > 1 && index === count - 1) return "right";
  return "triangle";
}

export function orderedTerms(variable: FuzzyVariable): TermEntry[] {
  const entries = Object.entries(variable.terms);
  return entries.map(([name, triplet], index) => ({
    name,
    triplet,
    shape: termShape(index, entries.length),
  }));
}

export function memberMF(x: number, triplet: Triplet, shape: TermShape = "triangle"): number {
  const [lowval, midval, highval] = triplet;

  if (shape === "left") {
    if (x > highval) return 0;
    if (x > midval) return (highval - x) / (highval - midval);
    return 1;
  }

  if (shape === "right") {
    if (x < lowval) return 0;
    if (x < midval) return (x - lowval) / (midval - lowval);
    return 1;
  }

  if (x < lowval || x > highval) return 0;
  if (x === midval) return 1;
  if (x < midval) return (x - lowval) / (midval - lowval);
  return (highval - x) / (highval - midval);
}

export function triangularMF(x: number, triplet: Triplet): number {
  return memberMF(x, triplet, "triangle");
}

export function fuzzify(x: number, variable: FuzzyVariable): Record<string, number> {
  const crisp = clamp(x, variable.universe);
  const degrees: Record<string, number> = {};
  for (const { name, triplet, shape } of orderedTerms(variable)) {
    degrees[name] = memberMF(crisp, triplet, shape);
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
  shape: TermShape = "triangle",
): number {
  const fired = clamp(mu, { min: 0, max: 1, step: 0 });

  if (shape === "left") {
    const xMu = highval - fired * (highval - midval);
    return fired * ((highval + xMu) / 2 - lowval);
  }

  if (shape === "right") {
    const xMu = lowval + fired * (midval - lowval);
    return fired * (highval - (xMu + lowval) / 2);
  }

  const base = (highval - lowval) / 2;
  return base * (2 * fired - fired * fired);
}

export function termCentroid(
  lowval: number,
  midval: number,
  highval: number,
  shape: TermShape = "triangle",
): number {
  if (shape === "left") return (lowval + midval) / 2;
  if (shape === "right") return (midval + highval) / 2;
  return midval;
}

export function defuzzify(
  strengths: Record<string, number>,
  output: FuzzyVariable,
): number {
  let weighted = 0;
  let totalArea = 0;
  for (const { name, triplet, shape } of orderedTerms(output)) {
    const [lowval, midval, highval] = triplet;
    const area = termArea(lowval, midval, highval, strengths[name] ?? 0, shape);
    weighted += termCentroid(lowval, midval, highval, shape) * area;
    totalArea += area;
  }
  if (totalArea === 0) return 0;
  return weighted / totalArea;
}

export function aggregate(fired: FiredRule[], output: FuzzyVariable): AggregatedPoint[] {
  const terms = new Map(orderedTerms(output).map((term) => [term.name, term]));
  const { min, max, step } = output.universe;
  const count = Math.round((max - min) / step);
  const points: AggregatedPoint[] = [];
  for (let i = 0; i <= count; i++) {
    const x = min + i * step;
    let mu = 0;
    for (const { rule, strength } of fired) {
      if (rule.consequent.variable !== output.name) continue;
      const term = terms.get(rule.consequent.term);
      if (!term) continue;
      const clipped = Math.min(strength, memberMF(x, term.triplet, term.shape));
      if (clipped > mu) mu = clipped;
    }
    points.push({ x, mu });
  }
  return points;
}

export function classify(risk: number, output: FuzzyVariable): string {
  let term = "";
  let best = -1;
  for (const { name, triplet, shape } of orderedTerms(output)) {
    const degree = memberMF(risk, triplet, shape);
    if (degree > best) {
      best = degree;
      term = name;
    }
  }
  return term;
}

export function inferFloodRisk(rainfallValue: number, riverLevelValue: number): FloodRiskResult {
  const degrees: Record<string, Record<string, number>> = {
    [rainfall.name]: fuzzify(rainfallValue, rainfall),
    [riverLevel.name]: fuzzify(riverLevelValue, riverLevel),
  };
  const fired = evaluateRules(degrees, rules);
  const strengths = termStrengths(fired, floodRisk);
  const risk = defuzzify(strengths, floodRisk);
  const classification = classify(risk, floodRisk);
  const advisory = advisories[classification] ?? { label: classification, color: "Green" };
  return {
    risk,
    advisory: { label: advisory.label, color: advisory.color },
    firedRules: fired.filter(({ strength }) => strength > 0),
    aggregated: aggregate(fired, floodRisk),
  };
}
