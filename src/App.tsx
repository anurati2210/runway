import { useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import { Simulator } from './features/simulator/Simulator'
import { Plan } from './features/plan/Plan'
import { Timeline } from './features/timeline/Timeline'

type Tab = 'dashboard' | 'simulator' | 'plan' | 'timeline'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'simulator', label: 'What-if' },
  { id: 'plan', label: 'Plan' },
  { id: 'timeline', label: 'Timeline' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const btn = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
      active ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
    }`

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav aria-label="Main" className="sticky top-0 z-10 flex flex-wrap justify-center gap-2 border-b border-slate-800 bg-slate-950/90 p-3 backdrop-blur">
        {TABS.map((t) => (
          <button key={t.id} className={btn(tab === t.id)} aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'simulator' && <div className="pt-6"><Simulator /></div>}
      {tab === 'plan' && <div className="pt-6"><Plan /></div>}
      {tab === 'timeline' && <div className="pt-6"><Timeline /></div>}
    </div>
  )
}