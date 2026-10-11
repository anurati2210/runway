import { useMemo, useState } from 'react'
import { Zap } from 'lucide-react'
import { computeMetrics } from '../../engine/computeMetrics'
import { simulate } from '../../engine/simulate'
import { useFinance } from '../../store/useFinance'
import { rupee } from '../../components/format'

const EVENTS = [
  { id: 'phone', label: 'Phone screen repair', amount: 1800 },
  { id: 'birthday', label: "Friend's birthday gift", amount: 600 },
  { id: 'cab', label: 'Late-night cab fare', amount: 350 },
  { id: 'medical', label: 'Doctor visit and medicines', amount: 900 },
  { id: 'charger', label: 'Laptop charger replacement', amount: 1200 },
]

const card = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-5'

export function Timeline() {
  const state = useFinance()
  const [eventId, setEventId] = useState(EVENTS[0].id)
  const [last, setLast] = useState('')
  const ev = EVENTS.find((e) => e.id === eventId) ?? EVENTS[0]

  const m = useMemo(() => computeMetrics(state), [state])
  const sim = useMemo(
    () => simulate(state, { type: 'surprise', amount: ev.amount, note: ev.label }),
    [state, ev],
  )
  const history = useMemo(
    () =>
      state.transactions
        .filter((t) => t.day <= state.currentDay)
        .sort((a, b) => b.day - a.day)
        .slice(0, 8),
    [state.transactions, state.currentDay],
  )

  function trigger() {
    state.apply({ type: 'surprise', amount: ev.amount, note: ev.label })
    setLast(`${ev.label} cost you ${rupee(ev.amount)} on day ${state.currentDay}. Check how the plan held up.`)
  }

  const field =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'

  const stats = [
    { label: 'Balance', before: rupee(sim.before.balance), after: rupee(sim.after.balance) },
    { label: 'Safe daily allowance', before: rupee(sim.before.safeDailyAllowance), after: rupee(sim.after.safeDailyAllowance) },
    { label: 'Forecast end balance', before: rupee(sim.before.forecastEndBalance), after: rupee(sim.after.forecastEndBalance) },
    { label: 'Financial risk', before: sim.before.riskLevel, after: sim.after.riskLevel },
    { label: 'Financial health', before: String(sim.before.healthScore), after: String(sim.after.healthScore) },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      <h1 className="text-2xl font-bold">Timeline and surprise expenses</h1>
      <p className="mb-5 text-sm text-slate-300">
        Move through the month, then stress-test your plan with an unexpected expense.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={card} aria-labelledby="day-h">
          <h2 id="day-h" className="text-sm text-slate-300">Jump to a day</h2>
          <label htmlFor="day-range" className="mt-3 block text-lg font-semibold">
            Day {state.currentDay} of 30
          </label>
          <input
            id="day-range"
            type="range"
            min={1}
            max={30}
            value={state.currentDay}
            onChange={(e) => state.setDay(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-400"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Day 1</span>
            <span>Day 30</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-400">Balance</dt><dd className="text-lg font-bold">{rupee(m.balance)}</dd></div>
            <div><dt className="text-slate-400">Safe daily allowance</dt><dd className="text-lg font-bold">{rupee(m.safeDailyAllowance)}</dd></div>
            <div><dt className="text-slate-400">Spent so far</dt><dd className="text-lg font-bold">{rupee(m.spent)}</dd></div>
            <div><dt className="text-slate-400">Risk</dt><dd className="text-lg font-bold">{m.riskLevel}</dd></div>
          </dl>
        </section>

        <section className={card} aria-labelledby="sur-h">
          <h2 id="sur-h" className="text-sm text-slate-300">Surprise expense</h2>
          <label htmlFor="ev" className="mb-1 mt-3 block text-sm text-slate-300">What happens?</label>
          <select id="ev" className={field} value={eventId}
            onChange={(e) => { setEventId(e.target.value); setLast('') }}>
            {EVENTS.map((e) => <option key={e.id} value={e.id}>{e.label} ({rupee(e.amount)})</option>)}
          </select>

          <ul className="mt-3 divide-y divide-slate-800 text-sm">
            {stats.map((r) => (
              <li key={r.label} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <span className="text-slate-300">{r.label}</span>
                <span>
                  <span className="text-slate-400">{r.before}</span>
                  <span aria-hidden="true"> → </span>
                  <span className="sr-only"> becomes </span>
                  <span className="font-bold">{r.after}</span>
                </span>
              </li>
            ))}
          </ul>

          <button onClick={trigger}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <Zap size={16} aria-hidden="true" /> Trigger surprise expense
          </button>
          {last && <p className="mt-3 text-sm text-emerald-300" role="status">{last}</p>}
        </section>

        <section className={`${card} md:col-span-2`} aria-labelledby="hist-h">
          <h2 id="hist-h" className="mb-2 text-sm text-slate-300">Recent activity up to day {state.currentDay}</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No spending logged yet.</p>
          ) : (
            <ul className="divide-y divide-slate-800 text-sm">
              {history.map((t) => (
                <li key={t.id} className="flex justify-between py-2">
                  <span>{t.note} <span className="text-slate-400">· {t.category} · day {t.day}</span></span>
                  <span>-{rupee(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}