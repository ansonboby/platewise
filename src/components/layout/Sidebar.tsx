import { clsx } from 'clsx';
import { LayoutDashboard, ClipboardList, BarChart3, TrendingUp, PackageOpen, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import type { PageId } from '@/types';

const NAV_ITEMS: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'meal-logging', label: 'Meal Logging',  icon: ClipboardList },
  { id: 'analytics',   label: 'Analytics',     icon: BarChart3 },
  { id: 'forecast',    label: 'Forecast',      icon: TrendingUp },
  { id: 'surplus',     label: 'Surplus Rescue', icon: PackageOpen },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'h-screen bg-[#071F15] text-white flex flex-col transition-all duration-300 shrink-0 border-r border-[#0F3827] shadow-[4px_0_24px_rgba(0,0,0,0.15)] relative z-20',
        collapsed ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      {/* Background aura */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3.5 px-4.5 py-5 border-b border-[#0F3827]/70 relative">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-forest-600 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.3)] ring-1 ring-white/20">
          <Leaf className="h-4.5 w-4.5 text-white stroke-[2.2]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-tight text-white">PlateWise</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/50 font-medium tracking-wider uppercase">
              Food Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Facility selector pill */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-1">
          <div className="p-2 rounded-xl bg-[#0B2A1D]/80 border border-[#144732] flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white/90">Main Campus Canteen</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">Active</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-1 px-2.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              className={clsx(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 relative group',
                active
                  ? 'bg-gradient-to-r from-forest-600 to-forest-700 text-white shadow-[0_2px_10px_rgba(16,185,129,0.25)] ring-1 ring-white/15'
                  : 'text-stone-300/80 hover:bg-[#0D3323] hover:text-white',
              )}
            >
              <Icon className={clsx('h-4.5 w-4.5 shrink-0 stroke-[2]', active ? 'text-emerald-200' : 'text-stone-400 group-hover:text-stone-200')} />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#86efac]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Collapse toggle */}
      <div className="p-3 border-t border-[#0F3827]/70 bg-[#061C12]/50">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-stone-400 hover:bg-[#0D3323] hover:text-white text-xs font-medium transition-all"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
