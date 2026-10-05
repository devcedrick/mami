---
status: draft
tags: [tasks, build-order]
---

# Mami — Tasks

Build order and done-criteria only. Logic and shapes live in [[DATA_MODEL]]; requirements
are owned by [[REQUIREMENTS]]. Each box cites its FR/C and a done-check.

## Phase 0 — Data foundation (no UI)

- [ ] T0.1 `lib/flood-config.ts` — universes, terms, rules, advisories per [[DATA_MODEL]] §2/§4 (FR-2.2, FR-3.1, FR-6.2). Done: exports type-check and match the README tables.
- [ ] T0.2 `lib/fuzzy.ts` `clamp` + `triangularMF` — per [[DATA_MODEL]] §5 (FR-1.3, FR-2.1). Done: edge terms return `1` at `b` and `0` outside `[a,c]` with no division by zero.
- [ ] T0.3 `lib/fuzzy.ts` `fuzzify` — degree per term (FR-2.2). Done: degrees in `[0,1]`, out-of-universe input clamped first.
- [ ] T0.4 `lib/fuzzy.ts` `evaluateRules` — `AND = min`, optional `OR = max` (FR-3.1). Done: all 9 rules evaluated; strengths in `[0,1]`.
- [ ] T0.5 `lib/fuzzy.ts` `aggregate` + `defuzzify` — clip, max, sample `0.01`, centroid, zero-guard (FR-4.1, FR-5.1). Done: `sum(mu)==0` returns `0`, never NaN.
- [ ] T0.6 `lib/fuzzy.ts` `inferFloodRisk` — compose stages + advisory lookup (FR-6.2). Done: returns a complete `FloodRiskResult`.

## Phase 1 — Read views on seeded data

- [ ] T1.1 `components/InputSlider.tsx` — labelled range + number input, clamped (FR-1.1, FR-1.2, FR-1.4). Done: keyboard and drag both update; invalid text keeps last valid value.
- [ ] T1.2 `components/FuzzificationPanel.tsx` (FR-2.3). Done: shows every term degree including zeros.
- [ ] T1.3 `components/FiredRulesTable.tsx` (FR-3.2). Done: only strengths `> 0` listed; empty state shown.
- [ ] T1.4 `components/RiskResult.tsx` (FR-6.1, FR-6.2). Done: one-decimal risk + advisory label/color.
- [ ] T1.5 `components/MembershipFunctionsSection.tsx` (FR-7.1). Done: one MF plot per term for all variables.
- [ ] T1.6 `app/page.tsx` — own state, call `inferFloodRisk`, wire all panels (FR-1.3, FR-6.3). Done: changing either input updates every panel with no submit step.

## Phase 2 — Aggregated output

- [ ] T2.1 `components/AggregatedOutputChart.tsx` — Recharts plot with centroid line (FR-6.3). Done: curve matches `aggregated`; centroid marker at `risk`.

## Phase 3 — Mascot + side effects

- [ ] T3.1 `components/Mami.tsx` — color/label follow advisory (FR-8.1, FR-8.2). Done: all four advisory colors render, text matches label.
- [ ] T3.2 Wire Mami into `app/page.tsx`. Done: mascot updates with risk.

## Phase 4 — Verification + hardening

- [ ] T4.1 `lib/fuzzy.test.ts` — Vitest vectors within `±0.1` (C-8): `(2,12.8)→20.0`, `(22,15)→50.1`, `(35,18)→78.9`, `(60,21.5)→83.2`. Done: all pass.
- [ ] T4.2 Fired-rules assertions per vector (README): e.g. `(60,21.5)` → Heavy+Critical High `(0.917)`. Done: strengths match.
- [ ] T4.3 NFR sweep — `npm test`, `npm run lint`, `npm run build` (C-5, NFR-1..7). Done: all green; no network calls, no stored data.

## Out of scope for this list

Deferred work is listed in [[REQUIREMENTS]] §4: live sensor/API ingestion, persistence,
notifications, i18n, historical analytics, server-side inference, `OR` rules.
