---
status: accepted
tags: [adr]
---

# ADR 0004 — Four-term advisory-aligned output

- **Date:** 2026-10-05

## Context

ADR-0003 gave the output three terms (`Low/Moderate/High`), but Mami defines **four** advisory
levels (`<25` Normal/monitor, `25–50` Prepare, `50–75` Evacuate, `>=75` Forced evacuation). The
middle term `Moderate (0,50,100)` was a full-domain catch-all, and `Low`/`High` spanned half the
universe — the linguistic output could not represent the four advisories, and the terms were
broader than the input terms.

## Decision

- The output has **four advisory-aligned terms**: `Normal [0,12.5,37.5]` (left shoulder),
  `Prepare [12.5,37.5,62.5]`, `Evacuate [37.5,62.5,87.5]` (triangles), `Forced [62.5,87.5,100]`
  (right shoulder). Adjacent terms cross at `μ=0.5` exactly at `25 / 50 / 75`.
- The 9 rules conclude on the new terms (monotonic shift): Light row `Normal/Normal/Prepare`;
  Moderate row `Normal/Prepare/Evacuate`; Heavy row `Prepare/Evacuate/Forced`.
- The advisory is the **output classification**: `classify(risk)` evaluates the DOM of
  `Centroid_v` in each output term (shape-aware) and returns the argmax. This adopts the slides'
  classification step (previously excluded). `advisories` becomes a `term -> {label,color}` map
  instead of a risk-range array.

## Consequences

- New engine helper `classify(risk, output)`; `inferFloodRisk` derives `advisory` from it.
- The four README/test vectors become `6.25 / 44.7 / 82.6 / 93.75` ([[TASKS]] T4.1).
- **TASKS:** T0.9 (4-term output + rules), T0.10 (`classify`).
- **Files:** `lib/flood-config.ts`, `lib/fuzzy.ts`, `lib/fuzzy.test.ts`, `README.md`,
  [[DATA_MODEL]], [[REQUIREMENTS]], [[ARCHITECTURE]], [[PROJECT]], [[UI_GUIDELINES]], [[TASKS]], [[CHANGELOG]].
