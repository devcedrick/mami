---
status: living
tags: [changelog, releases]
---

# Changelog

Entries state **what** changed; `[ADR-XXXX]` references carry **why**.

## [Unreleased]

### Added

- ADR-0002 ([[0002-public-first-dashboard]]): public-first dashboard with opt-in decision transparency.
- Implemented the pure Mamdani engine in `lib/fuzzy.ts` (Phase 0, T0.1–T0.6): `clamp`, `triangularMF` (DOM), `fuzzify`, `evaluateRules`, `termStrengths`, `termArea`, `termCentroid`, `defuzzify`, `aggregate`, and `inferFloodRisk`.
- Added `lib/fuzzy.test.ts` — 13 tests covering the four README vectors, fired-rule strengths, the ADR-0001 slide worked example, and guards.

### Changed

- Reorganized the dashboard to be public-first (ADR-0002): the default view shows the header, inputs, and risk result; fuzzification, fired rules, and membership functions moved behind a "See how this was decided" disclosure.
- Replaced the "Marikina River (Sto. Niño gauge)" header subtitle with the plain-language tagline "Flood risk advisory — keep an eye on the river."; calibration stays in docs/metadata.
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
