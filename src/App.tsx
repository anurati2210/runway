import { useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import { Simulator } from './features/simulator/Simulator'

type Tab = 'dashboard' | 'simulator'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const btn = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
      active ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
    }`

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav aria-label="Main" className="sticky top-0 z-10 flex justify-center gap-2 border-b border-slate-800 bg-slate-950/90 p-3 backdrop-blur">
        <button className={btn(tab === 'dashboard')} aria-current={tab === 'dashboard' ? 'page' : undefined}
          onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={btn(tab === 'simulator')} aria-current={tab === 'simulator' ? 'page' : undefined}
          onClick={() => setTab('simulator')}>What-if</button>
      </nav>
      {tab === 'dashboard' ? <Dashboard /> : <div className="pt-6"><Simulator /></div>}
    </div>
  )
}