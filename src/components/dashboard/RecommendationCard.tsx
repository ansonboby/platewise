import { clsx } from 'clsx';
import { AlertCircle, ArrowRight, TrendingDown, TrendingUp, Info } from 'lucide-react';
import type { Recommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction?: (rec: Recommendation) => void;
}

const IMPACT_ICONS = {
  high: AlertCircle,
  medium: TrendingDown,
  low: TrendingUp,
};

const IMPACT_STYLES = {
  high: {
    container: 'bg-red-50/70 border-red-200/90 text-red-950',
    iconBg: 'bg-red-100 text-red-700 border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-300/80',
    btn: 'text-red-700 hover:text-red-800 bg-red-100/80 hover:bg-red-200/80',
    label: 'High Priority',
  },
  medium: {
    container: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
    iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300/80',
    btn: 'text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200/80',
    label: 'Optimization',
  },
  low: {
    container: 'bg-forest-50/60 border-forest-200/80 text-forest-950',
    iconBg: 'bg-forest-100 text-forest-700 border-forest-200',
    badge: 'bg-forest-100 text-forest-800 border-forest-300/80',
    btn: 'text-forest-700 hover:text-forest-800 bg-forest-100/80 hover:bg-forest-200/80',
    label: 'Insight',
  },
};

export function RecommendationCard({ recommendation: rec, onAction }: RecommendationCardProps) {
  const Icon = IMPACT_ICONS[rec.impact];
  const style = IMPACT_STYLES[rec.impact];

  return (
    <div
      className={clsx(
        'group p-1 rounded-2xl ring-1 ring-stone-900/5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover hover:-translate-y-0.5',
      )}
    >
      <div
        className={clsx(
          'rounded-[calc(1rem-0.25rem)] border p-4.5 flex gap-4 h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-200',
          style.container,
        )}
      >
        <div className={clsx('h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs', style.iconBg)}>
          <Icon className="h-4.5 w-4.5 stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', style.badge)}>
              {style.label}
            </span>
          </div>
          <p className="text-sm font-bold text-stone-900 leading-snug tracking-tight font-display">{rec.title}</p>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rec.description}</p>
          {rec.actionLabel && onAction && (
            <button
              onClick={() => onAction(rec)}
              className={clsx(
                'mt-3 inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl text-xs font-bold transition-all duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]',
                style.btn,
              )}
            >
              <span>{rec.actionLabel}</span>
              <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center shadow-2xs">
                <ArrowRight className="h-3 w-3 transition-transform duration-160 group-hover:translate-x-0.5" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecommendationEmptyState() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 bg-stone-50 text-stone-500">
      <Info className="h-4 w-4 shrink-0" />
      <p className="text-sm">Log at least 5 meals to receive automated recommendations.</p>
    </div>
  );
}
