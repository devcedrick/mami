---
status: living
tags: [changelog, releases]
---

# Changelog

Entries state **what** changed; `[ADR-XXXX]` references carry **why**.

## [Unreleased]

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
