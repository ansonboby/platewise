import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { MealLog } from '@/types';
import {
  computeWasteByDayOfWeek,
  computeWasteByMealType,
  computeWasteByCategory,
  computeOverproductionAlerts,
} from '@/lib/analytics';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Info, Calendar, UtensilsCrossed, Layers, Flame } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomAnalyticsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800/80 rounded-xl shadow-xl p-3 text-xs text-white min-w-32">
      <p className="font-bold text-stone-300 pb-1 mb-1 border-b border-stone-800">{label}</p>
      {payload.map((p: { name: string; value: number; color?: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-3 text-[11px]">
          <span className="text-stone-400 capitalize">{p.name}:</span>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">
            {p.value}{p.name.includes('%') || p.name.includes('Waste') ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

interface AnalyticsProps {
  logs: MealLog[];
}

export function Analytics({ logs }: AnalyticsProps) {
  const byDay = useMemo(() => computeWasteByDayOfWeek(logs), [logs]);
  const byMeal = useMemo(() => computeWasteByMealType(logs), [logs]);
  const byCategory = useMemo(() => computeWasteByCategory(logs), [logs]);
  const overproduction = useMemo(() => computeOverproductionAlerts(logs), [logs]);

  const peakDay = useMemo(() => {
    return [...byDay].sort((a, b) => b.wastePercent - a.wastePercent)[0];
  }, [byDay]);

  const worstMeal = useMemo(() => {
    return byMeal[0];
  }, [byMeal]);

  if (logs.length < 5) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<BarChart3 className="h-8 w-8 text-forest-600" />}
          title="Not enough data for analytics"
          description="Log at least 5 meals to unlock multi-dimensional waste patterns and overproduction alerts."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
            Waste Pattern Analytics
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Identify recurring preparation imbalances across days of the week, meal sessions, and menu categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-bold text-forest-700">
            {logs.length} Audited Meals
          </span>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-200 hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-4 h-full border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-600 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Peak Waste Day</p>
              <p className="text-base font-extrabold font-display text-stone-900 truncate">{peakDay?.day ?? '—'}</p>
              <p className="text-[11px] font-semibold text-stone-500 tabular-nums">{peakDay?.wastePercent}% avg surplus</p>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-200 hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-4 h-full border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 shrink-0">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Heaviest Session</p>
              <p className="text-base font-extrabold font-display text-stone-900 truncate">{worstMeal?.mealType ?? '—'}</p>
              <p className="text-[11px] font-semibold text-stone-500 tabular-nums">{worstMeal?.avgWastePercent}% waste rate</p>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-200 hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-4 h-full border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-600 shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Top Surplus Category</p>
              <p className="text-base font-extrabold font-display text-stone-900 truncate">
                {byCategory[0]?.category ?? '—'}
              </p>
              <p className="text-[11px] font-semibold text-stone-500 tabular-nums">{byCategory[0]?.avgWastePercent}% surplus</p>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-200 hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-4 h-full border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-600 shrink-0">
              <Flame className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Anomalous Items</p>
              <p className="text-base font-extrabold font-display text-stone-900 truncate">{overproduction.length} Flagged</p>
              <p className="text-[11px] font-semibold text-stone-500">≥15% waste repeated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700" />
        <span>
          <strong>Calculation basis:</strong> All percentages represent the ratio of remaining food to prepared food.
          Dual-unit normalization is maintained without converting between weight and count.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Day of Week */}
        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-5.5 border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold font-display text-stone-900 tracking-tight">Waste Rate by Day of Week</h3>
                  <p className="text-[11px] text-stone-400 font-medium">Surplus concentration across weekly schedules</p>
                </div>
                <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  7-Day Cycle
                </span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDay} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#78716C', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#78716C', fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip content={<CustomAnalyticsTooltip />} />
                    <Bar dataKey="wastePercent" name="Waste Rate" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {byDay.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.wastePercent > 20 ? '#EF4444' : entry.wastePercent > 12 ? '#F97316' : '#1B7A4B'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[11px] font-medium text-stone-500 mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-forest-600 font-bold">Insight:</span>
              {peakDay?.day} consistently exhibits the highest surplus rate ({peakDay?.wastePercent}%), typically driven by weekend hostel departures.
            </p>
          </div>
        </div>

        {/* By Meal Type */}
        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-5.5 border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold font-display text-stone-900 tracking-tight">Waste Rate by Meal Session</h3>
                  <p className="text-[11px] text-stone-400 font-medium">Average overproduction across daily services</p>
                </div>
                <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  Session Split
                </span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byMeal} layout="vertical" margin={{ top: 8, right: 16, left: 32, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#78716C', fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis dataKey="mealType" type="category" tick={{ fontSize: 11, fill: '#44403C', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomAnalyticsTooltip />} />
                    <Bar dataKey="avgWastePercent" name="Waste %" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                      {byMeal.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.avgWastePercent > 20 ? '#EF4444' : entry.avgWastePercent > 12 ? '#F97316' : '#1B7A4B'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[11px] font-medium text-stone-500 mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-forest-600 font-bold">Insight:</span>
              {worstMeal?.mealType} leads in surplus ({worstMeal?.avgWastePercent}%). Implementing batch cooking can mitigate up to 70% of this excess.
            </p>
          </div>
        </div>

        {/* By Food Category */}
        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-5.5 border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] h-full">
            <h3 className="text-sm font-bold font-display text-stone-900 tracking-tight mb-1">Waste Breakdown by Category</h3>
            <p className="text-[11px] text-stone-400 font-medium mb-4">Ranked by average waste proportion</p>
            <div className="space-y-3.5">
              {byCategory.slice(0, 6).map(cat => (
                <div key={cat.category} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-stone-800 font-bold">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 font-medium">({cat.count} logs)</span>
                      <span className="text-xs font-bold font-mono text-stone-900 tabular-nums">{cat.avgWastePercent}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(cat.avgWastePercent, 100)}%`,
                        backgroundColor: cat.avgWastePercent > 20 ? '#EF4444' : cat.avgWastePercent > 12 ? '#F97316' : '#1B7A4B',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overproduction Alerts */}
        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-5.5 border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold font-display text-stone-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Repeated Overproduction Patterns
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium mb-4">Dishes with ≥15% waste across multiple services</p>

            {overproduction.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">No persistent overproduction detected.</p>
            ) : (
              <div className="space-y-3">
                {overproduction.map((alert, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{alert.foodItem}</p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {alert.mealType} • Last logged: {new Date(alert.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="danger" size="sm" className="font-mono font-bold">
                        {alert.avgWastePercent}% waste
                      </Badge>
                      <p className="text-[10px] font-bold text-stone-500 mt-1 uppercase tracking-wide">
                        {alert.occurrences}× detected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-stone-100 text-xs text-stone-600 bg-stone-50 -mx-5.5 -mb-5.5 p-4 rounded-b-2xl">
            💡 <strong>Algorithmic Recommendation:</strong> Trim baseline preparation of{' '}
            <strong>{overproduction[0]?.foodItem}</strong> by {Math.round((overproduction[0]?.avgWastePercent ?? 25) * 0.7)}% next week to immediately reduce canteen expenditure.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
