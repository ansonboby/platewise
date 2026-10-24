import { useMemo } from 'react';
import { Utensils, TrendingDown, DollarSign, Leaf, Sparkles, ChefHat, ArrowUpRight, Plus, PackageOpen } from 'lucide-react';
import type { MealLog, PageId } from '@/types';
import { computeDashboardStats, computeTrend, generateRecommendations } from '@/lib/analytics';
import { forecastForDate } from '@/lib/forecasting';
import { StatCard } from '@/components/dashboard/StatCard';
import { WasteTrendChart } from '@/components/dashboard/WasteTrendChart';
import { RecommendationCard, RecommendationEmptyState } from '@/components/dashboard/RecommendationCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DashboardProps {
  logs: MealLog[];
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ logs, onNavigate }: DashboardProps) {
  const stats = useMemo(() => computeDashboardStats(logs), [logs]);
  const trend = useMemo(() => computeTrend(logs, 14), [logs]);
  const recommendations = useMemo(() => generateRecommendations(logs), [logs]);

  // Forecast next meal (tomorrow's lunch as a key example)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const forecasts = useMemo(() => forecastForDate(tomorrow, logs).slice(0, 3), [tomorrow, logs]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-7">
      {/* Hero Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-forest-100/80 text-forest-800 rounded-full border border-forest-200">
              Kitchen Operations Hub
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs font-semibold text-stone-500">Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
            Food Waste Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Real-time surplus tracking, automated demand recommendations, and rescue routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate('surplus')}
            className="rounded-xl border-stone-200 text-stone-700 shadow-sm"
          >
            <PackageOpen className="h-4 w-4 text-forest-600" />
            <span>Surplus Rescue</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('meal-logging')}
            className="rounded-xl shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Log Meal Entry</span>
          </Button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300/80">
            <Sparkles className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <span className="font-bold">Simulated Dataset Active:</span>
            <span className="text-amber-800/90 ml-1">
              43 historical canteen records loaded to demonstrate ML-style forecasting and pattern alerts.
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('meal-logging')}
          className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline underline-offset-2 shrink-0"
        >
          Add live record <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Key Metric Stats Grid */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Operational Overview (30 Days)
          </h2>
          <span className="text-[11px] font-semibold text-stone-400">
            {stats.combined.totalEntries} logged productions
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bulk Prepared"
            value={stats.kg.totalPrepared}
            unit="kg"
            trend={-4.2}
            trendLabel="surplus rate down"
            trendPositiveIsGood={true}
            icon={<ChefHat className="h-4.5 w-4.5 text-forest-700" />}
            iconBg="bg-forest-50 border-forest-200/80"
            subtitle={`${stats.kg.totalServed} kg served (${stats.kg.totalSurplus} kg surplus)`}
          />
          <StatCard
            title="Portioned Meals"
            value={stats.portions.totalPrepared}
            unit="portions"
            trend={2.8}
            trendLabel="attendance volume"
            icon={<Utensils className="h-4.5 w-4.5 text-sky-700" />}
            iconBg="bg-sky-50 border-sky-200/80"
            subtitle={`${stats.portions.totalServed} served (${stats.portions.totalSurplus} surplus)`}
          />
          <StatCard
            title="Blended Waste Rate"
            value={`${stats.combined.wastePercent}%`}
            trend={-3.1}
            trendLabel="vs previous cycle"
            trendPositiveIsGood={false}
            icon={<TrendingDown className="h-4.5 w-4.5 text-amber-600" />}
            iconBg="bg-amber-50 border-amber-200/80"
            subtitle="Calculated over total prepared"
          />
          <StatCard
            title="Surplus Food Value"
            value={`₹${stats.combined.surplusCostINR.toLocaleString('en-IN')}`}
            trend={-8.5}
            trendLabel="loss reduction"
            trendPositiveIsGood={false}
            icon={<DollarSign className="h-4.5 w-4.5 text-red-600" />}
            iconBg="bg-red-50 border-red-200/80"
            subtitle="Recoverable surplus value"
          />
        </div>
      </section>

      {/* Main Charts & Tomorrow's Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WasteTrendChart data={trend} />
        </div>

        {/* Forecast Mini Panel */}
        <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover flex flex-col justify-between">
          <div className="bg-white rounded-[calc(1rem-0.25rem)] p-5 border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
                    <h3 className="text-sm font-bold font-display text-stone-900 tracking-tight">Tomorrow's Forecast</h3>
                  </div>
                  <p className="text-[11px] font-medium text-stone-400 mt-0.5">
                    {new Date(tomorrow).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('forecast')}
                  className="text-xs font-semibold text-forest-700 hover:text-forest-800 !py-1 !px-2.5"
                >
                  Full Planner
                </Button>
              </div>

              {forecasts.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">No forecast data available. Log meals to start.</p>
              ) : (
                <div className="space-y-2.5">
                  {forecasts.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/60 hover:bg-forest-50/40 hover:border-forest-200 transition-all duration-150 flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate group-hover:text-forest-900 transition-colors">{f.foodItem}</p>
                        <p className="text-[11px] font-medium text-stone-400">{f.mealType}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold font-display text-forest-700 tabular-nums">
                          {f.result.recommendedPreparation} <span className="text-[10px] font-normal text-forest-600 uppercase">{f.unit}</span>
                        </p>
                        <Badge
                          variant={f.result.confidence === 'high' ? 'success' : f.result.confidence === 'medium' ? 'warning' : 'muted'}
                          size="sm"
                        >
                          {f.result.confidence}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5 text-forest-700 font-semibold">
                <Leaf className="h-3.5 w-3.5" />
                WMA + Seasonality Model
              </span>
              <button
                onClick={() => onNavigate('forecast')}
                className="text-stone-500 hover:text-stone-800 font-medium underline underline-offset-2 transition-colors"
              >
                Adjust weights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence & Automated Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Autonomous Waste Intelligence
            </h2>
            <p className="text-xs text-stone-400">Algorithmic findings based on recurring preparation anomalies</p>
          </div>
          <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
            {recommendations.length} Active Insights
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.length === 0 ? (
            <div className="col-span-2">
              <RecommendationEmptyState />
            </div>
          ) : (
            recommendations.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAction={rec => {
                  if (rec.actionLabel === 'View in Analytics') onNavigate('analytics');
                  else if (rec.actionLabel === 'Go to Surplus Rescue') onNavigate('surplus');
                  else if (rec.actionLabel === 'View Forecast') onNavigate('forecast');
                }}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
