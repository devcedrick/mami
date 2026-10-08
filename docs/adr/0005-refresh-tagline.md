---
status: accepted
tags: [adr]
---

# ADR 0005 — Refresh the header tagline

- **Date:** 2026-10-05

## Context

ADR-0002 set the header tagline to "Flood risk advisory — keep an eye on the river." and the
app is, in fact, a **flood-risk** tool — the river is only the calibration source. The tagline
also read as descriptive rather than catchy, and the app is aimed at the general public
(ADR-0002). The ADR-0002 text is `accepted` and therefore frozen, so it is not edited.

## Decision

- The header tagline becomes **"Stay a step ahead of the flood."** — short, flood-first, and
  public-facing.
- The README opening quote is aligned to the same line (kept in the mascot's voice:
  `**Mami says:** Stay a step ahead of the flood.`).
- No other copy, logic, or configuration changes.

## Consequences

- `app/page.tsx` header tagline updated; README opening line aligned.
- ADR-0002 remains as historical record; this ADR updates the tagline wording only.
- **TASKS:** no new tasks (covered by T1.7, header/tagline).
- **Files:** `app/page.tsx`, `README.md`, [[CHANGELOG]], [[DECISIONS]], [[HOME]].
