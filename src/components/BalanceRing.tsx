import type { ReactNode } from 'react'

export function BalanceRing({
  value,
  total,
  children,
}: {
  value: number
  total: number
  children: ReactNode
}) {
  const r = 70
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, total > 0 ? value / total : 0))
  return (
    <div className="relative h-48 w-48">
      <svg
        viewBox="0 0 180 180"
        className="h-full w-full"
        role="img"
        aria-label={`${Math.round(pct * 100)}% of your budget is left`}
      >
        <circle cx="90" cy="90" r={r} fill="none" strokeWidth="14" className="stroke-slate-800" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 90 90)"
          className="stroke-emerald-400 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}