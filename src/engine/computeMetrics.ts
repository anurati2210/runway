import type { Category, FinanceState, Metrics, RiskLevel } from './types'

const PRIOR_DAYS = 3
const ONE_OFF: Category[] = ['shopping', 'bills', 'other']
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function computeMetrics(s: FinanceState): Metrics {
  const day = s.currentDay
  const activeSubs = s.subscriptions.filter((x) => x.active)

  const income = sum(s.incomes.filter((i) => i.day <= day).map((i) => i.amount))
  const futureIncome = sum(s.incomes.filter((i) => i.day > day).map((i) => i.amount))
  const totalIncome = income + futureIncome

  const spent = sum(s.transactions.filter((t) => t.day <= day).map((t) => t.amount))

  const paidCommitments =
    sum(s.commitments.filter((c) => c.dueDay <= day).map((c) => c.amount)) +
    sum(activeSubs.filter((x) => x.renewalDay <= day).map((x) => x.cost))
  const upcomingCommitments =
    sum(s.commitments.filter((c) => c.dueDay > day).map((c) => c.amount)) +
    sum(activeSubs.filter((x) => x.renewalDay > day).map((x) => x.cost))
  const totalCommitments = paidCommitments + upcomingCommitments

  const contributed = sum(s.goals.map((g) => g.contributed))
  const totalPlan = sum(s.goals.map((g) => g.plan))
  const goalReserve = sum(
    s.goals.filter((g) => !g.skipped).map((g) => Math.max(0, g.plan - g.contributed)),
  )

  const balance = income - spent - paidCommitments - contributed
  const daysLeft = Math.max(1, s.totalDays - day + 1)
  const daysAhead = s.totalDays - day

  const safeDailyAllowance = Math.max(
    0,
    (balance + futureIncome - upcomingCommitments - goalReserve - s.emergencyBuffer) / daysLeft,
  )

  const idealDaily = Math.max(
    0,
    (totalIncome - totalCommitments - totalPlan - s.emergencyBuffer) / s.totalDays,
  )

  // Daily spending pace: everyday spending only, with each day capped.
  // Big one-offs (shopping, bills, surprises) hit your balance but are not repeated every day.
  const cap = Math.max(idealDaily * 3, 1)
  let everydaySpent = 0
  for (let d = 1; d <= day; d++) {
    const dayTotal = sum(
      s.transactions
        .filter((t) => t.day === d && !ONE_OFF.includes(t.category))
        .map((t) => t.amount),
    )
    everydaySpent += Math.min(dayTotal, cap)
  }
  const avgDailySpend = (everydaySpent + idealDaily * PRIOR_DAYS) / (day + PRIOR_DAYS)

  const forecastEndBalance =
    balance + futureIncome - upcomingCommitments - goalReserve - avgDailySpend * daysAhead

  const runwayDays =
    avgDailySpend > 0
      ? Math.max(0, (balance + futureIncome - upcomingCommitments - goalReserve) / avgDailySpend)
      : null

  // High = you'd run out of money even if you skipped every remaining savings contribution.
  const velocity = idealDaily > 0 ? avgDailySpend / idealDaily : 0
  const cashEnd = forecastEndBalance + goalReserve
  let riskLevel: RiskLevel = 'Low'
  if (cashEnd < 0) riskLevel = 'High'
  else if (forecastEndBalance < s.emergencyBuffer * 0.5 || velocity > 1.5) riskLevel = 'Medium'

  const adherence =
    idealDaily <= 0 ? 0 : clamp(1 - Math.max(0, avgDailySpend - idealDaily) / idealDaily) * 30

  const expectedSaved = (totalPlan * (day - 1)) / s.totalDays
  const savings = totalPlan === 0 || expectedSaved === 0 ? 25 : clamp(contributed / expectedSaved) * 25

  const buffer =
    s.emergencyBuffer > 0 ? clamp(forecastEndBalance / s.emergencyBuffer) * 20 : 20

  const load = totalIncome > 0 ? totalCommitments / totalIncome : 1
  const commitmentLoad = clamp(1 - (load - 0.3) / 0.4) * 15

  const daily: number[] = []
  for (let d = 1; d <= day; d++) {
    daily.push(sum(s.transactions.filter((t) => t.day === d).map((t) => t.amount)))
  }
  const mean = sum(daily) / Math.max(1, daily.length)
  const std = Math.sqrt(sum(daily.map((x) => (x - mean) ** 2)) / Math.max(1, daily.length))
  const stability = mean === 0 ? 10 : clamp(1 - std / mean / 1.5) * 10

  const health = {
    adherence: Math.round(adherence),
    savings: Math.round(savings),
    buffer: Math.round(buffer),
    commitmentLoad: Math.round(commitmentLoad),
    stability: Math.round(stability),
  }
  const healthScore = Math.round(adherence + savings + buffer + commitmentLoad + stability)

  return {
    income,
    spent,
    balance: Math.round(balance),
    upcomingCommitments,
    goalReserve,
    daysLeft,
    safeDailyAllowance: Math.round(safeDailyAllowance),
    avgDailySpend: Math.round(avgDailySpend),
    forecastEndBalance: Math.round(forecastEndBalance),
    runwayDays: runwayDays === null ? null : Math.round(runwayDays * 10) / 10,
    riskLevel,
    healthScore,
    health,
  }
}