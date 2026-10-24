import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TrendPoint } from '@/types';

interface WasteTrendChartProps {
  data: TrendPoint[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800/80 rounded-xl shadow-xl p-3 text-xs text-white min-w-36">
      <p className="font-bold text-stone-300 pb-1.5 mb-1.5 border-b border-stone-800">{formatDate(label)}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-stone-400 capitalize">{p.name}</span>
          </div>
          <span className="font-bold font-mono text-white tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function WasteTrendChart({ data }: WasteTrendChartProps) {
  return (
    <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover">
      <div className="bg-white rounded-[calc(1rem-0.25rem)] p-5 border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
              <h3 className="text-sm font-bold font-display text-stone-900 tracking-tight">Production vs Surplus Flow</h3>
            </div>
            <p className="text-[11px] text-stone-400 font-medium mt-0.5">Daily volume tracking across past 14 days</p>
          </div>
          <div className="flex items-center gap-3 text-xs bg-stone-50/80 px-3 py-1.5 rounded-xl border border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1B7A4B] shadow-2xs" />
              <span className="text-stone-600 text-[11px] font-semibold">Prepared</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#5EB688] shadow-2xs" />
              <span className="text-stone-600 text-[11px] font-semibold">Served</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#F97316] shadow-2xs" />
              <span className="text-stone-600 text-[11px] font-semibold">Surplus</span>
            </div>
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPrepared" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B7A4B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1B7A4B" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gradServed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5EB688" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#5EB688" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gradSurplus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: '#78716C', fontWeight: 500 }}
                axisLine={{ stroke: '#E7E5E4' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#78716C', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="prepared"
                name="Prepared"
                stroke="#1B7A4B"
                strokeWidth={2.5}
                fill="url(#gradPrepared)"
                dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#FFFFFF', fill: '#1B7A4B' }}
            />
            <Area
              type="monotone"
              dataKey="served"
              name="Served"
              stroke="#5EB688"
              strokeWidth={2}
              fill="url(#gradServed)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#FFFFFF', fill: '#5EB688' }}
            />
            <Area
              type="monotone"
              dataKey="surplus"
              name="Surplus"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#gradSurplus)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#FFFFFF', fill: '#F97316' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
  );
}
