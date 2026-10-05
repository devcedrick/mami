import { describe, expect, it } from "vitest";
import {
  aggregate,
  clamp,
  defuzzify,
  evaluateRules,
  fuzzify,
  inferFloodRisk,
  termArea,
  termCentroid,
  termStrengths,
  triangularMF,
} from "./fuzzy";
import { floodRisk, rainfall, riverLevel, rules, type FuzzyVariable } from "./flood-config";

describe("clamp", () => {
  it("bounds inputs to the universe and guards non-finite values", () => {
    expect(clamp(-5, rainfall.universe)).toBe(0);
    expect(clamp(99, rainfall.universe)).toBe(60);
    expect(clamp(14, riverLevel.universe)).toBe(14);
    expect(clamp(Number.NaN, rainfall.universe)).toBe(0);
    expect(clamp(Number.POSITIVE_INFINITY, riverLevel.universe)).toBe(22);
  });
});

describe("triangularMF (Degree of Membership)", () => {
  it("returns 1 at midval and 0 outside [lowval, highval]", () => {
    expect(triangularMF(0, [0, 0, 50])).toBe(1);
    expect(triangularMF(100, [50, 100, 100])).toBe(1);
    expect(triangularMF(-1, [0, 0, 50])).toBe(0);
    expect(triangularMF(60, [0, 0, 50])).toBe(0);
  });

  it("interpolates linearly on both slopes", () => {
    expect(triangularMF(25, [0, 0, 50])).toBeCloseTo(0.5, 6);
    expect(triangularMF(75, [50, 100, 100])).toBeCloseTo(0.5, 6);
    expect(triangularMF(10, [0, 20, 40])).toBeCloseTo(0.5, 6);
    expect(triangularMF(30, [0, 20, 40])).toBeCloseTo(0.5, 6);
  });
});

describe("fuzzify", () => {
  it("returns a DOM for every term and clamps out-of-universe input first", () => {
    const degrees = fuzzify(2, rainfall);
    expect(Object.keys(degrees).sort()).toEqual(["Heavy", "Light", "Moderate"]);
    expect(degrees.Light).toBeCloseTo(0.8667, 4);
    expect(degrees.Moderate).toBe(0);
    expect(degrees.Heavy).toBe(0);

    expect(fuzzify(999, rainfall).Heavy).toBe(1);
  });
});

describe("evaluateRules + termStrengths", () => {
  it("applies AND = min and collapses shared consequents by max", () => {
    const degrees = {
      [rainfall.name]: fuzzify(35, rainfall),
      [riverLevel.name]: fuzzify(18, riverLevel),
    };
    const fired = evaluateRules(degrees, rules);
    expect(fired).toHaveLength(9);

    const strengths = termStrengths(fired, floodRisk);
    expect(strengths.High).toBeCloseTo(0.333, 3);
    expect(strengths.Low).toBe(0);
    expect(strengths.Moderate).toBe(0);
  });
});

describe("termArea + termCentroid", () => {
  it("uses a = (highval - lowval) / 2 and the midval as centroid", () => {
    expect(termCentroid(30, 47.5, 65)).toBe(47.5);
    expect(termArea(30, 47.5, 65, 0.3055)).toBeCloseTo(9.0596, 3);
    expect(termArea(60, 75, 100, 0.2945)).toBeCloseTo(10.0449, 3);
    expect(termArea(0, 0, 50, 0)).toBe(0);
  });
});

describe("defuzzify", () => {
  it("returns the area-weighted centroid and guards the empty case", () => {
    const output: FuzzyVariable = {
      name: "Classification",
      universe: { min: 0, max: 100, step: 0.01 },
      terms: {
        "Not Infected": [0, 17.5, 35],
        "Moderately Infected": [30, 47.5, 65],
        "Highly Infected": [60, 75, 100],
      },
    };
    const strengths = {
      "Not Infected": 0,
      "Moderately Infected": 0.3055,
      "Highly Infected": 0.2945,
    };
    expect(defuzzify(strengths, output)).toBeCloseTo(61.9591, 2);
    expect(defuzzify({ Low: 0, Moderate: 0, High: 0 }, floodRisk)).toBe(0);
  });
});

describe("aggregate", () => {
  it("samples the combined output set ascending over the universe", () => {
    const fired = evaluateRules(
      {
        [rainfall.name]: fuzzify(60, rainfall),
        [riverLevel.name]: fuzzify(21.5, riverLevel),
      },
      rules,
    );
    const points = aggregate(fired, floodRisk);
    expect(points).toHaveLength(10001);
    expect(points[0].x).toBeCloseTo(0, 10);
    expect(points[points.length - 1].x).toBeCloseTo(100, 6);
    for (const { x, mu } of [points[0], points[5000], points[points.length - 1]]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(mu).toBeGreaterThanOrEqual(0);
      expect(mu).toBeLessThanOrEqual(1);
    }
  });
});

describe("inferFloodRisk vectors", () => {
  const cases = [
    { rain: 2, river: 12.8, risk: 0.0, advisory: "Normal / monitor" },
    { rain: 22, river: 15, risk: 52.6, advisory: "Evacuate" },
    { rain: 35, river: 18, risk: 100.0, advisory: "Forced evacuation" },
    { rain: 60, river: 21.5, risk: 100.0, advisory: "Forced evacuation" },
  ];

  for (const { rain, river, risk, advisory } of cases) {
    it(`(${rain}, ${river}) -> ${risk}`, () => {
      const result = inferFloodRisk(rain, river);
      expect(result.risk).toBeCloseTo(risk, 1);
      expect(result.advisory.label).toBe(advisory);
    });
  }

  it("reports fired rules with their strengths", () => {
    const result = inferFloodRisk(22, 15);
    const moderate = result.firedRules.find((f) => f.rule.consequent.term === "Moderate");
    const high = result.firedRules.find((f) => f.rule.consequent.term === "High");
    expect(moderate?.strength).toBeCloseTo(0.667, 3);
    expect(high?.strength).toBeCloseTo(0.05, 3);

    const forced = inferFloodRisk(60, 21.5);
    expect(forced.firedRules).toHaveLength(1);
    expect(forced.firedRules[0].strength).toBeCloseTo(0.917, 3);
  });
});
