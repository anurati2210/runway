export type Category = 'food' | 'transport' | 'shopping' | 'fun' | 'bills' | 'other'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface Income { id: string; label: string; amount: number; day: number }
export interface Transaction { id: string; amount: number; category: Category; day: number; note: string }
export interface Commitment { id: string; name: string; amount: number; dueDay: number }
export interface Subscription { id: string; name: string; cost: number; renewalDay: number; active: boolean }
export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  plan: number
  contributed: number
  skipped: boolean
}

export interface FinanceState {
  totalDays: number
  currentDay: number
  emergencyBuffer: number
  incomes: Income[]
  transactions: Transaction[]
  commitments: Commitment[]
  subscriptions: Subscription[]
  goals: Goal[]
}

export interface HealthBreakdown {
  adherence: number
  savings: number
  buffer: number
  commitmentLoad: number
  stability: number
}

export interface Metrics {
  income: number
  spent: number
  balance: number
  upcomingCommitments: number
  goalReserve: number
  daysLeft: number
  safeDailyAllowance: number
  avgDailySpend: number
  forecastEndBalance: number
  runwayDays: number | null
  riskLevel: RiskLevel
  healthScore: number
  health: HealthBreakdown
}