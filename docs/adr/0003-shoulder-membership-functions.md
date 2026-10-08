---
status: accepted
tags: [adr]
---

# ADR 0003 — Shoulder membership functions with strict triplets

- **Date:** 2026-10-05

## Context

The extreme terms were degenerate right-angled triangles (`Light [0,0,15]`, `Heavy [20,60,60]`,
`Low [10,10,15]`, `Critical [16,22,22]`, output `Low [0,0,50]`, `High [50,100,100]`). On the
MF plots they showed a spike at the domain edge instead of a **shoulder**, and the triplets
violated the intended strict increase (`a < b < c`). Calibration also needed to follow the
documented warning levels (PAGASA rainfall yellow/orange/red `7.5/15/30 mm/hr`; Marikina River
normal `12.8 m`, prepare `15 m`, evacuate `16 m`, forced `18 m`).

## Decision

- Extreme terms become **shoulders**, resolved by position: the **first** term of each variable
  is a left shoulder (`MF=1` on `[lowval, midval]`, falling to `0` at `highval`), the **last** is
  a right shoulder (rising from `lowval` to `midval`, `MF=1` to `highval`), and middle terms stay
  triangles. Every triplet must satisfy `lowval < midval < highval`.
- Values are anchored to the guidelines: Rainfall `Light (0,7.5,15)`, `Heavy (20,30,60)`; River
  `Low (10,12.8,15)`, `Critical (16,18,22)`; FloodRisk `Low (0,25,50)`, `High (50,75,100)`.
- Defuzzification is generalized for shoulders: `Centroid_i` is the **plateau midpoint**
  (triangle `midval`, left `(lowval+midval)/2`, right `(midval+highval)/2`), and `Area_i` is the
  clipped area of the term's shape. This supersedes ADR-0001's triangle-only output shapes.

## Consequences

- New engine surface: `termShape`, `orderedTerms`, `memberMF`; `termArea`/`termCentroid`/`defuzzify`/`aggregate`/`fuzzify` are shape-aware. `triangularMF` is retained for triangle-only checks.
- The four README vectors become `12.5 / 56.6 / 87.5 / 87.5` (`[[TASKS]]` T4.1); the slides'
  worked example remains valid as a **triangle-only** formula check.
- **TASKS:** T0.7 (shoulder config), T0.8 (shape-aware engine), T1.9 (shoulder plots).
- **Files:** `lib/flood-config.ts`, `lib/fuzzy.ts`, `lib/fuzzy.test.ts`, `components/MembershipFunctionsSection.tsx`, `README.md`, [[DATA_MODEL]], [[REQUIREMENTS]], [[ARCHITECTURE]], [[PROJECT]], [[UI_GUIDELINES]], [[TASKS]], [[CHANGELOG]].
