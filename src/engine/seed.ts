import type { FinanceState } from './types'

export const demoState: FinanceState = {
  totalDays: 30,
  currentDay: 1,
  emergencyBuffer: 800,
  incomes: [{ id: 'inc1', label: 'Opening budget', amount: 10000, day: 1 }],
  transactions: [
    { id: 't1', amount: 80, category: 'food', day: 1, note: 'Breakfast' },
    { id: 't2', amount: 30, category: 'food', day: 1, note: 'Chai' },
  ],
  commitments: [
    { id: 'c1', name: 'PG rent share', amount: 2500, dueDay: 3 },
    { id: 'c2', name: 'Bus pass', amount: 400, dueDay: 2 },
    { id: 'c3', name: 'Phone recharge', amount: 299, dueDay: 5 },
  ],
  subscriptions: [
    { id: 's1', name: 'Spotify', cost: 119, renewalDay: 8, active: true },
    { id: 's2', name: 'Netflix', cost: 199, renewalDay: 12, active: true },
    { id: 's3', name: 'Swiggy One', cost: 149, renewalDay: 15, active: true },
    { id: 's4', name: 'Gym pass', cost: 300, renewalDay: 20, active: true },
  ],
  goals: [
    { id: 'g1', name: 'Emergency fund', target: 5000, saved: 1500, plan: 800, contributed: 0, skipped: false },
    { id: 'g2', name: 'New phone', target: 15000, saved: 2000, plan: 500, contributed: 0, skipped: false },
    { id: 'g3', name: 'Goa trip', target: 8000, saved: 0, plan: 300, contributed: 0, skipped: false },
  ],
}