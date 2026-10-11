import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { simulate } from '../../engine/simulate'
import type { Decision, Simulation } from '../../engine/simulate'
import type { Category } from '../../engine/types'
import { useFinance } from '../../store/useFinance'
import { rupee } from '../../components/format'

type Kind = Decision['type']

const KINDS: { value: Kind; label: string }[] = [
  { value: 'purchase', label: 'Buy something' },
  { value: 'surprise', label: 'Unexpected expense' },
  { value: 'subscription_add', label: 'Add a subscription' },
  { value: 'subscription_toggle', label: 'Cancel / resume a subscription' },
  { value: 'goal_contribute', label: 'Put money into a goal' },
  { value: 'goal_skip', label: 'Skip a goal contribution' },
]

const CATEGORIES: Category[] = ['food', 'transport', 'shopping', 'fun', 'bills', 'other']

const field =
  'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'

const plain = (n: number) => String(n)

function verdict(s: Simulation): string {
  if (s.after.riskLevel === 'High' && s.before.riskLevel !== 'High') {
    return 'Danger zone This pushes you into high risk!!.'
  }
  if (s.after.forecastEndBalance < 0) return "You'd end the month in the red. Rethink this one."
  if (s.diff.forecastEndBalance > 0) {
    return `Nice move 🙌 You'd be ${rupee(s.diff.forecastEndBalance)} better off by day 30.`
  }
  if (s.diff.forecastEndBalance < 0) {
    return `This costs you ${rupee(-s.diff.forecastEndBalance)} by day 30.`
  }
  return 'No big change to your month.'
}

export function Simulator() {
  const state = useFinance()
  const [kind, setKind] = useState<Kind>('purchase')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('shopping')
  const [name, setName] = useState('')
  const [renewal, setRenewal] = useState('')
  const [subId, setSubId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [done, setDone] = useState('')

  const amt = Number(amount)
  const validAmt = Number.isFinite(amt) && amt > 0
  const selSub = subId || state.subscriptions[0]?.id || ''
  const selGoal = goalId || state.goals[0]?.id || ''
  const renewalDay = Math.min(
    30,
    Math.max(1, Number(renewal) || Math.min(30, state.currentDay + 3)),
  )

  let decision: Decision | null = null
  if (kind === 'purchase' && validAmt) {
    decision = { type: 'purchase', amount: amt, category, note: name.trim() || 'Purchase' }
  } else if (kind === 'surprise' && validAmt) {
    decision = { type: 'surprise', amount: amt, note: 'Surprise expense' }
  } else if (kind === 'subscription_add' && validAmt && name.trim()) {
    decision = { type: 'subscription_add', name: name.trim(), cost: amt, renewalDay }
  } else if (kind === 'subscription_toggle' && selSub) {
    decision = { type: 'subscription_toggle', id: selSub }
  } else if (kind === 'goal_contribute' && validAmt && selGoal) {
    decision = { type: 'goal_contribute', goalId: selGoal, amount: amt }
  } else if (kind === 'goal_skip' && selGoal) {
    decision = { type: 'goal_skip', goalId: selGoal }
  }

  const sim = decision ? simulate(state, decision) : null

  const needsAmount = kind === 'purchase' || kind === 'surprise' || kind === 'subscription_add' || kind === 'goal_contribute'

  function clear() {
    setAmount('')
    setName('')
    setRenewal('')
  }

  function confirm() {
    if (!decision) return
    state.apply(decision)
    clear()
    setDone('Done! Your dashboard, forecast and goals just updated.')
  }

  const rows = sim
    ? [
        { label: 'Balance', before: sim.before.balance, after: sim.after.balance, up: true, fmt: rupee },
        { label: 'Safe daily allowance', before: sim.before.safeDailyAllowance, after: sim.after.safeDailyAllowance, up: true, fmt: rupee },
        { label: 'Forecast end balance', before: sim.before.forecastEndBalance, after: sim.after.forecastEndBalance, up: true, fmt: rupee },
        { label: 'Money set aside for goals', before: sim.before.goalReserve, after: sim.after.goalReserve, up: true, fmt: rupee },
        { label: 'Financial health', before: sim.before.healthScore, after: sim.after.healthScore, up: true, fmt: plain },
      ]
    : []

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      <h1 className="text-2xl font-bold">What-if simulator</h1>
      <p className="mb-5 text-sm text-slate-300">
        Try it before you buy it. See what a decision does to your Day {state.currentDay} money before you commit.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5" aria-labelledby="dec-h">
          <h2 id="dec-h" className="mb-3 text-sm text-slate-300">Your decision</h2>
          <div className="grid gap-3">
            <div>
              <label htmlFor="kind" className="mb-1 block text-sm text-slate-300">What are you thinking of doing?</label>
              <select id="kind" className={field} value={kind}
                onChange={(e) => { setKind(e.target.value as Kind); setDone('') }}>
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>

            {needsAmount && (
              <div>
                <label htmlFor="sim-amt" className="mb-1 block text-sm text-slate-300">
                  {kind === 'subscription_add' ? 'Cost per month (₹)' : 'Amount (₹)'}
                </label>
                <input id="sim-amt" inputMode="numeric" className={field} value={amount}
                  onChange={(e) => { setAmount(e.target.value); setDone('') }} placeholder="2000" />
              </div>
            )}

            {kind === 'purchase' && (
              <div>
                <label htmlFor="sim-cat" className="mb-1 block text-sm text-slate-300">Category</label>
                <select id="sim-cat" className={field} value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {(kind === 'purchase' || kind === 'subscription_add') && (
              <div>
                <label htmlFor="sim-name" className="mb-1 block text-sm text-slate-300">
                  {kind === 'purchase' ? 'What is it?' : 'Subscription name'}
                </label>
                <input id="sim-name" className={field} value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={kind === 'purchase' ? 'Sneakers' : 'Hotstar'} />
              </div>
            )}

            {kind === 'subscription_add' && (
              <div>
                <label htmlFor="sim-renew" className="mb-1 block text-sm text-slate-300">Renews on day (1 to 30)</label>
                <input id="sim-renew" inputMode="numeric" className={field} value={renewal}
                  onChange={(e) => setRenewal(e.target.value)} placeholder={String(Math.min(30, state.currentDay + 3))} />
              </div>
            )}

            {kind === 'subscription_toggle' && (
              <div>
                <label htmlFor="sim-sub" className="mb-1 block text-sm text-slate-300">Which subscription?</label>
                <select id="sim-sub" className={field} value={selSub} onChange={(e) => setSubId(e.target.value)}>
                  {state.subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({rupee(s.cost)}) · {s.active ? 'active, cancel it' : 'cancelled, resume it'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(kind === 'goal_contribute' || kind === 'goal_skip') && (
              <div>
                <label htmlFor="sim-goal" className="mb-1 block text-sm text-slate-300">Which goal?</label>
                <select id="sim-goal" className={field} value={selGoal} onChange={(e) => setGoalId(e.target.value)}>
                  {state.goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({rupee(g.saved)} of {rupee(g.target)})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5" aria-labelledby="out-h">
          <h2 id="out-h" className="mb-3 text-sm text-slate-300">What changes</h2>
          {!sim ? (
            <p className="text-sm text-slate-400">Fill in the details and the before and after will show up here.</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-800">
                {rows.map((r) => {
                  const delta = r.after - r.before
                  const good = delta === 0 ? null : (delta > 0) === r.up
                  const tone = good === null ? 'text-slate-300' : good ? 'text-emerald-300' : 'text-rose-300'
                  const mark = delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '• '
                  return (
                    <li key={r.label} className="py-2 text-sm">
                      <p className="text-slate-300">{r.label}</p>
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-slate-400">{r.fmt(r.before)}</span>
                        <span aria-hidden="true">→</span>
                        <span className="text-lg font-bold">{r.fmt(r.after)}</span>
                        <span className={`text-xs ${tone}`}>{mark}{r.fmt(delta)}</span>
                      </p>
                    </li>
                  )
                })}
                <li className="py-2 text-sm">
                  <p className="text-slate-300">Financial risk</p>
                  <p>
                    <span className="text-slate-400">{sim.before.riskLevel}</span> → <span className="text-lg font-bold">{sim.after.riskLevel}</span>
                    {sim.before.riskLevel !== sim.after.riskLevel && <span className="ml-2 text-xs text-amber-300">risk level changed</span>}
                  </p>
                </li>
              </ul>
              <p className="mt-3 rounded-lg bg-slate-800 p-3 text-sm" role="status">{verdict(sim)}</p>
              <div className="mt-4 flex gap-3">
                <button onClick={confirm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <Check size={16} /> Confirm
                </button>
                <button onClick={clear}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                  <X size={16} /> Cancel
                </button>
              </div>
            </>
          )}
          {done && <p className="mt-3 text-sm text-emerald-300" role="status">{done}</p>}
        </section>
      </div>
    </div>
  )
}