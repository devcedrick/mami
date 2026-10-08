---
status: accepted
tags: [adr]
---

# ADR 0002 — Public-first dashboard with opt-in decision transparency

- **Date:** 2026-10-05

## Context

Mami's end users are primarily the general public (residents near the Marikina River), with
students and educators as a secondary audience ([[PROJECT]]). The dashboard surfaced FIS
internals — fuzzification, fired rules, membership functions — by default, which is
unnecessary for a resident who only needs a reading, and the header carried a technical
calibration subtitle ("Marikina River (Sto. Niño gauge)").

## Decision

- The **default** dashboard shows only the inputs and the risk result. The FIS internals
  (fuzzification, fired rules, membership functions, and the aggregated output chart) sit
  behind a native, keyboard-accessible `<details>` disclosure labelled
  "See how this was decided".
- The header tagline becomes the plain-language "Flood risk advisory — keep an eye on the
  river."; the Marikina calibration stays in docs, README, and metadata, not the visible UI.
- No engine or config changes; components are unchanged and simply relocated.

## Consequences

- FR-2.3, FR-3.3, and FR-7.1 become on-demand; new FR-9 (public-first default + opt-in
  disclosure) and NFR-8 (accessible disclosure) are added to [[REQUIREMENTS]].
- [[PROJECT]], [[UI_GUIDELINES]], and [[ARCHITECTURE]] (§2 route behavior, §6 traceability)
  updated for the new information architecture.
- **TASKS:** T1.7 (header/tagline) and T1.8 (disclosure) added.
- **Files:** `app/page.tsx`; docs above; [[CHANGELOG]], [[DECISIONS]], [[HOME]].
- The Phase 2 aggregated chart joins the disclosure; the Phase 3 mascot stays in the
  primary view.
