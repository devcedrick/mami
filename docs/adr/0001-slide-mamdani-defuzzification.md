---
status: accepted
tags: [adr]
---

# ADR 0001 — Adopt slide Mamdani DOM and area-weighted defuzzification

- **Date:** 2026-10-05

## Context

The assignment example (`fuzzy-logic-example.pdf`) defines fuzzification with an explicit
three-branch Degree of Membership and defuzzification by clipped-triangle area with
`midval` centroids. The earlier README and [[DATA_MODEL]] instead used a discrete
aggregated-set centroid `Σ(y·μ)/Σ(μ)` over a `0.01`-sampled curve and stated no DOM
equation. These disagree, so `lib/fuzzy.ts` cannot be implemented unambiguously. Relevant
requirements: FR-2.1, FR-4.1, FR-5.1–FR-5.3, FR-6.2; constraints C-6, C-7, C-8.

## Decision

Align Mami to the slide method:

- **DOM** for a term `[lowval midval highval]`: `0` outside `[lowval, highval]`, `1` at
  `midval`, `(input−lowval)/(midval−lowval)` below, `(highval−input)/(highval−midval)`
  above (FR-2.1).
- **Rule fired value** = `min` of antecedent DOMs; per output term `μ_i = max` across rules
  with that consequent (FR-3.1, FR-3.2).
- **Defuzzification:** `a_i = (highval_i−lowval_i)/2`, `Area_i = a_i(2μ_i−μ_i²)`,
  `Centroid_i = midval_i`, `Centroid_v = Σ(Centroid_i·Area_i)/Σ(Area_i)`; `0` when
  `ΣArea_i == 0` (FR-5.1–FR-5.3).
- **Classification = advisory:** `Centroid_v` is mapped through the risk-range `advisories`
  table (FR-6.2). We deliberately do **not** add the slides' separate max-DOM
  classification pass or a second field.
- The `aggregate` `0.01`-sampled set is retained for the chart only (FR-4.1).

## Consequences

- The four README test vectors change: `0.0 / 52.6 / 100.0 / 100.0` (was `20.0 / 50.1 / 78.9 / 83.2`).
- `defuzzify` changes signature; new helpers `termStrengths`, `termArea`, `termCentroid` are required.
- **TASKS to update:** T0.2 (DOM), T0.5 (defuzz), T4.1 (vectors); add a test reproducing the slides' worked example (`0.8842 / 0.2945 / 0.3055`, `Areas 9.0596 / 10.0449`, `Centroid 61.9591`).
- **Files to update:** `lib/fuzzy.ts`, `lib/fuzzy.test.ts`, `README.md`, [[DATA_MODEL]], [[REQUIREMENTS]], [[ARCHITECTURE]], [[TASKS]], [[PROJECT]], [[UI_GUIDELINES]].
