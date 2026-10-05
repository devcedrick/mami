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
    Light: [0, 0, 15],
    Moderate: [7.5, 20, 33],
    Heavy: [20, 60, 60],
  },
};

export const riverLevel: FuzzyVariable = {
  name: "RiverLevel",
  universe: { min: 10, max: 22, step: 0.01 },
  terms: {
    Low: [10, 10, 15],
    Elevated: [13, 16, 19],
    Critical: [16, 22, 22],
  },
};

export const floodRisk: FuzzyVariable = {
  name: "FloodRisk",
  universe: { min: 0, max: 100, step: 0.01 },
  terms: {
    Low: [0, 0, 50],
    Moderate: [0, 50, 100],
    High: [50, 100, 100],
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
    consequent: { variable: "FloodRisk", term: "Low" },
  },
  {
    id: 2,
    antecedent: [
      { variable: "Rainfall", term: "Light" },
      { variable: "RiverLevel", term: "Elevated" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Low" },
  },
  {
    id: 3,
    antecedent: [
      { variable: "Rainfall", term: "Light" },
      { variable: "RiverLevel", term: "Critical" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Moderate" },
  },
  {
    id: 4,
    antecedent: [
      { variable: "Rainfall", term: "Moderate" },
      { variable: "RiverLevel", term: "Low" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Low" },
  },
  {
    id: 5,
    antecedent: [
      { variable: "Rainfall", term: "Moderate" },
      { variable: "RiverLevel", term: "Elevated" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Moderate" },
  },
  {
    id: 6,
    antecedent: [
      { variable: "Rainfall", term: "Moderate" },
      { variable: "RiverLevel", term: "Critical" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "High" },
  },
  {
    id: 7,
    antecedent: [
      { variable: "Rainfall", term: "Heavy" },
      { variable: "RiverLevel", term: "Low" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "Moderate" },
  },
  {
    id: 8,
    antecedent: [
      { variable: "Rainfall", term: "Heavy" },
      { variable: "RiverLevel", term: "Elevated" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "High" },
  },
  {
    id: 9,
    antecedent: [
      { variable: "Rainfall", term: "Heavy" },
      { variable: "RiverLevel", term: "Critical" },
    ],
    connective: "AND",
    consequent: { variable: "FloodRisk", term: "High" },
  },
];

export const advisories = [
  { max: 25, label: "Normal / monitor", color: "Green" },
  { max: 50, label: "Prepare", color: "Yellow" },
  { max: 75, label: "Evacuate", color: "Orange" },
  { max: Infinity, label: "Forced evacuation", color: "Red" },
] as const;
