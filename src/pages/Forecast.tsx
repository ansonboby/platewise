import { useState, useMemo } from 'react';
import { TrendingUp, Info, ChevronDown, ChevronUp, Leaf, Calendar } from 'lucide-react';
import type { MealLog, MealType, Unit } from '@/types';
import { generateForecast, forecastForDate } from '@/lib/forecasting';
import { MEAL_TYPES, FOOD_CATEGORIES } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { FoodCategory } from '@/types';

interface ForecastProps {
  logs: MealLog[];
}

function confidenceBadge(c: 'high' | 'medium' | 'low') {
  return c === 'high' ? 'success' : c === 'medium' ? 'warning' : 'muted';
}

interface ForecastCardProps {
  foodItem: string;
  mealType: MealType;
  unit: Unit;
  targetDate: string;
  logs: MealLog[];
}

function ForecastCard({ foodItem, mealType, unit, targetDate, logs }: ForecastCardProps) {
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(
    () => generateForecast({ targetDate, mealType, foodItem, unit }, logs),
    [targetDate, mealType, foodItem, unit, logs],
  );

  return (
    <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between">
      <div className="bg-white rounded-[calc(1rem-0.25rem)] border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col justify-between h-full overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="font-bold font-display text-stone-900 text-base tracking-tight truncate">{foodItem}</p>
              <p className="text-xs text-stone-400 font-medium mt-0.5">{mealType} • {unit === 'kg' ? 'Kilograms' : 'Portions'}</p>
            </div>
            <Badge variant={confidenceBadge(result.confidence)} size="sm" className="font-bold uppercase tracking-wider text-[10px]">
              {result.confidence}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-stone-50 border border-stone-100 p-3">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Predicted Need</p>
              <p className="text-2xl font-extrabold font-display text-stone-800 tabular-nums mt-1">
                {result.predictedDemand} <span className="text-xs font-semibold text-stone-400">{unit}</span>
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-forest-50 to-emerald-50/60 border border-forest-200/80 p-3 shadow-2xs">
              <p className="text-[10px] text-forest-700 uppercase tracking-wider font-bold">Recommended Prep</p>
              <p className="text-2xl font-extrabold font-display text-forest-700 tabular-nums mt-1">
                {result.recommendedPreparation} <span className="text-xs font-bold text-forest-600">{unit}</span>
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between text-[11px] text-stone-400 font-medium">
            <span>{result.dataPointsUsed} historical logs • +{result.bufferPercent}% buffer</span>
            {result.historicalAccuracy !== undefined && (
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                {result.historicalAccuracy}% MAPE
              </span>
            )}
          </div>

          {result.isUsingDemoData && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2.5 py-1 font-medium">
              <Leaf className="h-3 w-3 shrink-0 text-amber-600" />
              <span>Simulated reference dataset</span>
            </div>
          )}
        </div>

        <div className="border-t border-stone-100 bg-stone-50/60 px-5 py-3">
          {/* Reasoning toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between text-xs text-forest-700 hover:text-forest-800 font-bold transition-colors active:scale-[0.99]"
          >
            <span>{expanded ? 'Hide Model Reasoning' : 'Inspect Mathematical Basis'}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {expanded && (
            <ul className="mt-2.5 space-y-1.5 pt-2 border-t border-stone-200/60 animate-in fade-in duration-200">
              {result.reasoning.map((r, i) => (
                <li key={i} className="text-xs text-stone-600 flex gap-2 leading-relaxed">
                  <span className="text-emerald-600 font-bold shrink-0">›</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function Forecast({ logs }: ForecastProps) {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [targetDate, setTargetDate] = useState(tomorrow);

  // Manual forecast form
  const [manualFood, setManualFood] = useState('');
  const [manualMeal, setManualMeal] = useState<MealType>('Lunch');
  const [manualUnit, setManualUnit] = useState<Unit>('kg');
  const [manualCategory, setManualCategory] = useState<FoodCategory>('Rice & Grains');
  const [attendanceHint, setAttendanceHint] = useState('');
  const [manualResult, setManualResult] = useState<ReturnType<typeof generateForecast> | null>(null);
  const [manualExpanded, setManualExpanded] = useState(false);

  const forecasts = useMemo(() => forecastForDate(targetDate, logs), [targetDate, logs]);

  function handleManualForecast() {
    if (!manualFood.trim()) return;
    const result = generateForecast(
      {
        targetDate,
        mealType: manualMeal,
        foodItem: manualFood.trim(),
        unit: manualUnit,
        attendanceHint: attendanceHint ? parseInt(attendanceHint) : undefined,
      },
      logs,
    );
    setManualResult(result);
  }

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
            Predictive Demand Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Statistical demand forecasting using exponentially weighted moving averages and day-of-week seasonality.
          </p>
        </div>
        <Badge variant="success" size="sm" className="font-bold">
          Weighted Moving Avg Model
        </Badge>
      </div>

      {/* Info banner */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 text-xs sm:text-sm text-sky-950 flex items-start gap-3 shadow-2xs">
        <Info className="h-4.5 w-4.5 shrink-0 mt-0.5 text-sky-600" />
        <span>
          <strong>How predictions work:</strong> Historical consumption from identical meal types is weighted with recency decay (0.9^rank) and adjusted by day-of-week attendance multipliers. A conservative 5%–20% safety margin is layered on top to prevent unexpected stockouts.
        </span>
      </div>

      {/* Date selector toolbar */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-stone-200/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold font-display text-stone-900">Forecast Target Date</p>
              <p className="text-[11px] text-stone-400 font-medium">Auto-populates predicted items based on recent schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick date presets */}
            {[
              { label: 'Tomorrow', offset: 1 },
              { label: '+2 Days', offset: 2 },
              { label: 'Weekend', offset: (6 - new Date().getDay() + 7) % 7 || 7 },
            ].map(preset => {
              const d = new Date();
              d.setDate(d.getDate() + preset.offset);
              const pStr = d.toISOString().split('T')[0];
              const isSelected = targetDate === pStr;
              return (
                <button
                  key={preset.label}
                  onClick={() => setTargetDate(pStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-forest-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            <div className="h-4 w-px bg-stone-200 hidden md:block" />

            <input
              type="date"
              value={targetDate}
              min={minDate}
              max={maxDate}
              onChange={e => setTargetDate(e.target.value)}
              className="border border-stone-200/90 rounded-xl py-1.5 px-3 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 bg-stone-50 hover:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Auto-generated forecasts from recent items */}
      {forecasts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Predicted Requirements for {new Date(targetDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <span className="text-[11px] font-semibold text-stone-400">{forecasts.length} Active Items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
            {forecasts.map((f, i) => (
              <ForecastCard
                key={i}
                foodItem={f.foodItem}
                mealType={f.mealType}
                unit={f.unit}
                targetDate={targetDate}
                logs={logs}
              />
            ))}
          </div>
        </section>
      )}

      {/* Manual custom forecast sandbox */}
      <section>
        <div className="mb-3.5">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Custom Demand Simulator
          </h2>
          <p className="text-xs text-stone-400">Test hypothetical dish demand with customized guest attendance hints</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card border border-stone-200/70 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Dish / Food Item"
              placeholder="e.g. Chicken Biryani"
              value={manualFood}
              onChange={e => setManualFood(e.target.value)}
            />
            <Select
              label="Meal Session"
              value={manualMeal}
              onChange={e => setManualMeal(e.target.value as MealType)}
              options={MEAL_TYPES.map(m => ({ value: m, label: m }))}
            />
            <Select
              label="Measurement Unit"
              value={manualUnit}
              onChange={e => setManualUnit(e.target.value as Unit)}
              options={[
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'portions', label: 'Portions' },
              ]}
            />
            <Select
              label="Menu Category"
              value={manualCategory}
              onChange={e => setManualCategory(e.target.value as FoodCategory)}
              options={FOOD_CATEGORIES.map(c => ({ value: c, label: c }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-1">
            <div className="md:col-span-2">
              <Input
                label="Attendance Modifier / Expected Guests (optional)"
                type="number"
                min="1"
                placeholder="e.g. 240 headcount"
                value={attendanceHint}
                onChange={e => setAttendanceHint(e.target.value)}
                helper="Blends empirical demand history (60%) with guest turnout forecast (40%)."
              />
            </div>
            <div>
              <Button
                onClick={handleManualForecast}
                disabled={!manualFood.trim()}
                className="w-full rounded-xl py-2.5 font-bold"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Compute Recommendation</span>
              </Button>
            </div>
          </div>

          {manualResult && (
            <div className="border-t border-stone-100 pt-5 mt-2 space-y-4 bg-stone-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white border border-stone-200 p-4 shadow-2xs">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Simulated Demand</p>
                  <p className="text-3xl font-extrabold font-display text-stone-900 tabular-nums mt-1">
                    {manualResult.predictedDemand} <span className="text-sm font-semibold text-stone-400 uppercase">{manualUnit}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-forest-50 to-emerald-50 border border-forest-200 p-4 shadow-2xs">
                  <p className="text-[10px] text-forest-700 uppercase tracking-wider font-bold">Optimal Batch Prep</p>
                  <p className="text-3xl font-extrabold font-display text-forest-700 tabular-nums mt-1">
                    {manualResult.recommendedPreparation} <span className="text-sm font-bold text-forest-600 uppercase">{manualUnit}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge variant={confidenceBadge(manualResult.confidence)} size="sm">
                  {manualResult.confidence} confidence
                </Badge>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 font-medium">{manualResult.dataPointsUsed} historical logs evaluated</span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 font-medium">+{manualResult.bufferPercent}% safety threshold</span>
                {manualResult.isUsingDemoData && (
                  <Badge variant="warning" size="sm">Simulated Data</Badge>
                )}
              </div>

              <button
                onClick={() => setManualExpanded(e => !e)}
                className="flex items-center gap-1.5 text-xs text-forest-700 hover:text-forest-900 font-bold"
              >
                {manualExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>{manualExpanded ? 'Hide formula explanation' : 'View mathematical steps'}</span>
              </button>

              {manualExpanded && (
                <ul className="space-y-1.5 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                  {manualResult.reasoning.map((r, i) => (
                    <li key={i} className="text-stone-600 flex gap-2">
                      <span className="text-forest-600 font-bold shrink-0">›</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
