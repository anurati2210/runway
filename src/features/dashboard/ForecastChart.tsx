import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ForecastPoint } from '../../engine/forecast'
import { rupee } from '../../components/format'

export default function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Projected balance from today until day 30">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" tickFormatter={(d) => `D${d}`} />
          <YAxis stroke="#94a3b8" width={64} tickFormatter={(v) => rupee(Number(v))} />
          <Tooltip
            formatter={(v) => rupee(Number(v))}
            labelFormatter={(d) => `Day ${d}`}
            contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
          />
          <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#34d399"
            fill="#34d399"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}