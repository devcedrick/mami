---
status: accepted
tags: [requirements, fis, marikina]
---

# Mami — Requirements

Derived from [[PROJECT]]. Stack: Next.js 16 App Router + React 19 + TypeScript 5.9 + Tailwind 4 + Recharts 3 + Vitest 5.

## 1. Functional Requirements

### FR-1 Input Capture

- FR-1.1: User can set rainfall intensity via slider **and** numeric input (`components/InputSlider.tsx`).
- FR-1.2: User can set river level via slider **and** numeric input (`components/InputSlider.tsx`).
- FR-1.3: Inputs are clamped to their universe before inference — rainfall `0–60`, river `10–22` (`lib/fuzzy.ts` `clamp`).
- FR-1.4: NaN/empty numeric entry degrades to the last valid value rather than crashing; the field remains editable (`components/InputSlider.tsx`).

### FR-2 Fuzzification

- FR-2.1: Engine computes a triangular membership degree in `[0,1]` for any `(x, triplet)`, handling edge (right/left-angled) terms without dividing by zero (`lib/fuzzy.ts` `triangularMF`).
- FR-2.2: Engine fuzzifies both inputs against the terms in `lib/flood-config.ts` (`fuzzify`).
- FR-2.3: UI shows the membership degree of **every** term for both inputs, including zeros (`components/FuzzificationPanel.tsx`).

### FR-3 Rule Evaluation

- FR-3.1: Engine evaluates all 9 rules with `AND = min` (and optional `OR = max`), producing a firing strength per rule (`lib/fuzzy.ts` `evaluateRules`, rules in `lib/flood-config.ts`).
- FR-3.2: UI lists only rules with strength `> 0`, each with its strength (`components/FiredRulesTable.tsx`).

### FR-4 Aggregation

- FR-4.1: Engine clips each output term at its rule strength (`min` implication), combines all clipped sets with `max`, and samples `0–100` at `0.01` steps (`lib/fuzzy.ts` `aggregate`, terms in `lib/flood-config.ts`).

### FR-5 Defuzzification

- FR-5.1: Engine returns the centroid `sum(y*mu)/sum(mu)`; if `sum(mu) == 0` it returns `0` (`lib/fuzzy.ts` `defuzzify`).

### FR-6 Result and Advisory

- FR-6.1: UI shows the crisp risk index to one decimal (`components/RiskResult.tsx`).
- FR-6.2: Engine maps risk to advisory: `< 25` Normal/monitor (green), `25–50` Prepare (yellow), `50–75` Evacuate (orange), `>= 75` Forced evacuation (red) (`lib/flood-config.ts` `advisories`).
- FR-6.3: UI plots the aggregated output with a centroid vertical line using Recharts (`components/AggregatedOutputChart.tsx`).

### FR-7 Membership-Function Plots

- FR-7.1: UI renders a separate triangular MF plot for each term of every variable (`components/MembershipFunctionsSection.tsx`).

### FR-8 Mami Mascot

- FR-8.1: Mami's color reflects the current advisory level using the FR-6.2 mapping (`components/Mami.tsx` — not yet created; see [[TASKS]]).
- FR-8.2: Mami shows an advisory line matching the label (e.g. "Mami says: Evacuate now!") (`components/Mami.tsx`).

## 2. Non-functional Requirements

- NFR-1 **Offline-first / Privacy:** All inference runs in the browser; the app makes no network requests and stores no user data.
- NFR-2 **Performance:** Recomputation on every input change completes in under 50 ms for 10,001 aggregate samples.
- NFR-3 **Reliability:** The engine is total — clamped inputs and a `sum(mu) == 0` guard mean it never throws and never returns NaN.
- NFR-4 **Maintainability:** Inference lives in pure functions under `lib/` and is covered by Vitest; no third-party fuzzy library.
- NFR-5 **Usability:** Two inputs give live, legible feedback (degrees, fired rules, curve, advisory) without a submit step.
- NFR-6 **Theming:** Advisory colors and surface tokens are defined once in `app/globals.css` and used consistently in light/dark.
- NFR-7 **Accessibility:** Inputs are labelled, keyboard-focusable range/number controls; advisory is conveyed by text, not color alone.

## 3. Constraints

- C-1 **Framework:** Next.js `16.3.8` App Router with Turbopack defaults — routing and file structure follow App Router, not Pages Router.
- C-2 **Language:** TypeScript `5.9.x` with `strict: true`; no `any` in `lib/`.
- C-3 **Styling:** Tailwind CSS `4.x` CSS-first (no `tailwind.config.ts`); theme tokens via `@theme` in `app/globals.css`.
- C-4 **Charts:** Recharts `3.10.1`; matching `react-is` for React 19.
- C-5 **Testing:** Vitest `5.0.3`. Verification commands: `npm test`, `npm run lint`, `npm run build` — all must pass.
- C-6 **Engine:** No external fuzzy library; the Mamdani engine is implemented in `lib/fuzzy.ts` from the README spec.
- C-7 **Universes:** rainfall `0–60`, river `10–22`, risk `0–100`; samples at `0.01`.
- C-8 **Test tolerance:** Expected crisp outputs must match within `±0.1`; when code and spec disagree, fix the code, not the spec.
- C-9 **Runtime:** Node.js 18+ recommended, Node 22+ for Vitest 5; deploy target Vercel with default Next.js settings.

## 4. Out of Scope

- Live PAGASA / river-gauge API ingestion (inputs are manual only).
- Databases, `localStorage`, or any persistence between reloads.
- User accounts, authentication, or roles.
- Push, email, or SMS notifications.
- Sharing, sync, or multi-device state.
- Internationalization / localization.
- Historical event analytics or data logging.
- Server-side FIS computation or API routes.
- Native mobile apps.
- `OR` rules in the default config (engine may support `OR = max`, but none ship).
