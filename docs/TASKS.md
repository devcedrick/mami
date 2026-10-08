---
status: draft
tags: [tasks, build-order]
---

# Mami — Tasks

Build order and done-criteria only. Logic and shapes live in [[DATA_MODEL]]; requirements
are owned by [[REQUIREMENTS]]. Each box cites its FR/C and a done-check.

## Phase 0 — Data foundation (no UI)

- [x] T0.1 `lib/flood-config.ts` — universes, terms, rules, advisories per [[DATA_MODEL]] §2/§4 (FR-2.2, FR-3.1, FR-6.2). Done: exports type-check and match the README tables (`[lowval midval highval]`).
- [x] T0.2 `lib/fuzzy.ts` `clamp` + `triangularMF` — Degree of Membership per [[DATA_MODEL]] §5 / ADR-0001 (FR-1.3, FR-2.1). Done: `1` at `midval`, `0` outside `[lowval, highval]`, no division by zero on edge terms.
- [x] T0.3 `lib/fuzzy.ts` `fuzzify` — DOM per term (FR-2.2). Done: degrees in `[0,1]`, out-of-universe input clamped first.
- [x] T0.4 `lib/fuzzy.ts` `evaluateRules` + `termStrengths` — `AND = min`, optional `OR = max`; `μ_i = max` per output term (FR-3.1, FR-3.2). Done: all 9 rules evaluated; exactly one μ per output term.
- [x] T0.5 `lib/fuzzy.ts` `termArea` + `termCentroid` + `defuzzify` — `Area_i = a_i(2μ_i − μ_i²)`, `Centroid_i = midval_i`, `Centroid_v = Σ(midval_i·Area_i)/Σ(Area_i)` (FR-5.1–FR-5.3). Done: `ΣArea_i == 0` returns `0`, never NaN.
- [x] T0.5b `lib/fuzzy.ts` `aggregate` — clip/max, sample `0.01`, chart only (FR-4.1). Done: ascending `AggregatedPoint[]`; not used by `defuzzify`.
- [x] T0.6 `lib/fuzzy.ts` `inferFloodRisk` — compose stages + advisory lookup (FR-6.2). Done: returns a complete `FloodRiskResult`.
- [x] T0.7 `lib/flood-config.ts` — shoulder extremes + strict `lowval < midval < highval` per ADR-0003/C-10 (FR-2.1). Done: every triplet is strictly increasing; extremes are shoulders.
- [x] T0.8 `lib/fuzzy.ts` — shape-aware `memberMF`/`termArea`/`termCentroid`/`defuzzify`/`aggregate` (FR-2.1, FR-5.1–FR-5.3). Done: shapes resolved by position; triangle formula preserved.
- [x] T0.9 `lib/flood-config.ts` — four advisory-aligned output terms + re-mapped 9 rule consequents (ADR-0004, C-10). Done: `Normal/Prepare/Evacuate/Forced`; adjacent terms cross at `μ=0.5` at `25/50/75`.
- [x] T0.10 `lib/fuzzy.ts` — `classify(risk, output)` argmax; `inferFloodRisk` derives the advisory from it (FR-6.2). Done: advisory label matches the dominant output term.

## Phase 1 — Read views on seeded data

- [x] T1.1 `components/InputSlider.tsx` — labelled range + number input, clamped (FR-1.1, FR-1.2, FR-1.4). Done: keyboard and drag both update; invalid text keeps last valid value.
- [x] T1.2 `components/FuzzificationPanel.tsx` (FR-2.3). Done: shows every term degree including zeros.
- [x] T1.3 `components/FiredRulesTable.tsx` (FR-3.3). Done: only strengths `> 0` listed; empty state shown.
- [x] T1.4 `components/RiskResult.tsx` (FR-6.1, FR-6.2). Done: one-decimal risk + advisory label/color.
- [x] T1.5 `components/MembershipFunctionsSection.tsx` (FR-7.1). Done: one MF plot per term for all variables.
- [x] T1.6 `app/page.tsx` — own state, call `inferFloodRisk`, wire all panels (FR-1.3, FR-6.3). Done: changing either input updates every panel with no submit step.
- [x] T1.7 `app/page.tsx` — public-first header: name + friendly tagline, remove the calibration subtitle (FR-9.3). Done: header shows the app name and tagline only.
- [x] T1.8 `app/page.tsx` — accessible `<details>` disclosure wrapping the FIS internals (FR-9.1, FR-9.2, NFR-8). Done: default view hides the panels; expanding reveals fuzzification, fired rules, and MF plots.
- [x] T1.9 `components/MembershipFunctionsSection.tsx` — render shoulders (ADR-0003). Done: extreme terms are flat at `MF=1` over the plateau.

## Phase 2 — Aggregated output

- [ ] T2.1 `components/AggregatedOutputChart.tsx` — Recharts plot with centroid line (FR-6.3). Done: curve matches `aggregated`; centroid marker at `risk`.

## Phase 3 — Mascot + side effects

- [ ] T3.1 `components/Mami.tsx` — color/label follow advisory (FR-8.1, FR-8.2). Done: all four advisory colors render, text matches label.
- [ ] T3.2 Wire Mami into `app/page.tsx`. Done: mascot updates with risk.

## Phase 4 — Verification + hardening

- [x] T4.1 `lib/fuzzy.test.ts` — Vitest vectors within `±0.1` (C-8): `(2,12.8)→6.25`, `(22,15)→44.7`, `(35,18)→82.6`, `(60,21.5)→93.75`. Done: all pass.
- [x] T4.2 Fired-rules assertions per vector (README): e.g. `(60,21.5)` → Heavy+Critical Forced `(1.0)`. Done: strengths match.
- [x] T4.3 NFR sweep — `npm test`, `npm run lint`, `npm run build` (C-5, NFR-1..7). Done: all green; no network calls, no stored data.
- [x] T4.4 Slides worked-example test (ADR-0001, triangle-only per ADR-0003): DOM `0.8842 / 0.2945 / 0.3055`; triangle `Area 9.0596 / 10.0449` → `Centroid_v 61.9591` ([[DATA_MODEL]] §6). Done: `triangularMF`/`termArea(...,"triangle")` reproduce the numbers.

## Out of scope for this list

Deferred work is listed in [[REQUIREMENTS]] §4: live sensor/API ingestion, persistence,
notifications, i18n, historical analytics, server-side inference, `OR` rules.
