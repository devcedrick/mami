# Mami — Flood Risk Warning System

> **Mami says:** Stay a step ahead of the flood.

**Mami** is a Mamdani-type Fuzzy Inference System (FIS) web app for flood risk warning, calibrated to the **Marikina River (Sto. Niño gauge), Philippines**.  
The name **Mami** is short for **Mamdani**, and also the name of the app’s cute mascot: a friendly river sprite / water-drop catfish whose color changes with the advisory level.

---

## Table of Contents

- [Overview](#overview)
- [Why Marikina?](#why-marikina)
- [Features](#features)
- [Fuzzy System Specification](#fuzzy-system-specification)
- [Rule Base](#rule-base)
- [Inference Stages](#inference-stages)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Mami the Mascot](#mami-the-mascot)
- [Deliverables](#deliverables)

---

## Overview

Mami accepts two crisp inputs:

1. **Rainfall Intensity** in mm/hr
2. **River Level** in meters

It returns a crisp **Flood Risk Index** from `0` to `100`, plus an advisory label:

| Risk Index | Advisory | Mami Color |
|------------|----------|------------|
| `< 25`     | Normal / monitor | Green |
| `25 – 50`  | Prepare | Yellow |
| `50 – 75`  | Evacuate | Orange |
| `>= 75`    | Forced evacuation | Red |

The system follows PAGASA rainfall warning thresholds and Marikina City river alarms:

- Rainfall: yellow `7.5–15 mm/hr`, orange `15–30 mm/hr`, red `> 30 mm/hr`
- River level: `15 m` prepare, `16 m` evacuate, `18 m` forced evacuation
- Historical records: `21.5 m` during Ondoy 2009, about `22 m` during Ulysses 2020
- Normal river level: about `12.8 m`

---

## Why Marikina?

The Marikina River is one of the most flood-prone areas in Metro Manila. The Sto. Niño gauge is a key reference point for local warnings. Mami translates rainfall and river-level readings into a simple risk index so users can see how fuzzy logic can support disaster preparedness.

---

## Features

- Two sliders with numeric inputs for rainfall and river level
- Fuzzification panel showing membership degree of every term
- Fired-rules table showing only rules with strength `> 0`
- Aggregated output plot with centroid line using Recharts
- Final risk index with advisory label
- Separate membership-function plots for all variables
- Pure, testable fuzzy engine with no external fuzzy library

---

## Fuzzy System Specification

### Input: Rainfall Intensity

Universe: `0–60 mm/hr`

| Term | Shape | Triplet `[lowval, midval, highval]` |
|------|-------|-------------------------------------|
| Light | left shoulder | `[0, 7.5, 15]` |
| Moderate | triangle | `[7.5, 20, 33]` |
| Heavy | right shoulder | `[20, 30, 60]` |

### Input: River Level

Universe: `10–22 m`

| Term | Shape | Triplet `[lowval, midval, highval]` |
|------|-------|-------------------------------------|
| Low | left shoulder | `[10, 12.8, 15]` |
| Elevated | triangle | `[13, 16, 19]` |
| Critical | right shoulder | `[16, 18, 22]` |

### Output: Flood Risk Index

Universe: `0–100`

| Term | Shape | Triplet `[lowval, midval, highval]` |
|------|-------|-------------------------------------|
| Normal | left shoulder | `[0, 12.5, 37.5]` |
| Prepare | triangle | `[12.5, 37.5, 62.5]` |
| Evacuate | triangle | `[37.5, 62.5, 87.5]` |
| Forced | right shoulder | `[62.5, 87.5, 100]` |

The four output terms mirror the four advisories; adjacent terms cross at `μ=0.5` exactly at
the thresholds `25 / 50 / 75`.

Every triplet satisfies `lowval < midval < highval`. Extreme terms are shoulders (flat `MF=1`
over an interval); middle terms are triangles. Degree of Membership (DOM) for a term
`[lowval, midval, highval]`:

```txt
# first (left shoulder) term
DOM = 1                                       if input <= midval
DOM = (highval - input) / (highval - midval)  if midval < input < highval
DOM = 0                                       if input >= highval

# last (right shoulder) term
DOM = 0                                       if input <= lowval
DOM = (input - lowval) / (midval - lowval)    if lowval < input < midval
DOM = 1                                       if input >= midval

# middle (triangle) term
DOM = 0                                       if input < lowval or input > highval
DOM = 1                                       if input == midval
DOM = (input  - lowval) / (midval - lowval)   if input < midval
DOM = (highval - input) / (highval - midval)  if input > midval
```

Inputs are clamped to their universe.

---

## Rule Base

All rules use `AND = min`.

| Rain \ River | Low | Elevated | Critical |
|--------------|-----|----------|----------|
| **Light** | Normal | Normal | Prepare |
| **Moderate** | Normal | Prepare | Evacuate |
| **Heavy** | Prepare | Evacuate | Forced |

Written as IF-THEN rules:

1. IF Rainfall is Light AND River is Low THEN Risk is Normal
2. IF Rainfall is Light AND River is Elevated THEN Risk is Normal
3. IF Rainfall is Light AND River is Critical THEN Risk is Prepare
4. IF Rainfall is Moderate AND River is Low THEN Risk is Normal
5. IF Rainfall is Moderate AND River is Elevated THEN Risk is Prepare
6. IF Rainfall is Moderate AND River is Critical THEN Risk is Evacuate
7. IF Rainfall is Heavy AND River is Low THEN Risk is Prepare
8. IF Rainfall is Heavy AND River is Elevated THEN Risk is Evacuate
9. IF Rainfall is Heavy AND River is Critical THEN Risk is Forced

The engine can optionally support `OR = max`, but no OR rule is included in the config.

---

## Inference Stages

The Mamdani engine in `lib/fuzzy.ts` implements the four stages from the example:

1. **Fuzzification**  
   `fuzzify(x, variable) -> DOM per term` using the Degree of Membership formula above.

2. **Rules Evaluation**  
   The fired value of a rule is the `min` of its antecedent DOMs (`AND = min`, optional
   `OR = max`). Rules that share a consequent collapse to one value per output term,
   `μ_i = max` of those rule strengths.

3. **Area of each fired output term** (clip at the fired value `μ_i`); the formula depends on the term shape:

   ```txt
   # triangle
   a_i    = (highval_i - lowval_i) / 2
   Area_i = a_i (2 * μ_i - μ_i²)

   # left shoulder   (xμ = highval_i - μ_i * (highval_i - midval_i))
   Area_i = μ_i * ((highval_i + xμ) / 2 - lowval_i)

   # right shoulder  (xμ = lowval_i + μ_i * (midval_i - lowval_i))
   Area_i = μ_i * (highval_i - (xμ + lowval_i) / 2)
   ```

4. **Defuzzification** — weighted centroid, using each output term's plateau midpoint as its centroid:

   ```txt
   Centroid_i = midval_i                         # triangle
   Centroid_i = (lowval_i + midval_i) / 2        # left shoulder
   Centroid_i = (midval_i + highval_i) / 2       # right shoulder
   Centroid_v = Σ (Centroid_i * Area_i) / Σ (Area_i)
   ```

   If `Σ Area_i == 0`, return `0`. `Centroid_v` is the Flood Risk Index.

5. **Classification (advisory)** — evaluate the Degree of Membership of `Centroid_v` in each
   output term and take the maximum; that term's label is the advisory:

   ```txt
   classify(risk) = argmax_t DOM(risk, term_t)
   ```

The combined output set (`aggregate`, sampled on `0..100` at `0.01` steps) is built for the
chart only and is **not** used in defuzzification.

---

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Vitest
- Vercel

---

## Project Structure

```txt
flood-risk-fis/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ AggregatedOutputChart.tsx
│  ├─ FiredRulesTable.tsx
│  ├─ FuzzificationPanel.tsx
│  ├─ InputSlider.tsx
│  ├─ MembershipFunctionsSection.tsx
│  └─ RiskResult.tsx
├─ lib/
│  ├─ flood-config.ts
│  ├─ fuzzy.ts
│  └─ fuzzy.test.ts
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
└─ vitest.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## Testing

Run tests:

```bash
npm test
```

Expected crisp outputs within `±0.1` (area-weighted centroid, per Inference Stages):

| Rainfall | River Level | Expected Risk | Fired Rules |
|----------|-------------|---------------|-------------|
| `2` | `12.8` | `6.25` | Light + Low -> Normal `(1.0)` |
| `22` | `15` | `44.7` | Moderate + Elevated -> Prepare `(0.667)`, Heavy + Elevated -> Evacuate `(0.2)` |
| `35` | `18` | `82.6` | Heavy + Elevated -> Evacuate `(0.333)`, Heavy + Critical -> Forced `(1.0)` |
| `60` | `21.5` | `93.75` | Heavy + Critical -> Forced `(1.0)` |

If an expected test value does not match the implementation, fix the code, not the spec.

---

## Deployment

Deploy on Vercel:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Keep the default Next.js settings.
4. Deploy.

---

## Mami the Mascot

**Mami** is the app’s friendly guide.

- Name origin: **Mamdani**
- Form: a cute water-drop / river catfish with whiskers that look like fuzzy membership curves
- Behavior: Mami’s color follows the advisory level
  - Green: normal / monitor
  - Yellow: prepare
  - Orange: evacuate
  - Red: forced evacuation

Example Mami lines:

> “Mami says: Keep an eye on the river!”  
> “Mami says: Prepare — the river is rising.”  
> “Mami says: Evacuate now!”

---

## Deliverables

This repository supports the school activity deliverable:

1. Folder structure
2. `lib/fuzzy.ts` and `lib/flood-config.ts`
3. Tests
4. UI components and page
5. Run instructions

Final PDF should include:

- Implementation details
- Walkthrough screenshots
- Link to the code repository

---

## License

For school activity use. Add a license if you plan to publish or reuse the project.