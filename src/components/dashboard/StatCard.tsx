import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number; // percent change (positive = good or bad depending on context)
  trendLabel?: string;
  trendPositiveIsGood?: boolean;
  icon?: ReactNode;
  iconBg?: string;
  className?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  trendPositiveIsGood = true,
  icon,
  iconBg = 'bg-forest-50 border-forest-100/80 text-forest-700',
  className,
  subtitle,
}: StatCardProps) {
  const isPositive = (trend ?? 0) > 0;
  const isNeutral = trend === 0 || trend === undefined;
  const trendGood = trendPositiveIsGood ? isPositive : !isPositive;

  return (
    <div
      className={clsx(
        'group relative rounded-2xl p-1 bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="bg-white rounded-[calc(1rem-0.25rem)] p-4.5 sm:p-5 h-full flex flex-col justify-between border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] relative overflow-hidden">
        {/* Subtle radial sheen on card hover */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500 pointer-events-none" />

        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.14em]">
              {title}
            </span>
            {icon && (
              <div
                className={clsx(
                  'p-2 rounded-xl border shadow-2xs transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 shrink-0',
                  iconBg,
                )}
              >
                {icon}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl sm:text-3.5xl font-extrabold font-display text-stone-900 tracking-tight tabular-nums">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {unit}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-stone-500 font-medium mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {trend !== undefined && (
          <div className="mt-4 pt-2.5 border-t border-stone-100/90 flex items-center justify-between gap-2">
            <div
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                isNeutral
                  ? 'bg-stone-50 border-stone-200 text-stone-600'
                  : trendGood
                  ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
                  : 'bg-red-50 border-red-200/80 text-red-700',
              )}
            >
              {isNeutral ? (
                <Minus className="h-3 w-3 stroke-[2.5]" />
              ) : isPositive ? (
                <TrendingUp className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <TrendingDown className="h-3 w-3 stroke-[2.5]" />
              )}
              <span className="tabular-nums">
                {isNeutral ? 'Stable' : `${Math.abs(trend).toFixed(1)}%`}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 truncate">
              {trendLabel ?? 'vs last week'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
