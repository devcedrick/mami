---
status: accepted
tags: [project, fis, marikina]
---

# Mami — Flood Risk Warning System

Mami is a client-side Mamdani-type Fuzzy Inference System (FIS) web app that turns two plain readings — rainfall intensity (mm/hr) and Marikina River level (m) — into a single **Flood Risk Index** (0–100) and a plain-language advisory. It serves residents, students, and disaster-preparedness educators who want an intuitive, offline-capable demonstration of how fuzzy logic supports flood warning, calibrated to the Marikina River (Sto. Niño gauge). No server, no login, no external data feed.

## Purpose

- Let the general public enter two plain readings and get a clear risk reading and advisory immediately.
- Reveal the fuzzy reasoning on demand — membership degrees, fired rules, and the aggregated output curve — without cluttering the default view.
- Map the crisp result to PAGASA-style advisories (monitor → prepare → evacuate → forced evacuation).
- Teach Mamdani inference with a real, testable engine and no third-party fuzzy library.
- Present Mami, the mascot, whose color mirrors the current advisory level.

## Core Features

| Feature | Description |
| :------ | :---------- |
| Public-first layout | Inputs and the advisory render by default; technical panels stay out of the way. |
| Decision transparency | A "See how this was decided" disclosure reveals fuzzification, fired rules, and MF plots on demand. |
| Dual inputs | Sliders with numeric entry for rainfall intensity (0–60 mm/hr) and river level (10–22 m). |
| Fuzzification panel | Shows membership degree (0–1) of every term for both inputs (advanced). |
| Fired-rules table | Lists only rules whose firing strength is `> 0`, with strength values (advanced). |
| Aggregated output chart | Recharts plot of the combined output set with a centroid vertical line (advanced). |
| Risk result | Crisp Flood Risk Index plus advisory label and color. |
| Membership-function plots | Separate triangular MF plots for rainfall, river level, and risk (advanced). |
| Pure fuzzy engine | Testable inference in `lib/fuzzy.ts` with no external fuzzy dependency. |
| Mami mascot | River-sprite/catfish whose color follows the advisory level (green/yellow/orange/red). |

## Tech Stack

- **Next.js `16.3.8`** — App Router, Turbopack default; single static route.
- **React `19.2.8`** — client-side interactive state.
- **TypeScript `5.9.x`** — `strict` mode throughout.
- **Tailwind CSS `4.x`** — CSS-first (no `tailwind.config.ts`); tokens in `app/globals.css`.
- **Recharts `3.10.1`** — aggregated output and membership-function plots.
- **Vitest `5.0.3`** — unit tests for the pure engine.
- **Vercel** — deployment target (static, client-rendered).

## Basic User Flow

1. User opens `/` on any modern browser.
2. Page shows the Mami header (name + tagline) and the two input controls with a default reading.
3. User drags the rainfall slider or types a value; input is clamped to `0–60 mm/hr`.
4. User drags the river-level slider or types a value; input is clamped to `10–22 m`.
5. Every change recomputes `inferFloodRisk(rainfall, riverLevel)` in `lib/fuzzy.ts`.
6. The risk index renders with its advisory label and color (the public view).
7. Optionally, the user expands "See how this was decided" to inspect membership degrees, fired rules, and MF plots.
8. Mami's color will follow the advisory level (Phase 3); no data is sent anywhere and nothing is persisted.

## Flood Risk Result Format

Canonical in-memory shape returned by the engine (`lib/fuzzy.ts`). There is no wire
format or persistence; all fields are non-nullable.

```ts
interface FloodRiskResult {
  risk: number;                 // 0–100 area-weighted centroid (Centroid_v)
  advisory: {
    label: string;              // "Normal / monitor" | "Prepare" | "Evacuate" | "Forced evacuation"
    color: "Green" | "Yellow" | "Orange" | "Red";
  };                            // the classification; derived from risk
  firedRules: {                 // only strength > 0
    rule: FuzzyRule;
    strength: number;           // 0–1 firing strength
  }[];
  aggregated: {                 // sampled output set; chart only
    x: number;                  // 0–100
    mu: number;                 // 0–1
  }[];
}
```

The advisory **is** the classification — there is no separate classification output or
second mapping. `risk` comes from each output term's clipped area and `midval` centroid
(see [[DATA_MODEL]] §5), not from the sampled `aggregated` curve, which is for display only.

## Routes

| Route | Title | Behavior |
| :---- | :---- | :------- |
| `/` (`app/page.tsx`) | Mami dashboard | Owns all state and the only UI. Reads inputs, calls the engine, and renders the public view (header, inputs, risk result) plus an opt-in disclosure for the technical panels (fuzzification, fired rules, aggregate chart, MF plots). |

Rationale: the app is a single-purpose calculator with live-derived views. One route keeps
all panels in sync from one state object and avoids routing overhead for what is really one
screen; sections act as anchors instead of separate pages.

## Project Structure

```txt
mami/
├─ app/
│  ├─ globals.css          # Tailwind import + theme tokens
│  ├─ layout.tsx           # metadata, fonts, root shell
│  └─ page.tsx             # single dashboard route (owns state)
├─ components/
│  ├─ AggregatedOutputChart.tsx
│  ├─ FiredRulesTable.tsx
│  ├─ FuzzificationPanel.tsx
│  ├─ InputSlider.tsx
│  ├─ MembershipFunctionsSection.tsx
│  └─ RiskResult.tsx
├─ lib/
│  ├─ flood-config.ts      # universes, terms, rules, advisories
│  ├─ fuzzy.ts             # Mamdani engine (pure)
│  └─ fuzzy.test.ts        # Vitest vectors
├─ docs/
│  └─ PROJECT.md
├─ next.config.ts
├─ postcss.config.mjs
├─ vitest.config.mts
├─ package.json
├─ tsconfig.json
└─ README.md
```

Notes:

- The mascot (`components/Mami.tsx`) is described but not yet a file; treat as a gap to add.
- `lib/fuzzy.ts` implements the pure engine; `lib/fuzzy.test.ts` covers it — see [[TASKS]].
- Tailwind v4 is CSS-first: there is intentionally no `tailwind.config.ts`.
- The README's `flood-risk-fis/` tree is a naming sketch; the live repo root is `mami/`.
- Assumption: all computation stays client-side; revisit via ADR if that changes.
