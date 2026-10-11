# Runway: Survive the Month

**Live demo:** [your-vercel-url]  
**Repo:** https://github.com/anurati2210/runway

Runway is a 30-day money simulator for Gen Z on a ₹10,000 monthly budget. Every decision (a purchase, a surprise expense, cancelling a subscription, funding or skipping a goal) is run through one finance engine before you commit, so you can see the effect on your balance, safe daily allowance, month-end forecast, risk level and health score.

## Problem statement

"Broke But Functional: Survive the Month". Help a young person with a small budget see, day by day, whether they will make it to day 30, and what each choice costs them.

## Features

| Tab | What it does |
| --- | --- |
| Dashboard | Balance ring, safe daily allowance, risk badge (icon + text), health score with breakdown, 30-day forecast chart, bills due in the next 7 days, expense logging, day control |
| What-if | Runs the engine before and after a decision and shows the difference. You choose Confirm or Cancel |
| Plan | Commitments, subscriptions (cancel or resume, with the effect on your daily allowance), savings goals (add money, skip or resume, time-to-goal estimate) |
| Timeline | [one line: what the Timeline tab shows] |

## How it works

All numbers come from one pure function, `computeMetrics(state)`. It has no side effects and does not touch the UI. Every screen reads from it, so the numbers never disagree between tabs.

- `simulate(state, decision)` applies a decision to a copy of the state and returns the metrics before and after, plus the difference.
- `forecast` projects the balance across the remaining days of the month.
- The store (`useFinance`) holds the state and applies decisions. Nothing is applied until the user confirms.

### Key rules

- **Safe daily allowance** = [formula in words, e.g. (balance − upcoming commitments − emergency buffer) ÷ days left]
- **Risk level** (Low / Medium / High) = [what triggers each level]
- **Health score** (0–100) = [what goes into it]

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Vitest. [add the chart library you use]

## Project structure

```
src/
  engine/      computeMetrics, simulate, forecast, seed data, types, tests
  features/
    dashboard/ Dashboard, AddExpense, ForecastChart (lazy-loaded)
    simulator/ What-if simulator
    plan/      Commitments, subscriptions, goals
    timeline/  Timeline
  store/       useFinance (state + apply)
  components/  shared helpers such as currency formatting
```

## Getting started

```bash
git clone https://github.com/anurati2210/runway.git
cd runway
npm install
npm run dev      # start locally
npm test         # run engine tests
npm run build    # production build
```

## Testing

Engine tests (Vitest) check that: day 1 balance is computed correctly, a purchase lowers balance and allowance, cancelling a subscription improves the forecast, a very large purchase makes risk High, and the health score stays between 0 and 100.

## Accessibility

- Risk is shown with an icon and a word, never colour alone
- Every input has a label; errors use `role="alert"`
- Switches and progress bars have ARIA roles and labels
- Visible keyboard focus on all controls
- Layout tested at 360px, 768px and desktop widths

## Design decisions

- **One engine, many screens:** a single source of truth keeps numbers consistent and makes the logic easy to test.
- **Preview before commit:** the What-if tab shows the impact before any change is applied.
- **Lazy-loaded chart:** the forecast chart loads on demand to keep the first load small.

## Limitations and next steps

- Data is seeded sample data; it is not saved between sessions. 