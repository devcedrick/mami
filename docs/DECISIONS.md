---
status: living
tags: [decisions, adr, index]
---

# Mami — Decisions

Architecture Decision Records index. Read this summary, then load **one** ADR when
needed — never all of them at once.

## Records

- ADR-0001 — Adopt slide Mamdani DOM and area-weighted defuzzification ([[0001-slide-mamdani-defuzzification]]).
- ADR-0002 — Public-first dashboard with opt-in decision transparency ([[0002-public-first-dashboard]]).
- ADR-0003 — Shoulder membership functions with strict triplets ([[0003-shoulder-membership-functions]]).
- ADR-0004 — Four-term advisory-aligned output ([[0004-four-term-output]]).
- ADR-0005 — Refresh the header tagline ([[0005-refresh-tagline]]).

## How to use

- New decision: copy `adr/0000-template.md` to `adr/NNNN-slug.md`, flip `status: proposed` → `accepted`, then add one line under Records.
- Never edit an accepted ADR. To reverse it, write a new ADR and set the old one to `status: superseded by [[NNNN-slug]]`.
- Reference decisions elsewhere by ID (e.g. `ADR-0001`), not by restating them.
