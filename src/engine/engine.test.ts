import { describe, expect, it } from 'vitest'
import { computeMetrics } from './computeMetrics'
import { simulate } from './simulate'
import { demoState } from './seed'

describe('engine', () => {
  it('computes day 1 balance', () => {
    expect(computeMetrics(demoState).balance).toBe(9890)
  })

  it('a purchase lowers balance and allowance', () => {
    const r = simulate(demoState, { type: 'purchase', amount: 2000, category: 'shopping' })
    expect(r.diff.balance).toBe(-2000)
    expect(r.diff.safeDailyAllowance).toBeLessThan(0)
  })

  it('cancelling a subscription improves the forecast', () => {
    const r = simulate(demoState, { type: 'subscription_toggle', id: 's2' })
    expect(r.diff.forecastEndBalance).toBeGreaterThan(0)
  })

  it('a huge purchase makes risk High', () => {
    const r = simulate(demoState, { type: 'surprise', amount: 8000 })
    expect(r.after.riskLevel).toBe('High')
  })

  it('health score stays within 0-100', () => {
    const h = computeMetrics(demoState).healthScore
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(100)
  })
})