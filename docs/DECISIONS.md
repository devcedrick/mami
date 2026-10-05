---
status: living
tags: [decisions, adr, index]
---

# Mami — Decisions

Architecture Decision Records index. Read this summary, then load **one** ADR when
needed — never all of them at once.

## Records

- None yet.

## How to use

- New decision: copy `adr/0000-template.md` to `adr/NNNN-slug.md`, flip `status: proposed` → `accepted`, then add one line under Records.
- Never edit an accepted ADR. To reverse it, write a new ADR and set the old one to `status: superseded by [[NNNN-slug]]`.
- Reference decisions elsewhere by ID (e.g. `ADR-0001`), not by restating them.
