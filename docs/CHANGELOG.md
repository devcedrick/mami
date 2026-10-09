---
status: living
tags: [changelog, releases]
---

# Changelog

Entries state **what** changed; `[ADR-XXXX]` references carry **why**.

## [Unreleased]

## [0.2.0] - 2026-10-09

### Added

- Aggregated output chart (`AggregatedOutputChart`, T2.1/FR-6.3): filled combined-membership area with a vertical Flood Risk Index reference line, downsampled for rendering and wired into the "See how this was decided" disclosure.
- ADR-0004 ([[0004-four-term-output]]): four advisory-aligned output terms (`Normal/Prepare/Evacuate/Forced`) with output-classification advisory.
- ADR-0003 ([[0003-shoulder-membership-functions]]): shoulders on extreme terms with strict `a<b<c` triplets and shape-aware defuzzification.
- ADR-0002 ([[0002-public-first-dashboard]]): public-first dashboard with opt-in decision transparency.
- Implemented the pure Mamdani engine in `lib/fuzzy.ts` (Phase 0, T0.1–T0.6): `clamp`, `triangularMF` (DOM), `fuzzify`, `evaluateRules`, `termStrengths`, `termArea`, `termCentroid`, `defuzzify`, `aggregate`, and `inferFloodRisk`.
- Added `lib/fuzzy.test.ts` — 13 tests covering the four README vectors, fired-rule strengths, the ADR-0001 slide worked example, and guards.

### Changed

- Header tagline is now **"Stay a step ahead of the flood."** (ADR-0005, [[0005-refresh-tagline]]); README opening aligned.
- The output now has four advisory-aligned terms (`Normal [0,12.5,37.5]`, `Prepare [12.5,37.5,62.5]`, `Evacuate [37.5,62.5,87.5]`, `Forced [62.5,87.5,100]`) with `0.5` crossovers at `25/50/75`, and the 9 rules conclude on them (ADR-0004). The advisory is now the output classification (`classify(risk)` argmax); re-derived vectors to `6.25 / 44.7 / 82.6 / 93.75`.
- Membership functions now render as a single chart per variable overlaying all of its terms, with a legend and a themed, high-contrast tooltip (fixes the unreadable default tooltip).
- Extreme membership terms are now **shoulders** (`Light (0,7.5,15)`, `Heavy (20,30,60)`, `Low (10,12.8,15)`, `Critical (16,18,22)`, output `Low (0,25,50)`, `High (50,75,100)`) and every triplet is strictly increasing (ADR-0003); defuzzification uses each term's clipped area and plateau-midpoint centroid.
- Re-derived the README/test vectors to `12.5 / 56.6 / 87.5 / 87.5`; the slides' worked example is retained as a triangle-only check.
- Reorganized the dashboard to be public-first (ADR-0002): the default view shows the header, inputs, and risk result; fuzzification, fired rules, and membership functions moved behind a "See how this was decided" disclosure.
- Replaced the "Marikina River (Sto. Niño gauge)" header subtitle with a plain-language tagline; calibration stays in docs/metadata.
- Aligned fuzzification and defuzzification to ADR-0001 ([[0001-slide-mamdani-defuzzification]]): explicit three-branch Degree of Membership; area-weighted output-term centroid `Area_i = a_i(2μ_i−μ_i²)`, `Centroid_i = midval_i`, `Centroid_v = Σ(Centroid_i·Area_i)/Σ(Area_i)` with a `ΣArea_i == 0 → 0` guard.
- Advisory is defined as the classification (risk-range lookup); no separate classification field.
- Updated README test vectors to `0.0 / 52.6 / 100.0 / 100.0`; `aggregate` sampled set is now chart-only.
- Refreshed [[DATA_MODEL]], [[REQUIREMENTS]], [[ARCHITECTURE]], [[PROJECT]], [[UI_GUIDELINES]], and [[TASKS]].

## [0.1.0] - 2026-10-05

### Added

- Scaffolded Next.js 16 App Router project (TypeScript, Tailwind CSS v4, Recharts, Vitest).
- `lib/flood-config.ts` — universes, terms, 9 rules, and advisory thresholds for the Marikina Sto. Niño calibration.
- `lib/fuzzy.ts` — Mamdani engine function signatures (stubs) and `FloodRiskResult` contract.
- `components/` — `InputSlider`, `FuzzificationPanel`, `FiredRulesTable`, `AggregatedOutputChart`, `MembershipFunctionsSection`, `RiskResult` (placeholder implementations).
- Single dashboard route `app/page.tsx`; root layout metadata; Vitest config with `@/` alias.
- `docs/` vault — [[PROJECT]], [[REQUIREMENTS]], [[DATA_MODEL]], [[ARCHITECTURE]], [[TASKS]], [[UI_GUIDELINES]], [[HOME]], [[DECISIONS]], and ADR template.
- Verification baseline: `npm test`, `npm run lint`, `npm run build` pass.

[Unreleased]: #
