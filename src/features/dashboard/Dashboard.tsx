import { lazy, Suspense, useMemo } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { computeMetrics } from '../../engine/computeMetrics'
import { forecastSeries } from '../../engine/forecast'
import type { RiskLevel } from '../../engine/types'
import { useFinance } from '../../store/useFinance'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { BalanceRing } from '../../components/BalanceRing'
import { rupee } from '../../components/format'
import { AddExpense } from './AddExpense'

const ForecastChart = lazy(() => import('./ForecastChart'))

const RISK: Record<RiskLevel, { icon: typeof ShieldCheck; cls: string; msg: string }> = {
  Low: {
    icon: ShieldCheck,
    cls: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    msg: "You're on track. Vibes immaculate.",
  },
  Medium: {
    icon: AlertTriangle,
    cls: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    msg: 'Spending is running hot. Ease off a little.',
  },
  High: {
    icon: ShieldAlert,
    cls: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
    msg: "At this pace you'll run out before day 30 ",
  },
}

const HEALTH_PARTS: { key: 'adherence' | 'savings' | 'buffer' | 'commitmentLoad' | 'stability'; label: string; max: number }[] = [
  { key: 'adherence', label: 'Budget adherence', max: 30 },
  { key: 'savings', label: 'Savings progress', max: 25 },
  { key: 'buffer', label: 'Emergency buffer', max: 20 },
  { key: 'commitmentLoad', label: 'Commitment load', max: 15 },
  { key: 'stability', label: 'Spending stability', max: 10 },
]

const card = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-5'

export default function Dashboard() {
  const state = useFinance()
  const m = useMemo(() => computeMetrics(state), [state])
  const series = useMemo(() => forecastSeries(state), [state])
  const risk = RISK[m.riskLevel]
  const RiskIcon = risk.icon
  const totalIncome = state.incomes.reduce((a, i) => a + i.amount, 0)

  const upcoming = [
    ...state.commitments.map((c) => ({ name: c.name, amount: c.amount, day: c.dueDay })),
    ...state.subscriptions
      .filter((x) => x.active)
      .map((x) => ({ name: x.name, amount: x.cost, day: x.renewalDay })),
  ]
    .filter((x) => x.day > state.currentDay && x.day <= state.currentDay + 7)
    .sort((a, b) => a.day - b.day)

  const recent = [...state.transactions].reverse().slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <div>
          <h1 className="text-2xl font-bold">Runway</h1>
          <p className="text-sm text-slate-300">
            {rupee(totalIncome)} income · 30-day budget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Previous day" onClick={() => state.setDay(state.currentDay - 1)}
            className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-24 text-center font-semibold">Day {state.currentDay} of 30</span>
          <button aria-label="Next day" onClick={() => state.setDay(state.currentDay + 1)}
            className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => state.reset()}
            className="ml-2 flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <RotateCcw size={14} /> Load demo
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 px-4 pb-12 md:grid-cols-3">
        <section className={`${card} grid place-items-center md:row-span-2`} aria-labelledby="bal-h">
          <h2 id="bal-h" className="sr-only">Balance</h2>
          <BalanceRing value={m.balance} total={totalIncome}>
            <div>
              <p className="text-sm text-slate-300">Balance</p>
              <p className="text-3xl font-bold"><AnimatedNumber value={m.balance} /></p>
              <p className="text-xs text-slate-400">{m.daysLeft} days left</p>
            </div>
          </BalanceRing>
          <p className="mt-3 text-sm text-slate-300">Spent so far: {rupee(m.spent)}</p>
        </section>

        <section className={card} aria-labelledby="allow-h">
          <h2 id="allow-h" className="text-sm text-slate-300">Safe daily allowance</h2>
          <p className="mt-1 text-3xl font-bold"><AnimatedNumber value={m.safeDailyAllowance} /></p>
          <p className="mt-1 text-xs text-slate-400">
            After commitments, savings goals and your emergency buffer
          </p>
        </section>

        <section className={card} aria-labelledby="risk-h">
          <h2 id="risk-h" className="text-sm text-slate-300">Financial risk</h2>
          <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold ${risk.cls}`}>
            <RiskIcon size={18} aria-hidden="true" />
            <span>{m.riskLevel} risk</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{risk.msg}</p>
          <p className="mt-1 text-xs text-slate-400">
            Forecast end balance: {rupee(m.forecastEndBalance)}
          </p>
        </section>

        <section className={`${card} md:col-span-2`} aria-labelledby="health-h">
          <div className="flex items-baseline justify-between">
            <h2 id="health-h" className="text-sm text-slate-300">Financial health</h2>
            <p className="text-2xl font-bold">{m.healthScore}<span className="text-sm text-slate-400"> / 100</span></p>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {HEALTH_PARTS.map((p) => (
              <li key={p.key}>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{p.label}</span><span>{m.health[p.key]}/{p.max}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-emerald-400 transition-[width] duration-500"
                    style={{ width: `${(m.health[p.key] / p.max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${card} md:col-span-3`} aria-labelledby="fc-h">
          <h2 id="fc-h" className="mb-2 text-sm text-slate-300">30-day forecast</h2>
          <Suspense fallback={<p className="text-sm text-slate-400">Loading forecast…</p>}>
            <ForecastChart data={series} />
          </Suspense>
        </section>

        <section className={`${card} md:col-span-3`} aria-labelledby="next-h">
          <h2 id="next-h" className="mb-2 text-sm text-slate-300">Next 7 days: commitments and subscriptions</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing due this week. Enjoy the breathing room.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((u) => (
                <li key={u.name} className="rounded-xl border border-slate-800 p-3 text-sm">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-slate-300">{rupee(u.amount)} · Day {u.day}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${card} md:col-span-3`} aria-labelledby="log-h">
          <h2 id="log-h" className="mb-3 text-sm text-slate-300">Log an expense</h2>
          <AddExpense />
          <ul className="mt-4 divide-y divide-slate-800 text-sm">
            {recent.map((t) => (
              <li key={t.id} className="flex justify-between py-2">
                <span>{t.note} <span className="text-slate-400">· {t.category} · day {t.day}</span></span>
                <span>-{rupee(t.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}