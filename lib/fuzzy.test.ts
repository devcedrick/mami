import { describe, expect, it } from "vitest";
import {
  aggregate,
  clamp,
  classify,
  defuzzify,
  evaluateRules,
  fuzzify,
  inferFloodRisk,
  memberMF,
  orderedTerms,
  termArea,
  termCentroid,
  termShape,
  termStrengths,
  triangularMF,
} from "./fuzzy";
import { floodRisk, rainfall, riverLevel, rules } from "./flood-config";

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

describe("memberMF shoulders", () => {
  it("left shoulder is flat then falls", () => {
    expect(memberMF(0, [0, 7.5, 15], "left")).toBe(1);
    expect(memberMF(7.5, [0, 7.5, 15], "left")).toBe(1);
    expect(memberMF(11.25, [0, 7.5, 15], "left")).toBeCloseTo(0.5, 6);
    expect(memberMF(15, [0, 7.5, 15], "left")).toBe(0);
    expect(memberMF(20, [0, 7.5, 15], "left")).toBe(0);
  });

  it("right shoulder rises then is flat", () => {
    expect(memberMF(20, [20, 30, 60], "right")).toBe(0);
    expect(memberMF(25, [20, 30, 60], "right")).toBeCloseTo(0.5, 6);
    expect(memberMF(30, [20, 30, 60], "right")).toBe(1);
    expect(memberMF(60, [20, 30, 60], "right")).toBe(1);
  });
});

describe("termShape + orderedTerms", () => {
  it("marks the first and last terms as shoulders, inner terms as triangles", () => {
    expect(termShape(0, 3)).toBe("left");
    expect(termShape(1, 3)).toBe("triangle");
    expect(termShape(2, 3)).toBe("right");
    expect(orderedTerms(floodRisk).map((t) => t.shape)).toEqual([
      "left",
      "triangle",
      "triangle",
      "right",
    ]);
  });
});

describe("flood-config integrity", () => {
  it("every triplet is strictly increasing (a < b < c)", () => {
    for (const variable of [rainfall, riverLevel, floodRisk]) {
      for (const triplet of Object.values(variable.terms)) {
        expect(triplet[0]).toBeLessThan(triplet[1]);
        expect(triplet[1]).toBeLessThan(triplet[2]);
      }
    }
  });
});

describe("fuzzify", () => {
  it("returns a DOM for every term and clamps out-of-universe input first", () => {
    const degrees = fuzzify(2, rainfall);
    expect(Object.keys(degrees).sort()).toEqual(["Heavy", "Light", "Moderate"]);
    expect(degrees.Light).toBe(1);
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
    expect(strengths.Forced).toBeCloseTo(1, 6);
    expect(strengths.Evacuate).toBeCloseTo(0.333, 3);
    expect(strengths.Normal).toBe(0);
    expect(strengths.Prepare).toBe(0);
  });
});

describe("termArea + termCentroid", () => {
  it("triangles match the slide formula", () => {
    expect(termCentroid(30, 47.5, 65, "triangle")).toBe(47.5);
    expect(termArea(30, 47.5, 65, 0.3055, "triangle")).toBeCloseTo(9.0596, 3);
    expect(termArea(60, 75, 100, 0.2945, "triangle")).toBeCloseTo(10.0449, 3);
  });

  it("shoulders use the plateau midpoint and clipped area", () => {
    expect(termCentroid(0, 12.5, 37.5, "left")).toBe(6.25);
    expect(termCentroid(62.5, 87.5, 100, "right")).toBe(93.75);
    expect(termArea(0, 12.5, 37.5, 0, "left")).toBe(0);
    expect(termArea(0, 12.5, 37.5, 1, "left")).toBeCloseTo(25, 6);
    expect(termArea(62.5, 87.5, 100, 1, "right")).toBeCloseTo(25, 6);
  });
});

describe("defuzzify", () => {
  it("returns the area-weighted centroid and guards the empty case", () => {
    expect(defuzzify({ Normal: 0, Prepare: 0, Evacuate: 0, Forced: 0 }, floodRisk)).toBe(0);
    expect(defuzzify({ Normal: 1, Prepare: 0, Evacuate: 0, Forced: 0 }, floodRisk)).toBeCloseTo(6.25, 6);
    expect(defuzzify({ Normal: 0, Prepare: 1, Evacuate: 0, Forced: 0 }, floodRisk)).toBeCloseTo(37.5, 6);
    expect(defuzzify({ Normal: 0, Prepare: 0, Evacuate: 0, Forced: 1 }, floodRisk)).toBeCloseTo(93.75, 6);
  });

  it("reproduces the slide worked example for triangles", () => {
    const areaModerate = termArea(30, 47.5, 65, 0.3055, "triangle");
    const areaHigh = termArea(60, 75, 100, 0.2945, "triangle");
    const centroid = (47.5 * areaModerate + 75 * areaHigh) / (areaModerate + areaHigh);
    expect(centroid).toBeCloseTo(61.9591, 2);
  });
});

describe("classify", () => {
  it("picks the output term with the highest DOM at the risk value", () => {
    expect(classify(6.25, floodRisk)).toBe("Normal");
    expect(classify(30, floodRisk)).toBe("Prepare");
    expect(classify(70, floodRisk)).toBe("Evacuate");
    expect(classify(93.75, floodRisk)).toBe("Forced");
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
    { rain: 2, river: 12.8, risk: 6.25, advisory: "Normal / monitor" },
    { rain: 22, river: 15, risk: 44.7, advisory: "Prepare" },
    { rain: 35, river: 18, risk: 82.6, advisory: "Forced evacuation" },
    { rain: 60, river: 21.5, risk: 93.75, advisory: "Forced evacuation" },
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
    const prepare = result.firedRules.find((f) => f.rule.consequent.term === "Prepare");
    const evacuate = result.firedRules.find((f) => f.rule.consequent.term === "Evacuate");
    expect(prepare?.strength).toBeCloseTo(0.667, 3);
    expect(evacuate?.strength).toBeCloseTo(0.2, 3);

    const forced = inferFloodRisk(60, 21.5);
    expect(forced.firedRules).toHaveLength(1);
    expect(forced.firedRules[0].rule.consequent.term).toBe("Forced");
    expect(forced.firedRules[0].strength).toBeCloseTo(1, 3);
  });
});
