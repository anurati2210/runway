import { useMemo, useState } from 'react'
import { computeMetrics } from '../../engine/computeMetrics'
import { simulate } from '../../engine/simulate'
import { useFinance } from '../../store/useFinance'
import { rupee } from '../../components/format'

const card = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-5'
const signed = (n: number) => (n > 0 ? `+${rupee(n)}` : rupee(n))

function eta(remaining: number, pace: number, skipped: boolean): string {
  if (remaining <= 0) return 'Goal reached'
  if (skipped) return 'Paused. Resume contributions to restart the clock.'
  if (pace <= 0) return 'No saving pace yet'
  const months = Math.ceil(remaining / pace)
  return `About ${months} month${months === 1 ? '' : 's'} at this pace`
}

export function Plan() {
  const state = useFinance()
  const m = useMemo(() => computeMetrics(state), [state])
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const day = state.currentDay

  const commitTotal = state.commitments.reduce((a, c) => a + c.amount, 0)
  const subTotal = state.subscriptions.filter((x) => x.active).reduce((a, x) => a + x.cost, 0)

  const openGoals = state.goals.filter((g) => !g.skipped && g.target - g.saved > 0)
  const extraEach =
    openGoals.length > 0
      ? Math.max(0, m.forecastEndBalance - state.emergencyBuffer) / openGoals.length
      : 0

  function addToGoal(id: string) {
    const v = Number(amounts[id])
    if (!Number.isFinite(v) || v <= 0) {
      setErrors((e) => ({ ...e, [id]: 'Enter an amount greater than 0' }))
      return
    }
    if (v > m.balance) {
      setErrors((e) => ({ ...e, [id]: 'That is more than your current balance' }))
      return
    }
    state.apply({ type: 'goal_contribute', goalId: id, amount: v })
    setAmounts((a) => ({ ...a, [id]: '' }))
    setErrors((e) => ({ ...e, [id]: '' }))
  }

  const field =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      <h1 className="text-2xl font-bold">Commitments, subscriptions and goals</h1>
      <p className="mb-5 text-sm text-slate-300">
        Day {day} of 30. Everything here feeds your balance, daily allowance and forecast.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={card} aria-labelledby="com-h">
          <h2 id="com-h" className="text-sm text-slate-300">Commitments</h2>
          <p className="mb-2 text-xs text-slate-400">{rupee(commitTotal)} this month</p>
          <ul className="divide-y divide-slate-800 text-sm">
            {state.commitments.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>
                  <span className="font-semibold">{c.name}</span>
                  <span className="block text-xs text-slate-400">
                    {c.dueDay <= day ? `Paid on day ${c.dueDay}` : `Due on day ${c.dueDay}`}
                  </span>
                </span>
                <span>{rupee(c.amount)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={card} aria-labelledby="sub-h">
          <h2 id="sub-h" className="text-sm text-slate-300">Subscriptions</h2>
          <p className="mb-2 text-xs text-slate-400">{rupee(subTotal)} per month while active</p>
          <ul className="divide-y divide-slate-800 text-sm">
            {state.subscriptions.map((x) => {
              const canToggle = x.renewalDay > day
              const impact = canToggle
                ? simulate(state, { type: 'subscription_toggle', id: x.id }).diff.safeDailyAllowance
                : 0
              let note: string
              if (!canToggle) {
                note = `Billed on day ${x.renewalDay}. The next bill falls outside this 30-day month.`
              } else if (x.active) {
                note = `Costs you ${rupee(x.cost)} before day 30 (renews day ${x.renewalDay}). Cancelling changes your daily allowance by ${signed(impact)}.`
              } else {
                note = `Cancelled. You keep ${rupee(x.cost)} this month. Resuming changes your daily allowance by ${signed(impact)}.`
              }
              return (
                <li key={x.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">
                      {x.name} <span className="font-normal text-slate-300">{rupee(x.cost)}</span>
                    </p>
                    <p className="text-xs text-slate-400">{note}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      role="switch"
                      aria-checked={x.active}
                      aria-label={`${x.name} subscription`}
                      disabled={!canToggle}
                      onClick={() => state.apply({ type: 'subscription_toggle', id: x.id })}
                      className={`h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40 ${
                        x.active ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                          x.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-slate-300">{x.active ? 'Active' : 'Cancelled'}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className={`${card} md:col-span-2`} aria-labelledby="goal-h">
          <h2 id="goal-h" className="mb-3 text-sm text-slate-300">Savings goals</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {state.goals.map((g) => {
              const remaining = g.target - g.saved
              const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
              const pace = g.skipped ? 0 : g.plan + extraEach
              return (
                <li key={g.id} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-sm text-slate-300">{pct}%</p>
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full bg-slate-800"
                    role="progressbar"
                    aria-label={`${g.name} progress`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-2 rounded-full bg-emerald-400 transition-[width] duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-300">
                    {rupee(g.saved)} of {rupee(g.target)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Monthly plan: {rupee(g.plan)}{g.skipped ? ' (skipped)' : ''}
                  </p>
                  <p className="mt-1 text-sm" role="status">{eta(remaining, pace, g.skipped)}</p>

                  <label htmlFor={`add-${g.id}`} className="mt-3 block text-xs text-slate-300">
                    Add to this goal (₹)
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id={`add-${g.id}`}
                      inputMode="numeric"
                      className={field}
                      value={amounts[g.id] ?? ''}
                      onChange={(e) => setAmounts((a) => ({ ...a, [g.id]: e.target.value }))}
                      placeholder="500"
                    />
                    <button
                      onClick={() => addToGoal(g.id)}
                      className="rounded-lg bg-emerald-400 px-3 font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Add
                    </button>
                  </div>
                  {errors[g.id] && <p role="alert" className="mt-1 text-xs text-rose-300">{errors[g.id]}</p>}

                  <button
                    onClick={() => state.apply({ type: 'goal_skip', goalId: g.id })}
                    className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    {g.skipped ? 'Resume contributions' : 'Skip this month'}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}