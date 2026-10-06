---
status: draft
tags: [ui, tailwind, tokens]
---

# Mami — UI Guidelines

Single screen (`app/page.tsx`) styled with Tailwind CSS v4 utilities. Components are
presentational only — **no DB, network, or engine imports inside components**; they receive
data via props (see [[ARCHITECTURE]] §3).

## Layout and spacing

- Use Tailwind utilities directly (flex/grid, `gap-*`, `p-*`, `rounded-lg`, `border`).
- Panels are card-like sections (`rounded-lg border p-4`) stacked in one responsive column; wider than `md` may use a two-column grid.
- Default sections in order: header → inputs → risk result → Mami (Phase 3). Advanced sections live inside the "See how this was decided" disclosure: fuzzification → fired rules → aggregated output → membership functions.
- Escape-hatch custom CSS only when utilities cannot express it (e.g. a token-driven gradient); keep it in `app/globals.css`.

## Color and theming

- Theme tokens live once in `app/globals.css` under `@theme` (Tailwind v4 CSS-first; there is no `tailwind.config.ts`).
- Advisory colors come from the `advisories` map in `lib/flood-config.ts`; they must map 1:1 to tokens below and appear consistently in light and dark.
- Never hardcode hex values in components; reference tokens (or Tailwind palette classes bound to them).

| Token | Light | Dark | Job |
| :---- | :---- | :--- | :-- |
| `--color-background` | `#ffffff` | `#0a0a0a` | page background |
| `--color-foreground` | `#171717` | `#ededed` | body text |
| `--color-card` | `#ffffff` | `#111111` | panel background |
| `--color-border` | `zinc-200` | `zinc-800` | panel borders |
| `--color-muted` | `zinc-500` | `zinc-400` | secondary text |
| `--color-risk-normal` | `green-600` | `green-400` | advisory "Normal / monitor" |
| `--color-risk-prepare` | `yellow-500` | `yellow-400` | advisory "Prepare" |
| `--color-risk-evacuate` | `orange-500` | `orange-400` | advisory "Evacuate" |
| `--color-risk-forced` | `red-600` | `red-400` | advisory "Forced evacuation" |
| `--font-sans` | Geist | Geist | body font |

## Progressive disclosure

- The default view is public-first: header, inputs, and the risk result only.
- The technical panels (fuzzification, fired rules, aggregated output, membership functions) sit inside a single native `<details>` disclosure labelled "See how this was decided".
- The disclosure is closed by default, keyboard-focusable, and never required to use the app (NFR-8).
- Never delete these panels; keep them reachable for students and educators (FR-9).

## Component visual contracts

- `InputSlider`: label + unit, a range control and a synced number field; both focusable; shows the clamped value.
- `FuzzificationPanel` (advanced): table of term → degree (`0.00`–`1.00`) for rainfall and river level; zeros visible.
- `FiredRulesTable` (advanced): rows of `IF rainfall AND river THEN risk — strength`; hidden rows when empty with a "No rules fired" note.
- `AggregatedOutputChart` (advanced): Recharts curve of `aggregated` with a labelled vertical centroid line at `risk`; axes `0–100`. The line marks the area-weighted `Centroid_v` (per-term areas), which is not necessarily the balance point of the drawn curve.
- `MembershipFunctionsSection` (advanced): one MF chart per variable plotting **all** of its terms together (left/right shoulders at the extremes, triangles in the middle), with a legend and a themed, high-contrast tooltip.
- `RiskResult`: large one-decimal index; advisory label with the matching risk color (text, not color alone).
- `Mami`: mascot whose fill is the advisory color and whose caption is the advisory line.

## Screen rules and states

- Single screen; no pagination or routing.
- **Default:** only the header, inputs, and risk result are visible; the technical disclosure is collapsed.
- **Expanded:** the user may open "See how this was decided" to inspect the FIS internals; this state is session-only and not persisted.
- **Empty / initial:** render valid defaults (rainfall `0`, river level `10`) with a complete, non-NaN result.
- **Parsing:** while the number field is mid-edit (empty or non-numeric), keep the last valid value and do not crash; the field stays editable.
- **Validation:** all values are clamped to their universe (rainfall `0–60`, river `10–22`); never reject silently — show the clamped value.
- **Accessibility:** label every control; convey advisory by text plus color; keep contrast ≥ 4.5:1 for text.
