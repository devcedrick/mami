---
status: accepted
tags: [architecture, fis, nextjs]
---

# Mami — Architecture

## 1. Layer overview

```txt
┌───────────────────────────────────────────────┐
│ Route        app/page.tsx  (owns React state) │
│              app/layout.tsx, app/globals.css  │
├───────────────────────────────────────────────┤
│ Components   components/* (presentational)    │
│              InputSlider, FuzzificationPanel,  │
│              FiredRulesTable, AggregatedOutput-│
│              Chart, MembershipFunctionsSection,│
│              RiskResult, Mami*                 │
├───────────────────────────────────────────────┤
│ Engine       lib/fuzzy.ts (pure functions)    │
│              lib/flood-config.ts (data)        │
└───────────────────────────────────────────────┘
```

Rules:

- **Thin route:** `app/page.tsx` holds input state and wiring only; it contains no fuzzy math and no formatting logic.
- **Pure engine:** `lib/fuzzy.ts` is framework-free and side-effect-free — no React, no `window`, no network.
- **Declarative config:** universes, terms, rules, and advisory thresholds live only in `lib/flood-config.ts`.
- **No persistence, no network:** nothing is fetched, written to storage, or sent anywhere.
- **Stubs-first:** `lib/fuzzy.ts` currently returns neutral placeholders; real implementations land per [[TASKS]].

\* `components/Mami.tsx` is planned but not yet created.

## 2. Route map

| File | Title | Reads / writes | FR trace |
| :--- | :---- | :------------- | :------- |
| `app/page.tsx` | Mami dashboard | reads/writes input state; reads `inferFloodRisk`, config vars; writes default view + opt-in advanced disclosure | FR-1.1–FR-9.3 |
| `app/layout.tsx` | Root shell | reads metadata/fonts; writes `<html>/<body>` | — |
| `app/globals.css` | Theme | Tailwind import + `@theme` tokens | NFR-6 |

Gaps (honest): `components/Mami.tsx` does not exist yet; `lib/fuzzy.ts` is stubbed; there
are no tests beyond a `todo`. No other routes are planned.

## 3. Module contracts

### `lib/flood-config.ts`

Declarative FIS data: `rainfall`, `riverLevel`, `floodRisk` variables, the 9-element `rules`
array, and `advisories`. No functions.

```ts
rainfall: FuzzyVariable; riverLevel: FuzzyVariable; floodRisk: FuzzyVariable;
rules: FuzzyRule[]; advisories: readonly { max: number; label: string; color: string }[];
```

### `lib/fuzzy.ts`

The pure Mamdani engine and result contract.

```ts
clamp(x, universe): number
triangularMF(x, triplet): number                       // Degree of Membership, 0–1
fuzzify(x, variable): Record<string, number>
evaluateRules(degrees, ruleSet): FiredRule[]
termStrengths(fired, output): Record<string, number>   // term -> μ_i = max rule strength
termArea(lowval, midval, highval, mu): number          // a(2μ − μ²), a=(high−low)/2
termCentroid(lowval, midval, highval): number          // == midval
defuzzify(strengths, output): number                   // Centroid_v, 0 if ΣArea==0
aggregate(fired, output): AggregatedPoint[]            // chart only
inferFloodRisk(rainfallValue, riverLevelValue): FloodRiskResult
```

### `components/InputSlider.tsx`

Labelled range + number control for one input.

```ts
InputSlider(props: { label; unit?; value; min; max; step; onChange(value): void }): JSX.Element
```

### `components/FuzzificationPanel.tsx`

Renders the membership degree of every term for both inputs.

```ts
FuzzificationPanel(props: { rainfallDegrees: Record<string, number>; riverLevelDegrees: Record<string, number> }): JSX.Element
```

### `components/FiredRulesTable.tsx`

Renders fired rules with `strength > 0`.

```ts
FiredRulesTable(props: { firedRules: FiredRule[] }): JSX.Element
```

### `components/AggregatedOutputChart.tsx`

Recharts area/line of the aggregated set with a centroid reference line. Client component.

```ts
AggregatedOutputChart(props: { aggregated: AggregatedPoint[]; centroid: number }): JSX.Element
```

### `components/MembershipFunctionsSection.tsx`

One triangular MF plot per term of each variable. Client component.

```ts
MembershipFunctionsSection(props: { variables: FuzzyVariable[] }): JSX.Element
```

### `components/RiskResult.tsx`

Crisp risk index plus advisory label/color.

```ts
RiskResult(props: { result: FloodRiskResult }): JSX.Element
```

### `components/Mami.tsx` (planned)

Mascot whose color/label follow `advisory`. Contract TBD — see [[TASKS]] T4.1.

## 4. Data flows

**Flow A — Compute pipeline (primary; runs on every input change).**

1. User moves a control; `components/InputSlider.tsx` calls `onChange(value)`.
2. `app/page.tsx` updates the matching piece of React state.
3. `app/page.tsx` calls `inferFloodRisk(rainfall, riverLevel)` in `lib/fuzzy.ts`.
4. `clamp` bounds each input to its universe from `lib/flood-config.ts`.
5. `fuzzify` + `triangularMF` produce term degrees for both inputs.
6. `evaluateRules` applies `AND = min` across the 9 rules → `FiredRule[]`.
7. `termStrengths` collapses fired rules to one `μ_i` per output term (`max` across rules with that consequent).
8. `termArea` + `termCentroid` compute each fired term's `Area_i = a_i(2μ_i − μ_i²)` and `Centroid_i = midval_i`.
9. `defuzzify` returns `Centroid_v = Σ(midval_i · Area_i) / Σ(Area_i)` (0 when `ΣArea == 0`) → `risk`; `advisory` is looked up from `risk` (the advisory is the classification).
10. Separately, `aggregate` builds the `0–100` chart set (clip/max, sample `0.01`) → `AggregatedPoint[]`.
11. `FloodRiskResult` is stored as derived state and passed to all panels.

Persists: nothing. Each render is derived from current inputs; reload resets to defaults.

**Flow B — Manual/direct write:** N/A (no writes, no persistence).

**Flow C — Reads:** N/A beyond reading the in-memory config; there is no store or fetch.

**Flow D — Side effects (reminders/sync):** N/A by scope (see [[REQUIREMENTS]] §4).

## 5. Cross-cutting concerns

- **Theming:** tokens defined once in `app/globals.css` (`@theme`); advisory colors map 1:1 to `advisories[].color`.
- **Wiring-in-sync:** `app/page.tsx` is the single source of truth; every panel is fed from the same `FloodRiskResult` so they cannot drift.
- **Routing:** single route `/`; sections are in-page anchors, not routes.
- **Error policy:** degrade, never crash — clamp inputs, guard `Σ Area_i == 0`, keep inputs editable, never emit NaN; no silent drops.
- **Formats:** units and thresholds are defined in [[DATA_MODEL]] §1 and enforced in `lib/flood-config.ts`.
- **Verification:** `npm test`, `npm run lint`, `npm run build` must all pass (C-5).

## 6. Traceability (FR → modules)

| FR | Routes | `src/` modules |
| :-- | :----- | :------------- |
| FR-1.1, FR-1.2 | `app/page.tsx` | `components/InputSlider.tsx` |
| FR-1.3, FR-1.4 | `app/page.tsx` | `lib/fuzzy.ts` (`clamp`), `components/InputSlider.tsx` |
| FR-2.1–FR-2.2 | `app/page.tsx` | `lib/fuzzy.ts`, `lib/flood-config.ts` |
| FR-2.3 | `app/page.tsx` | `components/FuzzificationPanel.tsx` |
| FR-3.1, FR-3.2 | `app/page.tsx` | `lib/fuzzy.ts`, `lib/flood-config.ts` |
| FR-3.3 | `app/page.tsx` | `components/FiredRulesTable.tsx` |
| FR-4.1, FR-5.1–FR-5.3 | `app/page.tsx` | `lib/fuzzy.ts` |
| FR-6.1, FR-6.2 | `app/page.tsx` | `components/RiskResult.tsx`, `lib/flood-config.ts` |
| FR-6.3 | `app/page.tsx` | `components/AggregatedOutputChart.tsx` |
| FR-7.1 | `app/page.tsx` | `components/MembershipFunctionsSection.tsx` |
| FR-8.1, FR-8.2 | `app/page.tsx` | `components/Mami.tsx` (planned) |
| FR-9.1–FR-9.3 | `app/page.tsx` | `app/page.tsx` |
