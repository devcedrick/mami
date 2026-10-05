# Mami — Flood Risk Warning System

> **Mami says:** Keep an eye on the river!

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

| Term | Triangular MF `(a, b, c)` |
|------|----------------------------|
| Light | `(0, 0, 15)` |
| Moderate | `(7.5, 20, 33)` |
| Heavy | `(20, 60, 60)` |

### Input: River Level

Universe: `10–22 m`

| Term | Triangular MF `(a, b, c)` |
|------|----------------------------|
| Low | `(10, 10, 15)` |
| Elevated | `(13, 16, 19)` |
| Critical | `(16, 22, 22)` |

### Output: Flood Risk Index

Universe: `0–100`

| Term | Triangular MF `(a, b, c)` |
|------|----------------------------|
| Low | `(0, 0, 50)` |
| Moderate | `(0, 50, 100)` |
| High | `(50, 100, 100)` |

Triangle membership function:

```txt
0 if x < a or x > c
1 if x == b
(x - a) / (b - a) if x < b
(c - x) / (c - b) if x > b
```

Edge terms are right-angled triangles, so the `x == b` check is handled before any division.  
Inputs are clamped to their universe.

---

## Rule Base

All rules use `AND = min`.

| Rain \ River | Low | Elevated | Critical |
|--------------|-----|----------|----------|
| **Light** | Low | Low | Moderate |
| **Moderate** | Low | Moderate | High |
| **Heavy** | Moderate | High | High |

Written as IF-THEN rules:

1. IF Rainfall is Light AND River is Low THEN Risk is Low
2. IF Rainfall is Light AND River is Elevated THEN Risk is Low
3. IF Rainfall is Light AND River is Critical THEN Risk is Moderate
4. IF Rainfall is Moderate AND River is Low THEN Risk is Low
5. IF Rainfall is Moderate AND River is Elevated THEN Risk is Moderate
6. IF Rainfall is Moderate AND River is Critical THEN Risk is High
7. IF Rainfall is Heavy AND River is Low THEN Risk is Moderate
8. IF Rainfall is Heavy AND River is Elevated THEN Risk is High
9. IF Rainfall is Heavy AND River is Critical THEN Risk is High

The engine can optionally support `OR = max`, but no OR rule is included in the config.

---

## Inference Stages

The Mamdani engine in `lib/fuzzy.ts` implements four stages:

1. **Fuzzification**  
   `fuzzify(x, variable) -> degree per term`

2. **Rule Evaluation**  
   `evaluateRules -> per-rule firing strength`  
   `AND = min`, optional `OR = max`

3. **Aggregation**  
   Clip each output set at its rule’s strength using `min` implication, combine with `max`, sample on `0..100` at `0.01` steps.

4. **Defuzzification**  
   Centroid:

   ```txt
   sum(y * mu) / sum(mu)
   ```

   If `sum(mu) == 0`, return `0`.

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

Expected crisp outputs within `±0.1`:

| Rainfall | River Level | Expected Risk | Fired Rules |
|----------|-------------|---------------|-------------|
| `2` | `12.8` | `20.0` | Light + Low -> Low `(0.44)` |
| `22` | `15` | `50.1` | Moderate + Elevated -> Moderate `(0.667)`, Heavy + Elevated -> High `(0.05)` |
| `35` | `18` | `78.9` | Heavy + Elevated -> High `(0.333)`, Heavy + Critical -> High `(0.333)` |
| `60` | `21.5` | `83.2` | Heavy + Critical -> High `(0.917)` |

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