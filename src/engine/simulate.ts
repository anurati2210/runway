import { computeMetrics } from './computeMetrics'
import type { Category, FinanceState, Metrics } from './types'

export type Decision =
  | { type: 'purchase'; amount: number; category: Category; note?: string }
  | { type: 'surprise'; amount: number; note?: string }
  | { type: 'subscription_add'; name: string; cost: number; renewalDay: number }
  | { type: 'subscription_toggle'; id: string }
  | { type: 'goal_contribute'; goalId: string; amount: number }
  | { type: 'goal_skip'; goalId: string }

export function applyHypothetical(s: FinanceState, d: Decision): FinanceState {
  switch (d.type) {
    case 'purchase':
      return {
        ...s,
        transactions: [
          ...s.transactions,
          { id: `sim-${Date.now()}`, amount: d.amount, category: d.category, day: s.currentDay, note: d.note ?? 'Purchase' },
        ],
      }
    case 'surprise':
      return {
        ...s,
        transactions: [
          ...s.transactions,
          { id: `sim-${Date.now()}`, amount: d.amount, category: 'other', day: s.currentDay, note: d.note ?? 'Surprise expense' },
        ],
      }
    case 'subscription_add':
      return {
        ...s,
        subscriptions: [
          ...s.subscriptions,
          { id: `sim-${Date.now()}`, name: d.name, cost: d.cost, renewalDay: d.renewalDay, active: true },
        ],
      }
    case 'subscription_toggle':
      return {
        ...s,
        subscriptions: s.subscriptions.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)),
      }
    case 'goal_contribute':
      return {
        ...s,
        goals: s.goals.map((g) =>
          g.id === d.goalId ? { ...g, contributed: g.contributed + d.amount, saved: g.saved + d.amount } : g,
        ),
      }
    case 'goal_skip':
      return { ...s, goals: s.goals.map((g) => (g.id === d.goalId ? { ...g, skipped: true } : g)) }
  }
}

export interface Simulation {
  before: Metrics
  after: Metrics
  diff: {
    balance: number
    safeDailyAllowance: number
    forecastEndBalance: number
    healthScore: number
    goalReserve: number
  }
}

export function simulate(s: FinanceState, d: Decision): Simulation {
  const before = computeMetrics(s)
  const after = computeMetrics(applyHypothetical(s, d))
  return {
    before,
    after,
    diff: {
      balance: after.balance - before.balance,
      safeDailyAllowance: after.safeDailyAllowance - before.safeDailyAllowance,
      forecastEndBalance: after.forecastEndBalance - before.forecastEndBalance,
      healthScore: after.healthScore - before.healthScore,
      goalReserve: after.goalReserve - before.goalReserve,
    },
  }
}