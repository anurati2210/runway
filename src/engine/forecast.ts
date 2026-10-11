import { computeMetrics } from './computeMetrics'
import type { FinanceState } from './types'

export interface ForecastPoint {
  day: number
  balance: number
}

export function forecastSeries(s: FinanceState): ForecastPoint[] {
  const m = computeMetrics(s)
  const points: ForecastPoint[] = []
  for (let d = s.currentDay; d <= s.totalDays; d++) {
    const due =
      s.commitments
        .filter((c) => c.dueDay > s.currentDay && c.dueDay <= d)
        .reduce((a, c) => a + c.amount, 0) +
      s.subscriptions
        .filter((x) => x.active && x.renewalDay > s.currentDay && x.renewalDay <= d)
        .reduce((a, x) => a + x.cost, 0)
    points.push({
      day: d,
      balance: Math.round(m.balance - m.avgDailySpend * (d - s.currentDay) - due),
    })
  }
  return points
}