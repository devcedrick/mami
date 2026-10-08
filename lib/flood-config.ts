export type Triplet = readonly [number, number, number];

export interface Universe {
  min: number;
  max: number;
  step: number;
}

export interface FuzzyVariable {
  name: string;
  universe: Universe;
  terms: Record<string, Triplet>;
}

export type Connective = "AND" | "OR";

export interface FuzzyRule {
  id: number;
  antecedent: { variable: string; term: string }[];
  connective: Connective;
  consequent: { variable: string; term: string };
}

export const rainfall: FuzzyVariable = {
  name: "Rainfall",
  universe: { min: 0, max: 60, step: 0.01 },
  terms: {
    Light: [0, 7.5, 15],
    Moderate: [7.5, 20, 33],
    Heavy: [20, 30, 60],
  },
};

export const riverLevel: FuzzyVariable = {
  name: "RiverLevel",
  universe: { min: 10, max: 22, step: 0.01 },
  terms: {
    Low: [10, 12.8, 15],
    Elevated: [13, 16, 19],
    Critical: [16, 18, 22],
  },
};

export const floodRisk: FuzzyVariable = {
  name: "FloodRisk",
  universe: { min: 0, max: 100, step: 0.01 },
  terms: {
    Normal: [0, 12.5, 37.5],
    Prepare: [12.5, 37.5, 62.5],
    Evacuate: [37.5, 62.5, 87.5],
    Forced: [62.5, 87.5, 100],
  },
};

export const rules: FuzzyRule[] = [
  {
    id: 1,
    antecedent: [
      { variable: "Rainfall", term: "Light" },
      { variable: "RiverLevel", term: "Low" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Normal" },
  },
  {
    id: 2,
    antecedent: [
      { variable: "Rainfall", term: "Light" },
      { variable: "RiverLevel", term: "Elevated" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Normal" },
  },
  {
    id: 3,
    antecedent: [
      { variable: "Rainfall", term: "Light" },
      { variable: "RiverLevel", term: "Critical" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Prepare" },
  },
  {
    id: 4,
    antecedent: [
      { variable: "Rainfall", term: "Moderate" },
      { variable: "RiverLevel", term: "Low" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Normal" },
  },
  {
    id: 5,
    antecedent: [
      { variable: "Rainfall", term: "Moderate" },
      { variable: "RiverLevel", term: "Elevated" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Prepare" },
  },
  {
    id: 6,
    antecedent: [
      { variable: "Rainfall", term: "Moderate" },
      { variable: "RiverLevel", term: "Critical" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Evacuate" },
  },
  {
    id: 7,
    antecedent: [
      { variable: "Rainfall", term: "Heavy" },
      { variable: "RiverLevel", term: "Low" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Prepare" },
  },
  {
    id: 8,
    antecedent: [
      { variable: "Rainfall", term: "Heavy" },
      { variable: "RiverLevel", term: "Elevated" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Evacuate" },
  },
  {
    id: 9,
    antecedent: [
      { variable: "Rainfall", term: "Heavy" },
      { variable: "RiverLevel", term: "Critical" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Forced" },
  },
];

export const advisories: Record<string, { label: string; color: string }> = {
  Normal: { label: "Normal / monitor", color: "Green" },
  Prepare: { label: "Prepare", color: "Yellow" },
  Evacuate: { label: "Evacuate", color: "Orange" },
  Forced: { label: "Forced evacuation", color: "Red" },
};
