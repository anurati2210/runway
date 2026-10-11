# Runway: a 30-day money simulator for Gen Z

Manage a limited Rs 10,000 budget over 30 days and test financial decisions before you make them.

Live app: https://runway-drab.vercel.app

## How it works

One pure finance engine (`src/engine/computeMetrics.ts`) takes the full money state and returns balance,
safe daily allowance, forecast end balance, risk level and a 0-100 health score.
Every screen reads from it, so a change anywhere updates everything.

The what-if simulator runs the same engine twice, before and after a hypothetical decision
(`src/engine/simulate.ts`), and shows the difference before the user confirms.

## Features

- Dashboard: balance ring, safe daily allowance, risk badge, health score breakdown, 30-day forecast, next 7 days of bills, expense logging
- What-if simulator: purchases, unexpected expenses, subscriptions, goal contributions and skips, with a before and after view
- Plan: commitments, subscription switches with cost impact, savings goals with live ETAs
- Timeline: day slider and surprise-expense stress test

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Zustand (persisted to localStorage), Framer Motion, Recharts, Vitest.

## Project structure

- `src/engine`: types, seed data, metrics, simulator, forecast, unit tests
- `src/store`: Zustand store
- `src/features`: dashboard, simulator, plan, timeline
- `src/components`: shared UI pieces

## Run locally

    npm install
    npm run dev
    npm test

## Accessibility and performance

Labelled inputs, visible focus styles, risk shown with icon and text (not colour alone),
reduced-motion support, and a lazy-loaded chart.