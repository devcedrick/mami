---
status: accepted
tags: [home, index]
---

# Mami Docs — Home

Vault index for the Mami Flood Risk Warning System. Notes are flat, one topic each.

## Core notes (accepted — frozen)

- [[PROJECT]] — vision, features, tech stack, routes, structure.
- [[REQUIREMENTS]] — all FR/NFR/C IDs and out-of-scope.
- [[DATA_MODEL]] — entities, TS contracts, "schema" (no persistence), query contracts.
- [[ARCHITECTURE]] — layers, route map, module contracts, data flows, traceability.
- [[TASKS]] — phased build order and done-criteria.
- [[UI_GUIDELINES]] — layout, theme tokens, component visual contracts.

## Dynamic

- [[DECISIONS]] — ADR index.
- [[CHANGELOG]] — released and unreleased changes.
- [[0000-template]] — ADR template (`adr/`).

## Conventions

Flat `docs/*.md`; filenames `UPPERCASE.md` (ADR files excepted: `NNNN-slug.md`);
links are `[[wikilinks]]`; frontmatter `tags:`. Core notes are `accepted` and change
only via an ADR; [[TASKS]] and [[UI_GUIDELINES]] are `draft`; [[DECISIONS]] and
[[CHANGELOG]] are `living`.
