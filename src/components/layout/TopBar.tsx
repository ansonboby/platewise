import { Bell, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  'dashboard':    { title: 'Dashboard',      subtitle: 'Overview of food production and waste' },
  'meal-logging': { title: 'Meal Logging',   subtitle: 'Record food preparation and consumption' },
  'analytics':    { title: 'Analytics',      subtitle: 'Waste patterns and insights' },
  'forecast':     { title: 'Demand Forecast',subtitle: 'Predicted demand for upcoming meals' },
  'surplus':      { title: 'Surplus Rescue', subtitle: 'Coordinate redistribution of surplus food' },
};

interface TopBarProps {
  currentPage: string;
  onResetDemo: () => void;
}

export function TopBar({ currentPage, onResetDemo }: TopBarProps) {
  const { title, subtitle } = PAGE_TITLES[currentPage] ?? { title: currentPage, subtitle: '' };
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold font-display text-stone-900 tracking-tight leading-tight">{title}</h1>
          <p className="text-[11px] text-stone-400 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100/80 border border-stone-200/60 text-xs font-medium text-stone-600">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
          <span>{dateStr}</span>
        </div>

        <Badge variant="warning" size="sm" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Demo Mode
        </Badge>

        <Button
          variant="secondary"
          size="sm"
          onClick={onResetDemo}
          title="Reset to demo data"
          className="!px-2.5 !py-1 text-xs gap-1.5 rounded-lg border-stone-200 text-stone-600 hover:text-stone-900"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </Button>

        <div className="h-4 w-px bg-stone-200 hidden sm:block" />

        <button className="relative p-2 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-forest-700 to-forest-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-forest-500/20 shadow-sm">
            CM
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-stone-800 leading-none">Canteen Ops</p>
            <p className="text-[10px] text-stone-400 leading-tight">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
